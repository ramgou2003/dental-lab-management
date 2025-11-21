import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LabScriptFilters } from "@/pages/LabPage";
import { supabase } from "@/integrations/supabase/client";

interface LabScript {
  id: string;
  status: string;
  arch_type: string;
  upper_treatment_type: string | null;
  lower_treatment_type: string | null;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  screw_type: string | null;
  material: string | null;
}

interface LabScriptFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: LabScriptFilters;
  onApplyFilters: (filters: LabScriptFilters) => void;
  onClearFilters: () => void;
}

export function LabScriptFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters
}: LabScriptFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<LabScriptFilters>(currentFilters);
  const [labScripts, setLabScripts] = useState<LabScript[]>([]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  // Fetch all lab scripts when dialog opens
  useEffect(() => {
    if (open) {
      fetchLabScripts();
    }
  }, [open]);

  const fetchLabScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_scripts')
        .select('id, status, arch_type, upper_treatment_type, lower_treatment_type, upper_appliance_type, lower_appliance_type, screw_type, material');

      if (error) {
        console.error('Error fetching lab scripts:', error);
        return;
      }

      setLabScripts(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calculate counts for each filter option
  const filterCounts = useMemo(() => {
    const counts = {
      status: {} as Record<string, number>,
      archType: {} as Record<string, number>,
      treatmentType: {} as Record<string, number>,
      applianceType: {} as Record<string, number>,
      screwType: {} as Record<string, number>,
      material: {} as Record<string, number>
    };

    labScripts.forEach(script => {
      // Count status
      counts.status[script.status] = (counts.status[script.status] || 0) + 1;

      // Count arch type
      counts.archType[script.arch_type] = (counts.archType[script.arch_type] || 0) + 1;

      // Count treatment types
      if (script.upper_treatment_type) {
        counts.treatmentType[script.upper_treatment_type] = (counts.treatmentType[script.upper_treatment_type] || 0) + 1;
      }
      if (script.lower_treatment_type) {
        counts.treatmentType[script.lower_treatment_type] = (counts.treatmentType[script.lower_treatment_type] || 0) + 1;
      }

      // Count appliance types
      if (script.upper_appliance_type) {
        counts.applianceType[script.upper_appliance_type] = (counts.applianceType[script.upper_appliance_type] || 0) + 1;
      }
      if (script.lower_appliance_type) {
        counts.applianceType[script.lower_appliance_type] = (counts.applianceType[script.lower_appliance_type] || 0) + 1;
      }

      // Count screw type
      if (script.screw_type) {
        counts.screwType[script.screw_type] = (counts.screwType[script.screw_type] || 0) + 1;
      }

      // Count material
      if (script.material) {
        counts.material[script.material] = (counts.material[script.material] || 0) + 1;
      }
    });

    return counts;
  }, [labScripts]);

  const handleButtonToggle = (category: keyof LabScriptFilters, value: string) => {
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
    const emptyFilters: LabScriptFilters = {
      status: [],
      archType: [],
      treatmentType: [],
      applianceType: [],
      screwType: [],
      material: []
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">Filter Lab Scripts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Status</Label>
            <div className="grid grid-cols-3 gap-3">
              {['pending', 'in-progress', 'hold', 'delayed', 'completed'].map(status => {
                const count = filterCounts.status[status] || 0;
                const isSelected = localFilters.status.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between capitalize ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('status', status)}
                  >
                    <span className="truncate">{status.replace('-', ' ')}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Arch Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Arch Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {['upper', 'lower', 'dual'].map(archType => {
                const count = filterCounts.archType[archType] || 0;
                const isSelected = localFilters.archType.includes(archType);
                return (
                  <Button
                    key={archType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between capitalize ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('archType', archType)}
                  >
                    <span>{archType}</span>
                    <Badge variant="secondary" className={`ml-2 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Treatment Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Treatment Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {['full-arch-fixed', 'denture', 'single-implant', 'multiple-implants', 'nightguard'].map(treatmentType => {
                const count = filterCounts.treatmentType[treatmentType] || 0;
                const isSelected = localFilters.treatmentType.includes(treatmentType);
                return (
                  <Button
                    key={treatmentType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('treatmentType', treatmentType)}
                  >
                    <span className="truncate capitalize">{treatmentType.replace(/-/g, ' ')}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Appliance Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Appliance Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'surgical-day-appliance',
                'printed-tryin',
                'night-guard',
                'direct-load-pmma',
                'direct-load-zirconia',
                'ti-bar-superstructure',
                'crown',
                'bridge',
                'denture',
                'retainer',
                'custom-abutment-crown'
              ].map(applianceType => {
                const count = filterCounts.applianceType[applianceType] || 0;
                const isSelected = localFilters.applianceType.includes(applianceType);
                return (
                  <Button
                    key={applianceType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('applianceType', applianceType)}
                  >
                    <span className="truncate capitalize text-left">{applianceType.replace(/-/g, ' ')}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Screw Type Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Screw Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {['DC Screw', 'Rosen', 'Locator', 'Custom'].map(screwType => {
                const count = filterCounts.screwType[screwType] || 0;
                const isSelected = localFilters.screwType.includes(screwType);
                return (
                  <Button
                    key={screwType}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('screwType', screwType)}
                  >
                    <span className="truncate">{screwType}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Material</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Flexera Smile Ultra Plus',
                'Sprint Ray ONX',
                'Sprint Ray Nightguard Flex',
                'Flexera Model X',
                'Zirconia',
                'PMMA',
                'ONX Tough',
                'Titanium & Zirconia',
                'Titanium'
              ].map(material => {
                const count = filterCounts.material[material] || 0;
                const isSelected = localFilters.material.includes(material);
                return (
                  <Button
                    key={material}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('material', material)}
                  >
                    <span className="truncate text-left">{material}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

