import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RadiograhicFindingsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const RadiograhicFindingsSection = ({ formData, setFormData }: RadiograhicFindingsSectionProps) => {
  const evaluationOptions = [
    "Focal bone loss",
    "Diffused bone loss",
    "Alveolar resorption",
    "Localized Decay",
    "Gross Decay",
    "Terminal Dentition",
    "Focal Intra-osseous Pathology",
    "Diffused Intra-osseous Pathology"
  ];

  const handleEvaluationChange = (option: string) => {
    console.log(`Updating evaluation notes:`, option);
    
    let currentSelections: string[] = [];
    try {
      const parsedSelections = JSON.parse(formData.evaluation_notes || '[]');
      currentSelections = Array.isArray(parsedSelections) ? parsedSelections : [];
    } catch (e) {
      console.error('Error parsing evaluation selections:', e);
      currentSelections = [];
    }
    
    const updatedSelections = currentSelections.includes(option)
      ? currentSelections.filter(item => item !== option)
      : [...currentSelections, option];

    console.log(`Updated evaluation selections:`, updatedSelections);
    
    setFormData({
      ...formData,
      evaluation_notes: JSON.stringify(updatedSelections)
    });
  };

  const isEvaluationSelected = (option: string) => {
    try {
      const selections = JSON.parse(formData.evaluation_notes || '[]');
      return Array.isArray(selections) && selections.includes(option);
    } catch (e) {
      console.error('Error checking evaluation selection:', e);
      return false;
    }
  };

  return (
    <div>
      <Label className="text-xl font-bold text-primary">
        Radiographic Findings
      </Label>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {evaluationOptions.map((option) => (
          <Button
            key={option}
            type="button"
            variant={isEvaluationSelected(option) ? "default" : "outline"}
            onClick={() => handleEvaluationChange(option)}
            className="h-auto py-2 px-4 text-sm font-medium transition-all justify-start"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};