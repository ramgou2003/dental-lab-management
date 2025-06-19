import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";

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
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');

  // Dummy patient data - replace with actual patient data
  const patients = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Emily Johnson' },
    { id: '3', name: 'Michael Chen' },
    { id: '4', name: 'Sarah Williams' },
    { id: '5', name: 'David Brown' },
    { id: '6', name: 'Lisa Anderson' },
    { id: '7', name: 'Robert Taylor' },
    { id: '8', name: 'Jennifer Davis' },
    { id: '9', name: 'Mark Wilson' },
    { id: '10', name: 'Amanda Garcia' }
  ];

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

  useEffect(() => {
    if (editingAppointment) {
      setSelectedPatient(editingAppointment.patient || '');
      setSelectedAppointmentType(editingAppointment.type || '');
      setSelectedDate(editingAppointment.date ? new Date(editingAppointment.date) : new Date());
      setStartTime(editingAppointment.startTime || '09:00');
      setEndTime(editingAppointment.endTime || '09:30');
    } else {
      setSelectedPatient('');
      setSelectedAppointmentType(appointmentType || '');
      setSelectedDate(initialDate || new Date());
      setStartTime(initialTime || '09:00');
      setEndTime(initialEndTime || '09:30');
    }
  }, [editingAppointment, initialDate, initialTime, initialEndTime, appointmentType, isOpen]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedAppointmentType) {
      return;
    }

    const appointmentData = {
      id: editingAppointment?.id || `apt_${Date.now()}`,
      title: selectedAppointmentType, // Use appointment type as title
      patient: selectedPatient,
      date: selectedDate.toISOString().split('T')[0],
      startTime: startTime,
      endTime: endTime,
      type: selectedAppointmentType,
      status: 'scheduled',
      notes: ''
    };

    onSave(appointmentData);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPatient('');
    setSelectedAppointmentType('');
    setSelectedDate(new Date());
    setStartTime('09:00');
    setEndTime('09:30');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              New Appointment
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Create a new appointment by selecting patient, date, time, and appointment type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Patient *
            </label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.name}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Appointment Type *
            </label>
            <Select value={selectedAppointmentType} onValueChange={setSelectedAppointmentType}>
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
            <label className="text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
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
              <label className="text-sm font-medium text-gray-700">
                End Time *
              </label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!selectedPatient || !selectedAppointmentType}
            >
              {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
