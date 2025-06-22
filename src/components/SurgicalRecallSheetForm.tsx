import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

interface SurgicalRecallSheetFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  editingSheet?: any;
}

export function SurgicalRecallSheetForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
  editingSheet
}: SurgicalRecallSheetFormProps) {

  const currentStep = 1;
  const totalSteps = 1;

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header - exactly like IV sedation */}
      <div className="flex-shrink-0 px-6 pt-6 pb-3 relative">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Activity className="h-5 w-5 text-blue-600" />
            Surgical Recall Sheet - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </div>
      </div>

      {/* Form Content - exactly like IV sedation structure */}
      <div className="flex-1 flex flex-col min-h-0">
        <form className="flex-1 flex flex-col min-h-0">
          {/* Step Content Container - Hidden Scrollbar */}
          <div className="flex-1 px-6 py-2 overflow-y-auto scrollbar-hidden">
            {/* Empty content for now */}
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Form content coming soon...</p>
              </div>
            </div>
          </div>

          {/* Form Actions - exactly like IV sedation footer */}
          <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              Previous
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === totalSteps ? 'Review and Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
