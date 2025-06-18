
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditPatientForm } from "@/components/EditPatientForm";
import { LabScriptDetail } from "@/components/LabScriptDetail";
import { usePatientLabScripts } from "@/hooks/usePatientLabScripts";
import { usePatientManufacturingItems } from "@/hooks/usePatientManufacturingItems";
import { LabScript } from "@/hooks/useLabScripts";
import { ManufacturingItem } from "@/hooks/useManufacturingItems";
import { useReportCards } from "@/hooks/useReportCards";
import { useDeliveryItems } from "@/hooks/useDeliveryItems";
import {
  User,
  Phone,
  MapPin,
  FileText,
  FlaskConical,
  Factory,
  Stethoscope,
  Mail,
  Heart,
  ArrowLeft,
  Edit,
  Clock,
  Activity,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  Play,
  Square,
  RotateCcw,
  Package,
  Truck,
  Settings,
  Palette
} from "lucide-react";
import { LabReportCardForm } from "@/components/LabReportCardForm";
import { ViewLabReportCard } from "@/components/ViewLabReportCard";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLabScriptDetail, setShowLabScriptDetail] = useState(false);
  const [selectedLabScript, setSelectedLabScript] = useState<LabScript | null>(null);
  const [editingStatus, setEditingStatus] = useState<Record<string, boolean>>({});

  // Fetch patient-specific lab scripts and manufacturing items
  const { labScripts, loading: labScriptsLoading, updateLabScript } = usePatientLabScripts(patientId);
  const { manufacturingItems, loading: manufacturingLoading, updateManufacturingItemStatus } = usePatientManufacturingItems(patientId);
  const { reportCards, loading: reportCardsLoading, updateLabReportStatus } = useReportCards();
  const { deliveryItems, loading: deliveryItemsLoading, updateDeliveryStatus } = useDeliveryItems();
  const { toast } = useToast();

  // Filter report cards for this specific patient
  const patientReportCards = reportCards.filter(card => {
    // Check if the report card's lab script belongs to this patient
    return card.lab_script_id && labScripts.some(script => script.id === card.lab_script_id);
  });

  // Filter delivery items for this specific patient
  const patientDeliveryItems = deliveryItems.filter(item => {
    // Check if the delivery item's lab script belongs to this patient
    return item.lab_script_id && labScripts.some(script => script.id === item.lab_script_id);
  });

  // State for lab report dialogs
  const [showLabReportForm, setShowLabReportForm] = useState(false);
  const [showViewLabReport, setShowViewLabReport] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<any | null>(null);

  // State for delivery dialogs
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<any | null>(null);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    } else {
      // Use mock data if no patientId provided
      setPatient({
        id: "mock-id",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        phone: "+1 (555) 123-4567",
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip_code: "94102",
        gender: "male",
        date_of_birth: "1985-06-15",
        treatment_type: "Orthodontics",
        status: "Treatment in progress",
        last_visit: "2024-01-15",
        next_appointment: "2024-02-15",
        profile_picture: null
      });
      setLoading(false);
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = (updatedPatientData: any) => {
    setPatient(updatedPatientData);
    setShowEditForm(false);
  };

  // Lab Report Card Handlers
  const handleFillLabReport = (reportCard: any) => {
    setSelectedReportCard(reportCard);
    setShowLabReportForm(true);
  };

  const handleViewLabReport = (reportCard: any) => {
    setSelectedReportCard(reportCard);
    setShowViewLabReport(true);
  };

  const handleLabReportSubmit = async (formData: any) => {
    if (!selectedReportCard) return;

    try {
      // The lab report card is already created by the form, now update the report card status
      await updateLabReportStatus(selectedReportCard.id, 'completed', formData);
      toast({
        title: "Success",
        description: "Lab report card completed successfully!",
      });
      setShowLabReportForm(false);
      setSelectedReportCard(null);
    } catch (error) {
      console.error('Error completing lab report card:', error);
      toast({
        title: "Error",
        description: "Failed to complete lab report card",
        variant: "destructive",
      });
    }
  };

  const handleLabReportCancel = () => {
    setShowLabReportForm(false);
    setSelectedReportCard(null);
  };

  const handleViewLabReportClose = () => {
    setShowViewLabReport(false);
    setSelectedReportCard(null);
  };

  // Delivery Item Handlers
  const handleViewDeliveryDetails = (deliveryItem: any) => {
    setSelectedDeliveryItem(deliveryItem);
    setShowDeliveryDetails(true);
  };

  const handleScheduleAppointment = (deliveryItem: any) => {
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

      // Helper function to format time from 24-hour to 12-hour format
      const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${hour12}:${minutes} ${ampm}`;
      };

      toast({
        title: "Success",
        description: `Appointment scheduled for ${new Date(appointmentData.date).toLocaleDateString()} at ${formatTime(appointmentData.time)}`,
      });
      setShowAppointmentScheduler(false);
      setSelectedDeliveryItem(null);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    }
  };

  const handleStartDelivery = async (deliveryItem: any) => {
    handleScheduleAppointment(deliveryItem);
  };

  const handleCompleteDelivery = async (deliveryItem: any) => {
    try {
      await updateDeliveryStatus(deliveryItem.id, 'inserted');
      toast({
        title: "Success",
        description: "Appliance marked as inserted successfully!",
      });
    } catch (error) {
      console.error('Error marking as inserted:', error);
      toast({
        title: "Error",
        description: "Failed to mark appliance as inserted",
        variant: "destructive",
      });
    }
  };

  const handleDeliveryDetailsClose = () => {
    setShowDeliveryDetails(false);
    setSelectedDeliveryItem(null);
  };

  const handleAppointmentSchedulerClose = () => {
    setShowAppointmentScheduler(false);
    setSelectedDeliveryItem(null);
  };

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const handleViewLabScript = (labScript: LabScript) => {
    setSelectedLabScript(labScript);
    setShowLabScriptDetail(true);
  };

  const handleLabScriptDetailClose = () => {
    setShowLabScriptDetail(false);
    setSelectedLabScript(null);
  };

  const handleLabScriptUpdate = async (id: string, updates: Partial<LabScript>) => {
    await updateLabScript(id, updates);
  };

  const handleDesignStateChange = async (orderId: string, newState: 'not-started' | 'in-progress' | 'hold' | 'completed') => {
    // Map the design state to lab script status
    const statusMap = {
      'not-started': 'pending',
      'in-progress': 'in-progress',
      'hold': 'hold',
      'completed': 'completed'
    };

    const newStatus = statusMap[newState];

    try {
      await updateLabScript(orderId, { status: newStatus });

      // Exit edit mode when updating status
      setEditingStatus(prev => ({
        ...prev,
        [orderId]: false
      }));

    } catch (error) {
      console.error('Error updating lab script status:', error);
    }
  };

  const handleEditStatus = (orderId: string) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleManufacturingStatusChange = async (itemId: string, newStatus: 'pending-printing' | 'in-production' | 'quality-check' | 'completed') => {
    try {
      await updateManufacturingItemStatus(itemId, newStatus);
    } catch (error) {
      console.error('Failed to update manufacturing status:', error);
    }
  };

  const formatAddress = (patient: any) => {
    if (!patient.street && !patient.city) return "No address provided";
    const parts = [
      patient.street,
      patient.city,
      patient.state,
      patient.zip_code
    ].filter(Boolean);
    return parts.join(", ");
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <PageHeader title="Patient Profile" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-slate-600">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <PageHeader title="Patient Profile" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-slate-600">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Fixed Header with Back Button */}
      <div className="fixed top-0 z-30 bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </div>
      </div>

      {/* Content with top padding to account for fixed header */}
      <div className="flex-1 pt-[97px] px-6 pb-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Compact Patient Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-0 z-10">
            {/* Patient Info Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Compact Profile Avatar */}
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md bg-white">
                      <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Patient Details */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{patient.full_name}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-2">
                      <span className="text-sm font-medium">ID: {patient.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-sm font-medium">{calculateAge(patient.date_of_birth)} years old</span>
                      <span className="text-sm font-medium capitalize">{patient.gender || "Not specified"}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-700">{patient.phone || "No phone"}</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-medium text-xs">
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-12 w-px bg-gray-200 mx-6"></div>

                {/* Additional Patient Data */}
                <div className="flex items-center gap-8">
                  {/* Treatment Information */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Treatment</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{patient.treatment_type || "Not assigned"}</p>
                  </div>

                  {/* Last Visit */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Visit</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "No visits"}
                    </p>
                  </div>

                  {/* Next Appointment */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Next Appt</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : "Not scheduled"}
                    </p>
                  </div>

                  {/* Patient Since */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Since</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details Tabs */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm">
              <TabsTrigger value="basic" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <User className="h-3.5 w-3.5" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="lab" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <FlaskConical className="h-3.5 w-3.5" />
                Lab Scripts ({labScripts.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <FileText className="h-3.5 w-3.5" />
                Report Cards ({patientReportCards.length})
              </TabsTrigger>
              <TabsTrigger value="manufacturing" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <Factory className="h-3.5 w-3.5" />
                Manufacturing ({manufacturingItems.length})
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <Package className="h-3.5 w-3.5" />
                Appliance Delivery ({patientDeliveryItems.length})
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <FileText className="h-3.5 w-3.5" />
                Clinical Forms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4">
              {/* Modern Info Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">First Name</p>
                        <p className="text-base font-semibold text-gray-900">{patient.first_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Name</p>
                        <p className="text-base font-semibold text-gray-900">{patient.last_name}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">{calculateAge(patient.date_of_birth)} years old</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                      <p className="text-base font-semibold text-gray-900 capitalize">{patient.gender || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-base font-semibold text-gray-900">{patient.phone || "Not provided"}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <div className="space-y-1">
                        {patient.street && <p className="text-base font-semibold text-gray-900">{patient.street}</p>}
                        <p className="text-base font-semibold text-gray-900">
                          {[patient.city, patient.state, patient.zip_code].filter(Boolean).join(", ") || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient ID</p>
                      <p className="text-base font-semibold text-gray-900 font-mono">{patient.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Treatment Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Stethoscope className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Treatment Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Treatment Type</p>
                      <p className="text-base font-semibold text-gray-900">{patient.treatment_type || "Not assigned"}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Treatment Status</p>
                      <Badge variant="outline" className="mt-1 bg-blue-50 border-blue-200 text-blue-700">
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient Since</p>
                      <p className="text-base font-semibold text-gray-900">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-3 pb-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
                {reportCardsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading report cards...</h3>
                      <p className="text-gray-500">Please wait while we fetch report cards.</p>
                    </div>
                  </div>
                ) : patientReportCards.length > 0 ? (
                  <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                    <div className="space-y-4">
                      {patientReportCards.map((card) => {
                        // Format appliance type display
                        const upperAppliance = card.lab_scripts?.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
                        const lowerAppliance = card.lab_scripts?.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

                        return (
                          <div key={card.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                            <div className="flex items-center justify-between">
                              {/* Left side - Patient info and appliance types */}
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Report Avatar */}
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-4 w-4 text-white" />
                                </div>

                                {/* Patient Name and Details */}
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{card.patient_name}</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {/* Lab Script ID */}
                                    <span className="text-xs text-gray-500 font-mono">
                                      ID: {card.lab_script_id ? card.lab_script_id.slice(0, 8).toUpperCase() : 'N/A'}
                                    </span>
                                    {/* Created Date */}
                                    <span className="text-xs text-gray-500">
                                      Created: {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'No date'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {/* Upper Appliance */}
                                    {upperAppliance && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Upper:</span> {upperAppliance}
                                      </span>
                                    )}
                                    {/* Lower Appliance */}
                                    {lowerAppliance && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Lower:</span> {lowerAppliance}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right side - Action Buttons */}
                              <div className="ml-4 flex gap-2">
                                {/* Lab Report Button */}
                                {card.lab_report_status === 'completed' ? (
                                  <Button
                                    className="border-2 border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50 bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    onClick={() => handleViewLabReport(card)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Lab Report
                                  </Button>
                                ) : (
                                  <Button
                                    className="border-2 border-indigo-600 text-indigo-600 hover:border-indigo-700 hover:text-indigo-700 hover:bg-indigo-50 bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    onClick={() => handleFillLabReport(card)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Fill Lab Report
                                  </Button>
                                )}

                                {/* Clinical Report Button - Show only when lab is completed */}
                                {card.lab_report_status === 'completed' && (
                                  <>
                                    {card.clinical_report_status === 'completed' ? (
                                      <Button
                                        className="border-2 border-purple-600 text-purple-600 hover:border-purple-700 hover:text-purple-700 hover:bg-purple-50 bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Clinical Report
                                      </Button>
                                    ) : (
                                      <Button
                                        className="border-2 border-orange-600 text-orange-600 hover:border-orange-700 hover:text-orange-700 hover:bg-orange-50 bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                      >
                                        <Stethoscope className="h-4 w-4 mr-2" />
                                        Fill Clinical Report
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Cards Available</h3>
                      <p className="text-gray-500 mb-4">Report cards will appear here when lab scripts are completed.</p>
                      <Button
                        onClick={() => window.location.href = '/lab'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Go to Lab Scripts
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="lab" className="mt-3 pb-1">
              <Card className="shadow-sm flex flex-col" style={{ height: 'calc(100vh - 320px)' }}>
                <CardContent className="flex-1 overflow-hidden p-0">
                  {labScriptsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading lab scripts...</h3>
                        <p className="text-gray-500">Please wait while we fetch lab scripts.</p>
                      </div>
                    </div>
                  ) : labScripts.length > 0 ? (
                    <div className="flex flex-col h-full">
                      {/* Table Header - Fixed */}
                      <div className="bg-gray-50 border-b border-gray-200 px-3 py-3 flex-shrink-0" style={{ paddingRight: 'calc(12px + 8px)' }}>
                        <div className="grid grid-cols-8 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider h-6">
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Requested Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Arch Type</div>
                          <div className="col-span-3 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Appliance Type</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Due Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Status</div>
                          <div className="col-span-1 text-right flex items-center justify-end pr-2">Actions</div>
                        </div>
                      </div>

                      {/* Table Body - Scrollable */}
                      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                        {labScripts.map((script) => {
                          // Format appliance type display
                          const getApplianceDisplay = () => {
                            const upper = script.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            const lower = script.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            return `${upper} | ${lower}`;
                          };

                          return (
                            <div key={script.id} className="grid grid-cols-8 gap-4 px-3 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center h-16">
                              {/* Requested Date */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">
                                  {script.requested_date ? new Date(script.requested_date).toLocaleDateString() : 'No date'}
                                </p>
                              </div>

                              {/* Arch Type */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  script.arch_type === 'dual' ? 'bg-purple-100 text-purple-700' :
                                  script.arch_type === 'upper' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {script.arch_type === 'dual' ? 'Dual Arch' :
                                   script.arch_type === 'upper' ? 'Upper Arch' : 'Lower Arch'}
                                </span>
                              </div>

                              {/* Appliance Type */}
                              <div className="col-span-3 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">{getApplianceDisplay()}</p>
                              </div>

                              {/* Due Date */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">
                                  {script.due_date ? new Date(script.due_date).toLocaleDateString() : 'No due date'}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  script.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  script.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                  script.status === 'delayed' ? 'bg-red-100 text-red-700' :
                                  script.status === 'hold' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {script.status}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="col-span-1 h-full flex items-center justify-end pr-2">
                                <div className="flex gap-1">
                                {(() => {
                                  const currentStatus = script.status;
                                  const isEditingStatus = editingStatus[script.id] || false;

                                  // If lab script is completed, show edit button or hold/complete when editing
                                  if (currentStatus === 'completed' && !isEditingStatus) {
                                    return (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditStatus(script.id)}
                                          className="h-8 w-8 p-0"
                                          title="Edit Status"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </>
                                    );
                                  }

                                  if (currentStatus === 'completed' && isEditingStatus) {
                                    return (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDesignStateChange(script.id, 'hold')}
                                          className="h-8 w-8 p-0"
                                          title="Hold"
                                        >
                                          <Square className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDesignStateChange(script.id, 'completed')}
                                          className="h-8 w-8 p-0"
                                          title="Complete"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      </>
                                    );
                                  }

                                  // Use actual lab script status
                                  switch (currentStatus) {
                                    case 'pending':
                                      return (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDesignStateChange(script.id, 'in-progress')}
                                          className="h-8 w-8 p-0"
                                          title="Start Design"
                                        >
                                          <Play className="h-4 w-4" />
                                        </Button>
                                      );

                                    case 'in-progress':
                                      return (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'hold')}
                                            className="h-8 w-8 p-0"
                                            title="Hold"
                                          >
                                            <Square className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'completed')}
                                            className="h-8 w-8 p-0"
                                            title="Complete"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                        </>
                                      );

                                    case 'hold':
                                      return (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'in-progress')}
                                            className="h-8 w-8 p-0"
                                            title="Resume Design"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'completed')}
                                            className="h-8 w-8 p-0"
                                            title="Complete"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                        </>
                                      );

                                    default:
                                      return null;
                                  }
                                })()}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewLabScript(script)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lab Scripts Available</h3>
                        <p className="text-gray-500">Create lab scripts to track patient treatment progress.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manufacturing" className="mt-3 pb-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
                {manufacturingLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading manufacturing orders...</h3>
                      <p className="text-gray-500">Please wait while we fetch manufacturing data.</p>
                    </div>
                  </div>
                ) : manufacturingItems.length > 0 ? (
                  <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                    <div className="space-y-4">
                      {manufacturingItems.map((item) => {
                        // Format appliance type display
                        const upperAppliance = item.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
                        const lowerAppliance = item.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

                        // Get status-specific button configuration
                        const getStatusButton = () => {
                          switch (item.status) {
                            case 'pending-printing':
                              return {
                                text: 'Start Printing',
                                icon: Play,
                                color: 'border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50',
                                onClick: () => handleManufacturingStatusChange(item.id, 'in-production')
                              };
                            case 'in-production':
                              return {
                                text: 'Quality Check',
                                icon: CheckCircle,
                                color: 'border-purple-600 text-purple-600 hover:border-purple-700 hover:text-purple-700 hover:bg-purple-50',
                                onClick: () => handleManufacturingStatusChange(item.id, 'quality-check')
                              };
                            case 'quality-check':
                              return {
                                text: 'Complete',
                                icon: CheckCircle,
                                color: 'border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50',
                                onClick: () => handleManufacturingStatusChange(item.id, 'completed')
                              };
                            case 'completed':
                              return {
                                text: 'Completed',
                                icon: CheckCircle,
                                color: 'border-emerald-600 text-emerald-600 bg-emerald-50',
                                onClick: () => {}
                              };
                            default:
                              return {
                                text: 'View Details',
                                icon: Eye,
                                color: 'border-gray-600 text-gray-600 hover:border-gray-700 hover:text-gray-700 hover:bg-gray-50',
                                onClick: () => {}
                              };
                          }
                        };

                        const statusButton = getStatusButton();

                        return (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                            <div className="flex items-center justify-between">
                              {/* Left side - Patient info and appliance details */}
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Manufacturing Avatar */}
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Factory className="h-4 w-4 text-white" />
                                </div>

                                {/* Patient Details */}
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{item.patient_name}</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {/* Appliance Types with Numbers */}
                                    {item.upper_appliance_type && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Upper:</span> {upperAppliance}
                                        {item.upper_appliance_number && (
                                          <span className="ml-1 font-mono text-purple-600">({item.upper_appliance_number})</span>
                                        )}
                                      </span>
                                    )}
                                    {item.lower_appliance_type && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Lower:</span> {lowerAppliance}
                                        {item.lower_appliance_number && (
                                          <span className="ml-1 font-mono text-purple-600">({item.lower_appliance_number})</span>
                                        )}
                                      </span>
                                    )}
                                    {/* Shade */}
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Shade:</span> {item.shade}
                                    </span>
                                  </div>
                                  {/* Status Badge */}
                                  <div className="mt-2">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      item.status === 'in-production' ? 'bg-blue-100 text-blue-700' :
                                      item.status === 'quality-check' ? 'bg-purple-100 text-purple-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {item.status === 'pending-printing' ? 'New Script' :
                                       item.status === 'in-production' ? 'Printing' :
                                       item.status === 'quality-check' ? 'Inspection' :
                                       item.status === 'completed' ? 'Completed' :
                                       item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right side - Action Button */}
                              <div className="ml-4 flex gap-2">
                                <Button
                                  className={`border-2 ${statusButton.color} bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}
                                  onClick={statusButton.onClick}
                                  disabled={item.status === 'completed'}
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
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Manufacturing Orders</h3>
                      <p className="text-gray-500 mb-4">Manufacturing orders will appear here when lab scripts are completed.</p>
                      <Button
                        onClick={() => window.location.href = '/lab'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Go to Lab Scripts
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="mt-3 pb-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
                {deliveryItemsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading delivery items...</h3>
                      <p className="text-gray-500">Please wait while we fetch delivery items.</p>
                    </div>
                  </div>
                ) : patientDeliveryItems.length > 0 ? (
                  <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                    <div className="space-y-4">
                      {patientDeliveryItems.map((item) => {
                        // Format appliance type display
                        const upperAppliance = item.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
                        const lowerAppliance = item.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

                        // Get status-specific button configuration
                        const getStatusButton = () => {
                          switch (item.delivery_status) {
                            case 'ready-for-delivery':
                              return {
                                text: 'Schedule Appointment',
                                icon: Calendar,
                                color: 'border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50',
                                onClick: () => handleScheduleAppointment(item)
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
                              {/* Left side - Patient info and appliance details */}
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Delivery Avatar */}
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Package className="h-4 w-4 text-white" />
                                </div>

                                {/* Patient Name and Details */}
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{item.patient_name}</h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {/* Delivery ID */}
                                    <span className="text-xs text-gray-500 font-mono">
                                      ID: {item.id ? item.id.slice(0, 8).toUpperCase() : 'N/A'}
                                    </span>
                                    {/* Created Date */}
                                    <span className="text-xs text-gray-500">
                                      Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}
                                    </span>
                                    {/* Shade */}
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Shade:</span> {item.shade}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {/* Upper Appliance */}
                                    {upperAppliance && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Upper:</span> {upperAppliance}
                                      </span>
                                    )}
                                    {/* Lower Appliance */}
                                    {lowerAppliance && (
                                      <span className="text-xs text-gray-600">
                                        <span className="font-medium">Lower:</span> {lowerAppliance}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right side - Status and Action Button */}
                              <div className="ml-4 flex items-center gap-3">
                                {/* Status Badge */}
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                  item.delivery_status === 'ready-for-delivery' ? 'bg-green-100 text-green-800' :
                                  item.delivery_status === 'patient-scheduled' ? 'bg-blue-100 text-blue-800' :
                                  item.delivery_status === 'inserted' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.delivery_status === 'ready-for-delivery' ? 'Ready for Delivery' :
                                   item.delivery_status === 'patient-scheduled' ? 'Scheduled' :
                                   item.delivery_status === 'inserted' ? 'Inserted' :
                                   item.delivery_status}
                                </span>

                                {/* Status Action Button */}
                                <Button
                                  className={`border-2 ${statusButton.color} bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}
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
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Delivery Items Available</h3>
                      <p className="text-gray-500 mb-4">Delivery items will appear here when manufacturing is completed.</p>
                      <Button
                        onClick={() => window.location.href = '/manufacturing'}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Factory className="h-4 w-4 mr-2" />
                        Go to Manufacturing
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="mt-3 pb-1">
              <Card className="shadow-sm flex flex-col" style={{ height: 'calc(100vh - 370px)' }}>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      Clinical Forms & Documents
                    </CardTitle>
                    <Button className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Add Clinical Form
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clinical Forms Available</h3>
                    <p className="text-gray-500">Upload or create clinical forms to track patient progress.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {patient && (
            <EditPatientForm
              patient={patient}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lab Script Detail Dialog */}
      <LabScriptDetail
        open={showLabScriptDetail}
        onClose={handleLabScriptDetailClose}
        labScript={selectedLabScript}
        onUpdate={handleLabScriptUpdate}
      />

      {/* Lab Report Card Form Dialog */}
      <Dialog open={showLabReportForm && !!selectedReportCard} onOpenChange={setShowLabReportForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <LabReportCardForm
              reportCard={selectedReportCard}
              onSubmit={handleLabReportSubmit}
              onCancel={handleLabReportCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Lab Report Card Dialog */}
      <Dialog open={showViewLabReport && !!selectedReportCard} onOpenChange={setShowViewLabReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <ViewLabReportCard
              reportCard={selectedReportCard}
              onClose={handleViewLabReportClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Details Dialog */}
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
        onClose={handleAppointmentSchedulerClose}
        onSchedule={handleAppointmentScheduled}
        deliveryItem={selectedDeliveryItem}
      />
    </div>
  );
}
