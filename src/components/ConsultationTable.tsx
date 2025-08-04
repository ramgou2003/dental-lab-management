import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Calendar, Clock, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConsultationLead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  personal_first_name: string | null;
  personal_last_name: string | null;
  phone: string | null;
  personal_phone: string | null;
  email: string | null;
  personal_email: string | null;
  status: string | null;
  created_at: string;
  appointment_date: string;
  appointment_time: string;
  appointment_status: string;
  appointment_type: string;
  appointment_notes: string | null;
}

interface ConsultationTableProps {
  searchTerm: string;
  refreshTrigger?: number;
}

export function ConsultationTable({ searchTerm, refreshTrigger }: ConsultationTableProps) {
  const [consultationLeads, setConsultationLeads] = useState<ConsultationLead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchConsultationLeads = async () => {
    try {
      setLoading(true);
      
      // Query to get leads with scheduled status
      const { data, error } = await supabase
        .from('new_patient_leads')
        .select(`
          id,
          first_name,
          last_name,
          personal_first_name,
          personal_last_name,
          phone,
          personal_phone,
          email,
          personal_email,
          status,
          created_at,
          reason_for_visit,
          best_contact_time
        `)
        .eq('status', 'scheduled')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: ConsultationLead[] = data?.map((lead: any) => {
        return {
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          personal_first_name: lead.personal_first_name,
          personal_last_name: lead.personal_last_name,
          phone: lead.phone,
          personal_phone: lead.personal_phone,
          email: lead.email,
          personal_email: lead.personal_email,
          status: lead.status,
          created_at: lead.created_at,
          appointment_date: '', // No specific appointment date for scheduled leads
          appointment_time: lead.best_contact_time || '',
          appointment_status: 'scheduled',
          appointment_type: 'consultation',
          appointment_notes: lead.reason_for_visit || null
        };
      }) || [];

      setConsultationLeads(transformedData);
    } catch (error) {
      console.error('Error fetching consultation leads:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationLeads();
  }, [refreshTrigger]);

  // Filter leads based on search term
  const filteredLeads = consultationLeads.filter(lead => {
    const fullName = `${lead.first_name || lead.personal_first_name || ''} ${lead.last_name || lead.personal_last_name || ''}`.toLowerCase();
    const phone = (lead.phone || lead.personal_phone || '').toLowerCase();
    const email = (lead.email || lead.personal_email || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase());
  });

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName || '';
    const last = lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const getFullName = (lead: ConsultationLead) => {
    const firstName = lead.first_name || lead.personal_first_name || '';
    const lastName = lead.last_name || lead.personal_last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
  };

  const getContactInfo = (lead: ConsultationLead) => {
    const phone = lead.phone || lead.personal_phone;
    const email = lead.email || lead.personal_email;
    return { phone, email };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }



  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No scheduled consultations</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No consultations match your search.' : 'No consultation appointments have been scheduled yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => {
              const { phone, email } = getContactInfo(lead);
              
              return (
                <tr key={`${lead.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {getInitials(
                            lead.first_name || lead.personal_first_name,
                            lead.last_name || lead.personal_last_name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getFullName(lead)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Lead ID: {lead.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {phone}
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {lead.appointment_date ? (
                        <>
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(lead.appointment_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(lead.appointment_time)}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-blue-600 font-medium">Scheduled</span>
                          </div>
                          {lead.appointment_time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Best time: {lead.appointment_time}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(lead.appointment_status)}>
                      {lead.appointment_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.appointment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/lead-in/${lead.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Lead
                    </Button>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
