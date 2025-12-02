import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface DeliveryFilters {
  status: string[];
  archType: string[];
  applianceType: string[];
  shade: string[];
}

interface DeliveryFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: DeliveryFilters;
  onApplyFilters: (filters: DeliveryFilters) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'ready-to-insert', label: 'Ready to Insert' },
  { value: 'patient-scheduled', label: 'Scheduled' },
  { value: 'inserted', label: 'Inserted' },
  { value: 'ready-for-delivery', label: 'Ready for Delivery' },
  { value: 'returned', label: 'Returned' },
];

const archTypeOptions = [
  { value: 'upper', label: 'Upper' },
  { value: 'lower', label: 'Lower' },
  { value: 'dual', label: 'Dual' },
];

const applianceTypeOptions = [
  { value: 'full-arch-bridge', label: 'Full Arch Bridge' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'denture', label: 'Denture' },
  { value: 'night-guard', label: 'Night Guard' },
  { value: 'other', label: 'Other' },
];

const shadeOptions = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'A3.5', label: 'A3.5' },
  { value: 'A4', label: 'A4' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'B3', label: 'B3' },
  { value: 'B4', label: 'B4' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
  { value: 'D2', label: 'D2' },
  { value: 'D3', label: 'D3' },
  { value: 'D4', label: 'D4' },
];

export function DeliveryFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters,
}: DeliveryFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<DeliveryFilters>(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  const toggleFilter = (category: keyof DeliveryFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const emptyFilters: DeliveryFilters = {
      status: [],
      archType: [],
      applianceType: [],
      shade: [],
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  const renderFilterSection = (
    title: string,
    category: keyof DeliveryFilters,
    options: { value: string; label: string }[]
  ) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => toggleFilter(category, option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              localFilters[category].includes(option.value)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Deliveries</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderFilterSection('Status', 'status', statusOptions)}
          {renderFilterSection('Arch Type', 'archType', archTypeOptions)}
          {renderFilterSection('Appliance Type', 'applianceType', applianceTypeOptions)}
          {renderFilterSection('Shade', 'shade', shadeOptions)}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClear}>Clear All</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

