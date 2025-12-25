import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/SignaturePad";
import { Save, X } from "lucide-react";
import { createPortal } from 'react-dom';

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
      alert('Please draw your signature before saving.');
    }
  };

  const handleClose = () => {
    setTempSignature(currentSignature); // Reset to original signature
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Dialog Content */}
      <div className="relative z-[101] bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-top-[48%]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between pr-8">
            <h2 className="text-xl font-semibold">
              {title}
            </h2>
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
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
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
      </div>
    </div>,
    document.body
  );
}
