import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AirwayImageUpload } from "./AirwayImageUpload";

interface AirwayEvaluationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const AirwayEvaluationSection = ({ formData, setFormData }: AirwayEvaluationSectionProps) => {
  const airwayOptions = [
    "Adequate airway patency",
    "Mild airway constriction",
    "Moderately compromised airway",
    "Severely compromised airway"
  ];

  const handleAirwayChange = (option: string) => {
    console.log(`Updating airway evaluation:`, option);
    
    let currentSelections: string[] = [];
    try {
      const parsedSelections = JSON.parse(formData.airway_evaluation || '[]');
      currentSelections = Array.isArray(parsedSelections) ? parsedSelections : [];
    } catch (e) {
      console.error('Error parsing airway selections:', e);
      currentSelections = [];
    }
    
    const updatedSelections = currentSelections.includes(option)
      ? currentSelections.filter(item => item !== option)
      : [...currentSelections, option];

    console.log(`Updated airway selections:`, updatedSelections);
    
    setFormData({
      ...formData,
      airway_evaluation: JSON.stringify(updatedSelections)
    });
  };

  const isAirwaySelected = (option: string) => {
    try {
      const selections = JSON.parse(formData.airway_evaluation || '[]');
      return Array.isArray(selections) && selections.includes(option);
    } catch (e) {
      console.error('Error checking airway selection:', e);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="airway_evaluation" className="text-xl font-bold text-primary">
          AIRWAY EVALUATION
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {airwayOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant={isAirwaySelected(option) ? "default" : "outline"}
              onClick={() => handleAirwayChange(option)}
              className="h-auto py-2 px-4 text-sm font-medium transition-all justify-start"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <AirwayImageUpload formData={formData} setFormData={setFormData} />
    </div>
  );
};