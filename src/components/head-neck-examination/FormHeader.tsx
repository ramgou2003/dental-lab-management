import { FormSteps } from "./FormSteps";
import { Json } from "@/integrations/supabase/types";

interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  formData: {
    patient_id: string;
    vital_signs: Json;
    medical_history: Json;
    chief_complaints: Json;
    extra_oral_examination: Json;
    intra_oral_examination: Json;
    dental_classification: Json;
    skeletal_presentation: Json;
    functional_presentation: Json;
    clinical_observation: Json;
    tactile_observation: Json;
    radiographic_presentation: Json;
    tomography_data: Json;
    evaluation_notes: string;
    maxillary_sinuses_evaluation: {
      left: string;
      right: string;
    };
    airway_evaluation: string;
    guideline_questions: Json;
    status: "draft";
  };
  onStepChange: (step: number) => void;
  completedSteps: number[];
}

export const FormHeader = ({
  currentStep,
  totalSteps,
  formData,
  onStepChange,
  completedSteps
}: FormHeaderProps) => {
  return (
    <div className="border-b bg-white z-10 sticky top-0">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Head and Neck Examination Form
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Comprehensive evaluation form for head and neck examination
        </p>

        <FormSteps
          currentStep={currentStep}
          totalSteps={totalSteps}
          formData={formData}
          onStepChange={onStepChange}
          completedSteps={completedSteps}
        />
      </div>
    </div>
  );
};