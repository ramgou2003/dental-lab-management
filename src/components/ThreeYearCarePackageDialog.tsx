import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThreeYearCarePackageForm } from "@/components/ThreeYearCarePackageForm";
import { autoSaveThreeYearCarePackageForm } from "@/services/threeYearCarePackageService";

interface ThreeYearCarePackageDialogProps {
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
  isViewing?: boolean;
}

export function ThreeYearCarePackageDialog({
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
  isViewing = false,
}: ThreeYearCarePackageDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | undefined>(initialData?.id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update savedFormId when initialData changes
  useEffect(() => {
    if (initialData?.id) {
      console.log('🔄 Updating 3-Year Care Package savedFormId from initialData:', initialData.id);
      console.log('🔍 Previous savedFormId:', savedFormId);
      console.log('🔍 New savedFormId:', initialData.id);
      setSavedFormId(initialData.id);
    }
  }, [initialData?.id]);

  const handleAutoSave = async (formData: any) => {
    // Don't auto-save if we're in the middle of submitting
    if (isSubmitting) {
      console.log('🚫 Skipping auto-save during form submission');
      return;
    }

    if (!formData.patientName && !formData.enrollmentChoice &&
        !formData.paymentMethod && !formData.chlorhexidineRinse &&
        !formData.waterFlosser && !formData.electricToothbrush &&
        !formData.attendCheckups && !formData.cancellationPolicy &&
        !formData.governingLaw && !formData.arbitrationClause &&
        !formData.hipaaConsent && !formData.patientSignature &&
        !formData.witnessSignature) {
      return; // Don't auto-save empty forms
    }

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Don't set saving status here - let the form component handle the continuous display
    try {
      const { data, error } = await autoSaveThreeYearCarePackageForm(
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

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true); // Prevent auto-save during submission
      console.log('🚀 3-Year Care Package form submission started');
      console.log('📝 Form data received:', JSON.stringify(formData, null, 2));
      console.log('🔍 patientId:', patientId);
      console.log('🔍 leadId:', leadId);
      console.log('🔍 newPatientPacketId:', newPatientPacketId);
      console.log('🔍 savedFormId at submission:', savedFormId);
      console.log('🔍 isEditing at submission:', isEditing);

      // Validate form data before submission
      if (!formData.patientName) {
        console.error('❌ ERROR: No patient name in form data!');
        throw new Error('Patient name is required');
      }

      // Update status to submitted when submitting
      const submissionData = {
        ...formData,
        status: 'submitted'
      };

      console.log('📝 Submission data with status:', JSON.stringify(submissionData, null, 2));

      // If we don't have a savedFormId, try to auto-save first to get one
      if (!savedFormId) {
        console.log('⚠️ No savedFormId found, attempting auto-save first...');
        const autoSaveResult = await autoSaveThreeYearCarePackageForm(
          formData, // Use original formData for auto-save, not submissionData
          patientId,
          leadId,
          newPatientPacketId
        );

        if (autoSaveResult.data?.id) {
          setSavedFormId(autoSaveResult.data.id);
          console.log('✅ Got savedFormId from auto-save:', autoSaveResult.data.id);

          // Now update with submitted status
          const { data, error } = await autoSaveThreeYearCarePackageForm(
            submissionData,
            patientId,
            leadId,
            newPatientPacketId,
            autoSaveResult.data.id
          );

          if (error) {
            console.error('❌ Error updating form to submitted status:', error);
            throw error;
          }

          console.log('✅ Successfully updated form to submitted:', data);
          onSubmit(data);
          return;
        }
      }

      if (savedFormId) {
        console.log('✅ UPDATING existing 3-Year Care Package form with ID:', savedFormId);
        console.log('📝 Calling autoSaveThreeYearCarePackageForm with existingId:', savedFormId);

        // Update existing form with submitted status
        const { data, error } = await autoSaveThreeYearCarePackageForm(
          submissionData,
          patientId,
          leadId,
          newPatientPacketId,
          savedFormId
        );

        if (error) {
          console.error('❌ Error updating 3-Year Care Package form:', error);
          throw error;
        }

        console.log('✅ Successfully updated form:', data);
        onSubmit(data);
      } else {
        console.log('🆕 CREATING new 3-Year Care Package form (no savedFormId)');
        console.log('⚠️ WARNING: This should not happen if auto-save is working correctly');

        // Create new form with submitted status
        const { data, error } = await autoSaveThreeYearCarePackageForm(
          submissionData,
          patientId,
          leadId,
          newPatientPacketId
        );

        if (error) {
          console.error('❌ Error creating 3-Year Care Package form:', error);
          throw error;
        }

        console.log('✅ Successfully created form:', data);
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error submitting 3-Year Care Package form:', error);
      throw error;
    } finally {
      setIsSubmitting(false); // Re-enable auto-save
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
    console.log('🔍 ThreeYearCarePackageDialog - initialData:', initialData);
    console.log('🔍 ThreeYearCarePackageDialog - isEditing:', isEditing);
    console.log('🔍 ThreeYearCarePackageDialog - isViewing:', isViewing);
    console.log('🔍 ThreeYearCarePackageDialog - savedFormId:', savedFormId);
  }, [initialData, isEditing, isViewing, savedFormId]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAutoSaveStatus('idle');
      setAutoSaveMessage('');
      setLastSavedTime('');
      setSavedFormId(initialData?.id);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, initialData?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <ThreeYearCarePackageForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          patientName={patientName}
          patientDateOfBirth={patientDateOfBirth}
          initialData={initialData}
          isEditing={isEditing}
          isViewing={isViewing}
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
