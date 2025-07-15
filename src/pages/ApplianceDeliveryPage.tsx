import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/particle-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { useDeliveryItems } from "@/hooks/useDeliveryItems";
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search, FlaskConical, User, Package, Truck, MapPin, Calendar as CalendarIcon, Settings, Palette } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import type { DeliveryItem } from "@/hooks/useDeliveryItems";

export function ApplianceDeliveryPage() {
  const [activeFilter, setActiveFilter] = useState("ready-to-insert");
  const [showNewDeliveryForm, setShowNewDeliveryForm] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<DeliveryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { deliveryItems, loading, updateDeliveryStatus } = useDeliveryItems();

  const handleNewDelivery = () => {
    setShowNewDeliveryForm(true);
  };

  const handleViewDeliveryDetails = (deliveryItem: DeliveryItem) => {
    setSelectedDeliveryItem(deliveryItem);
    setShowDeliveryDetails(true);
  };

  // Insertion appointment handlers
  const handleUpdateInsertionStatus = async (deliveryItem: DeliveryItem, newStatus: DeliveryItem['delivery_status']) => {
    try {
      await updateDeliveryStatus(deliveryItem.id, newStatus);
      const statusText = newStatus === 'patient-scheduled' ? 'scheduled' :
                        newStatus === 'inserted' ? 'inserted' :
                        newStatus.replace('-', ' ');
      toast.success(`Appointment status updated to ${statusText}`);
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleScheduleAppointment = (deliveryItem: DeliveryItem) => {
    setSelectedDeliveryItem(deliveryItem);
    setShowAppointmentScheduler(true);
  };

  const handleAppointmentScheduled = async (appointmentData: {
    date: string;
    time: string;
    notes?: string;
  }) => {
    if (!selectedDeliveryItem) return;

    try {
      await updateDeliveryStatus(selectedDeliveryItem.id, 'patient-scheduled', {
        scheduled_delivery_date: appointmentData.date,
        scheduled_delivery_time: appointmentData.time,
        delivery_notes: appointmentData.notes || 'Appointment scheduled for appliance insertion.'
      });

      toast.success(`Appointment scheduled for ${new Date(appointmentData.date).toLocaleDateString()} at ${formatTime(appointmentData.time)}`);
      setShowAppointmentScheduler(false);
      setSelectedDeliveryItem(null);
    } catch (error) {
      toast.error('Failed to schedule appointment');
    }
  };

  const handleStartDelivery = async (deliveryItem: DeliveryItem) => {
    handleScheduleAppointment(deliveryItem);
  };

  const handleCompleteDelivery = async (deliveryItem: DeliveryItem) => {
    await handleUpdateInsertionStatus(deliveryItem, 'inserted');
  };

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate dynamic counts for appliance insertion appointments
  const getInsertionCount = (status: string) => {
    if (status === "all-deliveries") return deliveryItems.length;
    if (status === "ready-to-insert") {
      return deliveryItems.filter(item => item.delivery_status === 'ready-to-insert').length;
    }
    if (status === "scheduled") {
      return deliveryItems.filter(item => item.delivery_status === 'patient-scheduled').length;
    }
    if (status === "unscheduled") {
      return deliveryItems.filter(item => item.delivery_status === 'ready-to-insert' && !item.scheduled_delivery_date).length;
    }
    if (status === "inserted") {
      return deliveryItems.filter(item => item.delivery_status === 'inserted').length;
    }
    if (status === "pending") {
      // Items that need scheduling or are ready but not yet scheduled
      return deliveryItems.filter(item =>
        item.delivery_status === 'ready-for-delivery' ||
        (item.delivery_status === 'in-transit' && !item.scheduled_delivery_date)
      ).length;
    }
    return deliveryItems.length;
  };

  // Stats configuration - 6 filters for appliance insertion appointments
  const stats = [
    {
      title: "Ready to Insert",
      value: getInsertionCount("ready-to-insert"),
      filter: "ready-to-insert",
      icon: Package,
      color: "bg-green-500"
    },
    {
      title: "Scheduled",
      value: getInsertionCount("scheduled"),
      filter: "scheduled",
      icon: CalendarIcon,
      color: "bg-blue-500"
    },
    {
      title: "Unscheduled",
      value: getInsertionCount("unscheduled"),
      filter: "unscheduled",
      icon: Clock,
      color: "bg-amber-500"
    },
    {
      title: "Inserted",
      value: getInsertionCount("inserted"),
      filter: "inserted",
      icon: CheckCircle,
      color: "bg-emerald-500"
    },
    {
      title: "Pending",
      value: getInsertionCount("pending"),
      filter: "pending",
      icon: AlertCircle,
      color: "bg-orange-500"
    },
    {
      title: "All Deliveries",
      value: getInsertionCount("all-deliveries"),
      filter: "all-deliveries",
      icon: FileText,
      color: "bg-indigo-500"
    }
  ];

  // Filter appliance insertion items
  const filteredDeliveries = deliveryItems.filter(item => {
    const searchMatch = searchQuery.trim() === ""
      ? true
      : item.patient_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter based on active filter for insertion appointments
    let statusMatch = true;
    if (activeFilter === "ready-to-insert") {
      statusMatch = item.delivery_status === 'ready-to-insert';
    } else if (activeFilter === "scheduled") {
      statusMatch = item.delivery_status === 'patient-scheduled';
    } else if (activeFilter === "unscheduled") {
      statusMatch = item.delivery_status === 'ready-to-insert' && !item.scheduled_delivery_date;
    } else if (activeFilter === "inserted") {
      statusMatch = item.delivery_status === 'inserted';
    } else if (activeFilter === "pending") {
      statusMatch = item.delivery_status === 'ready-to-insert' ||
                   (item.delivery_status === 'patient-scheduled' && !item.scheduled_delivery_date);
    }
    // "all-deliveries" shows everything

    return searchMatch && statusMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Appliance Insertion"
          search={{
            placeholder: "Search by patient name...",
            value: searchQuery,
            onChange: setSearchQuery
          }}
          action={{
            label: "Schedule Appointment",
            onClick: handleNewDelivery
          }}
        />
      </div>
      <div className="flex-1 px-6 pt-6 pb-2">
        {/* Stats Cards - 6 filters */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(stat.filter)}
              className={`h-20 sm:h-22 lg:h-24 p-2 sm:p-3 lg:p-3 rounded-xl border transition-all duration-200 hover:shadow-md relative ${
                activeFilter === stat.filter
                  ? 'border-indigo-300 bg-indigo-50 shadow-md border-b-4 border-b-indigo-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col h-full justify-between">
                {/* Icon and Number at the top */}
                <div className="flex items-center justify-between">
                  <p className={`text-base sm:text-lg lg:text-xl font-bold leading-none ${
                    activeFilter === stat.filter ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  <div className={`p-1 sm:p-1 lg:p-2 rounded-lg flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                </div>

                {/* Title at the bottom */}
                <div className="w-full text-center">
                  <p className={`text-xs sm:text-sm lg:text-sm font-semibold leading-tight ${
                    activeFilter === stat.filter
                      ? 'text-indigo-700'
                      : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Appliance Deliveries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading appliance insertions...</h3>
              <p className="text-gray-500">Please wait while we fetch insertion appointments.</p>
            </div>
          ) : filteredDeliveries.length > 0 ? (
            <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced table-body">
                <div className="space-y-4">
                  {filteredDeliveries.map((item) => {
                    // Format appliance types for display
                    const formatApplianceType = (type: string | null) => {
                      if (!type) return 'N/A';
                      return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    const upperAppliance = formatApplianceType(item.upper_appliance_type);
                    const lowerAppliance = formatApplianceType(item.lower_appliance_type);

                    // Get status-specific button configuration for insertion appointments
                    const getStatusButton = () => {
                      switch (item.delivery_status) {
                        case 'ready-to-insert':
                          return {
                            text: 'Schedule Appointment',
                            icon: CalendarIcon,
                            color: 'border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50',
                            onClick: () => handleStartDelivery(item)
                          };
                        case 'patient-scheduled':
                          return {
                            text: 'Mark Inserted',
                            icon: CheckCircle,
                            color: 'border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50',
                            onClick: () => handleCompleteDelivery(item)
                          };
                        case 'inserted':
                          return {
                            text: 'Inserted',
                            icon: CheckCircle,
                            color: 'border-emerald-600 text-emerald-600 bg-emerald-50',
                            onClick: () => handleViewDeliveryDetails(item)
                          };
                        default:
                          return {
                            text: 'View Details',
                            icon: Eye,
                            color: 'border-gray-600 text-gray-600 hover:border-gray-700 hover:text-gray-700 hover:bg-gray-50',
                            onClick: () => handleViewDeliveryDetails(item)
                          };
                      }
                    };

                    const statusButton = getStatusButton();

                    return (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                        <div className="flex items-center justify-between">
                          {/* Left side - Patient info and appliance types */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Delivery Avatar */}
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-white" />
                            </div>

                            {/* Patient Name and Details */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.patient_name}</h3>

                              {/* Scheduled Appointment Info */}
                              {item.delivery_status === 'patient-scheduled' && item.scheduled_delivery_date && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <CalendarIcon className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-700">
                                    {new Date(item.scheduled_delivery_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                    {item.scheduled_delivery_time && (
                                      <span className="ml-2">
                                        at {formatTime(item.scheduled_delivery_time)}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center space-x-4 mt-1">
                                {/* Upper Appliance */}
                                {item.upper_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Upper:</span> {upperAppliance}
                                    {item.upper_appliance_number && <span className="ml-1 text-gray-500">({item.upper_appliance_number})</span>}
                                  </span>
                                )}
                                {/* Lower Appliance */}
                                {item.lower_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Lower:</span> {lowerAppliance}
                                    {item.lower_appliance_number && <span className="ml-1 text-gray-500">({item.lower_appliance_number})</span>}
                                  </span>
                                )}
                                {/* Shade */}
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Shade:</span> {item.shade}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right side - Action Buttons */}
                          <div className="ml-4 flex items-center space-x-2">
                            {/* View Details Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDeliveryDetails(item)}
                              className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Status Action Button */}
                            <Button
                              className={`border-2 bg-white px-4 py-2 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${statusButton.color}`}
                              onClick={statusButton.onClick}
                            >
                              <statusButton.icon className="h-4 w-4 mr-2" />
                              {statusButton.text}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Appliance Insertions Found
              </h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === "ready-to-insert" ? "No appliances ready for insertion. Complete printing in Manufacturing to add items here." :
                 activeFilter === "scheduled" ? "No scheduled insertion appointments." :
                 activeFilter === "unscheduled" ? "No unscheduled appliances found." :
                 activeFilter === "inserted" ? "No inserted appliances found." :
                 activeFilter === "pending" ? "No pending insertion appointments." :
                 "No insertion appointments found. Complete printing in Manufacturing to create insertion items."}
              </p>
              <Button
                onClick={() => window.location.href = '/manufacturing'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Package className="h-4 w-4 mr-2" />
                Go to Manufacturing
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewDeliveryForm} onOpenChange={setShowNewDeliveryForm}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Insertion Appointment</h2>
                <p className="text-gray-600">Schedule a new appliance insertion appointment</p>
              </div>
            </div>

            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Appointment scheduling form will be implemented here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appliance Preview Dialog */}
      {selectedDeliveryItem && (
        <Dialog open={showDeliveryDetails} onOpenChange={setShowDeliveryDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Appliance Summary</h2>
                  <p className="text-lg text-gray-600">{selectedDeliveryItem.patient_name}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedDeliveryItem.delivery_status === 'ready-for-delivery' ? 'bg-green-100 text-green-800' :
                    selectedDeliveryItem.delivery_status === 'patient-scheduled' ? 'bg-blue-100 text-blue-800' :
                    selectedDeliveryItem.delivery_status === 'inserted' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDeliveryItem.delivery_status === 'ready-for-delivery' ? 'Ready to Insert' :
                     selectedDeliveryItem.delivery_status === 'patient-scheduled' ? 'Scheduled' :
                     selectedDeliveryItem.delivery_status === 'inserted' ? 'Inserted' :
                     selectedDeliveryItem.delivery_status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900">Patient Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-800">Patient Name:</span>
                        <span className="text-blue-900 font-semibold">{selectedDeliveryItem.patient_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-800">Arch Type:</span>
                        <span className="text-blue-900 capitalize font-medium">{selectedDeliveryItem.arch_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-800">Created:</span>
                        <span className="text-blue-900">{new Date(selectedDeliveryItem.created_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appliance Specifications */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-purple-900">Appliance Specifications</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedDeliveryItem.upper_appliance_type && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-purple-800">Upper Appliance:</span>
                          <div className="text-right">
                            <span className="text-purple-900 font-medium">{selectedDeliveryItem.upper_appliance_type}</span>
                            {selectedDeliveryItem.upper_appliance_number && (
                              <span className="block text-sm text-purple-700">#{selectedDeliveryItem.upper_appliance_number}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedDeliveryItem.lower_appliance_type && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-purple-800">Lower Appliance:</span>
                          <div className="text-right">
                            <span className="text-purple-900 font-medium">{selectedDeliveryItem.lower_appliance_type}</span>
                            {selectedDeliveryItem.lower_appliance_number && (
                              <span className="block text-sm text-purple-700">#{selectedDeliveryItem.lower_appliance_number}</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-purple-800">Shade:</span>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-purple-600" />
                          <span className="text-purple-900 font-medium">{selectedDeliveryItem.shade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                  {/* Delivery Status */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Delivery Status</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-800">Current Status:</span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                          selectedDeliveryItem.delivery_status === 'ready-for-delivery' ? 'bg-green-200 text-green-900' :
                          selectedDeliveryItem.delivery_status === 'patient-scheduled' ? 'bg-blue-200 text-blue-900' :
                          selectedDeliveryItem.delivery_status === 'inserted' ? 'bg-emerald-200 text-emerald-900' :
                          'bg-gray-200 text-gray-900'
                        }`}>
                          {selectedDeliveryItem.delivery_status === 'ready-for-delivery' ? 'Ready to Insert' :
                           selectedDeliveryItem.delivery_status === 'patient-scheduled' ? 'Scheduled' :
                           selectedDeliveryItem.delivery_status === 'inserted' ? 'Inserted' :
                           selectedDeliveryItem.delivery_status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      {selectedDeliveryItem.delivery_notes && (
                        <div>
                          <span className="font-medium text-green-800">Notes:</span>
                          <p className="text-green-900 text-sm mt-1 bg-green-50 p-2 rounded border">{selectedDeliveryItem.delivery_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline & Appointments */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-amber-900">Timeline & Appointments</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-amber-800">Created:</span>
                        <span className="text-amber-900 font-medium">
                          {new Date(selectedDeliveryItem.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {selectedDeliveryItem.scheduled_delivery_date && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-amber-800">Appointment Date:</span>
                            <span className="text-amber-900 font-semibold">
                              {new Date(selectedDeliveryItem.scheduled_delivery_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {selectedDeliveryItem.scheduled_delivery_time && (
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-amber-800">Appointment Time:</span>
                              <span className="text-amber-900 font-medium">
                                {formatTime(selectedDeliveryItem.scheduled_delivery_time)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedDeliveryItem.actual_delivery_date && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-amber-800">Insertion Date:</span>
                          <span className="text-amber-900 font-semibold">
                            {new Date(selectedDeliveryItem.actual_delivery_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(selectedDeliveryItem.updated_at).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex gap-3">
                  {selectedDeliveryItem.delivery_status === 'ready-for-delivery' && (
                    <Button
                      onClick={() => {
                        setShowDeliveryDetails(false);
                        setShowAppointmentScheduler(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  )}
                  {selectedDeliveryItem.delivery_status === 'patient-scheduled' && (
                    <Button
                      onClick={() => {
                        setShowDeliveryDetails(false);
                        handleCompleteDelivery(selectedDeliveryItem);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Inserted
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowDeliveryDetails(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Appointment Scheduler */}
      <AppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={() => {
          setShowAppointmentScheduler(false);
          setSelectedDeliveryItem(null);
        }}
        onSchedule={handleAppointmentScheduled}
        deliveryItem={selectedDeliveryItem}
      />
    </div>
  );
}
