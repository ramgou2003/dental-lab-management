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
    <div
      className={`flex items-center space-x-3 p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[60px] ${
        checked
          ? 'bg-blue-100 border-blue-500 shadow-sm'
          : 'bg-blue-50 border-blue-300 hover:border-blue-400 hover:bg-blue-100'
      } ${className}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked
            ? 'border-blue-600 bg-blue-600'
            : 'border-blue-400 bg-white'
        }`}
      >
        {checked && (
          <div className="w-2 h-2 rounded-full bg-white"></div>
        )}
      </div>
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer text-blue-800 leading-relaxed"
        >
          {children}
        </label>
      </div>
    </div>
  );
}
