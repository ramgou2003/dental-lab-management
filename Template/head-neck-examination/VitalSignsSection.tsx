import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VitalSignsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const VitalSignsSection = ({ formData, setFormData }: VitalSignsSectionProps) => {
  const updateVitalSigns = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [key]: value
      }
    }));
  };

  useEffect(() => {
    const heightInInches = parseFloat(formData.vital_signs?.height || "0");
    const weightInPounds = parseFloat(formData.vital_signs?.weight || "0");
    
    if (heightInInches > 0 && weightInPounds > 0) {
      // BMI formula for imperial units: (weight in pounds * 703) / (height in inches)²
      const bmi = (weightInPounds * 703) / (heightInInches * heightInInches);
      updateVitalSigns("bmi", bmi.toFixed(1));
    }
  }, [formData.vital_signs?.height, formData.vital_signs?.weight]);

  const handleBPChange = (type: 'systolic' | 'diastolic', value: string) => {
    const currentBP = formData.vital_signs?.blood_pressure || '/';
    const [systolic, diastolic] = currentBP.split('/');
    
    let newBP = '';
    if (type === 'systolic') {
      newBP = `${value}/${diastolic || ''}`;
    } else {
      newBP = `${systolic || ''}/${value}`;
    }
    
    updateVitalSigns("blood_pressure", newBP);
  };

  // Extract systolic and diastolic values
  const [systolic, diastolic] = (formData.vital_signs?.blood_pressure || '/').split('/');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Vital Signs</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (in)</Label>
          <Input
            id="height"
            type="number"
            value={formData.vital_signs?.height || ""}
            onChange={(e) => updateVitalSigns("height", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.vital_signs?.weight || ""}
            onChange={(e) => updateVitalSigns("weight", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bmi">BMI (lbs/in²)</Label>
          <Input
            id="bmi"
            type="text"
            value={formData.vital_signs?.bmi || ""}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heart_rate">Heart Rate (BPM)</Label>
          <Input
            id="heart_rate"
            type="number"
            min="30"
            max="250"
            value={formData.vital_signs?.hp || ""}
            onChange={(e) => updateVitalSigns("hp", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood_pressure">Blood Pressure (systolic/diastolic)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="blood_pressure_systolic"
              type="number"
              min="0"
              max="300"
              value={systolic || ""}
              onChange={(e) => handleBPChange('systolic', e.target.value)}
              className="w-20"
            />
            <span className="text-gray-500">/</span>
            <Input
              id="blood_pressure_diastolic"
              type="number"
              min="0"
              max="200"
              value={diastolic || ""}
              onChange={(e) => handleBPChange('diastolic', e.target.value)}
              className="w-20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            min="95"
            max="108"
            value={formData.vital_signs?.temperature || ""}
            onChange={(e) => updateVitalSigns("temperature", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
