import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, X } from "lucide-react";

interface LabScriptCompletedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFillReportCard: () => void;
  patientName: string;
}

export function LabScriptCompletedDialog({
  isOpen,
  onClose,
  onFillReportCard,
  patientName
}: LabScriptCompletedDialogProps) {
  const handleFillReportCard = () => {
    onFillReportCard();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Lab Script Completed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p>
                The lab script for <strong>{patientName}</strong> has been completed successfully!
              </p>
              <p className="mt-2 text-green-600">
                Would you like to fill out the lab report card now?
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleFillReportCard}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Fill Lab Report Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

