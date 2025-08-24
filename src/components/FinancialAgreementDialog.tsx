import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FinancialAgreementForm } from "@/components/FinancialAgreementForm";
import { autoSaveFinancialAgreement } from "@/services/financialAgreementService";
import { toast } from 'sonner';

interface FinancialAgreementDialogProps {
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
}

export function FinancialAgreementDialog({
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
}: FinancialAgreementDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | undefined>(initialData?.id);

  const handleAutoSave = async (formData: any) => {
    if (!formData.patientName && !formData.acceptedTreatments?.length && !formData.totalCostOfTreatment) {
      return; // Don't auto-save empty forms
    }

    // Don't set saving status here - let the form component handle the continuous display
    try {
      const { data, error } = await autoSaveFinancialAgreement(
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

      // Update the saved form ID for future auto-saves
      if (data?.id && !savedFormId) {
        setSavedFormId(data.id);
      }

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

  const handleSubmit = (formData: any) => {
    // Update status to completed when submitting
    const submissionData = {
      ...formData,
      status: 'completed'
    };
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <FinancialAgreementForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={initialData}
          isEditing={isEditing}
          onAutoSave={handleAutoSave}
          autoSaveStatus={autoSaveStatus}
          autoSaveMessage={autoSaveMessage}
          lastSavedTime={lastSavedTime}
        />
      </DialogContent>
    </Dialog>
  );
}
