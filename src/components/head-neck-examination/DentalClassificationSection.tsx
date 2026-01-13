import React from "react";
import { InflammationSection } from "./dental-classification/InflammationSection";
import { DentalStatusSection } from "./dental-classification/DentalStatusSection";
import { BiteClassificationSection } from "./dental-classification/BiteClassificationSection";
import { SkeletalPresentationSection } from "./dental-classification/SkeletalPresentationSection";

interface DentalClassificationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const DentalClassificationSection = ({ formData, setFormData }: DentalClassificationSectionProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <InflammationSection formData={formData} setFormData={setFormData} />
      <DentalStatusSection formData={formData} setFormData={setFormData} />
      <BiteClassificationSection formData={formData} setFormData={setFormData} />
      <SkeletalPresentationSection formData={formData} setFormData={setFormData} />
    </div>
  );
};