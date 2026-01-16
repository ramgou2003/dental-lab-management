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
}

interface MaxillarySinusesEvaluation {
  left: string[];
  right: string[];
}

export const HeadNeckExaminationForm = ({ 
  patientId, 
  onSuccess,
  existingData 
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
      console.log("Loading existing examination data:", existingData);
      setFormData(prevData => ({
        ...prevData,
        ...existingData,
        patient_id: patientId,
        evaluation_notes: existingData.evaluation_notes || JSON.stringify([]),
        maxillary_sinuses_evaluation: existingData.maxillary_sinuses_evaluation 
          ? typeof existingData.maxillary_sinuses_evaluation === 'string'
            ? JSON.parse(existingData.maxillary_sinuses_evaluation)
            : {
                left: existingData.maxillary_sinuses_evaluation.left || JSON.stringify([]),
                right: existingData.maxillary_sinuses_evaluation.right || JSON.stringify([])
              }
          : { left: JSON.stringify([]), right: JSON.stringify([]) }
      }));
    }
  }, [existingData, patientId]);

  const saveFormData = async () => {
    console.log("Saving form data...");
    try {
      const { data: existingExam, error: fetchError } = await supabase
        .from('head_neck_examinations')
        .select('id')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Prepare the data for saving
      const dataToSave = {
        ...formData,
        maxillary_sinuses_evaluation: JSON.stringify(formData.maxillary_sinuses_evaluation)
      };

      let result;
      
      if (existingExam) {
        console.log("Updating existing examination:", existingExam.id);
        result = await supabase
          .from('head_neck_examinations')
          .update(dataToSave)
          .eq('id', existingExam.id)
          .select()
          .single();
      } else {
        console.log("Creating new examination");
        result = await supabase
          .from('head_neck_examinations')
          .insert([dataToSave])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Progress saved successfully.",
      });

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      return true;
    } catch (error) {
      console.error("Error saving form data:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
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
      <FormHeader />
      
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <FormSteps 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          formData={formData}
          onStepChange={handleStepChange}
          completedSteps={completedSteps}
        />
        
        <FormContent 
          currentStep={currentStep} 
          formData={formData}
          setFormData={setFormData}
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