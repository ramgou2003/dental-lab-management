import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChiefComplaintsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ChiefComplaintsSection = ({ formData, setFormData }: ChiefComplaintsSectionProps) => {
  const complaints = [
    { id: "orofacial_pain", label: "Orofacial Pain" },
    { id: "craniofacial_pain", label: "Craniofacial Pain" },
    { id: "headaches", label: "Headaches (ICD R51)", code: "R51" },
    { id: "migraines", label: "Migraines" },
    { id: "head_pain", label: "Head Pain" },
    { id: "jaw_pain", label: "Jaw Pain (R68.84)", code: "R68.84" },
    { id: "oral_infection", label: "Oral Infection (ICD K04.7)", code: "K04.7" },
  ];

  const symptoms = [
    { id: "swelling_inflammation", label: "Swelling/Inflammation" },
    { id: "digestive_gastrointestinal", label: "Digestive Problems/Gastro-intestional Issues/Difficulty Swallowing (R13.11)", code: "R13.11" },
    { id: "limited_diet", label: "Limited Diet/Soft Diet" },
    { id: "difficulty_chewing", label: "Difficulty Chewing" },
    { id: "pain_when_chewing", label: "Pain When Chewing" },
  ];

  const handleComplaintChange = (complaintId: string, checked: boolean) => {
    const currentComplaints = formData.chief_complaints || {};
    setFormData({
      ...formData,
      chief_complaints: {
        ...currentComplaints,
        [complaintId]: checked,
      },
    });
  };

  const handleDurationChange = (field: string, value: string) => {
    const currentComplaints = formData.chief_complaints || {};
    setFormData({
      ...formData,
      chief_complaints: {
        ...currentComplaints,
        duration_months: field === 'months' ? value : currentComplaints.duration_months,
        duration_years: field === 'years' ? value : currentComplaints.duration_years,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Chief Complaint: Please check all that apply to patient</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((complaint) => {
            const isSelected = formData.chief_complaints?.[complaint.id] || false;
            return (
              <Button
                key={complaint.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleComplaintChange(complaint.id, !isSelected)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {complaint.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Symptoms Present for:</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={formData.chief_complaints?.duration_months || ""}
              onChange={(e) => handleDurationChange('months', e.target.value)}
              className="w-20"
            />
            <Label>months</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={formData.chief_complaints?.duration_years || ""}
              onChange={(e) => handleDurationChange('years', e.target.value)}
              className="w-20"
            />
            <Label>years</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Associated Symptoms:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symptoms.map((symptom) => {
            const isSelected = formData.chief_complaints?.[symptom.id] || false;
            return (
              <Button
                key={symptom.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleComplaintChange(symptom.id, !isSelected)}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {symptom.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};