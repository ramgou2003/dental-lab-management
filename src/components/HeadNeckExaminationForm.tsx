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
}

interface MaxillarySinusesEvaluation {
  left: string[];
  right: string[];
}

export const HeadNeckExaminationForm = ({
  patientId,
  onSuccess,
  existingData,
  patientData
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
    status: "draft" as const
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

  const saveFormData = async () => {
    try {
      console.log("Saving form data to database...", {
        ...formData,
        maxillary_sinuses_evaluation: formData.maxillary_sinuses_evaluation
      });

      // Prepare data for saving
      // Convert nested objects to JSON for storage if needed, though Supabase handles JSONB
      // The state structure matches the table structure we defined
      const dataToSave = {
        patient_id: formData.patient_id,
        vital_signs: formData.vital_signs,
        medical_history: formData.medical_history,
        chief_complaints: formData.chief_complaints,
        extra_oral_examination: formData.extra_oral_examination,
        intra_oral_examination: formData.intra_oral_examination,
        dental_classification: formData.dental_classification,
        skeletal_presentation: formData.skeletal_presentation,
        functional_presentation: formData.functional_presentation,
        clinical_observation: formData.clinical_observation,
        tactile_observation: formData.tactile_observation,
        radiographic_presentation: formData.radiographic_presentation,
        tomography_data: formData.tomography_data,
        evaluation_notes: formData.evaluation_notes,
        maxillary_sinuses_evaluation: formData.maxillary_sinuses_evaluation,
        airway_evaluation: formData.airway_evaluation,
        guideline_questions: formData.guideline_questions,
        status: formData.status
      };

      // Check if we already have a record for this patient
      // For now, we'll assume one record per patient for simplicity, or we check if we have an ID
      // If `existingData` had an ID, we should probably use it.
      // But let's check based on patient_id first to see if a draft exists

      const { data: existingRecord } = await supabase
        .from('head_neck_examinations')
        .select('id')
        .eq('patient_id', patientId)
        .maybeSingle();

      let error;

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('head_neck_examinations')
          .update(dataToSave)
          .eq('id', existingRecord.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('head_neck_examinations')
          .insert(dataToSave);
        error = insertError;
      }

      if (error) throw error;

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
    console.log("Form submission triggered");

    if (currentStep !== totalSteps - 1) {
      console.log("Not on final step, preventing submission");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await saveFormData();
      if (success && onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      />

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">

        <FormContent
          currentStep={currentStep}
          formData={formData}
          setFormData={setFormData}
          patientData={patientData}
        />
      </div>

      <FormFooterNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSubmitting={isSubmitting}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
      />
    </form>
  );
};