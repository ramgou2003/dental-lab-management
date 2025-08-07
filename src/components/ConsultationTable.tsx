import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Calendar, Clock, Phone, Mail, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";

interface ConsultationAppointment {
  id: string;
  patient_name: string;
  patient_id: string | null;
  appointment_date: string;
  appointment_time: string;
  appointment_end_time: string;
  appointment_status: string;
  appointment_type: string;
  appointment_notes: string | null;
  created_at: string;
  // Lead information (if available)
  lead_id: string | null;
  phone: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface ConsultationTableProps {
  searchTerm: string;
  selectedDate?: Date;
  showScheduledLeads?: boolean;
  refreshTrigger?: number;
}

export function ConsultationTable({ searchTerm, selectedDate, showScheduledLeads = false, refreshTrigger }: ConsultationTableProps) {
  const [consultationAppointments, setConsultationAppointments] = useState<ConsultationAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { appointments } = useAppointments(); // Get real-time appointments

  const fetchConsultationAppointments = async () => {
    try {
      setLoading(true);

      if (showScheduledLeads) {
        // For "Patients" tab: Show scheduled leads (not yet fixed appointments)
        const { data: leadsData, error: leadsError } = await supabase
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

        if (leadsError) {
          throw leadsError;
        }

        // Transform leads data to match our interface
        const transformedLeads: ConsultationAppointment[] = (leadsData || []).map((lead: any) => ({
          id: lead.id,
          patient_name: `${lead.first_name || lead.personal_first_name || ''} ${lead.last_name || lead.personal_last_name || ''}`.trim() || 'Unknown Patient',
          patient_id: null,
          appointment_date: '', // No specific date for scheduled leads
          appointment_time: lead.best_contact_time || '',
          appointment_end_time: '',
          appointment_status: 'scheduled',
          appointment_type: 'consultation',
          appointment_notes: lead.reason_for_visit || null,
          created_at: lead.created_at,
          lead_id: lead.id,
          phone: lead.phone || lead.personal_phone,
          email: lead.email || lead.personal_email,
          first_name: lead.first_name || lead.personal_first_name,
          last_name: lead.last_name || lead.personal_last_name
        }));

        setConsultationAppointments(transformedLeads);
        return;
      }

      // For "Consultations" tab: Show actual fixed appointments with date filtering
      // Format selected date for database query (YYYY-MM-DD)
      const formatDateForQuery = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const queryDate = selectedDate ? formatDateForQuery(selectedDate) : formatDateForQuery(new Date());

      // Query to get consultation appointments from the appointments table for the selected date
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_id,
          date,
          start_time,
          end_time,
          status,
          appointment_type,
          notes,
          created_at
        `)
        .eq('appointment_type', 'consultation')
        .eq('date', queryDate)
        .order('start_time', { ascending: true });

      if (appointmentsError) {
        throw appointmentsError;
      }

      // For appointments with patient_id = null (lead appointments), try to get lead info
      const appointmentsWithLeadInfo = await Promise.all(
        (appointmentsData || []).map(async (appointment: any) => {
          let leadInfo = {
            lead_id: null,
            phone: null,
            email: null,
            first_name: null,
            last_name: null
          };

          // If patient_id is null, this is likely a lead appointment
          if (!appointment.patient_id && appointment.notes) {
            // Extract lead ID from notes if available
            const leadIdMatch = appointment.notes.match(/Lead ID: ([a-f0-9-]+)/);
            if (leadIdMatch) {
              const leadId = leadIdMatch[1];

              // Fetch lead information
              const { data: leadData, error: leadError } = await supabase
                .from('new_patient_leads')
                .select('id, first_name, last_name, personal_first_name, personal_last_name, phone, personal_phone, email, personal_email')
                .eq('id', leadId)
                .single();

              if (!leadError && leadData) {
                leadInfo = {
                  lead_id: leadData.id,
                  phone: leadData.phone || leadData.personal_phone,
                  email: leadData.email || leadData.personal_email,
                  first_name: leadData.first_name || leadData.personal_first_name,
                  last_name: leadData.last_name || leadData.personal_last_name
                };
              }
            }
          } else if (appointment.patient_id) {
            // For existing patients, get their contact info
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('phone, email, first_name, last_name')
              .eq('id', appointment.patient_id)
              .single();

            if (!patientError && patientData) {
              leadInfo = {
                lead_id: null,
                phone: patientData.phone,
                email: patientData.email,
                first_name: patientData.first_name,
                last_name: patientData.last_name
              };
            }
          }

          return {
            id: appointment.id,
            patient_name: appointment.patient_name,
            patient_id: appointment.patient_id,
            appointment_date: appointment.date,
            appointment_time: appointment.start_time,
            appointment_end_time: appointment.end_time,
            appointment_status: appointment.status,
            appointment_type: appointment.appointment_type,
            appointment_notes: appointment.notes,
            created_at: appointment.created_at,
            ...leadInfo
          };
        })
      );

      setConsultationAppointments(appointmentsWithLeadInfo);
    } catch (error) {
      console.error('Error fetching consultation appointments:', error);
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
    fetchConsultationAppointments();
  }, [refreshTrigger, selectedDate, showScheduledLeads]);

  // Update consultation appointments when real-time appointments change
  useEffect(() => {
    const consultationAppts = appointments.filter(apt => apt.type === 'consultation');
    if (consultationAppts.length > 0) {
      // Re-fetch to get the latest data with lead information
      fetchConsultationAppointments();
    }
  }, [appointments]);

  // Filter appointments based on search term
  const filteredAppointments = consultationAppointments.filter(appointment => {
    const fullName = `${appointment.first_name || ''} ${appointment.last_name || ''}`.toLowerCase();
    const patientName = appointment.patient_name.toLowerCase();
    const phone = (appointment.phone || '').toLowerCase();
    const email = (appointment.email || '').toLowerCase();

    return fullName.includes(searchTerm.toLowerCase()) ||
           patientName.includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase());
  });

  const getInitials = (firstName: string | null, lastName: string | null, patientName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    // Fallback to patient name if first/last names not available
    if (patientName) {
      const names = patientName.split(' ');
      return names.length > 1
        ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
        : `${names[0].charAt(0)}${names[0].charAt(1) || ''}`.toUpperCase();
    }
    return 'UN';
  };

  const getDisplayName = (appointment: ConsultationAppointment) => {
    if (appointment.first_name && appointment.last_name) {
      return `${appointment.first_name} ${appointment.last_name}`;
    }
    return appointment.patient_name || 'Unknown Patient';
  };

  const getContactInfo = (appointment: ConsultationAppointment) => {
    return {
      phone: appointment.phone,
      email: appointment.email
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
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
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Patient
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Contact
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Appointment
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Status
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Type
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {showScheduledLeads ? 'No scheduled patients' : 'No scheduled consultations'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {showScheduledLeads
                        ? (searchTerm ? 'No scheduled patients match your search.' : 'No patients have been scheduled for consultation yet.')
                        : (searchTerm
                          ? 'No consultations match your search for this date.'
                          : `No consultation appointments scheduled for ${selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'today'}.`
                        )
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment, index) => {
              const { phone, email } = getContactInfo(appointment);
              
              return (
                <tr key={`${appointment.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {getInitials(
                            appointment.first_name,
                            appointment.last_name,
                            appointment.patient_name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getDisplayName(appointment)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.lead_id ? `Lead ID: ${appointment.lead_id.slice(0, 8)}...` : `Patient ID: ${appointment.patient_id?.slice(0, 8)}...`}
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative text-center">
                    <div className="space-y-1 flex flex-col items-center">
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
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative text-center">
                    <div className="space-y-1 flex flex-col items-center">
                      {showScheduledLeads ? (
                        // For scheduled leads - show "Scheduled" status
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-blue-600 font-medium">Scheduled</span>
                          </div>
                          {appointment.appointment_time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Best time: {appointment.appointment_time}
                            </div>
                          )}
                        </div>
                      ) : (
                        // For fixed appointments - show actual date and time
                        <>
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(appointment.appointment_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointment.appointment_time)} - {formatTime(appointment.appointment_end_time)}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative text-center">
                    <div className="flex justify-center">
                      <Badge className={getStatusColor(appointment.appointment_status)}>
                        {appointment.appointment_status}
                      </Badge>
                    </div>
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 relative text-center">
                    {appointment.appointment_type}
                    <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (showScheduledLeads) {
                            // For Patients tab (scheduled leads) - go to lead page
                            if (appointment.lead_id) {
                              navigate(`/lead-in/${appointment.lead_id}`);
                            } else if (appointment.patient_id) {
                              navigate(`/patients/${appointment.patient_id}`);
                            }
                          } else {
                            // For Consultations tab - start consultation session
                            navigate(`/consultation/${appointment.id}`);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        {showScheduledLeads ? (
                          <>
                            <Eye className="h-3 w-3" />
                            {appointment.lead_id ? 'View Lead' : 'View Patient'}
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            Start Consultation
                          </>
                        )}
                      </Button>
                    </div>
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
