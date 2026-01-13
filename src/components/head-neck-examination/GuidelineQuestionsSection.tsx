import React from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface GuidelineQuestionsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const GuidelineQuestionsSection = ({
  formData,
  setFormData,
}: GuidelineQuestionsSectionProps) => {
  const handleOptionChange = (questionId: string, value: boolean) => {
    console.log(`Updating question ${questionId}:`, value);
    setFormData((prev: any) => ({
      ...prev,
      guideline_questions: {
        ...prev.guideline_questions,
        [questionId]: value,
      },
    }));
  };

  const questions = [
    {
      id: "weight_loss",
      text: "Patient reports weight loss due to malnutrition",
    },
    {
      id: "persistent_pain",
      text: "The pain in the mouth has persisted more than 6 months",
    },
    {
      id: "speaking_problems",
      text: "Problems speaking which has been documented by a physician",
    },
    {
      id: "sleep_apnea",
      text: "Moderate to severe obstructive sleep apnea, as measured by polysomnography (report must be attached in files uploaded)",
    },
    {
      id: "otc_medications",
      text: "The patient tried over the counter medications for oral pain, but to no avail",
    },
    {
      id: "failed_therapy",
      text: "Patient has tried other forms of therapy which have failed to resolve issue",
    },
    {
      id: "oral_appliances",
      text: "Patient has tried oral appliances (ie partial, denture, flipper)",
    },
    {
      id: "non_surgical_therapies",
      text: "Patient has tried non-surgical therapies prior to surgery",
    },
    {
      id: "q1_missing_1_3",
      text: "Quadrant 1 missing 1-3 teeth (21248)",
    },
    {
      id: "q1_missing_4_more",
      text: "Quadrant 1 missing 4 or more teeth (21249)",
    },
    {
      id: "q2_missing_1_3",
      text: "Quadrant 2 missing 1-3 teeth (21248)",
    },
    {
      id: "q2_missing_4_more",
      text: "Quadrant 2 missing 4 or more teeth (21249)",
    },
    {
      id: "q3_missing_1_3",
      text: "Quadrant 3 missing 1-3 teeth (21248)",
    },
    {
      id: "q3_missing_4_more",
      text: "Quadrant 3 missing 4 or more teeth (21249)",
    },
    {
      id: "q4_missing_1_3",
      text: "Quadrant 4 missing 1-3 teeth (21248)",
    },
    {
      id: "q4_missing_4_more",
      text: "Quadrant 4 missing 4 or more teeth (21249)",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <Label className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {question.text}
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={formData.guideline_questions?.[question.id] ? "default" : "outline"}
                  onClick={() => handleOptionChange(question.id, true)}
                  className="w-20 gap-2"
                >
                  <Check className="h-4 w-4" />
                  Yes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formData.guideline_questions?.[question.id] === false ? "destructive" : "outline"}
                  onClick={() => handleOptionChange(question.id, false)}
                  className="w-20 gap-2"
                >
                  <X className="h-4 w-4" />
                  No
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};