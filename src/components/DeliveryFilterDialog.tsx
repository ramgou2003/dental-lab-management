import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export interface DeliveryFilters {
  status: string[];
  archType: string[];
  applianceType: string[];
  shade: string[];
}

interface DeliveryItem {
  id: string;
  delivery_status: string;
  arch_type: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  shade: string | null;
}

interface DeliveryFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: DeliveryFilters;
  onApplyFilters: (filters: DeliveryFilters) => void;
  onClearFilters: () => void;
}

export function DeliveryFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters,
}: DeliveryFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<DeliveryFilters>(currentFilters);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  useEffect(() => {
    if (open) {
      fetchDeliveryItems();
    }
  }, [open]);

  const fetchDeliveryItems = async () => {
    const { data, error } = await supabase
      .from('delivery_items')
      .select('id, delivery_status, arch_type, upper_appliance_type, lower_appliance_type, shade');

    if (!error && data) {
      setDeliveryItems(data);
    }
  };

  const filterCounts = useMemo(() => {
    const counts = {
      status: {} as Record<string, number>,
      archType: {} as Record<string, number>,
      applianceType: {} as Record<string, number>,
      shade: {} as Record<string, number>,
    };

    deliveryItems.forEach(item => {
      if (item.delivery_status) counts.status[item.delivery_status] = (counts.status[item.delivery_status] || 0) + 1;
      if (item.arch_type) counts.archType[item.arch_type] = (counts.archType[item.arch_type] || 0) + 1;
      if (item.upper_appliance_type) counts.applianceType[item.upper_appliance_type] = (counts.applianceType[item.upper_appliance_type] || 0) + 1;
      if (item.lower_appliance_type) counts.applianceType[item.lower_appliance_type] = (counts.applianceType[item.lower_appliance_type] || 0) + 1;
      if (item.shade) counts.shade[item.shade] = (counts.shade[item.shade] || 0) + 1;
    });

    return counts;
  }, [deliveryItems]);

  const handleButtonToggle = (category: keyof DeliveryFilters, value: string) => {
    setLocalFilters(prev => {
      const currentArray = prev[category] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [category]: newArray };
    });
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

  const activeFilterCount = Object.values(localFilters).reduce((sum, arr) => sum + arr.length, 0);

  const formatLabel = (value: string) => {
    return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Filter Delivery Items
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount} active</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {['ready-to-insert', 'patient-scheduled', 'inserted', 'ready-for-delivery', 'returned'].map(status => {
                const count = filterCounts.status[status] || 0;
                const isSelected = localFilters.status.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('status', status)}
                  >
                    <span className="truncate">{formatLabel(status)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Arch Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Arch Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['upper', 'lower', 'dual'].map(archType => {
                const count = filterCounts.archType[archType] || 0;
                const isSelected = localFilters.archType.includes(archType);
                return (
                  <Button
                    key={archType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('archType', archType)}
                  >
                    <span className="truncate">{formatLabel(archType)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Appliance Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Appliance Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['full-arch-bridge', 'hybrid', 'denture', 'night-guard', 'other'].map(applianceType => {
                const count = filterCounts.applianceType[applianceType] || 0;
                const isSelected = localFilters.applianceType.includes(applianceType);
                return (
                  <Button
                    key={applianceType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('applianceType', applianceType)}
                  >
                    <span className="truncate">{formatLabel(applianceType)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Shade Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Shade</Label>
            <div className="grid grid-cols-6 gap-2">
              {['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D2', 'D3', 'D4'].map(shade => {
                const count = filterCounts.shade[shade] || 0;
                const isSelected = localFilters.shade.includes(shade);
                return (
                  <Button
                    key={shade}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('shade', shade)}
                  >
                    <span className="truncate">{shade}</span>
                    <Badge variant="secondary" className={`ml-1 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>Clear All</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">Apply Filters</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

