import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormSteps } from "./head-neck-examination/FormSteps";
import { useFormSteps } from "./head-neck-examination/useFormSteps";
import { FormContent } from "./head-neck-examination/FormContent";
import { FormHeader } from "./head-neck-examination/FormHeader";
import { FormFooterNav } from "./head-neck-examination/FormFooterNav";
import { Json } from "@/integrations/supabase/types";

interface HeadNeckExaminationFormProps {
  patientId: string;
  onSuccess?: () => void;
  existingData?: any;
  patientData?: any;
  isReadOnly?: boolean;
  onClose?: () => void;
}

interface MaxillarySinusesEvaluation {
  left: string[];
  right: string[];
}

export const HeadNeckExaminationForm = ({
  patientId,
  onSuccess,
  existingData,
  patientData,
  isReadOnly = false,
  onClose
}: HeadNeckExaminationFormProps) => {
  const { currentStep, handleNext, handlePrevious, totalSteps, setCurrentStep } = useFormSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patient_id: patientId,
    vital_signs: {} as Json,
    medical_history: {} as Json,
    chief_complaints: {} as Json,
    extra_oral_examination: {} as Json,
    intra_oral_examination: {} as Json,
    dental_classification: {} as Json,
    skeletal_presentation: {} as Json,
    functional_presentation: {} as Json,
    clinical_observation: {} as Json,
    tactile_observation: {} as Json,
    radiographic_presentation: {} as Json,
    tomography_data: {} as Json,
    evaluation_notes: JSON.stringify([]),
    maxillary_sinuses_evaluation: {
      left: JSON.stringify([]),
      right: JSON.stringify([])
    },
    airway_evaluation: "",
    guideline_questions: {} as Json,
    status: "draft" as "draft" | "completed"
  });

  useEffect(() => {

    if (existingData) {
      console.log("Loading existing examination data for ID:", existingData.id);
      try {
        setFormData(prevData => ({
          ...prevData,
          ...existingData,
          vital_signs: existingData.vital_signs || {},
          medical_history: existingData.medical_history || {},
          chief_complaints: existingData.chief_complaints || {},
          extra_oral_examination: existingData.extra_oral_examination || {},
          intra_oral_examination: existingData.intra_oral_examination || {},
          dental_classification: existingData.dental_classification || {},
          skeletal_presentation: existingData.skeletal_presentation || {},
          functional_presentation: existingData.functional_presentation || {},
          clinical_observation: existingData.clinical_observation || {},
          tactile_observation: existingData.tactile_observation || {},
          radiographic_presentation: existingData.radiographic_presentation || {},
          tomography_data: existingData.tomography_data || {},
          guideline_questions: existingData.guideline_questions || {},
          patient_id: patientId,
          evaluation_notes: existingData.evaluation_notes || JSON.stringify([]),
          maxillary_sinuses_evaluation: existingData.maxillary_sinuses_evaluation
            ? (() => {
              try {
                const mse = existingData.maxillary_sinuses_evaluation;
                if (typeof mse === 'string') {
                  const parsed = JSON.parse(mse);
                  if (!parsed || typeof parsed !== 'object') {
                    return { left: JSON.stringify([]), right: JSON.stringify([]) };
                  }
                  return {
                    left: typeof parsed.left === 'string' ? parsed.left : JSON.stringify(parsed.left || []),
                    right: typeof parsed.right === 'string' ? parsed.right : JSON.stringify(parsed.right || [])
                  };
                }
                // If it's already an object (from Supabase JSON column)
                if (mse && typeof mse === 'object') {
                  return {
                    left: typeof mse.left === 'string' ? mse.left : JSON.stringify(mse.left || []),
                    right: typeof mse.right === 'string' ? mse.right : JSON.stringify(mse.right || [])
                  };
                }
                return { left: JSON.stringify([]), right: JSON.stringify([]) };
              } catch (e) {
                console.error("Error parsing maxillary sinuses", e);
                return { left: JSON.stringify([]), right: JSON.stringify([]) };
              }
            })()
            : { left: JSON.stringify([]), right: JSON.stringify([]) }
        }));
      } catch (error) {
        console.error("Critical error setting existing form data:", error);
      }
    }
  }, [existingData, patientId]);

  const saveFormData = async (overrides?: { status?: "draft" | "completed" }) => {
    if (isReadOnly) return true;
    try {
      const currentData = {
        ...formData,
        ...overrides
      };

      console.log("Saving form data to database...", {
        ...currentData,
        maxillary_sinuses_evaluation: currentData.maxillary_sinuses_evaluation
      });

      // Prepare data for saving
      // Convert nested objects to JSON for storage if needed, though Supabase handles JSONB
      // The state structure matches the table structure we defined
      const dataToSave = {
        patient_id: currentData.patient_id,
        vital_signs: currentData.vital_signs,
        medical_history: currentData.medical_history,
        chief_complaints: currentData.chief_complaints,
        extra_oral_examination: currentData.extra_oral_examination,
        intra_oral_examination: currentData.intra_oral_examination,
        dental_classification: currentData.dental_classification,
        skeletal_presentation: currentData.skeletal_presentation,
        functional_presentation: currentData.functional_presentation,
        clinical_observation: currentData.clinical_observation,
        tactile_observation: currentData.tactile_observation,
        radiographic_presentation: currentData.radiographic_presentation,
        tomography_data: currentData.tomography_data,
        evaluation_notes: currentData.evaluation_notes,
        maxillary_sinuses_evaluation: currentData.maxillary_sinuses_evaluation,
        airway_evaluation: currentData.airway_evaluation,
        guideline_questions: currentData.guideline_questions,
        status: currentData.status
      };

      // Check if we are updating an existing record (we have an ID)
      // or creating a new one. We check formData.id (which might come from existingData or after first save)

      const formId = (formData as any).id;
      let performUpdate = false;

      if (formId) {
        performUpdate = true;
      }

      let error;
      let newId = formId;

      if (performUpdate) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('head_neck_examinations')
          .update(dataToSave)
          .eq('id', formId);
        error = updateError;
      } else {
        // Insert new record
        const { data: insertedData, error: insertError } = await supabase
          .from('head_neck_examinations')
          .insert(dataToSave)
          .select('id')
          .single();

        if (insertedData) {
          newId = insertedData.id;
          // Update local state with the new ID so subsequent auto-saves update this record
          setFormData(prev => ({ ...prev, id: insertedData.id }));
        }
        error = insertError;
      }

      if (error) throw error;

      // Update local state status if it changed
      if (overrides?.status) {
        setFormData(prev => ({ ...prev, status: overrides.status! }));
      }

      toast({
        title: "Success",
        description: "Examination progress saved successfully.",
      });

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      return true;
    } catch (error) {
      console.error("Error saving form data:", error);
      toast({
        title: "Error",
        description: "Failed to save progress.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    console.log("Form submission triggered");

    if (currentStep !== totalSteps - 1) {
      console.log("Not on final step, preventing submission");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await saveFormData({ status: "completed" });
      if (success && onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isReadOnly) {
      handleNext();
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await saveFormData();
      if (success) {
        handleNext();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePrevious();
  };

  const handleStepChange = async (step: number) => {
    if (isReadOnly) {
      setCurrentStep(step);
      return;
    }

    const success = await saveFormData();
    if (success) {
      setCurrentStep(step);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100">
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        formData={formData}
        onStepChange={handleStepChange}
        completedSteps={completedSteps}
        onClose={onClose}
      />

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <fieldset disabled={isReadOnly} className={`min-w-0 w-full border-0 p-0 m-0 ${isReadOnly ? 'pointer-events-none' : ''}`}>
          <FormContent
            currentStep={currentStep}
            formData={formData}
            setFormData={setFormData}
            patientData={patientData}
          />
        </fieldset>
      </div>

      <FormFooterNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSubmitting={isSubmitting}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
        isReadOnly={isReadOnly}
      />
    </form>
  );
};