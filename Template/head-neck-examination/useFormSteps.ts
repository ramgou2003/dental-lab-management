import { useState } from "react";

export const useFormSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 10; // Updated to include the new Guideline Questions step

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handlePrevious,
    totalSteps,
  };
};