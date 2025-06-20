
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { EditPatientForm } from "@/components/EditPatientForm";
import { LabScriptDetail } from "@/components/LabScriptDetail";
import { TreatmentDialog, TreatmentData } from "@/components/TreatmentDialog";
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
  Palette,
  Plus,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { LabReportCardForm } from "@/components/LabReportCardForm";
import { ViewLabReportCard } from "@/components/ViewLabReportCard";
import { ClinicalReportCardForm } from "@/components/ClinicalReportCardForm";
import { ViewClinicalReportCard } from "@/components/ViewClinicalReportCard";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // Treatment options for IV sedation form
  const treatmentOptions = [
    "NO TREATMENT",
    "FULL ARCH FIXED",
    "DENTURE",
    "IMPLANT REMOVABLE DENTURE",
    "SINGLE IMPLANT",
    "MULTIPLE IMPLANTS",
    "EXTRACTION",
    "EXTRACTION AND GRAFT"
  ];

  // Data collection reasons
  const dataCollectionReasons = [
    "PRE SURGICAL DATA COLLECTION",
    "SURGICAL DAY DATA COLLECTION",
    "SURGICAL REVISION DATA COLLECTION",
    "FOLLOW-UP DATA COLLECTION",
    "DATA COLLECTED BECAUSE OF BITE ADJUSTMENT",
    "INTAGLIO GAP",
    "APPLIANCE FIT NOT PASSIVE",
    "APPLIANCE FRACTURED",
    "FINAL DATA COLLECTION",
    "OTHERS"
  ];
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLabScriptDetail, setShowLabScriptDetail] = useState(false);
  const [selectedLabScript, setSelectedLabScript] = useState<LabScript | null>(null);
  const [editingStatus, setEditingStatus] = useState<Record<string, boolean>>({});
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);

  // Fetch patient-specific lab scripts and manufacturing items
  const { labScripts, loading: labScriptsLoading, updateLabScript } = usePatientLabScripts(patientId);
  const { manufacturingItems, loading: manufacturingLoading, updateManufacturingItemStatus } = usePatientManufacturingItems(patientId);
  const { reportCards, loading: reportCardsLoading, updateLabReportStatus, updateClinicalReportStatus } = useReportCards();
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

  // State for clinical report dialogs
  const [showClinicalReportForm, setShowClinicalReportForm] = useState(false);
  const [showViewClinicalReport, setShowViewClinicalReport] = useState(false);
  const [insertionStatus, setInsertionStatus] = useState<{canSubmit: boolean; reason: string; message: string} | null>(null);

  // State for delivery dialogs
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<any | null>(null);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);

  // State for clinical forms
  const [showDataCollectionForm, setShowDataCollectionForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Define total number of steps
  const [dataCollectionSheets, setDataCollectionSheets] = useState<any[]>([]);
  const [showDataCollectionPreview, setShowDataCollectionPreview] = useState(false);
  const [selectedDataCollectionSheet, setSelectedDataCollectionSheet] = useState<any | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({ type: null, text: '' });
  const [showToast, setShowToast] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingDataCollectionSheet, setEditingDataCollectionSheet] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<any | null>(null);

  // State for IV Sedation Flow Chart
  const [showIVSedationForm, setShowIVSedationForm] = useState(false);
  const [ivSedationCurrentStep, setIVSedationCurrentStep] = useState(1);
  const ivSedationTotalSteps = 6; // Define total number of steps for IV sedation
  const [ivSedationSheets, setIVSedationSheets] = useState<any[]>([]);
  const [showIVSedationPreview, setShowIVSedationPreview] = useState(false);
  const [selectedIVSedationSheet, setSelectedIVSedationSheet] = useState<any | null>(null);
  const [ivSedationFormMessage, setIVSedationFormMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({ type: null, text: '' });
  const [showIVSedationToast, setShowIVSedationToast] = useState(false);
  const [ivSedationActiveDropdown, setIVSedationActiveDropdown] = useState<string | null>(null);
  const [editingIVSedationSheet, setEditingIVSedationSheet] = useState<any | null>(null);
  const [isIVSedationEditMode, setIsIVSedationEditMode] = useState(false);
  const [showIVSedationDeleteConfirmation, setShowIVSedationDeleteConfirmation] = useState(false);
  const [ivSedationSheetToDelete, setIVSedationSheetToDelete] = useState<any | null>(null);

  // State for Flow Entry Dialog
  const [showFlowEntryDialog, setShowFlowEntryDialog] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newFlowEntry, setNewFlowEntry] = useState({
    hour: '',
    minute: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    rr: '',
    spo2: '',
    medications: [] as string[]
  });

  // Medication options for surgery
  const medicationOptions = [
    // Versed (Midazolam)
    { id: 'versed-0.5', name: '0.5mg | Versed', category: 'Versed' },
    { id: 'versed-1', name: '1mg | Versed', category: 'Versed' },
    { id: 'versed-2', name: '2mg | Versed', category: 'Versed' },
    { id: 'versed-3', name: '3mg | Versed', category: 'Versed' },

    // Fentanyl
    { id: 'fentanyl-25', name: '25 mcg | Fentanyl', category: 'Fentanyl' },
    { id: 'fentanyl-50', name: '50 mcg | Fentanyl', category: 'Fentanyl' },
    { id: 'fentanyl-75', name: '75 mcg | Fentanyl', category: 'Fentanyl' },
    { id: 'fentanyl-100', name: '100 mcg | Fentanyl', category: 'Fentanyl' },

    // Ketorolac
    { id: 'ketorolac-15', name: '15 mg | Ketorolac', category: 'Ketorolac' },
    { id: 'ketorolac-30', name: '30 mg | Ketorolac', category: 'Ketorolac' },

    // Benadryl
    { id: 'benadryl-25', name: '25 mg | Benadryl', category: 'Benadryl' },
    { id: 'benadryl-50', name: '50 mg | Benadryl', category: 'Benadryl' },

    // Dexamethasone
    { id: 'dexamethasone-2', name: '2 mg | Dexamethasone', category: 'Dexamethasone' },
    { id: 'dexamethasone-4', name: '4 mg | Dexamethasone', category: 'Dexamethasone' },

    // Acetaminophen
    { id: 'acetaminophen-20', name: '2 ml (20 mg) | Acetaminophen', category: 'Acetaminophen' },
    { id: 'acetaminophen-50', name: '5 ml (50 mg) | Acetaminophen', category: 'Acetaminophen' },

    // Valium
    { id: 'valium-10', name: '10 mg | Valium Tab', category: 'Valium' },

    // Clindamycin
    { id: 'clindamycin-300', name: '300 mg | Clinda Tab', category: 'Clindamycin' },

    // Lidocaine
    { id: 'lidocaine-2.5', name: '0.5 ml (2.5 mg) | Lidocaine', category: 'Lidocaine' }
  ];

  // Define steps for the stepper
  const stepperSteps = [
    { title: "Patient Info", description: "Basic information" },
    { title: "Step 2", description: "Additional data" },
    { title: "Step 3", description: "More details" },
    { title: "Step 4", description: "Final review" }
  ];
  const [dataCollectionFormData, setDataCollectionFormData] = useState({
    patientName: "",
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    reasonsForCollection: [] as string[],
    customReason: "",
    // Step 2 - Current Appliances
    currentUpperAppliance: "",
    currentLowerAppliance: "",
    // Step 4 - Additional Notes
    additionalNotes: "",
    // Step 2 - Data Collection Status
    dataCollected: {
      // Pre-surgical options
      preSurgicalPictures: null, // null = not selected, true = yes, false = no
      preSurgicalJawRecords: { upper: false, lower: false },
      facialScan: false,
      // Regular options
      jawRecords: { upper: false, lower: false },
      tissueScan: { upper: false, lower: false },
      photogrammetry: { upper: false, lower: false },
      dcRefScan: { upper: false, lower: false },
      appliance360: { upper: false, lower: false },
      followUpPictures: null, // null = not selected, true = yes, false = no
      // Surgical options
      surgicalPictures: null, // null = not selected, true = yes, false = no
      surgicalJawRecords: { upper: false, lower: false },
      surgicalTissueScan: { upper: false, lower: false },
      // Fractured appliance option
      fracturedAppliancePictures: null // null = not selected, true = yes, false = no
    }
  });

  // IV Sedation Form Data
  const [ivSedationFormData, setIVSedationFormData] = useState({
    patientName: "",
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    upperTreatment: "",
    lowerTreatment: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    // Pre-Assessment fields
    npoStatus: "",
    morningMedications: "",
    allergies: [] as string[],
    allergiesOther: "",
    pregnancyRisk: "",
    lastMenstrualCycle: "",
    anesthesiaHistory: "",
    anesthesiaHistoryOther: "",
    respiratoryProblems: [] as string[],
    respiratoryProblemsOther: "",
    cardiovascularProblems: [] as string[],
    cardiovascularProblemsOther: "",
    gastrointestinalProblems: [] as string[],
    gastrointestinalProblemsOther: "",
    neurologicProblems: [] as string[],
    neurologicProblemsOther: "",
    endocrineRenalProblems: [] as string[],
    endocrineRenalProblemsOther: "",
    lastA1CLevel: "",
    miscellaneous: [] as string[],
    miscellaneousOther: "",
    socialHistory: [] as string[],
    socialHistoryOther: "",
    // Additional Assessment fields
    wellDevelopedNourished: "",
    patientAnxious: "",
    asaClassification: "",
    airwayEvaluation: [] as string[],
    airwayEvaluationOther: "",
    mallampatiScore: "",
    heartLungEvaluation: [] as string[],
    heartLungEvaluationOther: "",
    // Sedation Plan fields
    instrumentsChecklist: {} as Record<string, boolean>,
    sedationType: "",
    medicationsPlanned: [] as string[],
    medicationsOther: "",
    administrationRoute: [] as string[],
    emergencyProtocols: {} as Record<string, boolean>,
    // IV Sedation Flow Chart fields
    timeInRoom: "",
    sedationStartTime: "",
    // Flow monitoring entries
    flowEntries: [] as Array<{
      id: string;
      time: string;
      bp: string;
      heartRate: string;
      rr: string;
      spo2: string;
      medications: string[];
    }>,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchDataCollectionSheets();
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
        status: "Treatment in progress",
        treatment_type: "Orthodontics",
        upper_arch: true,
        lower_arch: false,
        upper_treatment: "FULL ARCH FIXED",
        lower_treatment: "NO TREATMENT",
        upper_surgery_date: "2025-07-15",
        lower_surgery_date: null,
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

  const fetchDataCollectionSheets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('data_collection_sheets')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data collection sheets:', error);
        return;
      }

      setDataCollectionSheets(data || []);
    } catch (error) {
      console.error('Error:', error);
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

  // Clinical Report Handlers - Using exact same logic as main report cards page
  const checkInsertionStatus = async (reportCardId: string) => {
    try {
      // Find the report card to get lab_script_id
      const reportCard = reportCards.find(card => card.id === reportCardId);
      if (!reportCard) {
        return { canSubmit: false, reason: 'error', message: 'Report card not found.' };
      }

      // Check if there's a delivery item for this report card and if it's inserted
      const { data: deliveryItem, error } = await supabase
        .from('delivery_items')
        .select('delivery_status, patient_name')
        .eq('lab_script_id', reportCard.lab_script_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!deliveryItem) {
        // Check manufacturing status
        const { data: manufacturingItem, error: mfgError } = await supabase
          .from('manufacturing_items')
          .select('status, patient_name')
          .eq('lab_script_id', reportCard.lab_script_id)
          .single();

        if (mfgError && mfgError.code !== 'PGRST116') {
          throw mfgError;
        }

        if (!manufacturingItem) {
          return { canSubmit: false, reason: 'not_manufactured', message: 'Appliance has not been manufactured yet. Please complete manufacturing first.' };
        }

        if (manufacturingItem.status !== 'completed') {
          // Format the manufacturing status for better user experience
          const statusDisplay = manufacturingItem.status === 'pending-printing' ? 'Pending Printing' :
                                manufacturingItem.status === 'in-production' ? 'Printing' :
                                manufacturingItem.status === 'quality-check' ? 'Quality Check' :
                                manufacturingItem.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

          // Add helpful context based on the manufacturing stage
          const contextMessage = manufacturingItem.status === 'pending-printing' ? 'The appliance is waiting to start printing.' :
                                 manufacturingItem.status === 'in-production' ? 'The appliance is currently being printed.' :
                                 manufacturingItem.status === 'quality-check' ? 'The appliance is undergoing quality inspection.' :
                                 'The appliance is still being processed.';

          return { canSubmit: false, reason: 'not_completed', message: `Appliance is still in manufacturing (Status: ${statusDisplay}). ${contextMessage} Please complete manufacturing first.` };
        }

        return { canSubmit: false, reason: 'not_delivered', message: 'Appliance has been manufactured but not yet prepared for delivery. Please check the delivery status.' };
      }

      if (deliveryItem.delivery_status !== 'inserted') {
        return { canSubmit: false, reason: 'not_inserted', message: `Appliance has not been inserted yet (Status: ${deliveryItem.delivery_status}). Clinical report can only be filled after appliance insertion.` };
      }

      return { canSubmit: true, reason: 'ready', message: 'Ready for clinical report submission.' };
    } catch (error) {
      console.error('Error checking insertion status:', error);
      return { canSubmit: false, reason: 'error', message: 'Unable to verify appliance status. Please try again.' };
    }
  };

  const handleFillClinicalReport = async (reportCard: any) => {
    setSelectedReportCard(reportCard);

    // Check insertion status before opening the form
    const statusCheck = await checkInsertionStatus(reportCard.id);
    setInsertionStatus(statusCheck);

    setShowClinicalReportForm(true);
  };

  const handleClinicalReportSubmit = async (formData: any) => {
    if (!selectedReportCard) return;

    // Check insertion status before allowing submission
    const statusCheck = await checkInsertionStatus(selectedReportCard.id);

    if (!statusCheck.canSubmit) {
      toast({
        title: "Error",
        description: statusCheck.message,
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClinicalReportStatus(selectedReportCard.id, 'completed', formData);
      toast({
        title: "Success",
        description: "Clinical report card completed successfully!",
      });
      setShowClinicalReportForm(false);
      setSelectedReportCard(null);
      setInsertionStatus(null);
    } catch (error) {
      console.error('Error submitting clinical report:', error);
      toast({
        title: "Error",
        description: "Failed to submit clinical report card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClinicalReportCancel = () => {
    setShowClinicalReportForm(false);
    setSelectedReportCard(null);
    setInsertionStatus(null);
  };

  const handleViewClinicalReport = (reportCard: any) => {
    setSelectedReportCard(reportCard);
    setShowViewClinicalReport(true);
  };

  const handleViewClinicalReportClose = () => {
    setShowViewClinicalReport(false);
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

  const handleAddTreatment = () => {
    setShowTreatmentDialog(true);
  };

  const handleTreatmentSubmit = async (treatmentData: TreatmentData) => {
    if (!patient) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          upper_treatment: treatmentData.upperTreatment || null,
          lower_treatment: treatmentData.lowerTreatment || null,
          upper_surgery_date: treatmentData.upperSurgeryDate || null,
          lower_surgery_date: treatmentData.lowerSurgeryDate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatient(data);
      toast({
        title: "Success",
        description: "Treatment information updated successfully!",
      });
    } catch (error) {
      console.error('Error updating treatment information:', error);
      toast({
        title: "Error",
        description: "Failed to update treatment information",
        variant: "destructive",
      });
    }
  };

  const handleTreatmentDialogClose = () => {
    setShowTreatmentDialog(false);
  };

  // IV Sedation Form Handlers
  const handleIVSedationFormOpen = () => {
    // Pre-fill patient name from current patient data
    setIVSedationFormData({
      patientName: patient ? `${patient.first_name} ${patient.last_name}` : "",
      date: new Date().toISOString().split('T')[0], // Reset to current date each time
      upperTreatment: "",
      lowerTreatment: "",
      heightFeet: "",
      heightInches: "",
      weight: "",
      // Pre-Assessment fields
      npoStatus: "",
      morningMedications: "",
      allergies: [],
      allergiesOther: "",
      pregnancyRisk: "",
      lastMenstrualCycle: "",
      anesthesiaHistory: "",
      anesthesiaHistoryOther: "",
      respiratoryProblems: [],
      respiratoryProblemsOther: "",
      cardiovascularProblems: [],
      cardiovascularProblemsOther: "",
      gastrointestinalProblems: [],
      gastrointestinalProblemsOther: "",
      neurologicProblems: [],
      neurologicProblemsOther: "",
      endocrineRenalProblems: [],
      endocrineRenalProblemsOther: "",
      lastA1CLevel: "",
      miscellaneous: [],
      miscellaneousOther: "",
      socialHistory: [],
      socialHistoryOther: "",
      // Additional Assessment fields
      wellDevelopedNourished: "",
      patientAnxious: "",
      asaClassification: "",
      airwayEvaluation: [],
      airwayEvaluationOther: "",
      mallampatiScore: "",
      heartLungEvaluation: [],
      heartLungEvaluationOther: "",
      // Sedation Plan fields
      instrumentsChecklist: {},
      sedationType: "",
      medicationsPlanned: [],
      medicationsOther: "",
      administrationRoute: [],
      emergencyProtocols: {},
      // IV Sedation Flow Chart fields
      timeInRoom: "",
      sedationStartTime: "",
      // Flow monitoring entries
      flowEntries: [],
    });
    setIVSedationCurrentStep(1); // Reset to first step
    setShowIVSedationForm(true);
  };

  const handleIVSedationFormClose = () => {
    setShowIVSedationForm(false);
    setIVSedationCurrentStep(1);
    setIsIVSedationEditMode(false);
    setEditingIVSedationSheet(null);
    setIVSedationFormMessage({ type: null, text: '' });
    setShowIVSedationToast(false);
  };

  // Data Collection Form Handlers
  const handleDataCollectionFormOpen = () => {
    // Pre-fill patient name from current patient data
    setDataCollectionFormData({
      patientName: patient ? `${patient.first_name} ${patient.last_name}` : "",
      date: new Date().toISOString().split('T')[0], // Reset to current date each time
      reasonsForCollection: [],
      customReason: "",
      // Reset Step 2 data
      currentUpperAppliance: "",
      currentLowerAppliance: "",
      // Reset Step 4 data
      additionalNotes: "",
      dataCollected: {
        // Pre-surgical options
        preSurgicalPictures: null, // null = not selected, true = yes, false = no
        preSurgicalJawRecords: { upper: false, lower: false },
        facialScan: false,
        // Regular options
        jawRecords: { upper: false, lower: false },
        tissueScan: { upper: false, lower: false },
        photogrammetry: { upper: false, lower: false },
        dcRefScan: { upper: false, lower: false },
        appliance360: { upper: false, lower: false },
        followUpPictures: null, // null = not selected, true = yes, false = no
        // Surgical options
        surgicalPictures: null, // null = not selected, true = yes, false = no
        surgicalJawRecords: { upper: false, lower: false },
        surgicalTissueScan: { upper: false, lower: false },
        // Fractured appliance option
        fracturedAppliancePictures: null // null = not selected, true = yes, false = no
      }
    });
    setCurrentStep(1); // Reset to first step
    setShowDataCollectionForm(true);
  };

  const handleDataCollectionFormClose = () => {
    setShowDataCollectionForm(false);
    setFormMessage({ type: null, text: '' });
    setShowToast(false);
    setIsEditMode(false);
    setEditingDataCollectionSheet(null);
    setCurrentStep(1); // Reset to first step
  };

  const handleViewDataCollectionSheet = (sheet: any) => {
    setSelectedDataCollectionSheet(sheet);
    setShowDataCollectionPreview(true);
  };

  const handleDataCollectionPreviewClose = () => {
    setShowDataCollectionPreview(false);
    setSelectedDataCollectionSheet(null);
  };

  const handleEditDataCollectionSheet = (sheet: any) => {
    setEditingDataCollectionSheet(sheet);
    setIsEditMode(true);

    // Pre-fill form data with existing sheet data
    setDataCollectionFormData({
      patientName: sheet.patient_name || "",
      date: sheet.collection_date || new Date().toISOString().split('T')[0],
      reasonsForCollection: sheet.reasons_for_collection || [],
      customReason: sheet.custom_reason || "",
      currentUpperAppliance: sheet.current_upper_appliance || "",
      currentLowerAppliance: sheet.current_lower_appliance || "",
      additionalNotes: sheet.additional_notes || "",
      dataCollected: {
        // Pre-surgical options
        preSurgicalPictures: sheet.pre_surgical_pictures,
        preSurgicalJawRecords: {
          upper: sheet.pre_surgical_jaw_records_upper || false,
          lower: sheet.pre_surgical_jaw_records_lower || false
        },
        facialScan: sheet.facial_scan || false,
        // Regular options
        jawRecords: {
          upper: sheet.jaw_records_upper || false,
          lower: sheet.jaw_records_lower || false
        },
        tissueScan: {
          upper: sheet.tissue_scan_upper || false,
          lower: sheet.tissue_scan_lower || false
        },
        photogrammetry: {
          upper: sheet.photogrammetry_upper || false,
          lower: sheet.photogrammetry_lower || false
        },
        dcRefScan: {
          upper: sheet.dc_ref_scan_upper || false,
          lower: sheet.dc_ref_scan_lower || false
        },
        appliance360: {
          upper: sheet.appliance_360_upper || false,
          lower: sheet.appliance_360_lower || false
        },
        followUpPictures: sheet.follow_up_pictures,
        // Surgical options
        surgicalPictures: sheet.surgical_pictures,
        surgicalJawRecords: {
          upper: sheet.surgical_jaw_records_upper || false,
          lower: sheet.surgical_jaw_records_lower || false
        },
        surgicalTissueScan: {
          upper: sheet.surgical_tissue_scan_upper || false,
          lower: sheet.surgical_tissue_scan_lower || false
        },
        // Fractured appliance option
        fracturedAppliancePictures: sheet.fractured_appliance_pictures
      }
    });

    setCurrentStep(1); // Start from first step
    setShowDataCollectionForm(true);
  };

  const handleDeleteDataCollectionSheet = (sheet: any) => {
    setSheetToDelete(sheet);
    setShowDeleteConfirmation(true);
    setActiveDropdown(null); // Close the dropdown
  };

  const handleConfirmDelete = async () => {
    if (!sheetToDelete) return;

    try {
      const { error } = await supabase
        .from('data_collection_sheets')
        .delete()
        .eq('id', sheetToDelete.id);

      if (error) {
        console.error('Error deleting data collection sheet:', error);
        setFormMessage({
          type: 'error',
          text: `Failed to delete data collection sheet: ${error.message}`
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        return;
      }

      // Remove from local state
      setDataCollectionSheets(prev =>
        prev.filter(sheet => sheet.id !== sheetToDelete.id)
      );

      // Show success message
      setFormMessage({
        type: 'success',
        text: 'Data collection sheet deleted successfully!'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error('Error deleting data collection sheet:', error);
      setFormMessage({
        type: 'error',
        text: 'Failed to delete data collection sheet'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setShowDeleteConfirmation(false);
      setSheetToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSheetToDelete(null);
  };

  const handleDataCollectionFormChange = (field: string, value: string) => {
    setDataCollectionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleReason = (reason: string) => {
    // Define single selection options (mutually exclusive)
    const singleSelectionOptions = [
      "PRE SURGICAL DATA COLLECTION",
      "SURGICAL DAY DATA COLLECTION",
      "SURGICAL REVISION DATA COLLECTION"
    ];

    // Define multiple selection options
    const multipleSelectionOptions = [
      "FOLLOW-UP DATA COLLECTION",
      "DATA COLLECTED BECAUSE OF BITE ADJUSTMENT",
      "INTAGLIO GAP",
      "APPLIANCE FIT NOT PASSIVE",
      "APPLIANCE FRACTURED",
      "FINAL DATA COLLECTION",
      "OTHERS"
    ];

    setDataCollectionFormData(prev => {
      const currentSelections = prev.reasonsForCollection;
      const isCurrentlySelected = currentSelections.includes(reason);

      // If deselecting, just remove it
      if (isCurrentlySelected) {
        return {
          ...prev,
          reasonsForCollection: currentSelections.filter(r => r !== reason),
          // Clear custom reason if "OTHERS" is removed
          customReason: reason === "OTHERS" ? "" : prev.customReason
        };
      }

      // If selecting a single selection option
      if (singleSelectionOptions.includes(reason)) {
        return {
          ...prev,
          reasonsForCollection: [reason], // Replace all selections with just this one
          customReason: "" // Clear custom reason when switching to single selection
        };
      }

      // If selecting a multiple selection option
      if (multipleSelectionOptions.includes(reason)) {
        // Remove any single selection options first
        const filteredSelections = currentSelections.filter(r => !singleSelectionOptions.includes(r));
        return {
          ...prev,
          reasonsForCollection: [...filteredSelections, reason],
          customReason: prev.customReason
        };
      }

      // Fallback (shouldn't reach here)
      return prev;
    });
  };

  // Step 2 handlers for data collection checklist
  const handleDataCollectionToggle = (category: string, arch: string | null, value: boolean) => {
    setDataCollectionFormData(prev => ({
      ...prev,
      dataCollected: {
        ...prev.dataCollected,
        [category]: arch ? {
          ...(prev.dataCollected[category as keyof typeof prev.dataCollected] as any),
          [arch]: value
        } : value
      }
    }));
  };



  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setFormMessage({ type: null, text: '' }); // Clear messages when moving to next step
      setShowToast(false); // Clear toast when moving to next step
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFormMessage({ type: null, text: '' }); // Clear messages when moving to previous step
      setShowToast(false); // Clear toast when moving to previous step
    }
  };

  // IV Sedation Step Navigation
  const handleIVSedationNextStep = () => {
    if (ivSedationCurrentStep < ivSedationTotalSteps) {
      setIVSedationCurrentStep(ivSedationCurrentStep + 1);
      setIVSedationFormMessage({ type: null, text: '' }); // Clear messages when moving to next step
      setShowIVSedationToast(false); // Clear toast when moving to next step
    }
  };

  const handleIVSedationPreviousStep = () => {
    if (ivSedationCurrentStep > 1) {
      setIVSedationCurrentStep(ivSedationCurrentStep - 1);
      setIVSedationFormMessage({ type: null, text: '' }); // Clear messages when moving to previous step
      setShowIVSedationToast(false); // Clear toast when moving to previous step
    }
  };

  const handleDataCollectionFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for Step 2 - Picture fields are mandatory
    if (currentStep === 2) {
      const { reasonsForCollection, dataCollected } = dataCollectionFormData;
      let missingPictures = [];

      // Check which picture fields should be validated based on selection
      if (reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION")) {
        if (dataCollected.preSurgicalPictures === null) {
          missingPictures.push("Pre-Surgical Pictures");
        }
      }

      if (reasonsForCollection.includes("SURGICAL DAY DATA COLLECTION") ||
          reasonsForCollection.includes("SURGICAL REVISION DATA COLLECTION")) {
        if (dataCollected.surgicalPictures === null) {
          missingPictures.push("Surgical Pictures");
        }
      }

      if (!reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") &&
          !reasonsForCollection.includes("SURGICAL DAY DATA COLLECTION") &&
          !reasonsForCollection.includes("SURGICAL REVISION DATA COLLECTION")) {
        if (dataCollected.followUpPictures === null) {
          missingPictures.push("Follow-Up Pictures");
        }
      }

      if (reasonsForCollection.includes("APPLIANCE FRACTURED")) {
        if (dataCollected.fracturedAppliancePictures === null) {
          missingPictures.push("Fractured Appliance Pictures");
        }
      }

      // Show validation error if any picture fields are missing
      if (missingPictures.length > 0) {
        setFormMessage({
          type: 'error',
          text: `Please select Yes or No for: ${missingPictures.join(', ')}`
        });
        setShowToast(true);
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        return;
      }
    }

    if (currentStep < totalSteps) {
      handleNextStep();
    } else {
      // Final submission - Save to database
      handleSubmitDataCollectionSheet();
    }
  };

  // Submit data collection sheet to database
  const handleSubmitDataCollectionSheet = async () => {
    try {
      const dataCollectionData = {
        patient_id: patientId,
        patient_name: dataCollectionFormData.patientName,
        collection_date: dataCollectionFormData.date,
        reasons_for_collection: dataCollectionFormData.reasonsForCollection,
        custom_reason: dataCollectionFormData.customReason,
        current_upper_appliance: dataCollectionFormData.currentUpperAppliance,
        current_lower_appliance: dataCollectionFormData.currentLowerAppliance,

        // Picture data
        pre_surgical_pictures: dataCollectionFormData.dataCollected.preSurgicalPictures,
        surgical_pictures: dataCollectionFormData.dataCollected.surgicalPictures,
        follow_up_pictures: dataCollectionFormData.dataCollected.followUpPictures,
        fractured_appliance_pictures: dataCollectionFormData.dataCollected.fracturedAppliancePictures,

        // 3D scan data
        pre_surgical_jaw_records_upper: dataCollectionFormData.dataCollected.preSurgicalJawRecords?.upper || false,
        pre_surgical_jaw_records_lower: dataCollectionFormData.dataCollected.preSurgicalJawRecords?.lower || false,
        facial_scan: dataCollectionFormData.dataCollected.facialScan || false,
        jaw_records_upper: dataCollectionFormData.dataCollected.jawRecords?.upper || false,
        jaw_records_lower: dataCollectionFormData.dataCollected.jawRecords?.lower || false,
        tissue_scan_upper: dataCollectionFormData.dataCollected.tissueScan?.upper || false,
        tissue_scan_lower: dataCollectionFormData.dataCollected.tissueScan?.lower || false,
        photogrammetry_upper: dataCollectionFormData.dataCollected.photogrammetry?.upper || false,
        photogrammetry_lower: dataCollectionFormData.dataCollected.photogrammetry?.lower || false,
        dc_ref_scan_upper: dataCollectionFormData.dataCollected.dcRefScan?.upper || false,
        dc_ref_scan_lower: dataCollectionFormData.dataCollected.dcRefScan?.lower || false,
        appliance_360_upper: dataCollectionFormData.dataCollected.appliance360?.upper || false,
        appliance_360_lower: dataCollectionFormData.dataCollected.appliance360?.lower || false,

        additional_notes: dataCollectionFormData.additionalNotes
      };

      // Save to Supabase database - either insert or update
      let data, error;

      if (isEditMode && editingDataCollectionSheet) {
        // Update existing sheet
        const { data: updateData, error: updateError } = await supabase
          .from('data_collection_sheets')
          .update(dataCollectionData)
          .eq('id', editingDataCollectionSheet.id)
          .select()
          .single();
        data = updateData;
        error = updateError;
      } else {
        // Insert new sheet
        const { data: insertData, error: insertError } = await supabase
          .from('data_collection_sheets')
          .insert([dataCollectionData])
          .select()
          .single();
        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error('Error saving data collection sheet:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setFormMessage({
          type: 'error',
          text: `Failed to save data collection sheet: ${error.message}`
        });
        setShowToast(true);
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        return;
      }

      // Update local state
      if (isEditMode && editingDataCollectionSheet) {
        // Update existing sheet in the list
        setDataCollectionSheets(prev =>
          prev.map(sheet => sheet.id === editingDataCollectionSheet.id ? data : sheet)
        );
      } else {
        // Add new sheet to the beginning of the list
        setDataCollectionSheets(prev => [data, ...prev]);
      }

      // Show success toast
      setFormMessage({
        type: 'success',
        text: isEditMode ? 'Data collection sheet updated successfully!' : 'Data collection sheet submitted successfully!'
      });
      setShowToast(true);

      // Auto-hide toast after 3 seconds and close form
      setTimeout(() => {
        setShowToast(false);
        handleDataCollectionFormClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting data collection sheet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormMessage({
        type: 'error',
        text: `Failed to submit data collection sheet: ${errorMessage}`
      });
      setShowToast(true);
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header with Back Button */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-4 py-2 min-h-0">
        {/* Fixed Patient Header */}
        <div className="flex-shrink-0 mb-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
        </div>

        {/* Fixed Tabs Navigation and Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="basic" className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm flex-shrink-0">
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

            <TabsContent value="basic" className="flex-1 mt-2 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Modern Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pl-0 pr-0 pt-2 pb-2" style={{ height: 'calc(100vh - 280px)' }}>
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
                    <div className="space-y-3 pb-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">First Name</p>
                          <p className="text-sm font-semibold text-gray-900">{patient.first_name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Name</p>
                          <p className="text-sm font-semibold text-gray-900">{patient.last_name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{calculateAge(patient.date_of_birth)} years old</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{patient.gender || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
                    <div className="space-y-3 pb-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-900">{patient.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <div className="space-y-1">
                          {patient.street && <p className="text-sm font-semibold text-gray-900">{patient.street}</p>}
                          <p className="text-sm font-semibold text-gray-900">
                            {[patient.city, patient.state, patient.zip_code].filter(Boolean).join(", ") || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient ID</p>
                        <p className="text-sm font-semibold text-gray-900 font-mono">{patient.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Treatment Information</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleAddTreatment}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white h-7 w-7 p-0 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add Treatment</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
                    <div className="space-y-3 pb-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Treatment Status</p>
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                          {patient.status || "No Status Set"}
                        </Badge>
                      </div>

                      {/* Upper and Lower Treatment Information - Separated */}
                      {((patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT") ||
                        (patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT")) && (
                        <div className="space-y-4">
                          {/* Upper Treatment Section */}
                          {patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Upper Arch Treatment</p>
                              </div>
                              <div className="space-y-2">
                                <Badge variant="outline" className="bg-white border-blue-300 text-blue-800 text-xs font-medium">
                                  {patient.upper_treatment}
                                </Badge>
                                {patient.upper_surgery_date && (
                                  <div className="text-xs text-blue-700 font-medium">
                                    Surgery Date: {new Date(patient.upper_surgery_date).toLocaleDateString('en-US')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Divider - Only show if both treatments exist */}
                          {patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT" &&
                           patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT" && (
                            <div className="flex items-center">
                              <div className="flex-1 border-t border-gray-300"></div>
                              <div className="px-3">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </div>
                              <div className="flex-1 border-t border-gray-300"></div>
                            </div>
                          )}

                          {/* Lower Treatment Section */}
                          {patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Lower Arch Treatment</p>
                              </div>
                              <div className="space-y-2">
                                <Badge variant="outline" className="bg-white border-green-300 text-green-800 text-xs font-medium">
                                  {patient.lower_treatment}
                                </Badge>
                                {patient.lower_surgery_date && (
                                  <div className="text-xs text-green-700 font-medium">
                                    Surgery Date: {new Date(patient.lower_surgery_date).toLocaleDateString('en-US')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient Since</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Medical Information</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
                    <div className="space-y-3 pb-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Medical History</p>
                        <p className="text-sm font-semibold text-gray-900">No medical history recorded</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Allergies</p>
                        <p className="text-sm font-semibold text-gray-900">No known allergies</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Emergency Contact</p>
                        <p className="text-sm font-semibold text-gray-900">Not provided</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Insurance</p>
                        <p className="text-sm font-semibold text-gray-900">Not provided</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="flex-1 mt-2 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full mb-4 table-container-rounded">
                {reportCardsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading report cards...</h3>
                      <p className="text-gray-500">Please wait while we fetch report cards.</p>
                    </div>
                  </div>
                ) : patientReportCards.length > 0 ? (
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-enhanced table-body">
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
                                        onClick={() => handleViewClinicalReport(card)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Clinical Report
                                      </Button>
                                    ) : (
                                      <Button
                                        className="border-2 border-orange-600 text-orange-600 hover:border-orange-700 hover:text-orange-700 hover:bg-orange-50 bg-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                        onClick={() => handleFillClinicalReport(card)}
                                      >
                                        <Activity className="h-4 w-4 mr-2" />
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

            <TabsContent value="lab" className="flex-1 mt-2 overflow-hidden">
              <Card className="shadow-sm flex flex-col h-full mb-4 table-container-rounded">
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
                      <div className="bg-gray-50 border-b border-gray-200 px-3 py-3 flex-shrink-0 table-header">
                        <div className="grid grid-cols-9 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider h-6">
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Requested Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Arch Type</div>
                          <div className="col-span-2 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Appliance Type</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Shade</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Due Date</div>
                          <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Status</div>
                          <div className="col-span-2 text-right flex items-center justify-end pr-2">Actions</div>
                        </div>
                      </div>

                      {/* Table Body - Scrollable */}
                      <div className="flex-1 overflow-y-auto scrollbar-enhanced table-body">
                        {labScripts.map((script) => {
                          // Format appliance type display
                          const getApplianceDisplay = () => {
                            const upper = script.upper_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            const lower = script.lower_appliance_type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                            return `${upper} | ${lower}`;
                          };

                          return (
                            <div key={script.id} className="grid grid-cols-9 gap-4 px-3 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center h-16">
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
                              <div className="col-span-2 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">{getApplianceDisplay()}</p>
                              </div>

                              {/* Shade */}
                              <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                                <p className="text-gray-600 text-xs">{script.shade || 'N/A'}</p>
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
                              <div className="col-span-2 h-full flex items-center justify-end pr-2">
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

            <TabsContent value="manufacturing" className="flex-1 mt-2 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full mb-4 table-container-rounded">
                {manufacturingLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading manufacturing orders...</h3>
                      <p className="text-gray-500">Please wait while we fetch manufacturing data.</p>
                    </div>
                  </div>
                ) : manufacturingItems.length > 0 ? (
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-enhanced table-body">
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

            <TabsContent value="delivery" className="flex-1 mt-2 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full mb-4">
                {deliveryItemsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading delivery items...</h3>
                      <p className="text-gray-500">Please wait while we fetch delivery items.</p>
                    </div>
                  </div>
                ) : patientDeliveryItems.length > 0 ? (
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-enhanced">
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

            <TabsContent value="clinical" className="flex-1 mt-2 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Clinical Forms Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pl-0 pr-0 pt-2 pb-2" style={{ height: 'calc(100vh - 280px)' }}>
                  {/* Data Collection Sheet */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Data Collection Sheet ({dataCollectionSheets.length})</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          onClick={handleDataCollectionFormOpen}
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Data Collection Sheet</span>
                        </button>

                        {/* Data Collection Sheets */}
                        {dataCollectionSheets.length > 0 ? (
                          dataCollectionSheets.map((sheet) => (
                            <div key={sheet.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                 onClick={() => handleViewDataCollectionSheet(sheet)}>
                              {/* Header with date and status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {new Date(sheet.collection_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Main reason */}
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                  {sheet.reasons_for_collection?.[0] || 'Data Collection'}
                                </p>
                                {sheet.reasons_for_collection?.length > 1 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    +{sheet.reasons_for_collection.length - 1} more reason{sheet.reasons_for_collection.length > 2 ? 's' : ''}
                                  </p>
                                )}
                              </div>

                              {/* Timestamp and Menu */}
                              <div className="flex items-end justify-between">
                                <p className="text-xs text-gray-500">
                                  Created {new Date(sheet.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })} at {new Date(sheet.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>

                                {/* Three dots menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdown(activeDropdown === sheet.id ? null : sheet.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                  >
                                    <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {activeDropdown === sheet.id && (
                                    <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdown(null);
                                          handleEditDataCollectionSheet(sheet);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteDataCollectionSheet(sheet);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors duration-200"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500 mb-1">No data collection sheets</p>
                            <p className="text-xs text-gray-400">Use the button above to create your first sheet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* IV Sedation Flow Chart */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">IV Sedation Flow Chart (0)</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          onClick={handleIVSedationFormOpen}
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add IV Sedation Flow Chart</span>
                        </button>

                        {/* Empty State */}
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500 mb-1">No IV sedation flow charts</p>
                          <p className="text-xs text-gray-400">Use the button above to create your first flow chart</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Encounter Form */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Encounter Form (0)</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Encounter Form</span>
                        </button>

                        {/* Empty State */}
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500 mb-1">No encounter forms</p>
                          <p className="text-xs text-gray-400">Use the button above to create your first encounter form</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent Forms */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Consent Forms (0)</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Consent Form</span>
                        </button>

                        {/* Empty State */}
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500 mb-1">No consent forms</p>
                          <p className="text-xs text-gray-400">Use the button above to create your first consent form</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Clinical Report Card Form Dialog */}
      <Dialog open={showClinicalReportForm && !!selectedReportCard} onOpenChange={setShowClinicalReportForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <ClinicalReportCardForm
              reportCard={selectedReportCard}
              onSubmit={handleClinicalReportSubmit}
              onCancel={handleClinicalReportCancel}
              insertionStatus={insertionStatus}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Clinical Report Card Dialog */}
      <Dialog open={showViewClinicalReport && !!selectedReportCard} onOpenChange={setShowViewClinicalReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <ViewClinicalReportCard
              reportCardId={selectedReportCard.id}
              onClose={handleViewClinicalReportClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Scheduler */}
      <AppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={handleAppointmentSchedulerClose}
        onSchedule={handleAppointmentScheduled}
        deliveryItem={selectedDeliveryItem}
      />

      {/* Treatment Dialog */}
      <TreatmentDialog
        isOpen={showTreatmentDialog}
        onClose={handleTreatmentDialogClose}
        onSubmit={handleTreatmentSubmit}
        initialData={patient ? {
          upperTreatment: patient.upper_treatment || "",
          lowerTreatment: patient.lower_treatment || "",
          upperSurgeryDate: patient.upper_surgery_date || "",
          lowerSurgeryDate: patient.lower_surgery_date || ""
        } : undefined}
      />

      {/* Data Collection Form Dialog */}
      <Dialog open={showDataCollectionForm} onOpenChange={handleDataCollectionFormClose}>
        <DialogContent className="max-w-5xl h-[88vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-indigo-600" />
              {isEditMode ? 'Edit Data Collection Sheet' : 'Data Collection Sheet'} - Step {currentStep} of {totalSteps}
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar - Balanced size */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="w-full">
              {/* Progress Bar Container with Labels - Separated Segments */}
              <div className="flex items-center gap-2 w-full">
                {/* Step 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-sm font-medium transition-colors duration-300 mb-2 ${
                    currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Basic Info
                  </span>
                  <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                    currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-sm font-medium transition-colors duration-300 mb-2 ${
                    currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Pictures
                  </span>
                  <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                    currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 3 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-sm font-medium transition-colors duration-300 mb-2 ${
                    currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    IOS / 3D Data
                  </span>
                  <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                    currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 4 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-sm font-medium transition-colors duration-300 mb-2 ${
                    currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Notes and Submit
                  </span>
                  <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                    currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            </div>
          </div>



          {/* Form Content - Balanced sizing */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <form onSubmit={handleDataCollectionFormSubmit} className="flex-1 flex flex-col">
              {/* Step Content Container */}
              <div className="flex-1 px-6 py-3 overflow-hidden">
                {currentStep === 1 && (
                  <div className="h-full flex flex-col space-y-5">
                    {/* Patient Information Row */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        Patient Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patientName" className="text-sm font-semibold">Patient Name</Label>
                          <Input
                            id="patientName"
                            value={dataCollectionFormData.patientName}
                            disabled
                            className="bg-gray-50 h-10 text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date" className="text-sm font-semibold">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={dataCollectionFormData.date}
                            onChange={(e) => handleDataCollectionFormChange('date', e.target.value)}
                            className="cursor-pointer h-10 text-sm mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reason for Data Collection */}
                    <div className="flex-1 space-y-3 min-h-0">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        Reason for Data Collection
                      </h3>

                      {/* Reason Selection Grid - Balanced sizing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-72">
                        {dataCollectionReasons.map((reason) => {
                          const isSelected = dataCollectionFormData.reasonsForCollection.includes(reason);

                          // Define option groups
                          const singleSelectionOptions = [
                            "PRE SURGICAL DATA COLLECTION",
                            "SURGICAL DAY DATA COLLECTION",
                            "SURGICAL REVISION DATA COLLECTION"
                          ];

                          const multipleSelectionOptions = [
                            "FOLLOW-UP DATA COLLECTION",
                            "DATA COLLECTED BECAUSE OF BITE ADJUSTMENT",
                            "INTAGLIO GAP",
                            "APPLIANCE FIT NOT PASSIVE",
                            "APPLIANCE FRACTURED",
                            "FINAL DATA COLLECTION",
                            "OTHERS"
                          ];

                          // Check if this option should be disabled
                          const currentSelections = dataCollectionFormData.reasonsForCollection;
                          const hasSingleSelection = currentSelections.some(sel => singleSelectionOptions.includes(sel));
                          const hasMultipleSelection = currentSelections.some(sel => multipleSelectionOptions.includes(sel));

                          let isDisabled = false;

                          // Disable single selection options if any multiple selection is chosen
                          if (singleSelectionOptions.includes(reason) && hasMultipleSelection && !isSelected) {
                            isDisabled = true;
                          }

                          // Disable multiple selection options if any single selection is chosen
                          if (multipleSelectionOptions.includes(reason) && hasSingleSelection && !isSelected) {
                            isDisabled = true;
                          }

                          // Slightly smaller button size
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => !isDisabled && handleToggleReason(reason)}
                              disabled={isDisabled}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all duration-200 text-left min-h-[45px] ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md'
                                  : isDisabled
                                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 cursor-pointer hover:shadow-sm'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-sm font-medium leading-tight">{reason}</span>
                            </button>
                          );
                        })}

                        {/* Custom input field - slightly smaller size when OTHERS is selected */}
                        {dataCollectionFormData.reasonsForCollection.includes("OTHERS") && (
                          <div className="md:col-span-2">
                            <Input
                              placeholder="Specify custom reason..."
                              value={dataCollectionFormData.customReason}
                              onChange={(e) => handleDataCollectionFormChange('customReason', e.target.value)}
                              className="w-full p-2.5 text-sm border-2 border-indigo-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 h-[45px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 Content - Data Collection */}
                {currentStep === 2 && (
                  <div className="h-full flex flex-col space-y-4 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      Data Collection & Current Appliances
                    </h3>

                    {/* Current Appliances Row - Balanced sizing */}
                    <div className="max-w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Current Upper Appliance */}
                        <div className="flex flex-col bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <Label htmlFor="currentUpperAppliance" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            Current Upper Appliance
                          </Label>
                          <Input
                            id="currentUpperAppliance"
                            value={dataCollectionFormData.currentUpperAppliance}
                            onChange={(e) => handleDataCollectionFormChange('currentUpperAppliance', e.target.value)}
                            placeholder="Enter current upper appliance..."
                            className="h-10 text-sm"
                          />
                        </div>

                        {/* Current Lower Appliance */}
                        <div className="flex flex-col bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <Label htmlFor="currentLowerAppliance" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Current Lower Appliance
                          </Label>
                          <Input
                            id="currentLowerAppliance"
                            value={dataCollectionFormData.currentLowerAppliance}
                            onChange={(e) => handleDataCollectionFormChange('currentLowerAppliance', e.target.value)}
                            placeholder="Enter current lower appliance..."
                            className="h-10 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Data Collection Checklist - Enhanced with larger elements */}
                    <div className="flex-1 overflow-y-auto">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Data Collection Status</h4>

                      {/* Picture-Related Data Collection Options */}
                      {dataCollectionFormData.reasonsForCollection.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {/* Pre-Surgical Pictures - Balanced sizing */}
                          {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                            <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                              dataCollectionFormData.dataCollected.preSurgicalPictures === null
                                ? 'border-red-300 bg-red-50 shadow-sm'
                                : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                  Pre-Surgical Pictures <span className="text-red-500 text-base">*</span>
                                </h5>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('preSurgicalPictures', null, true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.preSurgicalPictures === true
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-300 hover:border-green-400'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('preSurgicalPictures', null, false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.preSurgicalPictures === false
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-300 hover:border-red-400'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Surgical Pictures - Only for surgical day data collection */}
                          {(dataCollectionFormData.reasonsForCollection.includes("SURGICAL DAY DATA COLLECTION") ||
                            dataCollectionFormData.reasonsForCollection.includes("SURGICAL REVISION DATA COLLECTION")) && (
                            <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                              dataCollectionFormData.dataCollected.surgicalPictures === null
                                ? 'border-red-300 bg-red-50 shadow-sm'
                                : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Surgical Pictures <span className="text-red-500 text-base">*</span>
                                </h5>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('surgicalPictures', null, true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.surgicalPictures === true
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('surgicalPictures', null, false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.surgicalPictures === false
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Follow-Up Pictures - For regular data collection (not pre-surgical or surgical) */}
                          {!dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") &&
                           !dataCollectionFormData.reasonsForCollection.includes("SURGICAL DAY DATA COLLECTION") &&
                           !dataCollectionFormData.reasonsForCollection.includes("SURGICAL REVISION DATA COLLECTION") && (
                            <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                              dataCollectionFormData.dataCollected.followUpPictures === null
                                ? 'border-red-300 bg-red-50 shadow-sm'
                                : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                  Follow-Up Pictures <span className="text-red-500 text-base">*</span>
                                </h5>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('followUpPictures', null, true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.followUpPictures === true
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('followUpPictures', null, false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.followUpPictures === false
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fractured Appliance Pictures - Only show if "APPLIANCE FRACTURED" is selected */}
                          {dataCollectionFormData.reasonsForCollection.includes("APPLIANCE FRACTURED") && (
                            <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                              dataCollectionFormData.dataCollected.fracturedAppliancePictures === null
                                ? 'border-red-300 bg-red-50 shadow-sm'
                                : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Fractured Appliance Pictures <span className="text-red-500 text-base">*</span>
                                </h5>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('fracturedAppliancePictures', null, true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.fracturedAppliancePictures === true
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('fracturedAppliancePictures', null, false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.fracturedAppliancePictures === false
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}


                    </div>
                  </div>
                )}

                {/* Step 3 Content - Balanced 3D Scans & Upper/Lower Data */}
                {currentStep === 3 && (
                  <div className="h-full flex flex-col space-y-4">
                    {/* Header Section - Balanced */}
                    <div className="flex-shrink-0">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        3D Scans & Upper/Lower Data Collection
                      </h3>
                    </div>

                    {/* Scrollable Content Area - Balanced */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                      {dataCollectionFormData.reasonsForCollection.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {/* Pre-Surgical Jaw Records - Balanced sizing */}
                              {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                  <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Pre-Surgical Jaw Records (IOS)
                                  </h5>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('preSurgicalJawRecords', 'upper', !dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper
                                          ? 'bg-blue-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                      Upper
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('preSurgicalJawRecords', 'lower', !dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower
                                          ? 'bg-blue-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                      Lower
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Facial Scan - Only for pre-surgical */}
                              {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                  <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Facial Scan
                                  </h5>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('facialScan', null, !dataCollectionFormData.dataCollected.facialScan)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.facialScan
                                          ? 'bg-blue-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.facialScan
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.facialScan && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                      Scan Collected
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Regular Data Collection Options (for all selections except pre-surgical) */}
                              {!dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                                <>
                                  {/* Jaw Records - Balanced */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                    <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      Jaw Records (IOS)
                                    </h5>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('jawRecords', 'upper', !dataCollectionFormData.dataCollected.jawRecords.upper)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.jawRecords.upper
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.jawRecords.upper
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.jawRecords.upper && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Upper
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('jawRecords', 'lower', !dataCollectionFormData.dataCollected.jawRecords.lower)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.jawRecords.lower
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.jawRecords.lower
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.jawRecords.lower && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Lower
                                      </button>
                                    </div>
                                  </div>

                                  {/* Tissue Scan */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                    <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      Tissue Scan
                                    </h5>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('tissueScan', 'upper', !dataCollectionFormData.dataCollected.tissueScan.upper)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.tissueScan.upper
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.tissueScan.upper
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.tissueScan.upper && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Upper
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('tissueScan', 'lower', !dataCollectionFormData.dataCollected.tissueScan.lower)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.tissueScan.lower
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.tissueScan.lower
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.tissueScan.lower && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Lower
                                      </button>
                                    </div>
                                  </div>
                                  {/* Photogrammetry */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                    <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      Photogrammetry (ICAM)
                                    </h5>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('photogrammetry', 'upper', !dataCollectionFormData.dataCollected.photogrammetry.upper)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.photogrammetry.upper
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.photogrammetry.upper
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.photogrammetry.upper && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Upper
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('photogrammetry', 'lower', !dataCollectionFormData.dataCollected.photogrammetry.lower)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.photogrammetry.lower
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.photogrammetry.lower
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.photogrammetry.lower && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Lower
                                      </button>
                                    </div>
                                  </div>

                                  {/* DC-REF Scan */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                    <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      DC-REF Scan
                                    </h5>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('dcRefScan', 'upper', !dataCollectionFormData.dataCollected.dcRefScan.upper)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.dcRefScan.upper
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.dcRefScan.upper
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.dcRefScan.upper && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Upper
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('dcRefScan', 'lower', !dataCollectionFormData.dataCollected.dcRefScan.lower)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.dcRefScan.lower
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.dcRefScan.lower
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.dcRefScan.lower && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Lower
                                      </button>
                                    </div>
                                  </div>

                                  {/* Appliance 360 */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 min-h-[100px] flex items-center justify-between">
                                    <h5 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                      Appliance 360
                                    </h5>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('appliance360', 'upper', !dataCollectionFormData.dataCollected.appliance360.upper)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.appliance360.upper
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.appliance360.upper
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.appliance360.upper && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Upper
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDataCollectionToggle('appliance360', 'lower', !dataCollectionFormData.dataCollected.appliance360.lower)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                          dataCollectionFormData.dataCollected.appliance360.lower
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                          dataCollectionFormData.dataCollected.appliance360.lower
                                            ? 'border-white bg-white'
                                            : 'border-gray-400 bg-transparent'
                                        }`}>
                                          {dataCollectionFormData.dataCollected.appliance360.lower && (
                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>
                                        Lower
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                    </div>
                  </div>
                )}

                {/* Step 4 Content - Notes */}
                {currentStep === 4 && (
                  <div className="h-full flex flex-col space-y-4">
                    {/* Header Section */}
                    <div className="flex-shrink-0">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        Additional Notes
                      </h3>
                      <p className="text-sm text-gray-600">Add any additional notes or comments about this data collection (optional)</p>
                    </div>

                    {/* Notes Content */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Additional Notes
                                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                              </Label>
                              <textarea
                                id="additionalNotes"
                                value={dataCollectionFormData.additionalNotes || ''}
                                onChange={(e) => handleDataCollectionFormChange('additionalNotes', e.target.value)}
                                placeholder="Enter any additional notes, observations, or special instructions related to this data collection..."
                                rows={8}
                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                              />
                            </div>

                            {/* Character count */}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>You can add any relevant information about the data collection process</span>
                              <span>{(dataCollectionFormData.additionalNotes || '').length} characters</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions - Fixed at bottom */}
              <div className="flex-shrink-0 px-6 py-2 border-t border-gray-200 bg-white">
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={currentStep === 1 ? handleDataCollectionFormClose : handlePreviousStep}
                  >
                    {currentStep === 1 ? 'Cancel' : 'Previous'}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {currentStep === totalSteps ? 'Submit Data Collection Sheet' : 'Save and Next'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Collection Sheet Preview Dialog */}
      <Dialog open={showDataCollectionPreview} onOpenChange={handleDataCollectionPreviewClose}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              Data Collection Sheet Preview
            </DialogTitle>
          </DialogHeader>

          {selectedDataCollectionSheet && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Collection Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Patient Name</label>
                      <p className="text-base font-semibold text-gray-900">{selectedDataCollectionSheet.patient_name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collection Date</label>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedDataCollectionSheet.collection_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</label>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedDataCollectionSheet.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {new Date(selectedDataCollectionSheet.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons for Collection Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Reasons for Collection</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedDataCollectionSheet.reasons_for_collection?.map((reason: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                      >
                        {reason}
                      </span>
                    ))}
                    {selectedDataCollectionSheet.custom_reason && (
                      <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200 hover:bg-orange-100 transition-colors duration-200">
                        Custom: {selectedDataCollectionSheet.custom_reason}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Appliances Card */}
              {(selectedDataCollectionSheet.current_upper_appliance || selectedDataCollectionSheet.current_lower_appliance) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900">Current Appliances</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDataCollectionSheet.current_upper_appliance && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Upper Appliance</div>
                          <div className="text-base font-semibold text-blue-900">{selectedDataCollectionSheet.current_upper_appliance}</div>
                        </div>
                      )}
                      {selectedDataCollectionSheet.current_lower_appliance && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Lower Appliance</div>
                          <div className="text-base font-semibold text-blue-900">{selectedDataCollectionSheet.current_lower_appliance}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Collection Status Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Data Collection Status</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Pictures Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <h4 className="text-base font-semibold text-gray-800">Pictures</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDataCollectionSheet.pre_surgical_pictures !== null && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-blue-900">Pre-Surgical Pictures</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedDataCollectionSheet.pre_surgical_pictures ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                selectedDataCollectionSheet.pre_surgical_pictures
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedDataCollectionSheet.pre_surgical_pictures ? 'Collected' : 'Not Collected'}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedDataCollectionSheet.surgical_pictures !== null && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-blue-900">Surgical Pictures</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedDataCollectionSheet.surgical_pictures ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                selectedDataCollectionSheet.surgical_pictures
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedDataCollectionSheet.surgical_pictures ? 'Collected' : 'Not Collected'}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedDataCollectionSheet.follow_up_pictures !== null && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-blue-900">Follow-Up Pictures</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedDataCollectionSheet.follow_up_pictures ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                selectedDataCollectionSheet.follow_up_pictures
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedDataCollectionSheet.follow_up_pictures ? 'Collected' : 'Not Collected'}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedDataCollectionSheet.fractured_appliance_pictures !== null && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-blue-900">Fractured Appliance Pictures</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedDataCollectionSheet.fractured_appliance_pictures ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                selectedDataCollectionSheet.fractured_appliance_pictures
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedDataCollectionSheet.fractured_appliance_pictures ? 'Collected' : 'Not Collected'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3D Scans & Data Collection Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <h4 className="text-base font-semibold text-gray-800">3D Scans & Data Collection</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Pre-Surgical Jaw Records */}
                        {(selectedDataCollectionSheet.pre_surgical_jaw_records_upper || selectedDataCollectionSheet.pre_surgical_jaw_records_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">Pre-Surgical Jaw Records</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.pre_surgical_jaw_records_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.pre_surgical_jaw_records_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Facial Scan */}
                        {selectedDataCollectionSheet.facial_scan && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-blue-900">Facial Scan</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">Collected</span>
                            </div>
                          </div>
                        )}

                        {/* Jaw Records (IOS) */}
                        {(selectedDataCollectionSheet.jaw_records_upper || selectedDataCollectionSheet.jaw_records_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">Jaw Records (IOS)</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.jaw_records_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.jaw_records_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tissue Scan */}
                        {(selectedDataCollectionSheet.tissue_scan_upper || selectedDataCollectionSheet.tissue_scan_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">Tissue Scan</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.tissue_scan_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.tissue_scan_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Photogrammetry (ICAM) */}
                        {(selectedDataCollectionSheet.photogrammetry_upper || selectedDataCollectionSheet.photogrammetry_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">Photogrammetry (ICAM)</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.photogrammetry_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.photogrammetry_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* DC-REF Scan */}
                        {(selectedDataCollectionSheet.dc_ref_scan_upper || selectedDataCollectionSheet.dc_ref_scan_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">DC-REF Scan</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.dc_ref_scan_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.dc_ref_scan_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Appliance 360 */}
                        {(selectedDataCollectionSheet.appliance_360_upper || selectedDataCollectionSheet.appliance_360_lower) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            <div className="text-sm font-medium text-blue-900 mb-2">Appliance 360</div>
                            <div className="flex gap-2">
                              {selectedDataCollectionSheet.appliance_360_upper && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">Upper</span>
                              )}
                              {selectedDataCollectionSheet.appliance_360_lower && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">Lower</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes Card */}
              {selectedDataCollectionSheet.additional_notes && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{selectedDataCollectionSheet.additional_notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* IV Sedation Flow Chart Form Dialog */}
      <Dialog open={showIVSedationForm} onOpenChange={handleIVSedationFormClose}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Activity className="h-5 w-5 text-blue-600" />
              IV Sedation Flow Chart - Step {ivSedationCurrentStep} of {ivSedationTotalSteps}
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar - Full Width with Separated Segments */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="w-full">
              {/* Progress Bar Container with Labels - Separated Segments */}
              <div className="flex items-center gap-2 w-full">
                {/* Step 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Basic Info
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Pre-Assessment
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 3 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Sedation Plan
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 4 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 4 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Time Tracking
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 5 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 5 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Flow
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 5 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 6 */}
                <div className="flex-1 flex flex-col items-center">
                  <span className={`text-xs font-medium transition-colors duration-300 mb-2 ${
                    ivSedationCurrentStep >= 6 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Discharge
                  </span>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 6 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Form Content - Compact Design */}
          <div className="flex-1 flex flex-col min-h-0">
            <form className="flex-1 flex flex-col min-h-0">
              {/* Step Content Container - Hidden Scrollbar */}
              <div className="flex-1 px-6 py-2 overflow-y-auto scrollbar-hidden">
                {ivSedationCurrentStep === 1 && (
                  <div className="space-y-4">
                    {/* Patient Information - Compact */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-blue-600" />
                        Patient Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="ivPatientName" className="text-xs text-gray-600">Patient Name</Label>
                          <Input
                            id="ivPatientName"
                            value={ivSedationFormData.patientName}
                            disabled
                            className="bg-white text-gray-600 text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ivDate" className="text-xs text-gray-600">Date</Label>
                          <Input
                            id="ivDate"
                            type="date"
                            value={ivSedationFormData.date}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, date: e.target.value})}
                            className="text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Treatment Sections Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upper Treatment Section */}
                      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <h3 className="text-base font-semibold text-blue-900">Upper Arch Treatment</h3>
                        </div>

                        <Select
                          value={ivSedationFormData.upperTreatment}
                          onValueChange={(value) => setIVSedationFormData({...ivSedationFormData, upperTreatment: value})}
                        >
                          <SelectTrigger className="border-blue-300 focus:border-blue-500">
                            <SelectValue placeholder="Select upper treatment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatmentOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lower Treatment Section */}
                      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <h3 className="text-base font-semibold text-blue-900">Lower Arch Treatment</h3>
                        </div>

                        <Select
                          value={ivSedationFormData.lowerTreatment}
                          onValueChange={(value) => setIVSedationFormData({...ivSedationFormData, lowerTreatment: value})}
                        >
                          <SelectTrigger className="border-blue-300 focus:border-blue-500">
                            <SelectValue placeholder="Select lower treatment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatmentOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Physical Measurements Section */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-blue-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Physical Measurements
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Height Selection */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-blue-900">Height</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Feet Selector */}
                            <div className="flex-1">
                              <Select
                                value={ivSedationFormData.heightFeet}
                                onValueChange={(value) => setIVSedationFormData({...ivSedationFormData, heightFeet: value})}
                              >
                                <SelectTrigger className="border-blue-300 focus:border-blue-500">
                                  <SelectValue placeholder="Feet" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 5}, (_, i) => i + 4).map((feet) => (
                                    <SelectItem key={feet} value={feet.toString()}>
                                      {feet} ft
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <span className="text-blue-700 font-medium">and</span>

                            {/* Inches Selector */}
                            <div className="flex-1">
                              <Select
                                value={ivSedationFormData.heightInches}
                                onValueChange={(value) => setIVSedationFormData({...ivSedationFormData, heightInches: value})}
                              >
                                <SelectTrigger className="border-blue-300 focus:border-blue-500">
                                  <SelectValue placeholder="Inches" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 12}, (_, i) => i).map((inches) => (
                                    <SelectItem key={inches} value={inches.toString()}>
                                      {inches} in
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Height Display */}
                          {ivSedationFormData.heightFeet && ivSedationFormData.heightInches && (
                            <div className="mt-2 text-center">
                              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                {ivSedationFormData.heightFeet}'{ivSedationFormData.heightInches}"
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Weight Selection */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-blue-900">Weight</h4>
                          </div>

                          <div className="space-y-3">
                            {/* Weight Input with Slider */}
                            <div className="relative">
                              <Input
                                type="number"
                                value={ivSedationFormData.weight}
                                onChange={(e) => setIVSedationFormData({...ivSedationFormData, weight: e.target.value})}
                                placeholder="Enter weight"
                                min="50"
                                max="500"
                                className="border-blue-300 focus:border-blue-500 text-center text-lg font-medium"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium">
                                lbs
                              </span>
                            </div>

                            {/* Weight Range Slider */}
                            <input
                              type="range"
                              min="50"
                              max="500"
                              step="5"
                              value={ivSedationFormData.weight || "150"}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, weight: e.target.value})}
                              className="w-full h-2 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              style={{
                                background: `linear-gradient(to right, #dbeafe 0%, #60a5fa 50%, #2563eb 100%)`
                              }}
                            />

                            {/* Weight Range Labels */}
                            <div className="flex justify-between text-xs text-blue-600">
                              <span>50 lbs</span>
                              <span>275 lbs</span>
                              <span>500 lbs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BMI Calculation and Obesity Assessment */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        BMI Assessment
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* BMI Display */}
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-indigo-900">BMI Calculation</h4>
                          </div>

                          <div className="text-center">
                            {(() => {
                              const heightFeet = parseFloat(ivSedationFormData.heightFeet) || 0;
                              const heightInches = parseFloat(ivSedationFormData.heightInches) || 0;
                              const weight = parseFloat(ivSedationFormData.weight) || 0;

                              if (heightFeet > 0 && weight > 0) {
                                // Convert height to inches, then to meters
                                const totalInches = (heightFeet * 12) + heightInches;
                                const heightMeters = totalInches * 0.0254;
                                const weightKg = weight * 0.453592;
                                const bmi = weightKg / (heightMeters * heightMeters);

                                return (
                                  <>
                                    <div className="text-2xl font-bold text-indigo-700 mb-2">
                                      {bmi.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-indigo-600">
                                      BMI (kg/m²)
                                    </div>
                                    <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                                      bmi < 18.5 ? 'bg-blue-100 text-blue-700' :
                                      bmi < 25 ? 'bg-green-100 text-green-700' :
                                      bmi < 30 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {bmi < 18.5 ? 'Underweight' :
                                       bmi < 25 ? 'Normal' :
                                       bmi < 30 ? 'Overweight' :
                                       'Obese'}
                                    </div>
                                  </>
                                );
                              } else {
                                return (
                                  <div className="text-gray-400">
                                    <div className="text-2xl font-bold mb-2">--</div>
                                    <div className="text-xs">Enter height and weight</div>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>

                        {/* Obesity Assessment */}
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-red-900">Obesity Assessment</h4>
                          </div>

                          <div className="space-y-3">
                            <div className="text-sm text-red-800 font-medium">
                              Is the patient obese (BMI over 30)?
                            </div>

                            <div className="flex justify-center">
                              {(() => {
                                const heightFeet = parseFloat(ivSedationFormData.heightFeet) || 0;
                                const heightInches = parseFloat(ivSedationFormData.heightInches) || 0;
                                const weight = parseFloat(ivSedationFormData.weight) || 0;

                                if (heightFeet > 0 && weight > 0) {
                                  const totalInches = (heightFeet * 12) + heightInches;
                                  const heightMeters = totalInches * 0.0254;
                                  const weightKg = weight * 0.453592;
                                  const bmi = weightKg / (heightMeters * heightMeters);
                                  const isObese = bmi >= 30;

                                  return (
                                    <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                                      isObese
                                        ? 'bg-red-600 text-white'
                                        : 'bg-green-600 text-white'
                                    }`}>
                                      {isObese ? 'YES' : 'NO'}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 font-bold text-lg">
                                      --
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Pre-Assessment */}
                {ivSedationCurrentStep === 2 && (
                  <div className="space-y-4">
                    {/* NPO Status */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">NPO Status</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-800 mb-2">Is the patient NPO? (No Food or Liquid Ingestion Since Last Night)</p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.npoStatus === 'yes'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, npoStatus: 'yes'})}
                            >
                              YES
                            </button>
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.npoStatus === 'no'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, npoStatus: 'no'})}
                            >
                              NO
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-blue-800 mb-2">Have you taken any current medications this morning?</p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.morningMedications === 'yes'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, morningMedications: 'yes'})}
                            >
                              YES
                            </button>
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.morningMedications === 'no'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, morningMedications: 'no'})}
                            >
                              NO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">Allergies</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          'N/A', 'Penicillin', 'Sulfa', 'Codeine', 'Aspirin', 'Ibuprofen',
                          'Latex', 'Iodine', 'Shellfish', 'Nuts', 'Eggs', 'Dairy',
                          'Environmental', 'Seasonal', 'Other'
                        ].map((allergy) => (
                          <button
                            key={allergy}
                            type="button"
                            className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                              ivSedationFormData.allergies?.includes(allergy)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => {
                              const currentAllergies = ivSedationFormData.allergies || [];
                              const updatedAllergies = currentAllergies.includes(allergy)
                                ? currentAllergies.filter(a => a !== allergy)
                                : [...currentAllergies, allergy];
                              setIVSedationFormData({...ivSedationFormData, allergies: updatedAllergies});
                            }}
                          >
                            {allergy}
                          </button>
                        ))}
                      </div>

                      {/* Other Allergies Text Field */}
                      {ivSedationFormData.allergies?.includes('Other') && (
                        <div className="mt-3">
                          <Label htmlFor="allergiesOther" className="text-xs text-blue-800">Please specify other allergies</Label>
                          <Input
                            id="allergiesOther"
                            type="text"
                            value={ivSedationFormData.allergiesOther || ''}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, allergiesOther: e.target.value})}
                            placeholder="Enter other allergies"
                            className="text-sm h-8 border-blue-300 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Female-specific Questions */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">Female Patients Only</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-800 mb-2">Any chance patient might be pregnant today?</p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.pregnancyRisk === 'yes'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, pregnancyRisk: 'yes'})}
                            >
                              YES
                            </button>
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.pregnancyRisk === 'no'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, pregnancyRisk: 'no'})}
                            >
                              NO
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="lastMenstrualCycle" className="text-sm text-blue-800">Last Menstrual Cycle Date</Label>
                          <Input
                            id="lastMenstrualCycle"
                            type="date"
                            value={ivSedationFormData.lastMenstrualCycle || ''}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, lastMenstrualCycle: e.target.value})}
                            className="text-sm h-8 border-blue-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical History Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Anesthesia History */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Anesthesia History</h3>
                        <div className="space-y-2">
                          {[
                            'No Previous Anesthetic History',
                            'Previous Anesthetic without any problems or complications',
                            'Family Hx of Anesthetic Complications',
                            'Malignant Hyperthermia',
                            'Others'
                          ].map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.anesthesiaHistory === option
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, anesthesiaHistory: option})}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        {/* Others Anesthesia History Text Field */}
                        {ivSedationFormData.anesthesiaHistory === 'Others' && (
                          <div className="mt-3">
                            <Label htmlFor="anesthesiaHistoryOther" className="text-xs text-blue-800">Please specify</Label>
                            <Input
                              id="anesthesiaHistoryOther"
                              type="text"
                              value={ivSedationFormData.anesthesiaHistoryOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, anesthesiaHistoryOther: e.target.value})}
                              placeholder="Enter anesthesia history details"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Respiratory Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Respiratory Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Asthma', 'Anemia', 'Reactive Airway', 'Bronchitis', 'COPD',
                            'Dyspnea', 'Orthopnea', 'Recent URI', 'SOB', 'Tuberculosis', 'Others'
                          ].map((problem) => (
                            <button
                              key={problem}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.respiratoryProblems?.includes(problem)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.respiratoryProblems || [];
                                const updated = current.includes(problem)
                                  ? current.filter(p => p !== problem)
                                  : [...current, problem];
                                setIVSedationFormData({...ivSedationFormData, respiratoryProblems: updated});
                              }}
                            >
                              {problem}
                            </button>
                          ))}
                        </div>

                        {/* Others Respiratory Problems Text Field */}
                        {ivSedationFormData.respiratoryProblems?.includes('Others') && (
                          <div className="mt-3">
                            <Label htmlFor="respiratoryProblemsOther" className="text-xs text-blue-800">Please specify other respiratory problems</Label>
                            <Input
                              id="respiratoryProblemsOther"
                              type="text"
                              value={ivSedationFormData.respiratoryProblemsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, respiratoryProblemsOther: e.target.value})}
                              placeholder="Enter other respiratory problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Cardiovascular Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Cardiovascular Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Anemia', 'Congestive Heart Failure (CHF)', 'Dysrhythmia', 'Murmur', 'Hypertension (HTN)',
                            'Myocardial Infarction (MI)', 'Valvular DX', 'Rheumatic Fever', 'Sickle Cell Disease', 'Congenital Heart DX', 'Pacemaker', 'Other'
                          ].map((problem) => (
                            <button
                              key={problem}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.cardiovascularProblems?.includes(problem)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.cardiovascularProblems || [];
                                const updated = current.includes(problem)
                                  ? current.filter(p => p !== problem)
                                  : [...current, problem];
                                setIVSedationFormData({...ivSedationFormData, cardiovascularProblems: updated});
                              }}
                            >
                              {problem}
                            </button>
                          ))}
                        </div>

                        {/* Other Cardiovascular Problems Text Field */}
                        {ivSedationFormData.cardiovascularProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="cardiovascularProblemsOther" className="text-xs text-blue-800">Please specify other cardiovascular problems</Label>
                            <Input
                              id="cardiovascularProblemsOther"
                              type="text"
                              value={ivSedationFormData.cardiovascularProblemsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, cardiovascularProblemsOther: e.target.value})}
                              placeholder="Enter other cardiovascular problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Gastrointestinal Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Gastrointestinal Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Cirrhosis', 'Hepatitis', 'Reflux', 'Ulcers', 'Oesophageal Issues', 'Other'
                          ].map((problem) => (
                            <button
                              key={problem}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.gastrointestinalProblems?.includes(problem)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.gastrointestinalProblems || [];
                                const updated = current.includes(problem)
                                  ? current.filter(p => p !== problem)
                                  : [...current, problem];
                                setIVSedationFormData({...ivSedationFormData, gastrointestinalProblems: updated});
                              }}
                            >
                              {problem}
                            </button>
                          ))}
                        </div>

                        {/* Other Gastrointestinal Problems Text Field */}
                        {ivSedationFormData.gastrointestinalProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="gastrointestinalProblemsOther" className="text-xs text-blue-800">Please specify other gastrointestinal problems</Label>
                            <Input
                              id="gastrointestinalProblemsOther"
                              type="text"
                              value={ivSedationFormData.gastrointestinalProblemsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, gastrointestinalProblemsOther: e.target.value})}
                              placeholder="Enter other gastrointestinal problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Medical History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Neurologic Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Neurologic Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Cerebral Vascular Accident (CVA)', 'Headaches', 'Transient Ischemic Attack (TIA)', 'Syncope', 'Seizures', 'Other'
                          ].map((problem) => (
                            <button
                              key={problem}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.neurologicProblems?.includes(problem)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.neurologicProblems || [];
                                const updated = current.includes(problem)
                                  ? current.filter(p => p !== problem)
                                  : [...current, problem];
                                setIVSedationFormData({...ivSedationFormData, neurologicProblems: updated});
                              }}
                            >
                              {problem}
                            </button>
                          ))}
                        </div>

                        {/* Other Neurologic Problems Text Field */}
                        {ivSedationFormData.neurologicProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="neurologicProblemsOther" className="text-xs text-blue-800">Please specify other neurologic problems</Label>
                            <Input
                              id="neurologicProblemsOther"
                              type="text"
                              value={ivSedationFormData.neurologicProblemsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, neurologicProblemsOther: e.target.value})}
                              placeholder="Enter other neurologic problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Endocrine/Renal Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Endocrine/Renal Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Diabetes', 'Dialysis', 'Thyroid DX', 'Renal Failure', 'Other'
                          ].map((problem) => (
                            <button
                              key={problem}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.endocrineRenalProblems?.includes(problem)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.endocrineRenalProblems || [];
                                const updated = current.includes(problem)
                                  ? current.filter(p => p !== problem)
                                  : [...current, problem];
                                setIVSedationFormData({...ivSedationFormData, endocrineRenalProblems: updated});
                              }}
                            >
                              {problem}
                            </button>
                          ))}
                        </div>

                        {/* Other Endocrine/Renal Problems Text Field */}
                        {ivSedationFormData.endocrineRenalProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="endocrineRenalProblemsOther" className="text-xs text-blue-800">Please specify other endocrine/renal problems</Label>
                            <Input
                              id="endocrineRenalProblemsOther"
                              type="text"
                              value={ivSedationFormData.endocrineRenalProblemsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, endocrineRenalProblemsOther: e.target.value})}
                              placeholder="Enter other endocrine/renal problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}

                        {/* A1C Level Input */}
                        <div className="mt-3">
                          <Label htmlFor="lastA1CLevel" className="text-xs text-blue-800">Last A1C Level</Label>
                          <Input
                            id="lastA1CLevel"
                            type="text"
                            value={ivSedationFormData.lastA1CLevel || ''}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, lastA1CLevel: e.target.value})}
                            placeholder="Enter A1C level"
                            className="text-sm h-8 border-blue-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Miscellaneous - Full Width */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">Miscellaneous</h3>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                        {[
                          'N/A', 'Artificial Valve', 'Heart Birth Defect', 'Bypass', 'Seizures', 'Stroke',
                          'Parkinson\'s Disease', 'Dementia (Alzheimer\'s)', 'Anxiety', 'Schizophrenia', 'Eating Disorder',
                          'HIV', 'AIDS', 'Rheumatoid Arthritis', 'Lupus', 'Fibromyalgia', 'Immunosuppressive Disease',
                          'Prolonged Bleeding', 'Platelet Disorder', 'Sickle Cell', 'Hemophilia', 'Chronic Kidney Disease',
                          'Osteoporosis', 'Artificial Joint', 'Muscle Weakness', 'Cancer', 'Chemotherapy', 'Other'
                        ].map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              ivSedationFormData.miscellaneous?.includes(condition)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => {
                              const current = ivSedationFormData.miscellaneous || [];
                              const updated = current.includes(condition)
                                ? current.filter(c => c !== condition)
                                : [...current, condition];
                              setIVSedationFormData({...ivSedationFormData, miscellaneous: updated});
                            }}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>

                      {/* Other Miscellaneous Text Field */}
                      {ivSedationFormData.miscellaneous?.includes('Other') && (
                        <div className="mt-3">
                          <Label htmlFor="miscellaneousOther" className="text-xs text-blue-800">Please specify other conditions</Label>
                          <Input
                            id="miscellaneousOther"
                            type="text"
                            value={ivSedationFormData.miscellaneousOther || ''}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, miscellaneousOther: e.target.value})}
                            placeholder="Enter other conditions"
                            className="text-sm h-8 border-blue-300 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Social History and Patient Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Social History */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Social History</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'N/A', 'Tobacco', 'ETOH Consumption', 'Recreational Drugs', 'Other'
                          ].map((habit) => (
                            <button
                              key={habit}
                              type="button"
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                ivSedationFormData.socialHistory?.includes(habit)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.socialHistory || [];
                                const updated = current.includes(habit)
                                  ? current.filter(h => h !== habit)
                                  : [...current, habit];
                                setIVSedationFormData({...ivSedationFormData, socialHistory: updated});
                              }}
                            >
                              {habit}
                            </button>
                          ))}
                        </div>

                        {/* Other Social History Text Field */}
                        {ivSedationFormData.socialHistory?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="socialHistoryOther" className="text-xs text-blue-800">Please specify other social history</Label>
                            <Input
                              id="socialHistoryOther"
                              type="text"
                              value={ivSedationFormData.socialHistoryOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, socialHistoryOther: e.target.value})}
                              placeholder="Enter other social history"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Patient Assessment */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Patient Assessment</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-blue-800 mb-2">Patient is Well Developed and Well Nourished</p>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  ivSedationFormData.wellDevelopedNourished === 'yes'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                onClick={() => setIVSedationFormData({...ivSedationFormData, wellDevelopedNourished: 'yes'})}
                              >
                                YES
                              </button>
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  ivSedationFormData.wellDevelopedNourished === 'no'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                onClick={() => setIVSedationFormData({...ivSedationFormData, wellDevelopedNourished: 'no'})}
                              >
                                NO
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-blue-800 mb-2">Patient is Anxious?</p>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  ivSedationFormData.patientAnxious === 'yes'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                onClick={() => setIVSedationFormData({...ivSedationFormData, patientAnxious: 'yes'})}
                              >
                                YES
                              </button>
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  ivSedationFormData.patientAnxious === 'no'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                onClick={() => setIVSedationFormData({...ivSedationFormData, patientAnxious: 'no'})}
                              >
                                NO
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ASA Classification and Airway Evaluation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ASA Classification */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">ASA Classification</h3>
                        <div>
                          <p className="text-sm text-blue-800 mb-2">American Society of Anesthesiology Classification (ASA) Status</p>
                          <div className="grid grid-cols-5 gap-2">
                            {['1', '2', '3', '4', '5'].map((classification) => (
                              <button
                                key={classification}
                                type="button"
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  ivSedationFormData.asaClassification === classification
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => setIVSedationFormData({...ivSedationFormData, asaClassification: classification})}
                              >
                                {classification}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Airway Evaluation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Airway Evaluation</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            'Good range of motion of neck and jaw',
                            'Missing, Loose or Chipped Teeth',
                            'Edentulous',
                            'Other'
                          ].map((evaluation) => (
                            <button
                              key={evaluation}
                              type="button"
                              className={`px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                                ivSedationFormData.airwayEvaluation?.includes(evaluation)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.airwayEvaluation || [];
                                const updated = current.includes(evaluation)
                                  ? current.filter(e => e !== evaluation)
                                  : [...current, evaluation];
                                setIVSedationFormData({...ivSedationFormData, airwayEvaluation: updated});
                              }}
                            >
                              {evaluation}
                            </button>
                          ))}
                        </div>

                        {/* Other Airway Evaluation Text Field */}
                        {ivSedationFormData.airwayEvaluation?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="airwayEvaluationOther" className="text-xs text-blue-800">Please specify other airway findings</Label>
                            <Input
                              id="airwayEvaluationOther"
                              type="text"
                              value={ivSedationFormData.airwayEvaluationOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, airwayEvaluationOther: e.target.value})}
                              placeholder="Enter other airway findings"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mallampati Score and Heart/Lung Evaluation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mallampati Score */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Mallampati Score</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['Class I', 'Class II', 'Class III', 'Class IV'].map((score) => (
                            <button
                              key={score}
                              type="button"
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                ivSedationFormData.mallampatiScore === score
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, mallampatiScore: score})}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Heart and Lung Evaluation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Heart and Lung Evaluation</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            'Heart Regular Rate and Rhythm',
                            'Lung is Clear to Auscultation (CTA)',
                            'Murmur',
                            'Other'
                          ].map((evaluation) => (
                            <button
                              key={evaluation}
                              type="button"
                              className={`px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                                ivSedationFormData.heartLungEvaluation?.includes(evaluation)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.heartLungEvaluation || [];
                                const updated = current.includes(evaluation)
                                  ? current.filter(e => e !== evaluation)
                                  : [...current, evaluation];
                                setIVSedationFormData({...ivSedationFormData, heartLungEvaluation: updated});
                              }}
                            >
                              {evaluation}
                            </button>
                          ))}
                        </div>

                        {/* Other Heart/Lung Evaluation Text Field */}
                        {ivSedationFormData.heartLungEvaluation?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="heartLungEvaluationOther" className="text-xs text-blue-800">Please specify other heart/lung findings</Label>
                            <Input
                              id="heartLungEvaluationOther"
                              type="text"
                              value={ivSedationFormData.heartLungEvaluationOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, heartLungEvaluationOther: e.target.value})}
                              placeholder="Enter other heart/lung findings"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>


                  </div>
                )}

                {/* Step 3: Sedation Plan */}
                {ivSedationCurrentStep === 3 && (
                  <div className="space-y-4">
                    {/* Instruments Checklist - Full Width */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Instruments Checklist
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                          { name: 'ECG', key: 'ecg' },
                          { name: 'BP', key: 'bp' },
                          { name: 'Pulse OX', key: 'pulseOx' },
                          { name: 'ETCO2', key: 'etco2' },
                          { name: 'Supplemental O2', key: 'supplementalO2' },
                          { name: 'PPV Available', key: 'ppvAvailable' },
                          { name: 'Suction Available', key: 'suctionAvailable' }
                        ].map((instrument) => (
                          <div key={instrument.key} className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-900">{instrument.name}</span>
                              <button
                                type="button"
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  ivSedationFormData.instrumentsChecklist?.[instrument.key]
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.instrumentsChecklist || {};
                                  setIVSedationFormData({
                                    ...ivSedationFormData,
                                    instrumentsChecklist: {
                                      ...current,
                                      [instrument.key]: !current[instrument.key]
                                    }
                                  });
                                }}
                              >
                                {ivSedationFormData.instrumentsChecklist?.[instrument.key] && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <div className={`text-xs mt-2 transition-colors ${
                              ivSedationFormData.instrumentsChecklist?.[instrument.key]
                                ? 'text-green-600 font-medium'
                                : 'text-gray-500'
                            }`}>
                              {ivSedationFormData.instrumentsChecklist?.[instrument.key] ? 'Checked' : 'Not Checked'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sedation Plan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sedation Type */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Sedation Type</h3>
                        <div className="space-y-2">
                          {[
                            'Minimal Sedation',
                            'Moderate Sedation',
                            'Deep Sedation',
                            'General Anesthesia'
                          ].map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                                ivSedationFormData.sedationType === type
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => setIVSedationFormData({...ivSedationFormData, sedationType: type})}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Medications Planned */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Medications Planned</h3>
                        <div className="space-y-2">
                          {[
                            'Midazolam',
                            'Propofol',
                            'Fentanyl',
                            'Ketamine',
                            'Nitrous Oxide',
                            'Other'
                          ].map((medication) => (
                            <button
                              key={medication}
                              type="button"
                              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                                ivSedationFormData.medicationsPlanned?.includes(medication)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.medicationsPlanned || [];
                                const updated = current.includes(medication)
                                  ? current.filter(m => m !== medication)
                                  : [...current, medication];
                                setIVSedationFormData({...ivSedationFormData, medicationsPlanned: updated});
                              }}
                            >
                              {medication}
                            </button>
                          ))}
                        </div>

                        {/* Other Medication Text Field */}
                        {ivSedationFormData.medicationsPlanned?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="medicationsOther" className="text-xs text-blue-800">Please specify other medications</Label>
                            <Input
                              id="medicationsOther"
                              type="text"
                              value={ivSedationFormData.medicationsOther || ''}
                              onChange={(e) => setIVSedationFormData({...ivSedationFormData, medicationsOther: e.target.value})}
                              placeholder="Enter other medications"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Planning Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Route of Administration */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Route of Administration</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'IV',
                            'Oral',
                            'Intranasal',
                            'Inhalation'
                          ].map((route) => (
                            <button
                              key={route}
                              type="button"
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                ivSedationFormData.administrationRoute?.includes(route)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.administrationRoute || [];
                                const updated = current.includes(route)
                                  ? current.filter(r => r !== route)
                                  : [...current, route];
                                setIVSedationFormData({...ivSedationFormData, administrationRoute: updated});
                              }}
                            >
                              {route}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Emergency Protocols */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Emergency Protocols</h3>
                        <div className="space-y-2">
                          {[
                            'Reversal Agents Available',
                            'Emergency Cart Ready',
                            'Crash Cart Accessible',
                            'Emergency Contact List'
                          ].map((protocol) => (
                            <div key={protocol} className="flex items-center justify-between bg-white rounded p-2 border border-blue-200">
                              <span className="text-sm text-blue-900">{protocol}</span>
                              <button
                                type="button"
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  ivSedationFormData.emergencyProtocols?.[protocol.toLowerCase().replace(/\s+/g, '')]
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                                onClick={() => {
                                  const key = protocol.toLowerCase().replace(/\s+/g, '');
                                  const current = ivSedationFormData.emergencyProtocols || {};
                                  setIVSedationFormData({
                                    ...ivSedationFormData,
                                    emergencyProtocols: {
                                      ...current,
                                      [key]: !current[key]
                                    }
                                  });
                                }}
                              >
                                {ivSedationFormData.emergencyProtocols?.[protocol.toLowerCase().replace(/\s+/g, '')] && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: IV Sedation Flow Chart */}
                {ivSedationCurrentStep === 4 && (
                  <div className="space-y-4">
                    {/* Time Tracking Section */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time Tracking
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Time in Room */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-blue-900">Time in Room</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const estTime = new Intl.DateTimeFormat('en-US', {
                                  timeZone: 'America/New_York',
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).format(now);
                                setIVSedationFormData({...ivSedationFormData, timeInRoom: estTime});
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Current Time
                            </button>
                          </div>
                          <p className="text-xs text-blue-700 mb-2">When patient enters the operation room</p>
                          <input
                            type="time"
                            value={ivSedationFormData.timeInRoom}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, timeInRoom: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                          {ivSedationFormData.timeInRoom && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Patient entered room at {ivSedationFormData.timeInRoom} EST
                            </div>
                          )}
                        </div>

                        {/* Sedation Start Time */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-blue-900">Sedation Start Time</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const estTime = new Intl.DateTimeFormat('en-US', {
                                  timeZone: 'America/New_York',
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).format(now);
                                setIVSedationFormData({...ivSedationFormData, sedationStartTime: estTime});
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                            >
                              Current Time
                            </button>
                          </div>
                          <p className="text-xs text-blue-700 mb-2">When sedation administration begins</p>
                          <input
                            type="time"
                            value={ivSedationFormData.sedationStartTime}
                            onChange={(e) => setIVSedationFormData({...ivSedationFormData, sedationStartTime: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                          {ivSedationFormData.sedationStartTime && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Sedation started at {ivSedationFormData.sedationStartTime} EST
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Time Summary Cards */}
                      {ivSedationFormData.timeInRoom && ivSedationFormData.sedationStartTime && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-green-900 mb-3">Time Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Room Entry Card */}
                            <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">Room Entry</span>
                              </div>
                              <div className="text-lg font-bold text-blue-600">{ivSedationFormData.timeInRoom}</div>
                              <div className="text-xs text-gray-500">EST</div>
                            </div>

                            {/* Sedation Start Card */}
                            <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">Sedation Start</span>
                              </div>
                              <div className="text-lg font-bold text-green-600">{ivSedationFormData.sedationStartTime}</div>
                              <div className="text-xs text-gray-500">EST</div>
                            </div>

                            {/* Preparation Time Card */}
                            <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">Preparation Time</span>
                              </div>
                              <div className="text-lg font-bold text-orange-600">
                                {(() => {
                                  const roomTime = ivSedationFormData.timeInRoom.split(':');
                                  const sedationTime = ivSedationFormData.sedationStartTime.split(':');
                                  const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                                  const sedationMinutes = parseInt(sedationTime[0]) * 60 + parseInt(sedationTime[1]);
                                  const diffMinutes = sedationMinutes - roomMinutes;

                                  if (diffMinutes >= 0) {
                                    return `${diffMinutes}`;
                                  }
                                  return '--';
                                })()}
                              </div>
                              <div className="text-xs text-gray-500">minutes</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>


                  </div>
                )}

                {/* Step 5: Flow - Monitoring During Surgery */}
                {ivSedationCurrentStep === 5 && (
                  <div className="space-y-4">
                    {/* Add Entry Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Monitoring Log
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {ivSedationFormData.flowEntries?.length || 0}
                        </div>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowFlowEntryDialog(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Entry
                      </button>
                    </div>

                    {/* Monitoring Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">


                      {ivSedationFormData.flowEntries && ivSedationFormData.flowEntries.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900 border-b border-blue-200">Time</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-blue-900 border-b border-blue-200">BP</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-blue-900 border-b border-blue-200">HR</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-blue-900 border-b border-blue-200">RR</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-blue-900 border-b border-blue-200">SpO2</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900 border-b border-blue-200">Medications</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-blue-900 border-b border-blue-200">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ivSedationFormData.flowEntries.map((entry, index) => (
                                <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-2 text-sm font-mono text-gray-900 border-b border-gray-200">
                                    {entry.time} EST
                                  </td>
                                  <td className="px-3 py-2 text-sm text-center text-gray-900 border-b border-gray-200">
                                    {entry.bp || '-'}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-center text-gray-900 border-b border-gray-200">
                                    {entry.heartRate ? `${entry.heartRate} bpm` : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-center text-gray-900 border-b border-gray-200">
                                    {entry.rr ? `${entry.rr}/min` : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-center text-gray-900 border-b border-gray-200">
                                    {entry.spo2 ? `${entry.spo2}%` : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900 border-b border-gray-200">
                                    {entry.medications && entry.medications.length > 0 ? (
                                      <div className="space-y-1">
                                        {entry.medications.map((medId, index) => {
                                          const medication = medicationOptions.find(med => med.id === medId);
                                          return medication ? (
                                            <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                              {medication.name}
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    ) : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-center border-b border-gray-200">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Parse the existing entry data
                                          const [hour, minute] = entry.time.split(':');
                                          const [systolic, diastolic] = entry.bp ? entry.bp.split('/') : ['', ''];

                                          setNewFlowEntry({
                                            hour: hour || '',
                                            minute: minute || '',
                                            systolic: systolic || '',
                                            diastolic: diastolic || '',
                                            heartRate: entry.heartRate || '',
                                            rr: entry.rr || '',
                                            spo2: entry.spo2 || '',
                                            medications: entry.medications || []
                                          });
                                          setEditingEntryId(entry.id);
                                          setShowFlowEntryDialog(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                        title="Edit entry"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedEntries = ivSedationFormData.flowEntries?.filter(e => e.id !== entry.id) || [];
                                          setIVSedationFormData({
                                            ...ivSedationFormData,
                                            flowEntries: updatedEntries
                                          });
                                        }}
                                        className="text-red-600 hover:text-red-800 text-xs"
                                        title="Delete entry"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-sm">No monitoring entries yet</p>
                          <p className="text-xs text-gray-400 mt-1">Add your first entry using the form above</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Placeholder for other steps */}
                {ivSedationCurrentStep > 5 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Step {ivSedationCurrentStep} content will be implemented here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleIVSedationPreviousStep}
                  disabled={ivSedationCurrentStep === 1}
                  className="flex items-center gap-2"
                >
                  Previous
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleIVSedationFormClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleIVSedationNextStep}
                    disabled={ivSedationCurrentStep === ivSedationTotalSteps}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {ivSedationCurrentStep === ivSedationTotalSteps ? 'Complete' : 'Next'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <div className="p-2 bg-red-100 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this data collection sheet? This action cannot be undone.
            </p>
            {sheetToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>Patient:</strong> {sheetToDelete.patient_name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(sheetToDelete.collection_date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flow Entry Dialog */}
      <Dialog open={showFlowEntryDialog} onOpenChange={setShowFlowEntryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              {editingEntryId ? 'Edit Monitoring Entry' : 'Add Monitoring Entry'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Time</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newFlowEntry.hour}
                    onChange={(e) => setNewFlowEntry({...newFlowEntry, hour: e.target.value})}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">HH</option>
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-blue-600 font-medium">:</span>
                  <select
                    value={newFlowEntry.minute}
                    onChange={(e) => setNewFlowEntry({...newFlowEntry, minute: e.target.value})}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">MM</option>
                    {Array.from({length: 60}, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const estTime = new Intl.DateTimeFormat('en-US', {
                        timeZone: 'America/New_York',
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(now);
                      const [hours, minutes] = estTime.split(':');
                      setNewFlowEntry({...newFlowEntry, hour: hours, minute: minutes});
                    }}
                    className="px-2 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Current Time
                  </button>
                </div>
              </div>

              {/* BP */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Blood Pressure</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newFlowEntry.systolic}
                    onChange={(e) => setNewFlowEntry({...newFlowEntry, systolic: e.target.value})}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm text-center"
                    min="80"
                    max="180"
                  />
                  <span className="text-blue-600 font-medium">/</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newFlowEntry.diastolic}
                    onChange={(e) => setNewFlowEntry({...newFlowEntry, diastolic: e.target.value})}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm text-center"
                    min="40"
                    max="120"
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newFlowEntry.heartRate}
                  onChange={(e) => setNewFlowEntry({...newFlowEntry, heartRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* RR */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Respiratory Rate (/min)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newFlowEntry.rr}
                  onChange={(e) => setNewFlowEntry({...newFlowEntry, rr: e.target.value})}
                  placeholder="16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* SpO2 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">SpO2 (%)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newFlowEntry.spo2}
                  onChange={(e) => setNewFlowEntry({...newFlowEntry, spo2: e.target.value})}
                  placeholder="98"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>

              </div>

              {/* Medications Section - Full Width with Scroll */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">Medications</label>

                {/* Selected Medications Display */}
                {newFlowEntry.medications.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Selected:</div>
                    <div className="flex flex-wrap gap-1">
                      {newFlowEntry.medications.map((medId) => {
                        const medication = medicationOptions.find(med => med.id === medId);
                        return medication ? (
                          <div key={medId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            {medication.name}
                            <button
                              type="button"
                              onClick={() => {
                                setNewFlowEntry({
                                  ...newFlowEntry,
                                  medications: newFlowEntry.medications.filter(id => id !== medId)
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Medication Categories with Scroll */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {['Versed', 'Fentanyl', 'Ketorolac', 'Benadryl', 'Dexamethasone', 'Acetaminophen', 'Valium', 'Clindamycin', 'Lidocaine'].map(category => (
                      <div key={category} className="border border-gray-100 rounded p-2">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">{category}</h4>
                        <div className="space-y-1">
                          {medicationOptions
                            .filter(med => med.category === category)
                            .map(medication => (
                              <button
                                key={medication.id}
                                type="button"
                                onClick={() => {
                                  if (!newFlowEntry.medications.includes(medication.id)) {
                                    setNewFlowEntry({
                                      ...newFlowEntry,
                                      medications: [...newFlowEntry.medications, medication.id]
                                    });
                                  }
                                }}
                                disabled={newFlowEntry.medications.includes(medication.id)}
                                className={`w-full text-left px-1.5 py-0.5 text-xs rounded transition-colors ${
                                  newFlowEntry.medications.includes(medication.id)
                                    ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                              >
                                {medication.name.split(' | ')[0]} {/* Show only dosage */}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowFlowEntryDialog(false);
                setEditingEntryId(null);
                setNewFlowEntry({
                  hour: '',
                  minute: '',
                  systolic: '',
                  diastolic: '',
                  heartRate: '',
                  rr: '',
                  spo2: '',
                  medications: []
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newFlowEntry.hour && newFlowEntry.minute) {
                  const timeValue = `${newFlowEntry.hour}:${newFlowEntry.minute}`;
                  const bpValue = newFlowEntry.systolic && newFlowEntry.diastolic
                    ? `${newFlowEntry.systolic}/${newFlowEntry.diastolic}`
                    : '';

                  if (editingEntryId) {
                    // Update existing entry
                    const updatedEntries = ivSedationFormData.flowEntries?.map(entry =>
                      entry.id === editingEntryId
                        ? {
                            ...entry,
                            time: timeValue,
                            bp: bpValue,
                            heartRate: newFlowEntry.heartRate,
                            rr: newFlowEntry.rr,
                            spo2: newFlowEntry.spo2,
                            medications: newFlowEntry.medications
                          }
                        : entry
                    ) || [];

                    setIVSedationFormData({
                      ...ivSedationFormData,
                      flowEntries: updatedEntries
                    });
                  } else {
                    // Add new entry
                    const newEntry = {
                      id: Date.now().toString(),
                      time: timeValue,
                      bp: bpValue,
                      heartRate: newFlowEntry.heartRate,
                      rr: newFlowEntry.rr,
                      spo2: newFlowEntry.spo2,
                      medications: newFlowEntry.medications
                    };

                    setIVSedationFormData({
                      ...ivSedationFormData,
                      flowEntries: [...(ivSedationFormData.flowEntries || []), newEntry]
                    });
                  }

                  setShowFlowEntryDialog(false);
                  setEditingEntryId(null);
                  setNewFlowEntry({
                    hour: '',
                    minute: '',
                    systolic: '',
                    diastolic: '',
                    heartRate: '',
                    rr: '',
                    spo2: '',
                    medications: []
                  });
                }
              }}
              disabled={!newFlowEntry.hour || !newFlowEntry.minute}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingEntryId ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast && formMessage.type && (
        <div className="fixed bottom-4 right-4 z-[9999] w-80">
          <div className={`px-4 py-4 rounded-md shadow-md border flex items-start gap-3 min-h-[60px] ${
            formMessage.type === 'error'
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-green-500 text-white border-green-600'
            }`}>
            {formMessage.type === 'error' ? (
              <svg className="w-4 h-4 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <div className="flex-1 min-h-[20px] flex items-center">
              <p className="text-sm font-medium leading-relaxed">{formMessage.text}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className={`transition-colors mt-0.5 ${
                formMessage.type === 'error'
                  ? 'text-white hover:text-red-200'
                  : 'text-white hover:text-green-200'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}