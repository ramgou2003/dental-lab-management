import React from "react";
import { RadiograhicFindingsSection } from "./evaluation/RadiograhicFindingsSection";
import { MaxillarySinusSection } from "./evaluation/MaxillarySinusSection";
import { AirwayEvaluationSection } from "./evaluation/AirwayEvaluationSection";

interface EvaluationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const EvaluationSection = ({ formData, setFormData }: EvaluationSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <RadiograhicFindingsSection formData={formData} setFormData={setFormData} />
        <MaxillarySinusSection formData={formData} setFormData={setFormData} />
        <AirwayEvaluationSection formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
};