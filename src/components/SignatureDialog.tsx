import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/SignaturePad";
import { Save } from "lucide-react";

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

  const handleSave = () => {
    if (tempSignature) {
      onSave(tempSignature);
      onClose();
    } else {
      alert('Please draw your signature before saving.');
    }
  };

  const handleClose = () => {
    setTempSignature(currentSignature); // Reset to original signature
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-semibold">
              {title}
            </DialogTitle>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              disabled={!tempSignature}
            >
              <Save className="h-4 w-4" />
              Save Signature
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Please draw your signature in the area below
              </p>
              <p className="text-xs text-gray-500">
                Use your mouse on computer or finger/stylus on tablet
              </p>
            </div>

            <div className="flex justify-center">
              <SignaturePad
                value={tempSignature}
                onSignatureChange={setTempSignature}
                placeholder="Draw your signature here"
                width={600}
                height={200}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
