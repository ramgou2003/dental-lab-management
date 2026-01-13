import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TactileRadiographicSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const TactileRadiographicSection = ({
  formData,
  setFormData,
}: TactileRadiographicSectionProps) => {
  const tactileOptions = [
    { id: "pain_sinus_palpation", label: "Pain upon sinus palpation" },
    { id: "neck_pain", label: "Neck pain (ICD M54.2)" },
    { id: "pain_mandible", label: "Pain in mandible" },
    { id: "adequate_tissue_support", label: "Adequate/favorable soft tissue support" },
    { id: "pain_maxilla", label: "Pain in maxilla" },
  ];

  const radiographicOptions = [
    { id: "infection_alveolar", label: "Infection, alveolar (ICD K04.7)" },
    { id: "periapical_abscess_without_sinus", label: "Periapical abscess without sinus (K04.7)" },
    { id: "alveolitis", label: "Alveolitis (ICD M27.3)" },
    { id: "periapical_abscess_with_sinus", label: "Periapical abscess with sinus (K04.6)" },
    { id: "granuloma_jaw", label: "Granuloma of jaw (M27.1)" },
    { id: "abscess_cellulitis", label: "Abscess/Cellulitis" },
    { id: "oral_cyst", label: "Oral cyst (K09.9)" },
    { id: "oral_cysts_tumors", label: "Oral Cysts or tumors" },
    { id: "osteomyelitis", label: "Osteomyelitis" },
    { id: "alveolar_resorption", label: "Alveolar resorption" },
  ];

  const handleTactileChange = (optionId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tactile_observation: {
        ...prev.tactile_observation,
        [optionId]: !prev.tactile_observation?.[optionId],
      },
    }));
  };

  const handleRadiographicChange = (optionId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      radiographic_presentation: {
        ...prev.radiographic_presentation,
        [optionId]: !prev.radiographic_presentation?.[optionId],
      },
    }));
  };

  const handleTomographyChange = () => {
    setFormData((prev: any) => ({
      ...prev,
      tomography_data: {
        ...prev.tomography_data,
        completed: !prev.tomography_data?.completed,
      },
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      tomography_data: {
        ...prev.tomography_data,
        service_date: e.target.value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Tactile Observation</h3>
        <div className="grid grid-cols-2 gap-2">
          {tactileOptions.map((option) => (
            <Button
              key={option.id}
              variant={formData.tactile_observation?.[option.id] ? "default" : "outline"}
              onClick={() => handleTactileChange(option.id)}
              className={cn(
                "h-auto min-h-[48px] justify-start text-left text-sm font-normal p-2 whitespace-normal break-words",
                formData.tactile_observation?.[option.id] && "bg-primary text-primary-foreground"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Radiographic Presentation</h3>
        <div className="grid grid-cols-2 gap-2">
          {radiographicOptions.map((option) => (
            <Button
              key={option.id}
              variant={formData.radiographic_presentation?.[option.id] ? "default" : "outline"}
              onClick={() => handleRadiographicChange(option.id)}
              className={cn(
                "h-auto min-h-[48px] justify-start text-left text-sm font-normal p-2 whitespace-normal break-words",
                formData.radiographic_presentation?.[option.id] && "bg-primary text-primary-foreground"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant={formData.tomography_data?.completed ? "default" : "outline"}
            onClick={handleTomographyChange}
            className={cn(
              "h-auto min-h-[48px] justify-start text-left text-sm font-normal p-2 whitespace-normal break-words",
              formData.tomography_data?.completed && "bg-primary text-primary-foreground"
            )}
          >
            TOMOGRAPHY COMPLETED
          </Button>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">DATE OF SERVICE</label>
            <input
              type="date"
              value={formData.tomography_data?.service_date || ""}
              onChange={handleDateChange}
              className="w-full px-2 py-1.5 text-sm border rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};