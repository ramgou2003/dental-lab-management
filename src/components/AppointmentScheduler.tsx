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

    // Format date in EST timezone
    const formatDateForDatabase = (date: Date) => {
      const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
      const year = estDate.getFullYear();
      const month = String(estDate.getMonth() + 1).padStart(2, '0');
      const day = String(estDate.getDate()).padStart(2, '0');
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

  // Disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Disable weekends (optional - remove if you want weekend appointments)
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  if (!deliveryItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Schedule Insertion Appointment
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                Schedule appointment for {deliveryItem.patient_name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Patient and Appliance Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient & Appliance Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Patient:</span>
                <span className="ml-2 text-gray-900">{deliveryItem.patient_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Arch Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{deliveryItem.arch_type}</span>
              </div>
              {deliveryItem.upper_appliance_type && (
                <div>
                  <span className="font-medium text-gray-700">Upper Appliance:</span>
                  <span className="ml-2 text-gray-900">{deliveryItem.upper_appliance_type}</span>
                  {deliveryItem.upper_appliance_number && (
                    <span className="ml-1 text-gray-600">({deliveryItem.upper_appliance_number})</span>
                  )}
                </div>
              )}
              {deliveryItem.lower_appliance_type && (
                <div>
                  <span className="font-medium text-gray-700">Lower Appliance:</span>
                  <span className="ml-2 text-gray-900">{deliveryItem.lower_appliance_type}</span>
                  {deliveryItem.lower_appliance_number && (
                    <span className="ml-1 text-gray-600">({deliveryItem.lower_appliance_number})</span>
                  )}
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Shade:</span>
                <span className="ml-2 text-gray-900">{deliveryItem.shade}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Appointment Date
            </Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isDateDisabled(date) || isWeekend(date)}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-gray-600 text-center">
                Selected: {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'America/New_York'
                })}
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select Appointment Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose appointment time" />
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

          {/* Appointment Notes */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Appointment Notes (Optional)
            </Label>
            <Textarea
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              placeholder="Add any special instructions or notes for the appointment..."
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              disabled={!selectedDate || !selectedTime}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
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
