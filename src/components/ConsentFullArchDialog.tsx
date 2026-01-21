import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConsentFullArchForm } from "@/components/ConsentFullArchForm";
import { autoSaveConsentFullArchForm, convertDatabaseToFormData } from "@/services/consentFullArchService";
import { supabase } from "@/integrations/supabase/client";

interface ConsentFullArchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  leadId?: string;
  newPatientPacketId?: string;
  patientName: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  isViewing?: boolean;
  onSubmit: (formData: any) => void;
}

export function ConsentFullArchDialog({
  isOpen,
  onClose,
  patientId,
  leadId,
  newPatientPacketId,
  patientName,
  patientDateOfBirth,
  initialData,
  isEditing = false,
  isViewing = false,
  onSubmit
}: ConsentFullArchDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [patientChartNumber, setPatientChartNumber] = useState<string>('');

  // Refs for auto-save queue handling to prevent duplicates
  const isSavingRef = useRef(false);
  const pendingSaveDataRef = useRef<any>(null);
  const savedFormIdRef = useRef<string | undefined>(undefined);

  // Keep savedFormIdRef in sync with state
  useEffect(() => {
    savedFormIdRef.current = savedFormId;
  }, [savedFormId]);

  // Fetch patient chart number when dialog opens
  useEffect(() => {
    const fetchPatientChartNumber = async () => {
      if (!isOpen || !patientId) return;

      try {
        console.log('📋 Fetching patient chart number for:', patientId);
        const { data, error } = await supabase
          .from('patients')
          .select('chart_number')
          .eq('id', patientId)
          .single();

        if (error) {
          console.error('❌ Error fetching patient chart number:', error);
          return;
        }

        if (data && (data as any).chart_number) {
          console.log('✅ Found patient chart number:', (data as any).chart_number);
          setPatientChartNumber((data as any).chart_number);
        } else {
          console.log('📋 No chart number found for patient');
          setPatientChartNumber('');
        }
      } catch (error) {
        console.error('💥 Unexpected error fetching patient chart number:', error);
      }
    };

    fetchPatientChartNumber();
  }, [isOpen, patientId]);

  // Sync savedFormId when initialData changes (only if we don't have a saved ID yet or if changing records)
  useEffect(() => {
    if (initialData?.id && !savedFormIdRef.current) {
      console.log('🔄 Syncing savedFormId from initialData:', initialData.id);
      setSavedFormId(initialData.id);
    }
  }, [initialData?.id]);

  const performAutoSave = async (formData: any) => {
    try {
      // Use the ref to get the absolute latest ID, even if state update is pending
      const currentSavedId = savedFormIdRef.current || formData.id || undefined;

      console.log('💾 [AutoSave] Performing auto-save', {
        currentSavedId,
        refId: savedFormIdRef.current,
        formId: formData.id
      });

      const { data, error } = await autoSaveConsentFullArchForm(
        formData,
        patientId,
        leadId,
        newPatientPacketId,
        currentSavedId
      );

      if (error) {
        console.error('❌ [AutoSave] Error:', error);
        setAutoSaveStatus('error');
        setAutoSaveMessage('Connection error - unable to save');
        setTimeout(() => {
          setAutoSaveStatus('idle');
          setAutoSaveMessage('');
        }, 5000);
        return;
      }

      // Always update the saved form ID for future auto-saves
      if (data?.id) {
        // Important: Check if we just received a DIFFERENT ID than we expected
        if (currentSavedId && data.id !== currentSavedId) {
          console.warn('⚠️ [AutoSave] ID mismatch! Expected:', currentSavedId, 'Got:', data.id);
        }

        setSavedFormId(data.id);
        // Important: Update ref immediately for any pending operations in the queue
        savedFormIdRef.current = data.id;
        console.log('✅ [AutoSave] Success. Updated savedFormId to:', data.id);
      } else {
        console.warn('⚠️ [AutoSave] Success but NO ID returned! This leads to duplicates.');
      }

      // Mark changes as saved
      setHasUnsavedChanges(false);

      // Update last saved time
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    } catch (error) {
      console.error('❌ [AutoSave] Unexpected error:', error);
      setAutoSaveStatus('error');
      setAutoSaveMessage('Connection error - unable to save');
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage('');
      }, 5000);
    }
  };

  const processSaveQueue = async () => {
    if (isSavingRef.current) return;

    // Check if there's data waiting to be saved
    if (pendingSaveDataRef.current) {
      isSavingRef.current = true;
      const dataToSave = pendingSaveDataRef.current;
      pendingSaveDataRef.current = null; // Clear pending

      await performAutoSave(dataToSave);

      isSavingRef.current = false;

      // key: Check again if more data came in while we were saving
      if (pendingSaveDataRef.current) {
        processSaveQueue();
      }
    }
  };

  const handleAutoSave = async (formData: any) => {
    if (!formData.patientName && !formData.archType && !formData.patientSignature &&
      !formData.midazolam && !formData.fentanyl && !formData.consentTime &&
      !formData.patientInfoInitials) {
      return; // Don't auto-save empty forms
    }

    // Always update pending data with the latest
    pendingSaveDataRef.current = formData;
    setHasUnsavedChanges(true);

    // Trigger queue processing
    processSaveQueue();
  };


  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('🚀 Form submission started with data:', formData);

      // Set status to completed when form is submitted
      const submissionData = {
        ...formData,
        status: 'completed'
      };

      console.log('📝 Submission data with status:', submissionData);

      // Use ref for safest ID check
      const currentSavedId = savedFormIdRef.current;
      console.log('🔍 savedFormId at submission:', currentSavedId);

      // Always try to use the savedFormId first, but if it's not available,
      // the autoSaveConsentFullArchForm function will find the existing draft
      const { data, error } = await autoSaveConsentFullArchForm(
        submissionData,
        patientId,
        leadId,
        newPatientPacketId,
        currentSavedId
      );

      if (error) {
        console.error('Error submitting form:', error);
        throw error;
      }

      console.log('✅ Form submitted successfully:', data);
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting Consent Full Arch form:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    // Reset auto-save state when closing
    setAutoSaveStatus('idle');
    setAutoSaveMessage('');
    setLastSavedTime('');
    setHasUnsavedChanges(false);
    onClose();
  };

  // Debug logging and data conversion
  const [convertedInitialData, setConvertedInitialData] = useState(null);

  useEffect(() => {
    if (initialData) {
      // Check if data needs conversion from database format
      if (initialData.patient_name && !initialData.patientName) {
        const converted = convertDatabaseToFormData(initialData);
        // Add patient chart number if available and not already set
        if (patientChartNumber && !converted.chartNumber) {
          converted.chartNumber = patientChartNumber;
        }
        setConvertedInitialData(converted);
      } else {
        // Add patient chart number if available and not already set
        const dataWithChartNumber = { ...initialData };
        if (patientChartNumber && !dataWithChartNumber.chartNumber) {
          dataWithChartNumber.chartNumber = patientChartNumber;
        }
        setConvertedInitialData(dataWithChartNumber);
      }
    } else {
      // No initial data, but we might have a patient chart number
      if (patientChartNumber) {
        setConvertedInitialData({ chartNumber: patientChartNumber });
      } else {
        setConvertedInitialData(null);
      }
    }
  }, [initialData, patientChartNumber]);

  // Reset state ONLY when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAutoSaveStatus('idle');
      setAutoSaveMessage('');
      setLastSavedTime('');
      setHasUnsavedChanges(false);

      // Establish initial saved ID
      const initialId = initialData?.id || undefined;
      setSavedFormId(initialId);
      savedFormIdRef.current = initialId;

      console.log('🔄 Dialog opened - established savedFormId:', initialId);
    } else {
      // Clear savedFormId when dialog closes
      setSavedFormId(undefined);
      savedFormIdRef.current = undefined;
    }
    // Note: We deliberately DON'T depend on initialData here to prevent resetting during auto-save
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <ConsentFullArchForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={convertedInitialData}
          isEditing={isEditing}
          readOnly={isViewing}
          onAutoSave={handleAutoSave}
          autoSaveStatus={autoSaveStatus}
          autoSaveMessage={autoSaveMessage}
          lastSavedTime={lastSavedTime}
          setAutoSaveStatus={setAutoSaveStatus}
          setAutoSaveMessage={setAutoSaveMessage}
        />
      </DialogContent>
    </Dialog>
  );
}
