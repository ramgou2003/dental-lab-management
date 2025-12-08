import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, User, Package } from "lucide-react";
import type { DeliveryItem } from "@/hooks/useDeliveryItems";

interface AppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (appointmentData: {
    date: string;
    time: string;
    notes?: string;
  }) => void;
  deliveryItem: DeliveryItem | null;
}

export function AppointmentScheduler({
  isOpen,
  onClose,
  onSchedule,
  deliveryItem
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");

  // Get current date in EST timezone
  const getTodayInEST = () => {
    const now = new Date();
    const estDateString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
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

  // Generate time slots from 9 AM to 5 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        slots.push({ value: time24, label: time12 });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
      time: selectedTime,
      notes: appointmentNotes.trim() || undefined
    };

    onSchedule(appointmentData);
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setAppointmentNotes("");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 -m-6 mb-0 p-6 rounded-t-lg border-b-2 border-blue-200">
            <div className="p-3 bg-blue-600 rounded-lg shadow-md">
              <CalendarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-900">
                Schedule Insertion Appointment
              </DialogTitle>
              <p className="text-blue-700 mt-1 font-medium">
                Schedule appointment for {deliveryItem.patient_name}
              </p>
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

          {/* Date and Time Selection - Side by Side */}
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
            <div className="col-span-8 space-y-3">
              <Label className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Select Appointment Time <span className="text-sm font-normal text-blue-600">(EST)</span>
              </Label>
              <div className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      variant={selectedTime === slot.value ? "default" : "outline"}
                      className={`
                        ${selectedTime === slot.value
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
                          : 'bg-white hover:bg-blue-50 text-blue-900 border-blue-300 hover:border-blue-500'
                        }
                        font-medium transition-all duration-200
                      `}
                    >
                      <Clock className="h-3 w-3 mr-2" />
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>
              {selectedTime && (
                <p className="text-sm text-blue-700 text-center font-semibold bg-blue-50 py-2 rounded-md">
                  Selected Time: {timeSlots.find(s => s.value === selectedTime)?.label} EST
                </p>
              )}
            </div>
          </div>

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
  );
}
