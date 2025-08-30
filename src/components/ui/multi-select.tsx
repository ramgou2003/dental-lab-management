import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (option: string) => {
    if (disabled) return;
    
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    
    onChange(newValue);
  };

  const handleRemoveOption = (option: string) => {
    if (disabled) return;
    onChange(value.filter(v => v !== option));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal",
          value.length === 0 && "text-muted-foreground"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            <span className="text-sm">
              {value.length === 1 
                ? value[0] 
                : `${value.length} option${value.length > 1 ? 's' : ''} selected`
              }
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>

      {/* Selected Items Display */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((item) => (
            <div
              key={item}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
            >
              <span className="text-xs font-medium">{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(item)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {!disabled && value.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded-md"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${option}`}
                  checked={value.includes(option)}
                  onCheckedChange={() => handleToggleOption(option)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`option-${option}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
          
          {/* Footer Actions */}
          {value.length > 0 && !disabled && (
            <div className="border-t border-gray-200 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-xs"
              >
                Clear All Selections
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
