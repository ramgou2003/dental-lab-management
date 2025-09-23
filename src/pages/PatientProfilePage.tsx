
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { EditPatientForm } from "@/components/EditPatientForm";
import { LabScriptDetail } from "@/components/LabScriptDetail";
import { TreatmentDialog, TreatmentData } from "@/components/TreatmentDialog";
import { ConsentFullArchDialog } from "@/components/ConsentFullArchDialog";
import { FinancialAgreementDialog } from "@/components/FinancialAgreementDialog";
import { FinancialAgreementPreview } from "@/components/FinancialAgreementPreview";
import { supabase } from "@/integrations/supabase/client";
import { FinalDesignApprovalDialog } from "@/components/FinalDesignApprovalDialog";
import { NewPatientPacketForm } from "@/components/NewPatientPacketForm";
import { NewPatientPacketPreview } from "@/components/NewPatientPacketPreview";
import { MedicalRecordsReleaseDialog } from "@/components/MedicalRecordsReleaseDialog";
import { InformedConsentSmokingDialog } from "@/components/InformedConsentSmokingDialog";
import { ThankYouPreSurgeryDialog } from "@/components/ThankYouPreSurgeryDialog";
import { ThreeYearCarePackageDialog } from "@/components/ThreeYearCarePackageDialog";
import { FiveYearWarrantyDialog } from "@/components/FiveYearWarrantyDialog";
import { PartialPaymentAgreementDialog } from "@/components/PartialPaymentAgreementDialog";
import { TreatmentPlanDialog } from "@/components/TreatmentPlanDialog";
import { saveTreatmentPlanForm, getTreatmentPlanFormsByPatientId, deleteTreatmentPlanForm, getTreatmentPlanForm, TreatmentPlanFormDB } from "@/services/treatmentPlanFormService";
import { ConsultationViewer } from "@/components/ConsultationViewer";
import { usePatientLabScripts } from "@/hooks/usePatientLabScripts";
import { usePatientManufacturingItems } from "@/hooks/usePatientManufacturingItems";
import { usePatientAppointments } from "@/hooks/usePatientAppointments";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
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
  Trash2,
  X,
  AlertTriangle
} from "lucide-react";
import { LabReportCardForm } from "@/components/LabReportCardForm";
import { ViewLabReportCard } from "@/components/ViewLabReportCard";
import { ClinicalReportCardForm } from "@/components/ClinicalReportCardForm";
import { ViewClinicalReportCard } from "@/components/ViewClinicalReportCard";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { SurgicalRecallSheetForm } from "@/components/SurgicalRecallSheetForm";
import { ViewSurgicalRecallSheet } from "@/components/ViewSurgicalRecallSheet";
import { DeleteSurgicalRecallSheetDialog } from "@/components/DeleteSurgicalRecallSheetDialog";
import { useToast } from "@/hooks/use-toast";
import { useSurgicalRecallSheets } from "@/hooks/useSurgicalRecallSheets";
import { savePatientPacket, getPatientPacketsByPatientId, updatePatientPacket, deletePatientPacket } from "@/services/patientPacketService";
import { convertDatabaseToFormData, convertFormDataToDatabase } from "@/utils/patientPacketConverter";
import { getFinancialAgreementsByPatientId, deleteFinancialAgreement, updateFinancialAgreement } from "@/services/financialAgreementService";
import { getConsentFormsByPatientId, getConsentForm, deleteConsentForm, formatConsentFormForDisplay, ConsentFullArchFormData } from "@/services/consentFullArchService";
import { getMedicalRecordsReleaseFormsByPatientId, deleteMedicalRecordsReleaseForm, formatMedicalRecordsReleaseFormForDisplay, MedicalRecordsReleaseFormData } from "@/services/medicalRecordsReleaseService";
import { getInformedConsentSmokingFormsByPatientId, deleteInformedConsentSmokingForm, formatInformedConsentSmokingFormForDisplay, InformedConsentSmokingFormData } from "@/services/informedConsentSmokingService";
import { getFinalDesignApprovalFormsByPatientId, getFinalDesignApprovalForm, deleteFinalDesignApprovalForm, formatFinalDesignApprovalFormForDisplay, FinalDesignApprovalFormData } from "@/services/finalDesignApprovalService";
import { getThankYouPreSurgeryFormsByPatientId, getThankYouPreSurgeryForm, deleteThankYouPreSurgeryForm, formatThankYouPreSurgeryFormForDisplay, ThankYouPreSurgeryFormData } from "@/services/thankYouPreSurgeryService";
import { getThreeYearCarePackageFormsByPatientId, deleteThreeYearCarePackageForm, formatThreeYearCarePackageFormForDisplay, ThreeYearCarePackageFormData, createThreeYearCarePackageForm, updateThreeYearCarePackageForm } from "@/services/threeYearCarePackageService";
import { fiveYearWarrantyService, FiveYearWarrantyFormData, formatFiveYearWarrantyFormForDisplay } from "@/services/fiveYearWarrantyService";
import { partialPaymentAgreementService, PartialPaymentAgreementFormData, formatPartialPaymentAgreementFormForDisplay } from "@/services/partialPaymentAgreementService";


export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab state management with URL persistence
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    const validTabs = ['basic', 'clinical', 'appointments', 'lab', 'reports', 'manufacturing', 'delivery'];
    return validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'basic';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const newUrl = `${location.pathname}?tab=${newTab}`;
    navigate(newUrl, { replace: true });
  };

  // Update tab state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    const validTabs = ['basic', 'clinical', 'appointments', 'lab', 'reports', 'manufacturing', 'delivery'];
    const newTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'basic';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.search, activeTab]);

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
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [isEditingTreatment, setIsEditingTreatment] = useState(false);
  const [showDeleteTreatmentConfirmation, setShowDeleteTreatmentConfirmation] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState<{type: 'upper' | 'lower'} | null>(null);

  // Fetch patient-specific lab scripts and manufacturing items
  const { labScripts, loading: labScriptsLoading, updateLabScript } = usePatientLabScripts(patientId);
  const { manufacturingItems, loading: manufacturingLoading, updateManufacturingItemStatus } = usePatientManufacturingItems(patientId);
  const { appointments: patientAppointments, loading: appointmentsLoading } = usePatientAppointments(patient?.full_name);
  const { reportCards, loading: reportCardsLoading, updateLabReportStatus, updateClinicalReportStatus } = useReportCards();
  const { deliveryItems, loading: deliveryItemsLoading, updateDeliveryStatus } = useDeliveryItems();
  const { toast } = useToast();

  // Permission checks for admin functionality
  const { isAdminUser } = usePermissions();

  // Auth context for user information
  const { user } = useAuth();

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
  const ivSedationTotalSteps = 5; // Define total number of steps for IV sedation
  const [ivSedationSheets, setIVSedationSheets] = useState<any[]>([]);

  const [ivSedationFormMessage, setIVSedationFormMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({ type: null, text: '' });
  const [showIVSedationToast, setShowIVSedationToast] = useState(false);
  const [showIVSedationSummary, setShowIVSedationSummary] = useState(false);
  const [ivSedationActiveDropdown, setIVSedationActiveDropdown] = useState<string | null>(null);
  const [editingIVSedationSheet, setEditingIVSedationSheet] = useState<any | null>(null);
  const [isIVSedationEditMode, setIsIVSedationEditMode] = useState(false);
  const [showIVSedationDeleteConfirmation, setShowIVSedationDeleteConfirmation] = useState(false);
  const [ivSedationSheetToDelete, setIVSedationSheetToDelete] = useState<any | null>(null);
  const [showIVSedationPreview, setShowIVSedationPreview] = useState(false);
  const [selectedIVSedationSheet, setSelectedIVSedationSheet] = useState<any | null>(null);

  // State for Surgical Recall Sheets
  const [showSurgicalRecallForm, setShowSurgicalRecallForm] = useState(false);
  const [editingSurgicalRecallSheet, setEditingSurgicalRecallSheet] = useState<any | null>(null);
  const [showSurgicalRecallPreview, setShowSurgicalRecallPreview] = useState(false);
  const [selectedSurgicalRecallSheet, setSelectedSurgicalRecallSheet] = useState<any | null>(null);
  const [surgicalRecallActiveDropdown, setSurgicalRecallActiveDropdown] = useState<string | null>(null);
  const [showSurgicalRecallDeleteDialog, setShowSurgicalRecallDeleteDialog] = useState(false);
  const [surgicalRecallSheetToDelete, setSurgicalRecallSheetToDelete] = useState<any | null>(null);

  // State for Administrative Forms
  const [showConsentFullArchForm, setShowConsentFullArchForm] = useState(false);
  const [showFinancialAgreementForm, setShowFinancialAgreementForm] = useState(false);
  const [showFinalDesignApprovalForm, setShowFinalDesignApprovalForm] = useState(false);
  const [showNewPatientPacketForm, setShowNewPatientPacketForm] = useState(false);
  const [showNewPatientPacketPreview, setShowNewPatientPacketPreview] = useState(false);
  const [selectedPatientPacketForPreview, setSelectedPatientPacketForPreview] = useState<any>(null);
  const [showFinancialAgreementPreview, setShowFinancialAgreementPreview] = useState(false);
  const [selectedFinancialAgreementForPreview, setSelectedFinancialAgreementForPreview] = useState<any>(null);
  const [showMedicalRecordsReleaseForm, setShowMedicalRecordsReleaseForm] = useState(false);
  const [showInformedConsentSmokingForm, setShowInformedConsentSmokingForm] = useState(false);
  const [showThankYouPreSurgeryForm, setShowThankYouPreSurgeryForm] = useState(false);
  const [showThreeYearCarePackageForm, setShowThreeYearCarePackageForm] = useState(false);
  const [showFiveYearWarrantyForm, setShowFiveYearWarrantyForm] = useState(false);
  const [showPartialPaymentAgreementForm, setShowPartialPaymentAgreementForm] = useState(false);
  const [showTreatmentPlanForm, setShowTreatmentPlanForm] = useState(false);
  const [selectedAdminFormType, setSelectedAdminFormType] = useState<string>("");

  // State for 3-Year Care Package Forms
  const [threeYearCarePackageForms, setThreeYearCarePackageForms] = useState<ThreeYearCarePackageFormData[]>([]);
  const [loadingThreeYearCarePackageForms, setLoadingThreeYearCarePackageForms] = useState(false);
  const [selectedThreeYearCarePackageForm, setSelectedThreeYearCarePackageForm] = useState<ThreeYearCarePackageFormData | null>(null);
  const [isEditingThreeYearCarePackageForm, setIsEditingThreeYearCarePackageForm] = useState(false);
  const [isViewingThreeYearCarePackageForm, setIsViewingThreeYearCarePackageForm] = useState(false);
  const [threeYearCarePackageActiveDropdown, setThreeYearCarePackageActiveDropdown] = useState<string | null>(null);
  const [showDeleteThreeYearCarePackageFormConfirm, setShowDeleteThreeYearCarePackageFormConfirm] = useState(false);
  const [threeYearCarePackageFormToDelete, setThreeYearCarePackageFormToDelete] = useState<ThreeYearCarePackageFormData | null>(null);

  // State for 5-Year Warranty Forms
  const [fiveYearWarrantyForms, setFiveYearWarrantyForms] = useState<FiveYearWarrantyFormData[]>([]);
  const [loadingFiveYearWarrantyForms, setLoadingFiveYearWarrantyForms] = useState(false);
  const [selectedFiveYearWarrantyForm, setSelectedFiveYearWarrantyForm] = useState<FiveYearWarrantyFormData | null>(null);
  const [isEditingFiveYearWarrantyForm, setIsEditingFiveYearWarrantyForm] = useState(false);
  const [isViewingFiveYearWarrantyForm, setIsViewingFiveYearWarrantyForm] = useState(false);
  const [fiveYearWarrantyActiveDropdown, setFiveYearWarrantyActiveDropdown] = useState<string | null>(null);
  const [showDeleteFiveYearWarrantyFormConfirm, setShowDeleteFiveYearWarrantyFormConfirm] = useState(false);
  const [fiveYearWarrantyFormToDelete, setFiveYearWarrantyFormToDelete] = useState<FiveYearWarrantyFormData | null>(null);

  // State for Partial Payment Agreement Forms
  const [partialPaymentAgreementForms, setPartialPaymentAgreementForms] = useState<any[]>([]);
  const [loadingPartialPaymentAgreementForms, setLoadingPartialPaymentAgreementForms] = useState(false);
  const [selectedPartialPaymentAgreementForm, setSelectedPartialPaymentAgreementForm] = useState<any | null>(null);
  const [isEditingPartialPaymentAgreementForm, setIsEditingPartialPaymentAgreementForm] = useState(false);
  const [isViewingPartialPaymentAgreementForm, setIsViewingPartialPaymentAgreementForm] = useState(false);
  const [partialPaymentAgreementActiveDropdown, setPartialPaymentAgreementActiveDropdown] = useState<string | null>(null);
  const [showDeletePartialPaymentAgreementFormConfirm, setShowDeletePartialPaymentAgreementFormConfirm] = useState(false);
  const [partialPaymentAgreementFormToDelete, setPartialPaymentAgreementFormToDelete] = useState<any | null>(null);

  // State for Treatment Plan Forms
  const [treatmentPlanForms, setTreatmentPlanForms] = useState<TreatmentPlanFormDB[]>([]);
  const [loadingTreatmentPlanForms, setLoadingTreatmentPlanForms] = useState(false);
  const [selectedTreatmentPlanForm, setSelectedTreatmentPlanForm] = useState<TreatmentPlanFormDB | null>(null);
  const [isEditingTreatmentPlanForm, setIsEditingTreatmentPlanForm] = useState(false);
  const [isViewingTreatmentPlanForm, setIsViewingTreatmentPlanForm] = useState(false);
  const [treatmentPlanActiveDropdown, setTreatmentPlanActiveDropdown] = useState<string | null>(null);
  const [showDeleteTreatmentPlanFormConfirm, setShowDeleteTreatmentPlanFormConfirm] = useState(false);
  const [treatmentPlanFormToDelete, setTreatmentPlanFormToDelete] = useState<TreatmentPlanFormDB | null>(null);

  // State for Patient Packets
  const [patientPackets, setPatientPackets] = useState<any[]>([]);
  const [loadingPatientPackets, setLoadingPatientPackets] = useState(false);
  const [editingPatientPacket, setEditingPatientPacket] = useState<any | null>(null);
  const [isEditingPatientPacket, setIsEditingPatientPacket] = useState(false);
  const [showDeletePacketConfirm, setShowDeletePacketConfirm] = useState(false);
  const [packetToDelete, setPacketToDelete] = useState<any | null>(null);

  // State for Consultation Forms
  const [consultationForms, setConsultationForms] = useState<any[]>([]);
  const [loadingConsultationForms, setLoadingConsultationForms] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [showConsultationViewer, setShowConsultationViewer] = useState(false);

  // State for Financial Agreement Forms
  const [financialAgreements, setFinancialAgreements] = useState<any[]>([]);
  const [loadingFinancialAgreements, setLoadingFinancialAgreements] = useState(false);

  // Consent Forms state
  const [consentForms, setConsentForms] = useState<ConsentFullArchFormData[]>([]);
  const [loadingConsentForms, setLoadingConsentForms] = useState(false);
  const [selectedConsentForm, setSelectedConsentForm] = useState<any | null>(null);
  const [isEditingConsentForm, setIsEditingConsentForm] = useState(false);
  const [isViewingConsentForm, setIsViewingConsentForm] = useState(false);
  const [showDeleteConsentFormConfirm, setShowDeleteConsentFormConfirm] = useState(false);
  const [consentFormToDelete, setConsentFormToDelete] = useState<any | null>(null);

  // Medical Records Release Forms state
  const [medicalRecordsReleaseForms, setMedicalRecordsReleaseForms] = useState<MedicalRecordsReleaseFormData[]>([]);
  const [loadingMedicalRecordsReleaseForms, setLoadingMedicalRecordsReleaseForms] = useState(false);
  const [editingMedicalRecordsReleaseForm, setEditingMedicalRecordsReleaseForm] = useState<any | null>(null);
  const [isEditingMedicalRecordsReleaseForm, setIsEditingMedicalRecordsReleaseForm] = useState(false);
  const [isViewingMedicalRecordsReleaseForm, setIsViewingMedicalRecordsReleaseForm] = useState(false);
  const [showDeleteMedicalRecordsReleaseFormConfirm, setShowDeleteMedicalRecordsReleaseFormConfirm] = useState(false);
  const [medicalRecordsReleaseFormToDelete, setMedicalRecordsReleaseFormToDelete] = useState<any | null>(null);

  // Informed Consent Smoking Forms state
  const [informedConsentSmokingForms, setInformedConsentSmokingForms] = useState<InformedConsentSmokingFormData[]>([]);
  const [loadingInformedConsentSmokingForms, setLoadingInformedConsentSmokingForms] = useState(false);
  const [editingInformedConsentSmokingForm, setEditingInformedConsentSmokingForm] = useState<any | null>(null);
  const [isEditingInformedConsentSmokingForm, setIsEditingInformedConsentSmokingForm] = useState(false);
  const [isViewingInformedConsentSmokingForm, setIsViewingInformedConsentSmokingForm] = useState(false);
  const [showDeleteInformedConsentSmokingFormConfirm, setShowDeleteInformedConsentSmokingFormConfirm] = useState(false);
  const [informedConsentSmokingFormToDelete, setInformedConsentSmokingFormToDelete] = useState<any | null>(null);

  // Final Design Approval Forms state
  const [finalDesignApprovalForms, setFinalDesignApprovalForms] = useState<FinalDesignApprovalFormData[]>([]);
  const [loadingFinalDesignApprovalForms, setLoadingFinalDesignApprovalForms] = useState(false);
  const [selectedFinalDesignApprovalForm, setSelectedFinalDesignApprovalForm] = useState<any | null>(null);
  const [isEditingFinalDesignApprovalForm, setIsEditingFinalDesignApprovalForm] = useState(false);
  const [isViewingFinalDesignApprovalForm, setIsViewingFinalDesignApprovalForm] = useState(false);
  const [showDeleteFinalDesignApprovalFormConfirm, setShowDeleteFinalDesignApprovalFormConfirm] = useState(false);
  const [finalDesignApprovalFormToDelete, setFinalDesignApprovalFormToDelete] = useState<any | null>(null);

  // Thank You Pre-Surgery Forms state
  const [thankYouPreSurgeryForms, setThankYouPreSurgeryForms] = useState<ThankYouPreSurgeryFormData[]>([]);
  const [loadingThankYouPreSurgeryForms, setLoadingThankYouPreSurgeryForms] = useState(false);
  const [selectedThankYouPreSurgeryForm, setSelectedThankYouPreSurgeryForm] = useState<any | null>(null);
  const [isEditingThankYouPreSurgeryForm, setIsEditingThankYouPreSurgeryForm] = useState(false);
  const [isViewingThankYouPreSurgeryForm, setIsViewingThankYouPreSurgeryForm] = useState(false);
  const [showDeleteThankYouPreSurgeryFormConfirm, setShowDeleteThankYouPreSurgeryFormConfirm] = useState(false);
  const [thankYouPreSurgeryFormToDelete, setThankYouPreSurgeryFormToDelete] = useState<any | null>(null);
  const [editingFinancialAgreement, setEditingFinancialAgreement] = useState<any | null>(null);
  const [isEditingFinancialAgreement, setIsEditingFinancialAgreement] = useState(false);
  const [isViewingFinancialAgreement, setIsViewingFinancialAgreement] = useState(false);
  const [showDeleteFinancialAgreementConfirm, setShowDeleteFinancialAgreementConfirm] = useState(false);
  const [financialAgreementToDelete, setFinancialAgreementToDelete] = useState<any | null>(null);



  // Auto-save state for Patient Packets
  const [patientPacketAutoSaveStatus, setPatientPacketAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [currentPatientPacketId, setCurrentPatientPacketId] = useState<string | null>(null);
  const [patientPacketAutoSaveMessage, setPatientPacketAutoSaveMessage] = useState<string>('');
  const [patientPacketLastSavedTime, setPatientPacketLastSavedTime] = useState<string>('');

  // Surgical recall sheets hook
  const {
    sheets: surgicalRecallSheets,
    loading: surgicalRecallLoading,
    refetch: refetchSurgicalRecallSheets,
    fetchSheetWithImplants,
    deleteSheet: deleteSurgicalRecallSheet
  } = useSurgicalRecallSheets(patient?.id);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [currentIVSedationId, setCurrentIVSedationId] = useState<string | null>(null);
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Helper functions to check step completion
  const isStep1Complete = () => {
    return !!(
      ivSedationFormData.patientName &&
      ivSedationFormData.date &&
      ivSedationFormData.heightFeet &&
      ivSedationFormData.heightInches &&
      ivSedationFormData.weight &&
      ivSedationFormData.upperTreatment &&
      ivSedationFormData.lowerTreatment
    );
  };

  const isStep2Complete = () => {
    // Check if morning medications field is properly filled
    const morningMedicationsValid = ivSedationFormData.morningMedications &&
      (ivSedationFormData.morningMedications === 'no' ||
       (ivSedationFormData.morningMedications !== 'yes' && ivSedationFormData.morningMedications.trim().length > 0));

    const basicFields = !!(
      ivSedationFormData.npoStatus &&
      morningMedicationsValid &&
      ivSedationFormData.asaClassification &&
      ivSedationFormData.mallampatiScore &&
      ivSedationFormData.allergies &&
      ivSedationFormData.allergies.length > 0 &&
      ivSedationFormData.anesthesiaHistory &&
      ivSedationFormData.wellDevelopedNourished &&
      ivSedationFormData.patientAnxious
    );

    // Check female-specific fields only if patient is female
    const femaleFieldsComplete = patient && patient.gender && patient.gender.toLowerCase() === 'female'
      ? !!(ivSedationFormData.pregnancyRisk)
      : true;

    // Check A1C level is required only if Diabetes is selected
    const a1cFieldComplete = ivSedationFormData.endocrineRenalProblems?.includes('Diabetes')
      ? !!(ivSedationFormData.lastA1CLevel && ivSedationFormData.lastA1CLevel.trim().length > 0)
      : true;

    return basicFields && femaleFieldsComplete && a1cFieldComplete;
  };

  const isStep3Complete = () => {
    return !!(
      ivSedationFormData.instrumentsChecklist &&
      ivSedationFormData.instrumentsChecklist.length > 0 &&
      ivSedationFormData.sedationType &&
      ivSedationFormData.levelOfSedation &&
      ivSedationFormData.medicationsPlanned &&
      ivSedationFormData.medicationsPlanned.length > 0 &&
      ivSedationFormData.administrationRoute &&
      ivSedationFormData.administrationRoute.length > 0 &&
      ivSedationFormData.emergencyProtocols &&
      ivSedationFormData.emergencyProtocols.length > 0
    );
  };

  const isStep4Complete = () => {
    return !!(
      ivSedationFormData.timeInRoom &&
      ivSedationFormData.sedationStartTime &&
      ivSedationFormData.sedationEndTime &&
      ivSedationFormData.outOfRoomTime
    );
  };

  const isStep5Complete = () => {
    return !!(
      ivSedationFormData.alertOriented &&
      ivSedationFormData.protectiveReflexes &&
      ivSedationFormData.breathingSpontaneously &&
      ivSedationFormData.postOpNausea &&
      ivSedationFormData.caregiverPresent &&
      ivSedationFormData.baselineMentalStatus &&
      ivSedationFormData.responsiveVerbalCommands &&
      ivSedationFormData.saturatingRoomAir &&
      ivSedationFormData.vitalSignsBaseline &&
      ivSedationFormData.painDuringRecovery &&
      ivSedationFormData.postOpInstructionsGivenTo &&
      ivSedationFormData.followUpInstructionsGivenTo &&
      ivSedationFormData.dischargedTo &&
      ivSedationFormData.painLevelDischarge
    );
  };

  // State for Flow Entry Dialog
  const [showFlowEntryDialog, setShowFlowEntryDialog] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newFlowEntry, setNewFlowEntry] = useState({
    time: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    rr: '',
    spo2: '',
    medications: [] as string[]
  });

  // State for new medication form in flow entry dialog
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    unit: '',
    isCustomMedication: false,
    isCustomDosage: false
  });

  // Medication options for surgery - organized by medication with specific dosages
  const medicationOptionsNew = {
    'Versed (Midazolam)': [
      { dosage: '0.5', unit: 'mg' },
      { dosage: '1', unit: 'mg' },
      { dosage: '2', unit: 'mg' },
      { dosage: '3', unit: 'mg' }
    ],
    'Fentanyl': [
      { dosage: '25', unit: 'mcg' },
      { dosage: '50', unit: 'mcg' },
      { dosage: '75', unit: 'mcg' },
      { dosage: '100', unit: 'mcg' }
    ],
    'Ketorolac': [
      { dosage: '15', unit: 'mg' },
      { dosage: '30', unit: 'mg' }
    ],
    'Benadryl': [
      { dosage: '25', unit: 'mg' },
      { dosage: '50', unit: 'mg' }
    ],
    'Dexamethasone': [
      { dosage: '2', unit: 'mg' },
      { dosage: '4', unit: 'mg' }
    ],
    'Acetaminophen': [
      { dosage: '2 ml (20 mg)', unit: 'ml' },
      { dosage: '5 ml (50 mg)', unit: 'ml' }
    ],
    'Valium': [
      { dosage: '10', unit: 'mg Tab' }
    ],
    'Clindamycin': [
      { dosage: '300', unit: 'mg Tab' }
    ],
    'Lidocaine': [
      { dosage: '0.5 ml (2.5 mg)', unit: 'ml' }
    ]
  };

  const medicationNames = Object.keys(medicationOptionsNew);

  // Common unit options for custom medications
  const commonUnitOptions = [
    'mg', 'mcg', 'g', 'ml', 'L', 'units', 'IU', 'Tab', 'Capsule', 'Drop', 'Spray', 'Patch', 'Injection', 'Infusion'
  ];

  // Legacy medication options for backward compatibility with existing data
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
      fracturedAppliancePictures: null, // null = not selected, true = yes, false = no
      // CBCT option
      cbctTaken: null // null = not selected, true = yes, false = no
    }
  });

  // IV Sedation Form Data
  const [ivSedationFormData, setIVSedationFormData] = useState({
    patientName: "",
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    upperTreatment: "",
    lowerTreatment: "",
    upperSurgeryType: "",
    lowerSurgeryType: "",
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
    sedationEndTime: "",
    outOfRoomTime: "",
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
    // Level of Sedation
    levelOfSedation: "",
    // Recovery Assessment fields
    alertOriented: "",
    protectiveReflexes: "",
    breathingSpontaneously: "",
    postOpNausea: "",
    caregiverPresent: "",
    baselineMentalStatus: "",
    responsiveVerbalCommands: "",
    saturatingRoomAir: "",
    vitalSignsBaseline: "",
    painDuringRecovery: "",
    postOpInstructionsGivenTo: "",
    followUpInstructionsGivenTo: "",
    dischargedTo: "",
    painLevelDischarge: "",
    otherRemarks: "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setIVSedationActiveDropdown(null);
    };

    if (activeDropdown || ivSedationActiveDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown, ivSedationActiveDropdown]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchDataCollectionSheets();
      fetchIVSedationSheets();
      fetchPatientPackets();
      fetchFinancialAgreements();
      fetchConsentForms();
      fetchMedicalRecordsReleaseForms();
      fetchInformedConsentSmokingForms();
      fetchFinalDesignApprovalForms();
      fetchThankYouPreSurgeryForms();
      fetchThreeYearCarePackageForms();
      fetchFiveYearWarrantyForms();
      fetchPartialPaymentAgreementForms();
      fetchTreatmentPlanForms();
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

  // Fetch consultation forms when patient data is loaded
  useEffect(() => {
    if (patient) {
      fetchConsultationForms();
    }
  }, [patient]);

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

  const fetchIVSedationSheets = async () => {
    if (!patientId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('iv_sedation_forms')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching IV sedation forms:', error);
        return;
      }

      setIVSedationSheets(data || []);
    } catch (error) {
      console.error('Error fetching IV sedation forms:', error);
    }
  };

  const fetchPatientPackets = async () => {
    if (!patientId) return;

    try {
      setLoadingPatientPackets(true);
      const { data, error } = await getPatientPacketsByPatientId(patientId);

      if (error) {
        console.error('Error fetching patient packets:', error);
        return;
      }

      setPatientPackets(data || []);
    } catch (error) {
      console.error('Error fetching patient packets:', error);
    } finally {
      setLoadingPatientPackets(false);
    }
  };

  const fetchConsultationForms = async () => {
    if (!patient) return;

    try {
      setLoadingConsultationForms(true);

      // Construct patient name to match consultation records
      const patientName = patient.first_name && patient.last_name
        ? `${patient.first_name} ${patient.last_name}`
        : patient.name || '';

      if (!patientName) {
        console.log('No patient name available for consultation lookup');
        return;
      }

      // Fetch consultation forms for this patient
      const { data: consultations, error: consultationError } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_name', patientName)
        .order('created_at', { ascending: false });

      if (consultationError) {
        console.error('Error fetching consultation forms:', consultationError);
        return;
      }

      console.log('Found consultation forms for patient:', patientName, consultations);
      setConsultationForms(consultations || []);
    } catch (error) {
      console.error('Unexpected error fetching consultation forms:', error);
    } finally {
      setLoadingConsultationForms(false);
    }
  };

  const handleViewConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setShowConsultationViewer(true);
  };

  const handleCloseConsultationViewer = () => {
    setShowConsultationViewer(false);
    setSelectedConsultation(null);
  };

  const fetchFinancialAgreements = async () => {
    if (!patientId) return;

    try {
      setLoadingFinancialAgreements(true);
      const { data, error } = await getFinancialAgreementsByPatientId(patientId);

      if (error) {
        console.error('Error fetching financial agreements:', error);
        return;
      }

      setFinancialAgreements(data || []);
      console.log('🔍 Financial Agreements fetched:', data?.length || 0, 'agreements');
      if (data && data.length > 0) {
        console.log('📋 Financial Agreements data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching financial agreements:', error);
    } finally {
      setLoadingFinancialAgreements(false);
    }
  };

  const fetchConsentForms = async () => {
    if (!patientId) return;

    try {
      setLoadingConsentForms(true);
      const { data, error } = await getConsentFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching consent forms:', error);
        return;
      }

      setConsentForms(data || []);
      console.log('🔍 Consent Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Consent Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching consent forms:', error);
    } finally {
      setLoadingConsentForms(false);
    }
  };

  const fetchMedicalRecordsReleaseForms = async () => {
    if (!patientId) return;

    try {
      setLoadingMedicalRecordsReleaseForms(true);
      const { data, error } = await getMedicalRecordsReleaseFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching medical records release forms:', error);
        return;
      }

      setMedicalRecordsReleaseForms(data || []);
      console.log('🔍 Medical Records Release Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Medical Records Release Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching medical records release forms:', error);
    } finally {
      setLoadingMedicalRecordsReleaseForms(false);
    }
  };

  const fetchInformedConsentSmokingForms = async () => {
    if (!patientId) return;

    try {
      setLoadingInformedConsentSmokingForms(true);
      const { data, error } = await getInformedConsentSmokingFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching informed consent smoking forms:', error);
        return;
      }

      setInformedConsentSmokingForms(data || []);
      console.log('🔍 Informed Consent Smoking Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Informed Consent Smoking Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching informed consent smoking forms:', error);
    } finally {
      setLoadingInformedConsentSmokingForms(false);
    }
  };

  const fetchFinalDesignApprovalForms = async () => {
    if (!patientId) return;

    try {
      setLoadingFinalDesignApprovalForms(true);
      const { data, error } = await getFinalDesignApprovalFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching final design approval forms:', error);
        return;
      }

      setFinalDesignApprovalForms(data || []);
      console.log('🔍 Final Design Approval Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Final Design Approval Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching final design approval forms:', error);
    } finally {
      setLoadingFinalDesignApprovalForms(false);
    }
  };

  const fetchThankYouPreSurgeryForms = async () => {
    if (!patientId) return;

    try {
      setLoadingThankYouPreSurgeryForms(true);
      const { data, error } = await getThankYouPreSurgeryFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching thank you pre-surgery forms:', error);
        return;
      }

      setThankYouPreSurgeryForms(data || []);
      console.log('🔍 Thank You Pre-Surgery Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Thank You Pre-Surgery Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching thank you pre-surgery forms:', error);
    } finally {
      setLoadingThankYouPreSurgeryForms(false);
    }
  };

  const fetchThreeYearCarePackageForms = async () => {
    if (!patientId) return;

    try {
      setLoadingThreeYearCarePackageForms(true);
      const { data, error } = await getThreeYearCarePackageFormsByPatientId(patientId);

      if (error) {
        console.error('Error fetching 3-Year Care Package forms:', error);
        return;
      }

      setThreeYearCarePackageForms(data || []);
      console.log('🔍 3-Year Care Package Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 3-Year Care Package Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching 3-Year Care Package forms:', error);
    } finally {
      setLoadingThreeYearCarePackageForms(false);
    }
  };

  const fetchFiveYearWarrantyForms = async () => {
    if (!patientId) return;

    try {
      setLoadingFiveYearWarrantyForms(true);
      const data = await fiveYearWarrantyService.getFormsByPatient(patientId);
      setFiveYearWarrantyForms(data || []);
      console.log('🔍 5-Year Warranty Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 5-Year Warranty Forms data:', data);
      }
    } catch (error) {
      console.error('Unexpected error fetching 5-Year Warranty forms:', error);
    } finally {
      setLoadingFiveYearWarrantyForms(false);
    }
  };

  const fetchPartialPaymentAgreementForms = async () => {
    if (!patientId) {
      console.log('⚠️ No patientId provided to fetchPartialPaymentAgreementForms');
      return;
    }

    try {
      console.log('🔄 Fetching Partial Payment Agreement forms for patient:', patientId);
      setLoadingPartialPaymentAgreementForms(true);
      const data = await partialPaymentAgreementService.getFormsByPatientId(patientId);
      console.log('📥 Raw data received from service:', data);
      setPartialPaymentAgreementForms(data || []);
      console.log('🔍 Partial Payment Agreement Forms fetched:', data?.length || 0, 'forms');
      if (data && data.length > 0) {
        console.log('📋 Partial Payment Agreement Forms data:', data);
      } else {
        console.log('⚠️ No Partial Payment Agreement forms found for patient:', patientId);
      }
    } catch (error) {
      console.error('❌ Error fetching Partial Payment Agreement forms:', error);
      console.error('❌ Error details:', error.message, error.stack);
      // Set empty array on error to prevent undefined state
      setPartialPaymentAgreementForms([]);
    } finally {
      setLoadingPartialPaymentAgreementForms(false);
    }
  };

  const fetchTreatmentPlanForms = async () => {
    if (!patientId) {
      console.log('⚠️ No patientId provided to fetchTreatmentPlanForms');
      return;
    }

    try {
      console.log('🔄 Fetching Treatment Plan forms for patient:', patientId);
      setLoadingTreatmentPlanForms(true);

      const { data, error } = await getTreatmentPlanFormsByPatientId(patientId);

      if (error) {
        console.error('❌ Error fetching Treatment Plan forms:', error);
        setTreatmentPlanForms([]);
      } else {
        console.log('✅ Successfully fetched Treatment Plan forms:', data?.length || 0);
        setTreatmentPlanForms(data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching Treatment Plan forms:', error);
      setTreatmentPlanForms([]);
    } finally {
      setLoadingTreatmentPlanForms(false);
    }
  };

  const handleDeleteConsentForm = async () => {
    if (!consentFormToDelete) return;

    try {
      const { error } = await deleteConsentForm(consentFormToDelete.id);

      if (error) {
        console.error('Error deleting consent form:', error);
        toast({
          title: "Error",
          description: "Failed to delete consent packet. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setConsentForms(prev => prev.filter(form => form.id !== consentFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteConsentFormConfirm(false);
      setConsentFormToDelete(null);

      toast({
        title: "Success",
        description: "Consent packet deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting consent form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedicalRecordsReleaseForm = async () => {
    if (!medicalRecordsReleaseFormToDelete) return;

    try {
      const { error } = await deleteMedicalRecordsReleaseForm(medicalRecordsReleaseFormToDelete.id);

      if (error) {
        console.error('Error deleting medical records release form:', error);
        toast({
          title: "Error",
          description: "Failed to delete medical records release form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setMedicalRecordsReleaseForms(prev => prev.filter(form => form.id !== medicalRecordsReleaseFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteMedicalRecordsReleaseFormConfirm(false);
      setMedicalRecordsReleaseFormToDelete(null);

      toast({
        title: "Success",
        description: "Medical records release form deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting medical records release form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInformedConsentSmokingForm = async () => {
    if (!informedConsentSmokingFormToDelete) return;

    try {
      const { error } = await deleteInformedConsentSmokingForm(informedConsentSmokingFormToDelete.id);

      if (error) {
        console.error('Error deleting informed consent smoking form:', error);
        toast({
          title: "Error",
          description: "Failed to delete informed consent smoking form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setInformedConsentSmokingForms(prev => prev.filter(form => form.id !== informedConsentSmokingFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteInformedConsentSmokingFormConfirm(false);
      setInformedConsentSmokingFormToDelete(null);

      toast({
        title: "Success",
        description: "Informed consent smoking form deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting informed consent smoking form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFinalDesignApprovalForm = async () => {
    if (!finalDesignApprovalFormToDelete) return;

    try {
      const { error } = await deleteFinalDesignApprovalForm(finalDesignApprovalFormToDelete.id);

      if (error) {
        console.error('Error deleting final design approval form:', error);
        toast({
          title: "Error",
          description: "Failed to delete final design approval form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setFinalDesignApprovalForms(prev => prev.filter(form => form.id !== finalDesignApprovalFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteFinalDesignApprovalFormConfirm(false);
      setFinalDesignApprovalFormToDelete(null);

      toast({
        title: "Success",
        description: "Final design approval form deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting final design approval form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteThankYouPreSurgeryForm = async () => {
    if (!thankYouPreSurgeryFormToDelete) return;

    try {
      const { error } = await deleteThankYouPreSurgeryForm(thankYouPreSurgeryFormToDelete.id);

      if (error) {
        console.error('Error deleting thank you pre-surgery form:', error);
        toast({
          title: "Error",
          description: "Failed to delete thank you pre-surgery form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setThankYouPreSurgeryForms(prev => prev.filter(form => form.id !== thankYouPreSurgeryFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteThankYouPreSurgeryFormConfirm(false);
      setThankYouPreSurgeryFormToDelete(null);

      toast({
        title: "Success",
        description: "Thank you pre-surgery form deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting thank you pre-surgery form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the form.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteThreeYearCarePackageForm = async () => {
    if (!threeYearCarePackageFormToDelete) return;

    try {
      const { error } = await deleteThreeYearCarePackageForm(threeYearCarePackageFormToDelete.id!);

      if (error) {
        console.error('Error deleting 3-Year Care Package form:', error);
        toast({
          title: "Error",
          description: "Failed to delete 3-Year Care Package form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setThreeYearCarePackageForms(prev => prev.filter(form => form.id !== threeYearCarePackageFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteThreeYearCarePackageFormConfirm(false);
      setThreeYearCarePackageFormToDelete(null);

      toast({
        title: "Success",
        description: "3-Year Care Package form deleted successfully!",
      });

      console.log('✅ Deleted 3-Year Care Package form:', threeYearCarePackageFormToDelete.id);
    } catch (error) {
      console.error('Unexpected error deleting 3-Year Care Package form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFiveYearWarrantyForm = async () => {
    if (!fiveYearWarrantyFormToDelete) return;

    try {
      await fiveYearWarrantyService.deleteForm(fiveYearWarrantyFormToDelete.id!);

      // Remove from local state
      setFiveYearWarrantyForms(prev => prev.filter(form => form.id !== fiveYearWarrantyFormToDelete.id));

      // Close confirmation dialog
      setShowDeleteFiveYearWarrantyFormConfirm(false);
      setFiveYearWarrantyFormToDelete(null);

      toast({
        title: "Success",
        description: "5-Year Extended Warranty form deleted successfully!",
      });

      console.log('✅ Deleted 5-Year Warranty form:', fiveYearWarrantyFormToDelete.id);
    } catch (error) {
      console.error('Unexpected error deleting 5-Year Warranty form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFinancialAgreement = async () => {
    if (!financialAgreementToDelete) return;

    try {
      const { error } = await deleteFinancialAgreement(financialAgreementToDelete.id);

      if (error) {
        console.error('Error deleting financial agreement:', error);
        toast({
          title: "Error",
          description: "Failed to delete financial agreement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setFinancialAgreements(prev => prev.filter(agreement => agreement.id !== financialAgreementToDelete.id));

      // Close confirmation dialog
      setShowDeleteFinancialAgreementConfirm(false);
      setFinancialAgreementToDelete(null);

      toast({
        title: "Success",
        description: "Financial agreement deleted successfully!",
      });
    } catch (error) {
      console.error('Unexpected error deleting financial agreement:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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

  // Patient Packet Handlers
  const handleEditPatientPacket = async (packet: any) => {
    try {
      // Convert database format to form format
      const formData = convertDatabaseToFormData(packet);
      setEditingPatientPacket(formData);
      setIsEditingPatientPacket(true);
      setCurrentPatientPacketId(packet.id); // Set the current packet ID for auto-save
      setShowNewPatientPacketForm(true);
    } catch (error) {
      console.error('Error preparing packet for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load patient packet for editing",
        variant: "destructive",
      });
    }
  };

  const handleViewPatientPacket = (packet: any) => {
    // Store the selected packet and show preview
    setSelectedPatientPacketForPreview(packet);
    setShowNewPatientPacketPreview(true);
  };

  const handleViewFinancialAgreement = (agreement: any) => {
    // Store the selected agreement and show preview
    setSelectedFinancialAgreementForPreview(agreement);
    setShowFinancialAgreementPreview(true);
  };

  const handleDeletePatientPacket = (packet: any) => {
    setPacketToDelete(packet);
    setShowDeletePacketConfirm(true);
  };

  const confirmDeletePatientPacket = async () => {
    if (!packetToDelete) return;

    try {
      const { success, error } = await deletePatientPacket(packetToDelete.id);

      if (!success) {
        console.error('Error deleting patient packet:', error);
        toast({
          title: "Error",
          description: "Failed to delete patient packet",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setPatientPackets(prev => prev.filter(p => p.id !== packetToDelete.id));

      toast({
        title: "Success",
        description: "Patient packet deleted successfully!",
      });

      // Close dialog and reset state
      setShowDeletePacketConfirm(false);
      setPacketToDelete(null);
    } catch (error) {
      console.error('Unexpected error deleting patient packet:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient packet",
        variant: "destructive",
      });
    }
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
    setEditingTreatment(null);
    setIsEditingTreatment(false);
    setShowTreatmentDialog(true);
  };

  const handleEditTreatment = (treatmentType: 'upper' | 'lower') => {
    // Check if both treatments exist
    const hasUpper = patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT";
    const hasLower = patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT";

    // Determine arch type based on what treatments exist
    let archType: string;
    if (hasUpper && hasLower) {
      archType = 'dual'; // Both treatments exist, show dual arch
    } else if (hasUpper) {
      archType = 'upper'; // Only upper treatment exists
    } else if (hasLower) {
      archType = 'lower'; // Only lower treatment exists
    } else {
      archType = treatmentType; // Fallback to the clicked treatment type
    }

    const treatmentData = {
      archType: archType,
      upperTreatment: hasUpper ? patient.upper_treatment || '' : '',
      lowerTreatment: hasLower ? patient.lower_treatment || '' : '',
      upperSurgeryDate: hasUpper ? patient.upper_surgery_date || '' : '',
      lowerSurgeryDate: hasLower ? patient.lower_surgery_date || '' : ''
    };

    console.log('Editing treatment data:', treatmentData); // Debug log

    setEditingTreatment(treatmentData);
    setIsEditingTreatment(true);
    setShowTreatmentDialog(true);
  };

  const handleDeleteTreatment = (treatmentType: 'upper' | 'lower') => {
    setTreatmentToDelete({ type: treatmentType });
    setShowDeleteTreatmentConfirmation(true);
  };

  const confirmDeleteTreatment = async () => {
    if (!treatmentToDelete || !patient) return;

    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (treatmentToDelete.type === 'upper') {
        updateData.upper_treatment = null;
        updateData.upper_surgery_date = null;
      } else if (treatmentToDelete.type === 'lower') {
        updateData.lower_treatment = null;
        updateData.lower_surgery_date = null;
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatient(data);
      setShowDeleteTreatmentConfirmation(false);
      setTreatmentToDelete(null);

      toast({
        title: "Success",
        description: `${treatmentToDelete.type.charAt(0).toUpperCase() + treatmentToDelete.type.slice(1)} arch treatment deleted successfully!`,
      });

    } catch (error) {
      console.error('Error deleting treatment:', error);
      toast({
        title: "Error",
        description: "Failed to delete treatment",
        variant: "destructive",
      });
    }
  };

  const handleTreatmentSubmit = async (treatmentData: TreatmentData) => {
    if (!patient) return;

    try {
      // Prepare update data based on arch type
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (treatmentData.archType === 'upper') {
        updateData.upper_treatment = treatmentData.upperTreatment || null;
        updateData.upper_surgery_date = treatmentData.upperSurgeryDate || null;
        // Clear lower treatment if switching from dual to upper only during edit
        if (isEditingTreatment) {
          updateData.lower_treatment = null;
          updateData.lower_surgery_date = null;
        }
      } else if (treatmentData.archType === 'lower') {
        updateData.lower_treatment = treatmentData.lowerTreatment || null;
        updateData.lower_surgery_date = treatmentData.lowerSurgeryDate || null;
        // Clear upper treatment if switching from dual to lower only during edit
        if (isEditingTreatment) {
          updateData.upper_treatment = null;
          updateData.upper_surgery_date = null;
        }
      } else if (treatmentData.archType === 'dual') {
        updateData.upper_treatment = treatmentData.upperTreatment || null;
        updateData.lower_treatment = treatmentData.lowerTreatment || null;
        updateData.upper_surgery_date = treatmentData.upperSurgeryDate || null;
        updateData.lower_surgery_date = treatmentData.lowerSurgeryDate || null;
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatient(data);
      setShowTreatmentDialog(false);
      setEditingTreatment(null);
      setIsEditingTreatment(false);

      toast({
        title: "Success",
        description: isEditingTreatment ? "Treatment information updated successfully!" : "Treatment information added successfully!",
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
    setEditingTreatment(null);
    setIsEditingTreatment(false);
  };

  // IV Sedation Form Handlers
  const handleIVSedationFormOpen = () => {
    // Pre-fill patient name from current patient data
    setIVSedationFormData({
      patientName: patient ? `${patient.first_name} ${patient.last_name}` : "",
      date: new Date().toISOString().split('T')[0], // Reset to current date each time
      upperTreatment: "",
      lowerTreatment: "",
      upperSurgeryType: "",
      lowerSurgeryType: "",
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
      sedationEndTime: "",
      outOfRoomTime: "",
      // Flow monitoring entries
      flowEntries: [],
      // Level of Sedation
      levelOfSedation: "",
      // Recovery Assessment fields
      alertOriented: "",
      protectiveReflexes: "",
      breathingSpontaneously: "",
      postOpNausea: "",
      caregiverPresent: "",
      baselineMentalStatus: "",
      responsiveVerbalCommands: "",
      saturatingRoomAir: "",
      vitalSignsBaseline: "",
      painDuringRecovery: "",
      postOpInstructionsGivenTo: "",
      followUpInstructionsGivenTo: "",
      dischargedTo: "",
      painLevelDischarge: "",
      otherRemarks: "",
    });
    setIVSedationCurrentStep(1); // Reset to first step
    setShowIVSedationForm(true);
  };

  const handleIVSedationFormClose = () => {
    // Check if we should show draft toast before clearing state
    const shouldShowDraftToast = currentIVSedationId && (
      (!isIVSedationEditMode) || // New form that was auto-saved
      (isIVSedationEditMode && editingIVSedationSheet?.status === 'draft') // Editing a draft
    );

    // Clear form state first
    setShowIVSedationForm(false);
    setIVSedationCurrentStep(1);
    setIsIVSedationEditMode(false);
    setEditingIVSedationSheet(null);
    setCurrentIVSedationId(null);
    setAutoSaveStatus('idle');
    setAutoSaveMessage('');
    setLastSavedTime('');

    // Show draft toast if applicable (after clearing state)
    if (shouldShowDraftToast) {
      setIVSedationFormMessage({
        type: 'info',
        text: 'Form saved as draft. Complete the form fully by using "Review and Submit" to finalize it.'
      });
      setShowIVSedationToast(true);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowIVSedationToast(false);
        setIVSedationFormMessage({ type: null, text: '' });
      }, 5000);
    } else {
      // Clear toast immediately if no draft toast needed
      setIVSedationFormMessage({ type: null, text: '' });
      setShowIVSedationToast(false);
    }
  };

  // Auto-save function for IV sedation form
  const autoSaveIVSedationForm = async (fieldUpdates: Partial<typeof ivSedationFormData>) => {
    if (!patientId) return;

    setAutoSaveStatus('saving');
    setAutoSaveMessage('Saving...');
    setLastSavedTime(''); // Clear previous timestamp when starting new save

    try {
      // Create a minimal data object with only the essential fields
      const baseData = {
        patient_id: patientId,
        patient_name: ivSedationFormData.patientName || `Patient ${patientId.slice(0, 8)}`,
        sedation_date: ivSedationFormData.date || new Date().toISOString().split('T')[0],
        status: 'draft', // Always save as draft during auto-save
      };

      // Add only the fields that are being updated or have values
      const updateData: any = { ...baseData };

      // Only add fields that are actually being updated to avoid sending unnecessary data
      Object.keys(fieldUpdates).forEach(key => {
        const value = fieldUpdates[key as keyof typeof fieldUpdates];

        switch (key) {
          // Step 1 fields
          case 'upperTreatment':
            updateData.upper_treatment = value;
            break;
          case 'lowerTreatment':
            updateData.lower_treatment = value;
            break;
          case 'upperSurgeryType':
            updateData.upper_surgery_type = value;
            break;
          case 'lowerSurgeryType':
            updateData.lower_surgery_type = value;
            break;
          case 'heightFeet':
            updateData.height_feet = value ? parseInt(value as string) : null;
            break;
          case 'heightInches':
            updateData.height_inches = value ? parseInt(value as string) : null;
            break;
          case 'weight':
            updateData.weight = value ? parseInt(value as string) : null;
            break;
          case 'date':
            updateData.sedation_date = value;
            break;

          // Step 2 fields - NPO Status
          case 'npoStatus':
            updateData.npo_status = value;
            break;
          case 'morningMedications':
            updateData.morning_medications = value;
            break;

          // Step 2 fields - Allergies
          case 'allergies':
            updateData.allergies = Array.isArray(value) ? value : [];
            break;
          case 'allergiesOther':
            updateData.allergies_other = value;
            break;

          // Step 2 fields - Female-specific
          case 'pregnancyRisk':
            updateData.pregnancy_risk = value;
            break;
          case 'lastMenstrualCycle':
            updateData.last_menstrual_cycle = value || null; // Send null if empty
            break;

          // Step 2 fields - Anesthesia History (database expects array)
          case 'anesthesiaHistory':
            updateData.anesthesia_history = value ? [value] : [];
            break;
          case 'anesthesiaHistoryOther':
            updateData.anesthesia_history_other = value;
            break;

          // Step 2 fields - Medical Problems
          case 'respiratoryProblems':
            updateData.respiratory_problems = Array.isArray(value) ? value : [];
            break;
          case 'respiratoryProblemsOther':
            updateData.respiratory_problems_other = value;
            break;
          case 'cardiovascularProblems':
            updateData.cardiovascular_problems = Array.isArray(value) ? value : [];
            break;
          case 'cardiovascularProblemsOther':
            updateData.cardiovascular_problems_other = value;
            break;
          case 'gastrointestinalProblems':
            updateData.gastrointestinal_problems = Array.isArray(value) ? value : [];
            break;
          case 'gastrointestinalProblemsOther':
            updateData.gastrointestinal_problems_other = value;
            break;
          case 'neurologicProblems':
            updateData.neurologic_problems = Array.isArray(value) ? value : [];
            break;
          case 'neurologicProblemsOther':
            updateData.neurologic_problems_other = value;
            break;
          case 'endocrineRenalProblems':
            updateData.endocrine_renal_problems = Array.isArray(value) ? value : [];
            break;
          case 'endocrineRenalProblemsOther':
            updateData.endocrine_renal_problems_other = value;
            break;
          case 'lastA1CLevel':
            updateData.last_a1c_level = value;
            break;

          // Step 2 fields - Miscellaneous
          case 'miscellaneous':
            updateData.miscellaneous = Array.isArray(value) ? value : [];
            break;
          case 'miscellaneousOther':
            updateData.miscellaneous_other = value;
            break;

          // Step 2 fields - Social History
          case 'socialHistory':
            updateData.social_history = Array.isArray(value) ? value : [];
            break;
          case 'socialHistoryOther':
            updateData.social_history_other = value;
            break;

          // Step 2 fields - Patient Assessment
          case 'wellDevelopedNourished':
            updateData.well_developed_nourished = value;
            break;
          case 'patientAnxious':
            updateData.patient_anxious = value;
            break;

          // Step 2 fields - ASA Classification
          case 'asaClassification':
            console.log('Auto-saving ASA Classification:', value);
            updateData.asa_classification = value;
            break;

          // Step 2 fields - Airway Evaluation
          case 'airwayEvaluation':
            console.log('Auto-saving Airway Evaluation:', value);
            updateData.airway_evaluation = Array.isArray(value) ? value : [];
            break;
          case 'airwayEvaluationOther':
            console.log('Auto-saving Airway Evaluation Other:', value);
            updateData.airway_evaluation_other = value;
            break;

          // Step 2 fields - Mallampati Score
          case 'mallampatiScore':
            console.log('Auto-saving Mallampati Score:', value);
            updateData.mallampati_score = value;
            break;

          // Step 2 fields - Heart and Lung Evaluation
          case 'heartLungEvaluation':
            console.log('Auto-saving Heart Lung Evaluation:', value);
            updateData.heart_lung_evaluation = Array.isArray(value) ? value : [];
            break;
          case 'heartLungEvaluationOther':
            console.log('Auto-saving Heart Lung Evaluation Other:', value);
            updateData.heart_lung_evaluation_other = value;
            break;

          // Step 3 fields - Instruments Checklist
          case 'instrumentsChecklist':
            console.log('Auto-saving Instruments Checklist:', value);
            updateData.instruments_checklist = Array.isArray(value) ? value : [];
            break;

          // Step 3 fields - Sedation Type
          case 'sedationType':
            console.log('Auto-saving Sedation Type:', value);
            updateData.sedation_type = value;
            break;

          // Step 3 fields - Medications Planned
          case 'medicationsPlanned':
            console.log('Auto-saving Medications Planned:', value);
            updateData.medications_planned = Array.isArray(value) ? value : [];
            break;
          case 'medicationsOther':
            console.log('Auto-saving Medications Other:', value);
            updateData.medications_other = value;
            break;

          // Step 3 fields - Route of Administration
          case 'administrationRoute':
            console.log('Auto-saving Administration Route:', value);
            updateData.administration_route = Array.isArray(value) ? value : [];
            break;

          // Step 3 fields - Emergency Protocols
          case 'emergencyProtocols':
            console.log('Auto-saving Emergency Protocols:', value);
            updateData.emergency_protocols = Array.isArray(value) ? value : [];
            break;

          // Step 4 fields - Time Tracking
          case 'timeInRoom':
            console.log('Auto-saving Time in Room:', value);
            updateData.time_in_room = value;
            break;
          case 'sedationStartTime':
            console.log('Auto-saving Sedation Start Time:', value);
            updateData.sedation_start_time = value;
            break;
          case 'sedationEndTime':
            console.log('Auto-saving Sedation End Time:', value);
            updateData.sedation_end_time = value;
            break;
          case 'outOfRoomTime':
            console.log('Auto-saving Out of Room Time:', value);
            updateData.out_of_room_time = value;
            break;

          // Step 4 fields - Flow Entries
          case 'flowEntries':
            console.log('Auto-saving Flow Entries:', value);
            updateData.flow_entries = Array.isArray(value) ? value : [];
            break;

          // Step 4 fields - Level of Sedation
          case 'levelOfSedation':
            console.log('Auto-saving Level of Sedation:', value);
            updateData.level_of_sedation = value;
            break;

          // Step 5 fields - Recovery Assessment (YES/NO fields)
          case 'alertOriented':
            console.log('Auto-saving Alert Oriented:', value);
            updateData.alert_oriented = value;
            break;
          case 'protectiveReflexes':
            console.log('Auto-saving Protective Reflexes:', value);
            updateData.protective_reflexes = value;
            break;
          case 'breathingSpontaneously':
            console.log('Auto-saving Breathing Spontaneously:', value);
            updateData.breathing_spontaneously = value;
            break;
          case 'postOpNausea':
            console.log('Auto-saving Post-Op Nausea:', value);
            updateData.post_op_nausea = value;
            break;
          case 'caregiverPresent':
            console.log('Auto-saving Caregiver Present:', value);
            updateData.caregiver_present = value;
            break;
          case 'baselineMentalStatus':
            console.log('Auto-saving Baseline Mental Status:', value);
            updateData.baseline_mental_status = value;
            break;
          case 'responsiveVerbalCommands':
            console.log('Auto-saving Responsive Verbal Commands:', value);
            updateData.responsive_verbal_commands = value;
            break;
          case 'saturatingRoomAir':
            console.log('Auto-saving Saturating Room Air:', value);
            updateData.saturating_room_air = value;
            break;
          case 'vitalSignsBaseline':
            console.log('Auto-saving Vital Signs Baseline:', value);
            updateData.vital_signs_baseline = value;
            break;
          case 'painDuringRecovery':
            console.log('Auto-saving Pain During Recovery:', value);
            updateData.pain_during_recovery = value;
            break;

          // Step 5 fields - Instructions and Discharge
          case 'postOpInstructionsGivenTo':
            console.log('Auto-saving Post-Op Instructions Given To:', value);
            updateData.post_op_instructions_given_to = value;
            break;
          case 'followUpInstructionsGivenTo':
            console.log('Auto-saving Follow-Up Instructions Given To:', value);
            updateData.follow_up_instructions_given_to = value;
            break;
          case 'dischargedTo':
            console.log('Auto-saving Discharged To:', value);
            updateData.discharged_to = value;
            break;
          case 'painLevelDischarge':
            console.log('Auto-saving Pain Level Discharge:', value);
            updateData.pain_level_discharge = value;
            break;
          case 'otherRemarks':
            console.log('Auto-saving Other Remarks:', value);
            updateData.other_remarks = value;
            break;

          default:
            // Log unknown fields for debugging
            console.warn('Unknown field in auto-save:', key, value);
            break;
        }
      });

      console.log('Auto-save data:', updateData);
      console.log('Field updates:', fieldUpdates);
      console.log('Current IV sedation form data:', ivSedationFormData);
      console.log('Current IV sedation ID:', currentIVSedationId);

      let data, error;

      if (currentIVSedationId) {
        // Update existing record
        const result = await (supabase as any)
          .from('iv_sedation_forms')
          .update(updateData)
          .eq('id', currentIVSedationId)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Create new record
        const result = await (supabase as any)
          .from('iv_sedation_forms')
          .insert([updateData])
          .select()
          .single();

        data = result.data;
        error = result.error;

        if (data && !error) {
          setCurrentIVSedationId(data.id);
          setIsIVSedationEditMode(true);
          setEditingIVSedationSheet(data);
          // Add to local state if it's a new record
          setIVSedationSheets(prev => {
            const exists = prev.some(sheet => sheet.id === data.id);
            return exists ? prev.map(sheet => sheet.id === data.id ? data : sheet) : [data, ...prev];
          });
        }
      }

      if (error) {
        console.error('Auto-save error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error('Failed update data:', updateData);
        setAutoSaveStatus('error');
        setAutoSaveMessage('Failed to save');
        setTimeout(() => {
          setAutoSaveStatus('idle');
          setAutoSaveMessage('');
          // Don't clear lastSavedTime on error - keep previous successful save time
        }, 3000);
        return;
      }

      // Update local state
      if (currentIVSedationId) {
        setIVSedationSheets(prev =>
          prev.map(sheet =>
            sheet.id === currentIVSedationId ? data : sheet
          )
        );
      }

      setAutoSaveStatus('saved');
      setAutoSaveMessage('Saved');

      // Set the saved timestamp
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastSavedTime(timeString);

      // Keep the saved status visible until next save (don't auto-clear)
      // The status will be cleared when the next save operation starts

    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setAutoSaveMessage('Failed to save');
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage('');
        // Don't clear lastSavedTime on error - keep previous successful save time
      }, 3000);
    }
  };

  // Helper function to update form data and trigger auto-save
  const updateIVSedationFormField = (fieldName: keyof typeof ivSedationFormData, value: any) => {
    let updates = { [fieldName]: value };

    // Special handling for treatment type changes - reset surgery type
    if (fieldName === 'upperTreatment') {
      updates = { ...updates, upperSurgeryType: "" };
    }
    if (fieldName === 'lowerTreatment') {
      updates = { ...updates, lowerSurgeryType: "" };
    }

    // Update local form state
    setIVSedationFormData(prev => ({
      ...prev,
      ...updates
    }));

    // Trigger auto-save
    autoSaveIVSedationForm(updates);
  };

  // Auto-save function for Patient Packet form
  const autoSavePatientPacket = async (formData: any) => {
    if (!patientId) return;

    setPatientPacketAutoSaveStatus('saving');
    setPatientPacketAutoSaveMessage('Saving...');
    setPatientPacketLastSavedTime(''); // Clear previous timestamp when starting new save

    try {
      // Convert form data to database format
      const dbData = convertFormDataToDatabase(
        formData,
        patientId,
        undefined,
        'internal'
      );

      // Always save as draft during auto-save
      dbData.form_status = 'draft';

      console.log('Auto-save data:', {
        first_name: dbData.first_name,
        last_name: dbData.last_name,
        email: dbData.email,
        patient_id: dbData.patient_id,
        form_status: dbData.form_status,
        currentPacketId: currentPatientPacketId
      });

      let data, error;

      if (currentPatientPacketId) {
        // Update existing record
        const result = await supabase
          .from('new_patient_packets')
          .update(dbData)
          .eq('id', currentPatientPacketId)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Create new record
        const result = await supabase
          .from('new_patient_packets')
          .insert([dbData])
          .select()
          .single();

        data = result.data;
        error = result.error;

        if (data && !error) {
          setCurrentPatientPacketId(data.id);
          setIsEditingPatientPacket(true);
          // Add to local state if it's a new record
          setPatientPackets(prev => {
            const exists = prev.some(packet => packet.id === data.id);
            return exists ? prev.map(packet => packet.id === data.id ? data : packet) : [data, ...prev];
          });
        }
      }

      if (error) {
        console.error('Patient packet auto-save error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setPatientPacketAutoSaveStatus('error');
        setPatientPacketAutoSaveMessage('Failed to save');
        setTimeout(() => {
          setPatientPacketAutoSaveStatus('idle');
          setPatientPacketAutoSaveMessage('');
        }, 3000);
        return;
      }

      // Update local state
      if (currentPatientPacketId) {
        setPatientPackets(prev =>
          prev.map(packet =>
            packet.id === currentPatientPacketId ? data : packet
          )
        );
      }

      setPatientPacketAutoSaveStatus('saved');
      setPatientPacketAutoSaveMessage('Saved');

      // Set the saved timestamp
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setPatientPacketLastSavedTime(timeString);

    } catch (error) {
      console.error('Patient packet auto-save error:', error);
      setPatientPacketAutoSaveStatus('error');
      setPatientPacketAutoSaveMessage('Failed to save');
      setTimeout(() => {
        setPatientPacketAutoSaveStatus('idle');
        setPatientPacketAutoSaveMessage('');
      }, 3000);
    }
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
        fracturedAppliancePictures: sheet.fractured_appliance_pictures,
        // CBCT option
        cbctTaken: sheet.cbct_taken
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



  // Helper function to reset form position to top immediately
  const resetFormToTop = () => {
    // Reset scroll position immediately without any delay or animation
    const formElement = document.querySelector('[data-form-container]');
    if (formElement) {
      formElement.scrollTop = 0;
    } else {
      // Fallback: reset dialog content or window
      const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
      if (dialogContent) {
        dialogContent.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      resetFormToTop(); // Reset to top immediately before step change
      setCurrentStep(currentStep + 1);
      setFormMessage({ type: null, text: '' }); // Clear messages when moving to next step
      setShowToast(false); // Clear toast when moving to next step
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      resetFormToTop(); // Reset to top immediately before step change
      setCurrentStep(currentStep - 1);
      setFormMessage({ type: null, text: '' }); // Clear messages when moving to previous step
      setShowToast(false); // Clear toast when moving to previous step
    }
  };

  // IV Sedation Step Navigation
  const handleIVSedationNextStep = () => {
    // Validate current step before proceeding
    const validationErrors = validateIVSedationStep(ivSedationCurrentStep);

    if (validationErrors.length > 0) {
      setIVSedationFormMessage({
        type: 'error',
        text: `Please complete the following required fields: ${validationErrors.join(', ')}`
      });
      setShowIVSedationToast(true);
      setTimeout(() => setShowIVSedationToast(false), 5000);
      return;
    }

    if (ivSedationCurrentStep < ivSedationTotalSteps) {
      resetFormToTop(); // Reset to top immediately before step change
      setIVSedationCurrentStep(ivSedationCurrentStep + 1);
      setIVSedationFormMessage({ type: null, text: '' }); // Clear messages when moving to next step
      setShowIVSedationToast(false); // Clear toast when moving to next step
    } else {
      // Final step - open review dialog
      handleReviewAndSubmit();
    }
  };

  // Validation function for IV Sedation steps
  const validateIVSedationStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Step 1: Basic Information
        if (!ivSedationFormData.date) errors.push('Date');
        if (!ivSedationFormData.upperTreatment) errors.push('Upper Treatment Type');
        if (!ivSedationFormData.lowerTreatment) errors.push('Lower Treatment Type');
        if (!ivSedationFormData.heightFeet) errors.push('Height (Feet)');
        if (!ivSedationFormData.heightInches) errors.push('Height (Inches)');
        if (!ivSedationFormData.weight) errors.push('Weight');
        break;

      case 2: // Step 2: Pre-Assessment
        if (!ivSedationFormData.npoStatus) errors.push('NPO Status');
        // Morning medications validation
        if (!ivSedationFormData.morningMedications ||
            (ivSedationFormData.morningMedications !== 'no' &&
             ivSedationFormData.morningMedications === 'yes')) {
          errors.push('Morning Medications (please specify medications if Yes is selected)');
        }
        if (!ivSedationFormData.allergies || ivSedationFormData.allergies.length === 0) errors.push('Allergies');
        // Female Patients Only section is optional - removed from required validation
        if (!ivSedationFormData.anesthesiaHistory) errors.push('Anesthesia History');
        if (!ivSedationFormData.respiratoryProblems || ivSedationFormData.respiratoryProblems.length === 0) errors.push('Respiratory Problems');
        if (!ivSedationFormData.cardiovascularProblems || ivSedationFormData.cardiovascularProblems.length === 0) errors.push('Cardiovascular Problems');
        if (!ivSedationFormData.gastrointestinalProblems || ivSedationFormData.gastrointestinalProblems.length === 0) errors.push('Gastrointestinal Problems');
        if (!ivSedationFormData.neurologicProblems || ivSedationFormData.neurologicProblems.length === 0) errors.push('Neurologic Problems');
        if (!ivSedationFormData.endocrineRenalProblems || ivSedationFormData.endocrineRenalProblems.length === 0) errors.push('Endocrine/Renal Problems');
        // A1C Level is required only if Diabetes is selected
        if (ivSedationFormData.endocrineRenalProblems?.includes('Diabetes') && (!ivSedationFormData.lastA1CLevel || ivSedationFormData.lastA1CLevel.trim().length === 0)) {
          errors.push('Last A1C Level (required when Diabetes is selected)');
        }
        if (!ivSedationFormData.miscellaneous || ivSedationFormData.miscellaneous.length === 0) errors.push('Miscellaneous');
        if (!ivSedationFormData.socialHistory || ivSedationFormData.socialHistory.length === 0) errors.push('Social History');
        if (!ivSedationFormData.wellDevelopedNourished) errors.push('Patient Assessment');
        if (!ivSedationFormData.asaClassification) errors.push('ASA Classification');
        if (!ivSedationFormData.airwayEvaluation || ivSedationFormData.airwayEvaluation.length === 0) errors.push('Airway Evaluation');
        if (!ivSedationFormData.mallampatiScore) errors.push('Mallampati Score');
        if (!ivSedationFormData.heartLungEvaluation || ivSedationFormData.heartLungEvaluation.length === 0) errors.push('Heart and Lung Evaluation');
        break;

      case 3: // Step 3: Sedation Plan
        if (!ivSedationFormData.instrumentsChecklist || ivSedationFormData.instrumentsChecklist.length === 0) errors.push('Instruments Checklist');
        if (!ivSedationFormData.sedationType) errors.push('Sedation Type');
        if (!ivSedationFormData.medicationsPlanned || ivSedationFormData.medicationsPlanned.length === 0) errors.push('Medications Planned');
        if (!ivSedationFormData.administrationRoute || ivSedationFormData.administrationRoute.length === 0) errors.push('Route of Administration');
        if (!ivSedationFormData.emergencyProtocols || ivSedationFormData.emergencyProtocols.length === 0) errors.push('Emergency Protocols');
        break;

      case 4: // Step 4: Monitoring During Surgery
        if (!ivSedationFormData.timeInRoom) errors.push('Time in Room');
        if (!ivSedationFormData.sedationStartTime) errors.push('Sedation Start Time');
        if (!ivSedationFormData.flowEntries || ivSedationFormData.flowEntries.length === 0) errors.push('Monitoring Log (at least one entry)');
        if (!ivSedationFormData.sedationEndTime) errors.push('Sedation End Time');
        if (!ivSedationFormData.outOfRoomTime) errors.push('Out of Room Time');
        break;

      case 5: // Step 5: Recovery Assessment
        if (!ivSedationFormData.alertOriented) errors.push('Alert and Oriented');
        if (!ivSedationFormData.protectiveReflexes) errors.push('Protective Reflexes Intact');
        if (!ivSedationFormData.breathingSpontaneously) errors.push('Breathing Spontaneously');
        if (!ivSedationFormData.postOpNausea) errors.push('Post-Op Nausea/Vomiting');
        if (!ivSedationFormData.caregiverPresent) errors.push('Patient Caregiver Present');
        if (!ivSedationFormData.baselineMentalStatus) errors.push('Return To Baseline Mental Status');
        if (!ivSedationFormData.responsiveVerbalCommands) errors.push('Responsive To Verbal Commands');
        if (!ivSedationFormData.saturatingRoomAir) errors.push('Saturating Appropriately on Room Air');
        if (!ivSedationFormData.vitalSignsBaseline) errors.push('Vital Signs Returned to Baseline');
        if (!ivSedationFormData.painDuringRecovery) errors.push('Pain During Recovery');
        if (!ivSedationFormData.postOpInstructionsGivenTo) errors.push('Post-Op Instructions Given To');
        if (!ivSedationFormData.followUpInstructionsGivenTo) errors.push('Follow Up Instructions Given To');
        if (!ivSedationFormData.dischargedTo) errors.push('Discharged To');
        if (!ivSedationFormData.painLevelDischarge) errors.push('Level of Pain At Discharge');
        if (!ivSedationFormData.otherRemarks) errors.push('Other Remarks');
        break;
    }

    return errors;
  };

  // Open review dialog and close the form
  const handleReviewAndSubmit = () => {
    setShowIVSedationForm(false); // Close the form first
    setShowIVSedationSummary(true); // Then open the review dialog
  };

  // Handle edit from summary dialog
  const handleEditFromSummary = () => {
    setShowIVSedationSummary(false); // Close summary dialog
    setShowIVSedationForm(true); // Reopen the form for editing
  };

  // Show IV Sedation form summary for review
  const handleSubmitIVSedationForm = () => {
    // Show the summary dialog instead of directly submitting
    setShowIVSedationSummary(true);
  };

  // Final submission
  const handleFinalIVSedationSubmit = async () => {
    console.log('Starting IV sedation form submission...');
    console.log('Form data:', ivSedationFormData);

    try {
      // Validate required fields
      if (!ivSedationFormData.date || ivSedationFormData.date.trim() === '') {
        setIVSedationFormMessage({
          type: 'error',
          text: 'Please select a sedation date before submitting the form.'
        });
        setShowIVSedationToast(true);
        setTimeout(() => setShowIVSedationToast(false), 5000);
        return;
      }

      const ivSedationData = {
        patient_id: patientId,
        patient_name: ivSedationFormData.patientName || `Patient ${patientId.slice(0, 8)}`,
        sedation_date: ivSedationFormData.date || new Date().toISOString().split('T')[0],
        upper_treatment: ivSedationFormData.upperTreatment,
        lower_treatment: ivSedationFormData.lowerTreatment,
        upper_surgery_type: ivSedationFormData.upperSurgeryType,
        lower_surgery_type: ivSedationFormData.lowerSurgeryType,
        height_feet: ivSedationFormData.heightFeet ? parseInt(ivSedationFormData.heightFeet) : null,
        height_inches: ivSedationFormData.heightInches ? parseInt(ivSedationFormData.heightInches) : null,
        weight: ivSedationFormData.weight ? parseInt(ivSedationFormData.weight) : null,

        // Pre-Assessment fields
        npo_status: ivSedationFormData.npoStatus,
        morning_medications: ivSedationFormData.morningMedications,
        allergies: Array.isArray(ivSedationFormData.allergies) ? ivSedationFormData.allergies : [],
        allergies_other: ivSedationFormData.allergiesOther,
        pregnancy_risk: ivSedationFormData.pregnancyRisk,
        last_menstrual_cycle: ivSedationFormData.lastMenstrualCycle || null, // Send null if empty
        anesthesia_history: ivSedationFormData.anesthesiaHistory ? [ivSedationFormData.anesthesiaHistory] : [],
        anesthesia_history_other: ivSedationFormData.anesthesiaHistoryOther,
        respiratory_problems: Array.isArray(ivSedationFormData.respiratoryProblems) ? ivSedationFormData.respiratoryProblems : [],
        respiratory_problems_other: ivSedationFormData.respiratoryProblemsOther,
        cardiovascular_problems: Array.isArray(ivSedationFormData.cardiovascularProblems) ? ivSedationFormData.cardiovascularProblems : [],
        cardiovascular_problems_other: ivSedationFormData.cardiovascularProblemsOther,
        gastrointestinal_problems: Array.isArray(ivSedationFormData.gastrointestinalProblems) ? ivSedationFormData.gastrointestinalProblems : [],
        gastrointestinal_problems_other: ivSedationFormData.gastrointestinalProblemsOther,
        neurologic_problems: Array.isArray(ivSedationFormData.neurologicProblems) ? ivSedationFormData.neurologicProblems : [],
        neurologic_problems_other: ivSedationFormData.neurologicProblemsOther,
        endocrine_renal_problems: Array.isArray(ivSedationFormData.endocrineRenalProblems) ? ivSedationFormData.endocrineRenalProblems : [],
        endocrine_renal_problems_other: ivSedationFormData.endocrineRenalProblemsOther,
        last_a1c_level: ivSedationFormData.lastA1CLevel,
        miscellaneous: Array.isArray(ivSedationFormData.miscellaneous) ? ivSedationFormData.miscellaneous : [],
        miscellaneous_other: ivSedationFormData.miscellaneousOther,
        social_history: Array.isArray(ivSedationFormData.socialHistory) ? ivSedationFormData.socialHistory : [],
        social_history_other: ivSedationFormData.socialHistoryOther,

        // Additional Assessment fields
        well_developed_nourished: ivSedationFormData.wellDevelopedNourished,
        patient_anxious: ivSedationFormData.patientAnxious,
        asa_classification: ivSedationFormData.asaClassification,
        airway_evaluation: Array.isArray(ivSedationFormData.airwayEvaluation) ? ivSedationFormData.airwayEvaluation : [],
        airway_evaluation_other: ivSedationFormData.airwayEvaluationOther,
        mallampati_score: ivSedationFormData.mallampatiScore,
        heart_lung_evaluation: Array.isArray(ivSedationFormData.heartLungEvaluation) ? ivSedationFormData.heartLungEvaluation : [],
        heart_lung_evaluation_other: ivSedationFormData.heartLungEvaluationOther,

        // Sedation Plan fields
        instruments_checklist: Array.isArray(ivSedationFormData.instrumentsChecklist) ? ivSedationFormData.instrumentsChecklist : [],
        sedation_type: ivSedationFormData.sedationType,
        medications_planned: Array.isArray(ivSedationFormData.medicationsPlanned) ? ivSedationFormData.medicationsPlanned : [],
        medications_other: ivSedationFormData.medicationsOther,
        administration_route: ivSedationFormData.administrationRoute,
        emergency_protocols: Array.isArray(ivSedationFormData.emergencyProtocols) ? ivSedationFormData.emergencyProtocols : [],

        // IV Sedation Flow Chart fields
        time_in_room: ivSedationFormData.timeInRoom,
        sedation_start_time: ivSedationFormData.sedationStartTime,
        sedation_end_time: ivSedationFormData.sedationEndTime,
        out_of_room_time: ivSedationFormData.outOfRoomTime,
        flow_entries: ivSedationFormData.flowEntries || [],
        level_of_sedation: ivSedationFormData.levelOfSedation,

        // Recovery Assessment fields
        alert_oriented: ivSedationFormData.alertOriented,
        protective_reflexes: ivSedationFormData.protectiveReflexes,
        breathing_spontaneously: ivSedationFormData.breathingSpontaneously,
        post_op_nausea: ivSedationFormData.postOpNausea,
        caregiver_present: ivSedationFormData.caregiverPresent,
        baseline_mental_status: ivSedationFormData.baselineMentalStatus,
        responsive_verbal_commands: ivSedationFormData.responsiveVerbalCommands,
        saturating_room_air: ivSedationFormData.saturatingRoomAir,
        vital_signs_baseline: ivSedationFormData.vitalSignsBaseline,
        pain_during_recovery: ivSedationFormData.painDuringRecovery,
        post_op_instructions_given_to: ivSedationFormData.postOpInstructionsGivenTo,
        follow_up_instructions_given_to: ivSedationFormData.followUpInstructionsGivenTo,
        discharged_to: ivSedationFormData.dischargedTo,
        pain_level_discharge: ivSedationFormData.painLevelDischarge,
        other_remarks: ivSedationFormData.otherRemarks,
        status: 'completed', // Mark as completed when final submit is clicked
      };

      // Save to Supabase database
      console.log('Submitting to database:', ivSedationData);
      console.log('Date field specifically:', ivSedationData.sedation_date);
      console.log('Date field type:', typeof ivSedationData.sedation_date);
      console.log('Date field length:', ivSedationData.sedation_date?.length);

      let data, error;

      if (currentIVSedationId) {
        // Update existing record (either from edit mode or auto-save)
        const result = await (supabase as any)
          .from('iv_sedation_forms')
          .update(ivSedationData)
          .eq('id', currentIVSedationId)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else if (isIVSedationEditMode && editingIVSedationSheet) {
        // Update existing record using editingIVSedationSheet ID
        const result = await (supabase as any)
          .from('iv_sedation_forms')
          .update(ivSedationData)
          .eq('id', editingIVSedationSheet.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        const result = await (supabase as any)
          .from('iv_sedation_forms')
          .insert([ivSedationData])
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      console.log('Database response:', { data, error });

      if (error) {
        console.error('Error saving IV sedation form:', error);
        setIVSedationFormMessage({
          type: 'error',
          text: `Failed to ${isIVSedationEditMode ? 'update' : 'save'} IV sedation form: ${error.message}`
        });
        setShowIVSedationToast(true);
        setTimeout(() => setShowIVSedationToast(false), 5000);
        return;
      }

      // Update local state
      if (isIVSedationEditMode && editingIVSedationSheet) {
        // Update existing record in local state
        setIVSedationSheets(prev =>
          prev.map(sheet =>
            sheet.id === editingIVSedationSheet.id ? data : sheet
          )
        );
      } else {
        // Add new record to local state
        setIVSedationSheets(prev => [data, ...prev]);
      }

      // Close summary dialog immediately
      setShowIVSedationSummary(false);

      // Show success toast
      setIVSedationFormMessage({
        type: 'success',
        text: `IV Sedation form ${isIVSedationEditMode ? 'updated' : 'completed'} successfully!`
      });
      setShowIVSedationToast(true);

      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowIVSedationToast(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving IV sedation form:', error);
      setIVSedationFormMessage({
        type: 'error',
        text: 'Failed to save IV sedation form'
      });
      setShowIVSedationToast(true);
      setTimeout(() => setShowIVSedationToast(false), 5000);
    }
  };

  const handleCloseSummary = () => {
    setShowIVSedationSummary(false);
  };

  const handleIVSedationPreviousStep = () => {
    if (ivSedationCurrentStep > 1) {
      resetFormToTop(); // Reset to top immediately before step change
      setIVSedationCurrentStep(ivSedationCurrentStep - 1);
      setIVSedationFormMessage({ type: null, text: '' }); // Clear messages when moving to previous step
      setShowIVSedationToast(false); // Clear toast when moving to previous step
    }
  };

  // Helper function for IV Sedation step navigation with immediate top reset
  const handleIVSedationStepNavigation = (step: number) => {
    resetFormToTop(); // Reset to top immediately before step change
    setIVSedationCurrentStep(step);
  };

  // IV Sedation Edit and Delete Handlers
  const handleEditIVSedationSheet = (sheet: any) => {
    setEditingIVSedationSheet(sheet);
    setIsIVSedationEditMode(true);
    setCurrentIVSedationId(sheet.id);
    setAutoSaveStatus('idle');
    setAutoSaveMessage('');
    setLastSavedTime('');

    // Pre-fill form with existing data
    setIVSedationFormData({
      patientName: sheet.patient_name,
      date: sheet.sedation_date,
      upperTreatment: sheet.upper_treatment || "",
      lowerTreatment: sheet.lower_treatment || "",
      upperSurgeryType: sheet.upper_surgery_type || "",
      lowerSurgeryType: sheet.lower_surgery_type || "",
      heightFeet: sheet.height_feet?.toString() || "",
      heightInches: sheet.height_inches?.toString() || "",
      weight: sheet.weight?.toString() || "",
      // Add other fields as needed...
      npoStatus: sheet.npo_status || "",
      morningMedications: sheet.morning_medications || "",
      allergies: sheet.allergies || [],
      allergiesOther: sheet.allergies_other || "",
      pregnancyRisk: sheet.pregnancy_risk || "",
      lastMenstrualCycle: sheet.last_menstrual_cycle || "",
      anesthesiaHistory: Array.isArray(sheet.anesthesia_history) && sheet.anesthesia_history.length > 0 ? sheet.anesthesia_history[0] : "",
      anesthesiaHistoryOther: sheet.anesthesia_history_other || "",
      respiratoryProblems: sheet.respiratory_problems || [],
      respiratoryProblemsOther: sheet.respiratory_problems_other || "",
      cardiovascularProblems: sheet.cardiovascular_problems || [],
      cardiovascularProblemsOther: sheet.cardiovascular_problems_other || "",
      gastrointestinalProblems: sheet.gastrointestinal_problems || [],
      gastrointestinalProblemsOther: sheet.gastrointestinal_problems_other || "",
      neurologicProblems: sheet.neurologic_problems || [],
      neurologicProblemsOther: sheet.neurologic_problems_other || "",
      endocrineRenalProblems: sheet.endocrine_renal_problems || [],
      endocrineRenalProblemsOther: sheet.endocrine_renal_problems_other || "",
      lastA1CLevel: sheet.last_a1c_level || "",
      miscellaneous: sheet.miscellaneous || [],
      miscellaneousOther: sheet.miscellaneous_other || "",
      socialHistory: sheet.social_history || [],
      socialHistoryOther: sheet.social_history_other || "",
      wellDevelopedNourished: sheet.well_developed_nourished || "",
      patientAnxious: sheet.patient_anxious || "",
      asaClassification: sheet.asa_classification || "",
      airwayEvaluation: sheet.airway_evaluation || [],
      airwayEvaluationOther: sheet.airway_evaluation_other || "",
      mallampatiScore: sheet.mallampati_score || "",
      heartLungEvaluation: sheet.heart_lung_evaluation || [],
      heartLungEvaluationOther: sheet.heart_lung_evaluation_other || "",
      instrumentsChecklist: sheet.instruments_checklist || [],
      sedationType: sheet.sedation_type || "",
      medicationsPlanned: sheet.medications_planned || [],
      medicationsOther: sheet.medications_other || "",
      administrationRoute: sheet.administration_route || "",
      emergencyProtocols: sheet.emergency_protocols || [],
      timeInRoom: sheet.time_in_room || "",
      sedationStartTime: sheet.sedation_start_time || "",
      sedationEndTime: sheet.sedation_end_time || "",
      outOfRoomTime: sheet.out_of_room_time || "",
      flowEntries: sheet.flow_entries || [],
      levelOfSedation: sheet.level_of_sedation || "",
      alertOriented: sheet.alert_oriented || "",
      protectiveReflexes: sheet.protective_reflexes || "",
      breathingSpontaneously: sheet.breathing_spontaneously || "",
      postOpNausea: sheet.post_op_nausea || "",
      caregiverPresent: sheet.caregiver_present || "",
      baselineMentalStatus: sheet.baseline_mental_status || "",
      responsiveVerbalCommands: sheet.responsive_verbal_commands || "",
      saturatingRoomAir: sheet.saturating_room_air || "",
      vitalSignsBaseline: sheet.vital_signs_baseline || "",
      painDuringRecovery: sheet.pain_during_recovery || "",
      postOpInstructionsGivenTo: sheet.post_op_instructions_given_to || "",
      followUpInstructionsGivenTo: sheet.follow_up_instructions_given_to || "",
      dischargedTo: sheet.discharged_to || "",
      painLevelDischarge: sheet.pain_level_discharge || "",
      otherRemarks: sheet.other_remarks || "",
    });

    // Set the current status when editing
    if (sheet.status) {
      // If it's already completed, keep it as completed during editing
      // If it's draft, it will remain draft until final submit
    }

    setIVSedationCurrentStep(1);
    setShowIVSedationForm(true);
  };

  const handleDeleteIVSedationSheet = (sheet: any) => {
    setIVSedationSheetToDelete(sheet);
    setShowIVSedationDeleteConfirmation(true);
    setIVSedationActiveDropdown(null); // Close the dropdown
  };

  const handleConfirmIVSedationDelete = async () => {
    if (!ivSedationSheetToDelete) return;

    try {
      const { error } = await supabase
        .from('iv_sedation_forms')
        .delete()
        .eq('id', ivSedationSheetToDelete.id);

      if (error) {
        console.error('Error deleting IV sedation sheet:', error);
        setIVSedationFormMessage({
          type: 'error',
          text: `Failed to delete IV sedation sheet: ${error.message}`
        });
        setShowIVSedationToast(true);
        setTimeout(() => setShowIVSedationToast(false), 5000);
        return;
      }

      // Remove from local state
      setIVSedationSheets(prev => prev.filter(sheet => sheet.id !== ivSedationSheetToDelete.id));

      setIVSedationFormMessage({
        type: 'success',
        text: 'IV sedation sheet deleted successfully!'
      });
      setShowIVSedationToast(true);
      setTimeout(() => setShowIVSedationToast(false), 3000);

    } catch (error) {
      console.error('Error deleting IV sedation sheet:', error);
      setIVSedationFormMessage({
        type: 'error',
        text: 'Failed to delete IV sedation sheet'
      });
      setShowIVSedationToast(true);
      setTimeout(() => setShowIVSedationToast(false), 5000);
    }

    setShowIVSedationDeleteConfirmation(false);
    setIVSedationSheetToDelete(null);
  };

  // IV Sedation Preview Handlers
  const handleViewIVSedationSheet = (sheet: any) => {
    setSelectedIVSedationSheet(sheet);
    setShowIVSedationPreview(true);
  };

  const handleIVSedationPreviewClose = () => {
    setShowIVSedationPreview(false);
    setSelectedIVSedationSheet(null);
  };

  // Surgical Recall Sheet Handlers
  const handleSurgicalRecallFormSubmit = async (formData: any) => {
    console.log('Surgical recall sheet form submitted:', formData);
    setShowSurgicalRecallForm(false);
    setEditingSurgicalRecallSheet(null);
    // Refresh the sheets list
    await refetchSurgicalRecallSheets();
  };

  const handleSurgicalRecallFormCancel = () => {
    console.log('🚫 Cancelling surgical recall form, resetting editing state');
    setShowSurgicalRecallForm(false);
    setEditingSurgicalRecallSheet(null);
  };

  const handleViewSurgicalRecallSheet = async (sheet: any) => {
    try {
      const result = await fetchSheetWithImplants(sheet.id);

      // Restructure the data to match what the preview expects
      const viewData = {
        ...result.sheet,
        surgical_recall_implants: result.implants
      };

      setSelectedSurgicalRecallSheet(viewData);
      setShowSurgicalRecallPreview(true);
    } catch (error) {
      console.error('Error fetching surgical recall sheet:', error);
      toast({
        title: "Error",
        description: "Failed to load surgical recall sheet details.",
        variant: "destructive",
      });
    }
  };

  const handleEditSurgicalRecallSheet = async (sheet: any) => {
    try {
      console.log('🔍 Editing surgical recall sheet:', sheet);
      const result = await fetchSheetWithImplants(sheet.id);
      console.log('📋 Fetched sheet with implants:', result);

      // Restructure the data to match what the form expects
      const editingData = {
        ...result.sheet,
        surgical_recall_implants: result.implants
      };

      console.log('📝 Structured editing data:', editingData);
      setEditingSurgicalRecallSheet(editingData);
      setShowSurgicalRecallForm(true);
      setSurgicalRecallActiveDropdown(null);
    } catch (error) {
      console.error('Error fetching surgical recall sheet for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load surgical recall sheet for editing.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSurgicalRecallSheet = (sheet: any) => {
    setSurgicalRecallActiveDropdown(null);
    setSurgicalRecallSheetToDelete({
      id: sheet.id,
      patient_name: sheet.patient_name,
      surgery_date: sheet.surgery_date,
      arch_type: sheet.arch_type,
      implantCount: 0 // We'll calculate this if needed
    });
    setShowSurgicalRecallDeleteDialog(true);
  };

  const handleSurgicalRecallDeleteSuccess = async () => {
    // Refresh the sheets list
    await refetchSurgicalRecallSheets();
    toast({
      title: "Success",
      description: "Surgical recall sheet and all images deleted successfully!",
    });
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

      // CBCT is always required for all reason selections
      if (dataCollected.cbctTaken === null) {
        missingPictures.push("CBCT (Yes or No)");
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
        cbct_taken: dataCollectionFormData.dataCollected.cbctTaken,

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

                {/* Additional Patient Details - Compact Width */}
                <div className="w-80 mx-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100 shadow-sm">
                    <div className="grid grid-rows-2 gap-1.5 text-xs">
                      {/* First Row */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Appliance Inserted */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-blue-800">App:</span>
                          <div className="flex items-center gap-1">
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT"
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              U
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                              patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT"
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              L
                            </span>
                          </div>
                        </div>

                        {/* Shade */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-blue-800">Shade:</span>
                          <span className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs">
                            {labScripts.find(script => script.shade)?.shade ||
                             deliveryItems.find(item => item.patient_name === patient.full_name && item.shade)?.shade ||
                             "N/A"}
                          </span>
                        </div>

                        {/* Screw */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-blue-800">Screw:</span>
                          <span className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs">
                            {patientReportCards.find(card => card.screw)?.screw || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Second Row */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Last Appointment */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-blue-800">Last:</span>
                          <span className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs">
                            {(() => {
                              const pastAppointments = patientAppointments
                                .filter(apt => new Date(apt.date) < new Date())
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                              return pastAppointments.length > 0
                                ? new Date(pastAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : "None";
                            })()}
                          </span>
                        </div>

                        {/* Next Appointment */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-blue-800">Next:</span>
                          <span className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs">
                            {(() => {
                              const futureAppointments = patientAppointments
                                .filter(apt => new Date(apt.date) >= new Date())
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                              return futureAppointments.length > 0
                                ? new Date(futureAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : "None";
                            })()}
                          </span>
                        </div>
                      </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Tabs Navigation and Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-7 bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm flex-shrink-0">
              <TabsTrigger value="basic" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <User className="h-3.5 w-3.5" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <FileText className="h-3.5 w-3.5" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1.5 px-2 py-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg transition-all text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Appointments ({patientAppointments.length})
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
            </TabsList>

            <TabsContent value="basic" className="flex-1 mt-2 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Modern Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pl-0 pr-0 pt-2 pb-2" style={{ height: 'calc(100vh - 280px)' }}>
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 min-h-0">
                    <div className="space-y-3 pb-2">
                      {/* Basic Information Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Basic Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">First Name</p>
                            <p className="text-sm font-semibold text-gray-900">{patient.first_name}</p>
                          </div>
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">Last Name</p>
                            <p className="text-sm font-semibold text-gray-900">{patient.last_name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">Date of Birth</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(patient.date_of_birth).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">{calculateAge(patient.date_of_birth)} years old</p>
                          </div>
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">Gender</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">{patient.gender || "Not specified"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Contact Information</h4>
                        </div>
                        <div className="bg-white rounded-md p-2 border border-blue-200 mb-2">
                          <p className="text-xs font-medium text-blue-600 mb-0.5">Phone Number</p>
                          <p className="text-sm font-semibold text-gray-900">{patient.phone || "Not provided"}</p>
                        </div>
                        <div className="bg-white rounded-md p-2 border border-blue-200">
                          <p className="text-xs font-medium text-blue-600 mb-0.5">Address</p>
                          <div className="space-y-0.5">
                            {patient.street && <p className="text-sm font-semibold text-gray-900">{patient.street}</p>}
                            <p className="text-sm font-semibold text-gray-900">
                              {[patient.city, patient.state, patient.zip_code].filter(Boolean).join(", ") || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Emergency Contact</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">Contact Name</p>
                            <p className="text-sm font-semibold text-gray-900">{patient.emergency_contact_name || "Not provided"}</p>
                          </div>
                          <div className="bg-white rounded-md p-2 border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-0.5">Contact Phone</p>
                            <p className="text-sm font-semibold text-gray-900">{patient.emergency_contact_phone || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 flex-shrink-0 relative">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Treatment Information</h3>
                    </div>
                    <div className="absolute right-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleAddTreatment}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white h-7 w-7 p-0 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
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
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0">
                    <div className="space-y-3 pb-2">
                      {/* Upper and Lower Treatment Information - Separated */}
                      {((patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT") ||
                        (patient.lower_treatment && patient.lower_treatment !== "NO TREATMENT")) && (
                        <div className="space-y-4">
                          {/* Upper Treatment Section */}
                          {patient.upper_treatment && patient.upper_treatment !== "NO TREATMENT" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Upper Arch Treatment</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={() => handleEditTreatment('upper')}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteTreatment('upper')}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
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
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Lower Arch Treatment</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={() => handleEditTreatment('lower')}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteTreatment('lower')}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Badge variant="outline" className="bg-white border-blue-300 text-blue-800 text-xs font-medium">
                                  {patient.lower_treatment}
                                </Badge>
                                {patient.lower_surgery_date && (
                                  <div className="text-xs text-blue-700 font-medium">
                                    Surgery Date: {new Date(patient.lower_surgery_date).toLocaleDateString('en-US')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Heart className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Health History</h3>
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

            <TabsContent value="appointments" className="flex-1 mt-2 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full mb-4 table-container-rounded">
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Appointments...</h3>
                      <p className="text-gray-500">Please wait while we fetch appointment data.</p>
                    </div>
                  </div>
                ) : patientAppointments.length > 0 ? (
                  <>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Patient Appointments</h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {patientAppointments.length} appointment{patientAppointments.length !== 1 ? 's' : ''} found
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Appointments List */}
                    <div className="flex-1 overflow-auto p-6">
                      <div className="space-y-4">
                        {patientAppointments.map((appointment) => (
                          <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    appointment.status === 'confirmed' ? 'bg-green-500' :
                                    appointment.status === 'not-confirmed' ? 'bg-orange-500' :
                                    appointment.status === 'cancelled' ? 'bg-red-500' :
                                    appointment.status === 'pending' ? 'bg-yellow-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <h3 className="font-semibold text-gray-900">{appointment.type}</h3>
                                  <Badge variant={
                                    appointment.status === 'confirmed' ? 'default' :
                                    appointment.status === 'not-confirmed' ? 'secondary' :
                                    appointment.status === 'cancelled' ? 'destructive' :
                                    'outline'
                                  }>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{appointment.startTime.split(':').slice(0, 2).join(':')} - {appointment.endTime.split(':').slice(0, 2).join(':')}</span>
                                  </div>
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Found</h3>
                      <p className="text-gray-500 mb-4">This patient doesn't have any appointments scheduled yet.</p>
                    </div>
                  </div>
                )}
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
                {/* Clinical Forms Grid with Horizontal Scroll */}
                <div className="overflow-x-auto pl-0 pr-0 pt-2 pb-2" style={{ height: 'calc(100vh - 280px)' }}>
                  <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
                  {/* Administrative Forms */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Administrative Forms ({patientPackets.length + financialAgreements.length + consentForms.length + medicalRecordsReleaseForms.length + informedConsentSmokingForms.length + finalDesignApprovalForms.length + thankYouPreSurgeryForms.length + threeYearCarePackageForms.length + fiveYearWarrantyForms.length + partialPaymentAgreementForms.length + treatmentPlanForms.length})</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Dropdown and Add Button Row */}
                        <div className="flex items-center gap-2">
                          {/* Form Type Dropdown */}
                          <Select value={selectedAdminFormType} onValueChange={setSelectedAdminFormType}>
                            <SelectTrigger className="flex-1 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30">
                              <SelectValue placeholder="Choose administrative form..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-patient-packet">New Patient Packet</SelectItem>
                              <SelectItem value="financial-agreement">Financial Agreement</SelectItem>
                              <SelectItem value="consent-full-arch">Consent Packet</SelectItem>
                              <SelectItem value="medical-records-release">Medical Records Release Form</SelectItem>
                              <SelectItem value="informed-consent-smoking">Informed Consent Form For Smoking</SelectItem>
                              <SelectItem value="three-year-care-package">3-Year Care Package Enrollment Form</SelectItem>
                              {/* <SelectItem value="five-year-warranty">5-Year Extended Warranty Plan</SelectItem> */}
                              <SelectItem value="partial-payment-agreement">Partial Payment Agreement for Future Treatment</SelectItem>
                              <SelectItem value="final-design-approval">Final Design Approval Form</SelectItem>
                              <SelectItem value="thank-you-pre-surgery">Thank You and Pre-Surgery Form</SelectItem>
                              <SelectItem value="create-treatment-plan">Create Treatment Plan</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Square Add Button */}
                          <button
                            className="flex-shrink-0 w-10 h-10 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedAdminFormType}
                            onClick={() => {
                              if (selectedAdminFormType === 'consent-full-arch') {
                                setShowConsentFullArchForm(true);
                              } else if (selectedAdminFormType === 'financial-agreement') {
                                setShowFinancialAgreementForm(true);
                              } else if (selectedAdminFormType === 'final-design-approval') {
                                setShowFinalDesignApprovalForm(true);
                              } else if (selectedAdminFormType === 'medical-records-release') {
                                // Reset editing states for new form
                                setEditingMedicalRecordsReleaseForm(null);
                                setIsEditingMedicalRecordsReleaseForm(false);
                                setIsViewingMedicalRecordsReleaseForm(false);
                                setShowMedicalRecordsReleaseForm(true);
                              } else if (selectedAdminFormType === 'new-patient-packet') {
                                setShowNewPatientPacketForm(true);
                              } else if (selectedAdminFormType === 'informed-consent-smoking') {
                                setShowInformedConsentSmokingForm(true);
                              } else if (selectedAdminFormType === 'thank-you-pre-surgery') {
                                setShowThankYouPreSurgeryForm(true);
                              } else if (selectedAdminFormType === 'three-year-care-package') {
                                setShowThreeYearCarePackageForm(true);
                              } else if (selectedAdminFormType === 'five-year-warranty') {
                                setShowFiveYearWarrantyForm(true);
                              } else if (selectedAdminFormType === 'partial-payment-agreement') {
                                setShowPartialPaymentAgreementForm(true);
                              } else if (selectedAdminFormType === 'create-treatment-plan') {
                                setShowTreatmentPlanForm(true);
                              } else {
                                // Handle other form types here
                                alert(`Opening ${selectedAdminFormType} form - Not implemented yet`);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Administrative Forms List */}
                        {(loadingPatientPackets || loadingFinancialAgreements || loadingConsentForms || loadingMedicalRecordsReleaseForms || loadingInformedConsentSmokingForms || loadingFinalDesignApprovalForms || loadingThankYouPreSurgeryForms || loadingThreeYearCarePackageForms || loadingFiveYearWarrantyForms || loadingPartialPaymentAgreementForms || loadingTreatmentPlanForms) ? (
                          <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading administrative forms...</p>
                          </div>
                        ) : (patientPackets.length > 0 || financialAgreements.length > 0 || consentForms.length > 0 || medicalRecordsReleaseForms.length > 0 || informedConsentSmokingForms.length > 0 || finalDesignApprovalForms.length > 0 || thankYouPreSurgeryForms.length > 0 || threeYearCarePackageForms.length > 0 || fiveYearWarrantyForms.length > 0 || partialPaymentAgreementForms.length > 0 || treatmentPlanForms.length > 0) ? (
                          <div className="space-y-2">
                            {patientPackets.map((packet) => (
                              <div
                                key={packet.id}
                                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                onClick={() => handleViewPatientPacket(packet)}
                              >
                                {/* Header with date and status */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      packet.form_status === 'completed' ? 'bg-green-500' :
                                      packet.form_status === 'reviewed' ? 'bg-blue-500' : 'bg-orange-500'
                                    }`}></div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      New Patient Packet
                                    </span>
                                  </div>

                                  {/* Status Badge */}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    packet.form_status === 'completed'
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : packet.form_status === 'reviewed'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                                  }`}>
                                    {packet.form_status === 'completed' ? 'Completed' :
                                     packet.form_status === 'reviewed' ? 'Reviewed' : 'Draft'}
                                  </span>
                                </div>

                                {/* Submitted Date */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Submitted on:</span>
                                    <span className="font-medium text-gray-700">
                                      {packet.submitted_at ?
                                        new Date(packet.submitted_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) :
                                        new Date(packet.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      }
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{packet.created_at ? new Date(packet.created_at).toLocaleDateString() : 'Unknown date'}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Edit button - visible to all users if draft, only admins if completed */}
                                    {(packet.form_status === 'draft' || isAdminUser()) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditPatientPacket(packet);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                        title="Edit patient packet"
                                      >
                                        <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                      </button>
                                    )}

                                    {/* Delete button - only visible to admins */}
                                    {isAdminUser() && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePatientPacket(packet);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                        title="Delete patient packet"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {financialAgreements.map((agreement) => (
                              <div
                                key={agreement.id}
                                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                onClick={() => handleViewFinancialAgreement(agreement)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      agreement.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                    }`}></div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      Financial Agreement
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    agreement.status === 'completed'
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                                  }`}>
                                    {agreement.status === 'completed' ? 'Completed' : 'Draft'}
                                  </span>
                                </div>

                                {/* Submitted Date */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Submitted on:</span>
                                    <span className="font-medium text-gray-700">
                                      {agreement.created_at ?
                                        new Date(agreement.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) :
                                        'Draft - Not submitted'
                                      }
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(agreement.created_at).toLocaleDateString()}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Edit button - visible to all users if draft, only admins if completed */}
                                    {(agreement.status === 'draft' || isAdminUser()) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingFinancialAgreement(agreement);
                                          setIsEditingFinancialAgreement(true);
                                          setShowFinancialAgreementForm(true);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                        title="Edit financial agreement"
                                      >
                                        <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                      </button>
                                    )}

                                    {/* Delete button - only visible to admins */}
                                    {isAdminUser() && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFinancialAgreementToDelete(agreement);
                                          setShowDeleteFinancialAgreementConfirm(true);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                        title="Delete financial agreement"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Consent Forms Section */}
                            {consentForms.length > 0 && (
                              <>
                                {consentForms.map((form) => {
                                  const displayData = formatConsentFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={async () => {
                                        try {
                                          console.log('👁️ View button clicked - Fetching fresh data for form ID:', form.id);
                                          // Fetch fresh data from Supabase
                                          const freshData = await getConsentForm(form.id);
                                          console.log('📥 Fresh data from Supabase:', freshData);

                                          if (freshData.data) {
                                            const formattedData = formatConsentFormForDisplay(freshData.data);
                                            console.log('✅ Formatted fresh data for view:', formattedData);
                                            setSelectedConsentForm(formattedData);
                                            setIsViewingConsentForm(true);
                                            setShowConsentFullArchForm(true);
                                          } else {
                                            console.error('❌ No data found for form ID:', form.id);
                                            toast({
                                              title: "Error",
                                              description: "Could not load form data. Please try again.",
                                              variant: "destructive",
                                            });
                                          }
                                        } catch (error) {
                                          console.error('❌ Error fetching form data for view:', error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to load form data. Please try again.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'signed' ? 'bg-green-500' :
                                            form.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            Consent Packet
                                          </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          form.status === 'signed' ? 'bg-green-100 text-green-700' :
                                          form.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {form.status === 'signed' ? 'Signed' :
                                           form.status === 'completed' ? 'Completed' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Submitted Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Submitted on:</span>
                                          <span className="font-medium text-gray-700">
                                            {new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                  console.log('✏️ Edit button clicked - Fetching fresh data for form ID:', form.id);
                                                  // Fetch fresh data from Supabase
                                                  const freshData = await getConsentForm(form.id);
                                                  console.log('📥 Fresh data from Supabase:', freshData);

                                                  if (freshData.data) {
                                                    const formattedData = formatConsentFormForDisplay(freshData.data);
                                                    console.log('✅ Formatted fresh data for edit:', formattedData);
                                                    setSelectedConsentForm(formattedData);
                                                    setIsEditingConsentForm(true);
                                                    setIsViewingConsentForm(false);
                                                    setShowConsentFullArchForm(true);
                                                  } else {
                                                    console.error('❌ No data found for form ID:', form.id);
                                                    toast({
                                                      title: "Error",
                                                      description: "Could not load form data. Please try again.",
                                                      variant: "destructive",
                                                    });
                                                  }
                                                } catch (error) {
                                                  console.error('❌ Error fetching form data for edit:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to load form data. Please try again.",
                                                    variant: "destructive",
                                                  });
                                                }
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit consent packet"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setConsentFormToDelete(form);
                                                setShowDeleteConsentFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete consent packet"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* Medical Records Release Forms Section */}
                            {medicalRecordsReleaseForms.length > 0 && (
                              <>
                                {medicalRecordsReleaseForms.map((form) => {
                                  const displayData = formatMedicalRecordsReleaseFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={() => {
                                        setEditingMedicalRecordsReleaseForm(form);
                                        setIsEditingMedicalRecordsReleaseForm(false);
                                        setIsViewingMedicalRecordsReleaseForm(true);
                                        setShowMedicalRecordsReleaseForm(true);
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'completed' ? 'bg-green-500' :
                                            form.status === 'submitted' ? 'bg-blue-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            Medical Records Release Form
                                          </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          form.status === 'completed' ? 'bg-green-100 text-green-700' :
                                          form.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {form.status === 'completed' ? 'Completed' :
                                           form.status === 'submitted' ? 'Submitted' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">
                                            {form.status === 'completed' ? 'Completed on:' :
                                             form.status === 'submitted' ? 'Submitted on:' : 'Created on:'}
                                          </span>
                                          <span className="font-medium text-gray-700">
                                            {new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingMedicalRecordsReleaseForm(form);
                                                setIsEditingMedicalRecordsReleaseForm(true);
                                                setIsViewingMedicalRecordsReleaseForm(false);
                                                setShowMedicalRecordsReleaseForm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit medical records release form"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setMedicalRecordsReleaseFormToDelete(form);
                                                setShowDeleteMedicalRecordsReleaseFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete medical records release form"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* Informed Consent Smoking Forms Section */}
                            {informedConsentSmokingForms.length > 0 && (
                              <>
                                {informedConsentSmokingForms.map((form) => {
                                  const displayData = formatInformedConsentSmokingFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={() => {
                                        setEditingInformedConsentSmokingForm(form);
                                        setIsEditingInformedConsentSmokingForm(false);
                                        setIsViewingInformedConsentSmokingForm(true);
                                        setShowInformedConsentSmokingForm(true);
                                      }}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'signed' ? 'bg-green-500' :
                                            form.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            Informed Consent - Nicotine Use Form
                                          </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          form.status === 'signed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                          form.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                                        }`}>
                                          {form.status === 'signed' ? 'Signed' :
                                           form.status === 'completed' ? 'Completed' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Submitted/Created Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">
                                            {form.status === 'draft' ? 'Created on:' :
                                             form.status === 'signed' ? 'Signed on:' : 'Completed on:'}
                                          </span>
                                          <span className="font-medium text-gray-700">
                                            {new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingInformedConsentSmokingForm(form);
                                                setIsEditingInformedConsentSmokingForm(true);
                                                setIsViewingInformedConsentSmokingForm(false);
                                                setShowInformedConsentSmokingForm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit informed consent smoking form"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setInformedConsentSmokingFormToDelete(form);
                                                setShowDeleteInformedConsentSmokingFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete informed consent smoking form"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* Final Design Approval Forms Section */}
                            {finalDesignApprovalForms.length > 0 && (
                              <>
                                {finalDesignApprovalForms.map((form) => {
                                  const displayData = formatFinalDesignApprovalFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={async () => {
                                        try {
                                          console.log('👁️ View button clicked - Fetching fresh data for form ID:', form.id);
                                          // Fetch fresh data from Supabase
                                          const freshData = await getFinalDesignApprovalForm(form.id);
                                          console.log('📥 Fresh data from Supabase:', freshData);

                                          if (freshData.data) {
                                            const formattedData = formatFinalDesignApprovalFormForDisplay(freshData.data);
                                            console.log('✅ Formatted fresh data for view:', formattedData);
                                            setSelectedFinalDesignApprovalForm(formattedData);
                                            setIsViewingFinalDesignApprovalForm(true);
                                            setShowFinalDesignApprovalForm(true);
                                          } else {
                                            console.error('❌ No data found for form ID:', form.id);
                                            toast({
                                              title: "Error",
                                              description: "Could not load form data. Please try again.",
                                              variant: "destructive",
                                            });
                                          }
                                        } catch (error) {
                                          console.error('❌ Error fetching form data for view:', error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to load form data. Please try again.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'signed' ? 'bg-green-500' :
                                            form.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            Final Design Approval Form
                                          </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          form.status === 'signed' ? 'bg-green-100 text-green-700' :
                                          form.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {form.status === 'signed' ? 'Signed' :
                                           form.status === 'completed' ? 'Completed' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Submitted Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Submitted on:</span>
                                          <span className="font-medium text-gray-700">
                                            {new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                  console.log('🔄 Edit button clicked - Fetching fresh data for form ID:', form.id);
                                                  // Fetch fresh data from Supabase
                                                  const freshData = await getFinalDesignApprovalForm(form.id);
                                                  console.log('📥 Fresh data from Supabase:', freshData);

                                                  if (freshData.data) {
                                                    const formattedData = formatFinalDesignApprovalFormForDisplay(freshData.data);
                                                    console.log('✅ Formatted fresh data:', formattedData);
                                                    setSelectedFinalDesignApprovalForm(formattedData);
                                                    setIsEditingFinalDesignApprovalForm(true);
                                                    setShowFinalDesignApprovalForm(true);
                                                  } else {
                                                    console.error('❌ No data found for form ID:', form.id);
                                                    toast({
                                                      title: "Error",
                                                      description: "Could not load form data. Please try again.",
                                                      variant: "destructive",
                                                    });
                                                  }
                                                } catch (error) {
                                                  console.error('❌ Error fetching form data:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to load form data. Please try again.",
                                                    variant: "destructive",
                                                  });
                                                }
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit final design approval form"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setFinalDesignApprovalFormToDelete(form);
                                                setShowDeleteFinalDesignApprovalFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete final design approval form"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* Thank You Pre-Surgery Forms Section */}
                            {thankYouPreSurgeryForms.length > 0 && (
                              <>
                                {thankYouPreSurgeryForms.map((form) => {
                                  const displayData = formatThankYouPreSurgeryFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={async () => {
                                        try {
                                          console.log('👁️ View button clicked - Fetching fresh data for form ID:', form.id);
                                          // Fetch fresh data from Supabase
                                          const freshData = await getThankYouPreSurgeryForm(form.id);
                                          console.log('📥 Fresh data from Supabase:', freshData);

                                          if (freshData.data) {
                                            const formattedData = formatThankYouPreSurgeryFormForDisplay(freshData.data);
                                            console.log('✅ Formatted fresh data for view:', formattedData);
                                            setSelectedThankYouPreSurgeryForm(formattedData);
                                            setIsViewingThankYouPreSurgeryForm(true);
                                            setShowThankYouPreSurgeryForm(true);
                                          } else {
                                            console.error('❌ No data found for form ID:', form.id);
                                            toast({
                                              title: "Error",
                                              description: "Could not load form data. Please try again.",
                                              variant: "destructive",
                                            });
                                          }
                                        } catch (error) {
                                          console.error('❌ Error fetching form data for view:', error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to load form data. Please try again.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'signed' ? 'bg-green-500' :
                                            form.status === 'submitted' ? 'bg-green-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            Thank You & Pre-Surgery Form
                                          </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          form.status === 'signed' ? 'bg-green-100 text-green-700' :
                                          form.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {form.status === 'signed' ? 'Signed' :
                                           form.status === 'submitted' ? 'Submitted' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Submitted Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Submitted on:</span>
                                          <span className="font-medium text-gray-700">
                                            {new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                  console.log('🔄 Edit button clicked - Fetching fresh data for form ID:', form.id);
                                                  // Fetch fresh data from Supabase
                                                  const freshData = await getThankYouPreSurgeryForm(form.id);
                                                  console.log('📥 Fresh data from Supabase:', freshData);

                                                  if (freshData.data) {
                                                    const formattedData = formatThankYouPreSurgeryFormForDisplay(freshData.data);
                                                    console.log('✅ Formatted fresh data:', formattedData);
                                                    setSelectedThankYouPreSurgeryForm(formattedData);
                                                    setIsEditingThankYouPreSurgeryForm(true);
                                                    setShowThankYouPreSurgeryForm(true);
                                                  } else {
                                                    console.error('❌ No data found for form ID:', form.id);
                                                    toast({
                                                      title: "Error",
                                                      description: "Could not load form data. Please try again.",
                                                      variant: "destructive",
                                                    });
                                                  }
                                                } catch (error) {
                                                  console.error('❌ Error fetching form data:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to load form data. Please try again.",
                                                    variant: "destructive",
                                                  });
                                                }
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit thank you pre-surgery form"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setThankYouPreSurgeryFormToDelete(form);
                                                setShowDeleteThankYouPreSurgeryFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete thank you pre-surgery form"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* 3-Year Care Package Forms Section */}
                            {threeYearCarePackageForms.length > 0 && (
                              <>
                                {threeYearCarePackageForms.map((form) => {
                                  const displayData = formatThreeYearCarePackageFormForDisplay(form);
                                  return (
                                    <div
                                      key={form.id}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                      onClick={() => {
                                        setSelectedThreeYearCarePackageForm(form);
                                        setIsViewingThreeYearCarePackageForm(true);
                                        setShowThreeYearCarePackageForm(true);
                                      }}
                                    >
                                      {/* Header with form name and status */}
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            form.status === 'signed' ? 'bg-green-500' :
                                            form.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                          }`}></div>
                                          <span className="text-sm font-semibold text-gray-900">
                                            3-Year Care Package Enrollment Agreement
                                          </span>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          form.status === 'signed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                          form.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                                        }`}>
                                          {form.status === 'signed' ? 'Signed' :
                                           form.status === 'completed' ? 'Completed' : 'Draft'}
                                        </span>
                                      </div>

                                      {/* Submitted/Created Date */}
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">
                                            {form.status === 'draft' ? 'Created on:' :
                                             form.status === 'signed' ? 'Signed on:' : 'Completed on:'}
                                          </span>
                                          <span className="font-medium text-gray-700">
                                            {form.created_at ? new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }) : 'Unknown date'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{form.created_at ? new Date(form.created_at).toLocaleDateString() : 'Unknown date'}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Edit button - visible to all users if draft, only admins if completed */}
                                          {(form.status === 'draft' || isAdminUser()) && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedThreeYearCarePackageForm(form);
                                                setIsEditingThreeYearCarePackageForm(true);
                                                setIsViewingThreeYearCarePackageForm(false);
                                                setShowThreeYearCarePackageForm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Edit 3-Year Care Package form"
                                            >
                                              <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                            </button>
                                          )}

                                          {/* Delete button - only visible to admins */}
                                          {isAdminUser() && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setThreeYearCarePackageFormToDelete(form);
                                                setShowDeleteThreeYearCarePackageFormConfirm(true);
                                              }}
                                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                              title="Delete 3-Year Care Package form"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {/* 5-Year Warranty Forms Section */}
                            {fiveYearWarrantyForms.length > 0 && (
                              <>
                                {fiveYearWarrantyForms.map((form) => (
                                  <div
                                    key={form.id}
                                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                    onClick={() => {
                                      setSelectedFiveYearWarrantyForm(form);
                                      setIsViewingFiveYearWarrantyForm(true);
                                      setShowFiveYearWarrantyForm(true);
                                    }}
                                  >
                                    {/* Header with form name and status */}
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          form.status === 'completed' ? 'bg-green-500' :
                                          form.status === 'signed' ? 'bg-green-500' : 'bg-purple-500'
                                        }`}></div>
                                        <span className="text-sm font-semibold text-gray-900">
                                          5-Year Extended Warranty Plan
                                        </span>
                                      </div>
                                      {/* Status Badge - moved to top right */}
                                      {form.status === 'draft' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                          Draft
                                        </span>
                                      )}
                                      {form.status === 'completed' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Completed
                                        </span>
                                      )}
                                      {form.status === 'signed' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Signed
                                        </span>
                                      )}
                                    </div>

                                    {/* Submitted Date */}
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Submitted on:</span>
                                        <span className="font-medium text-gray-700">
                                          {form.created_at ?
                                            new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }) : 'No date'
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{form.created_at ? new Date(form.created_at).toLocaleDateString() : 'Unknown date'}</span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        {/* Edit button - visible to all users if draft, only admins if completed */}
                                        {((form.status === 'draft' || !form.status) || isAdminUser()) && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedFiveYearWarrantyForm(form);
                                              setIsEditingFiveYearWarrantyForm(true);
                                              setIsViewingFiveYearWarrantyForm(false);
                                              setShowFiveYearWarrantyForm(true);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Edit 5-Year Warranty form"
                                          >
                                            <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                          </button>
                                        )}

                                        {/* Delete button - only visible to admins */}
                                        {isAdminUser() && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFiveYearWarrantyFormToDelete(form);
                                              setShowDeleteFiveYearWarrantyFormConfirm(true);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Delete 5-Year Warranty form"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}

                            {/* Partial Payment Agreement Forms Section */}
                            {partialPaymentAgreementForms.length > 0 && (
                              <>
                                {partialPaymentAgreementForms.map((form) => (
                                  <div
                                    key={form.id}
                                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                    onClick={async () => {
                                      try {
                                        console.log('👁️ View button clicked - Fetching fresh data for form ID:', form.id);
                                        // Fetch fresh data from Supabase
                                        const freshData = await partialPaymentAgreementService.getFormById(form.id);
                                        console.log('📥 Fresh data from Supabase:', freshData);

                                        if (freshData) {
                                          const formattedData = formatPartialPaymentAgreementFormForDisplay(freshData);
                                          console.log('✅ Formatted fresh data for view:', formattedData);
                                          setSelectedPartialPaymentAgreementForm(formattedData);
                                          setIsViewingPartialPaymentAgreementForm(true);
                                          setShowPartialPaymentAgreementForm(true);
                                        } else {
                                          console.error('❌ No data found for form ID:', form.id);
                                          toast({
                                            title: "Error",
                                            description: "Could not load form data. Please try again.",
                                            variant: "destructive",
                                          });
                                        }
                                      } catch (error) {
                                        console.error('❌ Error fetching form data for view:', error);
                                        toast({
                                          title: "Error",
                                          description: "Failed to load form data. Please try again.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    {/* Header with form name and status */}
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          form.status === 'completed' ? 'bg-green-500' :
                                          form.status === 'signed' ? 'bg-green-500' : 'bg-orange-500'
                                        }`}></div>
                                        <span className="text-sm font-semibold text-gray-900">
                                          Partial Payment Agreement
                                        </span>
                                      </div>
                                      {/* Status Badge - moved to top right */}
                                      {form.status === 'draft' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                          Draft
                                        </span>
                                      )}
                                      {form.status === 'completed' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Completed
                                        </span>
                                      )}
                                      {form.status === 'signed' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Signed
                                        </span>
                                      )}
                                    </div>

                                    {/* Submitted Date */}
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Submitted on:</span>
                                        <span className="font-medium text-gray-700">
                                          {form.created_at ?
                                            new Date(form.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }) : 'No date'
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{form.created_at ? new Date(form.created_at).toLocaleDateString() : 'Unknown date'}</span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        {/* Edit button - visible to all users if draft, only admins if completed */}
                                        {((form.status === 'draft' || !form.status) || isAdminUser()) && (
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                console.log('🔄 Edit button clicked - Fetching fresh data for form ID:', form.id);
                                                // Fetch fresh data from Supabase
                                                const freshData = await partialPaymentAgreementService.getFormById(form.id);
                                                console.log('📥 Fresh data from Supabase:', freshData);

                                                if (freshData) {
                                                  const formattedData = formatPartialPaymentAgreementFormForDisplay(freshData);
                                                  console.log('✅ Formatted fresh data:', formattedData);
                                                  setSelectedPartialPaymentAgreementForm(formattedData);
                                                  setIsEditingPartialPaymentAgreementForm(true);
                                                  setShowPartialPaymentAgreementForm(true);
                                                } else {
                                                  console.error('❌ No data found for form ID:', form.id);
                                                  toast({
                                                    title: "Error",
                                                    description: "Could not load form data. Please try again.",
                                                    variant: "destructive",
                                                  });
                                                }
                                              } catch (error) {
                                                console.error('❌ Error fetching form data:', error);
                                                toast({
                                                  title: "Error",
                                                  description: "Failed to load form data. Please try again.",
                                                  variant: "destructive",
                                                });
                                              }
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Edit form"
                                          >
                                            <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                          </button>
                                        )}

                                        {/* Delete button - only visible to admins */}
                                        {isAdminUser() && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPartialPaymentAgreementFormToDelete(form);
                                              setShowDeletePartialPaymentAgreementFormConfirm(true);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Delete form"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}

                            {/* Treatment Plan Forms Section */}
                            {treatmentPlanForms.length > 0 && (
                              <>
                                {treatmentPlanForms.map((form) => (
                                  <div
                                    key={form.id}
                                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                    onClick={async () => {
                                      try {
                                        console.log('👁️ View button clicked - Fetching fresh data for form ID:', form.id);

                                        const { data: freshFormData, error } = await getTreatmentPlanForm(form.id);

                                        if (error) {
                                          console.error('❌ Error fetching fresh Treatment Plan form data:', error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to load form data. Please try again.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }

                                        console.log('✅ Fresh Treatment Plan form data loaded:', freshFormData);
                                        setSelectedTreatmentPlanForm(freshFormData);
                                        setIsViewingTreatmentPlanForm(true);
                                        setShowTreatmentPlanForm(true);
                                      } catch (error) {
                                        console.error('❌ Unexpected error loading Treatment Plan form:', error);
                                        toast({
                                          title: "Error",
                                          description: "An unexpected error occurred. Please try again.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    {/* Header with form name and status */}
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          form.form_status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                        }`}></div>
                                        <span className="text-sm font-semibold text-gray-900">
                                          Treatment Plan
                                        </span>
                                      </div>
                                      {/* Status Badge - moved to top right */}
                                      {form.form_status === 'draft' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                          Draft
                                        </span>
                                      )}
                                      {form.form_status === 'completed' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Completed
                                        </span>
                                      )}
                                    </div>



                                    {/* Plan Date */}
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Plan Date:</span>
                                        <span className="font-medium text-gray-700">
                                          {form.plan_date ?
                                            new Date(form.plan_date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            }) : 'Not set'
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        {/* Edit button - visible to all users if draft, only admins if completed */}
                                        {(form.form_status === 'draft' || isAdminUser()) && (
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                console.log('🔄 Edit button clicked - Fetching fresh data for form ID:', form.id);

                                                const { data: freshFormData, error } = await getTreatmentPlanForm(form.id);

                                                if (error) {
                                                  console.error('❌ Error fetching fresh Treatment Plan form data:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to load form data. Please try again.",
                                                    variant: "destructive",
                                                  });
                                                  return;
                                                }

                                                console.log('✅ Fresh Treatment Plan form data loaded for editing:', freshFormData);
                                                setSelectedTreatmentPlanForm(freshFormData);
                                                setIsEditingTreatmentPlanForm(true);
                                                setIsViewingTreatmentPlanForm(false);
                                                setShowTreatmentPlanForm(true);
                                              } catch (error) {
                                                console.error('❌ Unexpected error loading Treatment Plan form for editing:', error);
                                                toast({
                                                  title: "Error",
                                                  description: "An unexpected error occurred. Please try again.",
                                                  variant: "destructive",
                                                });
                                              }
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Edit form"
                                          >
                                            <Edit2 className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
                                          </button>
                                        )}

                                        {/* Delete button - only visible to admins */}
                                        {isAdminUser() && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setTreatmentPlanFormToDelete(form);
                                              setShowDeleteTreatmentPlanFormConfirm(true);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            title="Delete form"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Settings className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500 mb-1">No administrative forms</p>
                            <p className="text-xs text-gray-400">Select a form type and click add to create</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultations */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Consultations ({consultationForms.length})</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Consultations List */}
                        {loadingConsultationForms ? (
                          <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading consultations...</p>
                          </div>
                        ) : consultationForms.length > 0 ? (
                          <div className="space-y-2">
                            {consultationForms.map((consultation, index) => (
                              <div
                                key={consultation.id || index}
                                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                                onClick={() => handleViewConsultation(consultation)}
                              >
                                {/* Header with consultation number */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      Consultation #{index + 1}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Badges Row */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {/* Consultation Status */}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                    consultation.consultation_status === 'completed'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : consultation.consultation_status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}>
                                    {consultation.consultation_status === 'completed' ? 'Completed' :
                                     consultation.consultation_status === 'in-progress' ? 'In Progress' :
                                     consultation.consultation_status || 'Pending'}
                                  </span>

                                  {/* Outcome Status (Treatment Decision) */}
                                  {consultation.treatment_decision && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                      consultation.treatment_decision === 'accepted'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : consultation.treatment_decision === 'declined'
                                        ? 'bg-red-100 text-red-800 border-red-200'
                                        : consultation.treatment_decision === 'followup-required'
                                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                                        : 'bg-purple-100 text-purple-800 border-purple-200'
                                    }`}>
                                      {consultation.treatment_decision === 'accepted' ? 'Treatment Accepted' :
                                       consultation.treatment_decision === 'declined' ? 'Treatment Declined' :
                                       consultation.treatment_decision === 'followup-required' ? 'Follow-up Required' :
                                       consultation.treatment_decision.charAt(0).toUpperCase() + consultation.treatment_decision.slice(1)}
                                    </span>
                                  )}
                                </div>

                                {/* Consultation Date */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Consultation Date:</span>
                                    <span className="font-medium text-gray-700">
                                      {consultation.consultation_date
                                        ? new Date(consultation.consultation_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })
                                        : new Date(consultation.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })
                                      }
                                    </span>
                                  </div>
                                </div>

                                {/* Patient Name */}
                                <div className="mb-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Patient:</span>
                                    <span className="font-medium text-gray-700">
                                      {consultation.patient_name}
                                    </span>
                                  </div>
                                </div>

                                {/* Additional Status Information */}
                                {(consultation.treatment_plan_approved !== null || consultation.follow_up_required) && (
                                  <div className="mb-2 space-y-1">
                                    {consultation.treatment_plan_approved !== null && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Treatment Plan:</span>
                                        <span className={`font-medium ${
                                          consultation.treatment_plan_approved
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                        }`}>
                                          {consultation.treatment_plan_approved ? 'Approved' : 'Not Approved'}
                                        </span>
                                      </div>
                                    )}
                                    {consultation.follow_up_required && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Follow-up:</span>
                                        <span className="font-medium text-orange-700">Required</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100">
                                  {/* View button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewConsultation(consultation);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                    title="View consultation"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-purple-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500 mb-1">No consultations</p>
                            <p className="text-xs text-gray-400">Consultation forms will appear here when available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Collection Sheet */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        IV Sedation Flow Chart ({ivSedationSheets.length})
                      </h3>
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

                        {/* IV Sedation Forms */}
                        {ivSedationSheets.length > 0 ? (
                          ivSedationSheets.map((sheet) => (
                            <div
                              key={sheet.id}
                              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 relative cursor-pointer"
                              onClick={() => handleViewIVSedationSheet(sheet)}
                            >
                              {/* Header with date and status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    sheet.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                  }`}></div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {new Date(sheet.sedation_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  sheet.status === 'completed'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                                }`}>
                                  {sheet.status === 'completed' ? 'Completed' : 'Draft'}
                                </span>
                              </div>

                              {/* Content preview */}
                              <div className="space-y-1">
                                {sheet.upper_treatment && sheet.upper_treatment !== 'NO TREATMENT' && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Upper:</span>
                                    <div className="text-right">
                                      <span className="text-xs text-gray-700">{sheet.upper_treatment}</span>
                                      {sheet.upper_surgery_type && (
                                        <span className="block text-xs text-blue-600 font-medium">
                                          {sheet.upper_surgery_type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {sheet.lower_treatment && sheet.lower_treatment !== 'NO TREATMENT' && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Lower:</span>
                                    <div className="text-right">
                                      <span className="text-xs text-gray-700">{sheet.lower_treatment}</span>
                                      {sheet.lower_surgery_type && (
                                        <span className="block text-xs text-blue-600 font-medium">
                                          {sheet.lower_surgery_type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer with timestamp */}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                  {new Date(sheet.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>

                                {/* Three dots menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIVSedationActiveDropdown(ivSedationActiveDropdown === sheet.id ? null : sheet.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                  >
                                    <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {ivSedationActiveDropdown === sheet.id && (
                                    <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIVSedationActiveDropdown(null);
                                          handleEditIVSedationSheet(sheet);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteIVSedationSheet(sheet);
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
                            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500 mb-1">No IV sedation flow charts</p>
                            <p className="text-xs text-gray-400">Use the button above to create your first flow chart</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Surgical Recall Sheet */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Surgical Recall Sheet ({surgicalRecallSheets.length})</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          onClick={() => setShowSurgicalRecallForm(true)}
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Surgical Recall Sheet</span>
                        </button>

                        {/* Surgical Recall Sheets */}
                        {surgicalRecallSheets.length > 0 ? (
                          surgicalRecallSheets.map((sheet) => (
                            <div
                              key={sheet.id}
                              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                              onClick={() => handleViewSurgicalRecallSheet(sheet)}
                            >
                              {/* Header with date and status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    sheet.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                                  }`}></div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {new Date(sheet.surgery_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  sheet.status === 'completed'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                                }`}>
                                  {sheet.status === 'completed' ? 'Completed' : 'Draft'}
                                </span>
                              </div>

                              {/* Content preview */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Arch Type:</span>
                                  <span className="text-xs text-gray-700 capitalize">{sheet.arch_type}</span>
                                </div>
                                {sheet.upper_surgery_type && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Upper:</span>
                                    <span className="text-xs text-blue-600 font-medium">{sheet.upper_surgery_type}</span>
                                  </div>
                                )}
                                {sheet.lower_surgery_type && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Lower:</span>
                                    <span className="text-xs text-blue-600 font-medium">{sheet.lower_surgery_type}</span>
                                  </div>
                                )}
                              </div>

                              {/* Footer with timestamp */}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                  {new Date(sheet.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>

                                {/* Three dots menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSurgicalRecallActiveDropdown(surgicalRecallActiveDropdown === sheet.id ? null : sheet.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                  >
                                    <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {surgicalRecallActiveDropdown === sheet.id && (
                                    <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSurgicalRecallActiveDropdown(null);
                                          handleEditSurgicalRecallSheet(sheet);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSurgicalRecallSheet(sheet);
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
                            <p className="text-sm font-medium text-gray-500 mb-1">No surgical recall sheets</p>
                            <p className="text-xs text-gray-400">Use the button above to create your first surgical recall sheet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Encounter Form */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
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

                  {/* Consultation Forms */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full max-h-full overflow-hidden flex-shrink-0" style={{ width: '350px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Consultation Forms (0)</h3>
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 min-h-0 scrollbar-enhanced">
                      <div className="space-y-3 pb-2">
                        {/* Add Button */}
                        <button
                          className="w-full px-4 py-2 bg-transparent border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Consultation Form</span>
                        </button>

                        {/* Empty State */}
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500 mb-1">No consultation forms</p>
                          <p className="text-xs text-gray-400">Use the button above to create your first consultation form</p>
                        </div>
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
          <DialogHeader>
            <DialogTitle className="text-blue-600">Edit Patient Profile</DialogTitle>
          </DialogHeader>
          {patient ? (
            <EditPatientForm
              patient={patient}
              onSubmit={handleEditSubmit}
            />
          ) : (
            <div>Loading patient data...</div>
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
        initialData={editingTreatment || (patient ? {
          archType: "",
          upperTreatment: "",
          lowerTreatment: "",
          upperSurgeryDate: "",
          lowerSurgeryDate: ""
        } : undefined)}
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
                    Pictures/CBCT
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
              <div className="flex-1 px-6 py-3 overflow-hidden" data-form-container>
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
                      Current Appliances
                    </h3>

                    {/* Current Appliances Row - Only show for non-pre-surgical reasons */}
                    {!dataCollectionFormData.reasonsForCollection.includes("PRE SURGICAL DATA COLLECTION") && (
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
                    )}

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

                          {/* CBCT Section - Always show for all reason selections */}
                          <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 ${
                            dataCollectionFormData.dataCollected.cbctTaken === null
                              ? 'border-red-300 bg-red-50 shadow-sm'
                              : 'border-gray-200 shadow-sm hover:shadow-md'
                          }`}>
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                CBCT (Yes or No) <span className="text-red-500 text-base">*</span>
                              </h5>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleDataCollectionToggle('cbctTaken', null, true)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    dataCollectionFormData.dataCollected.cbctTaken === true
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
                                  onClick={() => handleDataCollectionToggle('cbctTaken', null, false)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    dataCollectionFormData.dataCollected.cbctTaken === false
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
                        {selectedDataCollectionSheet.cbct_taken !== null && (
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors duration-200">
                            <span className="text-sm font-medium text-purple-900">CBCT</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedDataCollectionSheet.cbct_taken ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                selectedDataCollectionSheet.cbct_taken
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedDataCollectionSheet.cbct_taken ? 'Yes' : 'No'}
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
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3 relative">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Activity className="h-5 w-5 text-blue-600" />
                IV Sedation Flow Chart - Step {ivSedationCurrentStep} of {ivSedationTotalSteps}
              </DialogTitle>
            </div>

            {/* Auto-save status indicator - Compact bordered capsule positioned to avoid overlap */}
            <div className="absolute top-4 right-16 z-10">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-500 text-blue-600 rounded-full shadow-md">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-200 border-t-blue-600"></div>
                  </div>
                  <span className="text-xs font-medium">Saving...</span>
                </div>
              )}
              {(autoSaveStatus === 'saved' || (autoSaveStatus === 'idle' && lastSavedTime)) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-500 text-green-600 rounded-full shadow-md whitespace-nowrap">
                  <div className="relative">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {autoSaveStatus === 'saved' && (
                      <div className="absolute inset-0 rounded-full bg-green-200 opacity-30 animate-ping"></div>
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    Saved{lastSavedTime && ` at ${lastSavedTime}`}
                  </span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-500 text-red-600 rounded-full shadow-md animate-pulse">
                  <div className="relative">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-xs font-medium">Failed to save</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Progress Bar - Full Width with Separated Segments */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="w-full">
              {/* Progress Bar Container with Labels - Separated Segments */}
              <div className="flex items-center gap-2 w-full">
                {/* Step 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleIVSedationStepNavigation(1)}
                      className={`text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                        ivSedationCurrentStep >= 1 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Basic Info
                    </button>
                    {isStep1Complete() && (
                      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full ml-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleIVSedationStepNavigation(2)}
                      className={`text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                        ivSedationCurrentStep >= 2 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Pre-Assessment
                    </button>
                    {isStep2Complete() && (
                      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full ml-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 3 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleIVSedationStepNavigation(3)}
                      className={`text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                        ivSedationCurrentStep >= 3 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Sedation Plan
                    </button>
                    {isStep3Complete() && (
                      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full ml-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 4 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleIVSedationStepNavigation(4)}
                      className={`text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                        ivSedationCurrentStep >= 4 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Flow
                    </button>
                    {isStep4Complete() && (
                      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full ml-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Step 5 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleIVSedationStepNavigation(5)}
                      className={`text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer ${
                        ivSedationCurrentStep >= 5 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Recovery
                    </button>
                    {isStep5Complete() && (
                      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full ml-1">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    ivSedationCurrentStep >= 5 ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Form Content - Compact Design */}
          <div className="flex-1 flex flex-col min-h-0">
            <form className="flex-1 flex flex-col min-h-0">
              {/* Step Content Container - Hidden Scrollbar */}
              <div className="flex-1 px-6 py-2 overflow-y-auto scrollbar-hidden" data-form-container>
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
                          <Label htmlFor="ivDate" className="text-xs text-gray-600"><span className="text-red-500">*</span> Date</Label>
                          <Input
                            id="ivDate"
                            type="date"
                            value={ivSedationFormData.date}
                            onChange={(e) => updateIVSedationFormField('date', e.target.value)}
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

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-blue-800 font-medium"><span className="text-red-500">*</span> Treatment Type</Label>
                            <Select
                              value={ivSedationFormData.upperTreatment}
                              onValueChange={(value) => updateIVSedationFormField('upperTreatment', value)}
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

                          {/* Surgery Type Selection - Only show if treatment is selected and not "NO TREATMENT" */}
                          {ivSedationFormData.upperTreatment && ivSedationFormData.upperTreatment !== "NO TREATMENT" && (
                            <div>
                              <Label className="text-sm text-blue-800 font-medium mb-2 block">Surgery Type</Label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    ivSedationFormData.upperSurgeryType === "Surgery"
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                  onClick={() => updateIVSedationFormField('upperSurgeryType', 'Surgery')}
                                >
                                  Surgery
                                </button>
                                <button
                                  type="button"
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    ivSedationFormData.upperSurgeryType === "Surgical Revision"
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                  onClick={() => updateIVSedationFormField('upperSurgeryType', 'Surgical Revision')}
                                >
                                  Surgical Revision
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lower Treatment Section */}
                      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <h3 className="text-base font-semibold text-blue-900">Lower Arch Treatment</h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-blue-800 font-medium"><span className="text-red-500">*</span> Treatment Type</Label>
                            <Select
                              value={ivSedationFormData.lowerTreatment}
                              onValueChange={(value) => updateIVSedationFormField('lowerTreatment', value)}
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

                          {/* Surgery Type Selection - Only show if treatment is selected and not "NO TREATMENT" */}
                          {ivSedationFormData.lowerTreatment && ivSedationFormData.lowerTreatment !== "NO TREATMENT" && (
                            <div>
                              <Label className="text-sm text-blue-800 font-medium mb-2 block">Surgery Type</Label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    ivSedationFormData.lowerSurgeryType === "Surgery"
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                  onClick={() => updateIVSedationFormField('lowerSurgeryType', 'Surgery')}
                                >
                                  Surgery
                                </button>
                                <button
                                  type="button"
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    ivSedationFormData.lowerSurgeryType === "Surgical Revision"
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                  onClick={() => updateIVSedationFormField('lowerSurgeryType', 'Surgical Revision')}
                                >
                                  Surgical Revision
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                            <h4 className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Height</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Feet Selector */}
                            <div className="flex-1">
                              <Select
                                value={ivSedationFormData.heightFeet}
                                onValueChange={(value) => updateIVSedationFormField('heightFeet', value)}
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
                                onValueChange={(value) => updateIVSedationFormField('heightInches', value)}
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
                            <h4 className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Weight</h4>
                          </div>

                          <div className="space-y-3">
                            {/* Weight Input with Slider */}
                            <div className="relative">
                              <Input
                                type="number"
                                value={ivSedationFormData.weight}
                                onChange={(e) => updateIVSedationFormField('weight', e.target.value)}
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
                              onChange={(e) => updateIVSedationFormField('weight', e.target.value)}
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
                      <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> NPO Status</h3>
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
                              onClick={() => updateIVSedationFormField('npoStatus', 'yes')}
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
                              onClick={() => updateIVSedationFormField('npoStatus', 'no')}
                            >
                              NO
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-blue-800 mb-2">Have you taken any current medications this morning?</p>
                          <div className="flex gap-3 mb-3">
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                ivSedationFormData.morningMedications && ivSedationFormData.morningMedications !== 'no'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              onClick={() => updateIVSedationFormField('morningMedications', 'yes')}
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
                              onClick={() => updateIVSedationFormField('morningMedications', 'no')}
                            >
                              NO
                            </button>
                          </div>

                          {/* Show text field when YES is selected */}
                          {ivSedationFormData.morningMedications && ivSedationFormData.morningMedications !== 'no' && (
                            <div className="mt-3">
                              <Label htmlFor="morningMedicationsDetails" className="text-sm font-medium text-gray-700 mb-2 block">
                                Please list the medications taken this morning:
                              </Label>
                              <Textarea
                                id="morningMedicationsDetails"
                                value={ivSedationFormData.morningMedications === 'yes' ? '' : ivSedationFormData.morningMedications}
                                onChange={(e) => updateIVSedationFormField('morningMedications', e.target.value)}
                                placeholder="List medications, dosages, and times taken..."
                                rows={3}
                                className="w-full text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Allergies</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          'NKDA', 'Penicillin', 'Sulfa', 'Codeine', 'Aspirin', 'Ibuprofen',
                          'Latex', 'Iodine', 'Shellfish', 'Nuts', 'Eggs', 'Dairy',
                          'Environmental', 'Seasonal', 'Other'
                        ].map((allergy) => {
                          const isNA = ivSedationFormData.allergies?.includes('NKDA');
                          const isDisabled = isNA && allergy !== 'NKDA';

                          return (
                            <button
                              key={allergy}
                              type="button"
                              disabled={isDisabled}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                ivSedationFormData.allergies?.includes(allergy)
                                  ? 'bg-red-600 text-white'
                                  : isDisabled
                                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const currentAllergies = ivSedationFormData.allergies || [];
                                let updatedAllergies;

                                if (allergy === 'NKDA') {
                                  // If clicking NKDA, clear all other allergies and set only NKDA
                                  updatedAllergies = currentAllergies.includes('NKDA') ? [] : ['NKDA'];
                                } else {
                                  // If clicking any other allergy, remove NKDA if it exists and toggle the clicked allergy
                                  const allergiesWithoutNA = currentAllergies.filter(a => a !== 'NKDA');
                                  updatedAllergies = allergiesWithoutNA.includes(allergy)
                                    ? allergiesWithoutNA.filter(a => a !== allergy)
                                    : [...allergiesWithoutNA, allergy];
                                }

                                updateIVSedationFormField('allergies', updatedAllergies);

                                // Clear "Other" text field if "Other" option is unselected
                                if (allergy === 'Other' && currentAllergies.includes('Other') && !updatedAllergies.includes('Other')) {
                                  updateIVSedationFormField('allergiesOther', '');
                                }
                              }}
                            >
                              {allergy}
                            </button>
                          );
                        })}
                      </div>

                      {/* Other Allergies Text Field */}
                      {ivSedationFormData.allergies?.includes('Other') && (
                        <div className="mt-3">
                          <Label htmlFor="allergiesOther" className="text-xs text-blue-800">Please specify other allergies</Label>
                          <Input
                            id="allergiesOther"
                            type="text"
                            value={ivSedationFormData.allergiesOther || ''}
                            onChange={(e) => updateIVSedationFormField('allergiesOther', e.target.value)}
                            placeholder="Enter other allergies"
                            className="text-sm h-8 border-blue-300 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Female-specific Questions - Only show for female patients */}
                    {patient && patient.gender && patient.gender.toLowerCase() === 'female' && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Female Patients Only <span className="text-xs text-gray-500 font-normal">(Optional)</span></h3>
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
                                onClick={() => updateIVSedationFormField('pregnancyRisk', 'yes')}
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
                                onClick={() => updateIVSedationFormField('pregnancyRisk', 'no')}
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
                              onChange={(e) => updateIVSedationFormField('lastMenstrualCycle', e.target.value)}
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Medical History Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Anesthesia History */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Anesthesia History</h3>
                        <div className="space-y-2">
                          {[
                            'No Previous Anesthetic History',
                            'Previous Anesthetic without any problems or complications',
                            'Family Hx of Anesthetic Complications',
                            'Malignant Hyperthermia',
                            'Other'
                          ].map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                ivSedationFormData.anesthesiaHistory === option
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                updateIVSedationFormField('anesthesiaHistory', option);
                                // Clear "Other" text field if a different option is selected
                                if (option !== 'Other' && ivSedationFormData.anesthesiaHistory === 'Other') {
                                  updateIVSedationFormField('anesthesiaHistoryOther', '');
                                }
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        {/* Other Anesthesia History Text Field */}
                        {ivSedationFormData.anesthesiaHistory === 'Other' && (
                          <div className="mt-3">
                            <Label htmlFor="anesthesiaHistoryOther" className="text-xs text-blue-800">Please specify</Label>
                            <Input
                              id="anesthesiaHistoryOther"
                              type="text"
                              value={ivSedationFormData.anesthesiaHistoryOther || ''}
                              onChange={(e) => updateIVSedationFormField('anesthesiaHistoryOther', e.target.value)}
                              placeholder="Enter anesthesia history details"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Respiratory Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Respiratory Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Asthma', 'Anemia', 'Reactive Airway', 'Bronchitis', 'COPD',
                            'Dyspnea', 'Orthopnea', 'Recent URI', 'SOB', 'Tuberculosis', 'Other'
                          ].map((problem) => {
                            const isNA = ivSedationFormData.respiratoryProblems?.includes('NONE');
                            const isDisabled = isNA && problem !== 'NONE';

                            return (
                              <button
                                key={problem}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.respiratoryProblems?.includes(problem)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.respiratoryProblems || [];
                                  let updated: string[];

                                  if (problem === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const problemsWithoutNA = current.filter(p => p !== 'NONE');
                                    updated = problemsWithoutNA.includes(problem)
                                      ? problemsWithoutNA.filter(p => p !== problem)
                                      : [...problemsWithoutNA, problem];
                                  }

                                  updateIVSedationFormField('respiratoryProblems', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (problem === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('respiratoryProblemsOther', '');
                                  }
                                }}
                              >
                                {problem}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Respiratory Problems Text Field */}
                        {ivSedationFormData.respiratoryProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="respiratoryProblemsOther" className="text-xs text-blue-800">Please specify other respiratory problems</Label>
                            <Input
                              id="respiratoryProblemsOther"
                              type="text"
                              value={ivSedationFormData.respiratoryProblemsOther || ''}
                              onChange={(e) => updateIVSedationFormField('respiratoryProblemsOther', e.target.value)}
                              placeholder="Enter other respiratory problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Cardiovascular Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Cardiovascular Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Anemia', 'Congestive Heart Failure (CHF)', 'Dysrhythmia', 'Murmur', 'Hypertension (HTN)',
                            'Myocardial Infarction (MI)', 'Valvular DX', 'Rheumatic Fever', 'Sickle Cell Disease', 'Congenital Heart DX', 'Pacemaker', 'Other'
                          ].map((problem) => {
                            const isNA = ivSedationFormData.cardiovascularProblems?.includes('NONE');
                            const isDisabled = isNA && problem !== 'NONE';

                            return (
                              <button
                                key={problem}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.cardiovascularProblems?.includes(problem)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.cardiovascularProblems || [];
                                  let updated: string[];

                                  if (problem === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const problemsWithoutNA = current.filter(p => p !== 'NONE');
                                    updated = problemsWithoutNA.includes(problem)
                                      ? problemsWithoutNA.filter(p => p !== problem)
                                      : [...problemsWithoutNA, problem];
                                  }

                                  updateIVSedationFormField('cardiovascularProblems', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (problem === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('cardiovascularProblemsOther', '');
                                  }
                                }}
                              >
                                {problem}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Cardiovascular Problems Text Field */}
                        {ivSedationFormData.cardiovascularProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="cardiovascularProblemsOther" className="text-xs text-blue-800">Please specify other cardiovascular problems</Label>
                            <Input
                              id="cardiovascularProblemsOther"
                              type="text"
                              value={ivSedationFormData.cardiovascularProblemsOther || ''}
                              onChange={(e) => updateIVSedationFormField('cardiovascularProblemsOther', e.target.value)}
                              placeholder="Enter other cardiovascular problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Gastrointestinal Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Gastrointestinal Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Cirrhosis', 'Hepatitis', 'Reflux', 'Ulcers', 'Oesophageal Issues', 'Other'
                          ].map((problem) => {
                            const isNA = ivSedationFormData.gastrointestinalProblems?.includes('NONE');
                            const isDisabled = isNA && problem !== 'NONE';

                            return (
                              <button
                                key={problem}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.gastrointestinalProblems?.includes(problem)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.gastrointestinalProblems || [];
                                  let updated: string[];

                                  if (problem === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const problemsWithoutNA = current.filter(p => p !== 'NONE');
                                    updated = problemsWithoutNA.includes(problem)
                                      ? problemsWithoutNA.filter(p => p !== problem)
                                      : [...problemsWithoutNA, problem];
                                  }

                                  updateIVSedationFormField('gastrointestinalProblems', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (problem === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('gastrointestinalProblemsOther', '');
                                  }
                                }}
                              >
                                {problem}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Gastrointestinal Problems Text Field */}
                        {ivSedationFormData.gastrointestinalProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="gastrointestinalProblemsOther" className="text-xs text-blue-800">Please specify other gastrointestinal problems</Label>
                            <Input
                              id="gastrointestinalProblemsOther"
                              type="text"
                              value={ivSedationFormData.gastrointestinalProblemsOther || ''}
                              onChange={(e) => updateIVSedationFormField('gastrointestinalProblemsOther', e.target.value)}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Neurologic Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Cerebral Vascular Accident (CVA)', 'Headaches', 'Transient Ischemic Attack (TIA)', 'Syncope', 'Seizures', 'Other'
                          ].map((problem) => {
                            const isNA = ivSedationFormData.neurologicProblems?.includes('NONE');
                            const isDisabled = isNA && problem !== 'NONE';

                            return (
                              <button
                                key={problem}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.neurologicProblems?.includes(problem)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.neurologicProblems || [];
                                  let updated: string[];

                                  if (problem === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const problemsWithoutNA = current.filter(p => p !== 'NONE');
                                    updated = problemsWithoutNA.includes(problem)
                                      ? problemsWithoutNA.filter(p => p !== problem)
                                      : [...problemsWithoutNA, problem];
                                  }

                                  updateIVSedationFormField('neurologicProblems', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (problem === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('neurologicProblemsOther', '');
                                  }
                                }}
                              >
                                {problem}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Neurologic Problems Text Field */}
                        {ivSedationFormData.neurologicProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="neurologicProblemsOther" className="text-xs text-blue-800">Please specify other neurologic problems</Label>
                            <Input
                              id="neurologicProblemsOther"
                              type="text"
                              value={ivSedationFormData.neurologicProblemsOther || ''}
                              onChange={(e) => updateIVSedationFormField('neurologicProblemsOther', e.target.value)}
                              placeholder="Enter other neurologic problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Endocrine/Renal Problems */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Endocrine/Renal Problems</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Diabetes', 'Dialysis', 'Thyroid DX', 'Renal Failure', 'Other'
                          ].map((problem) => {
                            const isNA = ivSedationFormData.endocrineRenalProblems?.includes('NONE');
                            const isDisabled = isNA && problem !== 'NONE';

                            return (
                              <button
                                key={problem}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.endocrineRenalProblems?.includes(problem)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.endocrineRenalProblems || [];
                                  let updated: string[];

                                  if (problem === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const problemsWithoutNA = current.filter(p => p !== 'NONE');
                                    updated = problemsWithoutNA.includes(problem)
                                      ? problemsWithoutNA.filter(p => p !== problem)
                                      : [...problemsWithoutNA, problem];
                                  }

                                  updateIVSedationFormField('endocrineRenalProblems', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (problem === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('endocrineRenalProblemsOther', '');
                                  }

                                  // Clear A1C field if "Diabetes" option is unselected
                                  if (problem === 'Diabetes' && current.includes('Diabetes') && !updated.includes('Diabetes')) {
                                    updateIVSedationFormField('lastA1CLevel', '');
                                  }
                                }}
                              >
                                {problem}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Endocrine/Renal Problems Text Field */}
                        {ivSedationFormData.endocrineRenalProblems?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="endocrineRenalProblemsOther" className="text-xs text-blue-800">Please specify other endocrine/renal problems</Label>
                            <Input
                              id="endocrineRenalProblemsOther"
                              type="text"
                              value={ivSedationFormData.endocrineRenalProblemsOther || ''}
                              onChange={(e) => updateIVSedationFormField('endocrineRenalProblemsOther', e.target.value)}
                              placeholder="Enter other endocrine/renal problems"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}

                        {/* A1C Level Input - Only show when Diabetes is selected */}
                        {ivSedationFormData.endocrineRenalProblems?.includes('Diabetes') && (
                          <div className="mt-3">
                            <Label htmlFor="lastA1CLevel" className="text-xs text-blue-800">
                              Last A1C Level <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="lastA1CLevel"
                                type="text"
                                value={ivSedationFormData.lastA1CLevel || ''}
                                onChange={(e) => updateIVSedationFormField('lastA1CLevel', e.target.value)}
                                placeholder="7.2"
                                className="text-sm h-8 border-blue-300 focus:border-blue-500 w-20"
                              />
                              <span className="text-sm font-medium text-blue-800">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Miscellaneous - Full Width */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Miscellaneous</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                        {[
                          'NONE', 'Artificial Valve', 'Heart Birth Defect', 'Bypass', 'Seizures', 'Stroke',
                          'Parkinson\'s Disease', 'Dementia (Alzheimer\'s)', 'Anxiety', 'Schizophrenia', 'Eating Disorder',
                          'HIV', 'AIDS', 'Rheumatoid Arthritis', 'Lupus', 'Fibromyalgia', 'Immunosuppressive Disease',
                          'Prolonged Bleeding', 'Platelet Disorder', 'Sickle Cell', 'Hemophilia', 'Chronic Kidney Disease',
                          'Osteoporosis', 'Artificial Joint', 'Muscle Weakness', 'Cancer', 'Chemotherapy', 'Other'
                        ].map((condition) => {
                          const isNA = ivSedationFormData.miscellaneous?.includes('NONE');
                          const isDisabled = isNA && condition !== 'NONE';

                          return (
                            <button
                              key={condition}
                              type="button"
                              disabled={isDisabled}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                ivSedationFormData.miscellaneous?.includes(condition)
                                  ? 'bg-blue-600 text-white'
                                  : isDisabled
                                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                const current = ivSedationFormData.miscellaneous || [];
                                let updated: string[];

                                if (condition === 'NONE') {
                                  updated = current.includes('NONE') ? [] : ['NONE'];
                                } else {
                                  const conditionsWithoutNA = current.filter(c => c !== 'NONE');
                                  updated = conditionsWithoutNA.includes(condition)
                                    ? conditionsWithoutNA.filter(c => c !== condition)
                                    : [...conditionsWithoutNA, condition];
                                }

                                updateIVSedationFormField('miscellaneous', updated);

                                // Clear "Other" text field if "Other" option is unselected
                                if (condition === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                  updateIVSedationFormField('miscellaneousOther', '');
                                }
                              }}
                            >
                              {condition}
                            </button>
                          );
                        })}
                      </div>

                      {/* Other Miscellaneous Text Field */}
                      {ivSedationFormData.miscellaneous?.includes('Other') && (
                        <div className="mt-3">
                          <Label htmlFor="miscellaneousOther" className="text-xs text-blue-800">Please specify other conditions</Label>
                          <Input
                            id="miscellaneousOther"
                            type="text"
                            value={ivSedationFormData.miscellaneousOther || ''}
                            onChange={(e) => updateIVSedationFormField('miscellaneousOther', e.target.value)}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Social History</h3>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            'NONE', 'Tobacco', 'ETOH Consumption', 'Recreational Drugs', 'Other'
                          ].map((habit) => {
                            const isNA = ivSedationFormData.socialHistory?.includes('NONE');
                            const isDisabled = isNA && habit !== 'NONE';

                            return (
                              <button
                                key={habit}
                                type="button"
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                  ivSedationFormData.socialHistory?.includes(habit)
                                    ? 'bg-blue-600 text-white'
                                    : isDisabled
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                }`}
                                onClick={() => {
                                  const current = ivSedationFormData.socialHistory || [];
                                  let updated: string[];

                                  if (habit === 'NONE') {
                                    updated = current.includes('NONE') ? [] : ['NONE'];
                                  } else {
                                    const habitsWithoutNA = current.filter(h => h !== 'NONE');
                                    updated = habitsWithoutNA.includes(habit)
                                      ? habitsWithoutNA.filter(h => h !== habit)
                                      : [...habitsWithoutNA, habit];
                                  }

                                  updateIVSedationFormField('socialHistory', updated);

                                  // Clear "Other" text field if "Other" option is unselected
                                  if (habit === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                    updateIVSedationFormField('socialHistoryOther', '');
                                  }
                                }}
                              >
                                {habit}
                              </button>
                            );
                          })}
                        </div>

                        {/* Other Social History Text Field */}
                        {ivSedationFormData.socialHistory?.includes('Other') && (
                          <div className="mt-3">
                            <Label htmlFor="socialHistoryOther" className="text-xs text-blue-800">Please specify other social history</Label>
                            <Input
                              id="socialHistoryOther"
                              type="text"
                              value={ivSedationFormData.socialHistoryOther || ''}
                              onChange={(e) => updateIVSedationFormField('socialHistoryOther', e.target.value)}
                              placeholder="Enter other social history"
                              className="text-sm h-8 border-blue-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Patient Assessment */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Patient Assessment</h3>
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
                                onClick={() => updateIVSedationFormField('wellDevelopedNourished', 'yes')}
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
                                onClick={() => updateIVSedationFormField('wellDevelopedNourished', 'no')}
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
                                onClick={() => updateIVSedationFormField('patientAnxious', 'yes')}
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
                                onClick={() => updateIVSedationFormField('patientAnxious', 'no')}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> ASA Classification</h3>
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
                                onClick={() => updateIVSedationFormField('asaClassification', classification)}
                              >
                                {classification}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Airway Evaluation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Airway Evaluation</h3>
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
                                updateIVSedationFormField('airwayEvaluation', updated);

                                // Clear "Other" text field if "Other" option is unselected
                                if (evaluation === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                  updateIVSedationFormField('airwayEvaluationOther', '');
                                }
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
                              onChange={(e) => updateIVSedationFormField('airwayEvaluationOther', e.target.value)}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Mallampati Score</h3>
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
                              onClick={() => updateIVSedationFormField('mallampatiScore', score)}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Heart and Lung Evaluation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Heart and Lung Evaluation</h3>
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
                                updateIVSedationFormField('heartLungEvaluation', updated);

                                // Clear "Other" text field if "Other" option is unselected
                                if (evaluation === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                  updateIVSedationFormField('heartLungEvaluationOther', '');
                                }
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
                              onChange={(e) => updateIVSedationFormField('heartLungEvaluationOther', e.target.value)}
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
                        <span className="text-red-500">*</span> Instruments Checklist
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
                                  Array.isArray(ivSedationFormData.instrumentsChecklist) && ivSedationFormData.instrumentsChecklist.includes(instrument.key)
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                                onClick={() => {
                                  const current = Array.isArray(ivSedationFormData.instrumentsChecklist) ? ivSedationFormData.instrumentsChecklist : [];
                                  const isChecked = current.includes(instrument.key);
                                  const updated = isChecked
                                    ? current.filter(item => item !== instrument.key)
                                    : [...current, instrument.key];
                                  updateIVSedationFormField('instrumentsChecklist', updated);
                                }}
                              >
                                {Array.isArray(ivSedationFormData.instrumentsChecklist) && ivSedationFormData.instrumentsChecklist.includes(instrument.key) && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <div className={`text-xs mt-2 transition-colors ${
                              Array.isArray(ivSedationFormData.instrumentsChecklist) && ivSedationFormData.instrumentsChecklist.includes(instrument.key)
                                ? 'text-green-600 font-medium'
                                : 'text-gray-500'
                            }`}>
                              {Array.isArray(ivSedationFormData.instrumentsChecklist) && ivSedationFormData.instrumentsChecklist.includes(instrument.key) ? 'Checked' : 'Not Checked'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sedation Plan Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sedation Type */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Sedation Type</h3>
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
                              onClick={() => updateIVSedationFormField('sedationType', type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Medications Planned */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Medications Planned</h3>
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
                                updateIVSedationFormField('medicationsPlanned', updated);

                                // Clear "Other" text field if "Other" option is unselected
                                if (medication === 'Other' && current.includes('Other') && !updated.includes('Other')) {
                                  updateIVSedationFormField('medicationsOther', '');
                                }
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
                              onChange={(e) => updateIVSedationFormField('medicationsOther', e.target.value)}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Route of Administration</h3>
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
                                updateIVSedationFormField('administrationRoute', updated);
                              }}
                            >
                              {route}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Emergency Protocols */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Emergency Protocols</h3>
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
                                  Array.isArray(ivSedationFormData.emergencyProtocols) && ivSedationFormData.emergencyProtocols.includes(protocol)
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                                onClick={() => {
                                  const current = Array.isArray(ivSedationFormData.emergencyProtocols) ? ivSedationFormData.emergencyProtocols : [];
                                  const isChecked = current.includes(protocol);
                                  const updated = isChecked
                                    ? current.filter(item => item !== protocol)
                                    : [...current, protocol];
                                  updateIVSedationFormField('emergencyProtocols', updated);
                                }}
                              >
                                {Array.isArray(ivSedationFormData.emergencyProtocols) && ivSedationFormData.emergencyProtocols.includes(protocol) && (
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



                {/* Step 4: Flow - Monitoring During Surgery */}
                {ivSedationCurrentStep === 4 && (
                  <div className="space-y-4">
                    {/* Time Tracking Section */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-500">*</span> Time Tracking
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Time in Room */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Time in Room</h4>
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
                                updateIVSedationFormField('timeInRoom', estTime);
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
                            onChange={(e) => updateIVSedationFormField('timeInRoom', e.target.value)}
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
                            <h4 className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Sedation Start Time</h4>
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
                                updateIVSedationFormField('sedationStartTime', estTime);
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
                            onChange={(e) => updateIVSedationFormField('sedationStartTime', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                          {ivSedationFormData.sedationStartTime && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Sedation started at {ivSedationFormData.sedationStartTime} EST
                            </div>
                          )}
                        </div>
                      </div>


                    </div>

                    {/* Add Entry Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-red-500">*</span> Monitoring Log
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
                                        {entry.medications.map((medication, index) => {
                                          // Handle both new string format and legacy ID format
                                          let displayText = '';
                                          if (typeof medication === 'string') {
                                            // New format: "dosage | medication name"
                                            displayText = medication;
                                          } else {
                                            // Legacy format: find by ID
                                            const legacyMed = medicationOptions.find(med => med.id === medication);
                                            displayText = legacyMed ? legacyMed.name : medication;
                                          }

                                          return (
                                            <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                              {displayText}
                                            </div>
                                          );
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
                                          const [systolic, diastolic] = entry.bp ? entry.bp.split('/') : ['', ''];

                                          setNewFlowEntry({
                                            time: entry.time || '',
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
                                          updateIVSedationFormField('flowEntries', updatedEntries);
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

                    {/* Sedation End Time & Out of Room Time Section */}
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-500">*</span> Procedure Completion Times
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sedation End Time */}
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-red-900"><span className="text-red-500">*</span> Sedation End Time</h4>
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
                                updateIVSedationFormField('sedationEndTime', estTime);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                            >
                              Current Time
                            </button>
                          </div>
                          <p className="text-xs text-red-700 mb-2">When sedation administration ends</p>
                          <input
                            type="time"
                            value={ivSedationFormData.sedationEndTime}
                            onChange={(e) => updateIVSedationFormField('sedationEndTime', e.target.value)}
                            className="w-full px-3 py-2 border border-red-300 rounded-md focus:border-red-500 focus:outline-none text-sm"
                          />
                          {ivSedationFormData.sedationEndTime && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Sedation ended at {ivSedationFormData.sedationEndTime} EST
                            </div>
                          )}
                        </div>

                        {/* Out of Room Time */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-purple-900"><span className="text-red-500">*</span> Out of Room Time</h4>
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
                                updateIVSedationFormField('outOfRoomTime', estTime);
                              }}
                              className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                            >
                              Current Time
                            </button>
                          </div>
                          <p className="text-xs text-purple-700 mb-2">When patient leaves the operation room</p>
                          <input
                            type="time"
                            value={ivSedationFormData.outOfRoomTime}
                            onChange={(e) => updateIVSedationFormField('outOfRoomTime', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:outline-none text-sm"
                          />
                          {ivSedationFormData.outOfRoomTime && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Patient left room at {ivSedationFormData.outOfRoomTime} EST
                            </div>
                          )}
                        </div>
                      </div>


                    </div>

                    {/* Complete Time Summary - Separate Card */}
                    {ivSedationFormData.timeInRoom && ivSedationFormData.sedationStartTime && ivSedationFormData.sedationEndTime && ivSedationFormData.outOfRoomTime && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Complete Time Summary
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                                if (ivSedationFormData.timeInRoom && ivSedationFormData.sedationStartTime) {
                                  const roomTime = ivSedationFormData.timeInRoom.split(':');
                                  const sedationTime = ivSedationFormData.sedationStartTime.split(':');
                                  const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                                  const sedationMinutes = parseInt(sedationTime[0]) * 60 + parseInt(sedationTime[1]);
                                  const diffMinutes = sedationMinutes - roomMinutes;

                                  if (diffMinutes >= 0) {
                                    const hours = Math.floor(diffMinutes / 60);
                                    const minutes = diffMinutes % 60;
                                    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                  }
                                }
                                return '--';
                              })()}
                            </div>
                            <div className="text-xs text-gray-500">duration</div>
                          </div>

                          {/* Sedation End Card */}
                          <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700">Sedation End</span>
                            </div>
                            <div className="text-lg font-bold text-red-600">{ivSedationFormData.sedationEndTime}</div>
                            <div className="text-xs text-gray-500">EST</div>
                          </div>

                          {/* Out of Room Card */}
                          <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700">Out of Room</span>
                            </div>
                            <div className="text-lg font-bold text-purple-600">{ivSedationFormData.outOfRoomTime}</div>
                            <div className="text-xs text-gray-500">EST</div>
                          </div>

                          {/* Sedation Duration Card */}
                          <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700">Sedation Duration</span>
                            </div>
                            <div className="text-lg font-bold text-indigo-600">
                              {(() => {
                                if (ivSedationFormData.sedationStartTime && ivSedationFormData.sedationEndTime) {
                                  const startTime = ivSedationFormData.sedationStartTime.split(':');
                                  const endTime = ivSedationFormData.sedationEndTime.split(':');

                                  if (startTime.length === 2 && endTime.length === 2) {
                                    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
                                    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
                                    const diffMinutes = endMinutes - startMinutes;

                                    if (diffMinutes >= 0) {
                                      const hours = Math.floor(diffMinutes / 60);
                                      const minutes = diffMinutes % 60;
                                      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                    }
                                  }
                                }
                                return '--';
                              })()}
                            </div>
                            <div className="text-xs text-gray-500">duration</div>
                          </div>
                        </div>

                        {/* Second Row for Total Room Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
                          {/* Total Room Time Card */}
                          <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700">Total Room Time</span>
                            </div>
                            <div className="text-lg font-bold text-amber-600">
                              {(() => {
                                const roomTime = ivSedationFormData.timeInRoom.split(':');
                                const outTime = ivSedationFormData.outOfRoomTime.split(':');
                                const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                                const outMinutes = parseInt(outTime[0]) * 60 + parseInt(outTime[1]);
                                const diffMinutes = outMinutes - roomMinutes;

                                if (diffMinutes >= 0) {
                                  const hours = Math.floor(diffMinutes / 60);
                                  const minutes = diffMinutes % 60;
                                  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                }
                                return '--';
                              })()}
                            </div>
                            <div className="text-xs text-gray-500">total time</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Level of Sedation Card */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Level of Sedation
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          {
                            id: 'minimal',
                            label: 'Minimal Sedation',
                            description: 'Anxiolysis - Normal response to verbal stimulation',
                            color: 'bg-green-100 border-green-300 text-green-800'
                          },
                          {
                            id: 'moderate',
                            label: 'Moderate Sedation',
                            description: 'Conscious sedation - Purposeful response to verbal/tactile stimulation',
                            color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          },
                          {
                            id: 'deep',
                            label: 'Deep Sedation',
                            description: 'Purposeful response following repeated/painful stimulation',
                            color: 'bg-orange-100 border-orange-300 text-orange-800'
                          },
                          {
                            id: 'general',
                            label: 'General Anesthesia',
                            description: 'Loss of consciousness - Not arousable even with painful stimulation',
                            color: 'bg-red-100 border-red-300 text-red-800'
                          }
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                              ivSedationFormData.levelOfSedation === level.id
                                ? level.color + ' ring-2 ring-offset-2 ring-indigo-500'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                            onClick={() => updateIVSedationFormField('levelOfSedation', level.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                ivSedationFormData.levelOfSedation === level.id
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="font-semibold text-sm">{level.label}</span>
                            </div>
                            <p className="text-xs leading-relaxed">{level.description}</p>
                          </button>
                        ))}
                      </div>

                      {ivSedationFormData.levelOfSedation && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-semibold text-indigo-900">Selected Level:</span>
                          </div>
                          <div className="text-sm text-indigo-800">
                            {(() => {
                              const selectedLevel = [
                                { id: 'minimal', label: 'Minimal Sedation (Anxiolysis)' },
                                { id: 'moderate', label: 'Moderate Sedation (Conscious Sedation)' },
                                { id: 'deep', label: 'Deep Sedation' },
                                { id: 'general', label: 'General Anesthesia' }
                              ].find(level => level.id === ivSedationFormData.levelOfSedation);
                              return selectedLevel ? selectedLevel.label : '';
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Recovery */}
                {ivSedationCurrentStep === 5 && (
                  <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Alert and Oriented */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Alert and Oriented</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.alertOriented === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('alertOriented', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.alertOriented === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('alertOriented', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Protective Reflexes Intact */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Protective Reflexes Intact</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.protectiveReflexes === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('protectiveReflexes', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.protectiveReflexes === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('protectiveReflexes', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Breathing Spontaneously */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Breathing Spontaneously</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.breathingSpontaneously === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('breathingSpontaneously', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.breathingSpontaneously === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('breathingSpontaneously', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Post-Op Nausea/Vomiting */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Post-Op Nausea/Vomiting</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.postOpNausea === 'yes'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('postOpNausea', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.postOpNausea === 'no'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('postOpNausea', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Patient Caregiver Present */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Patient Caregiver Present</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.caregiverPresent === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('caregiverPresent', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.caregiverPresent === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('caregiverPresent', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Return To Baseline Mental Status */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Return To Baseline Mental Status</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.baselineMentalStatus === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('baselineMentalStatus', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.baselineMentalStatus === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('baselineMentalStatus', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Second Row of Assessment Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Responsive To Verbal Commands */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Responsive To Verbal Commands</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.responsiveVerbalCommands === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('responsiveVerbalCommands', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.responsiveVerbalCommands === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('responsiveVerbalCommands', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Saturating Appropriately on Room Air */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Saturating Appropriately on Room Air</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.saturatingRoomAir === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('saturatingRoomAir', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.saturatingRoomAir === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('saturatingRoomAir', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Vital Signs Returned to Baseline */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Vital Signs Returned to Baseline</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.vitalSignsBaseline === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('vitalSignsBaseline', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.vitalSignsBaseline === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('vitalSignsBaseline', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      {/* Pain During Recovery */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Pain During Recovery</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.painDuringRecovery === 'yes'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('painDuringRecovery', 'yes')}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              ivSedationFormData.painDuringRecovery === 'no'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => updateIVSedationFormField('painDuringRecovery', 'no')}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Button Selection Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Post-Op Instructions Given To */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Post-Op Instructions Given To</h3>
                        <div className="space-y-2">
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.postOpInstructionsGivenTo === 'Patient and Escort'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('postOpInstructionsGivenTo', 'Patient and Escort')}
                          >
                            Patient and Escort
                          </button>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.postOpInstructionsGivenTo === 'Patient'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('postOpInstructionsGivenTo', 'Patient')}
                          >
                            Patient
                          </button>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.postOpInstructionsGivenTo === 'Escort'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('postOpInstructionsGivenTo', 'Escort')}
                          >
                            Escort
                          </button>
                        </div>
                      </div>

                      {/* Follow Up Instructions Given To */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Follow Up Instructions Given To</h3>
                        <div className="space-y-2">
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.followUpInstructionsGivenTo === 'Patient and Escort'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('followUpInstructionsGivenTo', 'Patient and Escort')}
                          >
                            Patient and Escort
                          </button>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.followUpInstructionsGivenTo === 'Patient'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('followUpInstructionsGivenTo', 'Patient')}
                          >
                            Patient
                          </button>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.followUpInstructionsGivenTo === 'Escort'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('followUpInstructionsGivenTo', 'Escort')}
                          >
                            Escort
                          </button>
                        </div>
                      </div>

                      {/* Discharged To */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3"><span className="text-red-500">*</span> Discharged To</h3>
                        <div className="space-y-2">
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.dischargedTo === 'Home'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('dischargedTo', 'Home')}
                          >
                            Home
                          </button>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                              ivSedationFormData.dischargedTo === 'Office'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => updateIVSedationFormField('dischargedTo', 'Office')}
                          >
                            Office
                          </button>
                        </div>
                      </div>

                      {/* Level of Pain At Discharge */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <Label htmlFor="painLevelDischarge" className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Level of Pain At Discharge (0-10)</Label>
                        <Input
                          id="painLevelDischarge"
                          type="number"
                          min="0"
                          max="10"
                          value={ivSedationFormData.painLevelDischarge}
                          onChange={(e) => updateIVSedationFormField('painLevelDischarge', e.target.value)}
                          placeholder="0-10"
                          className="mt-2 text-sm h-8 border-blue-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Other Remarks */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Label htmlFor="otherRemarks" className="text-sm font-semibold text-blue-900"><span className="text-red-500">*</span> Other Remarks</Label>
                      <textarea
                        id="otherRemarks"
                        value={ivSedationFormData.otherRemarks}
                        onChange={(e) => updateIVSedationFormField('otherRemarks', e.target.value)}
                        placeholder="Enter any additional remarks or observations..."
                        rows={4}
                        className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:outline-none text-sm resize-none"
                      />
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

                <Button
                  type="button"
                  onClick={handleIVSedationNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {ivSedationCurrentStep === ivSedationTotalSteps ? 'Review and Submit' : 'Next'}
                </Button>
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

      {/* IV Sedation Delete Confirmation Dialog */}
      <Dialog open={showIVSedationDeleteConfirmation} onOpenChange={setShowIVSedationDeleteConfirmation}>
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
              Are you sure you want to delete this IV sedation form? This action cannot be undone.
            </p>
            {ivSedationSheetToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>Patient:</strong> {ivSedationSheetToDelete.patient_name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(ivSedationSheetToDelete.sedation_date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowIVSedationDeleteConfirmation(false);
                setIVSedationSheetToDelete(null);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmIVSedationDelete}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Time</label>
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
                      setNewFlowEntry({...newFlowEntry, time: estTime});
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Current Time
                  </button>
                </div>
                <input
                  type="time"
                  value={newFlowEntry.time}
                  onChange={(e) => setNewFlowEntry({...newFlowEntry, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                />
                {newFlowEntry.time && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Entry time: {newFlowEntry.time} EST
                  </div>
                )}
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

              {/* Medications Section - New Dropdown Approach */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">Medications</label>

                {/* Selected Medications Display */}
                {newFlowEntry.medications.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Selected:</div>
                    <div className="flex flex-wrap gap-1">
                      {newFlowEntry.medications.map((medication, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {medication}
                          <button
                            type="button"
                            onClick={() => {
                              setNewFlowEntry({
                                ...newFlowEntry,
                                medications: newFlowEntry.medications.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Medication Form */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="text-xs font-medium text-gray-700 mb-2">Add Medication</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    {/* Medication Name Dropdown/Input */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Medication</label>
                      {newMedication.isCustomMedication ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={newMedication.name}
                            onChange={(e) => setNewMedication({
                              ...newMedication,
                              name: e.target.value,
                              dosage: '',
                              unit: '',
                              isCustomDosage: true,
                              isCustomUnit: true
                            })}
                            placeholder="Enter custom medication"
                            className="w-full h-7 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none pr-6"
                          />
                          <button
                            type="button"
                            onClick={() => setNewMedication({
                              ...newMedication,
                              name: '',
                              dosage: '',
                              unit: '',
                              isCustomMedication: false,
                              isCustomDosage: false,
                              isCustomUnit: false
                            })}
                            className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <Select
                          value={newMedication.name}
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              setNewMedication({
                                ...newMedication,
                                name: '',
                                dosage: '',
                                unit: '',
                                isCustomMedication: true,
                                isCustomDosage: true
                              });
                            } else {
                              const medicationOptions = medicationOptionsNew[value] || [];
                              const allUnits = [...new Set(medicationOptions.map(option => option.unit))];

                              setNewMedication({
                                ...newMedication,
                                name: value,
                                dosage: '',
                                unit: allUnits.length === 1 ? allUnits[0] : '',
                                isCustomMedication: false,
                                isCustomDosage: false
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-7 text-xs">
                            <SelectValue placeholder="Select medication" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicationNames.map((name) => (
                              <SelectItem key={name} value={name} className="text-xs">{name}</SelectItem>
                            ))}
                            <SelectItem value="custom" className="text-xs font-medium text-blue-600">+ Custom Medication</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Dosage Dropdown/Input - Shows medication-specific dosages or custom input */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Dosage</label>
                      {newMedication.isCustomDosage ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                            placeholder="Enter dosage"
                            className="w-full h-7 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none pr-6"
                            disabled={!newMedication.name}
                          />
                          {!newMedication.isCustomMedication && (
                            <button
                              type="button"
                              onClick={() => setNewMedication({
                                ...newMedication,
                                dosage: '',
                                unit: '',
                                isCustomDosage: false
                              })}
                              className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <Select
                          value={newMedication.dosage}
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              setNewMedication({
                                ...newMedication,
                                dosage: '',
                                unit: '',
                                isCustomDosage: true
                              });
                            } else {
                              const availableUnits = medicationOptionsNew[newMedication.name]
                                ?.filter(option => option.dosage === value)
                                .map(option => option.unit);
                              const uniqueUnits = [...new Set(availableUnits)];

                              setNewMedication({
                                ...newMedication,
                                dosage: value,
                                unit: uniqueUnits.length === 1 ? uniqueUnits[0] : ''
                              });
                            }
                          }}
                          disabled={!newMedication.name}
                        >
                          <SelectTrigger className="w-full h-7 text-xs">
                            <SelectValue placeholder={newMedication.name ? "Select dosage" : "Select medication first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {newMedication.name && !newMedication.isCustomMedication && [...new Set(medicationOptionsNew[newMedication.name]?.map(option => option.dosage))].map((dosage, index) => (
                              <SelectItem key={index} value={dosage} className="text-xs">
                                {dosage}
                              </SelectItem>
                            ))}
                            {newMedication.name && (
                              <SelectItem value="custom" className="text-xs font-medium text-blue-600">+ Custom Dosage</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Unit Dropdown - Shows medication-specific units or common units for custom medications */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Unit</label>
                      <Select
                        value={newMedication.unit}
                        onValueChange={(value) => setNewMedication({...newMedication, unit: value})}
                        disabled={!newMedication.name || !newMedication.dosage}
                      >
                        <SelectTrigger className="w-full h-7 text-xs">
                          <SelectValue placeholder={
                            !newMedication.name ? "Select medication first" :
                            !newMedication.dosage ? "Select dosage first" :
                            "Select unit"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Show common units for custom medications */}
                          {newMedication.name && newMedication.dosage && newMedication.isCustomMedication &&
                            commonUnitOptions.map((unit, index) => (
                              <SelectItem key={index} value={unit} className="text-xs">
                                {unit}
                              </SelectItem>
                            ))
                          }

                          {/* Show medication-specific units for predefined medications */}
                          {newMedication.name && newMedication.dosage && !newMedication.isCustomMedication && !newMedication.isCustomDosage && (() => {
                            const availableUnits = medicationOptionsNew[newMedication.name]
                              ?.filter(option => option.dosage === newMedication.dosage)
                              .map(option => option.unit);
                            const uniqueUnits = [...new Set(availableUnits)];

                            return uniqueUnits.map((unit, index) => (
                              <SelectItem key={index} value={unit} className="text-xs">
                                {unit}
                              </SelectItem>
                            ));
                          })()}

                          {/* Show common units for custom dosages on predefined medications */}
                          {newMedication.name && newMedication.dosage && !newMedication.isCustomMedication && newMedication.isCustomDosage &&
                            commonUnitOptions.map((unit, index) => (
                              <SelectItem key={index} value={unit} className="text-xs">
                                {unit}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (newMedication.name && newMedication.dosage && newMedication.unit) {
                            // For custom medications, skip validation
                            if (newMedication.isCustomMedication || newMedication.isCustomDosage) {
                              const medicationString = `${newMedication.dosage} ${newMedication.unit} | ${newMedication.name}`;
                              setNewFlowEntry({
                                ...newFlowEntry,
                                medications: [...newFlowEntry.medications, medicationString]
                              });
                              setNewMedication({
                                name: '',
                                dosage: '',
                                unit: '',
                                isCustomMedication: false,
                                isCustomDosage: false
                              });
                            } else {
                              // Validate that the dosage-unit combination exists for predefined medications
                              const validCombination = medicationOptionsNew[newMedication.name]?.some(
                                option => option.dosage === newMedication.dosage && option.unit === newMedication.unit
                              );

                              if (validCombination) {
                                const medicationString = `${newMedication.dosage} ${newMedication.unit} | ${newMedication.name}`;
                                setNewFlowEntry({
                                  ...newFlowEntry,
                                  medications: [...newFlowEntry.medications, medicationString]
                                });
                                setNewMedication({
                                  name: '',
                                  dosage: '',
                                  unit: '',
                                  isCustomMedication: false,
                                  isCustomDosage: false
                                });
                              }
                            }
                          }
                        }}
                        disabled={
                          !newMedication.name ||
                          !newMedication.dosage ||
                          !newMedication.unit ||
                          (!newMedication.isCustomMedication && !newMedication.isCustomDosage &&
                           !medicationOptionsNew[newMedication.name]?.some(
                             option => option.dosage === newMedication.dosage && option.unit === newMedication.unit
                           ))
                        }
                        className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                    </div>
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
                  time: '',
                  systolic: '',
                  diastolic: '',
                  heartRate: '',
                  rr: '',
                  spo2: '',
                  medications: []
                });
                setNewMedication({
                  name: '',
                  dosage: '',
                  unit: '',
                  isCustomMedication: false,
                  isCustomDosage: false
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newFlowEntry.time) {
                  const bpValue = newFlowEntry.systolic && newFlowEntry.diastolic
                    ? `${newFlowEntry.systolic}/${newFlowEntry.diastolic}`
                    : '';

                  if (editingEntryId) {
                    // Update existing entry
                    const updatedEntries = ivSedationFormData.flowEntries?.map(entry =>
                      entry.id === editingEntryId
                        ? {
                            ...entry,
                            time: newFlowEntry.time,
                            bp: bpValue,
                            heartRate: newFlowEntry.heartRate,
                            rr: newFlowEntry.rr,
                            spo2: newFlowEntry.spo2,
                            medications: newFlowEntry.medications
                          }
                        : entry
                    ) || [];

                    updateIVSedationFormField('flowEntries', updatedEntries);
                  } else {
                    // Add new entry
                    const newEntry = {
                      id: Date.now().toString(),
                      time: newFlowEntry.time,
                      bp: bpValue,
                      heartRate: newFlowEntry.heartRate,
                      rr: newFlowEntry.rr,
                      spo2: newFlowEntry.spo2,
                      medications: newFlowEntry.medications
                    };

                    updateIVSedationFormField('flowEntries', [...(ivSedationFormData.flowEntries || []), newEntry]);
                  }

                  setShowFlowEntryDialog(false);
                  setEditingEntryId(null);
                  setNewFlowEntry({
                    time: '',
                    systolic: '',
                    diastolic: '',
                    heartRate: '',
                    rr: '',
                    spo2: '',
                    medications: []
                  });
                  setNewMedication({
                    name: '',
                    dosage: '',
                    unit: '',
                    isCustomMedication: false,
                    isCustomDosage: false
                  });
                }
              }}
              disabled={!newFlowEntry.time}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingEntryId ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast && formMessage.type && (
        <div className="fixed bottom-6 right-6 z-[9999] w-96 animate-in slide-in-from-right-full duration-300">
          <div className={`backdrop-blur-md rounded-xl border-2 shadow-2xl flex items-start gap-4 p-5 transition-all duration-300 hover:scale-[1.02] ${
            formMessage.type === 'error'
              ? 'bg-red-50/80 border-red-200/60 text-red-800'
              : 'bg-green-50/80 border-green-200/60 text-green-800'
            }`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              formMessage.type === 'error'
                ? 'bg-red-100/80 text-red-600'
                : 'bg-green-100/80 text-green-600'
            }`}>
              {formMessage.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-h-[24px] flex items-center">
              <p className="text-sm font-medium leading-relaxed">{formMessage.text}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                formMessage.type === 'error'
                  ? 'text-red-400 hover:bg-red-100/60 hover:text-red-600'
                  : 'text-green-400 hover:bg-green-100/60 hover:text-green-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* IV Sedation Toast Notification */}
      {showIVSedationToast && ivSedationFormMessage.type && (
        <div className="fixed bottom-6 right-6 z-[9999] w-96 animate-in slide-in-from-right-full duration-300">
          <div className={`backdrop-blur-md rounded-xl border-2 shadow-2xl flex items-start gap-4 p-5 transition-all duration-300 hover:scale-[1.02] ${
            ivSedationFormMessage.type === 'error'
              ? 'bg-red-50/80 border-red-200/60 text-red-800'
              : ivSedationFormMessage.type === 'info'
              ? 'bg-blue-50/80 border-blue-200/60 text-blue-800'
              : 'bg-green-50/80 border-green-200/60 text-green-800'
            }`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              ivSedationFormMessage.type === 'error'
                ? 'bg-red-100/80 text-red-600'
                : ivSedationFormMessage.type === 'info'
                ? 'bg-blue-100/80 text-blue-600'
                : 'bg-green-100/80 text-green-600'
            }`}>
              {ivSedationFormMessage.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : ivSedationFormMessage.type === 'info' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-h-[24px] flex items-center">
              <p className="text-sm font-medium leading-relaxed">{ivSedationFormMessage.text}</p>
            </div>
            <button
              onClick={() => setShowIVSedationToast(false)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                ivSedationFormMessage.type === 'error'
                  ? 'text-red-400 hover:bg-red-100/60 hover:text-red-600'
                  : ivSedationFormMessage.type === 'info'
                  ? 'text-blue-400 hover:bg-blue-100/60 hover:text-blue-600'
                  : 'text-green-400 hover:bg-green-100/60 hover:text-green-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* IV Sedation Summary Dialog */}
      <Dialog open={showIVSedationSummary} onOpenChange={handleCloseSummary}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Activity className="h-6 w-6 text-blue-600" />
              Review IV Sedation Form
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Patient Information - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-600 rounded-md">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-blue-900">Patient Information</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Patient</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{ivSedationFormData.patientName}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Date</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(ivSedationFormData.date).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Height</div>
                    <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.heightFeet}' {ivSedationFormData.heightInches}"</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Weight</div>
                    <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.weight} lbs</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">BMI</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const heightFeet = parseFloat(ivSedationFormData.heightFeet) || 0;
                        const heightInches = parseFloat(ivSedationFormData.heightInches) || 0;
                        const weight = parseFloat(ivSedationFormData.weight) || 0;

                        if (heightFeet > 0 && weight > 0) {
                          const totalInches = (heightFeet * 12) + heightInches;
                          const heightMeters = totalInches * 0.0254;
                          const weightKg = weight * 0.453592;
                          const bmi = weightKg / (heightMeters * heightMeters);
                          return bmi.toFixed(1);
                        }
                        return 'N/A';
                      })()}
                    </div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Upper</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{ivSedationFormData.upperTreatment}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-1">Lower</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{ivSedationFormData.lowerTreatment}</div>
                  </div>
                </div>
              </div>

              {/* Step 2: Pre-Assessment & Medical History */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Step 2: Pre-Assessment & Medical History</h3>
                </div>

                {/* Pre-Assessment Cards */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    Pre-Assessment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">NPO Status</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.npoStatus || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Morning Medications</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {ivSedationFormData.morningMedications === 'no'
                          ? 'No'
                          : ivSedationFormData.morningMedications && ivSedationFormData.morningMedications !== 'yes'
                            ? ivSedationFormData.morningMedications
                            : 'Not specified'
                        }
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">ASA Classification</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.asaClassification || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Mallampati Score</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.mallampatiScore || 'Not specified'}</div>
                    </div>
                  </div>
                </div>

                {/* Allergies Card */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Allergies
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    {ivSedationFormData.allergies && ivSedationFormData.allergies.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {ivSedationFormData.allergies.map((allergy, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              {allergy}
                            </span>
                          ))}
                        </div>
                        {ivSedationFormData.allergiesOther && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <span className="text-xs font-medium text-red-600">Other Details:</span>
                            <span className="text-sm text-red-800 ml-2">{ivSedationFormData.allergiesOther}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No allergies specified</div>
                    )}
                  </div>
                </div>

                {/* Female-specific Questions */}
                {ivSedationFormData.pregnancyRisk && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Female Patients Only
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Pregnancy Risk</div>
                        <div className={`text-sm font-semibold ${ivSedationFormData.pregnancyRisk === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
                          {ivSedationFormData.pregnancyRisk?.toUpperCase()}
                        </div>
                      </div>
                      {ivSedationFormData.lastMenstrualCycle && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Last Menstrual Cycle</div>
                          <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.lastMenstrualCycle}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical History */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Medical History
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Anesthesia History */}
                    {ivSedationFormData.anesthesiaHistory && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Anesthesia History</h5>
                        </div>
                        <div className="space-y-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {ivSedationFormData.anesthesiaHistory}
                          </span>
                          {ivSedationFormData.anesthesiaHistoryOther && (
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                              <span className="text-xs font-medium text-purple-600">Details:</span>
                              <span className="text-sm text-purple-800 ml-2">{ivSedationFormData.anesthesiaHistoryOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Respiratory Problems */}
                    {ivSedationFormData.respiratoryProblems && ivSedationFormData.respiratoryProblems.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Respiratory Problems</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.respiratoryProblems.map((problem, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
                                {problem}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.respiratoryProblemsOther && (
                            <div className="p-2 bg-cyan-50 rounded border border-cyan-200">
                              <span className="text-xs font-medium text-cyan-600">Other Details:</span>
                              <span className="text-sm text-cyan-800 ml-2">{ivSedationFormData.respiratoryProblemsOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cardiovascular Problems */}
                    {ivSedationFormData.cardiovascularProblems && ivSedationFormData.cardiovascularProblems.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Cardiovascular Problems</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.cardiovascularProblems.map((problem, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                {problem}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.cardiovascularProblemsOther && (
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-xs font-medium text-red-600">Other Details:</span>
                              <span className="text-sm text-red-800 ml-2">{ivSedationFormData.cardiovascularProblemsOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Gastrointestinal Problems */}
                    {ivSedationFormData.gastrointestinalProblems && ivSedationFormData.gastrointestinalProblems.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Gastrointestinal Problems</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.gastrointestinalProblems.map((problem, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                {problem}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.gastrointestinalProblemsOther && (
                            <div className="p-2 bg-orange-50 rounded border border-orange-200">
                              <span className="text-xs font-medium text-orange-600">Other Details:</span>
                              <span className="text-sm text-orange-800 ml-2">{ivSedationFormData.gastrointestinalProblemsOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Neurologic Problems */}
                    {ivSedationFormData.neurologicProblems && ivSedationFormData.neurologicProblems.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Neurologic Problems</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.neurologicProblems.map((problem, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                {problem}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.neurologicProblemsOther && (
                            <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
                              <span className="text-xs font-medium text-indigo-600">Other Details:</span>
                              <span className="text-sm text-indigo-800 ml-2">{ivSedationFormData.neurologicProblemsOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Endocrine/Renal Problems */}
                    {ivSedationFormData.endocrineRenalProblems && ivSedationFormData.endocrineRenalProblems.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Endocrine/Renal Problems</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.endocrineRenalProblems.map((problem, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                                {problem}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.endocrineRenalProblemsOther && (
                            <div className="p-2 bg-teal-50 rounded border border-teal-200">
                              <span className="text-xs font-medium text-teal-600">Other Details:</span>
                              <span className="text-sm text-teal-800 ml-2">{ivSedationFormData.endocrineRenalProblemsOther}</span>
                            </div>
                          )}
                          {ivSedationFormData.endocrineRenalProblems?.includes('Diabetes') && ivSedationFormData.lastA1CLevel && (
                            <div className="p-2 bg-teal-50 rounded border border-teal-200">
                              <span className="text-xs font-medium text-teal-600">Last A1C Level:</span>
                              <span className="text-sm text-teal-800 ml-2">{ivSedationFormData.lastA1CLevel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Miscellaneous */}
                    {ivSedationFormData.miscellaneous && ivSedationFormData.miscellaneous.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Miscellaneous Conditions</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.miscellaneous.map((condition, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                {condition}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.miscellaneousOther && (
                            <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                              <span className="text-xs font-medium text-yellow-600">Other Details:</span>
                              <span className="text-sm text-yellow-800 ml-2">{ivSedationFormData.miscellaneousOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social History */}
                    {ivSedationFormData.socialHistory && ivSedationFormData.socialHistory.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <h5 className="font-semibold text-gray-800">Social History</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.socialHistory.map((habit, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {habit}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.socialHistoryOther && (
                            <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                              <span className="text-xs font-medium text-emerald-600">Other Details:</span>
                              <span className="text-sm text-emerald-800 ml-2">{ivSedationFormData.socialHistoryOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Assessment & Evaluations */}
                <div className="space-y-6">
                  {/* Patient Assessment */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Patient Assessment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ivSedationFormData.wellDevelopedNourished && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Well Developed and Nourished</div>
                          <div className={`text-sm font-semibold ${ivSedationFormData.wellDevelopedNourished === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                            {ivSedationFormData.wellDevelopedNourished.toUpperCase()}
                          </div>
                        </div>
                      )}
                      {ivSedationFormData.patientAnxious && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Patient Anxious</div>
                          <div className={`text-sm font-semibold ${ivSedationFormData.patientAnxious === 'no' ? 'text-green-600' : 'text-red-600'}`}>
                            {ivSedationFormData.patientAnxious.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Airway Evaluation */}
                  {ivSedationFormData.airwayEvaluation && ivSedationFormData.airwayEvaluation.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Airway Evaluation
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.airwayEvaluation.map((evaluation, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {evaluation}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.airwayEvaluationOther && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <span className="text-xs font-medium text-blue-600">Other Details:</span>
                              <span className="text-sm text-blue-800 ml-2">{ivSedationFormData.airwayEvaluationOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Heart/Lung Evaluation */}
                  {ivSedationFormData.heartLungEvaluation && ivSedationFormData.heartLungEvaluation.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Heart and Lung Evaluation
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {ivSedationFormData.heartLungEvaluation.map((evaluation, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                {evaluation}
                              </span>
                            ))}
                          </div>
                          {ivSedationFormData.heartLungEvaluationOther && (
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-xs font-medium text-red-600">Other Details:</span>
                              <span className="text-sm text-red-800 ml-2">{ivSedationFormData.heartLungEvaluationOther}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Sedation Plan */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Step 3: Sedation Plan</h3>
                </div>

                {/* Instruments Checklist */}
                {ivSedationFormData.instrumentsChecklist && ivSedationFormData.instrumentsChecklist.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Instruments Checklist
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex flex-wrap gap-2">
                        {ivSedationFormData.instrumentsChecklist.map(key => {
                          const instrumentNames = {
                            'ecg': 'ECG',
                            'bp': 'BP',
                            'pulseOx': 'Pulse OX',
                            'etco2': 'ETCO2',
                            'supplementalO2': 'Supplemental O2',
                            'ppvAvailable': 'PPV Available',
                            'suctionAvailable': 'Suction Available'
                          };
                          return (
                            <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {instrumentNames[key] || key}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sedation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Sedation Type</div>
                    <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.sedationType || 'Not specified'}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Level of Sedation</div>
                    <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.levelOfSedation || 'Not specified'}</div>
                  </div>
                </div>

                {/* Medications Planned */}
                {ivSedationFormData.medicationsPlanned && ivSedationFormData.medicationsPlanned.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Planned Medications
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {ivSedationFormData.medicationsPlanned.map((medication, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {medication}
                            </span>
                          ))}
                        </div>
                        {ivSedationFormData.medicationsOther && (
                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            <span className="text-xs font-medium text-blue-600">Other Medications:</span>
                            <span className="text-sm text-blue-800 ml-2">{ivSedationFormData.medicationsOther}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Administration Route */}
                {ivSedationFormData.administrationRoute && ivSedationFormData.administrationRoute.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Administration Route
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex flex-wrap gap-2">
                        {ivSedationFormData.administrationRoute.map((route, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Protocols */}
                {ivSedationFormData.emergencyProtocols && ivSedationFormData.emergencyProtocols.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Emergency Protocols
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex flex-wrap gap-2">
                        {ivSedationFormData.emergencyProtocols.map((protocol, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {protocol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: Flow - Time Tracking & Monitoring */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900">Step 4: Flow - Time Tracking & Monitoring</h3>
                </div>

                {/* Time Summary */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    Time Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Time in Room</div>
                      <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.timeInRoom || 'Not recorded'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Sedation Start</div>
                      <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.sedationStartTime || 'Not recorded'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Sedation End</div>
                      <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.sedationEndTime || 'Not recorded'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Out of Room</div>
                      <div className="text-lg font-semibold text-gray-900">{ivSedationFormData.outOfRoomTime || 'Not recorded'}</div>
                    </div>
                  </div>
                </div>

                {/* Duration Calculations */}
                {ivSedationFormData.timeInRoom && ivSedationFormData.sedationStartTime && ivSedationFormData.sedationEndTime && ivSedationFormData.outOfRoomTime && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Duration Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Preparation Time</div>
                        <div className="text-lg font-semibold text-gray-900">{(() => {
                          const roomTime = ivSedationFormData.timeInRoom.split(':');
                          const sedationTime = ivSedationFormData.sedationStartTime.split(':');
                          const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                          const sedationMinutes = parseInt(sedationTime[0]) * 60 + parseInt(sedationTime[1]);
                          const diffMinutes = sedationMinutes - roomMinutes;
                          if (diffMinutes >= 0) {
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          }
                          return '--';
                        })()}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Sedation Duration</div>
                        <div className="text-lg font-semibold text-gray-900">{(() => {
                          const startTime = ivSedationFormData.sedationStartTime.split(':');
                          const endTime = ivSedationFormData.sedationEndTime.split(':');
                          const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
                          const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
                          const diffMinutes = endMinutes - startMinutes;
                          if (diffMinutes >= 0) {
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          }
                          return '--';
                        })()}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Total Room Time</div>
                        <div className="text-lg font-semibold text-gray-900">{(() => {
                          const roomTime = ivSedationFormData.timeInRoom.split(':');
                          const outTime = ivSedationFormData.outOfRoomTime.split(':');
                          const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                          const outMinutes = parseInt(outTime[0]) * 60 + parseInt(outTime[1]);
                          const diffMinutes = outMinutes - roomMinutes;
                          if (diffMinutes >= 0) {
                            const hours = Math.floor(diffMinutes / 60);
                            const minutes = diffMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          }
                          return '--';
                        })()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Monitoring Entries */}
              {ivSedationFormData.flowEntries && ivSedationFormData.flowEntries.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">Monitoring Log</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr className="border-b border-purple-200">
                            <th className="text-left p-3 font-semibold text-purple-900">Time</th>
                            <th className="text-left p-3 font-semibold text-purple-900">BP</th>
                            <th className="text-left p-3 font-semibold text-purple-900">HR</th>
                            <th className="text-left p-3 font-semibold text-purple-900">RR</th>
                            <th className="text-left p-3 font-semibold text-purple-900">SpO2</th>
                            <th className="text-left p-3 font-semibold text-purple-900">Medications</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ivSedationFormData.flowEntries.map((entry, index) => (
                            <tr key={index} className="border-b border-purple-100 hover:bg-purple-25">
                              <td className="p-3 font-medium text-gray-900">{entry.time}</td>
                              <td className="p-3 text-gray-700">{entry.bp}</td>
                              <td className="p-3 text-gray-700">{entry.heartRate}</td>
                              <td className="p-3 text-gray-700">{entry.rr}</td>
                              <td className="p-3 text-gray-700">{entry.spo2}%</td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(entry.medications) ? entry.medications.map((medication, medIndex) => {
                                    // Handle both new string format and legacy ID format
                                    let displayText = '';
                                    if (typeof medication === 'string') {
                                      // New format: "dosage | medication name"
                                      displayText = medication;
                                    } else {
                                      // Legacy format: find by ID
                                      const legacyMed = medicationOptions.find(m => m.id === medication);
                                      displayText = legacyMed ? legacyMed.name : medication;
                                    }

                                    return (
                                      <span key={medIndex} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                        {displayText}
                                      </span>
                                    );
                                  }) : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Recovery Assessment */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Step 5: Recovery Assessment</h3>
                </div>

                {/* Recovery Criteria */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    Recovery Criteria
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'alertOriented', label: 'Alert and Oriented' },
                      { key: 'protectiveReflexes', label: 'Protective Reflexes Intact' },
                      { key: 'breathingSpontaneously', label: 'Breathing Spontaneously' },
                      { key: 'postOpNausea', label: 'Post-Op Nausea/Vomiting', reverse: true },
                      { key: 'caregiverPresent', label: 'Patient Caregiver Present' },
                      { key: 'baselineMentalStatus', label: 'Return to Baseline Mental Status' },
                      { key: 'responsiveVerbalCommands', label: 'Responsive to Verbal Commands' },
                      { key: 'saturatingRoomAir', label: 'Saturating Appropriately on Room Air' },
                      { key: 'vitalSignsBaseline', label: 'Vital Signs Returned to Baseline' },
                      { key: 'painDuringRecovery', label: 'Pain During Recovery', reverse: true }
                    ].map((criterion) => {
                      const value = ivSedationFormData[criterion.key];
                      const isPositive = criterion.reverse ? value === 'no' : value === 'yes';
                      const isNegative = criterion.reverse ? value === 'yes' : value === 'no';

                      return (
                        <div key={criterion.key} className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                          <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">{criterion.label}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              isPositive ? 'bg-green-500' :
                              isNegative ? 'bg-red-500' :
                              'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm font-semibold ${
                              isPositive ? 'text-green-600' :
                              isNegative ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {value?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Discharge Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Discharge Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Post-Op Instructions Given To</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.postOpInstructionsGivenTo || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Follow-Up Instructions Given To</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.followUpInstructionsGivenTo || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Discharged To</div>
                      <div className="text-sm font-semibold text-gray-900">{ivSedationFormData.dischargedTo || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Pain Level at Discharge</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {ivSedationFormData.painLevelDischarge ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{ivSedationFormData.painLevelDischarge}/10</span>
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < parseInt(ivSedationFormData.painLevelDischarge) ? 'bg-red-500' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          'Not recorded'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Remarks */}
                {ivSedationFormData.otherRemarks && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Other Remarks
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {ivSedationFormData.otherRemarks}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex-shrink-0 flex justify-end items-center px-6 py-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleEditFromSummary}
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>

              <Button
                type="button"
                onClick={handleFinalIVSedationSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Submit Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* IV Sedation Preview Dialog */}
      <Dialog open={showIVSedationPreview} onOpenChange={handleIVSedationPreviewClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Activity className="h-6 w-6 text-blue-600" />
              IV Sedation Form Preview
            </DialogTitle>
          </DialogHeader>

          {selectedIVSedationSheet && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Patient Information - Compact */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-600 rounded-md">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Patient Information</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Patient</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{selectedIVSedationSheet.patient_name}</div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Date</div>
                      <div className="text-sm font-semibold text-gray-900">{new Date(selectedIVSedationSheet.sedation_date).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Height</div>
                      <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.height_feet}' {selectedIVSedationSheet.height_inches}"</div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Weight</div>
                      <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.weight} lbs</div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">BMI</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {(() => {
                          const heightFeet = parseFloat(selectedIVSedationSheet.height_feet) || 0;
                          const heightInches = parseFloat(selectedIVSedationSheet.height_inches) || 0;
                          const weight = parseFloat(selectedIVSedationSheet.weight) || 0;

                          if (heightFeet > 0 && weight > 0) {
                            const totalInches = (heightFeet * 12) + heightInches;
                            const heightMeters = totalInches * 0.0254;
                            const weightKg = weight * 0.453592;
                            const bmi = weightKg / (heightMeters * heightMeters);
                            return bmi.toFixed(1);
                          }
                          return 'N/A';
                        })()}
                      </div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Upper</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{selectedIVSedationSheet.upper_treatment}</div>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1">Lower</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{selectedIVSedationSheet.lower_treatment}</div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Pre-Assessment & Medical History */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Step 2: Pre-Assessment & Medical History</h3>
                  </div>

                  {/* Pre-Assessment Cards */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      Pre-Assessment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">NPO Status</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.npo_status || 'Not specified'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Morning Medications</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedIVSedationSheet.morning_medications === 'no'
                            ? 'No'
                            : selectedIVSedationSheet.morning_medications && selectedIVSedationSheet.morning_medications !== 'yes'
                              ? selectedIVSedationSheet.morning_medications
                              : 'Not specified'
                          }
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">ASA Classification</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.asa_classification || 'Not specified'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Mallampati Score</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.mallampati_score || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Allergies Card */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Allergies
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      {selectedIVSedationSheet.allergies && selectedIVSedationSheet.allergies.length > 0 ? (
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedIVSedationSheet.allergies.map((allergy, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                {allergy}
                              </span>
                            ))}
                          </div>
                          {selectedIVSedationSheet.allergies_other && (
                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-xs font-medium text-red-600">Other Details:</span>
                              <span className="text-sm text-red-800 ml-2">{selectedIVSedationSheet.allergies_other}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No allergies specified</div>
                      )}
                    </div>
                  </div>

                  {/* Female-specific Questions */}
                  {selectedIVSedationSheet.pregnancy_risk && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        Female Patients Only
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Pregnancy Risk</div>
                          <div className={`text-sm font-semibold ${selectedIVSedationSheet.pregnancy_risk === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedIVSedationSheet.pregnancy_risk?.toUpperCase()}
                          </div>
                        </div>
                        {selectedIVSedationSheet.last_menstrual_cycle && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Last Menstrual Cycle</div>
                            <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.last_menstrual_cycle}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medical History */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Medical History
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                      {/* Anesthesia History */}
                      {selectedIVSedationSheet.anesthesia_history && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Anesthesia History</h5>
                          </div>
                          <div className="space-y-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {selectedIVSedationSheet.anesthesia_history}
                            </span>
                            {selectedIVSedationSheet.anesthesia_history_other && (
                              <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                <span className="text-xs font-medium text-purple-600">Details:</span>
                                <span className="text-sm text-purple-800 ml-2">{selectedIVSedationSheet.anesthesia_history_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Respiratory Problems */}
                      {selectedIVSedationSheet.respiratory_problems && selectedIVSedationSheet.respiratory_problems.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Respiratory Problems</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.respiratory_problems.map((problem, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
                                  {problem}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.respiratory_problems_other && (
                              <div className="p-2 bg-cyan-50 rounded border border-cyan-200">
                                <span className="text-xs font-medium text-cyan-600">Other Details:</span>
                                <span className="text-sm text-cyan-800 ml-2">{selectedIVSedationSheet.respiratory_problems_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cardiovascular Problems */}
                      {selectedIVSedationSheet.cardiovascular_problems && selectedIVSedationSheet.cardiovascular_problems.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Cardiovascular Problems</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.cardiovascular_problems.map((problem, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  {problem}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.cardiovascular_problems_other && (
                              <div className="p-2 bg-red-50 rounded border border-red-200">
                                <span className="text-xs font-medium text-red-600">Other Details:</span>
                                <span className="text-sm text-red-800 ml-2">{selectedIVSedationSheet.cardiovascular_problems_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Gastrointestinal Problems */}
                      {selectedIVSedationSheet.gastrointestinal_problems && selectedIVSedationSheet.gastrointestinal_problems.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Gastrointestinal Problems</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.gastrointestinal_problems.map((problem, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                  {problem}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.gastrointestinal_problems_other && (
                              <div className="p-2 bg-orange-50 rounded border border-orange-200">
                                <span className="text-xs font-medium text-orange-600">Other Details:</span>
                                <span className="text-sm text-orange-800 ml-2">{selectedIVSedationSheet.gastrointestinal_problems_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Neurologic Problems */}
                      {selectedIVSedationSheet.neurologic_problems && selectedIVSedationSheet.neurologic_problems.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Neurologic Problems</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.neurologic_problems.map((problem, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  {problem}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.neurologic_problems_other && (
                              <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
                                <span className="text-xs font-medium text-indigo-600">Other Details:</span>
                                <span className="text-sm text-indigo-800 ml-2">{selectedIVSedationSheet.neurologic_problems_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Endocrine/Renal Problems */}
                      {selectedIVSedationSheet.endocrine_renal_problems && selectedIVSedationSheet.endocrine_renal_problems.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Endocrine/Renal Problems</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.endocrine_renal_problems.map((problem, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                                  {problem}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.endocrine_renal_problems_other && (
                              <div className="p-2 bg-teal-50 rounded border border-teal-200">
                                <span className="text-xs font-medium text-teal-600">Other Details:</span>
                                <span className="text-sm text-teal-800 ml-2">{selectedIVSedationSheet.endocrine_renal_problems_other}</span>
                              </div>
                            )}
                            {selectedIVSedationSheet.endocrine_renal_problems?.includes('Diabetes') && selectedIVSedationSheet.last_a1c_level && (
                              <div className="p-2 bg-teal-50 rounded border border-teal-200">
                                <span className="text-xs font-medium text-teal-600">Last A1C Level:</span>
                                <span className="text-sm text-teal-800 ml-2">{selectedIVSedationSheet.last_a1c_level}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Miscellaneous */}
                      {selectedIVSedationSheet.miscellaneous && selectedIVSedationSheet.miscellaneous.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm lg:col-span-2">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Miscellaneous Conditions</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.miscellaneous.map((condition, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  {condition}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.miscellaneous_other && (
                              <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                                <span className="text-xs font-medium text-yellow-600">Other Details:</span>
                                <span className="text-sm text-yellow-800 ml-2">{selectedIVSedationSheet.miscellaneous_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social History */}
                      {selectedIVSedationSheet.social_history && selectedIVSedationSheet.social_history.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <h5 className="font-semibold text-gray-800">Social History</h5>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.social_history.map((habit, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {habit}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.social_history_other && (
                              <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                                <span className="text-xs font-medium text-emerald-600">Other Details:</span>
                                <span className="text-sm text-emerald-800 ml-2">{selectedIVSedationSheet.social_history_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Assessment & Evaluations */}
                  <div className="space-y-6">
                    {/* Patient Assessment */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Patient Assessment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedIVSedationSheet.well_developed_nourished && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Well Developed and Nourished</div>
                            <div className={`text-sm font-semibold ${selectedIVSedationSheet.well_developed_nourished === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedIVSedationSheet.well_developed_nourished.toUpperCase()}
                            </div>
                          </div>
                        )}
                        {selectedIVSedationSheet.patient_anxious && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Patient Anxious</div>
                            <div className={`text-sm font-semibold ${selectedIVSedationSheet.patient_anxious === 'no' ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedIVSedationSheet.patient_anxious.toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Airway Evaluation */}
                    {selectedIVSedationSheet.airway_evaluation && selectedIVSedationSheet.airway_evaluation.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Airway Evaluation
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.airway_evaluation.map((evaluation, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  {evaluation}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.airway_evaluation_other && (
                              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <span className="text-xs font-medium text-blue-600">Other Details:</span>
                                <span className="text-sm text-blue-800 ml-2">{selectedIVSedationSheet.airway_evaluation_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Heart/Lung Evaluation */}
                    {selectedIVSedationSheet.heart_lung_evaluation && selectedIVSedationSheet.heart_lung_evaluation.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Heart and Lung Evaluation
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedIVSedationSheet.heart_lung_evaluation.map((evaluation, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  {evaluation}
                                </span>
                              ))}
                            </div>
                            {selectedIVSedationSheet.heart_lung_evaluation_other && (
                              <div className="p-2 bg-red-50 rounded border border-red-200">
                                <span className="text-xs font-medium text-red-600">Other Details:</span>
                                <span className="text-sm text-red-800 ml-2">{selectedIVSedationSheet.heart_lung_evaluation_other}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Sedation Plan */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Step 3: Sedation Plan</h3>
                  </div>

                  {/* Instruments Checklist */}
                  {selectedIVSedationSheet.instruments_checklist && selectedIVSedationSheet.instruments_checklist.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        Instruments Checklist
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                          {selectedIVSedationSheet.instruments_checklist.map(key => {
                            const instrumentNames = {
                              'ecg': 'ECG',
                              'bp': 'BP',
                              'pulseOx': 'Pulse OX',
                              'etco2': 'ETCO2',
                              'supplementalO2': 'Supplemental O2',
                              'ppvAvailable': 'PPV Available',
                              'suctionAvailable': 'Suction Available'
                            };
                            return (
                              <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {instrumentNames[key] || key}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sedation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Sedation Type</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.sedation_type || 'Not specified'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Level of Sedation</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.level_of_sedation || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Medications Planned */}
                  {selectedIVSedationSheet.medications_planned && selectedIVSedationSheet.medications_planned.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Planned Medications
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedIVSedationSheet.medications_planned.map((medication, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {medication}
                              </span>
                            ))}
                          </div>
                          {selectedIVSedationSheet.medications_other && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <span className="text-xs font-medium text-blue-600">Other Medications:</span>
                              <span className="text-sm text-blue-800 ml-2">{selectedIVSedationSheet.medications_other}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Administration Route */}
                  {selectedIVSedationSheet.administration_route && selectedIVSedationSheet.administration_route.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Administration Route
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                          {selectedIVSedationSheet.administration_route.map((route, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Protocols */}
                  {selectedIVSedationSheet.emergency_protocols && selectedIVSedationSheet.emergency_protocols.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Emergency Protocols
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                          {selectedIVSedationSheet.emergency_protocols.map((protocol, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {protocol}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Flow - Time Tracking & Monitoring */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-600 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-yellow-900">Step 4: Flow - Time Tracking & Monitoring</h3>
                  </div>

                  {/* Time Summary */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      Time Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Time in Room</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.time_in_room || 'Not recorded'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Sedation Start</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.sedation_start_time || 'Not recorded'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Sedation End</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.sedation_end_time || 'Not recorded'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                        <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Out of Room</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedIVSedationSheet.out_of_room_time || 'Not recorded'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Duration Calculations */}
                  {selectedIVSedationSheet.time_in_room && selectedIVSedationSheet.sedation_start_time && selectedIVSedationSheet.sedation_end_time && selectedIVSedationSheet.out_of_room_time && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Duration Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                          <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Preparation Time</div>
                          <div className="text-lg font-semibold text-gray-900">{(() => {
                            const roomTime = selectedIVSedationSheet.time_in_room.split(':');
                            const sedationTime = selectedIVSedationSheet.sedation_start_time.split(':');
                            const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                            const sedationMinutes = parseInt(sedationTime[0]) * 60 + parseInt(sedationTime[1]);
                            const diffMinutes = sedationMinutes - roomMinutes;
                            if (diffMinutes >= 0) {
                              const hours = Math.floor(diffMinutes / 60);
                              const minutes = diffMinutes % 60;
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }
                            return '--';
                          })()}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                          <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Sedation Duration</div>
                          <div className="text-lg font-semibold text-gray-900">{(() => {
                            const startTime = selectedIVSedationSheet.sedation_start_time.split(':');
                            const endTime = selectedIVSedationSheet.sedation_end_time.split(':');
                            const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
                            const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
                            const diffMinutes = endMinutes - startMinutes;
                            if (diffMinutes >= 0) {
                              const hours = Math.floor(diffMinutes / 60);
                              const minutes = diffMinutes % 60;
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }
                            return '--';
                          })()}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                          <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Total Room Time</div>
                          <div className="text-lg font-semibold text-gray-900">{(() => {
                            const roomTime = selectedIVSedationSheet.time_in_room.split(':');
                            const outTime = selectedIVSedationSheet.out_of_room_time.split(':');
                            const roomMinutes = parseInt(roomTime[0]) * 60 + parseInt(roomTime[1]);
                            const outMinutes = parseInt(outTime[0]) * 60 + parseInt(outTime[1]);
                            const diffMinutes = outMinutes - roomMinutes;
                            if (diffMinutes >= 0) {
                              const hours = Math.floor(diffMinutes / 60);
                              const minutes = diffMinutes % 60;
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }
                            return '--';
                          })()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Monitoring Entries */}
                {selectedIVSedationSheet.flow_entries && selectedIVSedationSheet.flow_entries.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-purple-900">Monitoring Log</h3>
                    </div>
                    <div className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-purple-50">
                            <tr className="border-b border-purple-200">
                              <th className="text-left p-3 font-semibold text-purple-900">Time</th>
                              <th className="text-left p-3 font-semibold text-purple-900">BP</th>
                              <th className="text-left p-3 font-semibold text-purple-900">HR</th>
                              <th className="text-left p-3 font-semibold text-purple-900">RR</th>
                              <th className="text-left p-3 font-semibold text-purple-900">SpO2</th>
                              <th className="text-left p-3 font-semibold text-purple-900">Medications</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedIVSedationSheet.flow_entries.map((entry, index) => (
                              <tr key={index} className="border-b border-purple-100 hover:bg-purple-25">
                                <td className="p-3 font-medium text-gray-900">{entry.time}</td>
                                <td className="p-3 text-gray-700">{entry.bp}</td>
                                <td className="p-3 text-gray-700">{entry.heartRate}</td>
                                <td className="p-3 text-gray-700">{entry.rr}</td>
                                <td className="p-3 text-gray-700">{entry.spo2}%</td>
                                <td className="p-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Array.isArray(entry.medications) ? entry.medications.map((medication, medIndex) => {
                                      // Handle both new string format and legacy ID format
                                      let displayText = '';
                                      if (typeof medication === 'string') {
                                        // New format: "dosage | medication name"
                                        displayText = medication;
                                      } else {
                                        // Legacy format: find by ID
                                        const legacyMed = medicationOptions.find(m => m.id === medication);
                                        displayText = legacyMed ? legacyMed.name : medication;
                                      }

                                      return (
                                        <span key={medIndex} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                          {displayText}
                                        </span>
                                      );
                                    }) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Recovery Assessment */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-900">Step 5: Recovery Assessment</h3>
                  </div>

                  {/* Recovery Criteria */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    Recovery Criteria
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'alert_oriented', label: 'Alert and Oriented' },
                      { key: 'protective_reflexes', label: 'Protective Reflexes Intact' },
                      { key: 'breathing_spontaneously', label: 'Breathing Spontaneously' },
                      { key: 'post_op_nausea', label: 'Post-Op Nausea/Vomiting', reverse: true },
                      { key: 'caregiver_present', label: 'Patient Caregiver Present' },
                      { key: 'baseline_mental_status', label: 'Return to Baseline Mental Status' },
                      { key: 'responsive_verbal_commands', label: 'Responsive to Verbal Commands' },
                      { key: 'saturating_room_air', label: 'Saturating Appropriately on Room Air' },
                      { key: 'vital_signs_baseline', label: 'Vital Signs Returned to Baseline' },
                      { key: 'pain_during_recovery', label: 'Pain During Recovery', reverse: true }
                    ].map((criterion) => {
                      const value = selectedIVSedationSheet[criterion.key];
                      const isPositive = criterion.reverse ? value === 'no' : value === 'yes';
                      const isNegative = criterion.reverse ? value === 'yes' : value === 'no';

                      return (
                        <div key={criterion.key} className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                          <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">{criterion.label}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              isPositive ? 'bg-green-500' :
                              isNegative ? 'bg-red-500' :
                              'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm font-semibold ${
                              isPositive ? 'text-green-600' :
                              isNegative ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {value?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Discharge Information */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Discharge Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Post-Op Instructions Given To</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.post_op_instructions_given_to || 'Not specified'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Follow-Up Instructions Given To</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.follow_up_instructions_given_to || 'Not specified'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Discharged To</div>
                        <div className="text-sm font-semibold text-gray-900">{selectedIVSedationSheet.discharged_to || 'Not specified'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Pain Level at Discharge</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedIVSedationSheet.pain_level_discharge ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{selectedIVSedationSheet.pain_level_discharge}/10</span>
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < parseInt(selectedIVSedationSheet.pain_level_discharge) ? 'bg-red-500' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            'Not recorded'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Remarks */}
                  {selectedIVSedationSheet.other_remarks && (
                    <div>
                      <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Other Remarks
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {selectedIVSedationSheet.other_remarks}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Surgical Recall Sheet Form Dialog */}
      <Dialog open={showSurgicalRecallForm} onOpenChange={setShowSurgicalRecallForm}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden p-0">
          {patient && (
            <SurgicalRecallSheetForm
              key={editingSurgicalRecallSheet ? `edit-${editingSurgicalRecallSheet.id}` : 'new'}
              patientId={patient.id}
              patientName={patient.full_name}
              onSubmit={handleSurgicalRecallFormSubmit}
              onCancel={handleSurgicalRecallFormCancel}
              editingSheet={editingSurgicalRecallSheet}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Surgical Recall Sheet Dialog */}
      <ViewSurgicalRecallSheet
        isOpen={showSurgicalRecallPreview}
        onClose={() => {
          setShowSurgicalRecallPreview(false);
          setSelectedSurgicalRecallSheet(null);
        }}
        sheetData={selectedSurgicalRecallSheet}
      />

      {/* Delete Surgical Recall Sheet Confirmation Dialog */}
      <DeleteSurgicalRecallSheetDialog
        isOpen={showSurgicalRecallDeleteDialog}
        onClose={() => {
          setShowSurgicalRecallDeleteDialog(false);
          setSurgicalRecallSheetToDelete(null);
        }}
        onSuccess={handleSurgicalRecallDeleteSuccess}
        sheet={surgicalRecallSheetToDelete}
      />

      {/* Consent Packet Dialog */}
      {patient && (
        <ConsentFullArchDialog
          isOpen={showConsentFullArchForm}
          onClose={() => {
            setShowConsentFullArchForm(false);
            setIsViewingConsentForm(false);
            setIsEditingConsentForm(false);
            setSelectedConsentForm(null);
            setSelectedAdminFormType("");
          }}
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          initialData={selectedConsentForm}
          isEditing={isEditingConsentForm}
          isViewing={isViewingConsentForm}
          onSubmit={async (formData) => {
            try {
              // Update local state (the dialog handles the actual saving)
              if (isEditingConsentForm && selectedConsentForm) {
                setConsentForms(prev =>
                  prev.map(form => form.id === selectedConsentForm.id ? formData : form)
                );
              } else {
                setConsentForms(prev => [formData, ...prev]);
              }

              toast({
                title: "Success",
                description: "Consent packet saved successfully!",
              });

              // Reset states and refresh forms
              setShowConsentFullArchForm(false);
              setIsEditingConsentForm(false);
              setIsViewingConsentForm(false);
              setSelectedConsentForm(null);
              setSelectedAdminFormType("");
              await fetchConsentForms();

              // Navigate to Forms section
              setActiveTab("forms");
            } catch (error) {
              console.error('Error in onSubmit:', error);
              toast({
                title: "Error",
                description: "Failed to save form. Please try again.",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {/* Financial Agreement Form Dialog */}
      <FinancialAgreementDialog
        isOpen={showFinancialAgreementForm}
        onClose={async () => {
          setShowFinancialAgreementForm(false);
          setIsViewingFinancialAgreement(false);
          setIsEditingFinancialAgreement(false);
          setEditingFinancialAgreement(null);
          setSelectedAdminFormType("");

          // Refresh the financial agreements list to show any auto-saved drafts
          await fetchFinancialAgreements();
        }}
        patientName={patient?.full_name || ""}
        patientDateOfBirth={patient?.date_of_birth || ""}
        patientId={patient?.id}
        initialData={editingFinancialAgreement}
        isEditing={isEditingFinancialAgreement}
        onSubmit={async (formData) => {
          if (!patient) return;

          console.log('💾 Financial agreement submitted:', formData);
          console.log('🔍 Patient ID:', patient.id);
          console.log('🔄 Is editing:', isEditingFinancialAgreement);

          try {
            // The FinancialAgreementDialog already handles the submission logic correctly
            // including updating existing auto-saved drafts. The formData passed here
            // is already the result of that process, so we just need to refresh our list.

            console.log('✅ Financial agreement saved successfully via dialog');
            setShowFinancialAgreementForm(false);
            setSelectedAdminFormType("");
            setEditingFinancialAgreement(null);
            setIsEditingFinancialAgreement(false);

            // Refresh the financial agreements list
            await fetchFinancialAgreements();

            // Show success message
            toast({
              title: "Success",
              description: `Financial agreement ${isEditingFinancialAgreement ? 'updated' : 'saved'} successfully!`,
            });
          } catch (error) {
            console.error('❌ Error in financial agreement submission handler:', error);
            toast({
              title: "Error",
              description: "Failed to process financial agreement submission",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Final Design Approval Form Dialog */}
      {patient && (
        <FinalDesignApprovalDialog
          isOpen={showFinalDesignApprovalForm}
          onClose={() => {
            setShowFinalDesignApprovalForm(false);
            setIsViewingFinalDesignApprovalForm(false);
            setIsEditingFinalDesignApprovalForm(false);
            setSelectedFinalDesignApprovalForm(null);
            setSelectedAdminFormType("");
          }}
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          initialData={selectedFinalDesignApprovalForm}
          isEditing={isEditingFinalDesignApprovalForm}
          isViewing={isViewingFinalDesignApprovalForm}
          onSubmit={async (formData) => {
            try {
              // Update local state (the dialog handles the actual saving)
              if (isEditingFinalDesignApprovalForm && selectedFinalDesignApprovalForm) {
                setFinalDesignApprovalForms(prev =>
                  prev.map(form => form.id === selectedFinalDesignApprovalForm.id ? formData : form)
                );
              } else {
                setFinalDesignApprovalForms(prev => [formData, ...prev]);
              }

              toast({
                title: "Success",
                description: "Final Design Approval form saved successfully!",
              });

              // Reset states and refresh forms
              setShowFinalDesignApprovalForm(false);
              setIsEditingFinalDesignApprovalForm(false);
              setIsViewingFinalDesignApprovalForm(false);
              setSelectedFinalDesignApprovalForm(null);
              setSelectedAdminFormType("");
              await fetchFinalDesignApprovalForms();

              // Navigate to Forms section
              setActiveTab("forms");
            } catch (error) {
              console.error('Error in onSubmit:', error);
              toast({
                title: "Error",
                description: "Failed to save form. Please try again.",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {/* Medical Records Release Form Dialog */}
      {patient && (
        <MedicalRecordsReleaseDialog
          isOpen={showMedicalRecordsReleaseForm}
          onClose={() => {
            setShowMedicalRecordsReleaseForm(false);
            setSelectedAdminFormType("");
            setEditingMedicalRecordsReleaseForm(null);
            setIsEditingMedicalRecordsReleaseForm(false);
            setIsViewingMedicalRecordsReleaseForm(false);
          }}
          onSubmit={async (formData) => {
            try {
              // The MedicalRecordsReleaseDialog already handles the submission logic correctly
              // including updating existing auto-saved drafts. The formData passed here
              // is already the result of that process, so we just need to refresh our list.

              console.log('✅ Medical records release form saved successfully via dialog');
              setShowMedicalRecordsReleaseForm(false);
              setSelectedAdminFormType("");
              setEditingMedicalRecordsReleaseForm(null);
              setIsEditingMedicalRecordsReleaseForm(false);
              setIsViewingMedicalRecordsReleaseForm(false);

              // Refresh the forms list
              await fetchMedicalRecordsReleaseForms();

              // Show success message
              toast({
                title: "Success",
                description: `Medical records release form ${isEditingMedicalRecordsReleaseForm ? 'updated' : 'saved'} successfully!`,
              });
            } catch (error) {
              console.error('❌ Error in medical records release form submission handler:', error);
              toast({
                title: "Error",
                description: "Failed to process medical records release form submission",
                variant: "destructive",
              });
            }
          }}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          patientId={patient.id}
          initialData={editingMedicalRecordsReleaseForm ? {
            ...editingMedicalRecordsReleaseForm,
            first_name: editingMedicalRecordsReleaseForm.first_name || patient.first_name,
            last_name: editingMedicalRecordsReleaseForm.last_name || patient.last_name
          } : {
            first_name: patient.first_name,
            last_name: patient.last_name
          }}
          isEditing={isEditingMedicalRecordsReleaseForm}
          isViewing={isViewingMedicalRecordsReleaseForm}
        />
      )}

      {/* New Patient Packet Form Dialog */}
      <Dialog open={showNewPatientPacketForm} onOpenChange={(open) => {
        setShowNewPatientPacketForm(open);
        if (!open) {
          setEditingPatientPacket(null);
          setIsEditingPatientPacket(false);
          setSelectedAdminFormType("");
          setCurrentPatientPacketId(null);
          setPatientPacketAutoSaveStatus('idle');
          setPatientPacketAutoSaveMessage('');
          setPatientPacketLastSavedTime('');
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {patient && (
            <NewPatientPacketForm
              patientName={patient.full_name}
              patientDateOfBirth={patient.date_of_birth}
              patientGender={patient.gender}
              showWelcomeHeader={false}
              initialData={editingPatientPacket}
              submitButtonText={isEditingPatientPacket ? "Update Patient Packet" : "Save Patient Packet"}
              onAutoSave={autoSavePatientPacket}
              autoSaveStatus={patientPacketAutoSaveStatus}
              autoSaveMessage={patientPacketAutoSaveMessage}
              lastSavedTime={patientPacketLastSavedTime}
              onSubmit={async (formData) => {
                console.log('Patient packet submitted:', formData);

                try {
                  let result;

                  if (isEditingPatientPacket && editingPatientPacket) {
                    // Update existing packet
                    const packetId = patientPackets.find(p =>
                      p.first_name === editingPatientPacket.firstName &&
                      p.last_name === editingPatientPacket.lastName
                    )?.id;

                    if (!packetId) {
                      throw new Error('Could not find packet ID for update');
                    }

                    result = await updatePatientPacket(packetId, formData, 'internal');
                  } else {
                    // Create new packet
                    result = await savePatientPacket(
                      formData,
                      patient.id, // patient_id for internal submissions
                      undefined,  // no lead_id for internal submissions
                      'internal'  // submission source
                    );
                  }

                  if (result.error) {
                    console.error('Error saving patient packet:', result.error);
                    toast({
                      title: "Error",
                      description: `Failed to ${isEditingPatientPacket ? 'update' : 'save'} patient packet. Please try again.`,
                      variant: "destructive",
                    });
                    return;
                  }

                  console.log('Patient packet saved successfully:', result.data);
                  setShowNewPatientPacketForm(false);
                  setSelectedAdminFormType("");
                  setEditingPatientPacket(null);
                  setIsEditingPatientPacket(false);

                  // Refresh the patient packets list
                  await fetchPatientPackets();

                  // Show success message
                  toast({
                    title: "Success",
                    description: `Patient packet ${isEditingPatientPacket ? 'updated' : 'saved'} successfully!`,
                  });
                } catch (error) {
                  console.error('Unexpected error saving patient packet:', error);
                  toast({
                    title: "Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => {
                setShowNewPatientPacketForm(false);
                setSelectedAdminFormType("");
                setEditingPatientPacket(null);
                setIsEditingPatientPacket(false);
                setCurrentPatientPacketId(null);
                setPatientPacketAutoSaveStatus('idle');
                setPatientPacketAutoSaveMessage('');
                setPatientPacketLastSavedTime('');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* New Patient Packet Preview Dialog */}
      <Dialog open={showNewPatientPacketPreview} onOpenChange={setShowNewPatientPacketPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient Packet Preview</DialogTitle>
          </DialogHeader>
          <NewPatientPacketPreview
            onClose={() => {
              setShowNewPatientPacketPreview(false);
              setSelectedPatientPacketForPreview(null);
            }}
            patientData={selectedPatientPacketForPreview}
          />
        </DialogContent>
      </Dialog>

      {/* Financial Agreement Preview Dialog */}
      <Dialog open={showFinancialAgreementPreview} onOpenChange={setShowFinancialAgreementPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Agreement Preview</DialogTitle>
          </DialogHeader>
          <FinancialAgreementPreview
            onClose={() => {
              setShowFinancialAgreementPreview(false);
              setSelectedFinancialAgreementForPreview(null);
            }}
            agreementData={selectedFinancialAgreementForPreview}
          />
        </DialogContent>
      </Dialog>

      {/* Informed Consent Form For Smoking Dialog */}
      <InformedConsentSmokingDialog
        isOpen={showInformedConsentSmokingForm}
        onClose={async () => {
          setShowInformedConsentSmokingForm(false);
          setIsViewingInformedConsentSmokingForm(false);
          setIsEditingInformedConsentSmokingForm(false);
          setEditingInformedConsentSmokingForm(null);
          setSelectedAdminFormType("");
          // Refresh the forms list to show any auto-saved drafts
          await fetchInformedConsentSmokingForms();
        }}
        onSubmit={async (formData) => {
          if (!patient) return;

          console.log('💾 Informed consent smoking form submitted:', formData);
          console.log('🔍 Patient ID:', patient.id);
          console.log('🔄 Is editing:', isEditingInformedConsentSmokingForm);

          try {
            // Map form data to database columns
            const payload: any = {
              patient_id: patient.id,
              status: 'completed',

              // Patient Information
              first_name: formData.firstName,
              last_name: formData.lastName,
              date_of_birth: formData.dateOfBirth,
              nicotine_use: formData.nicotineUse,

              // Patient Understanding and Agreement
              understands_nicotine_effects: formData.understandsNicotineEffects,
              understands_risks: formData.understandsRisks,
              understands_timeline: formData.understandsTimeline,
              understands_insurance: formData.understandsInsurance,
              offered_resources: formData.offeredResources,
              takes_responsibility: formData.takesResponsibility,

              // Signatures
              patient_signature: formData.patientSignature,
              signature_date: formData.signatureDate,

              // Staff Use
              signed_consent: formData.signedConsent,
              refusal_reason: formData.refusalReason,

              // Keep form_data as backup
              form_data: formData
            };

            let data, error;

            // Check if we have a form ID to update (either from editing or auto-save)
            const formIdToUpdate = formData.id || (isEditingInformedConsentSmokingForm && editingInformedConsentSmokingForm?.id);

            if (formIdToUpdate) {
              // Update existing form (either from auto-save draft or editing)
              console.log('📝 Updating existing informed consent smoking form with ID:', formIdToUpdate);
              const { updateInformedConsentSmokingForm } = await import("@/services/informedConsentSmokingService");
              const result = await updateInformedConsentSmokingForm(formIdToUpdate, payload);
              data = result.data;
              error = result.error;
            } else {
              // Create new form (should rarely happen now)
              console.log('🆕 Creating new informed consent smoking form');
              const { createInformedConsentSmokingForm } = await import("@/services/informedConsentSmokingService");
              const result = await createInformedConsentSmokingForm(payload);
              data = result.data;
              error = result.error;
            }

            if (error) throw error;

            console.log('✅ Informed consent smoking form saved:', data?.id);
            toast({
              title: 'Success',
              description: `Informed consent smoking form ${isEditingInformedConsentSmokingForm ? 'updated' : 'saved'} successfully!`
            });

            setShowInformedConsentSmokingForm(false);
            setSelectedAdminFormType("");
            setEditingInformedConsentSmokingForm(null);
            setIsEditingInformedConsentSmokingForm(false);
            setIsViewingInformedConsentSmokingForm(false);

            // Refresh the forms list
            await fetchInformedConsentSmokingForms();
          } catch (error: any) {
            console.error('❌ Error saving informed consent smoking form:', error);
            toast({
              title: 'Save failed',
              description: 'Could not save informed consent smoking form. See console for details.',
              variant: 'destructive'
            });
          }
        }}
        patientName={patient?.full_name}
        patientDateOfBirth={patient?.date_of_birth}
        patientId={patient?.id}
        initialData={editingInformedConsentSmokingForm}
        isEditing={isEditingInformedConsentSmokingForm}
        readOnly={isViewingInformedConsentSmokingForm && !isEditingInformedConsentSmokingForm}
      />

      {/* Thank You and Pre-Surgery Form Dialog */}
      {patient && (
        <ThankYouPreSurgeryDialog
          isOpen={showThankYouPreSurgeryForm}
          onClose={() => {
            setShowThankYouPreSurgeryForm(false);
            setIsViewingThankYouPreSurgeryForm(false);
            setIsEditingThankYouPreSurgeryForm(false);
            setSelectedThankYouPreSurgeryForm(null);
            setSelectedAdminFormType("");
          }}
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          initialData={selectedThankYouPreSurgeryForm}
          isEditing={isEditingThankYouPreSurgeryForm}
          isViewing={isViewingThankYouPreSurgeryForm}
          onSubmit={async (formData) => {
            try {
              // Update local state (the dialog handles the actual saving)
              if (isEditingThankYouPreSurgeryForm && selectedThankYouPreSurgeryForm) {
                setThankYouPreSurgeryForms(prev =>
                  prev.map(form => form.id === selectedThankYouPreSurgeryForm.id ? formData : form)
                );
              } else {
                setThankYouPreSurgeryForms(prev => [formData, ...prev]);
              }

              toast({
                title: "Success",
                description: "Thank You and Pre-Surgery Instructions form saved successfully!",
              });

              // Reset states and refresh forms
              setShowThankYouPreSurgeryForm(false);
              setIsEditingThankYouPreSurgeryForm(false);
              setIsViewingThankYouPreSurgeryForm(false);
              setSelectedThankYouPreSurgeryForm(null);
              setSelectedAdminFormType("");
              await fetchThankYouPreSurgeryForms();

              // Navigate to Forms section
              setActiveTab("forms");
            } catch (error) {
              console.error('Error in onSubmit:', error);
              toast({
                title: "Error",
                description: "Failed to save form. Please try again.",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {/* 3-Year Care Package Enrollment Form Dialog */}
      <ThreeYearCarePackageDialog
        isOpen={showThreeYearCarePackageForm}
        onClose={async () => {
          setShowThreeYearCarePackageForm(false);
          setIsViewingThreeYearCarePackageForm(false);
          setIsEditingThreeYearCarePackageForm(false);
          setSelectedThreeYearCarePackageForm(null);
          setSelectedAdminFormType("");
          // Refresh the forms list to show any auto-saved drafts
          await fetchThreeYearCarePackageForms();
        }}
        onSubmit={async (formData) => {
          try {
            // Update local state (the dialog handles the actual saving)
            if (isEditingThreeYearCarePackageForm && selectedThreeYearCarePackageForm) {
              setThreeYearCarePackageForms(prev =>
                prev.map(form => form.id === selectedThreeYearCarePackageForm.id ? formData : form)
              );
            } else {
              setThreeYearCarePackageForms(prev => [formData, ...prev]);
            }

            toast({
              title: "Success",
              description: "3-Year Care Package form submitted successfully!",
            });

            // Reset states and refresh forms
            setShowThreeYearCarePackageForm(false);
            setIsEditingThreeYearCarePackageForm(false);
            setIsViewingThreeYearCarePackageForm(false);
            setSelectedThreeYearCarePackageForm(null);
            setSelectedAdminFormType("");
            await fetchThreeYearCarePackageForms();

            // Navigate to Forms section
            setActiveTab("forms");
          } catch (error) {
            console.error('Error handling 3-Year Care Package form submission:', error);
            toast({
              title: "Error",
              description: "Failed to process form submission. Please try again.",
              variant: "destructive"
            });
          }
        }}
        patientName={patient?.full_name}
        patientDateOfBirth={patient?.date_of_birth}
        patientId={patient?.id}
        initialData={selectedThreeYearCarePackageForm ? formatThreeYearCarePackageFormForDisplay(selectedThreeYearCarePackageForm) : undefined}
        isEditing={isEditingThreeYearCarePackageForm}
        isViewing={isViewingThreeYearCarePackageForm}
      />

      {/* 5-Year Extended Warranty Form Dialog */}
      {patient && (
        <FiveYearWarrantyDialog
          isOpen={showFiveYearWarrantyForm}
          onClose={() => {
            setShowFiveYearWarrantyForm(false);
            setSelectedAdminFormType("");
            setSelectedFiveYearWarrantyForm(null);
            setIsEditingFiveYearWarrantyForm(false);
            setIsViewingFiveYearWarrantyForm(false);
            // Refresh forms to show any auto-saved drafts
            fetchFiveYearWarrantyForms();
          }}
          patientId={patientId}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          initialData={(() => {
            const formattedData = selectedFiveYearWarrantyForm ? formatFiveYearWarrantyFormForDisplay(selectedFiveYearWarrantyForm) : null;
            console.log('🔍 PatientProfilePage - selectedFiveYearWarrantyForm:', selectedFiveYearWarrantyForm);
            console.log('🔍 PatientProfilePage - formattedData:', formattedData);
            return formattedData;
          })()}
          isEditing={isEditingFiveYearWarrantyForm}
          isViewing={isViewingFiveYearWarrantyForm}
          onSubmit={async (formData) => {
            try {
              // Update local state
              if (isEditingFiveYearWarrantyForm && selectedFiveYearWarrantyForm) {
                setFiveYearWarrantyForms(prev =>
                  prev.map(form => form.id === selectedFiveYearWarrantyForm.id ? formData : form)
                );
              } else {
                setFiveYearWarrantyForms(prev => [formData, ...prev]);
              }

              toast({
                title: "Success",
                description: "5-Year Extended Warranty form saved successfully!",
              });

              // Reset states and refresh forms
              setShowFiveYearWarrantyForm(false);
              setSelectedAdminFormType("");
              setSelectedFiveYearWarrantyForm(null);
              setIsEditingFiveYearWarrantyForm(false);
              setIsViewingFiveYearWarrantyForm(false);

              // Navigate to forms section
              handleTabChange('clinical');

              // Refresh the forms list
              fetchFiveYearWarrantyForms();
            } catch (error) {
              console.error('Unexpected error saving 5-Year Warranty form:', error);
              toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
              });
            }
          }}
        />
      )}

      {/* Partial Payment Agreement Form Dialog */}
      {patient && (
        <PartialPaymentAgreementDialog
          isOpen={showPartialPaymentAgreementForm}
          onClose={() => {
            setShowPartialPaymentAgreementForm(false);
            setIsViewingPartialPaymentAgreementForm(false);
            setIsEditingPartialPaymentAgreementForm(false);
            setSelectedPartialPaymentAgreementForm(null);
            setSelectedAdminFormType("");
          }}
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          initialData={selectedPartialPaymentAgreementForm}
          isEditing={isEditingPartialPaymentAgreementForm}
          isViewing={isViewingPartialPaymentAgreementForm}
          onSubmit={async (formData) => {
            try {
              // Update local state (the dialog handles the actual saving)
              if (isEditingPartialPaymentAgreementForm && selectedPartialPaymentAgreementForm) {
                setPartialPaymentAgreementForms(prev =>
                  prev.map(form => form.id === selectedPartialPaymentAgreementForm.id ? formData : form)
                );
              } else {
                setPartialPaymentAgreementForms(prev => [formData, ...prev]);
              }

              toast({
                title: "Success",
                description: "Partial Payment Agreement form saved successfully!",
              });

              // Reset states and refresh forms
              setShowPartialPaymentAgreementForm(false);
              setIsEditingPartialPaymentAgreementForm(false);
              setIsViewingPartialPaymentAgreementForm(false);
              setSelectedPartialPaymentAgreementForm(null);
              setSelectedAdminFormType("");
              await fetchPartialPaymentAgreementForms();

              // Navigate to Forms section
              setActiveTab("forms");
            } catch (error) {
              console.error('Error handling Partial Payment Agreement form submission:', error);
              toast({
                title: "Error",
                description: "Failed to process form submission. Please try again.",
                variant: "destructive"
              });
            }
          }}
        />
      )}

      {/* Delete Treatment Confirmation Dialog */}
      <Dialog open={showDeleteTreatmentConfirmation} onOpenChange={setShowDeleteTreatmentConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-red-600">
              <div className="p-2 bg-red-100 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Treatment
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete the {treatmentToDelete?.type} arch treatment? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteTreatmentConfirmation(false);
                setTreatmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTreatment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Treatment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Packet Confirmation Dialog */}
      <AlertDialog open={showDeletePacketConfirm} onOpenChange={setShowDeletePacketConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Patient Packet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the patient packet for{" "}
              <strong>
                {packetToDelete ? `${packetToDelete.first_name} ${packetToDelete.last_name}` : "this patient"}
              </strong>
              ?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePatientPacket}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Financial Agreement Confirmation Dialog */}
      <AlertDialog open={showDeleteFinancialAgreementConfirm} onOpenChange={setShowDeleteFinancialAgreementConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Financial Agreement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this financial agreement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteFinancialAgreementConfirm(false);
              setFinancialAgreementToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFinancialAgreement}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Consent Packet Confirmation Dialog */}
      <AlertDialog open={showDeleteConsentFormConfirm} onOpenChange={setShowDeleteConsentFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Consent Packet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this consent packet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConsentFormConfirm(false);
              setConsentFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConsentForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Medical Records Release Form Confirmation Dialog */}
      <AlertDialog open={showDeleteMedicalRecordsReleaseFormConfirm} onOpenChange={setShowDeleteMedicalRecordsReleaseFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Medical Records Release Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medical records release form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteMedicalRecordsReleaseFormConfirm(false);
              setMedicalRecordsReleaseFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedicalRecordsReleaseForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Informed Consent Smoking Form Confirmation Dialog */}
      <AlertDialog open={showDeleteInformedConsentSmokingFormConfirm} onOpenChange={setShowDeleteInformedConsentSmokingFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Informed Consent Smoking Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this informed consent smoking form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteInformedConsentSmokingFormConfirm(false);
              setInformedConsentSmokingFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInformedConsentSmokingForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Final Design Approval Form Confirmation Dialog */}
      <AlertDialog open={showDeleteFinalDesignApprovalFormConfirm} onOpenChange={setShowDeleteFinalDesignApprovalFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Final Design Approval Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this final design approval form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteFinalDesignApprovalFormConfirm(false);
              setFinalDesignApprovalFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFinalDesignApprovalForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Thank You Pre-Surgery Form Confirmation Dialog */}
      <AlertDialog open={showDeleteThankYouPreSurgeryFormConfirm} onOpenChange={setShowDeleteThankYouPreSurgeryFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Thank You Pre-Surgery Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thank you pre-surgery form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteThankYouPreSurgeryFormConfirm(false);
              setThankYouPreSurgeryFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteThankYouPreSurgeryForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete 3-Year Care Package Form Confirmation Dialog */}
      <AlertDialog open={showDeleteThreeYearCarePackageFormConfirm} onOpenChange={setShowDeleteThreeYearCarePackageFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete 3-Year Care Package Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this 3-Year Care Package form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteThreeYearCarePackageFormConfirm(false);
              setThreeYearCarePackageFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteThreeYearCarePackageForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete 5-Year Warranty Form Confirmation Dialog */}
      <AlertDialog open={showDeleteFiveYearWarrantyFormConfirm} onOpenChange={setShowDeleteFiveYearWarrantyFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete 5-Year Extended Warranty Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this 5-Year Extended Warranty form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteFiveYearWarrantyFormConfirm(false);
              setFiveYearWarrantyFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFiveYearWarrantyForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Partial Payment Agreement Form Confirmation Dialog */}
      <AlertDialog open={showDeletePartialPaymentAgreementFormConfirm} onOpenChange={setShowDeletePartialPaymentAgreementFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Partial Payment Agreement Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Partial Payment Agreement form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeletePartialPaymentAgreementFormConfirm(false);
              setPartialPaymentAgreementFormToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!partialPaymentAgreementFormToDelete) return;
                try {
                  await partialPaymentAgreementService.deleteForm(partialPaymentAgreementFormToDelete.id);
                  setPartialPaymentAgreementForms(prev => prev.filter(form => form.id !== partialPaymentAgreementFormToDelete.id));
                  setShowDeletePartialPaymentAgreementFormConfirm(false);
                  setPartialPaymentAgreementFormToDelete(null);
                  toast({
                    title: "Success",
                    description: "Partial Payment Agreement form deleted successfully!",
                  });
                } catch (error) {
                  console.error('Error deleting Partial Payment Agreement form:', error);
                  toast({
                    title: "Error",
                    description: "Failed to delete Partial Payment Agreement form. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Treatment Plan Form Confirmation Dialog */}
      <AlertDialog open={showDeleteTreatmentPlanFormConfirm} onOpenChange={setShowDeleteTreatmentPlanFormConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Treatment Plan Form
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this treatment plan form? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!treatmentPlanFormToDelete) return;
                try {
                  const { error } = await deleteTreatmentPlanForm(treatmentPlanFormToDelete.id);
                  if (error) {
                    console.error('Error deleting treatment plan form:', error);
                    toast({
                      title: "Error",
                      description: "Failed to delete treatment plan form. Please try again.",
                      variant: "destructive",
                    });
                    return;
                  }

                  setTreatmentPlanForms(prev => prev.filter(form => form.id !== treatmentPlanFormToDelete.id));
                  setShowDeleteTreatmentPlanFormConfirm(false);
                  setTreatmentPlanFormToDelete(null);
                  toast({
                    title: "Success",
                    description: "Treatment plan form deleted successfully!",
                  });
                } catch (error) {
                  console.error('Error deleting treatment plan form:', error);
                  toast({
                    title: "Error",
                    description: "Failed to delete treatment plan form. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Treatment Plan Dialog */}
      {patient && (
        <TreatmentPlanDialog
          isOpen={showTreatmentPlanForm}
          onClose={() => {
            setShowTreatmentPlanForm(false);
            setSelectedAdminFormType("");
            setSelectedTreatmentPlanForm(null);
            setIsEditingTreatmentPlanForm(false);
            setIsViewingTreatmentPlanForm(false);
            // Refresh forms to show any auto-saved drafts
            fetchTreatmentPlanForms();
          }}
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.date_of_birth}
          userId={user?.id}
          initialData={(() => {
            if (selectedTreatmentPlanForm && (isEditingTreatmentPlanForm || isViewingTreatmentPlanForm)) {
              return {
                firstName: selectedTreatmentPlanForm.first_name,
                lastName: selectedTreatmentPlanForm.last_name,
                dateOfBirth: selectedTreatmentPlanForm.date_of_birth,
                treatments: selectedTreatmentPlanForm.treatments || [],
                planDate: selectedTreatmentPlanForm.plan_date || '',
                formStatus: selectedTreatmentPlanForm.form_status
              };
            }
            return undefined;
          })()}
          isEditing={isEditingTreatmentPlanForm}
          isViewing={isViewingTreatmentPlanForm}
          formId={selectedTreatmentPlanForm?.id}
          onSubmit={async (formData) => {
            try {
              console.log('Treatment plan submitted:', formData);

              // Prepare data for saving to Supabase
              const treatmentPlanData = {
                patient_id: patient.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                date_of_birth: formData.dateOfBirth,
                treatments: formData.treatments,
                plan_date: formData.planDate,
                form_status: 'completed' as const
              };

              // Save to Supabase
              const { data, error } = await saveTreatmentPlanForm(
                treatmentPlanData,
                user?.id
              );

              if (error) {
                console.error('Error saving treatment plan:', error);
                toast({
                  title: "Error",
                  description: "Failed to save treatment plan. Please try again.",
                  variant: "destructive",
                });
                return;
              }

              console.log('Treatment plan saved successfully:', data);
              toast({
                title: "Success",
                description: "Treatment plan created successfully!",
              });

              setShowTreatmentPlanForm(false);
              setSelectedAdminFormType("");
              setSelectedTreatmentPlanForm(null);
              setIsEditingTreatmentPlanForm(false);
              setIsViewingTreatmentPlanForm(false);

              // Refresh the forms list
              fetchTreatmentPlanForms();

              // Navigate to Forms section
              setActiveTab("clinical");
            } catch (error) {
              console.error('Error saving treatment plan:', error);
              toast({
                title: "Error",
                description: "Failed to save treatment plan. Please try again.",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {/* Consultation Viewer */}
      <ConsultationViewer
        consultation={selectedConsultation}
        isOpen={showConsultationViewer}
        onClose={handleCloseConsultationViewer}
      />
    </div>
  );
}
