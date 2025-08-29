import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { toast } from "sonner";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { FileText, User, Calendar, AlertTriangle, Stethoscope, CheckCircle, Edit, DollarSign, Camera, Shield, Check, ChevronLeft, ChevronRight, Pill, Clock, Mail } from "lucide-react";

interface ConsentFullArchFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
  // Auto-save props
  onAutoSave?: (formData: any) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  autoSaveMessage?: string;
  lastSavedTime?: string;
  setAutoSaveStatus?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setAutoSaveMessage?: (message: string) => void;
}

export function ConsentFullArchForm({
  onSubmit,
  onCancel,
  patientName = "",
  patientDateOfBirth = "",
  initialData = null,
  isEditing = false,
  readOnly = false,
  onAutoSave,
  autoSaveStatus = 'idle',
  autoSaveMessage = '',
  lastSavedTime = '',
  setAutoSaveStatus,
  setAutoSaveMessage
}: ConsentFullArchFormProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Step configuration for progress indicator
  const steps = [
    { id: "overview", label: "Overview", index: 1 },
    { id: "patient-info", label: "Patient Info", index: 2 },
    { id: "treatment", label: "Treatment", index: 3 },
    { id: "risks", label: "Risks", index: 4 },
    { id: "sedation", label: "Sedation", index: 5 },
    { id: "financial", label: "Financial", index: 6 },
    { id: "media", label: "Media", index: 7 },
    { id: "opioid", label: "Opioid", index: 8 },
    { id: "final", label: "Final", index: 9 }
  ];

  const getCurrentStepIndex = () => {
    const currentStep = steps.find(step => step.id === activeTab);
    return currentStep ? currentStep.index : 1;
  };

  const isStepCompleted = (stepId: string) => {
    const stepIndex = steps.find(step => step.id === stepId)?.index || 0;
    return stepIndex < getCurrentStepIndex();
  };

  // Scroll to top helper function
  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  // Navigation functions
  const getCurrentArrayIndex = () => {
    return steps.findIndex(step => step.id === activeTab);
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentArrayIndex();
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id);
      scrollToTop();
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentArrayIndex();
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1].id);
      scrollToTop();
    }
  };

  const isFirstStep = getCurrentArrayIndex() === 0;
  const isLastStep = getCurrentArrayIndex() === steps.length - 1;
  const [formData, setFormData] = useState(() => {
    // The initialData comes from the service already converted to camelCase
    const today = new Date().toISOString().split('T')[0];

    const initialFormData = {
      // Patient & Interpreter Information
      patientName: initialData?.patientName || patientName || "",
      chartNumber: initialData?.chartNumber || "",
      date: initialData?.date || today,
      consentTime: initialData?.consentTime || "",
      primaryLanguage: initialData?.primaryLanguage || "english",
      otherLanguageText: initialData?.otherLanguageText || "",
      interpreterRequired: initialData?.interpreterRequired || "no",
      interpreterName: initialData?.interpreterName || "",
      interpreterCredential: initialData?.interpreterCredential || "",
      patientInfoInitials: initialData?.patientInfoInitials || "",

      // Treatment Description
      archType: initialData?.archType || "", // "upper", "lower", "dual"
      upperJaw: initialData?.upperJaw || "",
      lowerJaw: initialData?.lowerJaw || "",

      // Upper Arch Treatment Details
      upperTeethRegions: initialData?.upperTeethRegions || "",
      upperImplants: initialData?.upperImplants || "",
      upperSameDayLoad: initialData?.upperSameDayLoad || "",

      // Lower Arch Treatment Details
      lowerTeethRegions: initialData?.lowerTeethRegions || "",
      lowerImplants: initialData?.lowerImplants || "",
      lowerSameDayLoad: initialData?.lowerSameDayLoad || "",

      // ASA Physical Status
      asaPhysicalStatus: initialData?.asaPhysicalStatus || "",

      // Treatment Description Initials
      treatmentDescriptionInitials: initialData?.treatmentDescriptionInitials || "",

      // Planned Drugs
      midazolam: initialData?.midazolam ?? false,
      fentanyl: initialData?.fentanyl ?? false,
      ketamine: initialData?.ketamine ?? false,
      dexamethasone: initialData?.dexamethasone ?? false,

      // Signatures
      patientSignature: initialData?.patientSignature || "",
      patientSignatureDate: initialData?.patientSignatureDate || today,
      patientSignatureTime: initialData?.patientSignatureTime || "",
      surgeonSignature: initialData?.surgeonSignature || "",
      surgeonDate: initialData?.surgeonDate || today,
      witnessSignature: initialData?.witnessSignature || "",
      witnessSignatureDate: initialData?.witnessSignatureDate || today,

      // Legacy nested objects for form compatibility (to prevent undefined errors)
      sedationPlan: {
        localOnly: initialData?.sedationLocalOnly ?? false,
        nitrous: initialData?.sedationNitrous ?? false,
        ivConscious: initialData?.sedationIvConscious ?? false,
        generalHospital: initialData?.sedationGeneralHospital ?? false
      },
      plannedDrugs: {
        midazolam: initialData?.midazolam ?? false,
        fentanyl: initialData?.fentanyl ?? false,
        ketamine: initialData?.ketamine ?? false,
        dexamethasone: initialData?.dexamethasone ?? false
      },
      upperGraftMaterial: {
        allograft: initialData?.upperGraftAllograft ?? false,
        xenograft: initialData?.upperGraftXenograft ?? false,
        autograft: initialData?.upperGraftAutograft ?? false
      },
      upperProsthesis: {
        zirconia: initialData?.upperProsthesisZirconia ?? false,
        overdenture: initialData?.upperProsthesisOverdenture ?? false
      },
      lowerGraftMaterial: {
        allograft: initialData?.lowerGraftAllograft ?? false,
        xenograft: initialData?.lowerGraftXenograft ?? false,
        autograft: initialData?.lowerGraftAutograft ?? false
      },
      lowerProsthesis: {
        zirconia: initialData?.lowerProsthesisZirconia ?? false,
        overdenture: initialData?.lowerProsthesisOverdenture ?? false
      },
      alternativesInitials: {
        noTreatment: initialData?.alternativesNoTreatmentInitials || "",
        conventionalDentures: initialData?.alternativesConventionalDenturesInitials || "",
        segmentedExtraction: initialData?.alternativesSegmentedExtractionInitials || "",
        removableOverdentures: initialData?.alternativesRemovableOverdenturesInitials || "",
        zygomaticImplants: initialData?.alternativesZygomaticImplantsInitials || ""
      },
      surgicalExtractions: {
        count: "",
        fee: "",
        covered: ""
      },
      implantFixtures: {
        count: "",
        fee: "",
        covered: ""
      },
      zirconiabridge: {
        fee: "",
        covered: ""
      },
      ivSedation: {
        fee: "",
        covered: ""
      }
    };

    console.log('🏁 Initial Consent Full Arch form data setup:', {
      patientName: initialFormData.patientName,
      archType: initialFormData.archType,
      patientSignature: initialFormData.patientSignature,
      fromInitialData: !!initialData,
      initialDataId: initialData?.id,
      hasInitialData: !!initialData
    });

    return initialFormData;
  });

  const [hasFormData, setHasFormData] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && initialData.id) {
      console.log('🔄 Updating Consent Full Arch form data from initialData:', initialData);
      console.log('🔍 isEditing:', isEditing, 'readOnly:', readOnly);
      console.log('🔍 Risks data from initialData:', {
        risksUnderstood: initialData.risksUnderstood,
        materialRisksInitials: initialData.materialRisksInitials
      });
      console.log('🔍 Sedation data from initialData:', {
        escortName: initialData.escortName,
        escortPhone: initialData.escortPhone,
        medicationsDisclosed: initialData.medicationsDisclosed,
        declineIVSedation: initialData.declineIVSedation,
        sedationInitials: initialData.sedationInitials,

        ivSedation: initialData.ivSedation
      });
      console.log('🔍 Financial data from initialData:', {
        surgicalExtractions: initialData.surgicalExtractions,
        implantFixtures: initialData.implantFixtures,
        zirconiabridge: initialData.zirconiabridge,
        financialInitials: initialData.financialInitials
      });
      console.log('🔍 Media data from initialData:', {
        internalRecordKeeping: initialData.internalRecordKeeping,
        professionalEducation: initialData.professionalEducation,
        marketingSocialMedia: initialData.marketingSocialMedia,
        photoVideoInitials: initialData.photoVideoInitials
      });
      console.log('🔍 HIPAA data from initialData:', {
        hipaaEmailSms: initialData.hipaaEmailSms,
        hipaaEmail: initialData.hipaaEmail,
        hipaaPhone: initialData.hipaaPhone
      });
      console.log('🔍 Opioid data from initialData:', {
        opioidInitials: initialData.opioidInitials,
        smallestOpioidSupply: initialData.smallestOpioidSupply
      });
      console.log('🔍 Final section data from initialData:', {
        surgeonName: initialData.surgeonName,
        surgeonSignature: initialData.surgeonSignature,
        surgeonDate: initialData.surgeonDate,
        patientSignature: initialData.patientSignature,
        patientSignatureDate: initialData.patientSignatureDate,
        witnessName: initialData.witnessName,
        witnessSignature: initialData.witnessSignature,
        witnessSignatureDate: initialData.witnessSignatureDate,
        finalInitials: initialData.finalInitials
      });
      console.log('🔍 Acknowledgment data from initialData:', {
        acknowledgmentRead: initialData.acknowledgmentRead,
        acknowledgmentOutcome: initialData.acknowledgmentOutcome,
        acknowledgmentAuthorize: initialData.acknowledgmentAuthorize
      });
      console.log('🔍 Date/Time data from initialData:', {
        date: initialData.date,
        consentTime: initialData.consentTime
      });

      const today = new Date().toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        // Patient & Interpreter Information
        patientName: initialData.patientName || prev.patientName || "",
        chartNumber: initialData.chartNumber || prev.chartNumber || "",
        date: initialData.date || prev.date || today,
        consentTime: initialData.consentTime || prev.consentTime || "",
        primaryLanguage: initialData.primaryLanguage || prev.primaryLanguage || "english",
        otherLanguageText: initialData.otherLanguageText || prev.otherLanguageText || "",
        interpreterRequired: initialData.interpreterRequired || prev.interpreterRequired || "no",
        interpreterName: initialData.interpreterName || prev.interpreterName || "",
        interpreterCredential: initialData.interpreterCredential || prev.interpreterCredential || "",
        patientInfoInitials: initialData.patientInfoInitials || prev.patientInfoInitials || "",

        // Treatment Description
        archType: initialData.archType || prev.archType || "",
        upperJaw: initialData.upperJaw || prev.upperJaw || "",
        lowerJaw: initialData.lowerJaw || prev.lowerJaw || "",

        // Upper Arch Treatment Details
        upperTeethRegions: initialData.upperTeethRegions || prev.upperTeethRegions || "",
        upperImplants: initialData.upperImplants || prev.upperImplants || "",
        upperSameDayLoad: initialData.upperSameDayLoad || prev.upperSameDayLoad || "",

        // Lower Arch Treatment Details
        lowerTeethRegions: initialData.lowerTeethRegions || prev.lowerTeethRegions || "",
        lowerImplants: initialData.lowerImplants || prev.lowerImplants || "",
        lowerSameDayLoad: initialData.lowerSameDayLoad || prev.lowerSameDayLoad || "",

        // ASA Physical Status
        asaPhysicalStatus: initialData.asaPhysicalStatus || prev.asaPhysicalStatus || "",

        // Treatment Description Initials
        treatmentDescriptionInitials: initialData.treatmentDescriptionInitials || prev.treatmentDescriptionInitials || "",

        // Material Risks
        risksUnderstood: initialData.risksUnderstood ?? prev.risksUnderstood ?? false,
        materialRisksInitials: initialData.materialRisksInitials || prev.materialRisksInitials || "",

        // Sedation & Anesthesia Consent
        escortName: initialData.escortName || prev.escortName || "",
        escortPhone: initialData.escortPhone || prev.escortPhone || "",
        medicationsDisclosed: initialData.medicationsDisclosed ?? prev.medicationsDisclosed ?? false,
        declineIVSedation: initialData.declineIVSedation ?? prev.declineIVSedation ?? false,
        sedationInitials: initialData.sedationInitials || prev.sedationInitials || "",

        ivSedation: {
          fee: initialData.ivSedation?.fee || prev.ivSedation?.fee || "",
          covered: initialData.ivSedation?.covered || prev.ivSedation?.covered || ""
        },

        // Planned Drugs
        midazolam: initialData.midazolam ?? prev.midazolam ?? false,
        fentanyl: initialData.fentanyl ?? prev.fentanyl ?? false,
        ketamine: initialData.ketamine ?? prev.ketamine ?? false,
        dexamethasone: initialData.dexamethasone ?? prev.dexamethasone ?? false,

        // Financial Disclosure
        surgicalExtractions: {
          count: initialData.surgicalExtractions?.count || prev.surgicalExtractions?.count || "",
          fee: initialData.surgicalExtractions?.fee || prev.surgicalExtractions?.fee || "",
          covered: initialData.surgicalExtractions?.covered || prev.surgicalExtractions?.covered || ""
        },
        implantFixtures: {
          count: initialData.implantFixtures?.count || prev.implantFixtures?.count || "",
          fee: initialData.implantFixtures?.fee || prev.implantFixtures?.fee || "",
          covered: initialData.implantFixtures?.covered || prev.implantFixtures?.covered || ""
        },
        zirconiabridge: {
          fee: initialData.zirconiabridge?.fee || prev.zirconiabridge?.fee || "",
          covered: initialData.zirconiabridge?.covered || prev.zirconiabridge?.covered || ""
        },
        financialInitials: initialData.financialInitials || prev.financialInitials || "",

        // Photo/Video Authorization
        internalRecordKeeping: initialData.internalRecordKeeping || prev.internalRecordKeeping || "",
        professionalEducation: initialData.professionalEducation || prev.professionalEducation || "",
        marketingSocialMedia: initialData.marketingSocialMedia || prev.marketingSocialMedia || "",
        photoVideoInitials: initialData.photoVideoInitials || prev.photoVideoInitials || "",

        // HIPAA Email/SMS Authorization
        hipaaEmailSms: initialData.hipaaEmailSms ?? prev.hipaaEmailSms ?? false,
        hipaaEmail: initialData.hipaaEmail || prev.hipaaEmail || "",
        hipaaPhone: initialData.hipaaPhone || prev.hipaaPhone || "",

        // Opioid Consent
        opioidInitials: initialData.opioidInitials || prev.opioidInitials || "",
        smallestOpioidSupply: initialData.smallestOpioidSupply ?? prev.smallestOpioidSupply ?? false,

        // Patient Acknowledgment & Authorization
        acknowledgmentRead: initialData.acknowledgmentRead ?? prev.acknowledgmentRead ?? false,
        acknowledgmentOutcome: initialData.acknowledgmentOutcome ?? prev.acknowledgmentOutcome ?? false,
        acknowledgmentAuthorize: initialData.acknowledgmentAuthorize ?? prev.acknowledgmentAuthorize ?? false,

        // Signatures
        surgeonName: initialData.surgeonName || prev.surgeonName || "",
        surgeonSignature: initialData.surgeonSignature || prev.surgeonSignature || "",
        surgeonDate: initialData.surgeonDate || prev.surgeonDate || today,
        patientSignature: initialData.patientSignature || prev.patientSignature || "",
        patientSignatureDate: initialData.patientSignatureDate || prev.patientSignatureDate || today,
        patientSignatureTime: initialData.patientSignatureTime || prev.patientSignatureTime || "",
        witnessName: initialData.witnessName || prev.witnessName || "",
        witnessSignature: initialData.witnessSignature || prev.witnessSignature || "",
        witnessSignatureDate: initialData.witnessSignatureDate || prev.witnessSignatureDate || today,
        finalInitials: initialData.finalInitials || prev.finalInitials || ""
      }));

      // Mark form as initialized after loading initial data
      setIsFormInitialized(true);
    } else if (!initialData?.id) {
      // Mark form as initialized for new forms (no initial data)
      setIsFormInitialized(true);
    }
  }, [initialData?.id, patientName]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!onAutoSave || !isFormInitialized) return;

    // Check if form has meaningful data
    const hasData = formData.patientName || formData.archType || formData.patientSignature ||
                   formData.plannedDrugs.midazolam || formData.plannedDrugs.fentanyl || formData.plannedDrugs.ketamine || formData.plannedDrugs.dexamethasone ||
                   formData.upperTeethRegions || formData.upperImplants || formData.upperSameDayLoad ||
                   formData.lowerTeethRegions || formData.lowerImplants || formData.lowerSameDayLoad ||
                   formData.asaPhysicalStatus || formData.treatmentDescriptionInitials ||
                   formData.upperGraftMaterial.allograft || formData.upperGraftMaterial.xenograft || formData.upperGraftMaterial.autograft ||
                   formData.lowerGraftMaterial.allograft || formData.lowerGraftMaterial.xenograft || formData.lowerGraftMaterial.autograft ||
                   formData.upperProsthesis.zirconia || formData.upperProsthesis.overdenture ||
                   formData.lowerProsthesis.zirconia || formData.lowerProsthesis.overdenture ||
                   formData.sedationPlan.localOnly || formData.sedationPlan.nitrous || formData.sedationPlan.ivConscious || formData.sedationPlan.generalHospital ||
                   formData.alternativesInitials.noTreatment || formData.alternativesInitials.conventionalDentures ||
                   formData.alternativesInitials.segmentedExtraction || formData.alternativesInitials.removableOverdentures || formData.alternativesInitials.zygomaticImplants ||
                   // Include risks section fields
                   formData.risksUnderstood || formData.materialRisksInitials ||
                   // Include sedation/anesthesia fields
                   formData.escortName || formData.escortPhone || formData.medicationsDisclosed || formData.declineIVSedation ||
                   formData.sedationInitials || formData.ivSedation.fee || formData.ivSedation.covered ||
                   // Include financial fields
                   formData.surgicalExtractions.count || formData.surgicalExtractions.fee || formData.surgicalExtractions.covered ||
                   formData.implantFixtures.count || formData.implantFixtures.fee || formData.implantFixtures.covered ||
                   formData.zirconiabridge.fee || formData.zirconiabridge.covered || formData.financialInitials ||
                   // Include media fields
                   formData.internalRecordKeeping || formData.professionalEducation || formData.marketingSocialMedia ||
                   formData.photoVideoInitials ||
                   // Include HIPAA fields
                   formData.hipaaEmailSms || formData.hipaaEmail || formData.hipaaPhone ||
                   // Include opioid fields
                   formData.opioidInitials || formData.smallestOpioidSupply ||
                   // Include final section fields
                   formData.surgeonName || formData.surgeonSignature || formData.surgeonDate ||
                   formData.witnessName || formData.witnessSignature || formData.witnessSignatureDate ||
                   formData.finalInitials ||
                   // Include consent acknowledgments
                   formData.acknowledgmentRead || formData.acknowledgmentOutcome || formData.acknowledgmentAuthorize ||
                   // Include other important fields
                   formData.chartNumber || formData.date || formData.consentTime;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Auto-saving Consent Full Arch form with data:', {
        patientName: formData.patientName,
        archType: formData.archType,
        patientSignature: formData.patientSignature,
        isFormInitialized: isFormInitialized,
        financialData: {
          surgicalExtractions: formData.surgicalExtractions,
          implantFixtures: formData.implantFixtures,
          zirconiabridge: formData.zirconiabridge,
          financialInitials: formData.financialInitials
        },
        mediaData: {
          internalRecordKeeping: formData.internalRecordKeeping,
          professionalEducation: formData.professionalEducation,
          marketingSocialMedia: formData.marketingSocialMedia,
          photoVideoInitials: formData.photoVideoInitials
        },
        hipaaData: {
          hipaaEmailSms: formData.hipaaEmailSms,
          hipaaEmail: formData.hipaaEmail,
          hipaaPhone: formData.hipaaPhone
        },
        opioidData: {
          opioidInitials: formData.opioidInitials,
          smallestOpioidSupply: formData.smallestOpioidSupply
        },
        finalSectionData: {
          surgeonName: formData.surgeonName,
          surgeonSignature: formData.surgeonSignature,
          surgeonDate: formData.surgeonDate,
          patientSignature: formData.patientSignature,
          patientSignatureDate: formData.patientSignatureDate,
          witnessName: formData.witnessName,
          witnessSignature: formData.witnessSignature,
          witnessSignatureDate: formData.witnessSignatureDate,
          finalInitials: formData.finalInitials
        },
        acknowledgmentData: {
          acknowledgmentRead: formData.acknowledgmentRead,
          acknowledgmentOutcome: formData.acknowledgmentOutcome,
          acknowledgmentAuthorize: formData.acknowledgmentAuthorize
        },
        dateTimeData: {
          date: formData.date,
          consentTime: formData.consentTime
        }
      });
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, isFormInitialized]);

  // Legacy form state (keeping for compatibility with existing form UI)
  const [legacyFormData, setLegacyFormData] = useState({
    upperTeethRegions: initialData?.upper_teeth_regions || "",
    upperImplants: initialData?.upper_implants || "",
    upperGraftMaterial: {
      allograft: initialData?.upper_graft_allograft || false,
      xenograft: initialData?.upper_graft_xenograft || false,
      autograft: initialData?.upper_graft_autograft || false
    },
    upperProsthesis: {
      zirconia: initialData?.upper_prosthesis_zirconia || false,
      overdenture: initialData?.upper_prosthesis_overdenture || false
    },
    upperSameDayLoad: initialData?.upper_same_day_load || "",
    lowerJaw: initialData?.lower_jaw || "",
    lowerTeethRegions: initialData?.lower_teeth_regions || "",
    lowerImplants: initialData?.lower_implants || "",
    lowerGraftMaterial: {
      allograft: initialData?.lower_graft_allograft || false,
      xenograft: initialData?.lower_graft_xenograft || false,
      autograft: initialData?.lower_graft_autograft || false
    },
    lowerProsthesis: {
      zirconia: initialData?.lower_prosthesis_zirconia || false,
      overdenture: initialData?.lower_prosthesis_overdenture || false
    },
    lowerSameDayLoad: initialData?.lower_same_day_load || "",
    sedationPlan: {
      localOnly: initialData?.sedation_local_only || false,
      nitrous: initialData?.sedation_nitrous || false,
      ivConscious: initialData?.sedation_iv_conscious || false,
      generalHospital: initialData?.sedation_general_hospital || false
    },
    asaPhysicalStatus: initialData?.asa_physical_status || "",
    plannedDrugs: {
      midazolam: initialData?.midazolam || false,
      fentanyl: initialData?.fentanyl || false,
      ketamine: initialData?.ketamine || false,
      dexamethasone: initialData?.dexamethasone || false
    },
    alternativesInitials: {
      noTreatment: initialData?.alternatives_no_treatment_initials || "",
      conventionalDentures: initialData?.alternatives_conventional_dentures_initials || "",
      segmentedExtraction: initialData?.alternatives_segmented_extraction_initials || "",
      removableOverdentures: initialData?.alternatives_removable_overdentures_initials || "",
      zygomaticImplants: initialData?.alternatives_zygomatic_implants_initials || ""
    },
    treatmentDescriptionInitials: initialData?.treatment_description_initials || "",

    // Material Risks
    risksUnderstood: initialData?.risksUnderstood || false,
    materialRisksInitials: initialData?.materialRisksInitials || "",

    // Sedation & Anesthesia Consent
    escortName: initialData?.escortName || "",
    escortPhone: initialData?.escortPhone || "",
    medicationsDisclosed: initialData?.medicationsDisclosed || false,
    declineIVSedation: initialData?.declineIVSedation || false,
    sedationInitials: initialData?.sedationInitials || "",
    // Financial Disclosure
    surgicalExtractions: {
      count: initialData?.surgicalExtractions?.count || "",
      fee: initialData?.surgicalExtractions?.fee || "",
      covered: initialData?.surgicalExtractions?.covered || ""
    },
    implantFixtures: {
      count: initialData?.implantFixtures?.count || "",
      fee: initialData?.implantFixtures?.fee || "",
      covered: initialData?.implantFixtures?.covered || ""
    },
    zirconiabridge: {
      fee: initialData?.zirconiabridge?.fee || "",
      covered: initialData?.zirconiabridge?.covered || ""
    },
    ivSedation: {
      fee: initialData?.ivSedation?.fee || "",
      covered: initialData?.ivSedation?.covered || ""
    },
    financialInitials: initialData?.financialInitials || "",

    // Photo/Video Authorization
    internalRecordKeeping: initialData?.internalRecordKeeping || "",
    professionalEducation: initialData?.professionalEducation || "",
    marketingSocialMedia: initialData?.marketingSocialMedia || "",
    hipaaEmailSms: initialData?.hipaaEmailSms || false,
    hipaaEmail: initialData?.hipaaEmail || "",
    hipaaPhone: initialData?.hipaaPhone || "",
    photoVideoInitials: initialData?.photoVideoInitials || "",

    // Opioid Consent
    opioidInitials: initialData?.opioidInitials || "",
    smallestOpioidSupply: initialData?.smallestOpioidSupply || false,

    // Final Acknowledgment & Signatures
    surgeonName: initialData?.surgeonName || "",
    surgeonSignature: initialData?.surgeonSignature || "",
    surgeonDate: initialData?.surgeonDate || "",

    patientSignature: initialData?.patientSignature || "",
    patientSignatureDate: initialData?.patientSignatureDate || new Date().toISOString().split('T')[0],
    patientSignatureTime: initialData?.patientSignatureTime || "",
    witnessName: initialData?.witnessName || "",
    witnessSignature: initialData?.witnessSignature || "",
    witnessSignatureDate: initialData?.witnessSignatureDate || new Date().toISOString().split('T')[0],
    finalInitials: initialData?.finalInitials || "",

    // Patient Acknowledgment Checkboxes
    acknowledgmentRead: initialData?.acknowledgmentRead || false,
    acknowledgmentOutcome: initialData?.acknowledgmentOutcome || false,
    acknowledgmentAuthorize: initialData?.acknowledgmentAuthorize || false
  });

  // Auto-sync patient name when it changes
  useEffect(() => {
    if (patientName && patientName !== formData.patientName) {
      setFormData(prev => ({ ...prev, patientName: patientName }));
    }
  }, [patientName, formData.patientName]);

  // Signature dialog states
  const [signatureDialogs, setSignatureDialogs] = useState({
    patientInfoInitials: false,
    treatmentDescriptionInitials: false,
    materialRisksInitials: false,
    sedationInitials: false,

    financialInitials: false,
    photoVideoInitials: false,
    opioidInitials: false,
    finalInitials: false,
    surgeonSignature: false,

    patientSignature: false,
    witnessSignature: false
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Keep footer pinned by ensuring the scroll container consumes leftover height
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // No-op but ensures layout calculated before paints after tab switches
    const id = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [childField]: value
      }
    }));
  };

  const toggleSedation = (key: 'localOnly' | 'nitrous' | 'ivConscious' | 'generalHospital') => {
    setFormData(prev => ({
      ...prev,
      sedationPlan: { ...(prev.sedationPlan as any), [key]: !(prev.sedationPlan as any)[key] }
    }));
  };



  const handleSignatureDialogOpen = (type: string) => {
    setSignatureDialogs(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleSignatureDialogClose = (type: string) => {
    setSignatureDialogs(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const handleSignatureSave = (type: string, signature: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: signature
    }));
    handleSignatureDialogClose(type);
  };

  const handleSignatureClear = (type: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.patientName) {
      toast.error('Please enter patient name');
      return;
    }

    if (!formData.archType) {
      toast.error('Please select arch type (Upper, Lower, or Dual)');
      return;
    }

    if (!formData.patientSignature) {
      toast.error('Patient signature is required');
      return;
    }

    // Ensure dates are properly formatted or use current date as fallback
    const currentDate = new Date().toISOString().split('T')[0];

    // Validate date format function
    const isValidDate = (dateString: string) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    };

    // Helper function to validate time format
    const validateTime = (timeValue: any): string | null => {
      if (!timeValue) return null;
      if (typeof timeValue === 'string' && timeValue.trim() === '') return null;

      // Check if it's already in HH:MM or HH:MM:SS format
      if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        return timeValue;
      }

      return null;
    };

    // Convert form data to match service interface
    const submissionData = {
      patient_name: formData.patientName,
      chart_number: formData.chartNumber,
      consent_date: isValidDate(formData.date) ? formData.date : currentDate,
      consent_time: validateTime(formData.consentTime),

      // Patient & Interpreter Information
      primary_language: formData.primaryLanguage,
      other_language_text: formData.otherLanguageText,
      interpreter_required: formData.interpreterRequired,
      interpreter_name: formData.interpreterName,
      interpreter_credential: formData.interpreterCredential,
      patient_info_initials: formData.patientInfoInitials,

      // Treatment Description
      arch_type: formData.archType,
      upper_jaw: formData.upperJaw,
      lower_jaw: formData.lowerJaw,

      // Upper Arch Treatment Details
      upper_teeth_regions: formData.upperTeethRegions,
      upper_implants: formData.upperImplants,
      upper_same_day_load: formData.upperSameDayLoad,

      // Lower Arch Treatment Details
      lower_teeth_regions: formData.lowerTeethRegions,
      lower_implants: formData.lowerImplants,
      lower_same_day_load: formData.lowerSameDayLoad,

      // ASA Physical Status
      asa_physical_status: formData.asaPhysicalStatus,

      // Treatment Description Initials
      treatment_description_initials: formData.treatmentDescriptionInitials,

      // Upper Arch Graft Material
      upper_graft_allograft: formData.upperGraftMaterial.allograft,
      upper_graft_xenograft: formData.upperGraftMaterial.xenograft,
      upper_graft_autograft: formData.upperGraftMaterial.autograft,

      // Upper Arch Prosthesis
      upper_prosthesis_zirconia: formData.upperProsthesis.zirconia,
      upper_prosthesis_overdenture: formData.upperProsthesis.overdenture,

      // Lower Arch Graft Material
      lower_graft_allograft: formData.lowerGraftMaterial.allograft,
      lower_graft_xenograft: formData.lowerGraftMaterial.xenograft,
      lower_graft_autograft: formData.lowerGraftMaterial.autograft,

      // Lower Arch Prosthesis
      lower_prosthesis_zirconia: formData.lowerProsthesis.zirconia,
      lower_prosthesis_overdenture: formData.lowerProsthesis.overdenture,

      // Sedation Plan
      sedation_local_only: formData.sedationPlan.localOnly,
      sedation_nitrous: formData.sedationPlan.nitrous,
      sedation_iv_conscious: formData.sedationPlan.ivConscious,
      sedation_general_hospital: formData.sedationPlan.generalHospital,

      // Planned Drugs
      midazolam: formData.plannedDrugs.midazolam,
      fentanyl: formData.plannedDrugs.fentanyl,
      ketamine: formData.plannedDrugs.ketamine,
      dexamethasone: formData.plannedDrugs.dexamethasone,

      // Alternatives Initials
      alternatives_no_treatment_initials: formData.alternativesInitials.noTreatment,
      alternatives_conventional_dentures_initials: formData.alternativesInitials.conventionalDentures,
      alternatives_segmented_extraction_initials: formData.alternativesInitials.segmentedExtraction,
      alternatives_removable_overdentures_initials: formData.alternativesInitials.removableOverdentures,
      alternatives_zygomatic_implants_initials: formData.alternativesInitials.zygomaticImplants,

      // Material Risks
      risks_understood: formData.risksUnderstood,
      material_risks_initials: formData.materialRisksInitials,

      // Sedation & Anesthesia Consent
      escort_name: formData.escortName,
      escort_phone: formData.escortPhone,
      medications_disclosed: formData.medicationsDisclosed,
      decline_iv_sedation: formData.declineIVSedation,
      sedation_initials: formData.sedationInitials,

      iv_sedation_fee: formData.ivSedation.fee,
      iv_sedation_covered: formData.ivSedation.covered,

      // Financial Disclosure
      surgical_extractions_count: formData.surgicalExtractions.count,
      surgical_extractions_fee: formData.surgicalExtractions.fee,
      surgical_extractions_covered: formData.surgicalExtractions.covered,
      implant_fixtures_count: formData.implantFixtures.count,
      implant_fixtures_fee: formData.implantFixtures.fee,
      implant_fixtures_covered: formData.implantFixtures.covered,
      zirconia_bridge_fee: formData.zirconiabridge.fee,
      zirconia_bridge_covered: formData.zirconiabridge.covered,
      financial_initials: formData.financialInitials,

      // Photo/Video Authorization
      internal_record_keeping: formData.internalRecordKeeping,
      professional_education: formData.professionalEducation,
      marketing_social_media: formData.marketingSocialMedia,
      photo_video_initials: formData.photoVideoInitials,

      // HIPAA Email/SMS Authorization
      hipaa_email_sms: formData.hipaaEmailSms,
      hipaa_email: formData.hipaaEmail,
      hipaa_phone: formData.hipaaPhone,

      // Opioid Consent
      opioid_initials: formData.opioidInitials,
      smallest_opioid_supply: formData.smallestOpioidSupply,

      // Patient Acknowledgment & Authorization
      acknowledgment_read: formData.acknowledgmentRead,
      acknowledgment_outcome: formData.acknowledgmentOutcome,
      acknowledgment_authorize: formData.acknowledgmentAuthorize,

      // Signatures
      surgeon_name: formData.surgeonName,
      surgeon_signature: formData.surgeonSignature,
      surgeon_date: isValidDate(formData.surgeonDate) ? formData.surgeonDate : currentDate,
      patient_signature: formData.patientSignature,
      patient_signature_date: isValidDate(formData.patientSignatureDate) ? formData.patientSignatureDate : currentDate,
      patient_signature_time: formData.patientSignatureTime || '',
      witness_name: formData.witnessName,
      witness_signature: formData.witnessSignature,
      witness_signature_date: isValidDate(formData.witnessSignatureDate) ? formData.witnessSignatureDate : currentDate,
      final_initials: formData.finalInitials
    };

    onSubmit(submissionData);
    toast.success('Consent Packet for Full Arch Surgery form submitted successfully');
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Fixed Header - Full Width */}
      <DialogHeader className="flex-shrink-0 w-full px-6 pt-6 pb-4 border-b">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Consent Packet for Full Arch Surgery
          </div>

          {/* Auto-save Status Indicator */}
          {onAutoSave && !readOnly && (hasFormData || autoSaveStatus === 'error') && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-2 ${
              autoSaveStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {autoSaveStatus === 'error' ? (
                <AlertTriangle className="h-3 w-3 text-red-600" />
              ) : (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-200 border-t-green-600"></div>
              )}
              <span className="font-medium">
                {autoSaveStatus === 'error' ? autoSaveMessage : 'Auto-saving changes...'}
              </span>
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      {/* Content Container with max-width */}
      <div className="max-w-6xl mx-auto flex-1 flex flex-col min-h-0 w-full">

      {/* Fixed Step Progress Indicator */}
      <div className="flex-shrink-0 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between w-full gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="relative flex items-center justify-center pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(step.id);
                    scrollToTop();
                  }}
                  className={`text-sm font-medium cursor-pointer hover:text-blue-700 transition-colors ${
                    activeTab === step.id ? 'text-blue-600' :
                    isStepCompleted(step.id) ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </button>
                {isStepCompleted(step.id) && (
                  <div className="absolute -top-5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className={`h-1 w-full rounded-full ${
                activeTab === step.id ? 'bg-blue-600' :
                isStepCompleted(step.id) ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {/* Scrollable Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-auto px-6 scrollbar-sleek">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Welcome and Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Today we discussed in detail your full-arch implant treatment, including:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Exactly which teeth and implant fixtures are planned</li>
                    <li>Reasonable alternatives (from doing nothing to various denture/bridge options)</li>
                    <li>All material risks and their approximate likelihoods</li>
                    <li>The sedation/anesthesia plan and associated safety measures</li>
                    <li>Financial obligations, insurance notice, and your No Surprises Act rights</li>
                    <li>How we'll use any photos/videos or communicate by email/SMS</li>
                  </ol>
                  <p className="text-sm text-blue-800 mt-3">
                    You've had the opportunity to ask questions, to see the statistical ranges for each complication, and to confirm that you understand each element. If anything remains unclear at any point, please let us know right away—your signature on the following pages certifies that you have been fully informed and that we have addressed your questions thoroughly.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium">
                    <strong>Important Note:</strong> Patient must initial the lower-right corner of every page throughout this consent packet.
                  </p>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Patient & Interpreter Information Tab */}
          {activeTab === "patient-info" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Patient & Interpreter Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName" className="text-sm font-semibold">
                      <span className="text-red-500">*</span> Patient Full Legal Name
                    </Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      readOnly
                      className="mt-1 bg-gray-50 cursor-not-allowed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="chartNumber" className="text-sm font-semibold">
                      <span className="text-red-500">*</span> Chart #
                    </Label>
                    <Input
                      id="chartNumber"
                      value={formData.chartNumber}
                      onChange={(e) => handleInputChange('chartNumber', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-semibold">
                      <span className="text-red-500">*</span> Date (dd-MMM-yyyy)
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm font-semibold">
                      <span className="text-red-500">*</span> Time (24 h)
                    </Label>
                    <div className="relative">
                      <Input
                        id="time"
                        type="time"
                        value={formData.consentTime}
                        onChange={(e) => handleInputChange('consentTime', e.target.value)}
                        required
                        className="pr-32"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                          handleInputChange('consentTime', currentTime);
                        }}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 flex items-center gap-1 border border-blue-300 bg-white hover:bg-blue-50 text-blue-600 text-xs rounded-md"
                        title="Set current time"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Current Time
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Primary Language Used</Label>
                    <RadioGroup
                      value={formData.primaryLanguage}
                      onValueChange={(value) => handleInputChange('primaryLanguage', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 flex-wrap">
                        <div className="flex items-center">
                          <RadioGroupItem value="english" id="english" className="sr-only" />
                          <Label
                            htmlFor="english"
                            className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-w-[120px] ${
                              formData.primaryLanguage === 'english'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            English
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="other" id="other" className="sr-only" />
                          <Label
                            htmlFor="other"
                            className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-w-[120px] ${
                              formData.primaryLanguage === 'other'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            Other Language
                          </Label>
                          {formData.primaryLanguage === 'other' && (
                            <Input
                              placeholder="Specify language"
                              className="w-48"
                              value={formData.otherLanguageText}
                              onChange={(e) => handleInputChange('otherLanguageText', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Interpreter Required?</Label>
                    <RadioGroup
                      value={formData.interpreterRequired}
                      onValueChange={(value) => handleInputChange('interpreterRequired', value)}
                      className="space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="interpreterYes" className="sr-only" />
                          <Label
                            htmlFor="interpreterYes"
                            className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-w-[120px] ${
                              formData.interpreterRequired === 'yes'
                                ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            Yes, Interpreter Required
                          </Label>
                        </div>

                        {formData.interpreterRequired === 'yes' && (
                          <div className="ml-6 bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="interpreterName" className="text-sm font-medium">Interpreter Name</Label>
                                <Input
                                  id="interpreterName"
                                  value={formData.interpreterName}
                                  onChange={(e) => handleInputChange('interpreterName', e.target.value)}
                                  placeholder="Enter interpreter name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="interpreterCredential" className="text-sm font-medium">Credential/ID</Label>
                                <Input
                                  id="interpreterCredential"
                                  value={formData.interpreterCredential}
                                  onChange={(e) => handleInputChange('interpreterCredential', e.target.value)}
                                  placeholder="Enter credential or ID"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="no" id="interpreterNo" className="sr-only" />
                        <Label
                          htmlFor="interpreterNo"
                          className={`flex-1 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-sm ${
                            formData.interpreterRequired === 'no'
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <strong>No</strong> → I attest that I am sufficiently fluent in English to understand all content of this packet, that it was explained to me in English, and that I had the opportunity to request an interpreter but declined.
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.patientInfoInitials ? (
                      <SignaturePreview
                        signature={formData.patientInfoInitials}
                        onEdit={() => handleSignatureDialogOpen('patientInfoInitials')}
                        onClear={() => handleSignatureClear('patientInfoInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('patientInfoInitials')}
                        className="w-64 h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Treatment Description & Alternatives Tab */}
          {activeTab === "treatment" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  Treatment Description & Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full overflow-hidden">
                {/* Arch Type Selection */}
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                      Treatment Arch Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">Which arch(es) require treatment?</Label>
                      <RadioGroup
                        value={formData.archType}
                        onValueChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            archType: value,
                            // Reset related fields when arch type changes
                            upperJaw: value === 'upper' || value === 'dual' ? 'yes' : '',
                            lowerJaw: value === 'lower' || value === 'dual' ? 'yes' : '',
                            upperSameDayLoad: '',
                            lowerSameDayLoad: ''
                          }));
                        }}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="upper" id="archUpper" className="sr-only" />
                          <Label
                            htmlFor="archUpper"
                            className={`px-6 py-3 rounded-lg border cursor-pointer text-sm font-medium transition-all flex items-center gap-2 ${
                              formData.archType === 'upper'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                            }`}
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">U</span>
                            </div>
                            Upper Arch Only
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="lower" id="archLower" className="sr-only" />
                          <Label
                            htmlFor="archLower"
                            className={`px-6 py-3 rounded-lg border cursor-pointer text-sm font-medium transition-all flex items-center gap-2 ${
                              formData.archType === 'lower'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                            }`}
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">L</span>
                            </div>
                            Lower Arch Only
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="dual" id="archDual" className="sr-only" />
                          <Label
                            htmlFor="archDual"
                            className={`px-6 py-3 rounded-lg border cursor-pointer text-sm font-medium transition-all flex items-center gap-2 ${
                              formData.archType === 'dual'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">U</span>
                              </div>
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">L</span>
                              </div>
                            </div>
                            Dual Arch (Both)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Treatment Planning Cards - Show based on arch selection */}
                <div className="space-y-6">
                  {/* Single Arch Layouts */}
                  {formData.archType === 'upper' && (
                    <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">U</span>
                          </div>
                          Upper Arch Treatment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Teeth/Regions and Implants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="upperTeethRegions" className="text-sm font-medium text-gray-700">
                              Teeth/Regions
                            </Label>
                            <Input
                              id="upperTeethRegions"
                              value={formData.upperTeethRegions}
                              onChange={(e) => setFormData(prev => ({ ...prev, upperTeethRegions: e.target.value }))}
                              placeholder="Enter teeth/regions"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="upperImplants" className="text-sm font-medium text-gray-700">
                              # Implants
                            </Label>
                            <Select
                              value={formData.upperImplants}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, upperImplants: value }))}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select implant type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All on 4">All on 4</SelectItem>
                                <SelectItem value="All on 6">All on 6</SelectItem>
                                <SelectItem value="All on X">All on X</SelectItem>
                                <SelectItem value="All on X with Remote Anchorage">All on X with Remote Anchorage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Graft Material */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                upperGraftMaterial: { ...prev.upperGraftMaterial, allograft: !prev.upperGraftMaterial.allograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.upperGraftMaterial.allograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Allograft
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                upperGraftMaterial: { ...prev.upperGraftMaterial, xenograft: !prev.upperGraftMaterial.xenograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.upperGraftMaterial.xenograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Xenograft
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                upperGraftMaterial: { ...prev.upperGraftMaterial, autograft: !prev.upperGraftMaterial.autograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.upperGraftMaterial.autograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Autograft
                            </button>
                          </div>
                        </div>

                        {/* Prosthesis */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                upperProsthesis: { ...prev.upperProsthesis, zirconia: !prev.upperProsthesis.zirconia }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.upperProsthesis.zirconia
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Fixed Zirconia Bridge
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                upperProsthesis: { ...prev.upperProsthesis, overdenture: !prev.upperProsthesis.overdenture }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.upperProsthesis.overdenture
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Removable Overdenture
                            </button>
                          </div>
                        </div>

                        {/* Same-day Load */}
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-gray-700 w-32">Same-day Load:</Label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, upperSameDayLoad: 'yes' }))}
                              className={`px-6 py-3 rounded-lg border text-base font-medium transition-all ${
                                formData.upperSameDayLoad === 'yes'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, upperSameDayLoad: 'no' }))}
                              className={`px-6 py-3 rounded-lg border text-base font-medium transition-all ${
                                formData.upperSameDayLoad === 'no'
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {formData.archType === 'lower' && (
                    <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">L</span>
                          </div>
                          Lower Arch Treatment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Teeth/Regions and Implants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="lowerTeethRegions" className="text-sm font-medium text-gray-700">
                              Teeth/Regions
                            </Label>
                            <Input
                              id="lowerTeethRegions"
                              value={formData.lowerTeethRegions}
                              onChange={(e) => setFormData(prev => ({ ...prev, lowerTeethRegions: e.target.value }))}
                              placeholder="Enter teeth/regions"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lowerImplants" className="text-sm font-medium text-gray-700">
                              # Implants
                            </Label>
                            <Select
                              value={formData.lowerImplants}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, lowerImplants: value }))}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select implant type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All on 4">All on 4</SelectItem>
                                <SelectItem value="All on 6">All on 6</SelectItem>
                                <SelectItem value="All on X">All on X</SelectItem>
                                <SelectItem value="All on X with Remote Anchorage">All on X with Remote Anchorage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Graft Material */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                lowerGraftMaterial: { ...prev.lowerGraftMaterial, allograft: !prev.lowerGraftMaterial.allograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.lowerGraftMaterial.allograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Allograft
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                lowerGraftMaterial: { ...prev.lowerGraftMaterial, xenograft: !prev.lowerGraftMaterial.xenograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.lowerGraftMaterial.xenograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Xenograft
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                lowerGraftMaterial: { ...prev.lowerGraftMaterial, autograft: !prev.lowerGraftMaterial.autograft }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.lowerGraftMaterial.autograft
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Autograft
                            </button>
                          </div>
                        </div>

                        {/* Prosthesis */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                lowerProsthesis: { ...prev.lowerProsthesis, zirconia: !prev.lowerProsthesis.zirconia }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.lowerProsthesis.zirconia
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Fixed Zirconia Bridge
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                lowerProsthesis: { ...prev.lowerProsthesis, overdenture: !prev.lowerProsthesis.overdenture }
                              }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                formData.lowerProsthesis.overdenture
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Removable Overdenture
                            </button>
                          </div>
                        </div>

                        {/* Same-day Load */}
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-gray-700 w-32">Same-day Load:</Label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, lowerSameDayLoad: 'yes' }))}
                              className={`px-6 py-3 rounded-lg border text-base font-medium transition-all ${
                                formData.lowerSameDayLoad === 'yes'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, lowerSameDayLoad: 'no' }))}
                              className={`px-6 py-3 rounded-lg border text-base font-medium transition-all ${
                                formData.lowerSameDayLoad === 'no'
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dual Arch Layout - Side by Side */}
                  {formData.archType === 'dual' && (
                    <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">U</span>
                            </div>
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">L</span>
                            </div>
                          </div>
                          Dual Arch Treatment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Upper Arch Column */}
                          <div className="space-y-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/20">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">U</span>
                              </div>
                              <h4 className="font-semibold text-blue-800">Upper Arch</h4>
                            </div>

                            {/* Upper Teeth/Regions and Implants */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="upperTeethRegions" className="text-sm font-medium text-gray-700">
                                  Teeth/Regions
                                </Label>
                                <Input
                                  id="upperTeethRegions"
                                  value={formData.upperTeethRegions}
                                  onChange={(e) => setFormData(prev => ({ ...prev, upperTeethRegions: e.target.value }))}
                                  placeholder="Enter teeth/regions"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="upperImplants" className="text-sm font-medium text-gray-700">
                                  # Implants
                                </Label>
                                <Select
                                  value={formData.upperImplants}
                                  onValueChange={(value) => setFormData(prev => ({ ...prev, upperImplants: value }))}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select implant type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="All on 4">All on 4</SelectItem>
                                    <SelectItem value="All on 6">All on 6</SelectItem>
                                    <SelectItem value="All on X">All on X</SelectItem>
                                    <SelectItem value="All on X with Remote Anchorage">All on X with Remote Anchorage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Upper Graft Material */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    upperGraftMaterial: { ...prev.upperGraftMaterial, allograft: !prev.upperGraftMaterial.allograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.upperGraftMaterial.allograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Allograft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    upperGraftMaterial: { ...prev.upperGraftMaterial, xenograft: !prev.upperGraftMaterial.xenograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.upperGraftMaterial.xenograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Xenograft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    upperGraftMaterial: { ...prev.upperGraftMaterial, autograft: !prev.upperGraftMaterial.autograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.upperGraftMaterial.autograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Autograft
                                </button>
                              </div>
                            </div>

                            {/* Upper Prosthesis */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    upperProsthesis: { ...prev.upperProsthesis, zirconia: !prev.upperProsthesis.zirconia }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.upperProsthesis.zirconia
                                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Fixed Zirconia Bridge
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    upperProsthesis: { ...prev.upperProsthesis, overdenture: !prev.upperProsthesis.overdenture }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.upperProsthesis.overdenture
                                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Removable Overdenture
                                </button>
                              </div>
                            </div>

                            {/* Upper Same-day Load */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Same-day Load:</Label>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, upperSameDayLoad: 'yes' }))}
                                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    formData.upperSameDayLoad === 'yes'
                                      ? 'border-green-500 bg-green-50 text-green-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, upperSameDayLoad: 'no' }))}
                                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    formData.upperSameDayLoad === 'no'
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Lower Arch Column */}
                          <div className="space-y-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/20">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">L</span>
                              </div>
                              <h4 className="font-semibold text-blue-800">Lower Arch</h4>
                            </div>

                            {/* Lower Teeth/Regions and Implants */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="lowerTeethRegions" className="text-sm font-medium text-gray-700">
                                  Teeth/Regions
                                </Label>
                                <Input
                                  id="lowerTeethRegions"
                                  value={formData.lowerTeethRegions}
                                  onChange={(e) => setFormData(prev => ({ ...prev, lowerTeethRegions: e.target.value }))}
                                  placeholder="Enter teeth/regions"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lowerImplants" className="text-sm font-medium text-gray-700">
                                  # Implants
                                </Label>
                                <Select
                                  value={formData.lowerImplants}
                                  onValueChange={(value) => setFormData(prev => ({ ...prev, lowerImplants: value }))}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select implant type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="All on 4">All on 4</SelectItem>
                                    <SelectItem value="All on 6">All on 6</SelectItem>
                                    <SelectItem value="All on X">All on X</SelectItem>
                                    <SelectItem value="All on X with Remote Anchorage">All on X with Remote Anchorage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Lower Graft Material */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    lowerGraftMaterial: { ...prev.lowerGraftMaterial, allograft: !prev.lowerGraftMaterial.allograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.lowerGraftMaterial.allograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Allograft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    lowerGraftMaterial: { ...prev.lowerGraftMaterial, xenograft: !prev.lowerGraftMaterial.xenograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.lowerGraftMaterial.xenograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Xenograft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    lowerGraftMaterial: { ...prev.lowerGraftMaterial, autograft: !prev.lowerGraftMaterial.autograft }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.lowerGraftMaterial.autograft
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Autograft
                                </button>
                              </div>
                            </div>

                            {/* Lower Prosthesis */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    lowerProsthesis: { ...prev.lowerProsthesis, zirconia: !prev.lowerProsthesis.zirconia }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.lowerProsthesis.zirconia
                                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Fixed Zirconia Bridge
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    lowerProsthesis: { ...prev.lowerProsthesis, overdenture: !prev.lowerProsthesis.overdenture }
                                  }))}
                                  className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                    formData.lowerProsthesis.overdenture
                                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Removable Overdenture
                                </button>
                              </div>
                            </div>

                            {/* Lower Same-day Load */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Same-day Load:</Label>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, lowerSameDayLoad: 'yes' }))}
                                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    formData.lowerSameDayLoad === 'yes'
                                      ? 'border-green-500 bg-green-50 text-green-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, lowerSameDayLoad: 'no' }))}
                                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    formData.lowerSameDayLoad === 'no'
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sedation Plan */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Sedation Plan:</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <div>
                        <button
                          type="button"
                          aria-pressed={formData.sedationPlan.localOnly}
                          onClick={() => toggleSedation('localOnly')}
                          className={`px-3 py-2 rounded border text-sm transition-all ${
                            formData.sedationPlan.localOnly
                              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          Local only
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          aria-pressed={formData.sedationPlan.nitrous}
                          onClick={() => toggleSedation('nitrous')}
                          className={`px-3 py-2 rounded border text-sm transition-all ${
                            formData.sedationPlan.nitrous
                              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          Nitrous
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          aria-pressed={formData.sedationPlan.ivConscious}
                          onClick={() => toggleSedation('ivConscious')}
                          className={`px-3 py-2 rounded border text-sm transition-all ${
                            formData.sedationPlan.ivConscious
                              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          IV conscious
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          aria-pressed={formData.sedationPlan.generalHospital}
                          onClick={() => toggleSedation('generalHospital')}
                          className={`px-3 py-2 rounded border text-sm transition-all ${
                            formData.sedationPlan.generalHospital
                              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          General (hospital)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">ASA Physical Status:</Label>
                    <div className="flex gap-3 mt-2">
                      {['I', 'II', 'III', 'IV'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          aria-pressed={formData.asaPhysicalStatus === status}
                          onClick={() => handleInputChange('asaPhysicalStatus', status)}
                          className={`px-3 py-2 rounded border text-sm transition-all ${
                            formData.asaPhysicalStatus === status
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Planned Drugs:</Label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          plannedDrugs: { ...prev.plannedDrugs, midazolam: !prev.plannedDrugs.midazolam }
                        }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.plannedDrugs.midazolam
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {formData.plannedDrugs.midazolam && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        Midazolam
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          plannedDrugs: { ...prev.plannedDrugs, fentanyl: !prev.plannedDrugs.fentanyl }
                        }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.plannedDrugs.fentanyl
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {formData.plannedDrugs.fentanyl && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        Fentanyl
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          plannedDrugs: { ...prev.plannedDrugs, ketamine: !prev.plannedDrugs.ketamine }
                        }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.plannedDrugs.ketamine
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {formData.plannedDrugs.ketamine && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        Ketamine
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          plannedDrugs: { ...prev.plannedDrugs, dexamethasone: !prev.plannedDrugs.dexamethasone }
                        }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.plannedDrugs.dexamethasone
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {formData.plannedDrugs.dexamethasone && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        Dexamethasone
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reasonable Alternatives */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Reasonable Alternatives Discussed (patient to initial each):</h4>

                  {[
                    { key: 'noTreatment', text: 'No treatment, with progressive bone loss and prosthesis instability explained' },
                    { key: 'conventionalDentures', text: 'Conventional complete dentures (lower stability limitations reviewed)' },
                    { key: 'segmentedExtraction', text: 'Segmented extraction/implant staging to preserve select teeth' },
                    { key: 'removableOverdentures', text: 'Removable implant-supported overdentures (locator/bar)' },
                    { key: 'zygomaticImplants', text: 'Referral for graft-less zygomatic or pterygoid implants if indicated' }
                  ].map((alternative) => (
                    <div key={alternative.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm flex-1 mr-4">{alternative.text}</p>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Initial:</Label>
                        <Input
                          placeholder="___"
                          value={formData.alternativesInitials[alternative.key as keyof typeof formData.alternativesInitials]}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              alternativesInitials: {
                                ...prev.alternativesInitials,
                                [alternative.key]: newValue
                              }
                            }));
                          }}
                          className="w-16 h-8 text-center text-sm"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.treatmentDescriptionInitials ? (
                      <SignaturePreview
                        signature={formData.treatmentDescriptionInitials}
                        onEdit={() => handleSignatureDialogOpen('treatmentDescriptionInitials')}
                        onClear={() => handleSignatureClear('treatmentDescriptionInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('treatmentDescriptionInitials')}
                        className="w-64 h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Material Risks Tab */}
          {activeTab === "risks" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  Material Risks (estimated incidence shown)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Risk Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Early Implant Loss */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Early implant loss (&lt; 1 yr)</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">2–5%</span>
                        </div>
                        <p className="text-sm text-gray-600">may require removal & re-placement</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Permanent Numbness */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Permanent lower-lip/chin numbness</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">≤ 2%</span>
                        </div>
                        <p className="text-sm text-gray-600">inferior alveolar nerve proximity</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sinus Perforation */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Sinus perforation → chronic sinusitis</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">1–3% (upper arch)</span>
                        </div>
                        <p className="text-sm text-gray-600">may need ENT repair</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Jaw Fracture */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Jaw fracture</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">&lt; 0.5%</span>
                        </div>
                        <p className="text-sm text-gray-600">severely atrophic bone</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Infection */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Infection requiring IV antibiotics</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">1–4%</span>
                        </div>
                        <p className="text-sm text-gray-600">higher in smokers/uncontrolled DM</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* IV-sedation Airway Compromise */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">IV-sedation airway compromise</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">0.1–0.3%</span>
                        </div>
                        <p className="text-sm text-gray-600">emergency airway equipment on site</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hospital Admission / Death */}
                  <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors lg:col-span-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">Hospital admission / death</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">&lt; 0.05%</span>
                        </div>
                        <p className="text-sm text-gray-600">reported in national databases</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors mt-1 ${
                        formData.risksUnderstood
                          ? 'bg-blue-100'
                          : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleInputChange('risksUnderstood', !formData.risksUnderstood)}
                    >
                      {formData.risksUnderstood && (
                        <Check className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <p
                      className="text-sm cursor-pointer"
                      onClick={() => handleInputChange('risksUnderstood', !formData.risksUnderstood)}
                    >
                      I have had the opportunity to ask about each risk and understand that percentages are population estimates, not guarantees of my individual outcome.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.materialRisksInitials ? (
                      <SignaturePreview
                        signature={formData.materialRisksInitials}
                        onEdit={() => handleSignatureDialogOpen('materialRisksInitials')}
                        onClear={() => handleSignatureClear('materialRisksInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('materialRisksInitials')}
                        className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Sedation & Anesthesia Consent Tab */}
          {activeTab === "sedation" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  Sedation & Anesthesia Consent (if applicable)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Pre-operative Instructions */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                      Pre-operative Instructions & Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* NPO Instructions */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">1</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">NPO Requirements</h4>
                            </div>
                            <p className="text-sm text-gray-600">NPO for 8 hours (liquids = clear only ≤ 2 hours)</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Escort Requirements */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">2</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Escort Required</h4>
                            </div>
                            <p className="text-sm text-gray-600">Responsible adult will remain on premises and supervise me for 24 hours</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Medication Disclosure */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">3</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Medication Disclosure</h4>
                            </div>
                            <p className="text-sm text-gray-600">All medications disclosed: complete & accurate</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emergency Protocols */}
                      <Card className="border-2 border-red-100 hover:border-red-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-semibold text-xs">4</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Emergency Protocols</h4>
                            </div>
                            <p className="text-sm text-gray-600">Office holds ACLS equipment, reversal agents, and written EMS transfer protocol</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Escort Information */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      Escort Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="escortName" className="text-sm font-semibold text-gray-700">
                          <span className="text-red-500">*</span> Escort Name
                        </Label>
                        <Input
                          id="escortName"
                          value={formData.escortName}
                          onChange={(e) => handleInputChange('escortName', e.target.value)}
                          placeholder="Responsible adult name"
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="escortPhone" className="text-sm font-semibold text-gray-700">
                          <span className="text-red-500">*</span> Escort Mobile #
                        </Label>
                        <Input
                          id="escortPhone"
                          value={formData.escortPhone}
                          onChange={(e) => handleInputChange('escortPhone', e.target.value)}
                          placeholder="Mobile phone number"
                          required
                          className="h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Acknowledgments */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      Patient Acknowledgments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Medications Disclosed */}
                      <Card className="border border-blue-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors mt-1 ${
                                formData.medicationsDisclosed
                                  ? 'bg-green-100'
                                  : 'border-2 border-gray-300 bg-white hover:border-green-300'
                              }`}
                              onClick={() => handleInputChange('medicationsDisclosed', !formData.medicationsDisclosed)}
                            >
                              {formData.medicationsDisclosed && (
                                <Check className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                                onClick={() => handleInputChange('medicationsDisclosed', !formData.medicationsDisclosed)}
                              >
                                Medications disclosed: complete & accurate
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                I confirm that I have provided a complete and accurate list of all medications, supplements, and substances I am currently taking.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Decline IV Sedation */}
                      <Card className="border border-blue-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors mt-1 ${
                                formData.declineIVSedation
                                  ? 'bg-green-100'
                                  : 'border-2 border-gray-300 bg-white hover:border-green-300'
                              }`}
                              onClick={() => handleInputChange('declineIVSedation', !formData.declineIVSedation)}
                            >
                              {formData.declineIVSedation && (
                                <Check className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                                onClick={() => handleInputChange('declineIVSedation', !formData.declineIVSedation)}
                              >
                                I decline IV sedation and elect local anesthesia only
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                I understand the benefits of IV sedation but choose to proceed with local anesthesia only for my treatment.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="flex flex-col space-y-6">
                  {/* Signature Row */}
                  <div className="flex items-center justify-center gap-8">
                    {/* Patient Initials - Centered */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center justify-center">
                        {formData.sedationInitials ? (
                          <SignaturePreview
                            signature={formData.sedationInitials}
                            onEdit={() => handleSignatureDialogOpen('sedationInitials')}
                            onClear={() => handleSignatureClear('sedationInitials')}
                            className="w-64 h-16 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSignatureDialogOpen('sedationInitials')}
                            className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Sign Here
                          </Button>
                        )}
                      </div>
                      <div className="w-64 border-t border-gray-300 pt-2">
                        <div className="flex items-center justify-center">
                          <Label className="text-sm font-semibold">Patient Initials</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Financial Disclosure Tab */}
          {activeTab === "financial" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Financial Disclosure & Surprise-Bill Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Treatment Cost Breakdown */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      Treatment Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Surgical Extractions */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Surgical Extractions</h4>
                                <div className="flex flex-col gap-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">CDT: D7140</span>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">CPT: 41899</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Count</Label>
                                <Input
                                  value={formData.surgicalExtractions.count}
                                  onChange={(e) => handleNestedInputChange('surgicalExtractions', 'count', e.target.value)}
                                  className="w-full h-8"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Estimated Fee</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">$</span>
                                  <Input
                                    value={formData.surgicalExtractions.fee}
                                    onChange={(e) => handleNestedInputChange('surgicalExtractions', 'fee', e.target.value)}
                                    className="w-full h-8"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Covered by insurance?</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={formData.surgicalExtractions.covered === 'yes' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.surgicalExtractions.covered === 'yes'
                                        ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white'
                                        : 'border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      surgicalExtractions: {
                                        ...prev.surgicalExtractions,
                                        covered: prev.surgicalExtractions.covered === 'yes' ? '' : 'yes'
                                      }
                                    }))}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={formData.surgicalExtractions.covered === 'no' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.surgicalExtractions.covered === 'no'
                                        ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                                        : 'border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      surgicalExtractions: {
                                        ...prev.surgicalExtractions,
                                        covered: prev.surgicalExtractions.covered === 'no' ? '' : 'no'
                                      }
                                    }))}
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Implant Fixtures */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Implant Fixtures</h4>
                                <div className="flex flex-col gap-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">CDT: D6010</span>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">CPT: 21249</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Count</Label>
                                <Input
                                  value={formData.implantFixtures.count}
                                  onChange={(e) => handleNestedInputChange('implantFixtures', 'count', e.target.value)}
                                  className="w-full h-8"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Estimated Fee</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">$</span>
                                  <Input
                                    value={formData.implantFixtures.fee}
                                    onChange={(e) => handleNestedInputChange('implantFixtures', 'fee', e.target.value)}
                                    className="w-full h-8"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Covered by insurance?</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={formData.implantFixtures.covered === 'yes' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.implantFixtures.covered === 'yes'
                                        ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white'
                                        : 'border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      implantFixtures: {
                                        ...prev.implantFixtures,
                                        covered: prev.implantFixtures.covered === 'yes' ? '' : 'yes'
                                      }
                                    }))}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={formData.implantFixtures.covered === 'no' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.implantFixtures.covered === 'no'
                                        ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                                        : 'border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      implantFixtures: {
                                        ...prev.implantFixtures,
                                        covered: prev.implantFixtures.covered === 'no' ? '' : 'no'
                                      }
                                    }))}
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Fixed Zirconia Bridge */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Fixed Zirconia Bridge per Arch</h4>
                                <div className="flex flex-col gap-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">CDT: D6078</span>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">CPT: 21080</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Count</Label>
                                <div className="h-8 flex items-center">
                                  <span className="text-sm text-gray-500">per arch</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Estimated Fee</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">$</span>
                                  <Input
                                    value={formData.zirconiabridge.fee}
                                    onChange={(e) => handleNestedInputChange('zirconiabridge', 'fee', e.target.value)}
                                    className="w-full h-8"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Covered by insurance?</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={formData.zirconiabridge.covered === 'yes' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.zirconiabridge.covered === 'yes'
                                        ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white'
                                        : 'border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      zirconiabridge: {
                                        ...prev.zirconiabridge,
                                        covered: prev.zirconiabridge.covered === 'yes' ? '' : 'yes'
                                      }
                                    }))}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={formData.zirconiabridge.covered === 'no' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.zirconiabridge.covered === 'no'
                                        ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                                        : 'border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      zirconiabridge: {
                                        ...prev.zirconiabridge,
                                        covered: prev.zirconiabridge.covered === 'no' ? '' : 'no'
                                      }
                                    }))}
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* IV Sedation */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">IV Sedation (first 60 min)</h4>
                                <div className="flex flex-col gap-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">CDT: D9223</span>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">CPT: 99152</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Count</Label>
                                <div className="h-8 flex items-center">
                                  <span className="text-sm text-gray-500">per session</span>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-1">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Estimated Fee</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">$</span>
                                  <Input
                                    value={formData.ivSedation.fee}
                                    onChange={(e) => handleNestedInputChange('ivSedation', 'fee', e.target.value)}
                                    className="w-full h-8"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Covered by insurance?</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={formData.ivSedation.covered === 'yes' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.ivSedation.covered === 'yes'
                                        ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white'
                                        : 'border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      ivSedation: {
                                        ...prev.ivSedation,
                                        covered: prev.ivSedation.covered === 'yes' ? '' : 'yes'
                                      }
                                    }))}
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={formData.ivSedation.covered === 'no' ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 text-xs ${
                                      formData.ivSedation.covered === 'no'
                                        ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                                        : 'border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      ivSedation: {
                                        ...prev.ivSedation,
                                        covered: prev.ivSedation.covered === 'no' ? '' : 'no'
                                      }
                                    }))}
                                  >
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Procedures */}
                <Card className="border-2 border-gray-100 bg-gray-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      Additional Procedures (if applicable)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Bone Graft - Mandible</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7950</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Graft, bone; mandible, right and left</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21215 × 2</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Bone Graft - Maxillary</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7951</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Graft, bone; nasal, maxillary, or malar areas</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21210 × 2</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Alveoloplasty</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7311</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Each quadrant bone shaping</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 41874 × 2</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Bone Excision</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7251</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Facial bone excision</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21025 × 2</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Surgical Splint</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7880</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Custom oral surgical splint</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21085 × 1</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Interim Obturator</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D5987</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Interim obturator prosthesis</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21079 × 1</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Tumor/Cyst Excision</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D7471</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Benign tumor or cyst removal</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21040 × 2</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Mandible Reconstruction</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D6010</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Endosteal implant (4+)</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21249 × 4</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">CT Scan</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D0367</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">26 modifier</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 70486</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 bg-white">
                        <CardContent className="p-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">Final Obturator</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CDT: D5929</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600">Final obturator prosthesis</p>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">CPT: 21080 × 1</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Notice */}
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-600 font-bold text-xs">!</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-yellow-800">Important Insurance Notice</h4>
                        <p className="text-sm text-yellow-800">
                          <strong>*Coverage NOT confirmed with insurer.</strong> I may receive separate bills from outside labs or hospitals. I have received a Good-Faith Estimate under the No Surprises Act and understand my right to dispute charges that exceed the estimate by &gt; $400.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.financialInitials ? (
                      <SignaturePreview
                        signature={formData.financialInitials}
                        onEdit={() => handleSignatureDialogOpen('financialInitials')}
                        onClear={() => handleSignatureClear('financialInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('financialInitials')}
                        className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Photo/Video Authorization Tab */}
          {activeTab === "media" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Photo / Video / Electronic Communication Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Media Authorization Cards */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Camera className="h-4 w-4 text-blue-600" />
                      </div>
                      Media Usage Authorization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Internal Record-keeping */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Internal Record-keeping</h4>
                                <p className="text-xs text-gray-600">For medical documentation and patient care records</p>
                              </div>
                            </div>

                            <div className="flex gap-4 flex-shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('internalRecordKeeping', 'yes')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.internalRecordKeeping === 'yes'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Yes, I Agree
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('internalRecordKeeping', 'no')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.internalRecordKeeping === 'no'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                No, I Deny
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Professional Education */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Professional Education</h4>
                                <p className="text-xs text-gray-600">De-identified use for educational purposes and training</p>
                              </div>
                            </div>

                            <div className="flex gap-4 flex-shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('professionalEducation', 'yes')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.professionalEducation === 'yes'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Yes, I Agree
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('professionalEducation', 'no')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.professionalEducation === 'no'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                No, I Deny
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Marketing / Social Media */}
                      <Card className="border-2 border-pink-100 hover:border-pink-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Marketing / Social Media</h4>
                                <p className="text-xs text-gray-600">Identifiable use for marketing and social media promotion</p>
                              </div>
                            </div>

                            <div className="flex gap-4 flex-shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('marketingSocialMedia', 'yes')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.marketingSocialMedia === 'yes'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Yes, I Agree
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleInputChange('marketingSocialMedia', 'no')}
                                className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.marketingSocialMedia === 'no'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                No, I Deny
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* HIPAA Email/SMS Authorization */}
                <Card className="border-2 border-teal-100 bg-teal-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-teal-600" />
                      </div>
                      HIPAA Electronic Communication Authorization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="border-2 border-teal-100 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm">HIPAA Email / SMS Authorization</h4>
                              <p className="text-xs text-gray-600">I authorize the office to send unencrypted clinical instructions to the contact information provided below.</p>

                              {formData.hipaaEmailSms && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="hipaaEmail" className="text-sm font-medium text-gray-700">
                                      Email Address
                                    </Label>
                                    <Input
                                      id="hipaaEmail"
                                      type="email"
                                      value={formData.hipaaEmail}
                                      onChange={(e) => handleInputChange('hipaaEmail', e.target.value)}
                                      placeholder="Enter email address"
                                      className="w-full h-10"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="hipaaPhone" className="text-sm font-medium text-gray-700">
                                      Phone Number
                                    </Label>
                                    <Input
                                      id="hipaaPhone"
                                      type="tel"
                                      value={formData.hipaaPhone}
                                      onChange={(e) => handleInputChange('hipaaPhone', e.target.value)}
                                      placeholder="Enter phone number"
                                      className="w-full h-10"
                                    />
                                  </div>
                                </div>
                              )}

                              <p className="text-xs text-gray-600">
                                <strong>Important:</strong> Risks have been explained. I may revoke this authorization in writing at any time.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4 flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleInputChange('hipaaEmailSms', true)}
                              className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                formData.hipaaEmailSms
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              Yes, I Agree
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleInputChange('hipaaEmailSms', false)}
                              className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                !formData.hipaaEmailSms
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                              }`}
                            >
                              No, I Deny
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Separator className="w-full" />

                <div className="flex flex-col items-end space-y-3 w-full">
                  <div className="flex items-center justify-center">
                    {formData.photoVideoInitials ? (
                      <SignaturePreview
                        signature={formData.photoVideoInitials}
                        onEdit={() => handleSignatureDialogOpen('photoVideoInitials')}
                        onClear={() => handleSignatureClear('photoVideoInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('photoVideoInitials')}
                        className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Opioid Consent Tab */}
          {activeTab === "opioid" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5 text-blue-600" />
                  Opioid‑Specific Consent (if postoperative narcotics are prescribed)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Opioid Information Cards */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      Postoperative Pain Management Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Medications */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <Pill className="h-3 w-3 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Prescribed Medications</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-800">Hydrocodone/Acetaminophen</p>
                                <p className="text-xs text-blue-700">5/325 mg, max 24 tabs, 6‑day supply</p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-800">Percocet</p>
                                <p className="text-xs text-blue-700">5/325mg, max 24 tabs, 6-day supply</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Risks */}
                      <Card className="border-2 border-red-100 hover:border-red-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-red-600" />
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Known Risks</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-red-50 rounded-lg p-2">
                                <p className="text-xs text-red-700">• Addiction potential</p>
                              </div>
                              <div className="bg-red-50 rounded-lg p-2">
                                <p className="text-xs text-red-700">• Constipation</p>
                              </div>
                              <div className="bg-red-50 rounded-lg p-2">
                                <p className="text-xs text-red-700">• Respiratory depression</p>
                              </div>
                              <div className="bg-red-50 rounded-lg p-2">
                                <p className="text-xs text-red-700">• Impaired driving ability</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Alternatives */}
                      <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">Alternative Options</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-green-700">• NSAIDs (anti-inflammatory)</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-green-700">• Acetaminophen</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-green-700">• Long‑acting local anesthesia</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Safety Information */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-800">Safety Information Reviewed</h4>
                        <p className="text-sm text-blue-700">
                          Safe‑use instructions and Naloxone availability have been reviewed. Drug take‑back sites have been listed and provided.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Preference */}
                <Card className="border-2 border-teal-100 bg-teal-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Opioid Supply Preference</h4>
                          <p className="text-xs text-gray-600">You may request the smallest effective opioid supply to minimize risks and unused medication.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('smallestOpioidSupply', true)}
                          className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                            formData.smallestOpioidSupply
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          Yes, Smallest Supply
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('smallestOpioidSupply', false)}
                          className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                            !formData.smallestOpioidSupply
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          Standard Supply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="flex flex-col items-end space-y-3 w-full">
                  <div className="flex items-center justify-center">
                    {formData.opioidInitials ? (
                      <SignaturePreview
                        signature={formData.opioidInitials}
                        onEdit={() => handleSignatureDialogOpen('opioidInitials')}
                        onClear={() => handleSignatureClear('opioidInitials')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('opioidInitials')}
                        className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Initials</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Final Acknowledgment Tab */}
          {activeTab === "final" && (
            <div className="space-y-6 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Acknowledgment, Revocation, Witness & Notary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Patient Acknowledgment */}
                <Card className="border-2 border-green-100 bg-green-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      Patient Acknowledgment & Authorization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card className="border border-green-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                                formData.acknowledgmentRead
                                  ? 'bg-green-100'
                                  : 'border-2 border-gray-300 bg-white hover:border-green-300'
                              }`}
                              onClick={() => handleInputChange('acknowledgmentRead', !formData.acknowledgmentRead)}
                            >
                              {formData.acknowledgmentRead && (
                                <Check className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-700 cursor-pointer"
                              onClick={() => handleInputChange('acknowledgmentRead', !formData.acknowledgmentRead)}
                            >
                              I certify that I read or had read to me every page, received a duplicate copy today, and may revoke this consent up to the moment anesthesia is administered without penalty.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-green-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                                formData.acknowledgmentOutcome
                                  ? 'bg-green-100'
                                  : 'border-2 border-gray-300 bg-white hover:border-green-300'
                              }`}
                              onClick={() => handleInputChange('acknowledgmentOutcome', !formData.acknowledgmentOutcome)}
                            >
                              {formData.acknowledgmentOutcome && (
                                <Check className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-700 cursor-pointer"
                              onClick={() => handleInputChange('acknowledgmentOutcome', !formData.acknowledgmentOutcome)}
                            >
                              I understand that outcome is not guaranteed and agree to follow all postoperative and hygiene instructions.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-green-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                                formData.acknowledgmentAuthorize
                                  ? 'bg-green-100'
                                  : 'border-2 border-gray-300 bg-white hover:border-green-300'
                              }`}
                              onClick={() => handleInputChange('acknowledgmentAuthorize', !formData.acknowledgmentAuthorize)}
                            >
                              {formData.acknowledgmentAuthorize && (
                                <Check className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-700 cursor-pointer"
                              onClick={() => handleInputChange('acknowledgmentAuthorize', !formData.acknowledgmentAuthorize)}
                            >
                              I authorize Dr. Germain Jean-Charles, NY # [........], and named associates below to perform the procedures.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Signatures */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      Provider Signatures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Surgeon Information */}
                      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex gap-2">
                            {/* Left side - Provider Information */}
                            <div className="flex-1 space-y-4">
                              {/* Provider Name and Role on same row */}
                              <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Provider Name</Label>
                                  <Input
                                    value={formData.surgeonName}
                                    onChange={(e) => handleInputChange('surgeonName', e.target.value)}
                                    placeholder="Dr. _______________"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2 flex-shrink-0">
                                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                                  <div className="h-10 flex items-center">
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">Surgeon</span>
                                  </div>
                                </div>
                              </div>

                              {/* Date/Time on separate row */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date/Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={formData.surgeonDate}
                                  onChange={(e) => handleInputChange('surgeonDate', e.target.value)}
                                  className="h-10"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const now = new Date();
                                    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                    handleInputChange('surgeonDate', localDateTime);
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Current Time and Date
                                </Button>
                              </div>
                            </div>

                            {/* Right side - Signature */}
                            <div className="flex flex-col items-center justify-center space-y-3 flex-shrink-0">
                              <div className="flex items-center justify-center">
                                {formData.surgeonSignature ? (
                                  <SignaturePreview
                                    signature={formData.surgeonSignature}
                                    onEdit={() => handleSignatureDialogOpen('surgeonSignature')}
                                    onClear={() => handleSignatureClear('surgeonSignature')}
                                    className="w-64 h-32 border border-gray-300 rounded-md"
                                  />
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSignatureDialogOpen('surgeonSignature')}
                                    className="w-64 h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Sign Here
                                  </Button>
                                )}
                              </div>
                              <div className="w-64 border-t border-gray-300 pt-2">
                                <div className="flex items-center justify-center">
                                  <Label className="text-sm font-semibold">Surgeon Signature</Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>


                    </div>
                  </CardContent>
                </Card>

                {/* Witness Section */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      Independent Witness
                      <span className="text-sm font-normal text-gray-600">(non-employee preferred)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="witnessName" className="text-sm font-medium text-gray-700">
                              <span className="text-red-500">*</span> Witness Name
                            </Label>
                            <Input
                              id="witnessName"
                              value={formData.witnessName}
                              onChange={(e) => handleInputChange('witnessName', e.target.value)}
                              placeholder="Full name of witness"
                              className="h-10"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="witnessSignatureDate" className="text-sm font-medium text-gray-700">
                              <span className="text-red-500">*</span> Date
                            </Label>
                            <Input
                              id="witnessSignatureDate"
                              type="date"
                              value={formData.witnessSignatureDate}
                              onChange={(e) => handleInputChange('witnessSignatureDate', e.target.value)}
                              className="h-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex flex-col items-end space-y-3">
                            <div className="flex items-center justify-center">
                              {formData.witnessSignature ? (
                                <SignaturePreview
                                  signature={formData.witnessSignature}
                                  onEdit={() => handleSignatureDialogOpen('witnessSignature')}
                                  onClear={() => handleSignatureClear('witnessSignature')}
                                  className="w-64 h-16 border border-gray-300 rounded-md"
                                />
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleSignatureDialogOpen('witnessSignature')}
                                  className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Sign Here
                                </Button>
                              )}
                            </div>
                            <div className="w-64 border-t border-gray-300 pt-2">
                              <div className="flex items-center justify-center">
                                <Label className="text-sm font-semibold">Witness Signature</Label>
                              </div>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Separator />

                {/* Patient Signature Section */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
                      <Edit className="h-5 w-5" />
                      Patient Signature & Acknowledgment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Side - Patient Information Fields */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="patientSignatureName" className="text-sm font-medium text-gray-700">
                              Patient Name
                            </Label>
                            <Input
                              id="patientSignatureName"
                              value={formData.patientName}
                              onChange={(e) => handleInputChange('patientName', e.target.value)}
                              className="mt-1"
                              placeholder="Enter patient full name"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="patientSignatureDate" className="text-sm font-medium text-gray-700">
                                Date
                              </Label>
                              <Input
                                id="patientSignatureDate"
                                type="date"
                                value={formData.patientSignatureDate}
                                onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="patientSignatureTime" className="text-sm font-medium text-gray-700">
                                Time
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  id="patientSignatureTime"
                                  type="time"
                                  value={formData.patientSignatureTime || ''}
                                  onChange={(e) => handleInputChange('patientSignatureTime', e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const now = new Date();
                                    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
                                    handleInputChange('patientSignatureTime', currentTime);
                                  }}
                                  className="px-3 text-xs"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Signature Area */}
                      <div className="flex flex-col justify-center items-center space-y-4">
                        <div className="flex items-center justify-center">
                          {formData.patientSignature ? (
                            <SignaturePreview
                              signature={formData.patientSignature}
                              onEdit={() => handleSignatureDialogOpen('patientSignature')}
                              onClear={() => handleSignatureClear('patientSignature')}
                              className="w-80 h-20 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleSignatureDialogOpen('patientSignature')}
                              className="w-80 h-20 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Click to Sign
                            </Button>
                          )}
                        </div>
                        <div className="w-80 border-t border-gray-300 pt-2">
                          <div className="flex items-center justify-center">
                            <Label className="text-sm font-semibold">Patient Signature</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            </div>
          )}
        </div>

        {/* Fixed Footer with Navigation */}
        <div className="mt-auto sticky bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white px-6 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center">
            {isLastStep ? (
              !readOnly ? (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2">
                  <CheckCircle className="h-4 w-4" />
                  Submit
                </Button>
              ) : (
                <Button type="button" disabled className="bg-gray-400 text-white flex items-center gap-2 px-4 py-2">
                  <CheckCircle className="h-4 w-4" />
                  View Only
                </Button>
              )
            ) : (
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Signature Dialogs */}
      {Object.entries(signatureDialogs).map(([key, isOpen]) => (
        <SignatureDialog
          key={key}
          isOpen={isOpen}
          onClose={() => handleSignatureDialogClose(key)}
          onSave={(signature) => handleSignatureSave(key, signature)}
          title={getSignatureTitle(key)}
          currentSignature={getSignatureValue(key)}
        />
      ))}
      </div> {/* Close content container */}
    </div>
  );

  // Helper functions for signature dialogs
  function getSignatureTitle(key: string): string {
    const titles: { [key: string]: string } = {
      patientInfoInitials: "Patient Initials - Patient Information",
      treatmentDescriptionInitials: "Patient Initials - Treatment Description",
      materialRisksInitials: "Patient Initials - Material Risks",
      sedationInitials: "Patient Initials - Sedation Consent",

      financialInitials: "Patient Initials - Financial Disclosure",
      photoVideoInitials: "Patient Initials - Photo/Video Authorization",
      opioidInitials: "Patient Initials - Opioid Consent",
      // finalInitials removed; using Patient Signature instead on Final tab
      surgeonSignature: "Surgeon Signature",

      patientSignature: "Patient Signature",
      witnessSignature: "Witness Signature"
    };
    return titles[key] || "Signature";
  }

  function getSignatureValue(key: string): string {
    return formData[key as keyof typeof formData] as string || '';
  }
}
