import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface IntraOralSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const IntraOralSection = ({ formData, setFormData }: IntraOralSectionProps) => {
  const handleOptionChange = (category: string, value: string) => {
    console.log(`Updating ${category} with value: ${value}`);
    setFormData((prev: any) => ({
      ...prev,
      intra_oral_examination: {
        ...prev.intra_oral_examination,
        [category]: value
      }
    }));
  };

  const handleDentureChange = (dentureId: string) => {
    console.log(`Toggling denture option: ${dentureId}`);
    setFormData((prev: any) => ({
      ...prev,
      intra_oral_examination: {
        ...prev.intra_oral_examination,
        dentures: {
          ...prev.intra_oral_examination?.dentures,
          [dentureId]: !prev.intra_oral_examination?.dentures?.[dentureId]
        }
      }
    }));
  };

  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage
      .from('medical_diagrams')
      .getPublicUrl(filename);
    return data.publicUrl;
  };

  const oralStatus = [
    { id: 'fully_dentate', label: 'Fully Dentate' },
    { id: 'partially_edentulous', label: 'Partially Edentulous' },
    { id: 'completely_edentulous', label: 'Completely Edentulous' }
  ];

  const dentures = [
    { id: 'upper_partial', label: 'Upper Partial Denture' },
    { id: 'lower_partial', label: 'Lower Partial Denture' },
    { id: 'upper_complete', label: 'Upper Complete Denture' },
    { id: 'lower_complete', label: 'Lower Complete Denture' },
    { id: 'ul_partial', label: 'U/L Partial Denture' },
    { id: 'ul_complete', label: 'U/L Complete Denture' }
  ];

  const mallampatiScores = [
    { id: 'class_1', label: 'Class I', image: 'mallampati-1.png' },
    { id: 'class_2', label: 'Class II', image: 'mallampati-2.png' },
    { id: 'class_3', label: 'Class III', image: 'mallampati-3.png' },
    { id: 'class_4', label: 'Class IV', image: 'mallampati-4.png' }
  ];

  const malocclusion = [
    { id: 'normal', label: 'Normal Occlusion', image: 'malocclusion-normal.png' },
    { id: 'cross_bite', label: 'Cross Bite', image: 'malocclusion-cross.png' },
    { id: 'open_bite', label: 'Open Bite', image: 'malocclusion-open.png' },
    { id: 'deep_bite', label: 'Deep Bite', image: 'malocclusion-deep.png' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Patient Oral Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Patient Oral Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {oralStatus.map((status) => {
            const isSelected = formData.intra_oral_examination?.oral_status === status.id;
            return (
              <Button
                key={status.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleOptionChange('oral_status', status.id)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {status.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dentures */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Dentures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dentures.map((denture) => {
            const isSelected = formData.intra_oral_examination?.dentures?.[denture.id];
            return (
              <Button
                key={denture.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleDentureChange(denture.id)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {denture.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mallampati Score */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Mallampati Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mallampatiScores.map((score) => {
            const isSelected = formData.intra_oral_examination?.mallampati_score === score.id;
            return (
              <div key={score.id} className="flex flex-col gap-2">
                <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden border-2 hover:border-primary transition-colors duration-200">
                  <img
                    src={getPublicUrl(score.image)}
                    alt={score.label}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleOptionChange('mallampati_score', score.id)}
                  className={cn(
                    "w-full justify-center font-normal",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  {score.label}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Malocclusion */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Malocclusion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {malocclusion.map((type) => {
            const isSelected = formData.intra_oral_examination?.malocclusion === type.id;
            return (
              <div key={type.id} className="flex flex-col gap-2">
                <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden border-2 hover:border-primary transition-colors duration-200">
                  <img
                    src={getPublicUrl(type.image)}
                    alt={type.label}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleOptionChange('malocclusion', type.id)}
                  className={cn(
                    "w-full justify-center font-normal",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  {type.label}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};