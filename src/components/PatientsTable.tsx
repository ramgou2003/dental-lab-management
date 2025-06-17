
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

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
  const deviceType = useDeviceType();

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

  // Define responsive grid columns based on device type
  const getGridCols = () => {
    if (deviceType === 'mobile') return 'grid-cols-3';
    if (deviceType === 'tablet') return 'grid-cols-6';
    return 'grid-cols-8';
  };

  const getHeaderClasses = () => {
    const baseClasses = "bg-slate-50 border-b border-slate-200 flex-shrink-0";
    if (deviceType === 'tablet') return `${baseClasses} tablet-compact tablet-text-sm`;
    return `${baseClasses} px-4 py-3`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Table Header - Fixed */}
      <div className={getHeaderClasses()}>
        <div className={`grid ${getGridCols()} gap-2 tablet:gap-3 lg:gap-4 text-sm font-medium text-slate-900`}>
          <div className="text-left">Patient Name</div>
          {deviceType !== 'mobile' && <div className="text-left">Phone</div>}
          {deviceType === 'desktop' && <div className="text-left">Gender</div>}
          <div className="text-left">Treatment Type</div>
          {deviceType !== 'mobile' && <div className="text-left">Last Visit</div>}
          {deviceType === 'desktop' && <div className="text-left">Next Appointment</div>}
          <div className="text-left">Status</div>
          <div className="text-center">Actions</div>
        </div>
      </div>

      {/* Table Body - Scrollable */}
      <div className={`flex-1 overflow-y-scroll ${deviceType === 'tablet' ? 'tablet-scrollbar' : 'scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced'}`}>
        <div className="bg-white">
          {filteredPatients.length === 0 ? (
            <div className={`text-center text-slate-500 ${deviceType === 'tablet' ? 'tablet-compact py-6' : 'px-4 py-8'}`}>
              {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search criteria."}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className={`grid ${getGridCols()} gap-2 tablet:gap-3 lg:gap-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center ${deviceType === 'tablet' ? 'tablet-compact tablet-text-sm' : 'px-4 py-4'}`}>
                {/* Patient Name */}
                <div className="flex items-center gap-2 tablet:gap-3">
                  <Avatar className={deviceType === 'tablet' ? 'tablet-avatar-sm' : 'h-10 w-10'}>
                    <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                    <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                      {getInitials(patient.first_name, patient.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-900 text-sm font-medium truncate">{patient.full_name}</span>
                </div>

                {/* Phone - Hidden on mobile */}
                {deviceType !== 'mobile' && (
                  <div className="text-slate-600 text-sm truncate">{patient.phone || '-'}</div>
                )}

                {/* Gender - Desktop only */}
                {deviceType === 'desktop' && (
                  <div className="text-slate-600 text-sm capitalize truncate">{patient.gender || '-'}</div>
                )}

                {/* Treatment Type */}
                <div className="text-slate-600 text-sm truncate">{patient.treatment_type || '-'}</div>

                {/* Last Visit - Hidden on mobile */}
                {deviceType !== 'mobile' && (
                  <div className="text-slate-600 text-sm truncate">{patient.last_visit || '-'}</div>
                )}

                {/* Next Appointment - Desktop only */}
                {deviceType === 'desktop' && (
                  <div className="text-slate-600 text-sm truncate">{patient.next_appointment || '-'}</div>
                )}

                {/* Status */}
                <div>
                  <Button
                    className={`${getStatusButtonColor(patient.status)} rounded-full text-sm font-medium w-full ${deviceType === 'tablet' ? 'tablet-btn-xs px-2 h-7' : 'px-4 h-8'}`}
                    variant="secondary"
                  >
                    {patient.status}
                  </Button>
                </div>

                {/* Actions */}
                <div className="text-center">
                  <Button
                    onClick={() => onViewProfile?.(patient.id)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center ${deviceType === 'tablet' ? 'tablet-btn-sm gap-1' : 'gap-2'}`}
                  >
                    <Eye className="h-4 w-4" />
                    {deviceType !== 'mobile' && 'View Profile'}
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
