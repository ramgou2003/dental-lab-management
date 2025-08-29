import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThankYouPreSurgeryForm } from "@/components/ThankYouPreSurgeryForm";
import { autoSaveThankYouPreSurgeryForm } from "@/services/thankYouPreSurgeryService";

interface ThankYouPreSurgeryDialogProps {
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

export function ThankYouPreSurgeryDialog({
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
}: ThankYouPreSurgeryDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | undefined>(initialData?.id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update savedFormId when initialData changes
  useEffect(() => {
    if (initialData?.id) {
      console.log('🔄 Updating Thank You Pre-Surgery savedFormId from initialData:', initialData.id);
      console.log('🔍 Previous savedFormId:', savedFormId);
      console.log('🔍 New savedFormId:', initialData.id);
      setSavedFormId(initialData.id);
    }
  }, [initialData?.id]);

  const handleAutoSave = async (formData: any) => {
    if (!formData.patientName && !formData.treatmentType && !formData.patientSignature &&
        !formData.readInstructions && !formData.understandMedications) {
      return; // Don't auto-save empty forms
    }

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Don't set saving status here - let the form component handle the continuous display
    try {
      const { data, error } = await autoSaveThankYouPreSurgeryForm(
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

      // Set status to completed when form is submitted
      const submissionData = {
        ...formData,
        status: 'completed'
      };

      console.log('📝 Submission data with status:', submissionData);
      console.log('🔍 savedFormId at submission:', savedFormId);
      console.log('🔍 isEditing at submission:', isEditing);

      if (savedFormId) {
        console.log('✅ Updating existing form with ID:', savedFormId);
        // Update existing form with submitted status
        const { data, error } = await autoSaveThankYouPreSurgeryForm(
          submissionData,
          patientId,
          leadId,
          newPatientPacketId,
          savedFormId
        );

        if (error) {
          console.error('Error submitting form:', error);
          throw error;
        }

        onSubmit(data);
      } else {
        console.log('🆕 Creating new form (no savedFormId)');
        // Create new form with submitted status
        const { data, error } = await autoSaveThankYouPreSurgeryForm(
          submissionData,
          patientId,
          leadId,
          newPatientPacketId
        );

        if (error) {
          console.error('Error submitting form:', error);
          throw error;
        }

        onSubmit(data);
      }
    } catch (error) {
      console.error('Error submitting Thank You Pre-Surgery form:', error);
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

  // Debug logging
  useEffect(() => {
    console.log('🔍 ThankYouPreSurgeryDialog - initialData:', initialData);
    console.log('🔍 ThankYouPreSurgeryDialog - isEditing:', isEditing);
    console.log('🔍 ThankYouPreSurgeryDialog - isViewing:', isViewing);
    console.log('🔍 ThankYouPreSurgeryDialog - savedFormId:', savedFormId);
    if (initialData) {
      console.log('📋 ThankYouPreSurgeryDialog - initialData fields:', {
        id: initialData.id,
        patientName: initialData.patientName,
        treatmentType: initialData.treatmentType,
        patientSignature: initialData.patientSignature
      });
      console.log('📋 ThankYouPreSurgeryDialog - ALL initialData keys:', Object.keys(initialData));
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
        <ThankYouPreSurgeryForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={initialData}
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
