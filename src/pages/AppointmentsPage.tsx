import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayView } from "@/components/calendar/DayView";
import { AppointmentForm } from "@/components/calendar/AppointmentForm";
import { AppointmentDetailsDialog } from "@/components/calendar/AppointmentDetailsDialog";
import { useAppointments, type Appointment } from "@/hooks/useAppointments";
import { toast } from "@/components/ui/sonner";

export function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<Date | undefined>(undefined);
  const [initialFormTime, setInitialFormTime] = useState<string | undefined>(undefined);
  const [initialFormEndTime, setInitialFormEndTime] = useState<string | undefined>(undefined);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | undefined>(undefined);

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
    // This will be called when the selection needs to be cleared
    // Currently no additional state to clear in the parent
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentDetails(false);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      setShowAppointmentDetails(false);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
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

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 table-container-rounded flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Calendar...</h3>
            <p className="text-gray-500">Please wait while we fetch your appointments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-4 overflow-hidden">
      {/* Calendar Container - Full height with padding */}
      <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 table-container-rounded flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNewAppointment={handleNewAppointment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
          />
        </div>
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => {
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
      />


    </div>
  );
}
