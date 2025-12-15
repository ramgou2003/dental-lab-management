import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
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
  editingAppointment
}: AppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = useState(''); // Patient name for display
  const [selectedPatientId, setSelectedPatientId] = useState(''); // Patient ID for database
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [notes, setNotes] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(''); // Assigned user ID
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
    { id: 'printed-try-in', name: 'Printed Try In' },
    { id: 'follow-up', name: 'Follow Up' },
    { id: 'data-collection', name: 'Data Collection' },
    { id: 'surgery', name: 'Surgery' },
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

  // Fetch patients and users when dialog opens or appointment type changes
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchUsers();
    }
  }, [isOpen, selectedAppointmentType]);

  // Initialize form when dialog opens
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
        // Reset form for new appointment
        setSelectedPatient('');
        setSelectedPatientId('');
        setSelectedUserId('');
        setNotes('');

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
  }, [isOpen, patients]);

  // Watch for prop changes and update form accordingly
  useEffect(() => {
    if (isOpen && !editingAppointment) {
      console.log('Props changed, updating form:', { appointmentType, initialTime, initialEndTime });

      if (appointmentType && appointmentType.trim() !== '' && appointmentType !== selectedAppointmentType) {
        setSelectedAppointmentType(appointmentType);
      }

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
  }, [appointmentType, initialTime, initialEndTime, initialDate, isOpen, editingAppointment, selectedAppointmentType, startTime, endTime, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId || !selectedAppointmentType) {
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
      status: 'pending',
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
    setSelectedDate(new Date());
    setStartTime('09:00');
    setEndTime('09:30');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">
            New Appointment
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new appointment by selecting patient, date, time, and appointment type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
                {patients.length === 0 && !loadingPatients && (
                  <SelectItem value="no-patients" disabled>
                    No patients found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-700">
              Assign To
            </label>
            <Select
              value={selectedUserId || "unassigned"}
              onValueChange={(value) => {
                const newUserId = value === "unassigned" ? "" : value;
                console.log('👤 User selection changed:', { from: selectedUserId, to: newUserId, value });
                setSelectedUserId(newUserId);
              }}
              disabled={loadingUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
                {users.length === 0 && !loadingUsers && (
                  <SelectItem value="no-users" disabled>
                    No users found
                  </SelectItem>
                )}
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

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
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
