
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/AuthGuard";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { PatientFilters } from "@/pages/PatientsPage";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  chart_number: string | null;
  status: string | null;
  treatment_status: string | null;
  treatment_type: string | null;
  upper_arch: boolean | null;
  lower_arch: boolean | null;
  upper_treatment: string | null;
  lower_treatment: string | null;
  upper_surgery_date: string | null;
  lower_surgery_date: string | null;
  profile_picture?: string | null;
  patient_source: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientsTableProps {
  searchTerm: string;
  activeTab: string;
  refreshTrigger?: number;
  onViewProfile?: (patientId: string) => void;
  onPatientCountChange?: (count: number) => void;
  filters?: PatientFilters;
}

export function PatientsTable({ searchTerm, activeTab, refreshTrigger, onViewProfile, onPatientCountChange, filters }: PatientsTableProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    if (onPatientCountChange) {
      onPatientCountChange(patients.length);
    }
  }, [patients, onPatientCountChange]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to fetch patients",
          variant: "destructive",
        });
        return;
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
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

  const filteredPatients = patients.filter(patient => {
    // Search filter
    const matchesSearch = patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.phone && patient.phone.includes(searchTerm)) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Active tab filter
    if (activeTab !== "all") {
      const statusMap: { [key: string]: string } = {
        "active": "ACTIVE",
        "inactive": "INACTIVE"
      };
      if (patient.status !== statusMap[activeTab]) return false;
    }

    // Apply advanced filters if provided
    if (filters) {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(patient.status || '')) {
        return false;
      }

      // Treatment status filter
      if (filters.treatmentStatus.length > 0 && !filters.treatmentStatus.includes(patient.treatment_status || '')) {
        return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(patient.gender || '')) {
        return false;
      }

      // Patient source filter
      if (filters.patientSource.length > 0 && !filters.patientSource.includes(patient.patient_source || '')) {
        return false;
      }

      // Age range filter
      if (filters.ageRange.min !== null || filters.ageRange.max !== null) {
        const age = calculateAge(patient.date_of_birth);
        if (filters.ageRange.min !== null && age < filters.ageRange.min) {
          return false;
        }
        if (filters.ageRange.max !== null && age > filters.ageRange.max) {
          return false;
        }
      }
    }

    return true;
  });

  // Apply sorting (always sorted)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const nameA = a.full_name?.toLowerCase() || '';
    const nameB = b.full_name?.toLowerCase() || '';
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const getStatusButtonColor = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-200 text-green-900 hover:bg-green-300";
      case "INACTIVE":
        return "bg-red-200 text-red-900 hover:bg-red-300";
      case null:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200";
      default:
        return "bg-slate-200 text-slate-900 hover:bg-slate-300";
    }
  };

  const getTreatmentStatusColor = (treatmentStatus: string | null) => {
    switch (treatmentStatus) {
      case "Treatment Not Started":
        return "bg-gray-200 text-gray-900 hover:bg-gray-300";
      case "Treatment In Progress":
        return "bg-blue-200 text-blue-900 hover:bg-blue-300";
      case "Treatment Completed":
        return "bg-green-200 text-green-900 hover:bg-green-300";
      case "Patient Deceased":
        return "bg-black text-white hover:bg-gray-800";
      case "Dismissed DNC":
        return "bg-red-200 text-red-900 hover:bg-red-300";
      case null:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200";
      default:
        return "bg-slate-200 text-slate-900 hover:bg-slate-300";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };



  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-8 text-center">
            <p className="text-slate-600">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Header - Fixed with proper responsive columns */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex-shrink-0 table-header">
        <div className="grid text-sm font-bold text-blue-600 h-6 gap-2 lg:gap-4"
             style={{
               gridTemplateColumns: 'minmax(200px, 2.5fr) minmax(120px, 1.3fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(120px, 1.3fr) minmax(150px, 1.5fr)'
             }}>
          <div className="text-center flex items-center justify-center px-2 border-r border-slate-300 relative">
            <span className="truncate uppercase">PATIENT NAME</span>
            <button
              onClick={handleSort}
              className="absolute right-2 flex-shrink-0 hover:bg-blue-50 rounded p-1.5 transition-colors border border-transparent hover:border-blue-200"
              title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
            >
              {sortOrder === 'asc' && <ArrowUp className="h-5 w-5 text-blue-600" />}
              {sortOrder === 'desc' && <ArrowDown className="h-5 w-5 text-blue-600" />}
            </button>
          </div>
          <div className="text-center flex items-center justify-center px-2 border-r border-slate-300">
            <span className="truncate uppercase">PHONE</span>
          </div>
          <div className="text-center flex items-center justify-center px-2 border-r border-slate-300">
            <span className="truncate uppercase">GENDER</span>
          </div>
          <div className="text-center flex items-center justify-center px-2 border-r border-slate-300">
            <span className="truncate uppercase">SOURCE</span>
          </div>
          <div className="text-center flex items-center justify-center px-2 border-r border-slate-300">
            <span className="truncate uppercase">STATUS</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate uppercase">TREATMENT STATUS</span>
          </div>
        </div>
      </div>

      {/* Table Body - Scrollable with matching column structure */}
      <div className="flex-1 overflow-y-auto scrollbar-enhanced table-body">
        <div className="bg-white">
          {sortedPatients.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search criteria."}
            </div>
          ) : (
            sortedPatients.map((patient, index) => (
              <div key={patient.id}
                   className={`grid gap-2 lg:gap-4 px-4 py-3 transition-colors items-center min-h-[64px] ${
                     index !== sortedPatients.length - 1 ? 'border-b border-slate-100' : ''
                   } hover:bg-slate-50`}
                   style={{
                     gridTemplateColumns: 'minmax(200px, 2.5fr) minmax(120px, 1.3fr) minmax(80px, 0.8fr) minmax(100px, 1fr) minmax(120px, 1.3fr) minmax(150px, 1.5fr)'
                   }}>

                {/* Patient Name */}
                <div className="flex items-center px-2 min-w-0 border-r border-gray-200">
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onViewProfile?.(patient.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewProfile?.(patient.id);
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                      <AvatarFallback className="bg-indigo-600 text-white font-semibold text-xs">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900 text-sm font-medium truncate min-w-0">
                      {patient.full_name}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="text-slate-600 text-sm text-center px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <span className="truncate">{patient.phone || '-'}</span>
                </div>

                {/* Gender */}
                <div className="text-slate-600 text-sm text-center px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <span className="truncate capitalize">{patient.gender || '-'}</span>
                </div>

                {/* Patient Source */}
                <div className="text-slate-600 text-sm text-center px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <span className={`truncate font-medium ${patient.patient_source === 'Consult' ? 'text-blue-600' : 'text-green-600'}`}>
                    {patient.patient_source || '-'}
                  </span>
                </div>

                {/* Status */}
                <div className="px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <Button
                    className={`${getStatusButtonColor(patient.status)} rounded-full px-3 h-7 text-xs font-medium min-w-0 max-w-full`}
                    variant="secondary"
                  >
                    <span className="truncate">
                      {patient.status || 'No Status'}
                    </span>
                  </Button>
                </div>

                {/* Treatment Status */}
                <div className="px-2 flex items-center justify-center min-w-0">
                  <Button
                    className={`${getTreatmentStatusColor(patient.treatment_status)} rounded-full px-3 h-7 text-xs font-medium min-w-0 max-w-full`}
                    variant="secondary"
                  >
                    <span className="truncate">
                      {patient.treatment_status || '-'}
                    </span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
