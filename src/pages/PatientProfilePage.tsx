
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
  RotateCcw
} from "lucide-react";
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
  const { toast } = useToast();

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
          {/* Patient Header Card */}
          <Card className="overflow-hidden sticky top-0 z-10 shadow-lg">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Smaller Profile Picture */}
                  <Avatar className="h-16 w-16 border-3 border-white shadow-lg">
                    <AvatarImage src={patient.profile_picture || undefined} alt={patient.full_name} />
                    <AvatarFallback className="bg-white text-indigo-600 text-lg font-bold">
                      {getInitials(patient.first_name, patient.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Compact Patient Info */}
                  <div className="text-white">
                    <h1 className="text-xl font-bold">{patient.full_name}</h1>
                    <p className="text-indigo-100 text-sm">ID: {patient.id.slice(0, 8).toUpperCase()}</p>
                    <div className="flex items-center gap-4 mt-1 text-indigo-100 text-sm">
                      <span>{calculateAge(patient.date_of_birth)} years old</span>
                      <span>{patient.phone || "No phone"}</span>
                      <span className="capitalize">{patient.gender || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-white text-indigo-600 font-semibold px-3 py-1"
                  >
                    {patient.status}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-white border-t border-gray-100 px-6 py-4">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Treatment Type</p>
                    <p className="font-semibold text-gray-900">{patient.treatment_type || "Not assigned"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="font-semibold text-gray-900">
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "No visits yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Appointment</p>
                    <p className="font-semibold text-gray-900">
                      {patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Patient Details Tabs */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-lg">
              <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <User className="h-4 w-4" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="lab" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <FlaskConical className="h-4 w-4" />
                Lab Scripts
              </TabsTrigger>
              <TabsTrigger value="manufacturing" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Factory className="h-4 w-4" />
                Manufacturing
              </TabsTrigger>

              <TabsTrigger value="clinical" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <FileText className="h-4 w-4" />
                Clinical Forms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        <p className="text-base font-semibold text-gray-900">{patient.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        <p className="text-base font-semibold text-gray-900">{patient.last_name}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-base font-semibold text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{calculateAge(patient.date_of_birth)} years old</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-base font-semibold text-gray-900 capitalize">{patient.gender || "Not specified"}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Patient ID</p>
                      <p className="text-base font-semibold text-gray-900">{patient.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Phone className="h-5 w-5 text-indigo-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-base font-semibold text-gray-900">{patient.phone || "Not provided"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <div className="space-y-1">
                        {patient.street && <p className="text-base font-semibold text-gray-900">{patient.street}</p>}
                        <p className="text-base font-semibold text-gray-900">
                          {[patient.city, patient.state, patient.zip_code].filter(Boolean).join(", ") || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Treatment Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5 text-indigo-600" />
                    Treatment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Treatment Type</p>
                      <p className="text-base font-semibold text-gray-900">{patient.treatment_type || "Not assigned"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Treatment Status</p>
                      <Badge variant="outline" className="mt-1">
                        {patient.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Patient Since</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab" className="mt-6 pb-1.5">
              <Card className="shadow-sm flex flex-col" style={{ height: 'calc(100vh - 400px)' }}>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FlaskConical className="h-5 w-5 text-indigo-600" />
                      Lab Scripts & Results ({labScripts.length})
                    </CardTitle>
                    <Button className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Add Lab Script
                    </Button>
                  </div>
                </CardHeader>
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
                      <div className="bg-gray-50 border-b border-gray-200 px-3 md:px-2 py-3 md:py-2 flex-shrink-0" style={{ paddingRight: 'calc(12px + 8px)' }}>
                        <div className="grid grid-cols-8 gap-4 md:gap-3 text-xs font-semibold text-gray-600 uppercase tracking-wider h-6 md:h-5">
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 flex items-center justify-center">Requested Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 flex items-center justify-center">Arch Type</div>
                          <div className="col-span-3 text-center border-r border-gray-300 pr-4 md:pr-3 flex items-center justify-center">Appliance Type</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 flex items-center justify-center">Due Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 flex items-center justify-center">Status</div>
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
                            <div key={script.id} className="grid grid-cols-8 gap-4 md:gap-3 px-3 md:px-2 py-4 md:py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center h-16 md:h-14">
                              {/* Requested Date */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">
                                  {script.requested_date ? new Date(script.requested_date).toLocaleDateString() : 'No date'}
                                </p>
                              </div>

                              {/* Arch Type */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 md:px-1 py-1 rounded-full text-xs font-medium ${
                                  script.arch_type === 'dual' ? 'bg-purple-100 text-purple-700' :
                                  script.arch_type === 'upper' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  <span className="hidden sm:inline">
                                    {script.arch_type === 'dual' ? 'Dual Arch' :
                                     script.arch_type === 'upper' ? 'Upper Arch' : 'Lower Arch'}
                                  </span>
                                  <span className="sm:hidden">
                                    {script.arch_type === 'dual' ? 'Dual' :
                                     script.arch_type === 'upper' ? 'Upper' : 'Lower'}
                                  </span>
                                </span>
                              </div>

                              {/* Appliance Type */}
                              <div className="col-span-3 text-center border-r border-gray-300 pr-4 md:pr-3 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">{getApplianceDisplay()}</p>
                              </div>

                              {/* Due Date */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 md:pr-3 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">
                                  {script.due_date ? new Date(script.due_date).toLocaleDateString() : 'No due date'}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="col-span-1 border-r border-gray-300 pr-4 md:pr-3 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 md:px-1 py-1 rounded-full text-xs font-medium ${
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
                                          className="h-8 w-8 md:h-7 md:w-7 p-0"
                                          title="Edit Status"
                                        >
                                          <Edit className="h-4 w-4 md:h-3 md:w-3" />
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
                                          className="h-8 w-8 md:h-7 md:w-7 p-0"
                                          title="Hold"
                                        >
                                          <Square className="h-4 w-4 md:h-3 md:w-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDesignStateChange(script.id, 'completed')}
                                          className="h-8 w-8 md:h-7 md:w-7 p-0"
                                          title="Complete"
                                        >
                                          <CheckCircle className="h-4 w-4 md:h-3 md:w-3" />
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
                                          className="h-8 w-8 md:h-7 md:w-7 p-0"
                                          title="Start Design"
                                        >
                                          <Play className="h-4 w-4 md:h-3 md:w-3" />
                                        </Button>
                                      );

                                    case 'in-progress':
                                      return (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'hold')}
                                            className="h-8 w-8 md:h-7 md:w-7 p-0"
                                            title="Hold"
                                          >
                                            <Square className="h-4 w-4 md:h-3 md:w-3" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'completed')}
                                            className="h-8 w-8 md:h-7 md:w-7 p-0"
                                            title="Complete"
                                          >
                                            <CheckCircle className="h-4 w-4 md:h-3 md:w-3" />
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
                                            className="h-8 w-8 md:h-7 md:w-7 p-0"
                                            title="Resume Design"
                                          >
                                            <RotateCcw className="h-4 w-4 md:h-3 md:w-3" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDesignStateChange(script.id, 'completed')}
                                            className="h-8 w-8 md:h-7 md:w-7 p-0"
                                            title="Complete"
                                          >
                                            <CheckCircle className="h-4 w-4 md:h-3 md:w-3" />
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
                                  className="h-8 w-8 md:h-7 md:w-7 p-0"
                                  onClick={() => handleViewLabScript(script)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4 md:h-3 md:w-3" />
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

            <TabsContent value="manufacturing" className="mt-6 pb-1.5">
              <Card className="shadow-sm flex flex-col" style={{ height: 'calc(100vh - 400px)' }}>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Factory className="h-5 w-5 text-indigo-600" />
                      Manufacturing Orders ({manufacturingItems.length})
                    </CardTitle>
                    <Button className="flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Create Order
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  {manufacturingLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading manufacturing orders...</h3>
                        <p className="text-gray-500">Please wait while we fetch manufacturing data.</p>
                      </div>
                    </div>
                  ) : manufacturingItems.length > 0 ? (
                    <div className="flex flex-col h-full">
                      {/* Table Header - Fixed */}
                      <div className="bg-gray-50 border-b border-gray-200 px-3 py-3 flex-shrink-0" style={{ paddingRight: 'calc(12px + 8px)' }}>
                        <div className="grid grid-cols-8 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider h-6">
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Created Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Arch Type</div>
                          <div className="col-span-2 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Appliance Type</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Shade</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Status</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Actions</div>
                          <div className="col-span-1 text-center flex items-center justify-center pr-2">Preview</div>
                        </div>
                      </div>

                      {/* Table Body - Scrollable */}
                      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                        {manufacturingItems.map((item) => {
                          // Format appliance type display
                          const getApplianceDisplay = () => {
                            const upper = item.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            const lower = item.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            return `${upper} | ${lower}`;
                          };

                          // Render action buttons based on status
                          const renderActionButtons = () => {
                            switch (item.status) {
                              case 'pending-printing':
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleManufacturingStatusChange(item.id, 'in-production')}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Start
                                  </Button>
                                );
                              case 'in-production':
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs border-purple-600 text-purple-600 hover:bg-purple-50"
                                    onClick={() => handleManufacturingStatusChange(item.id, 'quality-check')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    QC
                                  </Button>
                                );
                              case 'quality-check':
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs border-green-600 text-green-600 hover:bg-green-50"
                                    onClick={() => handleManufacturingStatusChange(item.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Done
                                  </Button>
                                );
                              case 'completed':
                                return (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    disabled
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete
                                  </Button>
                                );
                              default:
                                return null;
                            }
                          };

                          return (
                            <div key={item.id} className="grid grid-cols-8 gap-4 px-3 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center h-16">
                              {/* Created Date */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}
                                </p>
                              </div>

                              {/* Arch Type */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  item.arch_type === 'dual' ? 'bg-purple-100 text-purple-700' :
                                  item.arch_type === 'upper' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {item.arch_type === 'dual' ? 'Dual Arch' :
                                   item.arch_type === 'upper' ? 'Upper Arch' : 'Lower Arch'}
                                </span>
                              </div>

                              {/* Appliance Type */}
                              <div className="col-span-2 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">{getApplianceDisplay()}</p>
                              </div>

                              {/* Shade */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                  {item.shade}
                                </span>
                              </div>

                              {/* Status */}
                              <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  item.status === 'in-production' ? 'bg-blue-100 text-blue-700' :
                                  item.status === 'quality-check' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.status === 'pending-printing' ? 'New Script' :
                                   item.status === 'in-production' ? 'Printing' :
                                   item.status === 'quality-check' ? 'Inspection' :
                                   'Completed'}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                {renderActionButtons()}
                              </div>

                              {/* Preview */}
                              <div className="col-span-1 h-full flex items-center justify-center pr-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
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
                        <p className="text-gray-500">Create orders for dental appliances and prosthetics.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="clinical" className="mt-6 pb-1.5">
              <Card className="shadow-sm flex flex-col" style={{ height: 'calc(100vh - 400px)' }}>
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
    </div>
  );
}
