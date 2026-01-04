import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Filter, ArrowUpDown, ArrowLeft, Loader2, Search, FileText, FileCheck, AlertCircle, XCircle } from "lucide-react";
import { AppointmentForm } from "@/components/calendar/AppointmentForm";

interface NextAppointment {
  id: string;
  patient_name: string;
  patient_id: string | null;
  appointment_id: string;
  last_appointment_date: string;
  last_appointment_type: string;
  next_appointment_type: string | null;
  next_appointment_subtype: string | null;
  next_appointment_date: string;
  next_appointment_scheduled: boolean;
  next_appointment_status?: 'scheduled' | 'not_scheduled' | 'not_required';
  status: string;
  status_code: string;
  created_at: string;
}

export function NextAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<NextAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<NextAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("unscheduled");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<NextAppointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNextAppointments();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [appointments, searchQuery, filterType, statusFilter, sortField, sortOrder]);

  const fetchNextAppointments = async () => {
    setLoading(true);
    try {
      // Fetch appointments that have next appointment info
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          patient_id,
          date,
          appointment_type,
          status,
          status_code,
          next_appointment_type,
          next_appointment_subtype,
          next_appointment_date,
          next_appointment_scheduled,
          next_appointment_status,
          created_at
        `)
        // removed not('next_appointment_type', 'is', null) to include ALL completed unscheduled apps
        .order('next_appointment_date', { ascending: true });

      if (error) throw error;

      // Map to NextAppointment interface
      const mappedAppointments: NextAppointment[] = ((data || []) as any[]).map(appt => ({
        id: appt.id, // using appointment id as the unique key
        patient_name: appt.patient_name,
        patient_id: appt.patient_id,
        appointment_id: appt.id,
        last_appointment_date: appt.date,
        last_appointment_type: appt.appointment_type,
        next_appointment_type: appt.next_appointment_type,
        next_appointment_subtype: appt.next_appointment_subtype,
        next_appointment_date: appt.next_appointment_date,
        next_appointment_scheduled: appt.next_appointment_scheduled,
        next_appointment_status: appt.next_appointment_status,
        status: appt.status,
        status_code: appt.status_code,
        created_at: appt.created_at
      }));

      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Error fetching next appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load next appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...appointments];

    // Apply status filter (scheduled/unscheduled)
    // Apply status filter (scheduled/unscheduled)
    if (statusFilter === "unscheduled") {
      filtered = filtered.filter(apt =>
        // Check new status logic OR legacy logic, but explicitly exclude 'not_required'
        (apt.next_appointment_status === 'not_scheduled' || (!apt.next_appointment_status && apt.next_appointment_scheduled !== true)) &&
        apt.next_appointment_status !== 'not_required' &&
        (apt.status === 'Appointment Completed' || apt.status_code === 'CMPLT' || apt.status_code === 'NSHOW' || apt.status === 'No Show')
      );
    } else if (statusFilter === "scheduled") {
      filtered = filtered.filter(apt => apt.next_appointment_status === 'scheduled' || apt.next_appointment_scheduled === true);
    }
    // "all" shows everything

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "All Types") {
      const typeMap: Record<string, string> = {
        'Consult': 'consultation',
        'Follow-up': 'follow-up',
        'Treatment': 'treatment',
        'Emergency': 'emergency',
      };
      const mappedType = typeMap[filterType];
      if (mappedType) {
        filtered = filtered.filter(apt => apt.next_appointment_type === mappedType);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        const dateA = a.next_appointment_date ? new Date(a.next_appointment_date).getTime() : 0;
        const dateB = b.next_appointment_date ? new Date(b.next_appointment_date).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === 'patient') {
        comparison = a.patient_name.localeCompare(b.patient_name);
      } else if (sortField === 'type') {
        const typeA = a.next_appointment_type || '';
        const typeB = b.next_appointment_type || '';
        comparison = typeA.localeCompare(typeB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAppointments(filtered);
  };

  const handleScheduleClick = (appointment: NextAppointment) => {
    setSelectedAppointment(appointment);
    setShowScheduleForm(true);
  };

  const handleAppointmentSaved = async (appointmentData: any) => {
    if (!selectedAppointment) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Update the appointment to mark next appointment as scheduled
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          next_appointment_scheduled: true,
          next_appointment_status: 'scheduled'
        } as any)
        .eq('id', selectedAppointment.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });

      // Refresh the list
      await fetchNextAppointments();
      setShowScheduleForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating encounter:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleNotRequired = async (appointment: NextAppointment) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          next_appointment_status: 'not_required'
        } as any)
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Marked as not required",
      });

      // Refresh the list
      await fetchNextAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'consultation': 'Consult',
      'follow-up': 'Follow-up',
      'data-collection': 'Data Collection',
      'printed-try-in': 'Appliance Delivery',
      'surgery': 'Surgery',
      'surgical-revision': 'Surgical Revision',
      'emergency': 'Emergency'
    };
    return labels[type] || type;
  };

  const getSubtypeLabel = (subtype: string | null) => {
    if (!subtype) return null;

    const labels: Record<string, string> = {
      '7-day-followup': '7 Day Follow-up',
      '30-day-followup': '30 Days Follow-up',
      'observation-followup': 'Follow-up for Observation',
      '3-month-followup': '3 Months Follow Up',
      '6-month-followup': '6 Months Follow Up',
      '12-month-followup': '12 Months Follow Up',
      'printed-try-in-delivery': 'Printed Try-in Delivery',
      '82-day-appliance-delivery': '82 Days PTI Delivery',
      '120-day-final-delivery': '120 Days Final Delivery',
      '75-day-data-collection': '75 Days Data Collection for PTI',
      'final-data-collection': 'Final Data Collection',
      'data-collection-printed-try-in': 'Data collection for Printed-try-in',
      // Surgery subtypes
      'full-arch-fixed': 'Full Arch Fixed',
      'denture': 'Denture',
      'implant-removable-denture': 'Implant Removable Denture',
      'single-implant': 'Single Implant',
      'multiple-implants': 'Multiple Implants',
      'extraction': 'Extraction',
      'extraction-and-graft': 'Extraction and Graft'
    };
    return labels[subtype] || subtype;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateBadgeColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800 border-red-300';
    if (diffDays <= 7) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (diffDays <= 14) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="h-screen bg-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/appointments')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-indigo-700">
                Unscheduled
              </h1>
            </div>
          </div>

          {/* Right side - Search, Filter, Sort, and Count */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Cycle through filter options
                const types = ['All Types', 'Consult', 'Follow-up', 'Treatment', 'Emergency'];
                const currentIndex = types.indexOf(filterType);
                const nextIndex = (currentIndex + 1) % types.length;
                setFilterType(types[nextIndex]);
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {filterType}
            </Button>

            {/* Sort Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Cycle through sort options
                const sorts = [
                  { field: 'date', order: 'asc' as const, label: 'Date ↑' },
                  { field: 'date', order: 'desc' as const, label: 'Date ↓' },
                  { field: 'patient', order: 'asc' as const, label: 'Patient A-Z' },
                  { field: 'patient', order: 'desc' as const, label: 'Patient Z-A' },
                  { field: 'type', order: 'asc' as const, label: 'Type A-Z' },
                  { field: 'type', order: 'desc' as const, label: 'Type Z-A' },
                ];
                const currentIndex = sorts.findIndex(
                  s => s.field === sortField && s.order === sortOrder
                );
                const nextIndex = (currentIndex + 1) % sorts.length;
                setSortField(sorts[nextIndex].field);
                setSortOrder(sorts[nextIndex].order);
              }}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortField === 'date' && sortOrder === 'asc' && 'Date ↑'}
              {sortField === 'date' && sortOrder === 'desc' && 'Date ↓'}
              {sortField === 'patient' && sortOrder === 'asc' && 'Patient A-Z'}
              {sortField === 'patient' && sortOrder === 'desc' && 'Patient Z-A'}
              {sortField === 'type' && sortOrder === 'asc' && 'Type A-Z'}
              {sortField === 'type' && sortOrder === 'desc' && 'Type Z-A'}
            </Button>

            {/* Results Count Badge */}
            <div className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold px-5 py-2 text-base rounded-full">
              {filteredAppointments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="flex-1 px-6 pt-6 pb-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading appointments...</h3>
              <p className="text-gray-500">Please wait while we fetch pending appointments.</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <>
              {/* Table Header - Fixed */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex-shrink-0 table-header">
                <div className="grid gap-2 lg:gap-3 text-sm font-bold text-blue-700 uppercase tracking-wider items-center"
                  style={{
                    gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) minmax(140px, 1fr)'
                  }}>
                  <div className="border-r border-slate-300 px-2">
                    <span className="truncate">Patient</span>
                  </div>
                  <div className="border-r border-slate-300 px-2">
                    <span className="truncate">Last Visit</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="truncate">Actions</span>
                  </div>
                </div>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-enhanced table-body">
                {filteredAppointments.map((appointment) => {
                  // Get status badge color based on appointment type
                  const getTypeStatusColor = (type: string) => {
                    switch (type) {
                      case 'consultation':
                        return { bg: 'bg-blue-600', text: 'text-white', icon: User };
                      case 'follow-up':
                        return { bg: 'bg-green-600', text: 'text-white', icon: Calendar };
                      case 'data-collection':
                        return { bg: 'bg-purple-600', text: 'text-white', icon: FileText };
                      case 'printed-try-in':
                        return { bg: 'bg-indigo-600', text: 'text-white', icon: FileCheck };
                      case 'surgery':
                        return { bg: 'bg-red-600', text: 'text-white', icon: AlertCircle };
                      case 'surgical-revision':
                        return { bg: 'bg-orange-600', text: 'text-white', icon: AlertCircle };
                      case 'emergency':
                        return { bg: 'bg-red-700', text: 'text-white', icon: AlertCircle };
                      default:
                        return { bg: 'bg-gray-600', text: 'text-white', icon: Calendar };
                    }
                  };

                  const statusConfig = getTypeStatusColor(appointment.next_appointment_type);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 min-h-[64px]">
                      <div className="grid gap-2 lg:gap-3 px-4 py-3 text-sm items-center min-h-[64px]"
                        style={{
                          gridTemplateColumns: 'minmax(200px, 2fr) minmax(150px, 1.5fr) minmax(140px, 1fr)'
                        }}>

                        {/* Patient */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center min-w-0">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className={`w-6 h-6 ${statusConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <StatusIcon className={`h-3 w-3 ${statusConfig.text}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium truncate text-sm">{appointment.patient_name}</p>
                            </div>
                          </div>
                        </div>

                        {/* Last Visit */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center min-w-0">
                          <div className="min-w-0 max-w-full">
                            <p className="text-gray-600 text-xs truncate">{formatDate(appointment.last_appointment_date)}</p>
                            <p className="text-gray-500 text-xs truncate mt-0.5">{getAppointmentTypeLabel(appointment.last_appointment_type)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="px-2 h-full flex items-center justify-center min-w-0 gap-2">
                          <Button
                            onClick={() => handleScheduleClick(appointment)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule
                          </Button>
                          <Button
                            onClick={() => handleNotRequired(appointment)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800 border-slate-300"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Required
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 font-medium">No pending appointments to schedule</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery || filterType !== "All Types"
                  ? "Try adjusting your filters"
                  : "All suggested appointments have been scheduled"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Form Dialog */}
      {showScheduleForm && selectedAppointment && (
        <AppointmentForm
          isOpen={showScheduleForm}
          onClose={() => {
            setShowScheduleForm(false);
            setSelectedAppointment(null);
          }}
          onSave={handleAppointmentSaved}
          initialDate={new Date(selectedAppointment.next_appointment_date)}
          appointmentType={selectedAppointment.next_appointment_type}
          appointmentSubtype={selectedAppointment.next_appointment_subtype || ''}
          initialPatientName={selectedAppointment.patient_name}
          initialPatientId={selectedAppointment.patient_id || ''}
        />
      )}
    </div>
  );
}

