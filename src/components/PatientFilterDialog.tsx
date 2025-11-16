import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PatientFilters } from "@/pages/PatientsPage";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  status: string | null;
  treatment_status: string | null;
  gender: string | null;
  patient_source: string | null;
  date_of_birth: string;
}

interface PatientFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: PatientFilters;
  onApplyFilters: (filters: PatientFilters) => void;
  onClearFilters: () => void;
}

export function PatientFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onClearFilters
}: PatientFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<PatientFilters>(currentFilters);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  // Fetch all patients when dialog opens
  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, status, treatment_status, gender, patient_source, date_of_birth');

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate counts for each filter option
  const filterCounts = useMemo(() => {
    const counts = {
      status: {} as Record<string, number>,
      treatmentStatus: {} as Record<string, number>,
      gender: {} as Record<string, number>,
      patientSource: {} as Record<string, number>
    };

    patients.forEach(patient => {
      // Count status
      const status = patient.status || 'Unknown';
      counts.status[status] = (counts.status[status] || 0) + 1;

      // Count treatment status
      const treatmentStatus = patient.treatment_status || 'Unknown';
      counts.treatmentStatus[treatmentStatus] = (counts.treatmentStatus[treatmentStatus] || 0) + 1;

      // Count gender
      const gender = patient.gender || 'Unknown';
      counts.gender[gender] = (counts.gender[gender] || 0) + 1;

      // Count patient source
      const source = patient.patient_source || 'Unknown';
      counts.patientSource[source] = (counts.patientSource[source] || 0) + 1;
    });

    return counts;
  }, [patients]);

  const handleButtonToggle = (category: keyof PatientFilters, value: string) => {
    setLocalFilters(prev => {
      const currentArray = prev[category] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [category]: newArray };
    });
  };

  const handleAgeRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    setLocalFilters(prev => ({
      ...prev,
      ageRange: { ...prev.ageRange, [type]: numValue }
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const emptyFilters: PatientFilters = {
      status: [],
      treatmentStatus: [],
      gender: [],
      patientSource: [],
      ageRange: { min: null, max: null }
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">Filter Patients</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Patient Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {['ACTIVE', 'INACTIVE'].map(status => {
                const count = filterCounts.status[status] || 0;
                const isSelected = localFilters.status.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('status', status)}
                  >
                    <span>{status}</span>
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

          {/* Treatment Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Treatment Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Treatment Not Started',
                'Treatment In Progress',
                'Treatment Completed',
                'Patient Deceased',
                'Dismissed DNC'
              ].map(status => {
                const count = filterCounts.treatmentStatus[status] || 0;
                const isSelected = localFilters.treatmentStatus.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between text-left ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('treatmentStatus', status)}
                  >
                    <span className="truncate">{status}</span>
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

          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Gender</Label>
            <div className="grid grid-cols-2 gap-3">
              {['male', 'female'].map(gender => {
                const count = filterCounts.gender[gender] || 0;
                const isSelected = localFilters.gender.includes(gender);
                return (
                  <Button
                    key={gender}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between capitalize ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('gender', gender)}
                  >
                    <span>{gender}</span>
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

          {/* Patient Source Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Patient Source</Label>
            <div className="grid grid-cols-3 gap-3">
              {['Consult', 'Direct', 'Import'].map(source => {
                const count = filterCounts.patientSource[source] || 0;
                const isSelected = localFilters.patientSource.includes(source);
                return (
                  <Button
                    key={source}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleButtonToggle('patientSource', source)}
                  >
                    <span>{source}</span>
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

          {/* Age Range Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Age Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age-min" className="text-sm text-gray-600">Min Age</Label>
                <Input
                  id="age-min"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="150"
                  value={localFilters.ageRange.min ?? ''}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-max" className="text-sm text-gray-600">Max Age</Label>
                <Input
                  id="age-max"
                  type="number"
                  placeholder="150"
                  min="0"
                  max="150"
                  value={localFilters.ageRange.max ?? ''}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleClear}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Clear All Filters
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

