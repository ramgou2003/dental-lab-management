import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function CustomCheckbox({ id, checked, onCheckedChange, children, className = "" }: CustomCheckboxProps) {
  return (
    <div className={`flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
          checked
            ? 'bg-blue-100'
            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        {checked && (
          <Check className="h-3 w-3 text-blue-600" />
        )}
      </div>
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer text-blue-800"
          onClick={() => onCheckedChange(!checked)}
        >
          {children}
        </label>
      </div>
    </div>
  );
}
