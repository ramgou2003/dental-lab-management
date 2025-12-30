import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayView, type DayViewHandle } from "@/components/calendar/DayView";
import { AppointmentForm } from "@/components/calendar/AppointmentForm";
import { AppointmentDetailsDialog } from "@/components/calendar/AppointmentDetailsDialog";
import { AppointmentSchedulerDialog } from "@/components/calendar/AppointmentSchedulerDialog";
import { useAppointments, type Appointment } from "@/hooks/useAppointments";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { format } from "date-fns";

export function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dayViewRef = useRef<DayViewHandle>(null);

  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      return new Date(dateParam + 'T00:00:00');
    }
    return new Date();
  });

  // Sync URL with current date
  useEffect(() => {
    const dateStr = currentDate.getFullYear() + '-' +
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(currentDate.getDate()).padStart(2, '0');

    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (newParams.get('date') !== dateStr) {
        newParams.set('date', dateStr);
        return newParams;
      }
      return prev;
    }, { replace: true });
  }, [currentDate, setSearchParams]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [clearSelectionTrigger, setClearSelectionTrigger] = useState(0);
  const [initialFormDate, setInitialFormDate] = useState<Date | undefined>(undefined);
  const [initialFormTime, setInitialFormTime] = useState<string | undefined>(undefined);
  const [initialFormEndTime, setInitialFormEndTime] = useState<string | undefined>(undefined);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | undefined>(undefined);
  const [draftAppointmentData, setDraftAppointmentData] = useState<any>(null);
  const [isPickingTime, setIsPickingTime] = useState(false);
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);

  const { canCreateAppointments, canUpdateAppointments, canDeleteAppointments } = usePermissions();
  const {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    searchAppointments,
    getAppointmentsByDate,
    getAppointmentsByDateRange
  } = useAppointments();

  // Filter appointments based on current date and search
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchAppointments(searchQuery);
    }

    // Apply date filter for current day
    const dayStr = currentDate.toISOString().split('T')[0];
    return filtered.filter(apt => apt.date === dayStr);
  };

  const handleNewAppointment = () => {
    if (!canCreateAppointments()) {
      toast.error("You don't have permission to create appointments");
      return;
    }
    setEditingAppointment(null);
    setInitialFormDate(undefined);
    setInitialFormTime(undefined);
    setInitialFormEndTime(undefined);
    setDraftAppointmentData(null);
    setIsPickingTime(false);
    setSelectedAppointmentType(undefined);
    setShowAppointmentForm(true);
  };

  const handleTimeSlotClick = (startTime: string, endTime: string, appointmentType?: string) => {
    console.log('handleTimeSlotClick called with:', { startTime, endTime, appointmentType, isPickingTime });

    // Day view: startTime and endTime from drag selection
    // Day view: startTime and endTime from drag selection
    // Use the values from drag selection
    setInitialFormDate(currentDate);
    setInitialFormTime(startTime);
    setInitialFormEndTime(endTime);

    if (appointmentType) {
      setSelectedAppointmentType(appointmentType);
    }

    // Preserve draft data if we're in picking mode
    // (Wait, handling clicking on main calendar directly)
    // If scheduler dialog is open, this handler won't be called from main calendar for that selection
    // But if user clicks main calendar background...
    setShowAppointmentForm(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    if (!canUpdateAppointments()) {
      toast.error("You don't have permission to update appointments");
      return;
    }
    setEditingAppointment(appointment);
    // Parse date correctly: date string is YYYY-MM-DD
    setInitialFormDate(new Date(appointment.date + 'T00:00:00'));
    setInitialFormTime(appointment.startTime);
    setInitialFormEndTime(appointment.endTime);
    // Note: appointment interface has date, startTime, endTime
    setShowAppointmentDetails(false);
    setShowAppointmentForm(true);
  };

  const handleClearSelection = () => {
    setClearSelectionTrigger(prev => prev + 1);
    setInitialFormDate(undefined);
    setInitialFormTime(undefined);
    setInitialFormEndTime(undefined);
    setSelectedAppointmentType(undefined);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!canDeleteAppointments()) {
      toast.error("You don't have permission to delete appointments");
      return;
    }
    try {
      await deleteAppointment(appointmentId);
      setShowAppointmentDetails(false);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatusCode: Appointment['statusCode']) => {
    try {
      await updateAppointment(appointmentId, { statusCode: newStatusCode });
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await addAppointment(appointmentData);
      }
      setShowAppointmentForm(false);
      setEditingAppointment(null);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error('Failed to save appointment:', error);
    }
  };





  const filteredAppointments = getFilteredAppointments();

  // Remove blocking loading state - let calendar render immediately
  // Data will load in background and update when ready

  return (
    <div className="h-screen bg-blue-50 p-4 overflow-hidden">
      {/* Calendar Container - Full height with padding */}
      <div className="h-full bg-white rounded-xl shadow-sm border border-blue-200 table-container-rounded flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNewAppointment={handleNewAppointment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          canCreateAppointments={canCreateAppointments()}
        />

        {/* Calendar Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <DayView
            date={currentDate}
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
            isDialogOpen={showAppointmentForm || showAppointmentDetails}
            onClearSelection={handleClearSelection}
            clearSelectionTrigger={clearSelectionTrigger}
            onStatusChange={handleStatusChange}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            ref={dayViewRef}
          />
        </div>
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentForm && !showSchedulerDialog}
        onClose={() => {
          // Clear selection when dialog is closed/canceled
          handleClearSelection();
          setShowAppointmentForm(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        initialDate={initialFormDate}
        initialTime={initialFormTime}
        initialEndTime={initialFormEndTime}
        appointmentType={selectedAppointmentType}
        editingAppointment={editingAppointment}
        initialValues={draftAppointmentData}
        onOpenCalendar={(data) => {
          console.log('📅 User requested to open calendar for time selection', data);
          setDraftAppointmentData(data);
          // Set initial date from form data if available
          if (data.date) {
            setInitialFormDate(data.date);
          }
          setShowSchedulerDialog(true);
        }}
      />

      {/* Appointment Scheduler Dialog */}
      <AppointmentSchedulerDialog
        open={showSchedulerDialog}
        onOpenChange={setShowSchedulerDialog}
        patientName={draftAppointmentData?.patient || "New Patient"}
        patientId={draftAppointmentData?.patientId || ""}
        initialDate={initialFormDate}
        appointmentType={draftAppointmentData?.type}
        appointmentSubtype={draftAppointmentData?.subtype}
        onSchedule={(scheduleData) => {
          console.log('Scheduled from dialog:', scheduleData);
          setShowSchedulerDialog(false);
          setInitialFormDate(new Date(scheduleData.date + 'T00:00:00'));
          setInitialFormTime(scheduleData.startTime);
          setInitialFormEndTime(scheduleData.endTime);

          // Handle type updating from scheduler selection
          if (scheduleData.type) {
            setDraftAppointmentData(prev => {
              const newData = { ...prev };

              if (scheduleData.type === 'emergency') {
                // If "Emergency" column was clicked, mark as emergency but don't set type to 'emergency' string
                // (keep previous type or require user to select one)
                newData.isEmergency = true;
                // Don't overwrite type with 'emergency' as it's not a valid procedure type
              } else {
                // If a specific type column was clicked (e.g., "New Patient"), set that type
                // AND explicitly turn off emergency flag (since they clicked a non-emergency column)
                newData.type = scheduleData.type;
                newData.isEmergency = false;
              }

              // Also update date/time in the draft data itself so it persists
              newData.date = new Date(scheduleData.date + 'T00:00:00');
              newData.startTime = scheduleData.startTime;
              newData.endTime = scheduleData.endTime;

              return newData;
            });
          }
        }}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsDialog
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        onStatusChange={handleStatusChange}
        onViewProfile={(patientId) => {
          // Navigate to patient profile
          window.location.href = `/patients/${patientId}`;
        }}
        onOpenHealthHistory={(patientId, patientName) => {
          dayViewRef.current?.openHealthHistory(patientId, patientName);
        }}
        onOpenComfortPreference={(patientId, patientName) => {
          dayViewRef.current?.openComfortPreference(patientId, patientName);
        }}
        onOpenEncounter={(apt) => {
          dayViewRef.current?.openEncounterForm(apt as any);
        }}
        onAddLabScript={(apt) => {
          // Navigate to lab scripts page or open lab script form
          window.location.href = `/lab-scripts/new?appointment_id=${apt.id}&patient_name=${encodeURIComponent(apt.patient)}`;
        }}
      />
    </div>
  );
}
