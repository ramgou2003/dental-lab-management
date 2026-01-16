import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InflammationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const InflammationSection = ({ formData, setFormData }: InflammationSectionProps) => {
  const handleChange = (type: string) => {
    setFormData((prev: any) => ({
      ...prev,
      dental_classification: {
        ...prev.dental_classification,
        inflammation: type
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-primary">Inflammation Classification (ICD M27.2)</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {['mild', 'moderate', 'diffuse'].map((type) => (
          <Button
            key={type}
            type="button"
            variant={formData.dental_classification?.inflammation === type ? "default" : "outline"}
            onClick={() => handleChange(type)}
            className={cn(
              "w-full h-9 text-sm justify-start font-normal",
              formData.dental_classification?.inflammation === type && "bg-primary text-primary-foreground"
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
};