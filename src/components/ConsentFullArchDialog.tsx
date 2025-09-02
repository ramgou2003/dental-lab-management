import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConsentFullArchForm } from "@/components/ConsentFullArchForm";
import { autoSaveConsentFullArchForm, convertDatabaseToFormData } from "@/services/consentFullArchService";

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

  // Update savedFormId when initialData changes
  useEffect(() => {
    if (initialData?.id) {
      console.log('🔄 Updating Consent Full Arch savedFormId from initialData:', initialData.id);
      console.log('🔍 Previous savedFormId:', savedFormId);
      console.log('🔍 New savedFormId:', initialData.id);
      setSavedFormId(initialData.id);
    }
  }, [initialData?.id]);

  const handleAutoSave = async (formData: any) => {
    if (!formData.patientName && !formData.archType && !formData.patientSignature &&
        !formData.midazolam && !formData.fentanyl) {
      return; // Don't auto-save empty forms
    }

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Don't set saving status here - let the form component handle the continuous display
    try {
      const { data, error } = await autoSaveConsentFullArchForm(
        formData,
        patientId,
        leadId,
        newPatientPacketId,
        savedFormId
      );

      if (error) {
        console.error('Auto-save error:', error);
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
        setSavedFormId(data.id);
        console.log('🔄 Updated savedFormId to:', data.id);
      }

      // Mark changes as saved
      setHasUnsavedChanges(false);

      // Don't change status on successful save - let the continuous indicator remain

    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setAutoSaveMessage('Connection error - unable to save');
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage('');
      }, 5000);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('🚀 Form submission started with data:', formData);

      // Set status to submitted when form is submitted
      const submissionData = {
        ...formData,
        status: 'submitted'
      };

      console.log('📝 Submission data with status:', submissionData);
      console.log('🔍 savedFormId at submission:', savedFormId);
      console.log('🔍 isEditing at submission:', isEditing);

      // Always try to use the savedFormId first, but if it's not available,
      // the autoSaveConsentFullArchForm function will find the existing draft
      const { data, error } = await autoSaveConsentFullArchForm(
        submissionData,
        patientId,
        leadId,
        newPatientPacketId,
        savedFormId // This will be used if available, otherwise the function will find the existing draft
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
    console.log('🔍 ConsentFullArchDialog - initialData:', initialData);
    console.log('🔍 ConsentFullArchDialog - isEditing:', isEditing);
    console.log('🔍 ConsentFullArchDialog - isViewing:', isViewing);
    console.log('🔍 ConsentFullArchDialog - savedFormId:', savedFormId);

    if (initialData) {
      console.log('📋 ConsentFullArchDialog - initialData fields:', {
        id: initialData.id,
        patientName: initialData.patientName,
        archType: initialData.archType,
        patientSignature: initialData.patientSignature
      });
      console.log('📋 ConsentFullArchDialog - ALL initialData keys:', Object.keys(initialData));

      // Check if data needs conversion from database format
      if (initialData.patient_name && !initialData.patientName) {
        console.log('🔄 Converting database format to form format');
        const converted = convertDatabaseToFormData(initialData);
        console.log('✅ Converted data:', converted);
        setConvertedInitialData(converted);
        setSavedFormId(converted.id);
      } else {
        console.log('✅ Data already in form format');
        setConvertedInitialData(initialData);
        setSavedFormId(initialData.id);
      }
    } else {
      setConvertedInitialData(null);
      setSavedFormId(undefined);
    }
  }, [initialData, isEditing, isViewing, savedFormId]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAutoSaveStatus('idle');
      setAutoSaveMessage('');
      setLastSavedTime('');
      setSavedFormId(initialData?.id);
      setHasUnsavedChanges(false);
      console.log('🔄 Dialog opened - initialData:', initialData);
    }
  }, [isOpen, initialData?.id]);

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
