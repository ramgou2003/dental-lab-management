import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FiveYearWarrantyForm } from "@/components/FiveYearWarrantyForm";
import { autoSaveFiveYearWarrantyForm } from "@/services/fiveYearWarrantyService";

interface FiveYearWarrantyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  leadId?: string;
  newPatientPacketId?: string;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  isViewing?: boolean;
  onSubmit: (formData: any) => void;
}

export function FiveYearWarrantyDialog({
  isOpen,
  onClose,
  patientId,
  leadId,
  newPatientPacketId,
  patientName = "",
  patientDateOfBirth = "",
  initialData = null,
  isEditing = false,
  isViewing = false,
  onSubmit
}: FiveYearWarrantyDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | null>(initialData?.id || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update savedFormId when initialData changes
  useEffect(() => {
    if (initialData?.id && initialData.id !== savedFormId) {
      console.log('🔄 Updating savedFormId from initialData:', initialData.id);
      setSavedFormId(initialData.id);
    }
  }, [initialData?.id, savedFormId]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 FiveYearWarrantyDialog - initialData:', initialData);
    console.log('🔍 FiveYearWarrantyDialog - isEditing:', isEditing);
    console.log('🔍 FiveYearWarrantyDialog - isViewing:', isViewing);
    console.log('🔍 FiveYearWarrantyDialog - savedFormId:', savedFormId);
  }, [initialData, isEditing, isViewing, savedFormId]);

  const handleAutoSave = async (formData: any) => {
    if (!formData.firstName && !formData.lastName && !formData.dateOfBirth &&
        !formData.phone && !formData.email && !formData.understandOptionalPlan &&
        !formData.understandMonthlyCost && !formData.understandCoverageDetails &&
        !formData.understandPaymentProcess && !formData.questionsAnswered &&
        !formData.voluntarilyEnrolling && !formData.coverageBeginsAfterPayment &&
        !formData.authorizePayment && !formData.patientSignature) {
      return; // Don't auto-save empty forms
    }

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Don't set saving status here - let the form component handle the continuous display
    try {
      const { data, error } = await autoSaveFiveYearWarrantyForm(
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
        const { data, error } = await autoSaveFiveYearWarrantyForm(
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
        const { data, error } = await autoSaveFiveYearWarrantyForm(
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
      console.error('Error submitting 5-Year Warranty form:', error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <FiveYearWarrantyForm
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={initialData}
          isEditing={isEditing}
          readOnly={isViewing}
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          onAutoSave={handleAutoSave}
          autoSaveStatus={autoSaveStatus}
          autoSaveMessage={autoSaveMessage}
          setAutoSaveStatus={setAutoSaveStatus}
          setAutoSaveMessage={setAutoSaveMessage}
        />
      </DialogContent>
    </Dialog>
  );
}
