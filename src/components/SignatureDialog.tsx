import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/SignaturePad";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title: string;
  currentSignature?: string;
}

export function SignatureDialog({
  isOpen,
  onClose,
  onSave,
  title,
  currentSignature = ''
}: SignatureDialogProps) {
  const [tempSignature, setTempSignature] = useState(currentSignature);

  // Sync tempSignature when dialog opens or currentSignature changes
  useEffect(() => {
    if (isOpen) {
      setTempSignature(currentSignature);
    }
  }, [isOpen, currentSignature]);

  const handleSave = () => {
    if (tempSignature) {
      onSave(tempSignature);
      onClose();
    } else {
      // Small visual feedback if trying to save empty
      // Could use toast here but alert is immediate
      alert('Please draw your signature before saving.');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTempSignature(currentSignature); // Reset to original signature on close
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[95vh] flex flex-col p-0 overflow-hidden sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:p-6">
        <DialogHeader className="p-4 pb-0 sm:p-0">
          <div className="flex items-center justify-between mr-8">
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            Please draw your signature below. Use your finger or a stylus.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-0 sm:py-4">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-6 flex justify-center">
            <SignaturePad
              value={tempSignature}
              onSignatureChange={setTempSignature}
              placeholder="Draw your signature here"
              width={600}
              height={250}
            />
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 gap-2 sm:p-0 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            disabled={!tempSignature}
          >
            <Save className="h-4 w-4" />
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
