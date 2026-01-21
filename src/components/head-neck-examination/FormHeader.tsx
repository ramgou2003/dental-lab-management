import { FormSteps } from "./FormSteps";
import { Json } from "@/integrations/supabase/types";
import { X } from "lucide-react";

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
    status: "draft" | "completed";
  };
  onStepChange: (step: number) => void;
  completedSteps: number[];
  onClose?: () => void;
}

export const FormHeader = ({
  currentStep,
  totalSteps,
  formData,
  onStepChange,
  completedSteps,
  onClose
}: FormHeaderProps) => {
  return (
    <div className="border-b bg-white z-10 sticky top-0">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Head and Neck Examination Form
            </h1>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Comprehensive evaluation form for head and neck examination
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

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