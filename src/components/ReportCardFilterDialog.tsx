import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export interface ReportCardFilters {
  labReportStatus: string[];
  clinicalReportStatus: string[];
  archType: string[];
  applianceType: string[];
  material: string[];
  shade: string[];
}

interface ReportCardItem {
  id: string;
  lab_report_status: string;
  clinical_report_status: string;
  lab_script?: {
    arch_type: string;
    upper_appliance_type: string | null;
    lower_appliance_type: string | null;
    material: string | null;
    shade: string | null;
  };
}

interface ReportCardFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: ReportCardFilters;
  onApplyFilters: (filters: ReportCardFilters) => void;
  onClearFilters: () => void;
}

export function ReportCardFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters,
}: ReportCardFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<ReportCardFilters>(currentFilters);
  const [reportCardItems, setReportCardItems] = useState<ReportCardItem[]>([]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  useEffect(() => {
    if (open) {
      fetchReportCardItems();
    }
  }, [open]);

  const fetchReportCardItems = async () => {
    const { data, error } = await supabase
      .from('report_cards')
      .select(`
        id, lab_report_status, clinical_report_status,
        lab_script:lab_scripts(arch_type, upper_appliance_type, lower_appliance_type, material, shade)
      `);

    if (!error && data) {
      setReportCardItems(data as ReportCardItem[]);
    }
  };

  const filterCounts = useMemo(() => {
    const counts = {
      labReportStatus: {} as Record<string, number>,
      clinicalReportStatus: {} as Record<string, number>,
      archType: {} as Record<string, number>,
      applianceType: {} as Record<string, number>,
      material: {} as Record<string, number>,
      shade: {} as Record<string, number>,
    };

    reportCardItems.forEach(item => {
      if (item.lab_report_status) counts.labReportStatus[item.lab_report_status] = (counts.labReportStatus[item.lab_report_status] || 0) + 1;
      if (item.clinical_report_status) counts.clinicalReportStatus[item.clinical_report_status] = (counts.clinicalReportStatus[item.clinical_report_status] || 0) + 1;
      if (item.lab_script?.arch_type) counts.archType[item.lab_script.arch_type] = (counts.archType[item.lab_script.arch_type] || 0) + 1;
      if (item.lab_script?.upper_appliance_type) counts.applianceType[item.lab_script.upper_appliance_type] = (counts.applianceType[item.lab_script.upper_appliance_type] || 0) + 1;
      if (item.lab_script?.lower_appliance_type) counts.applianceType[item.lab_script.lower_appliance_type] = (counts.applianceType[item.lab_script.lower_appliance_type] || 0) + 1;
      if (item.lab_script?.material) counts.material[item.lab_script.material] = (counts.material[item.lab_script.material] || 0) + 1;
      if (item.lab_script?.shade) counts.shade[item.lab_script.shade] = (counts.shade[item.lab_script.shade] || 0) + 1;
    });

    return counts;
  }, [reportCardItems]);

  const handleButtonToggle = (category: keyof ReportCardFilters, value: string) => {
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
    const emptyFilters: ReportCardFilters = {
      labReportStatus: [],
      clinicalReportStatus: [],
      archType: [],
      applianceType: [],
      material: [],
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
            Filter Report Cards
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount} active</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lab Report Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Lab Report Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {['pending', 'completed'].map(status => {
                const count = filterCounts.labReportStatus[status] || 0;
                const isSelected = localFilters.labReportStatus.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('labReportStatus', status)}
                  >
                    <span className="truncate">{formatLabel(status)}</span>
                    <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : ''}`}>{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Clinical Report Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Clinical Report Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {['pending', 'completed'].map(status => {
                const count = filterCounts.clinicalReportStatus[status] || 0;
                const isSelected = localFilters.clinicalReportStatus.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`justify-between ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-50'}`}
                    onClick={() => handleButtonToggle('clinicalReportStatus', status)}
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

