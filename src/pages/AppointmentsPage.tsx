import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayView } from "@/components/calendar/DayView";
import { AppointmentForm } from "@/components/calendar/AppointmentForm";
import { AppointmentDetailsDialog } from "@/components/calendar/AppointmentDetailsDialog";
import { useAppointments, type Appointment } from "@/hooks/useAppointments";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/components/ui/sonner";

export function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    setSelectedAppointmentType(undefined);
    setShowAppointmentForm(true);
  };

  const handleTimeSlotClick = (startTime: string, endTime: string, appointmentType?: string) => {
    console.log('handleTimeSlotClick called with:', { startTime, endTime, appointmentType });

    // Day view: startTime and endTime from drag selection
    setEditingAppointment(null);
    setInitialFormDate(currentDate);
    setInitialFormTime(startTime || '09:00');
    setInitialFormEndTime(endTime || '09:30');
    setSelectedAppointmentType(appointmentType || '');

    // Open dialog immediately - no delay
    console.log('Opening appointment form with state:', {
      date: currentDate,
      startTime: startTime || '09:00',
      endTime: endTime || '09:30',
      type: appointmentType || ''
    });
    setShowAppointmentForm(true);
  };

  const handleClearSelection = () => {
    // Trigger selection clearing by incrementing the trigger
    console.log('Clearing selection from parent');
    setClearSelectionTrigger(prev => prev + 1);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Clear any existing selection when clicking on an appointment
    handleClearSelection();
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    if (!canUpdateAppointments()) {
      toast.error("You don't have permission to edit appointments");
      return;
    }
    setEditingAppointment(appointment);
    setShowAppointmentDetails(false);
    setShowAppointmentForm(true);
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
          />
        </div>
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentForm}
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
        canUpdateAppointments={canUpdateAppointments()}
        canDeleteAppointments={canDeleteAppointments()}
      />


    </div>
  );
}
