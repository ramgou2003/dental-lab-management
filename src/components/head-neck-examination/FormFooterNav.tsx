import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormFooterNavProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onPrevious: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  isReadOnly?: boolean;
}

export const FormFooterNav = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
  isReadOnly = false
}: FormFooterNavProps) => {
  return (
    <div className="border-t border-gray-100 p-4 mt-auto">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
          size="sm"
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep === totalSteps - 1 ? (
          !isReadOnly && (
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="flex items-center gap-1"
              onClick={onSubmit}
            >
              {isSubmitting ? "Saving..." : "Submit Examination"}
            </Button>
          )
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            size="sm"
            className="flex items-center gap-1"
          >
            {isSubmitting && !isReadOnly ? "Saving..." : "Save and Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};