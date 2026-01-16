import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ExtraOralSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ExtraOralSection = ({ formData, setFormData }: ExtraOralSectionProps) => {
  const handleSelectionChange = (category: string, value: string | boolean) => {
    console.log(`Updating ${category} with value:`, value);
    
    // Handle nested paths (e.g., 'clinical_findings.overjet')
    if (category.includes('.')) {
      const [mainCategory, subCategory] = category.split('.');
      setFormData((prev: any) => ({
        ...prev,
        extra_oral_examination: {
          ...prev.extra_oral_examination,
          [mainCategory]: {
            ...prev.extra_oral_examination?.[mainCategory],
            [subCategory]: value
          }
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        extra_oral_examination: {
          ...prev.extra_oral_examination,
          [category]: value,
        },
      }));
    }
  };

  const handleMeasurementChange = (field: string, value: string) => {
    console.log(`Updating measurement ${field} with value:`, value);
    setFormData((prev: any) => ({
      ...prev,
      extra_oral_examination: {
        ...prev.extra_oral_examination,
        measurements: {
          ...prev.extra_oral_examination?.measurements,
          [field]: value,
        },
      },
    }));
  };

  const SelectionButton = ({ 
    selected, 
    onClick, 
    children 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    children: React.ReactNode 
  }) => (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      className="h-auto py-2 px-4 text-sm font-medium transition-all"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900">Extra-oral Examination</h3>

      {/* Range of Motion Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="mb-2 block">Interincisal</Label>
            <Input
              type="number"
              value={formData.extra_oral_examination?.measurements?.interincisal || ""}
              onChange={(e) => handleMeasurementChange("interincisal", e.target.value)}
              className="w-full"
              placeholder="mm"
            />
          </div>
          <div>
            <Label className="mb-2 block">Protrusive</Label>
            <Input
              type="number"
              value={formData.extra_oral_examination?.measurements?.protrusive || ""}
              onChange={(e) => handleMeasurementChange("protrusive", e.target.value)}
              className="w-full"
              placeholder="mm"
            />
          </div>
          <div>
            <Label className="mb-2 block">Left lateral</Label>
            <Input
              type="number"
              value={formData.extra_oral_examination?.measurements?.left_lateral || ""}
              onChange={(e) => handleMeasurementChange("left_lateral", e.target.value)}
              className="w-full"
              placeholder="mm"
            />
          </div>
          <div>
            <Label className="mb-2 block">Right lateral</Label>
            <Input
              type="number"
              value={formData.extra_oral_examination?.measurements?.right_lateral || ""}
              onChange={(e) => handleMeasurementChange("right_lateral", e.target.value)}
              className="w-full"
              placeholder="mm"
            />
          </div>
        </div>
      </div>

      {/* Deviation Section */}
      <div className="space-y-2">
        <Label className="text-base">Deviation</Label>
        <div className="flex gap-2">
          <SelectionButton
            selected={formData.extra_oral_examination?.deviation === "right"}
            onClick={() => handleSelectionChange("deviation", "right")}
          >
            To the right
          </SelectionButton>
          <SelectionButton
            selected={formData.extra_oral_examination?.deviation === "left"}
            onClick={() => handleSelectionChange("deviation", "left")}
          >
            To the left
          </SelectionButton>
        </div>
      </div>

      {/* Measurements Section */}
      <div className="space-y-4">
        <Label className="text-base">Clinical Measurements</Label>
        <div className="space-y-3">
          {[
            { id: "overjet", label: "Overjet of 5 mm or more" },
            { id: "open_bite", label: "Unilateral posterior open bite more than 2 mm" },
            { id: "protrusive", label: "Protrusive excursive movement more than 4 mm" },
            { id: "discrepancy", label: "Maxillary palatal cusp to mandibular fossa discrepancy" }
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center gap-4">
              <SelectionButton
                selected={formData.extra_oral_examination?.clinical_findings?.[item.id] === "true"}
                onClick={() => handleSelectionChange(`clinical_findings.${item.id}`, 
                  formData.extra_oral_examination?.clinical_findings?.[item.id] === "true" ? "false" : "true")}
              >
                {item.label}
              </SelectionButton>
              <Input
                type="number"
                value={formData.extra_oral_examination?.measurements?.[item.id] || ""}
                onChange={(e) => handleMeasurementChange(item.id, e.target.value)}
                className="w-32"
                placeholder="mm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Palpation Section */}
      <div className="space-y-4">
        <Label className="text-base">Muscle Palpation</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            "Stylo-mandibular ligament",
            "Masseter",
            "Temporalis",
            "Thyroid"
          ].map((muscle) => (
            <SelectionButton
              key={muscle}
              selected={formData.extra_oral_examination?.muscle_palpation?.[muscle.toLowerCase().replace(/-/g, "_")] === "true"}
              onClick={() => handleSelectionChange(
                `muscle_palpation.${muscle.toLowerCase().replace(/-/g, "_")}`,
                formData.extra_oral_examination?.muscle_palpation?.[muscle.toLowerCase().replace(/-/g, "_")] === "true" ? "false" : "true"
              )}
            >
              {muscle}
            </SelectionButton>
          ))}
        </div>
      </div>
    </div>
  );
};