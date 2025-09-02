import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InformedConsentSmokingForm } from "@/components/InformedConsentSmokingForm";
import { autoSaveInformedConsentSmokingForm } from "@/services/informedConsentSmokingService";

interface InformedConsentSmokingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  patientName?: string;
  patientDateOfBirth?: string;
  patientId?: string;
  leadId?: string;
  newPatientPacketId?: string;
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
}

export function InformedConsentSmokingDialog({
  isOpen,
  onClose,
  onSubmit,
  patientName = "",
  patientDateOfBirth = "",
  patientId,
  leadId,
  newPatientPacketId,
  initialData,
  isEditing = false,
  readOnly = false,
}: InformedConsentSmokingDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | undefined>(initialData?.id);

  const handleAutoSave = async (formData: any) => {
    if (!formData.firstName && !formData.lastName && !formData.nicotineUse &&
        !formData.understandsNicotineEffects && !formData.understandsRisks &&
        !formData.understandsTimeline && !formData.understandsInsurance &&
        !formData.offeredResources && !formData.takesResponsibility &&
        !formData.patientSignature) {
      return; // Don't auto-save empty forms
    }

    // Prevent multiple simultaneous auto-saves
    if (autoSaveStatus === 'saving') {
      console.log('⏸️ Auto-save already in progress, skipping...');
      return;
    }

    console.log('🚀 Starting auto-save for informed consent smoking form:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      hasSignature: !!formData.patientSignature,
      savedFormId
    });

    setAutoSaveStatus('saving');
    setAutoSaveMessage('');

    try {
      const { data, error } = await autoSaveInformedConsentSmokingForm(
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

      // Update the saved form ID for future auto-saves (only if we don't already have one)
      if (data?.id && !savedFormId) {
        setSavedFormId(data.id);
        console.log('🆔 New form created, savedFormId set to:', data.id);
      } else if (savedFormId) {
        console.log('🔄 Updated existing form with ID:', savedFormId);
      }

      // Show saved status briefly, then return to idle
      setAutoSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);

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

  const handleSubmit = (formData: any) => {
    // Update status to completed when submitting and include form ID if it exists
    const submissionData = {
      ...formData,
      status: 'completed',
      id: savedFormId || initialData?.id // Include the form ID for updating
    };
    console.log('🚀 Submitting informed consent smoking form with ID:', submissionData.id);
    onSubmit(submissionData);
  };

  const handleCancel = () => {
    // Reset auto-save state when closing
    setAutoSaveStatus('idle');
    setAutoSaveMessage('');
    setLastSavedTime('');
    onClose();
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAutoSaveStatus('idle');
      setAutoSaveMessage('');
      setLastSavedTime('');
      setSavedFormId(initialData?.id);
    }
  }, [isOpen, initialData?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <InformedConsentSmokingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={initialData}
          isEditing={isEditing}
          readOnly={readOnly}
          onAutoSave={readOnly ? undefined : handleAutoSave}
          autoSaveStatus={readOnly ? 'idle' : autoSaveStatus}
          autoSaveMessage={readOnly ? '' : autoSaveMessage}
          lastSavedTime={readOnly ? '' : lastSavedTime}
        />
      </DialogContent>
    </Dialog>
  );
}
