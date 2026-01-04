import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Users, UserCheck, Search, UserPlus, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface AddConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: Date;
  initialTime?: string;
  initialEndTime?: string;
  initialValues?: any;
  onOpenCalendar?: (data: any) => void;
}

type PatientType = 'new' | 'consultation' | 'active';

interface ConsultationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'prefer-not-to-answer';
  consultationDate: Date;
  consultationTime: string;
  consultationEndTime: string;
  assignedUserId?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface ConsultationPatient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  consultation_date: string;
  consultation_time: string;
  status: string;
}

interface ActivePatient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  phone: string | null;
  gender: string | null;
  status: string | null;
}

export function AddConsultationDialog({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  initialEndTime,
  initialValues,
  onOpenCalendar
}: AddConsultationDialogProps) {
  const [patientType, setPatientType] = useState<PatientType>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(ConsultationPatient | ActivePatient)[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ConsultationPatient | ActivePatient | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState<ConsultationFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-answer',
    consultationDate: new Date(),
    consultationTime: '',
    consultationEndTime: '',
    assignedUserId: undefined
  });

  // getCurrentFormData helper
  const getCurrentFormData = () => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      consultationDate: formData.consultationDate,
      consultationTime: formData.consultationTime,
      consultationEndTime: formData.consultationEndTime,
      assignedUserId: formData.assignedUserId,
      patientType: patientType,
      selectedPatient: selectedPatient,
      searchTerm: searchTerm
    };
  };

  // Initialize from initialValues (draft) or individual props
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setFormData({
          firstName: initialValues.firstName || '',
          lastName: initialValues.lastName || '',
          dateOfBirth: initialValues.dateOfBirth || '',
          gender: initialValues.gender || 'prefer-not-to-answer',
          consultationDate: initialValues.consultationDate || new Date(),
          consultationTime: initialValues.consultationTime || '',
          consultationEndTime: initialValues.consultationEndTime || '',
          assignedUserId: initialValues.assignedUserId
        });
        if (initialValues.patientType) setPatientType(initialValues.patientType);
        if (initialValues.selectedPatient) setSelectedPatient(initialValues.selectedPatient);
        if (initialValues.searchTerm) setSearchTerm(initialValues.searchTerm);
      } else {
        // Individual props fallback
        setFormData(prev => ({
          ...prev,
          consultationDate: initialDate || prev.consultationDate,
          consultationTime: initialTime || prev.consultationTime,
          consultationEndTime: initialEndTime || prev.consultationEndTime
        }));
      }
    }
  }, [isOpen, initialValues, initialDate, initialTime]);

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for assignment
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await (supabase
        .from('user_profiles' as any)
        .select('id, full_name, email') as any);

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }

      setUsers(data as UserProfile[]);

      // Set DC as default assigned user for consultation appointments
      const dcUser = (data as UserProfile[]).find(user => user.full_name.trim().toLowerCase() === 'dc');
      if (dcUser && !formData.assignedUserId) {
        setFormData(prev => ({ ...prev, assignedUserId: dcUser.id }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Search for consultation patients
  const searchConsultationPatients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await (supabase
        .from('consultation_patients' as any)
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10) as any);

      if (error) {
        console.error('Error searching consultation patients:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data as (ConsultationPatient | ActivePatient)[]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Search for active patients
  const searchActivePatients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching active patients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        if (patientType === 'consultation') {
          searchConsultationPatients(searchTerm);
        } else if (patientType === 'active') {
          searchActivePatients(searchTerm);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, patientType]);

  // Handle patient type change
  const handlePatientTypeChange = (type: PatientType) => {
    setPatientType(type);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPatient(null);

    // Reset form data when switching types
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'prefer-not-to-answer',
      consultationDate: new Date(),
      consultationTime: '',
      consultationEndTime: ''
    });
  };

  // Handle patient selection
  const handlePatientSelect = (patient: ConsultationPatient | ActivePatient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setSearchResults([]);

    // Pre-fill form data with selected patient info
    setFormData({
      firstName: (patient as ConsultationPatient).first_name || '',
      lastName: (patient as ConsultationPatient).last_name || '',
      dateOfBirth: (patient as ConsultationPatient).date_of_birth || '',
      gender: (patient as ConsultationPatient).gender as any || 'prefer-not-to-answer',
      consultationDate: new Date(),
      consultationTime: '',
      consultationEndTime: ''
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {
      consultationDate: !formData.consultationDate,
      consultationTime: !formData.consultationTime
    };

    // For new patients, validate all fields
    if (patientType === 'new') {
      newErrors.firstName = !formData.firstName.trim();
      newErrors.lastName = !formData.lastName.trim();
      newErrors.dateOfBirth = !formData.dateOfBirth;
    } else {
      // For existing patients, ensure one is selected
      newErrors.selectedPatient = !selectedPatient;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleInputChange = (field: keyof ConsultationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the consultation date
      const consultationDateStr = format(formData.consultationDate, 'yyyy-MM-dd');

      // Calculate end time (30 minutes after start time if not provided)
      let endTimeStr = formData.consultationEndTime;
      if (!endTimeStr) {
        const startTime = new Date(`2000-01-01T${formData.consultationTime}:00`);
        const endTime = new Date(startTime.getTime() + 30 * 60000); // Add 30 minutes
        endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      }

      // Determine patient_id based on patient type
      // Only set patient_id for active patients (from patients table)
      // Consultation patients are linked via consultations table, not directly
      let patientId = null;
      if (patientType === 'active' && selectedPatient) {
        patientId = selectedPatient.id;
      }

      // Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          patient_name: `${formData.firstName} ${formData.lastName}`,
          patient_id: patientId,
          assigned_user_id: formData.assignedUserId || null,
          title: `Consultation - ${formData.firstName} ${formData.lastName}`,
          date: consultationDateStr,
          start_time: formData.consultationTime,
          end_time: endTimeStr,
          appointment_type: 'consultation',
          status: 'pending',
          notes: patientType === 'new' ? null : `${patientType === 'consultation' ? 'Follow-up consultation' : 'Additional consultation'} for existing patient`
        }])
        .select()
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      // Create a lead entry only for new patients
      let leadId = null;
      if (patientType === 'new') {
        const { data: leadData, error: leadError } = await supabase
          .from('new_patient_leads')
          .insert([{
            first_name: formData.firstName,
            last_name: formData.lastName,
            personal_first_name: formData.firstName,
            personal_last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            phone: '',
            email: '',
            personal_phone: '',
            personal_email: '',
            best_contact_time: formData.consultationTime,
            reason_for_visit: 'Consultation appointment',
            status: 'scheduled',
            source: 'consultation_form'
          }])
          .select()
          .single();

        if (leadError) {
          console.warn('Failed to create lead entry:', leadError);
          // Don't fail the whole operation if lead creation fails
        } else {
          leadId = leadData?.id;
        }
      }

      // Create consultation patient entry and manage shared patient packet
      let consultationPatientId = null;

      if (patientType === 'new') {
        // Create new consultation patient entry (without appointment_id - relationship via consultations table)
        const { data: consultationPatientData, error: consultationPatientError } = await (supabase
          .from('consultation_patients' as any)
          .insert([{
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            consultation_date: consultationDateStr,
            consultation_time: formData.consultationTime,
            lead_id: leadId,
            status: 'scheduled'
          }])
          .select()
          .single() as any);

        if (consultationPatientError) {
          console.warn('Failed to create consultation patient entry:', consultationPatientError);
          // Don't fail the whole operation if consultation patient creation fails
        } else {
          consultationPatientId = consultationPatientData?.id;
        }
      } else if (patientType === 'consultation' && selectedPatient) {
        // For existing consultation patients, reuse the existing consultation patient ID
        // Don't create a new consultation_patients entry, just use the existing one
        consultationPatientId = selectedPatient.id;

        // Create a direct consultation record linking the new appointment to the existing consultation patient
        try {
          // Find the shared patient packet by patient identity (not consultation_patient_id)
          const { findExistingPatientPacket } = await import('@/services/sharedPatientPacketService');

          const patientIdentity = {
            first_name: selectedPatient.first_name,
            last_name: selectedPatient.last_name,
            date_of_birth: selectedPatient.date_of_birth
          };

          const { data: existingPacket, error: packetError } = await findExistingPatientPacket(patientIdentity);

          let packetId = existingPacket?.id || null;

          if (packetError || !existingPacket) {
            console.warn('No existing patient packet found for patient identity, continuing without packet:', patientIdentity);
          } else {
            console.log('Found existing shared patient packet:', existingPacket.id);
          }

          // Create consultation record linking new appointment to existing patient packet (or null)
          const { error: consultationError } = await (supabase
            .from('consultations' as any)
            .insert([{
              appointment_id: appointmentData.id,
              consultation_patient_id: consultationPatientId,
              new_patient_packet_id: packetId,
              patient_name: `${formData.firstName} ${formData.lastName}`,
              consultation_date: consultationDateStr,
              consultation_status: 'draft'
            }]) as any);

          if (consultationError) {
            console.warn('Failed to create consultation record:', consultationError);
          } else {
            console.log('Successfully created consultation record linking to shared patient packet');
          }
        } catch (error) {
          console.warn('Error creating consultation record for existing patient:', error);
        }
      }

      // Create consultation record for NEW consultation patients (without automatic packet creation)
      if (consultationPatientId && patientType === 'new') {
        try {
          // Create consultation record linking appointment to consultation patient (no packet yet)
          const { error: consultationError } = await (supabase
            .from('consultations' as any)
            .insert([{
              appointment_id: appointmentData.id,
              consultation_patient_id: consultationPatientId,
              new_patient_packet_id: null, // No packet created automatically
              patient_name: `${formData.firstName} ${formData.lastName}`,
              consultation_date: consultationDateStr,
              consultation_status: 'draft'
            }]) as any);

          if (consultationError) {
            console.warn('Failed to create consultation record for new patient:', consultationError);
          } else {
            console.log('Successfully created consultation record for new patient (no packet)');
          }
        } catch (error) {
          console.warn('Error creating consultation record for new patient:', error);
        }
      }

      // Create consultation record for ACTIVE patients (link to existing patient in main table)
      if (patientType === 'active' && patientId) {
        try {
          // 1. Fetch patient details to check for existing consultation_patient_id
          const { data: patientData, error: patientError } = await (supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single() as any);

          if (patientError) {
            console.error('Error fetching patient details:', patientError);
            throw patientError;
          }

          let consultationPatientId = patientData.consultation_patient_id;
          let packetId = null;

          // Attempt to find packet (keep existing logic for packet linking as supplemental)
          try {
            // We import dynamically to avoid circular dependencies
            const { findExistingPatientPacket } = await import('@/services/sharedPatientPacketService');
            const patientIdentity = {
              first_name: formData.firstName,
              last_name: formData.lastName,
              date_of_birth: formData.dateOfBirth
            };
            const { data: existingPacket } = await findExistingPatientPacket(patientIdentity);
            packetId = existingPacket?.id || null;
            if (packetId) console.log('Found linked patient packet for active patient:', packetId);
          } catch (e) {
            console.warn('Error finding existing packet:', e);
          }

          // 2. If no consultation_patient_id, create new consultation_patient and link it
          if (!consultationPatientId) {
            console.log('No consultation_patient_id found for active patient, creating new one...');

            const { data: newCP, error: cpError } = await (supabase
              .from('consultation_patients')
              .insert([{
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                consultation_date: consultationDateStr,
                consultation_time: formData.consultationTime || '09:00',
                status: 'scheduled',
                appointment_id: appointmentData.id
              }])
              .select()
              .single() as any);

            if (cpError) {
              console.error('Error creating consultation_patient:', cpError);
            } else if (newCP) {
              consultationPatientId = newCP.id;
              console.log('Created new consultation_patient:', consultationPatientId);

              // Update patient record with the new consultation_patient_id
              const { error: updateError } = await (supabase
                .from('patients')
                .update({ consultation_patient_id: consultationPatientId } as any)
                .eq('id', patientId) as any);

              if (updateError) {
                console.error('Error linking new consultation_patient to patient:', updateError);
              } else {
                console.log('Linked new consultation_patient to active patient');
              }
            }
          } else {
            console.log('Found existing consultation_patient_id on patient record:', consultationPatientId);
          }

          // 3. Create consultation record linking appointment to active patient AND valid consultation patient ID
          const { error: consultationError } = await (supabase
            .from('consultations' as any)
            .insert([{
              appointment_id: appointmentData.id,
              patient_id: patientId, // Link directly to existing patient
              consultation_patient_id: consultationPatientId, // Link to consultation patient (existing or new)
              new_patient_packet_id: packetId, // Link to original packet if found
              patient_name: `${formData.firstName} ${formData.lastName}`,
              consultation_date: consultationDateStr,
              consultation_status: 'draft'
            }]) as any);

          if (consultationError) {
            console.warn('Failed to create consultation record for active patient:', consultationError);
          } else {
            console.log('Successfully created consultation record for active patient');
          }
        } catch (error) {
          console.warn('Error creating consultation record for active patient:', error);
        }
      }

      // Show success message based on patient type
      if (patientType === 'new') {
        toast.success(`Consultation appointment created for new patient! Use "Add New Patient Packet" button to create their patient packet.`);
      } else if (patientType === 'consultation' && selectedPatient) {
        toast.success(`New consultation appointment created for existing patient ${selectedPatient.first_name} ${selectedPatient.last_name}!`);
      } else if (patientType === 'active') {
        toast.success(`Consultation appointment created successfully for active patient!`);
      }

      // Reset form
      setPatientType('new');
      setSearchTerm('');
      setSearchResults([]);
      setSelectedPatient(null);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'prefer-not-to-answer',
        consultationDate: new Date(),
        consultationTime: '',
        consultationEndTime: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast.error('Failed to create consultation appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Add Consultation Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Patient Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 pb-2 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Type
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all ${patientType === 'new' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                onClick={() => handlePatientTypeChange('new')}
              >
                <CardContent className="p-4 text-center">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <h4 className="font-medium text-gray-900">New Patient</h4>
                  <p className="text-sm text-gray-500 mt-1">First-time consultation</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${patientType === 'consultation' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                onClick={() => handlePatientTypeChange('consultation')}
              >
                <CardContent className="p-4 text-center">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <h4 className="font-medium text-gray-900">Follow-Up Patient</h4>
                  <p className="text-sm text-gray-500 mt-1">Previous consultation patient</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${patientType === 'active' ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                onClick={() => handlePatientTypeChange('active')}
              >
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <h4 className="font-medium text-gray-900">Active Patient</h4>
                  <p className="text-sm text-gray-500 mt-1">Existing patient record</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Patient Search for existing patients */}
          {(patientType === 'consultation' || patientType === 'active') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 pb-2 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search {patientType === 'consultation' ? 'Follow-Up' : 'Active'} Patients
              </h3>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${patientType === 'consultation' ? 'follow-up' : 'active'} patients by name...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${errors.selectedPatient ? 'border-red-500' : ''}`}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          DOB: {patient.date_of_birth} | Gender: {patient.gender}
                          {patientType === 'active' && 'phone' in patient && patient.phone && (
                            <> | Phone: {patient.phone}</>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {patientType === 'consultation' ? 'Follow-Up' : 'Active'} Patient
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Patient Display */}
              {selectedPatient && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900">
                        Selected: {selectedPatient.first_name} {selectedPatient.last_name}
                      </div>
                      <div className="text-sm text-green-700">
                        DOB: {selectedPatient.date_of_birth} | Gender: {selectedPatient.gender}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearchTerm('');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Patient Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 pb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {patientType === 'new' ? 'Patient Information' : 'Patient Details'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className={errors.firstName ? "text-red-500" : ""}>
                      First Name {patientType === 'new' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      placeholder="Enter first name"
                      disabled={patientType !== 'new' && selectedPatient !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className={errors.lastName ? "text-red-500" : ""}>
                      Last Name {patientType === 'new' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      placeholder="Enter last name"
                      disabled={patientType !== 'new' && selectedPatient !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className={errors.dateOfBirth ? "text-red-500" : ""}>
                      Date of Birth {patientType === 'new' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""}
                      disabled={patientType !== 'new' && selectedPatient !== null}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange('gender', 'male')}
                        disabled={patientType !== 'new' && selectedPatient !== null}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 'male'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-25'
                          } ${patientType !== 'new' && selectedPatient !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Users className="h-4 w-4" />
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('gender', 'female')}
                        disabled={patientType !== 'new' && selectedPatient !== null}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 'female'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-25'
                          } ${patientType !== 'new' && selectedPatient !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Users className="h-4 w-4" />
                        Female
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('gender', 'prefer-not-to-answer')}
                        disabled={patientType !== 'new' && selectedPatient !== null}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 'prefer-not-to-answer'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-25'
                          } ${patientType !== 'new' && selectedPatient !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <User className="h-4 w-4" />
                        Prefer not to say
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column - Appointment Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-700 border-b border-blue-200 pb-2 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Appointment Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label className={errors.consultationDate ? "text-red-500" : ""}>
                      Consultation Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.consultationDate && "text-muted-foreground",
                            errors.consultationDate && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.consultationDate ? format(formData.consultationDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.consultationDate}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('consultationDate', date);
                              setIsCalendarOpen(false);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <Label className={!formData.consultationTime ? "invisible text-sm font-medium" : "text-sm font-medium text-blue-700"}>
                        {formData.consultationTime ? "Selected Time" : "Action"}
                      </Label>

                      {formData.consultationTime ? (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md h-10 w-full">
                          <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-green-800 text-sm truncate flex-1 leading-none">
                            {(() => {
                              const formatTime = (time: string) => {
                                const [hours, minutes] = time.split(':');
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                return `${displayHour}:${minutes} ${ampm}`;
                              };
                              return formatTime(formData.consultationTime);
                            })()}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                            onClick={() => {
                              if (onOpenCalendar) {
                                onOpenCalendar(getCurrentFormData());
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            if (onOpenCalendar) {
                              onOpenCalendar(getCurrentFormData());
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Open Calendar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>
                      Assign To <span className="text-gray-500 text-sm">(Optional)</span>
                    </Label>
                    <Select
                      value={formData.assignedUserId || "unassigned"}
                      onValueChange={(value) => handleInputChange('assignedUserId', value === "unassigned" ? undefined : value)}
                      disabled={loadingUsers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              {user.full_name} ({user.email})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Consultation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
