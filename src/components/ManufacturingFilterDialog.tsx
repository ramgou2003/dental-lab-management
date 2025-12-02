import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export interface ManufacturingFilters {
  status: string[];
  archType: string[];
  applianceType: string[];
  material: string[];
  shade: string[];
  manufacturingMethod: string[];
  millingLocation: string[];
  inspectionStatus: string[];
}

interface ManufacturingItem {
  id: string;
  status: string;
  arch_type: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  material: string | null;
  shade: string | null;
  manufacturing_method: string | null;
  milling_location: string | null;
  inspection_status: string | null;
}

interface ManufacturingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: ManufacturingFilters;
  onApplyFilters: (filters: ManufacturingFilters) => void;
  onClearFilters: () => void;
}

export function ManufacturingFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters
}: ManufacturingFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<ManufacturingFilters>(currentFilters);
  const [manufacturingItems, setManufacturingItems] = useState<ManufacturingItem[]>([]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  useEffect(() => {
    if (open) {
      fetchManufacturingItems();
    }
  }, [open]);

  const fetchManufacturingItems = async () => {
    const { data, error } = await supabase
      .from('manufacturing_items')
      .select('id, status, arch_type, upper_appliance_type, lower_appliance_type, material, shade, manufacturing_method, milling_location, inspection_status');

    if (!error && data) {
      setManufacturingItems(data);
    }
  };

  const filterCounts = useMemo(() => {
    const counts = {
      status: {} as Record<string, number>,
      archType: {} as Record<string, number>,
      applianceType: {} as Record<string, number>,
      material: {} as Record<string, number>,
      shade: {} as Record<string, number>,
      manufacturingMethod: {} as Record<string, number>,
      millingLocation: {} as Record<string, number>,
      inspectionStatus: {} as Record<string, number>,
    };

    manufacturingItems.forEach(item => {
      if (item.status) counts.status[item.status] = (counts.status[item.status] || 0) + 1;
      if (item.arch_type) counts.archType[item.arch_type] = (counts.archType[item.arch_type] || 0) + 1;
      if (item.upper_appliance_type) counts.applianceType[item.upper_appliance_type] = (counts.applianceType[item.upper_appliance_type] || 0) + 1;
      if (item.lower_appliance_type) counts.applianceType[item.lower_appliance_type] = (counts.applianceType[item.lower_appliance_type] || 0) + 1;
      if (item.material) counts.material[item.material] = (counts.material[item.material] || 0) + 1;
      if (item.shade) counts.shade[item.shade] = (counts.shade[item.shade] || 0) + 1;
      if (item.manufacturing_method) counts.manufacturingMethod[item.manufacturing_method] = (counts.manufacturingMethod[item.manufacturing_method] || 0) + 1;
      if (item.milling_location) counts.millingLocation[item.milling_location] = (counts.millingLocation[item.milling_location] || 0) + 1;
      if (item.inspection_status) counts.inspectionStatus[item.inspection_status] = (counts.inspectionStatus[item.inspection_status] || 0) + 1;
    });

    return counts;
  }, [manufacturingItems]);

  const handleButtonToggle = (category: keyof ManufacturingFilters, value: string) => {
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
    const emptyFilters: ManufacturingFilters = {
      status: [],
      archType: [],
      applianceType: [],
      material: [],
      shade: [],
      manufacturingMethod: [],
      millingLocation: [],
      inspectionStatus: [],
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
            Filter Manufacturing Items
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount} active</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Status</Label>
            <div className="grid grid-cols-4 gap-2">
              {['pending-printing', 'pending-milling', 'printing', 'milling', 'in-transit', 'inspection', 'completed'].map(status => {
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
              {['upper', 'lower', 'both'].map(archType => {
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

          {/* Manufacturing Method Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Manufacturing Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {['printing', 'milling'].map(method => {
                const count = filterCounts.manufacturingMethod[method] || 0;
                const isSelected = localFilters.manufacturingMethod.includes(method);
                return (
                  <Button
                    key={method}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('manufacturingMethod', method)}
                  >
                    <span className="truncate">{formatLabel(method)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Milling Location Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Milling Location</Label>
            <div className="grid grid-cols-2 gap-2">
              {['in-house', 'micro-dental-lab', 'evolution-dental-lab', 'haus-milling'].map(location => {
                const count = filterCounts.millingLocation[location] || 0;
                const isSelected = localFilters.millingLocation.includes(location);
                return (
                  <Button
                    key={location}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('millingLocation', location)}
                  >
                    <span className="truncate">{formatLabel(location)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Material</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Flexera Smile Ultra Plus', 'Sprint Ray ONX', 'Sprint Ray Nightguard Flex', 'Zirconia', 'PMMA', 'ONX Tough', 'Titanium & Zirconia', 'Titanium'].map(material => {
                const count = filterCounts.material[material] || 0;
                const isSelected = localFilters.material.includes(material);
                return (
                  <Button
                    key={material}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('material', material)}
                  >
                    <span className="truncate text-xs">{material}</span>
                    <Badge variant="secondary" className={`ml-1 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Inspection Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Inspection Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {['approved', 'rejected'].map(status => {
                const count = filterCounts.inspectionStatus[status] || 0;
                const isSelected = localFilters.inspectionStatus.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('inspectionStatus', status)}
                  >
                    <span className="truncate">{formatLabel(status)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
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

