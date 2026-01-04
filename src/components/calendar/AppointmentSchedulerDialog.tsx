import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";
import { DayView } from "./DayView";

interface AppointmentSchedulerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientId: string;
  initialDate?: Date; // Date object
  appointmentType?: string;
  appointmentSubtype?: string;
  onSchedule: (appointmentData: {
    type: string;
    subtype: string | null;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}

export function AppointmentSchedulerDialog({
  open,
  onOpenChange,
  patientName,
  patientId,
  initialDate,
  appointmentType,
  appointmentSubtype,
  onSchedule
}: AppointmentSchedulerDialogProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
    type?: string;
  } | null>(null);
  const [clearSelectionTrigger, setClearSelectionTrigger] = useState(0);

  // Set initial date when dialog opens
  useEffect(() => {
    if (open && initialDate) {
      setCurrentDate(initialDate);
    }
    // Reset selection when dialog opens
    if (open) {
      setSelectedTimeSlot(null);
      setClearSelectionTrigger(prev => prev + 1);
    }
  }, [open, initialDate]);

  // Fetch appointments for the selected date
  useEffect(() => {
    if (open) {
      fetchAppointments();
    }
  }, [open, currentDate]);

  const fetchAppointments = async () => {
    const dateString = currentDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateString);

    if (!error && data) {
      // Transform raw appointments to DayView format
      const transformedAppointments = data.map((apt: any) => ({
        id: apt.id,
        title: apt.title || '',
        patient: apt.patient_name || '',
        patientId: apt.patient_id,
        startTime: apt.start_time || '',
        endTime: apt.end_time || '',
        type: apt.appointment_type || 'consultation',
        subtype: apt.subtype || undefined,
        status: apt.status || 'scheduled',
        statusCode: apt.status_code || '?????',
        notes: apt.notes || undefined,
        assignedUserId: apt.assigned_user_id || undefined,
        assignedUserName: apt.assigned_user_name || undefined,
        isEmergency: apt.is_emergency || false,
      }));
      setAppointments(transformedAppointments);
    }
  };

  // Handle time slot selection from DayView
  const handleTimeSlotClick = (startTime: string, endTime: string, appointmentType?: string) => {
    console.log('handleTimeSlotClick called:', { startTime, endTime, appointmentType });
    setSelectedTimeSlot({ startTime, endTime, type: appointmentType });
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedTimeSlot(null);
    setClearSelectionTrigger(prev => prev + 1);
  };

  // Handle done button click
  const handleDone = () => {
    console.log('handleDone called, selectedTimeSlot:', selectedTimeSlot);
    if (!selectedTimeSlot) {
      console.log('No time slot selected, returning');
      return;
    }

    const dateString = currentDate.toISOString().split('T')[0];

    console.log('Calling onSchedule with:', {
      type: appointmentType || '',
      subtype: appointmentSubtype || null,
      date: dateString,
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime
    });

    onSchedule({
      type: selectedTimeSlot.type || appointmentType || '',
      subtype: appointmentSubtype || null,
      date: dateString,
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-4 pb-2 flex-shrink-0">
          <DialogTitle className="text-xl">Select Time - {patientName}</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Click and drag on the calendar to select a time slot, then click Done
          </p>
        </DialogHeader>

        {/* Full Calendar DayView */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-gray-50/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const prevDay = new Date(currentDate);
              prevDay.setDate(prevDay.getDate() - 1);
              setCurrentDate(prevDay);
            }}
          >
            ← Previous Day
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  // Create date at noon to avoid timezone issues with early morning
                  const parts = e.target.value.split('-');
                  const newDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
                  setCurrentDate(newDate);
                }
              }}
              className="border rounded px-2 py-1 text-sm font-medium"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nextDay = new Date(currentDate);
              nextDay.setDate(nextDay.getDate() + 1);
              setCurrentDate(nextDay);
            }}
          >
            Next Day →
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <DayView
            date={currentDate}
            appointments={appointments}
            onAppointmentClick={() => { }}
            onTimeSlotClick={handleTimeSlotClick}
            isDialogOpen={selectedTimeSlot !== null}
            onClearSelection={handleClearSelection}
            clearSelectionTrigger={clearSelectionTrigger}
            onStatusChange={() => { }}
            onEdit={() => { }}
            onDelete={() => { }}
            isSchedulerMode={true}
            allowedAppointmentTypes={(() => {
              // Map high-level appointment types to DayView column keys
              const getDayViewType = (type: string | undefined): string | undefined => {
                if (type === 'appliance-insertion' || type === 'Appliance-delivery') return 'printed-try-in';
                if (type === 'surgery') return 'surgery';
                return type;
              };

              const validTypes = ['emergency'];
              if (appointmentType) {
                const mappedType = getDayViewType(appointmentType);
                if (mappedType) validTypes.push(mappedType);

                // Explicitly allow Surgery and Appliance Delivery for appliance insertions
                if (appointmentType === 'appliance-insertion' || appointmentType === 'Appliance-delivery') {
                  if (!validTypes.includes('surgery')) validTypes.push('surgery');
                  if (!validTypes.includes('printed-try-in')) validTypes.push('printed-try-in');
                }
              }
              return validTypes.length > 0 ? validTypes : undefined;
            })()}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            disabled={!selectedTimeSlot}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

