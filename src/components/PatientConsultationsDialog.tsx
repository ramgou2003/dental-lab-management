import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Eye,
  Play,
  Stethoscope,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { findExistingPatientPacket } from "@/services/sharedPatientPacketService";

interface PatientConsultationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

interface ConsultationRecord {
  id: string;
  consultation_date: string;
  consultation_time: string;
  appointment_id: string | null;
  status: string;
  treatment_decision?: string | null;
  created_at: string;
  // From appointments table
  appointment_status?: string;
  appointment_notes?: string;
  // From consultations table
  consultation_status?: string;
  clinical_assessment?: string;
  treatment_cost?: number;
  consultation_notes?: string;
}

interface PatientInfo {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export function PatientConsultationsDialog({
  isOpen,
  onClose,
  patientId,
  patientName
}: PatientConsultationsDialogProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [sharedPatientPacket, setSharedPatientPacket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientConsultations();
    }
  }, [isOpen, patientId]);

  const fetchPatientConsultations = async () => {
    setLoading(true);
    try {
      // First, determine if this is a consultation patient or active patient
      // Check consultation_patients table first
      const { data: consultationPatientData, error: consultationError } = await supabase
        .from('consultation_patients')
        .select('*')
        .eq('id', patientId)
        .single();

      let isConsultationPatient = false;
      let patientData: PatientInfo | null = null;

      if (!consultationError && consultationPatientData) {
        // This is a consultation patient
        isConsultationPatient = true;
        patientData = {
          id: consultationPatientData.id,
          first_name: consultationPatientData.first_name,
          last_name: consultationPatientData.last_name,
          date_of_birth: consultationPatientData.date_of_birth,
          gender: consultationPatientData.gender,
        };

        // Get all appointments for this consultation patient by patient name
        const patientFullName = `${consultationPatientData.first_name} ${consultationPatientData.last_name}`;
        const { data: allAppointments, error: allAppointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_name,
            date,
            start_time,
            end_time,
            appointment_type,
            status,
            notes,
            created_at
          `)
          .eq('patient_name', patientFullName)
          .eq('appointment_type', 'consultation')
          .order('date', { ascending: false });

        if (allAppointmentsError) throw allAppointmentsError;
        
        // Get consultation details for each appointment
        const consultationsWithDetails = await Promise.all(
          (allAppointments || []).map(async (appointment) => {
            let consultationDetails = {};

            // Get consultation form details using appointment_id
            const { data: consultationFormData } = await supabase
              .from('consultations')
              .select('consultation_status, clinical_assessment, treatment_cost, consultation_notes, treatment_decision')
              .eq('appointment_id', appointment.id)
              .single();

            if (consultationFormData) {
              consultationDetails = consultationFormData;
            }

            // Transform appointment data to consultation format
            return {
              id: appointment.id,
              consultation_date: appointment.date,
              consultation_time: appointment.start_time,
              appointment_id: appointment.id,
              status: appointment.status,
              created_at: appointment.created_at,
              appointment_status: appointment.status,
              appointment_notes: appointment.notes,
              ...consultationDetails
            };
          })
        );

        setConsultations(consultationsWithDetails);
      } else {
        // Check if this is an active patient
        const { data: activePatientData, error: activePatientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (!activePatientError && activePatientData) {
          patientData = activePatientData;

          // Get all appointments for this active patient
          const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientId)
            .eq('appointment_type', 'consultation')
            .order('date', { ascending: false });

          if (appointmentsError) throw appointmentsError;

          // Transform appointments to consultation format and get consultation details
          const consultationsFromAppointments = await Promise.all(
            (appointments || []).map(async (appointment) => {
              let consultationDetails = {};

              // Get consultation form details using appointment_id
              const { data: consultationFormData } = await supabase
                .from('consultations')
                .select('consultation_status, clinical_assessment, treatment_cost, consultation_notes, treatment_decision')
                .eq('appointment_id', appointment.id)
                .single();

              if (consultationFormData) {
                consultationDetails = consultationFormData;
              }

              return {
                id: appointment.id,
                consultation_date: appointment.date,
                consultation_time: appointment.start_time,
                appointment_id: appointment.id,
                status: 'completed', // Assuming appointments are completed
                appointment_status: appointment.status,
                appointment_notes: appointment.notes,
                created_at: appointment.created_at,
                ...consultationDetails
              };
            })
          );

          setConsultations(consultationsFromAppointments);
        }
      }

      setPatientInfo(patientData);

      // Fetch shared patient packet information if we have patient data
      if (patientData) {
        try {
          const { data: packetData, error: packetError } = await findExistingPatientPacket({
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            date_of_birth: patientData.date_of_birth
          });

          if (!packetError && packetData) {
            setSharedPatientPacket(packetData);
            console.log('Found shared patient packet:', packetData.id);
          }
        } catch (error) {
          console.warn('Error fetching shared patient packet:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      toast.error('Failed to load patient consultations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return 'bg-orange-100 text-orange-800';
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

  const handleViewConsultation = (consultation: ConsultationRecord) => {
    if (consultation.appointment_id) {
      navigate(`/consultation/${consultation.appointment_id}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <User className="h-6 w-6" />
            Patient Consultations - {patientName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Patient Information */}
            {patientInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {`${patientInfo.first_name.charAt(0)}${patientInfo.last_name.charAt(0)}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {patientInfo.first_name} {patientInfo.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          DOB: {formatDate(patientInfo.date_of_birth)} | {patientInfo.gender}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {patientInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {patientInfo.phone}
                        </div>
                      )}
                      {patientInfo.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {patientInfo.email}
                        </div>
                      )}
                      {(patientInfo.street || patientInfo.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {[patientInfo.street, patientInfo.city, patientInfo.state, patientInfo.zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consultations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5" />
                  Consultation History ({consultations.length} consultations)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                    <p className="text-gray-500">This patient has no consultation records.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation, index) => (
                      <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Date and Time */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{formatDate(consultation.consultation_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatTime(consultation.consultation_time)}</span>
                              </div>
                            </div>

                            {/* Treatment Decision */}
                            {consultation.treatment_decision && (
                              <div className="flex items-center gap-2">
                                <Badge className={getTreatmentStatusColor(consultation.treatment_decision)}>
                                  {formatTreatmentDecision(consultation.treatment_decision)}
                                </Badge>
                              </div>
                            )}


                          </div>

                          {/* Action Button */}
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewConsultation(consultation)}
                              className="flex items-center gap-2"
                              disabled={!consultation.appointment_id}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>

                        {index < consultations.length - 1 && <div className="border-t mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
