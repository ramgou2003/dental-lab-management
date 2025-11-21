import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface LabScriptCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completionDate: string) => void;
  patientName: string;
}

export function LabScriptCompletionDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName
}: LabScriptCompletionDialogProps) {
  // Get current time in EST
  const getESTDateTime = () => {
    const now = new Date();
    const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const date = estDate.toISOString().split('T')[0];
    const hours = estDate.getHours().toString().padStart(2, '0');
    const minutes = estDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return { date, time };
  };

  const { date: initialDate, time: initialTime } = getESTDateTime();
  const [completionDate, setCompletionDate] = useState(initialDate);
  const [completionTime, setCompletionTime] = useState(initialTime);

  const handleConfirm = () => {
    // Combine date and time and treat it as EST
    // We'll create a timestamp that represents the selected date/time in EST
    const dateTimeString = `${completionDate}T${completionTime}:00-05:00`; // EST is UTC-5
    onConfirm(dateTimeString);
    onClose();
  };

  const handleCancel = () => {
    // Reset to current EST date and time when canceling
    const { date, time } = getESTDateTime();
    setCompletionDate(date);
    setCompletionTime(time);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">
            Complete Lab Script
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Patient Name
            </Label>
            <div className="text-base text-gray-900 font-medium">
              {patientName}
            </div>
          </div>

          {/* Completion Date and Time */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Completion Date & Time (EST) <span className="text-red-500">*</span>
              </Label>

              {/* Date and Time in same row */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    id="completion-date"
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <div className="flex-1">
                  <Input
                    id="completion-time"
                    type="time"
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Current Date & Time Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const { date, time } = getESTDateTime();
                setCompletionDate(date);
                setCompletionTime(time);
              }}
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Use Current Date & Time (EST)
            </Button>

            <p className="text-xs text-gray-500">
              Select the date and time (Eastern Time) when this lab script was completed
            </p>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Please confirm:</span> Are you sure you want to mark this lab script as completed?
              This action will update the status and record the completion date and time.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="min-w-[100px] bg-green-600 hover:bg-green-700"
            disabled={!completionDate || !completionTime}
          >
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

