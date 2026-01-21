import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VitalSignsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  patientData?: any;
}

export const VitalSignsSection = ({ formData, setFormData, patientData }: VitalSignsSectionProps) => {
  const updateVitalSigns = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [key]: value
      }
    }));
  };

  const handleHeightComponentChange = (field: 'height_feet' | 'height_inches', value: string) => {
    const ft = field === 'height_feet' ? parseFloat(value || "0") : parseFloat(formData.vital_signs?.height_feet || "0");
    const inch = field === 'height_inches' ? parseFloat(value || "0") : parseFloat(formData.vital_signs?.height_inches || "0");

    const totalHeight = (ft * 12) + inch;

    setFormData((prev: any) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value,
        height: totalHeight.toString()
      }
    }));
  };

  // Backward compatibility: Populate feet/inches if only height exists
  useEffect(() => {
    const heightVal = parseFloat(formData.vital_signs?.height || "0");
    const feetVal = formData.vital_signs?.height_feet;
    const inchesVal = formData.vital_signs?.height_inches;

    // Only set if height exists but feet/inches are undefined (empty strings correspond to user input so we respect them)
    if (heightVal > 0 && feetVal === undefined && inchesVal === undefined) {
      const f = Math.floor(heightVal / 12);
      const i = Math.round((heightVal % 12) * 10) / 10;

      setFormData((prev: any) => ({
        ...prev,
        vital_signs: {
          ...prev.vital_signs,
          height_feet: f.toString(),
          height_inches: i.toString()
        }
      }));
    }
  }, [formData.vital_signs?.height, formData.vital_signs?.height_feet, formData.vital_signs?.height_inches]);

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
      {/* Patient Information Section */}
      <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
        <h3 className="text-lg font-semibold text-primary">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Patient Name</Label>
            <div className="font-medium">
              {patientData ? `${patientData.first_name || ''} ${patientData.last_name || ''}` : '-'}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Date of Birth</Label>
            <div className="font-medium">
              {patientData?.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : '-'}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <div className="font-medium">{patientData?.email || '-'}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            <div className="font-medium">{patientData?.phone || '-'}</div>
          </div>
        </div>
      </div>

      <div className="border-t my-6"></div>

      <h3 className="text-lg font-semibold">Vital Signs</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Height</Label>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <Input
                id="height_feet"
                type="number"
                placeholder="ft"
                min="0"
                value={formData.vital_signs?.height_feet || ""}
                onChange={(e) => handleHeightComponentChange("height_feet", e.target.value)}
              />
              <span className="text-xs text-muted-foreground ml-1">Feet</span>
            </div>
            <div className="flex-1 space-y-1">
              <Input
                id="height_inches"
                type="number"
                placeholder="in"
                min="0"
                max="11"
                value={formData.vital_signs?.height_inches || ""}
                onChange={(e) => handleHeightComponentChange("height_inches", e.target.value)}
              />
              <span className="text-xs text-muted-foreground ml-1">Inches</span>
            </div>
          </div>
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
