
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  phone: string | null;
  gender: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  treatment_type: string | null;
  last_visit: string | null;
  next_appointment: string | null;
  status: string;
  profile_picture?: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientsTableProps {
  searchTerm: string;
  activeTab: string;
  refreshTrigger?: number;
  onViewProfile?: (patientId: string) => void;
}

export function PatientsTable({ searchTerm, activeTab, refreshTrigger, onViewProfile }: PatientsTableProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.phone && patient.phone.includes(searchTerm)) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;

    // Map tab IDs to status values
    const statusMap: { [key: string]: string } = {
      "not-started": "Treatment not started",
      "in-progress": "Treatment in progress",
      "completed": "Treatment completed",
      "deceased": "Patient deceased"
    };

    return matchesSearch && patient.status === statusMap[activeTab];
  });

  const getStatusButtonColor = (status: string) => {
    switch (status) {
      case "Treatment not started":
        return "bg-yellow-200 text-yellow-900 hover:bg-yellow-300";
      case "Treatment in progress":
        return "bg-blue-200 text-blue-900 hover:bg-blue-300";
      case "Treatment completed":
        return "bg-green-200 text-green-900 hover:bg-green-300";
      case "Patient deceased":
        return "bg-gray-200 text-gray-900 hover:bg-gray-300";
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
      {/* Table Header - Fixed */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 tablet:px-2 py-3 tablet:py-2 flex-shrink-0" style={{ paddingRight: 'calc(12px + 8px)' }}>
        <div className="grid grid-cols-6 gap-4 tablet:gap-2 text-sm tablet:text-xs font-medium text-slate-900 h-6 tablet:h-5">
          <div className="text-left border-r border-gray-300 pr-4 tablet:pr-2 flex items-center">Patient Name</div>
          <div className="text-center border-r border-gray-300 pr-4 tablet:pr-2 flex items-center justify-center">Phone</div>
          <div className="text-center border-r border-gray-300 pr-4 tablet:pr-2 flex items-center justify-center">Gender</div>
          <div className="text-center border-r border-gray-300 pr-4 tablet:pr-2 flex items-center justify-center">Treatment Type</div>
          <div className="text-center border-r border-gray-300 pr-4 tablet:pr-2 flex items-center justify-center">Status</div>
          <div className="text-center flex items-center justify-center pr-2 tablet:pr-1">Actions</div>
        </div>
      </div>

      {/* Table Body - Scrollable */}
      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
        <div className="bg-white">
          {filteredPatients.length === 0 ? (
            <div className="px-3 py-8 text-center text-slate-500">
              {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search criteria."}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="grid grid-cols-6 gap-4 tablet:gap-2 px-3 tablet:px-2 py-4 tablet:py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center h-16 tablet:h-12">
                {/* Patient Name */}
                <div className="border-r border-gray-300 pr-4 tablet:pr-2 h-full flex items-center">
                  <div className="flex items-center gap-3 tablet:gap-2">
                    <Avatar className="h-10 w-10 tablet:h-8 tablet:w-8">
                      <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                      <AvatarFallback className="bg-indigo-600 text-white font-semibold tablet:text-xs">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900 text-sm tablet:text-xs font-medium truncate">{patient.full_name}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="text-slate-600 text-sm tablet:text-xs text-center border-r border-gray-300 pr-4 tablet:pr-2 h-full flex items-center justify-center truncate">{patient.phone || '-'}</div>

                {/* Gender */}
                <div className="text-slate-600 text-sm tablet:text-xs text-center border-r border-gray-300 pr-4 tablet:pr-2 h-full flex items-center justify-center capitalize truncate">{patient.gender || '-'}</div>

                {/* Treatment Type */}
                <div className="text-slate-600 text-sm tablet:text-xs text-center border-r border-gray-300 pr-4 tablet:pr-2 h-full flex items-center justify-center truncate">{patient.treatment_type || '-'}</div>

                {/* Status */}
                <div className="border-r border-gray-300 pr-4 tablet:pr-2 h-full flex items-center justify-center">
                  <Button
                    className={`${getStatusButtonColor(patient.status)} rounded-full px-4 tablet:px-2 h-8 tablet:h-6 text-sm tablet:text-xs font-medium`}
                    variant="secondary"
                  >
                    {patient.status}
                  </Button>
                </div>

                {/* Actions */}
                <div className="h-full flex items-center justify-center pr-2 tablet:pr-1">
                  <Button
                    onClick={() => onViewProfile?.(patient.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 tablet:gap-1 tablet:px-2 tablet:py-1 tablet:text-xs"
                  >
                    <Eye className="h-4 w-4 tablet:h-3 tablet:w-3" />
                    <span className="tablet:hidden">View Profile</span>
                    <span className="hidden tablet:inline">View</span>
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
