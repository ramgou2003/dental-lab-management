
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
    <div className="px-4 py-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Patient Name</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Phone</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Gender</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Treatment Type</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Last Visit</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Next Appointment</th>
              <th className="px-4 py-3 text-left text-slate-900 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-center text-slate-900 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search criteria."}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                        <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                          {getInitials(patient.first_name, patient.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-900 text-sm font-medium">{patient.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 text-sm">{patient.phone || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 text-sm capitalize">{patient.gender || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 text-sm">{patient.treatment_type || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 text-sm">{patient.last_visit || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 text-sm">{patient.next_appointment || '-'}</td>
                  <td className="px-4 py-4">
                    <Button
                      className={`${getStatusButtonColor(patient.status)} rounded-full px-4 h-8 text-sm font-medium w-full`}
                      variant="secondary"
                    >
                      {patient.status}
                    </Button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      onClick={() => onViewProfile?.(patient.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
