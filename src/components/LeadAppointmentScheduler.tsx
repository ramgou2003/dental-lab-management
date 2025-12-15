import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarPlus, Clock, User, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/lib/supabase";

interface LeadAppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentScheduled?: () => void;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  existingAppointment?: any; // For rescheduling
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

export function LeadAppointmentScheduler({
  isOpen,
  onClose,
  onAppointmentScheduled,
  leadId,
  leadName,
  leadEmail,
  leadPhone,
  existingAppointment
}: LeadAppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { appointments, addAppointment, deleteAppointment } = useAppointments();

  // Fetch users for assignment
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) throw error;
      if (data) {
        setUsers(data);

        // Set DC as default assigned user for consultation appointments (only if not rescheduling)
        if (!existingAppointment) {
          const dcUser = data.find(user => user.full_name.trim().toLowerCase() === 'dc');
          if (dcUser) {
            setSelectedUserId(dcUser.id);
          }
        }
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
    fetchUsers();
  }, []);

  // Initialize form with existing appointment data when rescheduling
  useEffect(() => {
    if (existingAppointment && isOpen) {
      // Set assigned user if exists
      if (existingAppointment.assigned_user_id) {
        setSelectedUserId(existingAppointment.assigned_user_id);
      }
      // Set notes if exists
      if (existingAppointment.notes) {
        setAppointmentNotes(existingAppointment.notes);
      }
    }
  }, [existingAppointment, isOpen]);

  // Generate time slots in 15-minute intervals for 30-minute appointments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
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

  // Calculate end time (30 minutes after start time)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 30; // Add 30 minutes
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Check if a time slot conflicts with existing consultation appointments
  const isTimeSlotAvailable = (date: Date, startTime: string): boolean => {
    if (!date) return true;

    const dateStr = formatDateForDatabase(date);
    const endTime = calculateEndTime(startTime);
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const proposedStart = startHour * 60 + startMinute;
    const proposedEnd = endHour * 60 + endMinute;

    // Check for conflicts with existing consultation appointments on the same date
    const conflictingAppointments = appointments.filter(apt => 
      apt.date === dateStr && apt.type === 'consultation'
    );

    return !conflictingAppointments.some(apt => {
      const [aptStartHour, aptStartMinute] = apt.startTime.split(':').map(Number);
      const [aptEndHour, aptEndMinute] = apt.endTime.split(':').map(Number);
      
      const aptStart = aptStartHour * 60 + aptStartMinute;
      const aptEnd = aptEndHour * 60 + aptEndMinute;

      // Check if time ranges overlap
      return !(proposedEnd <= aptStart || proposedStart >= aptEnd);
    });
  };

  // Format date for database storage
  const formatDateForDatabase = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if date is disabled (weekends or past dates)
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    const isPastDate = date < today;
    
    return isWeekend || isPastDate;
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots;
    
    return timeSlots.filter(slot => isTimeSlotAvailable(selectedDate, slot.value));
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (!isTimeSlotAvailable(selectedDate, selectedTime)) {
      toast.error('Selected time slot is no longer available');
      return;
    }

    setIsSubmitting(true);

    try {
      const endTime = calculateEndTime(selectedTime);

      // If rescheduling, delete the existing appointment first
      if (existingAppointment) {
        console.log('Deleting existing appointment:', existingAppointment.id);
        await deleteAppointment(existingAppointment.id);
      }

      const appointmentData = {
        title: 'Consultation',
        patient: leadName,
        patientId: null, // Set to null since this is a lead, not an existing patient
        assignedUserId: selectedUserId || undefined,
        date: formatDateForDatabase(selectedDate),
        startTime: selectedTime,
        endTime: endTime,
        type: 'consultation',
        status: 'pending' as const,
        notes: appointmentNotes.trim() || `Lead appointment for ${leadName} (Lead ID: ${leadId})`
      };

      console.log('Scheduling appointment with data:', appointmentData);
      await addAppointment(appointmentData);
      
      const actionText = existingAppointment ? 'rescheduled' : 'scheduled';
      toast.success(`Consultation appointment ${actionText} for ${leadName} on ${selectedDate.toLocaleDateString()} at ${timeSlots.find(slot => slot.value === selectedTime)?.label}`);

      // Reset form and close
      setSelectedDate(undefined);
      setSelectedTime("");
      setAppointmentNotes("");
      setSelectedUserId("");

      // Call the callback to refresh appointments
      if (onAppointmentScheduled) {
        onAppointmentScheduled();
      } else {
        onClose();
      }
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);

      // Show more specific error message
      let errorMessage = 'Failed to schedule appointment. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Failed to schedule appointment: ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setSelectedTime("");
      setAppointmentNotes("");
      setSelectedUserId("");
    }
  }, [isOpen]);

  const availableTimeSlots = getAvailableTimeSlots();
  const selectedTimeSlot = timeSlots.find(slot => slot.value === selectedTime);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {existingAppointment ? 'Reschedule Consultation' : 'Schedule Consultation'}
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                {existingAppointment
                  ? `Reschedule the consultation appointment for ${leadName}`
                  : `Schedule a consultation appointment for ${leadName}`
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Lead Information */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{leadName}</h3>
                <div className="text-sm text-gray-600 flex gap-4">
                  {leadEmail && <span>📧 {leadEmail}</span>}
                  {leadPhone && <span>📞 {leadPhone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time Selection Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Date Selection Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
              </div>

              {/* Custom Date Picker */}
              <div className="bg-white border rounded-lg p-6 h-[480px] flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="w-full flex justify-center"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-sm font-medium text-gray-900",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-gray-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex w-full mb-2",
                    head_cell: "text-gray-500 rounded-md w-full font-normal text-[0.8rem] text-center flex-1",
                    row: "flex w-full",
                    cell: "text-center text-sm p-1 relative flex-1 flex justify-center items-center",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center text-sm",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-full",
                    day_today: "bg-blue-100 text-blue-900 font-semibold rounded-full",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                    day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                    day_hidden: "invisible",
                  }}
                />
                {selectedDate && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      📅 {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Time Selection Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Time</h3>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">30 min consultation</Badge>
              </div>

              {selectedDate ? (
                <div className="bg-white border rounded-lg p-6 h-[480px] flex flex-col">
                  {availableTimeSlots.length > 0 ? (
                    <div className="flex flex-col h-full">
                      <p className="text-sm text-gray-600 mb-3">Available time slots:</p>
                      <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1 pr-2" style={{scrollbarWidth: 'thin'}}>
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            onClick={() => setSelectedTime(slot.value)}
                            className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              selectedTime === slot.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3" />
                              {slot.label}
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedTime && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-900">
                            🕒 Selected: {timeSlots.find(slot => slot.value === selectedTime)?.label} - {timeSlots.find(slot => slot.value === calculateEndTime(selectedTime))?.label}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">No available time slots</p>
                        <p className="text-xs text-yellow-700 mt-1">Please select a different date to see available consultation times.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-6 h-[480px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Select a date to view available time slots</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Assignment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Assign To</h3>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <Select
                value={selectedUserId || "unassigned"}
                onValueChange={(value) => {
                  setSelectedUserId(value === "unassigned" ? "" : value);
                }}
                disabled={loadingUsers}
              >
                <SelectTrigger className="border-0 p-0 focus:ring-0 h-auto">
                  <SelectValue placeholder="Select a user to assign this appointment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <Textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Add any special notes, requirements, or instructions for this consultation..."
                rows={3}
                className="border-0 p-0 focus:ring-0 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {selectedDate && selectedTime && (
                <span>📅 {selectedDate.toLocaleDateString()} at {timeSlots.find(slot => slot.value === selectedTime)?.label}</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleAppointment}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {existingAppointment ? 'Rescheduling...' : 'Scheduling...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    {existingAppointment ? 'Reschedule Consultation' : 'Schedule Consultation'}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
