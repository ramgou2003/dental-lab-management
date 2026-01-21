import { ProgressBar } from "../ProgressBar";

interface FormStepsProps {
  currentStep: number;
  totalSteps: number;
  formData: any;
  onStepChange?: (step: number) => void;
  completedSteps?: number[];
}

export const FormSteps = ({
  currentStep,
  formData,
  onStepChange,
  completedSteps = []
}: FormStepsProps) => {
  // Helper function to determine if an object has any filled fields
  const hasFilledFields = (obj: any): boolean => {
    if (!obj) return false;
    return Object.keys(obj).some(key => {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object') {
        return hasFilledFields(value);
      }
      return value !== null && value !== undefined && value !== '';
    });
  };

  // Helper function to check if evaluation step is complete
  const isEvaluationComplete = (): boolean => {
    const evaluationData = {
      evaluation_notes: formData?.evaluation_notes,
      maxillary_sinuses_evaluation: formData?.maxillary_sinuses_evaluation,
      airway_evaluation: formData?.airway_evaluation,
      airway_image_url: formData?.airway_image_url
    };



    // Check each field individually
    const hasValidData = Object.entries(evaluationData).some(([key, value]) => {
      if (!value) return false;

      if (key === 'maxillary_sinuses_evaluation') {
        const checkSide = (sideData: any) => {
          if (!sideData) return false;
          if (Array.isArray(sideData)) return sideData.length > 0;
          if (typeof sideData === 'string') {
            try {
              const parsed = JSON.parse(sideData);
              return Array.isArray(parsed) && parsed.length > 0;
            } catch {
              return false;
            }
          }
          return false;
        };

        if (typeof value === 'object' && value !== null) {
          const parsed = value as any;
          return checkSide(parsed.left) || checkSide(parsed.right);
        }
        try {
          const parsed = JSON.parse(value as string);
          return parsed &&
            typeof parsed === 'object' &&
            (checkSide(parsed.left) || checkSide(parsed.right));
        } catch {
          return false;
        }
      }

      if (typeof value === 'string') {
        // For evaluation_notes and airway_evaluation, check if they're valid JSON arrays with content
        if (key === 'evaluation_notes' || key === 'airway_evaluation') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) && parsed.length > 0;
          } catch {
            return value.trim() !== '';
          }
        }

        // For airway_image_url, just check if it's a non-empty string
        if (key === 'airway_image_url') {
          return value.trim() !== '';
        }
      }

      return false;
    });


    return hasValidData;
  };

  // Helper function to determine step status
  const getStepStatus = (stepIndex: number): "completed" | "current" | "upcoming" => {


    // First check if the step is marked as completed
    if (completedSteps.includes(stepIndex)) {

      return "completed";
    }

    // Then check if it's the current step
    if (currentStep === stepIndex) {

      return "current";
    }

    // Special handling for evaluation step (index 8)
    if (stepIndex === 8) {
      return isEvaluationComplete() ? "completed" : "upcoming";
    }

    // Check if the step has data filled
    const stepData = getStepData(stepIndex);
    if (stepData && hasFilledFields(stepData)) {

      return "completed";
    }


    return "upcoming";
  };

  // Helper function to get data for a specific step
  const getStepData = (stepIndex: number) => {

    switch (stepIndex) {
      case 0:

        return formData?.vital_signs;
      case 1:

        return formData?.medical_history;
      case 2:

        return formData?.chief_complaints;
      case 3:

        return formData?.extra_oral_examination;
      case 4:

        return formData?.intra_oral_examination;
      case 5:

        return formData?.dental_classification;
      case 6:

        return formData?.functional_presentation;
      case 7:
        const combinedData = {
          tactile: formData?.tactile_observation,
          radiographic: formData?.radiographic_presentation
        };

        return combinedData;
      case 8:
        const evaluationData = {
          evaluation_notes: formData?.evaluation_notes,
          maxillary_sinuses_evaluation: formData?.maxillary_sinuses_evaluation,
          airway_evaluation: formData?.airway_evaluation,
          airway_image_url: formData?.airway_image_url
        };

        return evaluationData;
      case 9:

        return formData?.guideline_questions;
      default: return null;
    }
  };

  const steps = [
    {
      label: "Patient Information & Vital Signs",
      status: getStepStatus(0)
    },
    {
      label: "Medical History",
      status: getStepStatus(1)
    },
    {
      label: "Chief Complaints",
      status: getStepStatus(2)
    },
    {
      label: "Extra-Oral Examination",
      status: getStepStatus(3)
    },
    {
      label: "Intra-Oral Examination",
      status: getStepStatus(4)
    },
    {
      label: "Dental Classification",
      status: getStepStatus(5)
    },
    {
      label: "Functional Presentation",
      status: getStepStatus(6)
    },
    {
      label: "Tactile & Radiographic",
      status: getStepStatus(7)
    },
    {
      label: "Evaluation",
      status: getStepStatus(8)
    },
    {
      label: "Guideline Questions",
      status: getStepStatus(9)
    }
  ];


  return <ProgressBar steps={steps} onStepClick={onStepChange} activeStep={currentStep} />;
};