import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MaxillarySinusSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const MaxillarySinusSection = ({ formData, setFormData }: MaxillarySinusSectionProps) => {
  const sinusOptions = ["Normal", "Clear", "Congested", "Pneumatized"];

  const handleSelectionChange = (side: 'left' | 'right', option: string) => {
    console.log(`Updating ${side} maxillary sinus:`, option);
    
    let currentSelections: string[] = [];
    try {
      const parsedSelections = JSON.parse(formData.maxillary_sinuses_evaluation[side] || '[]');
      currentSelections = Array.isArray(parsedSelections) ? parsedSelections : [];
    } catch (e) {
      console.error('Error parsing selections:', e);
      currentSelections = [];
    }
    
    const updatedSelections = currentSelections.includes(option)
      ? currentSelections.filter(item => item !== option)
      : [...currentSelections, option];

    console.log(`Updated selections for ${side}:`, updatedSelections);
    
    setFormData({
      ...formData,
      maxillary_sinuses_evaluation: {
        ...formData.maxillary_sinuses_evaluation,
        [side]: JSON.stringify(updatedSelections)
      }
    });
  };

  const isOptionSelected = (side: 'left' | 'right', option: string) => {
    try {
      const selections = JSON.parse(formData.maxillary_sinuses_evaluation[side] || '[]');
      return Array.isArray(selections) && selections.includes(option);
    } catch (e) {
      console.error('Error checking selection:', e);
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary mb-4">Maxillary Sinus Evaluation</h2>
      <div>
        <Label className="text-base font-semibold">
          Left Maxillary Sinus
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {sinusOptions.map((option) => (
            <Button
              key={`left-${option}`}
              type="button"
              variant={isOptionSelected('left', option) ? "default" : "outline"}
              onClick={() => handleSelectionChange('left', option)}
              className="h-auto py-2 px-4 text-sm font-medium transition-all justify-start"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">
          Right Maxillary Sinus
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {sinusOptions.map((option) => (
            <Button
              key={`right-${option}`}
              type="button"
              variant={isOptionSelected('right', option) ? "default" : "outline"}
              onClick={() => handleSelectionChange('right', option)}
              className="h-auto py-2 px-4 text-sm font-medium transition-all justify-start"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};