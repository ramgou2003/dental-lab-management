import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConsultationTable } from "@/components/ConsultationTable";
import { ConsultationTabs } from "@/components/ConsultationTabs";
import { PageHeader } from "@/components/PageHeader";
import { AddConsultationDialog } from "@/components/AddConsultationDialog";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AppointmentSchedulerDialog } from "@/components/calendar/AppointmentSchedulerDialog";
import { ConsultationFilterDialog, ConsultationFilters } from "@/components/ConsultationFilterDialog";
import { Filter } from "lucide-react";

const ConsultationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("consultations");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<ConsultationFilters>({
    treatmentStatus: [],
    appointmentStatus: []
  });
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  const [draftConsultationData, setDraftConsultationData] = useState<any>(null);
  const [initialFormDate, setInitialFormDate] = useState<Date | undefined>(undefined);
  const [initialFormTime, setInitialFormTime] = useState<string | undefined>(undefined);
  const [initialFormEndTime, setInitialFormEndTime] = useState<string | undefined>(undefined);

  const handleAddConsultation = () => {
    setIsAddDialogOpen(true);
  };

  const activeFilterCount = filters.treatmentStatus.length + filters.appointmentStatus.length;

  const handleFilterClick = () => {
    setShowFilterDialog(true);
  };

  const handleApplyFilters = (newFilters: ConsultationFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  };

  const handleClearFilters = () => {
    setFilters({
      treatmentStatus: [],
      appointmentStatus: []
    });
    setShowFilterDialog(false);
  };

  const handleConsultationSuccess = () => {
    // Trigger a refresh of the consultation table
    setRefreshTrigger(prev => prev + 1);
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Consultation"
          search={{
            placeholder: "Search patients by name, phone, or email...",
            value: searchTerm,
            onChange: setSearchTerm
          }}
          secondaryAction={activeTab === 'patients' ? {
            label: activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters",
            icon: Filter,
            onClick: handleFilterClick
          } : undefined}
          action={{
            label: "Add Consultation",
            onClick: handleAddConsultation
          }}
        />
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <ConsultationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Date Navigation - Only show for consultations tab */}
          {activeTab === "consultations" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-sm font-medium"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatSelectedDate(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-8 px-3 text-sm"
              >
                Today
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="w-full h-full">
          {activeTab === "patients" ? (
            <ConsultationTable
              searchTerm={searchTerm}
              showScheduledLeads={true}
              refreshTrigger={refreshTrigger}
              filters={filters}
            />
          ) : (
            <ConsultationTable searchTerm={searchTerm} selectedDate={selectedDate} showScheduledLeads={false} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>

      {/* Filter Dialog */}
      <ConsultationFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Add Consultation Dialog */}
      <AddConsultationDialog
        isOpen={isAddDialogOpen && !showSchedulerDialog}
        onClose={() => {
          setIsAddDialogOpen(false);
          setDraftConsultationData(null);
        }}
        onSuccess={handleConsultationSuccess}
        initialDate={initialFormDate}
        initialTime={initialFormTime}
        initialEndTime={initialFormEndTime}
        initialValues={draftConsultationData}
        onOpenCalendar={(data) => {
          console.log('📅 Opening calendar from consultation dialog:', data);
          setDraftConsultationData(data);
          if (data.consultationDate) {
            setInitialFormDate(data.consultationDate);
          }
          setShowSchedulerDialog(true);
        }}
      />

      {/* Appointment Scheduler Dialog */}
      <AppointmentSchedulerDialog
        open={showSchedulerDialog}
        onOpenChange={setShowSchedulerDialog}
        patientName={draftConsultationData?.firstName ? `${draftConsultationData.firstName} ${draftConsultationData.lastName}` : "New Patient"}
        patientId={draftConsultationData?.selectedPatient?.id || ""}
        initialDate={initialFormDate}
        appointmentType="consultation"
        onSchedule={(scheduleData) => {
          console.log('Scheduled from consultation scheduler:', scheduleData);
          setShowSchedulerDialog(false);
          setInitialFormDate(new Date(scheduleData.date + 'T00:00:00'));
          setInitialFormTime(scheduleData.startTime);
          setInitialFormEndTime(scheduleData.endTime);

          // Update draft data with new time and date
          setDraftConsultationData(prev => ({
            ...prev,
            consultationDate: new Date(scheduleData.date + 'T00:00:00'),
            consultationTime: scheduleData.startTime
          }));
        }}
      />
    </div >
  );
};

export default ConsultationPage;