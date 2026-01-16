import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BiteClassificationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const BiteClassificationSection = ({ formData, setFormData }: BiteClassificationSectionProps) => {
  const biteTypes = [
    'normal',
    'moderate',
    'deep',
    'left_anterior_cross_bite',
    'left_posterior_cross_bite',
    'right_anterior_cross_bite',
    'right_posterior_cross_bite',
    'bilateral_posterior_cross_bite'
  ];

  const handleChange = (type: string) => {
    setFormData((prev: any) => ({
      ...prev,
      dental_classification: {
        ...prev.dental_classification,
        bite: type
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-primary">Bite Classification</Label>
      <div className="grid grid-cols-2 gap-2">
        {biteTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant={formData.dental_classification?.bite === type ? "default" : "outline"}
            onClick={() => handleChange(type)}
            className={cn(
              "w-full h-9 text-sm justify-start font-normal",
              formData.dental_classification?.bite === type && "bg-primary text-primary-foreground"
            )}
          >
            {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>
    </div>
  );
};