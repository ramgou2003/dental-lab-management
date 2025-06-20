
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
import { Textarea } from "@/components/ui/textarea";
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
  Palette,
  Plus
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
  };

  const handleViewDataCollectionSheet = (sheet: any) => {
    setSelectedDataCollectionSheet(sheet);
    setShowDataCollectionPreview(true);
  };

  const handleDataCollectionPreviewClose = () => {
    setShowDataCollectionPreview(false);
    setSelectedDataCollectionSheet(null);
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
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
        alert(`Please select Yes or No for the following mandatory fields:\n\n${missingPictures.join('\n')}`);
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
        data_collected: dataCollectionFormData.dataCollected,
        additional_notes: dataCollectionFormData.additionalNotes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to Supabase database
      const { data, error } = await (supabase as any)
        .from('data_collection_sheets')
        .insert([dataCollectionData])
        .select()
        .single();

      if (error) {
        console.error('Error saving data collection sheet:', error);
        alert('Failed to save data collection sheet. Please try again.');
        return;
      }

      // Update local state
      setDataCollectionSheets(prev => [data, ...prev]);

      // Show success message
      alert('Data collection sheet submitted successfully!');

      // Close form and reset
      handleDataCollectionFormClose();

    } catch (error) {
      console.error('Error submitting data collection sheet:', error);
      alert('Failed to submit data collection sheet. Please try again.');
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
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-4">
                {/* Modern Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-2">
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Stethoscope className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Treatment Information</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleAddTreatment}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white h-8 w-8 p-0 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add Treatment</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-4">
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Treatment Status</p>
                      <Badge variant="outline" className="mt-1 bg-blue-50 border-blue-200 text-blue-700">
                        {patient.status || "No Status Set"}
                      </Badge>
                    </div>

                    {/* Upper and Lower Treatment Information Side by Side */}
                    {((patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT") ||
                      (patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT")) && (
                      <div className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Upper Treatment */}
                          {patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT" && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Upper Treatment</p>
                              <div className="space-y-2">
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                  {patient.upper_treatment}
                                </Badge>
                                {patient.upper_surgery_date && (
                                  <div className="text-sm text-gray-600">
                                    Surgery: {new Date(patient.upper_surgery_date).toLocaleDateString('en-US')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Lower Treatment */}
                          {patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT" && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Lower Treatment</p>
                              <div className="space-y-2">
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                  {patient.lower_treatment}
                                </Badge>
                                {patient.lower_surgery_date && (
                                  <div className="text-sm text-gray-600">
                                    Surgery: {new Date(patient.lower_surgery_date).toLocaleDateString('en-US')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient Since</p>
                      <p className="text-base font-semibold text-gray-900">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Medical History</p>
                      <p className="text-base font-semibold text-gray-900">No medical history recorded</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Allergies</p>
                      <p className="text-base font-semibold text-gray-900">No known allergies</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Emergency Contact</p>
                      <p className="text-base font-semibold text-gray-900">Not provided</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Insurance</p>
                      <p className="text-base font-semibold text-gray-900">Not provided</p>
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
              <div className="h-full flex flex-col pb-2">
                {/* Clinical Forms Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-2 flex-1">
                  {/* Data Collection Sheet */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Data Collection Sheet</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {dataCollectionSheets.length > 0 ? (
                        <div className="space-y-3">
                          {dataCollectionSheets.map((sheet) => (
                            <div key={sheet.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {new Date(sheet.collection_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {sheet.reasons_for_collection?.slice(0, 2).join(', ')}
                                    {sheet.reasons_for_collection?.length > 2 && ` +${sheet.reasons_for_collection.length - 2} more`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(sheet.created_at).toLocaleDateString()} at {new Date(sheet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-emerald-600"
                                  onClick={() => handleViewDataCollectionSheet(sheet)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No data collection sheets yet</p>
                          <p className="text-xs text-gray-400 mt-1">Click the + button to create one</p>
                        </div>
                      )}
                    </div>
                    {/* Plus Button - Bottom Right */}
                    <Button
                      onClick={handleDataCollectionFormOpen}
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* IV Sedation Flow Chart */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">IV Sedation Flow Chart</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center">
                        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">IV sedation protocol and workflow documentation</p>
                      </div>
                    </div>
                    {/* Plus Button - Bottom Right */}
                    <Button
                      onClick={() => setShowIVSedationForm(true)}
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Encounter Form */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                      <div className="p-2 bg-red-100 rounded-xl">
                        <Stethoscope className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Encounter Form</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center">
                        <Stethoscope className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Patient encounter documentation and notes</p>
                      </div>
                    </div>
                    {/* Plus Button - Bottom Right */}
                    <Button
                      onClick={() => setShowEncounterForm(true)}
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Consent Forms */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Consent Forms</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Patient consent and authorization forms</p>
                      </div>
                    </div>
                    {/* Plus Button - Bottom Right */}
                    <Button
                      onClick={() => setShowConsentForm(true)}
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
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
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-indigo-600" />
              Data Collection Sheet - Step {currentStep} of {totalSteps}
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="flex-shrink-0 px-6 py-2">
            <div className="flex items-center justify-center space-x-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                  currentStep >= 1 ? 'bg-black' : 'bg-gray-300'
                }`} />
                <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= 1 ? 'text-black' : 'text-gray-400'
                }`}>
                  Step One
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                  currentStep >= 2 ? 'bg-black' : 'bg-gray-300'
                }`} />
                <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= 2 ? 'text-black' : 'text-gray-400'
                }`}>
                  Step Two
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                  currentStep >= 3 ? 'bg-black' : 'bg-gray-300'
                }`} />
                <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= 3 ? 'text-black' : 'text-gray-400'
                }`}>
                  Step Three
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                  currentStep >= 4 ? 'bg-black' : 'bg-gray-300'
                }`} />
                <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= 4 ? 'text-black' : 'text-gray-400'
                }`}>
                  Step Four
                </span>
              </div>
            </div>
          </div>

          {/* Form Content - Optimized to fit */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <form onSubmit={handleDataCollectionFormSubmit} className="flex-1 flex flex-col">
              {/* Step Content Container */}
              <div className="flex-1 px-6 py-2 overflow-hidden">
                {currentStep === 1 && (
                  <div className="h-full flex flex-col space-y-4">
                    {/* Patient Information Row */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-600" />
                        Patient Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="patientName" className="text-sm">Patient Name</Label>
                          <Input
                            id="patientName"
                            value={dataCollectionFormData.patientName}
                            disabled
                            className="bg-gray-50 h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date" className="text-sm">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={dataCollectionFormData.date}
                            onChange={(e) => handleDataCollectionFormChange('date', e.target.value)}
                            className="cursor-pointer h-9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reason for Data Collection */}
                    <div className="flex-1 space-y-3 min-h-0">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        Reason for Data Collection
                      </h3>

                      {/* Reason Selection Grid - Scrollable if needed */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto max-h-64">
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

                          // All buttons have the same size, including OTHERS
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => !isDisabled && handleToggleReason(reason)}
                              disabled={isDisabled}
                              className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                  : isDisabled
                                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 cursor-pointer'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-xs font-medium">{reason}</span>
                            </button>
                          );
                        })}

                        {/* Custom input field that spans two button widths - only show if OTHERS is selected */}
                        {dataCollectionFormData.reasonsForCollection.includes("OTHERS") && (
                          <div className="md:col-span-2 lg:col-span-2">
                            <Input
                              placeholder="Specify custom reason..."
                              value={dataCollectionFormData.customReason}
                              onChange={(e) => handleDataCollectionFormChange('customReason', e.target.value)}
                              className="w-full p-2 text-xs border-2 border-black rounded-lg bg-white text-black placeholder-gray-500"
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
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Data Collection & Current Appliances
                    </h3>

                    {/* Current Appliances Row - Side by Side */}
                    <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Current Upper Appliance */}
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <Label htmlFor="currentUpperAppliance" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Current Upper Appliance
                          </Label>
                          <div className="flex-1 max-w-xs ml-4">
                            <Input
                              id="currentUpperAppliance"
                              value={dataCollectionFormData.currentUpperAppliance}
                              onChange={(e) => handleDataCollectionFormChange('currentUpperAppliance', e.target.value)}
                              placeholder="Enter current upper appliance..."
                              className="h-9"
                            />
                          </div>
                        </div>

                        {/* Current Lower Appliance */}
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <Label htmlFor="currentLowerAppliance" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Current Lower Appliance
                          </Label>
                          <div className="flex-1 max-w-xs ml-4">
                            <Input
                              id="currentLowerAppliance"
                              value={dataCollectionFormData.currentLowerAppliance}
                              onChange={(e) => handleDataCollectionFormChange('currentLowerAppliance', e.target.value)}
                              placeholder="Enter current lower appliance..."
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Collection Checklist - Conditional based on Step 1 selection */}
                    <div className="flex-1 overflow-y-auto">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Data Collection Status</h4>

                      {/* Picture-Related Data Collection Options */}
                      {dataCollectionFormData.reasonsForCollection.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {/* Pre-Surgical Pictures - Only for pre-surgical */}
                          {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                            <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                              dataCollectionFormData.dataCollected.preSurgicalPictures === null
                                ? 'border-red-300 bg-red-50 shadow-sm'
                                : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                  Pre-Surgical Pictures <span className="text-red-500 text-base">*</span>
                                </h5>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDataCollectionToggle('preSurgicalPictures', null, true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.preSurgicalPictures === true
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
                                    onClick={() => handleDataCollectionToggle('preSurgicalPictures', null, false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      dataCollectionFormData.dataCollected.preSurgicalPictures === false
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

                {/* Step 3 Content - 3D Scans & Upper/Lower Data */}
                {currentStep === 3 && (
                  <div className="h-full flex flex-col space-y-3">
                    {/* Header Section - Fixed */}
                    <div className="flex-shrink-0">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        3D Scans & Upper/Lower Data Collection
                      </h3>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                      {dataCollectionFormData.reasonsForCollection.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                              {/* Pre-Surgical Jaw Records - Only for pre-surgical */}
                              {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                  <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Pre-Surgical Jaw Records (IOS)
                                  </h5>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('preSurgicalJawRecords', 'upper', !dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper
                                          ? 'bg-green-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                      }`}
                                    >
                                      <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.preSurgicalJawRecords.upper && (
                                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                        )}
                                      </div>
                                      Upper
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('preSurgicalJawRecords', 'lower', !dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower
                                          ? 'bg-green-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                      }`}
                                    >
                                      <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.preSurgicalJawRecords.lower && (
                                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                        )}
                                      </div>
                                      Lower
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Facial Scan - Only for pre-surgical */}
                              {dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                  <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    Facial Scan
                                  </h5>
                                  <div className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDataCollectionToggle('facialScan', null, !dataCollectionFormData.dataCollected.facialScan)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                        dataCollectionFormData.dataCollected.facialScan
                                          ? 'bg-green-500 text-white shadow-sm'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-400'
                                      }`}
                                    >
                                      <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                                        dataCollectionFormData.dataCollected.facialScan
                                          ? 'border-white bg-white'
                                          : 'border-gray-400 bg-transparent'
                                      }`}>
                                        {dataCollectionFormData.dataCollected.facialScan && (
                                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
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
                                  {/* Jaw Records */}
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                    <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      Jaw Records (IOS)
                                    </h5>
                                    <div className="flex items-center justify-center gap-2">
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
                                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                    <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                      Tissue Scan
                                    </h5>
                                    <div className="flex items-center justify-center gap-2">
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
                                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                    <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                      Photogrammetry (ICAM)
                                    </h5>
                                    <div className="flex items-center justify-center gap-2">
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
                                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                    <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                      DC-REF Scan
                                    </h5>
                                    <div className="flex items-center justify-center gap-2">
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
                                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200">
                                    <h5 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                      Appliance 360
                                    </h5>
                                    <div className="flex items-center justify-center gap-2">
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
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-emerald-600" />
              Data Collection Sheet Preview
            </DialogTitle>
          </DialogHeader>

          {selectedDataCollectionSheet && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Information */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-emerald-800 mb-1">Patient Name</h3>
                    <p className="text-base font-semibold text-emerald-900">{selectedDataCollectionSheet.patient_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-emerald-800 mb-1">Collection Date</h3>
                    <p className="text-base font-semibold text-emerald-900">
                      {new Date(selectedDataCollectionSheet.collection_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-emerald-800 mb-1">Submitted</h3>
                    <p className="text-base font-semibold text-emerald-900">
                      {new Date(selectedDataCollectionSheet.created_at).toLocaleDateString()} at{' '}
                      {new Date(selectedDataCollectionSheet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasons for Collection */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Reasons for Collection
                </h3>
                <div className="space-y-2">
                  {selectedDataCollectionSheet.reasons_for_collection?.map((reason: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{reason}</span>
                    </div>
                  ))}
                  {selectedDataCollectionSheet.custom_reason && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-medium">Custom: {selectedDataCollectionSheet.custom_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Appliances */}
              {(selectedDataCollectionSheet.current_upper_appliance || selectedDataCollectionSheet.current_lower_appliance) && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Current Appliances
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDataCollectionSheet.current_upper_appliance && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Upper Appliance</h4>
                        <p className="text-base text-gray-900">{selectedDataCollectionSheet.current_upper_appliance}</p>
                      </div>
                    )}
                    {selectedDataCollectionSheet.current_lower_appliance && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Lower Appliance</h4>
                        <p className="text-base text-gray-900">{selectedDataCollectionSheet.current_lower_appliance}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Collection Status */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Data Collection Status
                </h3>
                <div className="space-y-4">
                  {/* Pictures */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Pictures</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedDataCollectionSheet.data_collected?.preSurgicalPictures !== null && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">Pre-Surgical Pictures</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedDataCollectionSheet.data_collected.preSurgicalPictures
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedDataCollectionSheet.data_collected.preSurgicalPictures ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {selectedDataCollectionSheet.data_collected?.surgicalPictures !== null && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">Surgical Pictures</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedDataCollectionSheet.data_collected.surgicalPictures
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedDataCollectionSheet.data_collected.surgicalPictures ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {selectedDataCollectionSheet.data_collected?.followUpPictures !== null && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">Follow-Up Pictures</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedDataCollectionSheet.data_collected.followUpPictures
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedDataCollectionSheet.data_collected.followUpPictures ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {selectedDataCollectionSheet.data_collected?.fracturedAppliancePictures !== null && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">Fractured Appliance Pictures</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedDataCollectionSheet.data_collected.fracturedAppliancePictures
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedDataCollectionSheet.data_collected.fracturedAppliancePictures ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3D Scans */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">3D Scans & Data Collection</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Helper function to render scan status */}
                      {(() => {
                        const renderScanStatus = (label: string, data: any) => {
                          if (!data) return null;

                          if (typeof data === 'boolean') {
                            return data ? (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">{label}</span>
                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Collected</span>
                              </div>
                            ) : null;
                          }

                          if (typeof data === 'object' && (data.upper || data.lower)) {
                            return (
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-700 mb-1">{label}</div>
                                <div className="flex gap-2">
                                  {data.upper && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Upper</span>}
                                  {data.lower && <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Lower</span>}
                                </div>
                              </div>
                            );
                          }

                          return null;
                        };

                        const scans = [
                          { label: 'Pre-Surgical Jaw Records', data: selectedDataCollectionSheet.data_collected?.preSurgicalJawRecords },
                          { label: 'Facial Scan', data: selectedDataCollectionSheet.data_collected?.facialScan },
                          { label: 'Jaw Records (IOS)', data: selectedDataCollectionSheet.data_collected?.jawRecords },
                          { label: 'Tissue Scan', data: selectedDataCollectionSheet.data_collected?.tissueScan },
                          { label: 'Photogrammetry (ICAM)', data: selectedDataCollectionSheet.data_collected?.photogrammetry },
                          { label: 'DC-REF Scan', data: selectedDataCollectionSheet.data_collected?.dcRefScan },
                          { label: 'Appliance 360', data: selectedDataCollectionSheet.data_collected?.appliance360 },
                          { label: 'Surgical Jaw Records', data: selectedDataCollectionSheet.data_collected?.surgicalJawRecords },
                          { label: 'Surgical Tissue Scan', data: selectedDataCollectionSheet.data_collected?.surgicalTissueScan }
                        ];

                        return scans.map((scan) => renderScanStatus(scan.label, scan.data)).filter(Boolean);
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedDataCollectionSheet.additional_notes && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Additional Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedDataCollectionSheet.additional_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={handleDataCollectionPreviewClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}