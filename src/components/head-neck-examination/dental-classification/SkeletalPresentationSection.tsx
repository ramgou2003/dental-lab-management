import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkeletalPresentationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const SkeletalPresentationSection = ({ formData, setFormData }: SkeletalPresentationSectionProps) => {
  const skeletalTypes = [
    'retrognathic_maxilla',
    'retrognathic_mandible',
    'prognathic_mandible',
    'prognathic_maxilla',
    'ovoid_mandible',
    'tapered_mandible',
    'tapered_maxilla',
    'square_mandible',
    'square_maxilla',
    'ovoid_maxilla'
  ];

  const handleChange = (type: string) => {
    setFormData((prev: any) => ({
      ...prev,
      dental_classification: {
        ...prev.dental_classification,
        skeletal: {
          ...prev.dental_classification?.skeletal,
          [type]: !prev.dental_classification?.skeletal?.[type]
        }
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-primary">Skeletal Presentation</Label>
      <div className="grid grid-cols-2 gap-2">
        {skeletalTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant={formData.dental_classification?.skeletal?.[type] ? "default" : "outline"}
            onClick={() => handleChange(type)}
            className={cn(
              "w-full h-9 text-sm justify-start font-normal",
              formData.dental_classification?.skeletal?.[type] && "bg-primary text-primary-foreground"
            )}
          >
            {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>
    </div>
  );
};