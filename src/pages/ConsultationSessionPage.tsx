import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MapPin, Heart, DollarSign, FileText, AlertCircle, CheckCircle, XCircle, Info, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { NewPatientPacketForm, NewPatientPacketFormRef } from "@/components/NewPatientPacketForm";
import { FilledPatientPacketViewer } from "@/components/FilledPatientPacketViewer";
import { PatientSummaryAI } from "@/components/PatientSummaryAI";
import { TreatmentForm } from "@/components/TreatmentForm";
import { FinancialOutcomeForm } from "@/components/FinancialOutcomeForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { getPatientPacketsByLeadId, getPatientPacketsByPatientId, getPatientPacket, updatePatientPacket } from "@/services/patientPacketService";
import { toast } from "sonner";

const ConsultationSessionPage = () => {
  const { appointmentId } = useParams();
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientPacketData, setPatientPacketData] = useState<NewPatientFormData | null>(null);
  const [hasFilledPacket, setHasFilledPacket] = useState(false);
  const [loadingPacket, setLoadingPacket] = useState(false);
  const [isEditingPacket, setIsEditingPacket] = useState(false);
  const [packetId, setPacketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new-patient-packet");
  const [consultationSection, setConsultationSection] = useState(1);
  const [isCompletingConsultation, setIsCompletingConsultation] = useState(false);
  const formRef = useRef<NewPatientPacketFormRef>(null);

  const tabs = [
    {
      id: "new-patient-packet",
      label: "New Patient Packet",
      icon: FileText,
      color: "text-blue-600",
      activeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500"
    },
    {
      id: "summary",
      label: "Summary",
      icon: BarChart3,
      color: "text-green-600",
      activeColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-500"
    }
  ];

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId) return;

      try {
        setLoading(true);

        // First try to get from appointments table
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();

        if (appointmentData && !appointmentError) {
          // If this is an appointment, check if it has lead information
          let enrichedData = { ...appointmentData };

          // Try to get lead information if patient_id is null and notes contain lead ID
          if (!appointmentData.patient_id && appointmentData.notes) {
            const leadIdMatch = appointmentData.notes.match(/Lead ID: ([a-f0-9-]+)/);
            if (leadIdMatch) {
              const leadId = leadIdMatch[1];
              const { data: leadData, error: leadError } = await supabase
                .from('new_patient_leads')
                .select('*')
                .eq('id', leadId)
                .single();

              if (!leadError && leadData) {
                // Merge lead data with appointment data
                enrichedData = {
                  ...appointmentData,
                  ...leadData,
                  patient_name: appointmentData.patient_name || `${leadData.first_name || leadData.personal_first_name || ''} ${leadData.last_name || leadData.personal_last_name || ''}`.trim(),
                  phone: leadData.phone || leadData.personal_phone,
                  email: leadData.email || leadData.personal_email
                };
              }
            }
          } else if (appointmentData.patient_id) {
            // For existing patients, get their information
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('*')
              .eq('id', appointmentData.patient_id)
              .single();

            if (!patientError && patientData) {
              enrichedData = {
                ...appointmentData,
                ...patientData,
                patient_name: appointmentData.patient_name || `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim()
              };
            }
          }

          setAppointmentData(enrichedData);

          // Check for patient packet data
          await fetchPatientPacketData(enrichedData);
        } else {
          // If not found in appointments, try leads table
          const { data: leadData, error: leadError } = await supabase
            .from('new_patient_leads')
            .select('*')
            .eq('id', appointmentId)
            .single();

          if (leadData && !leadError) {
            // Transform lead data to match appointment structure
            const transformedData = {
              ...leadData,
              patient_name: `${leadData.first_name || leadData.personal_first_name || ''} ${leadData.last_name || leadData.personal_last_name || ''}`.trim(),
              date: new Date().toISOString().split('T')[0], // Today's date for leads
              start_time: leadData.best_contact_time || '',
              end_time: '',
              appointment_type: 'consultation',
              phone: leadData.phone || leadData.personal_phone,
              email: leadData.email || leadData.personal_email
            };

            setAppointmentData(transformedData);

            // Check for patient packet data for this lead
            await fetchPatientPacketData(transformedData);
          }
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId]);

  const fetchPatientPacketData = async (appointmentData: any) => {
    try {
      setLoadingPacket(true);
      let packetData = null;

      // Check if this is a lead-based appointment
      if (appointmentData.lead_id || (!appointmentData.patient_id && appointmentData.id)) {
        const leadId = appointmentData.lead_id || appointmentData.id;
        const { data: packets, error } = await getPatientPacketsByLeadId(leadId);

        if (!error && packets && packets.length > 0) {
          // Get the most recent packet
          const latestPacket = packets[0];
          const { data: fullPacketData, error: packetError } = await getPatientPacket(latestPacket.id);

          if (!packetError && fullPacketData) {
            packetData = fullPacketData;
            setPacketId(latestPacket.id);
          }
        }
      }
      // Check if this is a patient-based appointment
      else if (appointmentData.patient_id) {
        const { data: packets, error } = await getPatientPacketsByPatientId(appointmentData.patient_id);

        if (!error && packets && packets.length > 0) {
          // Get the most recent packet
          const latestPacket = packets[0];
          const { data: fullPacketData, error: packetError } = await getPatientPacket(latestPacket.id);

          if (!packetError && fullPacketData) {
            packetData = fullPacketData;
            setPacketId(latestPacket.id);
          }
        }
      }

      if (packetData) {
        setPatientPacketData(packetData);
        setHasFilledPacket(true);
      } else {
        setHasFilledPacket(false);
        setPatientPacketData(null);
        setPacketId(null);
      }
    } catch (error) {
      console.error('Error fetching patient packet data:', error);
      setHasFilledPacket(false);
      setPatientPacketData(null);
    } finally {
      setLoadingPacket(false);
    }
  };

  const handleUpdatePatientPacket = async (formData: NewPatientFormData) => {
    if (!packetId) {
      console.error('No packet ID available for update');
      return;
    }

    try {
      setLoadingPacket(true);

      // Update the patient packet using the service function
      const { data, error } = await updatePatientPacket(packetId, formData, 'internal');

      if (error) {
        console.error('Error updating patient packet:', error);
        toast.error('Failed to update patient packet. Please try again.');
        return;
      }

      // Update local state
      setPatientPacketData(formData);
      setIsEditingPacket(false);

      console.log('Patient packet updated successfully');
      toast.success('Patient packet updated successfully!');
    } catch (error) {
      console.error('Error updating patient packet:', error);
      toast.error('An unexpected error occurred while updating the patient packet.');
    } finally {
      setLoadingPacket(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!packetId || !appointmentData) {
      toast.error('Missing required data to complete consultation');
      return;
    }

    try {
      setIsCompletingConsultation(true);

      // Get patient packet data
      const patientData = patientPacketData;

      // Get lead data for additional patient information
      let leadData = null;
      if (patientData?.lead_id) {
        const { data: lead, error: leadError } = await supabase
          .from('new_patient_leads')
          .select('*')
          .eq('id', patientData.lead_id)
          .single();

        if (!leadError) {
          leadData = lead;
        }
      }

      // Get existing consultation data if it exists
      const { data: existingConsultation } = await supabase
        .from('consultations')
        .select('*')
        .eq('new_patient_packet_id', packetId)
        .single();

      // Prepare comprehensive consultation data with ALL available information
      const consultationData = {
        // Core identifiers
        new_patient_lead_id: patientData?.lead_id || null,
        new_patient_packet_id: packetId,

        // Patient basic information - prioritize packet data, then lead data, then appointment data
        first_name: patientData?.first_name || leadData?.personal_first_name || appointmentData.patient_name?.split(' ')[0] || '',
        last_name: patientData?.last_name || leadData?.personal_last_name || appointmentData.patient_name?.split(' ').slice(1).join(' ') || '',
        patient_phone: patientData?.phone_cell || leadData?.personal_phone || appointmentData.patient_phone || null,
        patient_email: patientData?.email || leadData?.personal_email || appointmentData.patient_email || null,
        patient_date_of_birth: patientData?.date_of_birth || leadData?.date_of_birth || null,
        patient_gender: patientData?.gender || leadData?.gender || null,

        // Patient address - construct from packet data or use lead data
        patient_address: patientData?.address_street && patientData?.address_city && patientData?.address_state ?
          `${patientData.address_street}, ${patientData.address_city}, ${patientData.address_state} ${patientData.address_zip || ''}`.trim() :
          leadData?.address || null,

        // Emergency contact information
        emergency_contact_name: patientData?.emergency_contact_name || null,
        emergency_contact_phone: patientData?.emergency_contact_phone || null,
        emergency_contact_relationship: patientData?.emergency_contact_relationship || null,

        // Medical history from patient packet
        medical_conditions: {
          critical_conditions: patientData?.critical_conditions || {},
          system_specific: patientData?.system_specific || {},
          additional_conditions: patientData?.additional_conditions || [],
          recent_health_changes: patientData?.recent_health_changes || {}
        },
        allergies: patientData?.allergies || {},
        current_medications: patientData?.current_medications || {},
        dental_status: patientData?.dental_status || {},
        current_symptoms: patientData?.current_symptoms || {},
        healing_issues: patientData?.healing_issues || {},
        tobacco_use: patientData?.tobacco_use || {},

        // Patient preferences from packet
        patient_preferences: {
          anxiety_control: patientData?.anxiety_control || [],
          pain_injection: patientData?.pain_injection || [],
          communication: patientData?.communication || [],
          sensory_sensitivities: patientData?.sensory_sensitivities || [],
          physical_comfort: patientData?.physical_comfort || [],
          service_preferences: patientData?.service_preferences || [],
          other_concerns: patientData?.other_concerns || ''
        },

        // Lead information
        reason_for_visit: leadData?.reason_for_visit || null,
        dental_problems: leadData?.dental_problems || [],
        urgency_level: leadData?.urgency || null,

        // Insurance information
        insurance_info: {
          has_medical_insurance: patientData?.has_medical_insurance || null,
          pcp_name: patientData?.pcp_name || null,
          pcp_practice: patientData?.pcp_practice || null,
          pcp_phone: patientData?.pcp_phone || null
        },

        // Treatment section details (get from existing consultation or defaults)
        clinical_assessment: existingConsultation?.clinical_assessment || null,
        treatment_recommendations: existingConsultation?.treatment_recommendations || {},
        additional_information: existingConsultation?.additional_information || null,

        // Financial & outcome section details
        treatment_decision: existingConsultation?.treatment_decision || null,
        treatment_cost: existingConsultation?.treatment_cost || null,
        global_treatment_value: existingConsultation?.global_treatment_value || null,
        financing_options: existingConsultation?.financing_options || {},
        financing_not_approved_reason: existingConsultation?.financing_not_approved_reason || null,
        financial_notes: existingConsultation?.financial_notes || null,
        followup_date: existingConsultation?.followup_date || null,
        followup_reason: existingConsultation?.followup_reason || null,
        treatment_plan_approved: existingConsultation?.treatment_plan_approved || false,
        follow_up_required: existingConsultation?.follow_up_required || false,

        // Status and completion
        consultation_status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Log the data being saved for debugging
      console.log('💾 Saving comprehensive consultation data:', {
        patientInfo: {
          name: `${consultationData.first_name} ${consultationData.last_name}`,
          phone: consultationData.patient_phone,
          email: consultationData.patient_email,
          dob: consultationData.patient_date_of_birth,
          gender: consultationData.patient_gender,
          address: consultationData.patient_address
        },
        medicalData: {
          conditions: Object.keys(consultationData.medical_conditions).length,
          allergies: Object.keys(consultationData.allergies).length,
          medications: Object.keys(consultationData.current_medications).length,
          dentalStatus: Object.keys(consultationData.dental_status).length
        },
        consultationData: {
          treatmentDecision: consultationData.treatment_decision,
          treatmentCost: consultationData.treatment_cost,
          clinicalAssessment: consultationData.clinical_assessment ? 'Present' : 'Empty'
        }
      });

      // Insert or update consultation record
      const { error: upsertError } = await supabase
        .from('consultations')
        .upsert(consultationData, {
          onConflict: 'new_patient_packet_id'
        });

      if (upsertError) {
        throw upsertError;
      }

      console.log('✅ Consultation completed and saved successfully');
      toast.success('Consultation completed successfully!');

      // If treatment is accepted, trigger patient move to main table
      if (existingConsultation?.treatment_decision === 'accepted') {
        console.log('🔄 Treatment accepted, patient should be moved to main table');
        // The FinancialOutcomeForm already handles this, so we just log it
      }

    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('Failed to complete consultation. Please try again.');
    } finally {
      setIsCompletingConsultation(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {appointmentData?.patient_name || 'Unknown Patient'}
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Treatment
                </Badge>
              </div>
            </div>

            {/* Section Buttons */}
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? `${tab.bgColor} ${tab.activeColor} shadow-sm border ${tab.borderColor}`
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {formatDate(appointmentData?.date)}
                </span>
              </div>
              {appointmentData?.start_time && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {formatTime(appointmentData.start_time)}
                    {appointmentData.end_time && ` - ${formatTime(appointmentData.end_time)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pb-8 overflow-hidden min-h-0">
        <div className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* Container 1: All Patient Information */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden lg:col-span-1">
              <CardContent className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-modern">
                <div className="space-y-4">
                  {/* Large Patient Avatar Section */}
                  <div className="flex flex-col items-center text-center py-4">
                    <Avatar className="h-20 w-20 mb-3 ring-4 ring-indigo-100">
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {appointmentData?.patient_name ?
                          appointmentData.patient_name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase() :
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {appointmentData?.patient_name || 'Unknown Patient'}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-1">
                      Consultation
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                    </div>

                    {(appointmentData?.phone || appointmentData?.personal_phone) && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointmentData.phone || appointmentData.personal_phone}
                          </p>
                          <p className="text-xs text-gray-500">Phone Number</p>
                        </div>
                      </div>
                    )}

                    {(appointmentData?.email || appointmentData?.personal_email) && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointmentData.email || appointmentData.personal_email}
                          </p>
                          <p className="text-xs text-gray-500">Email Address</p>
                        </div>
                      </div>
                    )}

                    {appointmentData?.best_contact_time && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{appointmentData.best_contact_time}</p>
                          <p className="text-xs text-gray-500">Best Contact Time</p>
                        </div>
                      </div>
                    )}

                    {appointmentData?.phone_call_preference && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{appointmentData.phone_call_preference}</p>
                          <p className="text-xs text-gray-500">Phone Call Preference</p>
                        </div>
                      </div>
                    )}

                    {appointmentData?.preferred_contact && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{appointmentData.preferred_contact}</p>
                          <p className="text-xs text-gray-500">Preferred Contact Method</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Personal Details</h4>
                    </div>

                    {appointmentData?.date_of_birth && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(appointmentData.date_of_birth).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                        </div>
                      </div>
                    )}

                    {appointmentData?.gender && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">{appointmentData.gender}</p>
                          <p className="text-xs text-gray-500">Gender</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {appointmentData?.created_at ? new Date(appointmentData.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Appointment Created</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {(appointmentData?.address || appointmentData?.home_address || appointmentData?.street_address) && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                      </div>
                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {appointmentData.address || appointmentData.home_address || appointmentData.street_address}
                          </p>
                          {(appointmentData.city || appointmentData.state || appointmentData.zip_code) && (
                            <p className="text-sm text-gray-700">
                              {[appointmentData.city, appointmentData.state, appointmentData.zip_code].filter(Boolean).join(', ')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Home Address</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State for Contact Information */}
                  {!appointmentData?.phone && !appointmentData?.personal_phone &&
                   !appointmentData?.email && !appointmentData?.personal_email &&
                   !appointmentData?.best_contact_time && !appointmentData?.phone_call_preference &&
                   !appointmentData?.preferred_contact && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Phone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No contact information</p>
                        <p className="text-xs text-gray-400">Contact details will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical & Dental Information Section */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  {(appointmentData?.reason_for_visit || appointmentData?.urgency ||
                    (appointmentData?.dental_problems && appointmentData.dental_problems.length > 0) ||
                    (appointmentData?.immediate_needs && appointmentData.immediate_needs.length > 0) ||
                    appointmentData?.implant_type ||
                    (appointmentData?.medical_conditions && appointmentData.medical_conditions.length > 0) ||
                    appointmentData?.has_medical_insurance) ? (
                    <>
                      {/* Dental Information Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Dental Information</h4>
                        </div>

                        {appointmentData?.reason_for_visit && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 mb-1">Reason for Visit</p>
                                <p className="text-sm text-blue-800">{appointmentData.reason_for_visit}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.urgency && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-900 mb-1">Urgency Level</p>
                                <p className="text-sm text-red-800 capitalize">{appointmentData.urgency}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.dental_problems && appointmentData.dental_problems.length > 0 && (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="h-3 w-3 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-orange-900 mb-2">Dental Problems</p>
                                <div className="flex flex-wrap gap-1">
                                  {appointmentData.dental_problems.map((problem: string, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-orange-100 border-orange-300 text-orange-800 text-xs">
                                      {problem}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.immediate_needs && appointmentData.immediate_needs.length > 0 && (
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Clock className="h-3 w-3 text-yellow-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-yellow-900 mb-2">Immediate Needs</p>
                                <div className="flex flex-wrap gap-1">
                                  {appointmentData.immediate_needs.map((need: string, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800 text-xs">
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.implant_type && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Heart className="h-3 w-3 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-900 mb-1">Implant Type</p>
                                <p className="text-sm text-purple-800">{appointmentData.implant_type}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Medical Information Section */}
                      {((appointmentData?.medical_conditions && appointmentData.medical_conditions.length > 0) ||
                        appointmentData?.has_medical_insurance) && (
                        <div className="space-y-3 border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <Heart className="h-4 w-4 text-red-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">Medical Information</h4>
                          </div>

                          {appointmentData?.medical_conditions && appointmentData.medical_conditions.length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-red-900 mb-2">Medical Conditions</p>
                                  <div className="flex flex-wrap gap-1">
                                    {appointmentData.medical_conditions.map((condition: string, index: number) => (
                                      <Badge key={index} variant="outline" className="bg-red-100 border-red-300 text-red-800 text-xs">
                                        {condition}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {appointmentData?.has_medical_insurance && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-green-900 mb-1">Medical Insurance</p>
                                  <p className="text-sm text-green-800 capitalize">{appointmentData.has_medical_insurance}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No medical information</p>
                        <p className="text-xs text-gray-400">Medical details will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Information Section */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  {(appointmentData?.use_financing || appointmentData?.credit_score ||
                    (appointmentData?.barriers && appointmentData.barriers.length > 0) ||
                    appointmentData?.need_loved_one_help) ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Financial Information</h4>
                        </div>

                        {appointmentData?.use_financing && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <DollarSign className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-900 mb-1">Financing Interest</p>
                                <p className="text-sm text-green-800 capitalize">{appointmentData.use_financing}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.credit_score && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 mb-1">Credit Score Range</p>
                                <p className="text-sm text-blue-800">{appointmentData.credit_score}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.barriers && appointmentData.barriers.length > 0 && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-900 mb-2">Financial Barriers</p>
                                <div className="flex flex-wrap gap-1">
                                  {appointmentData.barriers.map((barrier: string, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-red-100 border-red-300 text-red-800 text-xs">
                                      {barrier}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.need_loved_one_help && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="h-3 w-3 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-900 mb-1">Need Family Help</p>
                                <p className="text-sm text-purple-800 capitalize">{appointmentData.need_loved_one_help}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No financial information</p>
                        <p className="text-xs text-gray-400">Financial details will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  {(appointmentData?.hear_about_us || appointmentData?.additional_notes ||
                    appointmentData?.agree_to_terms !== undefined) ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Info className="h-4 w-4 text-indigo-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                        </div>

                        {appointmentData?.hear_about_us && (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Info className="h-3 w-3 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-indigo-900 mb-1">How They Heard About Us</p>
                                <p className="text-sm text-indigo-800">{appointmentData.hear_about_us}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.additional_notes && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="h-3 w-3 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 mb-1">Additional Notes</p>
                                <p className="text-sm text-gray-700">{appointmentData.additional_notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.agree_to_terms !== undefined && (
                          <div className={`p-4 rounded-lg border ${
                            appointmentData.agree_to_terms
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                appointmentData.agree_to_terms
                                  ? 'bg-green-100'
                                  : 'bg-red-100'
                              }`}>
                                {appointmentData.agree_to_terms ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium mb-1 ${
                                  appointmentData.agree_to_terms
                                    ? 'text-green-900'
                                    : 'text-red-900'
                                }`}>
                                  Terms Agreement
                                </p>
                                <p className={`text-sm ${
                                  appointmentData.agree_to_terms
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                }`}>
                                  {appointmentData.agree_to_terms ? 'Agreed to terms' : 'Did not agree to terms'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No additional information</p>
                        <p className="text-xs text-gray-400">Additional details will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Container */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden lg:col-span-4">
                <CardContent className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-modern">
                  {/* New Patient Packet Tab */}
                  {activeTab === "new-patient-packet" && (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">New Patient Packet</h3>
                            <p className="text-sm text-gray-500">
                              {hasFilledPacket
                                ? (isEditingPacket ? 'Editing patient packet information' : 'Filled patient packet information')
                                : 'Preview and review patient information'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasFilledPacket && !isEditingPacket && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingPacket(true)}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          {isEditingPacket && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingPacket(false)}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  console.log('Update Form button clicked, calling submitForm...');
                                  formRef.current?.submitForm();
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Update Form
                              </Button>
                            </>
                          )}
                          <Badge className={hasFilledPacket
                            ? (isEditingPacket ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-green-100 text-green-800 border-green-300")
                            : "bg-blue-100 text-blue-800 border-blue-300"
                          }>
                            {hasFilledPacket
                              ? (isEditingPacket ? 'Editing' : 'Filled')
                              : 'Preview Mode'
                            }
                          </Badge>
                        </div>
                      </div>

                  {/* Loading State */}
                  {loadingPacket && (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* Patient Packet Content */}
                  {!loadingPacket && (
                    <div className="w-full pb-8">
                      {hasFilledPacket && patientPacketData && !isEditingPacket ? (
                        // Show filled packet viewer (read-only)
                        <FilledPatientPacketViewer
                          formData={patientPacketData}
                          submittedAt={patientPacketData.created_at || patientPacketData.submitted_at}
                          onClose={() => {
                            // Optional: Add functionality to close/minimize the viewer
                          }}
                        />
                      ) : (
                        // Show editable form (either for new packet or editing existing)
                        <NewPatientPacketForm
                          key={`consultation-form-${isEditingPacket ? 'edit' : 'new'}-${packetId || 'new'}`}
                          ref={formRef}
                          onSubmit={(formData: NewPatientFormData) => {
                            if (hasFilledPacket && isEditingPacket) {
                              // Update existing packet
                              handleUpdatePatientPacket(formData);
                            } else {
                              // Handle new form submission in consultation context
                              console.log('New form submitted:', formData);
                            }
                          }}
                          onCancel={() => {
                            if (isEditingPacket) {
                              setIsEditingPacket(false);
                            } else {
                              console.log('Form cancelled');
                            }
                          }}
                          patientName={appointmentData?.patient_name || 'Unknown Patient'}
                          patientDateOfBirth={appointmentData?.date_of_birth || ''}
                          patientGender={appointmentData?.gender || ''}
                          showWelcomeHeader={false}
                          initialData={isEditingPacket ? patientPacketData : undefined}
                          submitButtonText={isEditingPacket ? 'Update Patient Packet' : 'Submit Patient Packet'}
                        />
                      )}
                    </div>
                  )}
                    </div>
                  )}

                  {/* Summary Tab */}
                  {activeTab === "summary" && (
                    <div className="pb-8">
                      <ErrorBoundary>
                        <PatientSummaryAI
                          patientData={patientPacketData}
                          patientName={appointmentData?.patient_name || 'Unknown Patient'}
                          patientPacketId={packetId || undefined}
                        />
                      </ErrorBoundary>
                    </div>
                  )}


                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSessionPage;
