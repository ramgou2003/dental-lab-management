import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";

interface StartLabScriptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  patientName: string;
}

export function StartLabScriptDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName
}: StartLabScriptDialogProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error starting lab script:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = () => {
    if (!isStarting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Play className="h-5 w-5" />
            Start Lab Script
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Play className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>
                Are you sure you want to start working on the lab script for <strong>{patientName}</strong>?
              </p>
              <p className="mt-2 text-blue-600">
                This will change the status to "In Progress".
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isStarting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Design
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

