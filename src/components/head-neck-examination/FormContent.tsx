import React from "react";
import { ChiefComplaintsSection } from "./ChiefComplaintsSection";
import { VitalSignsSection } from "./VitalSignsSection";
import { MedicalHistorySection } from "./MedicalHistorySection";
import { ExtraOralSection } from "./ExtraOralSection";
import { IntraOralSection } from "./IntraOralSection";
import { DentalClassificationSection } from "./DentalClassificationSection";
import { FunctionalPresentationSection } from "./FunctionalPresentationSection";
import { TactileRadiographicSection } from "./TactileRadiographicSection";
import { EvaluationSection } from "./EvaluationSection";
import { GuidelineQuestionsSection } from "./GuidelineQuestionsSection";

interface FormContentProps {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
  patientData?: any;
}

export const FormContent = ({ currentStep, formData, setFormData, patientData }: FormContentProps) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <VitalSignsSection formData={formData} setFormData={setFormData} patientData={patientData} />;
      case 1:
        return <MedicalHistorySection formData={formData} setFormData={setFormData} />;
      case 2:
        return <ChiefComplaintsSection formData={formData} setFormData={setFormData} />;
      case 3:
        return <ExtraOralSection formData={formData} setFormData={setFormData} />;
      case 4:
        return <IntraOralSection formData={formData} setFormData={setFormData} />;
      case 5:
        return <DentalClassificationSection formData={formData} setFormData={setFormData} />;
      case 6:
        return <FunctionalPresentationSection formData={formData} setFormData={setFormData} />;
      case 7:
        return <TactileRadiographicSection formData={formData} setFormData={setFormData} />;
      case 8:
        return <EvaluationSection formData={formData} setFormData={setFormData} />;
      case 9:
        return <GuidelineQuestionsSection formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[400px]">
      {renderStepContent()}
    </div>
  );
};