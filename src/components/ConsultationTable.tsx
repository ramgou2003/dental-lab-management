import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Calendar, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { PatientConsultationsDialog } from "@/components/PatientConsultationsDialog";

interface ConsultationAppointment {
  id: string;
  patient_name: string;
  patient_id: string | null;
  consultation_id: string | null;
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
  // Consultation status from consultations table
  consultation_status?: string | null;
}

interface ConsultationPatient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  consultation_date: string;
  consultation_time: string;
  appointment_id: string | null;
  lead_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Treatment decision from consultations table
  treatment_decision?: string | null;
  // Consultation status from consultations table
  consultation_status?: string | null;
}

interface ConsultationTableProps {
  searchTerm: string;
  selectedDate?: Date;
  showScheduledLeads?: boolean;
  refreshTrigger?: number;
  treatmentStatusFilter?: string;
}

export function ConsultationTable({ searchTerm, selectedDate, showScheduledLeads = false, refreshTrigger, treatmentStatusFilter = "all" }: ConsultationTableProps) {
  const [consultationAppointments, setConsultationAppointments] = useState<ConsultationAppointment[]>([]);
  const [consultationPatients, setConsultationPatients] = useState<ConsultationPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { appointments } = useAppointments(); // Get real-time appointments

  const handleViewPatientConsultations = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setIsPatientDialogOpen(true);
  };

  const fetchConsultationAppointments = async () => {
    try {
      setLoading(true);

      if (showScheduledLeads) {
        // For "Patients" tab: Show all consultation patients with treatment decisions
        // First get all consultation patients
        const { data: consultationPatientsData, error: consultationPatientsError } = await supabase
          .from('consultation_patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (consultationPatientsError) {
          throw consultationPatientsError;
        }

        // Get consultation patient IDs
        const patientIds = (consultationPatientsData || []).map(patient => patient.id);

        // Get treatment decisions and consultation status for these patients
        let treatmentDecisions = new Map();
        let consultationStatuses = new Map();
        if (patientIds.length > 0) {
          const { data: consultationsData, error: consultationsError } = await supabase
            .from('consultations')
            .select('consultation_patient_id, treatment_decision, consultation_status')
            .in('consultation_patient_id', patientIds);

          if (!consultationsError && consultationsData) {
            consultationsData.forEach(consultation => {
              treatmentDecisions.set(consultation.consultation_patient_id, consultation.treatment_decision);
              consultationStatuses.set(consultation.consultation_patient_id, consultation.consultation_status);
            });
          }
        }

        // Transform the data to include treatment decisions and consultation status
        const transformedPatients = (consultationPatientsData || []).map(patient => ({
          ...patient,
          treatment_decision: treatmentDecisions.get(patient.id) || null,
          consultation_status: consultationStatuses.get(patient.id) || null
        }));

        setConsultationPatients(transformedPatients);
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

      // Query to get consultation appointments with consultation patient info
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
          created_at,
          assigned_user_id,
          assigned_user:user_profiles!assigned_user_id(full_name)
        `)
        .eq('appointment_type', 'consultation')
        .eq('date', queryDate)
        .order('start_time', { ascending: true });

      if (appointmentsError) {
        throw appointmentsError;
      }

      // Get consultation patient IDs for these appointments
      const appointmentIds = (appointmentsData || []).map(apt => apt.id);
      let consultationPatientsMap = new Map();
      let consultationStatusMap = new Map();

      if (appointmentIds.length > 0) {
        // Get consultation records for these appointments
        const { data: consultationsData, error: consultationError } = await supabase
          .from('consultations')
          .select('id, appointment_id, consultation_patient_id, consultation_status')
          .in('appointment_id', appointmentIds);

        if (!consultationError && consultationsData) {
          consultationsData.forEach(consultation => {
            // Use the consultation record ID as the "Consultation ID" for display
            consultationPatientsMap.set(consultation.appointment_id, consultation.id);
            consultationStatusMap.set(consultation.appointment_id, consultation.consultation_status);
          });
        }
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
            consultation_id: consultationPatientsMap.get(appointment.id) || null,
            appointment_date: appointment.date,
            appointment_time: appointment.start_time,
            appointment_end_time: appointment.end_time,
            appointment_status: appointment.status,
            appointment_type: appointment.appointment_type,
            appointment_notes: appointment.notes,
            created_at: appointment.created_at,
            consultation_status: consultationStatusMap.get(appointment.id) || null,
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

  // Filter data based on search term and treatment status
  const filteredAppointments = showScheduledLeads
    ? consultationPatients.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());

      // Apply treatment status filter
      if (treatmentStatusFilter === "all") {
        return matchesSearch;
      } else if (treatmentStatusFilter === "not_set") {
        return matchesSearch && !patient.treatment_decision;
      } else {
        return matchesSearch && patient.treatment_decision === treatmentStatusFilter;
      }
    })
    : consultationAppointments.filter(appointment => {
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



  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    // Fix: Parse date components to avoid timezone shift
    const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = cleanDateStr.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
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

  const getConsultationStatus = (consultationStatus: string | null | undefined) => {
    if (!consultationStatus) {
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }

    switch (consultationStatus.toLowerCase()) {
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'draft':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const getTreatmentStatusColor = (treatmentDecision: string) => {
    switch (treatmentDecision?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'not_accepted':
        return 'bg-red-100 text-red-800';
      case 'followup-required':
      case 'follow_up_required':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTreatmentDecision = (treatmentDecision: string) => {
    switch (treatmentDecision?.toLowerCase()) {
      case 'accepted':
        return 'Accepted';
      case 'not_accepted':
        return 'Not Accepted';
      case 'followup-required':
      case 'follow_up_required':
        return 'Follow-up Required';
      default:
        return treatmentDecision;
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
                Appointment
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                Status
                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
              </th>
              {showScheduledLeads && (
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                  Treatment Status
                  <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                </th>
              )}
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={showScheduledLeads ? 5 : 4} className="px-6 py-12 text-center">
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
              showScheduledLeads ? (
                // Render consultation patients
                filteredAppointments.map((patient: ConsultationPatient, index) => (
                  <tr key={`${patient.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600">
                            {`${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${patient.first_name} ${patient.last_name}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            Patient ID: {patient.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap relative text-center">
                      <div className="space-y-1 flex flex-col items-center">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(patient.consultation_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(patient.consultation_time)}
                        </div>
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap relative text-center">
                      <div className="flex justify-center">
                        {(() => {
                          const consultationStatus = getConsultationStatus(patient.consultation_status);
                          return (
                            <Badge className={consultationStatus.color}>
                              {consultationStatus.text}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap relative text-center">
                      <div className="flex justify-center">
                        {patient.treatment_decision ? (
                          <Badge className={getTreatmentStatusColor(patient.treatment_decision)}>
                            {formatTreatmentDecision(patient.treatment_decision)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">Not Set</span>
                        )}
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleViewPatientConsultations(
                              patient.id,
                              `${patient.first_name} ${patient.last_name}`
                            );
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Consultations
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Render consultation appointments
                filteredAppointments.map((appointment: ConsultationAppointment, index) => (
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
                            {appointment.consultation_id ? `Consultation ID: ${appointment.consultation_id.slice(0, 8)}...` : 'No Consultation ID'}
                          </div>
                          {appointment.assigned_user?.full_name && (
                            <div className="text-xs text-gray-500 mt-1">
                              👤 Assigned to: {appointment.assigned_user.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap relative text-center">
                      <div className="space-y-1 flex flex-col items-center">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(appointment.appointment_time)} - {formatTime(appointment.appointment_end_time)}
                        </div>
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap relative text-center">
                      <div className="flex justify-center">
                        {(() => {
                          const consultationStatus = getConsultationStatus(appointment.consultation_status);
                          return (
                            <Badge className={consultationStatus.color}>
                              {consultationStatus.text}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/consultation/${appointment.id}`);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Start Consultation
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Consultations Dialog */}
      {selectedPatientId && (
        <PatientConsultationsDialog
          isOpen={isPatientDialogOpen}
          onClose={() => {
            setIsPatientDialogOpen(false);
            setSelectedPatientId(null);
            setSelectedPatientName('');
          }}
          patientId={selectedPatientId}
          patientName={selectedPatientName}
        />
      )}
    </div>
  );
}
