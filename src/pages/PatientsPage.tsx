
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/AuthGuard";
import { Filter } from "lucide-react";

import { PatientsTable } from "@/components/PatientsTable";
import { NewPatientForm } from "@/components/NewPatientForm";
import { PatientFilterDialog } from "@/components/PatientFilterDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface PatientFilters {
  status: string[];
  treatmentStatus: string[];
  gender: string[];
  patientSource: string[];
  ageRange: { min: number | null; max: number | null };
}

export function PatientsPage() {
  const navigate = useNavigate();
  const { canCreatePatients } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [filters, setFilters] = useState<PatientFilters>({
    status: [],
    treatmentStatus: [],
    gender: [],
    patientSource: [],
    ageRange: { min: null, max: null }
  });

  const handleNewPatient = () => {
    setShowNewPatientForm(true);
  };

  const handleFormSubmit = (patientData: any) => {
    console.log("New patient data:", patientData);
    setShowNewPatientForm(false);
    // Trigger a refresh of the patients table
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowNewPatientForm(false);
  };

  const handleViewProfile = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handlePatientCountChange = (count: number) => {
    setPatientCount(count);
  };

  const handleFilterClick = () => {
    setShowFilterDialog(true);
  };

  const handleApplyFilters = (newFilters: PatientFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      treatmentStatus: [],
      gender: [],
      patientSource: [],
      ageRange: { min: null, max: null }
    });
  };

  // Count active filters
  const activeFilterCount =
    filters.status.length +
    filters.treatmentStatus.length +
    filters.gender.length +
    filters.patientSource.length +
    (filters.ageRange.min !== null || filters.ageRange.max !== null ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Patients"
          badge={patientCount}
          search={{
            placeholder: "Search patients by name, ID, or phone",
            value: searchTerm,
            onChange: setSearchTerm
          }}
          secondaryAction={{
            label: activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters",
            icon: Filter,
            onClick: handleFilterClick
          }}
          action={canCreatePatients() ? {
            label: "Add Patient",
            onClick: handleNewPatient
          } : undefined}
        />
      </div>
      <div className="flex-1 px-4 pt-4">
        {/* Patients Table - Extended to viewport height */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 112px)', minHeight: '500px' }}>
          <PatientsTable
            searchTerm={searchTerm}
            activeTab="all"
            refreshTrigger={refreshTrigger}
            onViewProfile={handleViewProfile}
            onPatientCountChange={handlePatientCountChange}
            filters={filters}
          />
        </div>
      </div>

      <Dialog open={showNewPatientForm} onOpenChange={setShowNewPatientForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <NewPatientForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <PatientFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
