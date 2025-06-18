
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
      {/* Table Header - Fixed with proper responsive columns */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="grid text-sm font-medium text-slate-900 h-6 gap-2 lg:gap-4"
             style={{
               gridTemplateColumns: 'minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(80px, 0.8fr) minmax(140px, 1.4fr) minmax(140px, 1.4fr) minmax(120px, 1.2fr)'
             }}>
          <div className="text-left flex items-center px-2">
            <span className="truncate">Patient Name</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate">Phone</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate">Gender</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate">Treatment Type</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate">Status</span>
          </div>
          <div className="text-center flex items-center justify-center px-2">
            <span className="truncate">Actions</span>
          </div>
        </div>
      </div>

      {/* Table Body - Scrollable with matching column structure */}
      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
        <div className="bg-white">
          {filteredPatients.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search criteria."}
            </div>
          ) : (
            filteredPatients.map((patient, index) => (
              <div key={patient.id}
                   className={`grid gap-2 lg:gap-4 px-4 py-3 transition-colors items-center min-h-[64px] ${
                     index !== filteredPatients.length - 1 ? 'border-b border-slate-100' : ''
                   } hover:bg-slate-50`}
                   style={{
                     gridTemplateColumns: 'minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(80px, 0.8fr) minmax(140px, 1.4fr) minmax(140px, 1.4fr) minmax(120px, 1.2fr)'
                   }}>

                {/* Patient Name */}
                <div className="flex items-center px-2 min-w-0 border-r border-gray-200">
                  <div className="flex items-center gap-3 min-w-0">
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

                {/* Treatment Type */}
                <div className="text-slate-600 text-sm text-center px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <span className="truncate">{patient.treatment_type || '-'}</span>
                </div>

                {/* Status */}
                <div className="px-2 flex items-center justify-center min-w-0 border-r border-gray-200">
                  <Button
                    className={`${getStatusButtonColor(patient.status)} rounded-full px-3 h-7 text-xs font-medium min-w-0 max-w-full`}
                    variant="secondary"
                  >
                    <span className="truncate">
                      {patient.status.replace('Treatment ', '').replace('Patient ', '')}
                    </span>
                  </Button>
                </div>

                {/* Actions */}
                <div className="px-2 flex items-center justify-center min-w-0">
                  <Button
                    onClick={() => onViewProfile?.(patient.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-8 px-3 text-xs min-w-0"
                  >
                    <Eye className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">View Profile</span>
                    <span className="sm:hidden truncate">View</span>
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
