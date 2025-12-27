import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  initialDate?: Date;
  initialTime?: string;
  initialEndTime?: string;
  appointmentType?: string;
  appointmentSubtype?: string;
  initialPatientName?: string;
  initialPatientId?: string;
  editingAppointment?: any;
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime,
  initialEndTime,
  appointmentType,
  appointmentSubtype,
  initialPatientName,
  initialPatientId,
  editingAppointment
}: AppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = useState(''); // Patient name for display
  const [selectedPatientId, setSelectedPatientId] = useState(''); // Patient ID for database
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [notes, setNotes] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(''); // Assigned user ID
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Subtype options based on appointment type
  const subtypeOptions: Record<string, { value: string; label: string }[]> = {
    'follow-up': [
      { value: '7-day-followup', label: '7 Day Follow-up' },
      { value: '30-day-followup', label: '30 Days Follow-up' },
      { value: 'observation-followup', label: 'Follow-up for Observation' },
      { value: '3-month-followup', label: '3 Months Follow Up' },
      { value: '6-month-followup', label: '6 Months Follow Up' },
      { value: '12-month-followup', label: '12 Months Follow Up' }
    ],
    'printed-try-in': [
      { value: 'printed-try-in-delivery', label: 'Printed Try-in Delivery' },
      { value: '82-day-appliance-delivery', label: '82 Days PTI Delivery' },
      { value: '120-day-final-delivery', label: '120 Days Final Delivery' }
    ],
    'data-collection': [
      { value: '75-day-data-collection', label: '75 Days Data Collection for PTI' },
      { value: 'final-data-collection', label: 'Final Data Collection' },
      { value: 'data-collection-printed-try-in', label: 'Data collection for Printed-try-in' }
    ]
  };

  // Helper function to format date for input (YYYY-MM-DD) using EST timezone
  const formatDateForInput = (date: Date) => {
    // Convert to EST timezone
    const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const year = estDate.getFullYear();
    const month = String(estDate.getMonth() + 1).padStart(2, '0');
    const day = String(estDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date from input string in EST timezone
  const createDateFromInput = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in EST timezone
    const estDate = new Date();
    estDate.setFullYear(year, month - 1, day); // month is 0-indexed
    estDate.setHours(12, 0, 0, 0); // Set to noon EST to avoid timezone edge cases
    return estDate;
  };

  // Helper function to format date for database in EST
  const formatDateForDatabase = (date: Date) => {
    // Convert to EST timezone
    const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const year = estDate.getFullYear();
    const month = String(estDate.getMonth() + 1).padStart(2, '0');
    const day = String(estDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch real patients from Supabase
  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      // Check if this is a consultation appointment
      const isConsultation = selectedAppointmentType === 'consultation' ||
                            editingAppointment?.type === 'consultation';

      if (isConsultation) {
        // Fetch from both patients and consultation_patients tables
        const [regularPatientsResult, consultationPatientsResult] = await Promise.all([
          supabase
            .from('patients')
            .select('id, full_name, first_name, last_name')
            .order('full_name', { ascending: true }),
          supabase
            .from('consultation_patients')
            .select('id, first_name, last_name')
            .order('first_name', { ascending: true })
        ]);

        const regularPatients = regularPatientsResult.data || [];
        const consultationPatients = (consultationPatientsResult.data || []).map(cp => ({
          id: cp.id,
          first_name: cp.first_name,
          last_name: cp.last_name,
          full_name: `${cp.first_name} ${cp.last_name}`.trim()
        }));

        // Combine both lists, removing duplicates by ID
        const allPatients = [...regularPatients, ...consultationPatients];
        const uniquePatients = Array.from(
          new Map(allPatients.map(p => [p.id, p])).values()
        );

        setPatients(uniquePatients);
      } else {
        // For non-consultation appointments, only fetch from patients table
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, first_name, last_name')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching patients:', error);
          return;
        }

        if (data) {
          setPatients(data);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch users from Supabase for assignment
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        setUsers(data);

        // Set DC as default assigned user for new consultation appointments
        const isConsultation = selectedAppointmentType === 'consultation' || appointmentType === 'consultation';
        if (isConsultation && !editingAppointment && !selectedUserId) {
          const dcUser = data.find(user => user.full_name.trim().toLowerCase() === 'dc');
          if (dcUser) {
            setSelectedUserId(dcUser.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Appointment types matching calendar columns
  const appointmentTypes = [
    { id: 'consultation', name: 'Consult' },
    { id: 'follow-up', name: 'Follow Up' },
    { id: 'data-collection', name: 'Data Collection' },
    { id: 'printed-try-in', name: 'Appliance Delivery' },
    { id: 'surgery', name: 'Surgery' },
    { id: 'surgical-revision', name: 'Surgical Revision' },
    { id: 'emergency', name: 'Emergency' }
  ];

  // Generate time slots for dropdowns (15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch patients and users when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchUsers();
    }
  }, [isOpen]);

  // Refetch patients when appointment type changes (without resetting form)
  useEffect(() => {
    if (isOpen && selectedAppointmentType) {
      fetchPatients();
    }
  }, [selectedAppointmentType]);

  // Reset subtype when appointment type changes
  useEffect(() => {
    if (isOpen && selectedAppointmentType) {
      // Check if the new appointment type has subtypes
      const hasSubtypes = subtypeOptions[selectedAppointmentType];

      // If the new type doesn't have subtypes, clear the subtype
      if (!hasSubtypes && selectedSubtype) {
        setSelectedSubtype('');
      }

      // If the new type has subtypes, check if the current subtype is valid for this type
      if (hasSubtypes && selectedSubtype) {
        const validSubtypes = subtypeOptions[selectedAppointmentType].map(s => s.value);
        if (!validSubtypes.includes(selectedSubtype)) {
          setSelectedSubtype('');
        }
      }
    }
  }, [selectedAppointmentType, isOpen]);

  // Initialize form when dialog opens (only run once when dialog opens)
  useEffect(() => {
    if (isOpen) {
      console.log('Form initializing with:', {
        editingAppointment,
        appointmentType,
        initialDate,
        initialTime,
        initialEndTime
      });

      if (editingAppointment) {
        console.log('🔄 Initializing form with editing appointment:', editingAppointment);
        console.log('👤 Assigned User ID from appointment:', editingAppointment.assignedUserId);

        setSelectedPatient(editingAppointment.patient || '');
        setSelectedPatientId(editingAppointment.patientId || '');
        setSelectedUserId(editingAppointment.assignedUserId || '');

        // If we don't have a patient ID but have a patient name, try to find the ID
        if (!editingAppointment.patientId && editingAppointment.patient && patients.length > 0) {
          const patient = patients.find(p => p.full_name === editingAppointment.patient);
          if (patient) {
            setSelectedPatientId(patient.id);
          }
        }

        setSelectedAppointmentType(editingAppointment.type || '');
        setSelectedSubtype(editingAppointment.subtype || '');

        // Handle date properly in EST timezone
        if (editingAppointment.date) {
          setSelectedDate(createDateFromInput(editingAppointment.date));
        } else {
          setSelectedDate(new Date());
        }

        // Format time to HH:MM (remove seconds if present)
        const formatTimeForSelect = (timeString: string) => {
          if (!timeString) return '09:00';
          const [hours, minutes] = timeString.split(':');
          return `${hours}:${minutes}`;
        };

        setStartTime(formatTimeForSelect(editingAppointment.startTime) || '09:00');
        setEndTime(formatTimeForSelect(editingAppointment.endTime) || '09:30');
        setNotes(editingAppointment.notes || '');
      } else {
        // Reset form for new appointment (only when dialog first opens)
        // Set initial patient if provided
        if (initialPatientName) {
          setSelectedPatient(initialPatientName);
        } else {
          setSelectedPatient('');
        }

        if (initialPatientId) {
          setSelectedPatientId(initialPatientId);
        } else {
          setSelectedPatientId('');
        }

        setSelectedUserId('');
        setNotes('');

        // Set initial subtype if provided
        if (appointmentSubtype && appointmentSubtype.trim() !== '') {
          setSelectedSubtype(appointmentSubtype);
        } else {
          setSelectedSubtype('');
        }

        // Only set appointment type if it's valid
        if (appointmentType && appointmentType.trim() !== '') {
          setSelectedAppointmentType(appointmentType);
        } else {
          setSelectedAppointmentType('');
        }

        // Set date
        if (initialDate) {
          setSelectedDate(initialDate);
        } else {
          setSelectedDate(new Date());
        }

        // Set times with validation
        if (initialTime && initialTime.trim() !== '') {
          setStartTime(initialTime);
        } else {
          setStartTime('09:00');
        }

        if (initialEndTime && initialEndTime.trim() !== '') {
          setEndTime(initialEndTime);
        } else {
          setEndTime('09:30');
        }
      }
    }
  }, [isOpen]);

  // Update patient ID when patients list is loaded (for edit mode)
  useEffect(() => {
    if (editingAppointment && !selectedPatientId && editingAppointment.patient && patients.length > 0) {
      const patient = patients.find(p => p.full_name === editingAppointment.patient);
      if (patient) {
        setSelectedPatientId(patient.id);
      }
    }
  }, [patients, editingAppointment, selectedPatientId]);

  // Clear patient search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPatientSearchQuery('');
    }
  }, [isOpen]);

  // Clear subtype when appointment type changes (unless editing)
  useEffect(() => {
    if (!editingAppointment) {
      setSelectedSubtype('');
    }
  }, [selectedAppointmentType, editingAppointment]);

  // Watch for prop changes and update form accordingly (but not appointment type - that's set on open)
  useEffect(() => {
    if (isOpen && !editingAppointment) {
      console.log('Props changed, updating form:', { initialTime, initialEndTime });

      if (initialTime && initialTime.trim() !== '' && initialTime !== startTime) {
        setStartTime(initialTime);
      }

      if (initialEndTime && initialEndTime.trim() !== '' && initialEndTime !== endTime) {
        setEndTime(initialEndTime);
      }

      if (initialDate && initialDate !== selectedDate) {
        setSelectedDate(initialDate);
      }
    }
  }, [initialTime, initialEndTime, initialDate, isOpen, editingAppointment, startTime, endTime, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId || !selectedAppointmentType) {
      return;
    }

    // Validate subtype is required for appointment types that have subtypes
    if (selectedAppointmentType && subtypeOptions[selectedAppointmentType] && !selectedSubtype) {
      toast({
        title: "Validation Error",
        description: "Please select an appointment subtype",
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      id: editingAppointment?.id || `apt_${Date.now()}`,
      title: selectedAppointmentType, // Use appointment type as title
      patient: selectedPatient, // Patient name for display
      patientId: selectedPatientId, // Patient ID for database
      assignedUserId: selectedUserId || undefined, // Assigned user ID
      date: formatDateForDatabase(selectedDate),
      startTime: startTime,
      endTime: endTime,
      type: selectedAppointmentType,
      subtype: selectedSubtype || undefined, // Appointment subtype
      status: editingAppointment?.status || 'Not Confirmed', // Preserve existing status or use default
      statusCode: editingAppointment?.statusCode || '?????' as const, // Preserve existing status code or use default
      notes: notes.trim() || undefined
    };

    console.log('📝 Saving appointment with data:', appointmentData);
    console.log('👤 Selected User ID:', selectedUserId);
    onSave(appointmentData);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPatient('');
    setSelectedPatientId('');
    setSelectedUserId('');
    setSelectedAppointmentType('');
    setSelectedSubtype('');
    setSelectedDate(new Date());
    setStartTime('09:00');
    setEndTime('09:30');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">
            New Appointment
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new appointment by selecting patient, date, time, and appointment type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Row 1: Patient and Appointment Type */}
          <div className="grid grid-cols-2 gap-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                Patient *
              </label>
              <Select
                value={selectedPatientId || undefined}
                onValueChange={(patientId) => {
                  setSelectedPatientId(patientId);
                  // Find the patient name for display
                  const patient = patients.find(p => p.id === patientId);
                  setSelectedPatient(patient?.full_name || '');
                }}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {/* Search Bar */}
                  <div className="sticky top-0 bg-white z-10 p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search patients..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Patient List */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {patients
                      .filter(patient => {
                        if (!patientSearchQuery.trim()) return true;
                        const query = patientSearchQuery.toLowerCase();
                        return (
                          patient.full_name.toLowerCase().includes(query) ||
                          patient.first_name.toLowerCase().includes(query) ||
                          patient.last_name.toLowerCase().includes(query)
                        );
                      })
                      .map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    {patients.filter(patient => {
                      if (!patientSearchQuery.trim()) return true;
                      const query = patientSearchQuery.toLowerCase();
                      return (
                        patient.full_name.toLowerCase().includes(query) ||
                        patient.first_name.toLowerCase().includes(query) ||
                        patient.last_name.toLowerCase().includes(query)
                      );
                    }).length === 0 && (
                      <div className="py-6 text-center text-sm text-gray-500">
                        No patients found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                Appointment Type *
              </label>
              <Select value={selectedAppointmentType || undefined} onValueChange={setSelectedAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Subtype Selection - Conditional */}
            {selectedAppointmentType && subtypeOptions[selectedAppointmentType] && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700">
                  Appointment Subtype *
                </label>
                <Select value={selectedSubtype || undefined} onValueChange={setSelectedSubtype}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypeOptions[selectedAppointmentType].map((subtype) => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Row 2: Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                Date *
              </label>
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e) => setSelectedDate(createDateFromInput(e.target.value))}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                Start Time *
              </label>
              <Select value={startTime || undefined} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                End Time *
              </label>
              <Select value={endTime || undefined} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-700">
              Assign To
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Unassigned button */}
              <Button
                type="button"
                variant={selectedUserId === "" ? "default" : "outline"}
                className={`${
                  selectedUserId === ""
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
                onClick={() => {
                  console.log('👤 User selection changed:', { from: selectedUserId, to: "" });
                  setSelectedUserId("");
                }}
                disabled={loadingUsers}
              >
                Unassigned
              </Button>

              {/* User buttons */}
              {users.map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  variant={selectedUserId === user.id ? "default" : "outline"}
                  className={`${
                    selectedUserId === user.id
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-blue-300 text-blue-700 hover:bg-blue-50"
                  }`}
                  onClick={() => {
                    console.log('👤 User selection changed:', { from: selectedUserId, to: user.id });
                    setSelectedUserId(user.id);
                  }}
                  disabled={loadingUsers}
                >
                  {user.full_name}
                </Button>
              ))}

              {users.length === 0 && !loadingUsers && (
                <p className="text-sm text-gray-500 col-span-4">No users found</p>
              )}

              {loadingUsers && (
                <p className="text-sm text-gray-500 col-span-4">Loading users...</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for this appointment..."
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedPatientId || !selectedAppointmentType}
            >
              {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
