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
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            Please draw your signature in the area below. Use your mouse or touch screen.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center">
            <SignaturePad
              value={tempSignature}
              onSignatureChange={setTempSignature}
              placeholder="Draw your signature here"
              width={600}
              height={200}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
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
