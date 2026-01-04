import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, User, Package, Edit, Users, ListTree } from "lucide-react";
import type { DeliveryItem } from "@/hooks/useDeliveryItems";
import { AppointmentSchedulerDialog } from "./calendar/AppointmentSchedulerDialog";

interface AppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (appointmentData: {
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    existingAppointmentId?: string;
    assignedUserId?: string;
    subtype?: string;
  }) => void;
  deliveryItem: DeliveryItem | null;
}

// Subtype options for Appliance-delivery (copied from AppointmentForm)
const APPLIANCE_DELIVERY_SUBTYPES = [
  { value: 'printed-try-in-delivery', label: 'Printed Try-in Delivery' },
  { value: '82-day-appliance-delivery', label: '82 Days PTI Delivery' },
  { value: '120-day-final-delivery', label: '120 Days Final Delivery' }
];

export function AppointmentScheduler({
  isOpen,
  onClose,
  onSchedule,
  deliveryItem
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [isSchedulerDialogOpen, setIsSchedulerDialogOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // New fields state
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>("");
  const [selectedSubtype, setSelectedSubtype] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (isOpen && deliveryItem?.patient_id) {
      fetchUpcomingAppointments();
    }
  }, [isOpen, deliveryItem?.patient_id]);

  const fetchUpcomingAppointments = async () => {
    if (!deliveryItem?.patient_id) return;

    setLoadingAppointments(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', deliveryItem.patient_id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setUpcomingAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleTimeSlotSelect = (appointmentData: {
    startTime: string;
    endTime: string;
    date: string;
  }) => {
    setSelectedTime(appointmentData.startTime);
    setSelectedEndTime(appointmentData.endTime);

    // Also update the date if the scheduler changed it
    const [year, month, day] = appointmentData.date.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));

    // Clear existing appointment selection since we are picking a new time slot
    setSelectedAppointmentId(null);

    setIsSchedulerDialogOpen(false);
  };

  // Get current date in EST timezone
  const getTodayInEST = () => {
    const now = new Date();
    const estDateString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(estDateString);
    estDate.setHours(0, 0, 0, 0);
    return estDate;
  };

  // Format a date object for display (assumes the date is already correct, just formats it)
  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create a new date with just the year, month, day (no time component)
    const displayDate = new Date(year, month, day);

    return displayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    // Format date directly from the selected date without timezone conversion
    // This preserves the exact date the user selected in the calendar
    const formatDateForDatabase = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const appointmentData = {
      date: formatDateForDatabase(selectedDate),
      startTime: selectedTime,
      endTime: selectedEndTime,
      notes: appointmentNotes.trim() || undefined,
      existingAppointmentId: selectedAppointmentId || undefined,
      assignedUserId: assignedUserId || undefined,
      subtype: selectedSubtype || undefined
    };

    onSchedule(appointmentData as any);

    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedEndTime("");
    setAppointmentNotes("");
    setSelectedAppointmentId(null);
    setAssignedUserId("");
    setSelectedSubtype("");
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setAppointmentNotes("");
    onClose();
  };

  // Allow all dates (past and future) to be selected
  const isDateDisabled = (date: Date) => {
    // No dates are disabled - allow selecting past dates for backdated appointments
    return false;
  };

  if (!deliveryItem) return null;

  return (
    <>
      <Dialog
        open={isOpen && !isSchedulerDialogOpen}
        onOpenChange={(open) => {
          // Only call onClose if the dialog is being closed by user action
          // and NOT because we are switching to the scheduler dialog
          if (!open && !isSchedulerDialogOpen) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 -m-6 mb-0 p-6 rounded-t-lg border-b-2 border-blue-200">
              <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                <CalendarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-blue-900">
                  Schedule Insertion Appointment
                </DialogTitle>
                <p className="text-blue-700 mt-1 font-medium">
                  Schedule appointment for {deliveryItem.patient_name}
                </p>
              </div>
              <div className="bg-white/50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">EST Timezone</span>
                <span className="text-sm font-semibold text-blue-800">{new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Patient and Appliance Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Patient & Appliance Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-blue-800">Patient:</span>
                  <span className="ml-2 text-blue-900">{deliveryItem.patient_name}</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800">Arch Type:</span>
                  <span className="ml-2 text-blue-900 capitalize">{deliveryItem.arch_type}</span>
                </div>
                {deliveryItem.upper_appliance_type && (
                  <div>
                    <span className="font-semibold text-blue-800">Upper Appliance:</span>
                    <span className="ml-2 text-blue-900">{deliveryItem.upper_appliance_type}</span>
                    {deliveryItem.upper_appliance_number && (
                      <span className="ml-1 text-blue-700">({deliveryItem.upper_appliance_number})</span>
                    )}
                  </div>
                )}
                {deliveryItem.lower_appliance_type && (
                  <div>
                    <span className="font-semibold text-blue-800">Lower Appliance:</span>
                    <span className="ml-2 text-blue-900">{deliveryItem.lower_appliance_type}</span>
                    {deliveryItem.lower_appliance_number && (
                      <span className="ml-1 text-blue-700">({deliveryItem.lower_appliance_number})</span>
                    )}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-blue-800">Shade:</span>
                  <span className="ml-2 text-blue-900">{deliveryItem.shade}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments for Patient */}
            <div className="space-y-4">
              <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Existing Upcoming Appointments
              </Label>

              {loadingAppointments ? (
                <div className="text-center py-4 text-blue-600">Loading appointments...</div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAppointmentId === apt.id
                        ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-100'
                        : 'border-blue-100 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      onClick={() => {
                        if (selectedAppointmentId === apt.id) {
                          // Unselect
                          setSelectedAppointmentId(null);
                          setSelectedDate(undefined);
                          setSelectedTime("");
                          setSelectedEndTime("");
                        } else {
                          // Select
                          setSelectedAppointmentId(apt.id);
                          const [year, month, day] = apt.date.split('-').map(Number);
                          setSelectedDate(new Date(year, month - 1, day));
                          setSelectedTime(apt.start_time);
                          setSelectedEndTime(apt.end_time);
                          // Also pre-fill the subtype if compatible/available on the appointment? 
                          // For now just taking time/date as before.
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                          {apt.appointment_type || 'Appointment'}
                        </span>
                        {selectedAppointmentId === apt.id && (
                          <div className="bg-blue-600 rounded-full p-1 shadow-sm">
                            <Clock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-blue-900 truncate">{apt.title || 'No Title'}</p>
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex items-center text-blue-700 gap-2">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>{new Date(apt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center text-blue-700 gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {(() => {
                              const formatTimeLocal = (time: string) => {
                                const [hours, minutes] = time.split(':');
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                return `${displayHour}:${minutes} ${ampm}`;
                              };
                              return `${formatTimeLocal(apt.start_time)} - ${formatTimeLocal(apt.end_time)}`;
                            })()}
                          </span>
                        </div>
                      </div>
                      {selectedAppointmentId === apt.id && (
                        <p className="mt-3 text-xs font-bold text-blue-600 bg-blue-100/50 p-2 rounded-lg border border-blue-200 text-center">
                          SELECTED FOR DELIVERY
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                  No upcoming appointments found for this patient.
                </div>
              )}

              {upcomingAppointments.length > 0 && (
                <p className="text-sm text-blue-600 italic">
                  Tip: Selecting an existing appointment will link this delivery to it.
                </p>
              )}
            </div>

            {/* Date and Time Selection - Side by Side (Only shown if no existing appointment is selected) */}
            {!selectedAppointmentId && (
              <>
                <div className="grid grid-cols-12 gap-6">
                  {/* Date Selection - Left Side (Narrower - 4 columns) */}
                  <div className="col-span-4 space-y-3">
                    <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                      Select Date <span className="text-sm font-normal text-blue-600">(EST)</span>
                    </Label>
                    <div className="flex justify-center bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm">
                      <style>{`
                        .rdp-day_today {
                          background-color: rgb(219 234 254) !important;
                          color: rgb(30 64 175) !important;
                          font-weight: 600 !important;
                        }
                        .rdp-day_today:hover {
                          background-color: rgb(191 219 254) !important;
                        }
                      `}</style>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => isDateDisabled(date)}
                        defaultMonth={getTodayInEST()}
                        today={getTodayInEST()}
                        className="rounded-md"
                      />
                    </div>
                    {selectedDate && (
                      <p className="text-sm text-blue-700 text-center font-semibold bg-blue-50 py-2 rounded-md mt-3">
                        Selected: {formatDateForDisplay(selectedDate)} (EST)
                      </p>
                    )}
                  </div>

                  {/* Time Selection - Right Side (Wider - 8 columns) */}
                  <div className="col-span-8 flex flex-col space-y-4">
                    <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Select Appointment Time <span className="text-sm font-normal text-blue-600">(EST)</span>
                    </Label>

                    <div className="flex-1 flex flex-col justify-center min-h-[220px] bg-white rounded-xl border-2 border-blue-50 p-4">
                      {selectedTime && selectedEndTime ? (
                        /* Selected Time Display */
                        <div className="flex items-center gap-4 p-6 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm">
                          <div className="p-3 bg-green-100 rounded-full">
                            <Clock className="h-8 w-8 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-700 uppercase tracking-wider">Selected Slot</p>
                            <p className="text-2xl font-bold text-green-900">
                              {(() => {
                                const formatTimeLocal = (time: string) => {
                                  const [hours, minutes] = time.split(':');
                                  const hour = parseInt(hours);
                                  const ampm = hour >= 12 ? 'PM' : 'AM';
                                  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                  return `${displayHour}:${minutes} ${ampm}`;
                                };
                                return `${formatTimeLocal(selectedTime)} - ${formatTimeLocal(selectedEndTime)}`;
                              })()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="border-green-300 text-green-700 hover:bg-green-100 hover:border-green-500 font-bold px-6 h-14"
                            onClick={() => setIsSchedulerDialogOpen(true)}
                          >
                            <Edit className="h-5 w-5 mr-2" />
                            Edit Time
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="bg-white rounded-xl border-2 border-dashed border-blue-200 p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSchedulerDialogOpen(true);
                          }}
                        >
                          <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                            <CalendarIcon className="h-10 w-10 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-blue-900">Choose a time slot</h4>
                            <p className="text-blue-600">Open the interactive calendar to pick a time</p>
                          </div>
                          <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-6 text-lg shadow-lg"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsSchedulerDialogOpen(true);
                            }}
                          >
                            Open Calendar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned To and Subtype */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Assigned To */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Assigned To
                    </Label>
                    <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Appointment Subtype */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <ListTree className="h-5 w-5 text-blue-600" />
                      Appointment Subtype
                    </Label>
                    <Select value={selectedSubtype} onValueChange={setSelectedSubtype}>
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select subtype..." />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLIANCE_DELIVERY_SUBTYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Appointment Notes */}
            <div className="space-y-3">
              <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Add any special instructions or notes for the appointment..."
                className="min-h-[100px] border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t-2 border-blue-200">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleAppointment}
                disabled={!selectedDate || !selectedTime}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentSchedulerDialog
        open={isSchedulerDialogOpen}
        onOpenChange={setIsSchedulerDialogOpen}
        patientName={deliveryItem.patient_name}
        patientId={deliveryItem.patient_id || ""}
        initialDate={selectedDate}
        appointmentType="Appliance-delivery"
        onSchedule={(data) => handleTimeSlotSelect({
          startTime: data.startTime,
          endTime: data.endTime,
          date: data.date
        })}
      />
    </>
  );
}
