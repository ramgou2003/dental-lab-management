import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MedicalHistorySectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

const medicalConditions = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Thyroid Disorder",
  "Arthritis",
  "Cancer",
  "Kidney Disease",
  "Liver Disease",
  "Neurological Disorder"
];

const allergyTypes = [
  "Penicillin",
  "Sulfa Drugs",
  "Aspirin",
  "Latex",
  "Local Anesthetics",
  "Iodine",
  "Metals",
  "Food Allergies",
  "Seasonal Allergies",
  "Other"
];

export const MedicalHistorySection = ({ formData, setFormData }: MedicalHistorySectionProps) => {
  const updateMedicalHistory = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      medical_history: {
        ...prev.medical_history,
        [key]: value
      }
    }));
  };

  const toggleCondition = (condition: string) => {
    const currentConditions = formData.medical_history?.conditions || [];
    const updatedConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c: string) => c !== condition)
      : [...currentConditions, condition];
    
    updateMedicalHistory("conditions", updatedConditions);
  };

  const toggleAllergy = (allergy: string) => {
    const currentAllergies = formData.medical_history?.allergies || [];
    const updatedAllergies = currentAllergies.includes(allergy)
      ? currentAllergies.filter((a: string) => a !== allergy)
      : [...currentAllergies, allergy];
    
    updateMedicalHistory("allergies", updatedAllergies);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Medical History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicalConditions.map((condition) => {
            const isSelected = (formData.medical_history?.conditions || []).includes(condition);
            return (
              <Button
                key={condition}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleCondition(condition)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {condition}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Allergies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allergyTypes.map((allergy) => {
            const isSelected = (formData.medical_history?.allergies || []).includes(allergy);
            return (
              <Button
                key={allergy}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleAllergy(allergy)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {allergy}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};