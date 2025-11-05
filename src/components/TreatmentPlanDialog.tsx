import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TreatmentPlanForm } from "@/components/TreatmentPlanForm";
import { saveTreatmentPlanForm, updateTreatmentPlanForm, autoSaveTreatmentPlanForm } from "@/services/treatmentPlanFormService";

interface TreatmentPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  isViewing?: boolean;
  onSubmit: (formData: any) => void;
  userId?: string;
  formId?: string;
}

export function TreatmentPlanDialog({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientDateOfBirth,
  initialData,
  isEditing = false,
  isViewing = false,
  onSubmit,
  userId,
  formId
}: TreatmentPlanDialogProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [currentFormId, setCurrentFormId] = useState<string | null>(formId || null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update currentFormId when formId prop changes (for editing)
  useEffect(() => {
    setCurrentFormId(formId || null);
  }, [formId]);

  const handleFormSubmit = (formData: any) => {
    onSubmit(formData);
  };

  const handleCancel = () => {
    onClose();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleAutoSave = async (formData: any) => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set a new timeout for auto-save (debounce)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        setAutoSaveMessage('Saving...');

        // Prepare data for saving
        const treatmentPlanData = {
          patient_id: patientId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth,
          treatments: formData.treatments,
          plan_date: formData.planDate,
          form_status: 'draft' as const
        };

        let result;
        if (currentFormId) {
          // Update existing form
          result = await autoSaveTreatmentPlanForm(currentFormId, treatmentPlanData);
        } else {
          // Create new form
          result = await saveTreatmentPlanForm(treatmentPlanData, userId);
          if (result.data) {
            setCurrentFormId(result.data.id);
          }
        }

        if (result.error) {
          console.error('Auto-save error:', result.error);
          setAutoSaveStatus('error');
          setAutoSaveMessage('Error saving');
        } else {
          setAutoSaveStatus('saved');
          setAutoSaveMessage('Saved');
          const now = new Date();
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

          // Reset to idle after 3 seconds
          setTimeout(() => {
            setAutoSaveStatus('idle');
            setAutoSaveMessage('');
          }, 3000);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
        setAutoSaveMessage('Error saving');
      }
    }, 2000); // 2 second debounce
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[95vh] overflow-hidden flex flex-col p-0">
        <TreatmentPlanForm
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
