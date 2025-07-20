import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface SignaturePreviewProps {
  signature: string;
  onEdit: () => void;
  onClear: () => void;
  label: string;
}

export function SignaturePreview({ signature, onEdit, onClear, label }: SignaturePreviewProps) {
  return (
    <div className="space-y-2">
      <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
        <div className="flex justify-end items-center mb-2">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-7 px-2 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded p-2 min-h-[80px] flex items-center justify-center">
          {signature ? (
            <img
              src={signature}
              alt="Signature"
              className="max-w-full max-h-[70px] object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          ) : (
            <span className="text-gray-400 text-sm">No signature</span>
          )}
        </div>

        {/* Signature Label at Bottom */}
        <div className="text-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      </div>
    </div>
  );
}
