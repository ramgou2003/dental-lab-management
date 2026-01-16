import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DentalStatusSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const DentalStatusSection = ({ formData, setFormData }: DentalStatusSectionProps) => {
  const handleChange = (category: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      dental_classification: {
        ...prev.dental_classification,
        [category]: value
      }
    }));
  };

  const handleQuadrantChange = (category: string, quadrant: string) => {
    setFormData((prev: any) => ({
      ...prev,
      dental_classification: {
        ...prev.dental_classification,
        quadrants: {
          ...prev.dental_classification?.quadrants,
          [category]: {
            ...prev.dental_classification?.quadrants?.[category],
            [quadrant]: !prev.dental_classification?.quadrants?.[category]?.[quadrant]
          }
        }
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-primary">Dental Status</Label>
      {['broken', 'missing', 'infected'].map((category) => (
        <div key={category} className="space-y-2">
          <Label className="capitalize font-medium">{category} teeth</Label>
          <div className="grid grid-cols-2 gap-2">
            {['single', 'multiple'].map((type) => (
              <Button
                key={`${category}-${type}`}
                type="button"
                variant={formData.dental_classification?.[category] === type ? "default" : "outline"}
                onClick={() => handleChange(category, type)}
                className={cn(
                  "w-full h-9 text-sm justify-start font-normal",
                  formData.dental_classification?.[category] === type && "bg-primary text-primary-foreground"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['UR', 'UL', 'LR', 'LL'].map((quadrant) => (
              <Button
                key={`${category}-${quadrant}`}
                type="button"
                variant={formData.dental_classification?.quadrants?.[category]?.[quadrant] ? "default" : "outline"}
                onClick={() => handleQuadrantChange(category, quadrant)}
                className={cn(
                  "w-full h-9 text-sm justify-start font-normal",
                  formData.dental_classification?.quadrants?.[category]?.[quadrant] && "bg-primary text-primary-foreground"
                )}
              >
                {quadrant}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};