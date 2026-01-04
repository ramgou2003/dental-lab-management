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

const ConsultationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("consultations");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [treatmentStatusFilter, setTreatmentStatusFilter] = useState<string>("all");
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  const [draftConsultationData, setDraftConsultationData] = useState<any>(null);
  const [initialFormDate, setInitialFormDate] = useState<Date | undefined>(undefined);
  const [initialFormTime, setInitialFormTime] = useState<string | undefined>(undefined);
  const [initialFormEndTime, setInitialFormEndTime] = useState<string | undefined>(undefined);

  const handleAddConsultation = () => {
    setIsAddDialogOpen(true);
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

          {/* Treatment Status Filters - Only show for patients tab */}
          {activeTab === "patients" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Filter by Treatment Status:</span>
              <Button
                variant={treatmentStatusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTreatmentStatusFilter("all")}
                className="h-8 px-3 text-sm"
              >
                All
              </Button>
              <Button
                variant={treatmentStatusFilter === "accepted" ? "default" : "outline"}
                size="sm"
                onClick={() => setTreatmentStatusFilter("accepted")}
                className="h-8 px-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                Accepted
              </Button>
              <Button
                variant={treatmentStatusFilter === "not_accepted" ? "default" : "outline"}
                size="sm"
                onClick={() => setTreatmentStatusFilter("not_accepted")}
                className="h-8 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                Rejected
              </Button>
              <Button
                variant={treatmentStatusFilter === "followup-required" ? "default" : "outline"}
                size="sm"
                onClick={() => setTreatmentStatusFilter("followup-required")}
                className="h-8 px-3 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
              >
                Follow-up Required
              </Button>
              <Button
                variant={treatmentStatusFilter === "not_set" ? "default" : "outline"}
                size="sm"
                onClick={() => setTreatmentStatusFilter("not_set")}
                className="h-8 px-3 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              >
                Not Set
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
              treatmentStatusFilter={treatmentStatusFilter}
            />
          ) : (
            <ConsultationTable searchTerm={searchTerm} selectedDate={selectedDate} showScheduledLeads={false} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ConsultationPage;