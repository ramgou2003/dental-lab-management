import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
}

export function ConsentFullArchForm({
  onSubmit,
  onCancel,
  patientName = "",
  initialData = null,
  isEditing = false,
  readOnly = false
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

  // Navigation functions
  const getCurrentArrayIndex = () => {
    return steps.findIndex(step => step.id === activeTab);
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentArrayIndex();
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentArrayIndex();
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1].id);
    }
  };

  const isFirstStep = getCurrentArrayIndex() === 0;
  const isLastStep = getCurrentArrayIndex() === steps.length - 1;
  const [formData, setFormData] = useState({
    // Patient & Interpreter Information
    patientName: initialData?.patient_name || patientName,
    chartNumber: initialData?.chart_number || "",
    date: initialData?.consent_date || new Date().toISOString().split('T')[0],
    time: initialData?.consent_time || "",
    primaryLanguage: initialData?.primary_language || "english",
    otherLanguageText: initialData?.other_language_text || "",
    interpreterRequired: initialData?.interpreter_required || "no",
    interpreterName: initialData?.interpreter_name || "",
    interpreterCredential: initialData?.interpreter_credential || "",
    patientInfoInitials: initialData?.patient_info_initials || "",

    // Treatment Description & Alternatives
    archType: initialData?.arch_type || "", // "upper", "lower", "dual"
    upperJaw: initialData?.upper_jaw || "",
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
      midazolam: {
        dose: initialData?.midazolam_dose || "",
        unit: initialData?.midazolam_unit || "mg"
      },
      fentanyl: {
        dose: initialData?.fentanyl_dose || "",
        unit: initialData?.fentanyl_unit || "µg"
      },
      ketamine: {
        dose: initialData?.ketamine_dose || "",
        unit: initialData?.ketamine_unit || "mg"
      },
      dexamethasone: {
        dose: initialData?.dexamethasone_dose || "",
        unit: initialData?.dexamethasone_unit || "mg"
      }
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
    risksUnderstood: initialData?.risks_understood || false,
    materialRisksInitials: initialData?.material_risks_initials || "",

    // Sedation & Anesthesia Consent
    escortName: initialData?.escort_name || "",
    escortPhone: initialData?.escort_phone || "",
    medicationsDisclosed: initialData?.medications_disclosed || false,
    declineIVSedation: initialData?.decline_iv_sedation || false,
    sedationInitials: initialData?.sedation_initials || "",
    anesthesiaProviderInitials: initialData?.anesthesia_provider_initials || "",

    // Financial Disclosure
    surgicalExtractions: {
      count: initialData?.surgical_extractions_count || "",
      fee: initialData?.surgical_extractions_fee || "",
      covered: initialData?.surgical_extractions_covered || ""
    },
    implantFixtures: {
      count: initialData?.implant_fixtures_count || "",
      fee: initialData?.implant_fixtures_fee || "",
      covered: initialData?.implant_fixtures_covered || ""
    },
    zirconiabridge: {
      fee: initialData?.zirconia_bridge_fee || "",
      covered: initialData?.zirconia_bridge_covered || ""
    },
    ivSedation: {
      fee: initialData?.iv_sedation_fee || "",
      covered: initialData?.iv_sedation_covered || ""
    },
    financialInitials: initialData?.financial_initials || "",

    // Photo/Video Authorization
    internalRecordKeeping: initialData?.internal_record_keeping || "",
    professionalEducation: initialData?.professional_education || "",
    marketingSocialMedia: initialData?.marketing_social_media || "",
    hipaaEmailSms: initialData?.hipaa_email_sms || false,
    hipaaEmail: initialData?.hipaa_email || "",
    hipaaPhone: initialData?.hipaa_phone || "",
    photoVideoInitials: initialData?.photo_video_initials || "",

    // Opioid Consent
    opioidInitials: initialData?.opioid_initials || "",
    smallestOpioidSupply: initialData?.smallest_opioid_supply || false,

    // Final Acknowledgment & Signatures
    surgeonName: initialData?.surgeon_name || "",
    surgeonSignature: initialData?.surgeon_signature || "",
    surgeonDate: initialData?.surgeon_date || "",
    anesthesiaProviderName: initialData?.anesthesia_provider_name || "",
    anesthesiaProviderSignature: initialData?.anesthesia_provider_signature || "",
    anesthesiaProviderDate: initialData?.anesthesia_provider_date || "",
    patientSignature: initialData?.patient_signature || "",
    patientSignatureDate: initialData?.patient_signature_date || new Date().toISOString().split('T')[0],
    witnessName: initialData?.witness_name || "",
    witnessSignature: initialData?.witness_signature || "",
    witnessSignatureDate: initialData?.witness_signature_date || new Date().toISOString().split('T')[0],
    finalInitials: initialData?.final_initials || "",

    // Patient Acknowledgment Checkboxes
    acknowledgmentRead: initialData?.acknowledgment_read || false,
    acknowledgmentOutcome: initialData?.acknowledgment_outcome || false,
    acknowledgmentAuthorize: initialData?.acknowledgment_authorize || false
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
    anesthesiaProviderInitials: false,
    financialInitials: false,
    photoVideoInitials: false,
    opioidInitials: false,
    finalInitials: false,
    surgeonSignature: false,
    anesthesiaProviderSignature: false,
    patientSignature: false,
    witnessSignature: false
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const preserveScroll = () => {
    const el = scrollRef.current;
    return el ? el.scrollTop : 0;
  };
  const restoreScroll = (top: number) => {
    const el = scrollRef.current;
    if (!el) return;
    // Use layout effect timing to avoid visual jump
    requestAnimationFrame(() => {
      el.scrollTop = top;
    });
  };

  // Keep footer pinned by ensuring the scroll container consumes leftover height
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // No-op but ensures layout calculated before paints after tab switches
    const id = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  const handleInputChange = (field: string, value: any) => {
    const top = preserveScroll();
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    restoreScroll(top);
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    const top = preserveScroll();
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [childField]: value
      }
    }));
    restoreScroll(top);
  };

  const toggleSedation = (key: 'localOnly' | 'nitrous' | 'ivConscious' | 'generalHospital') => {
    const top = preserveScroll();
    setFormData(prev => ({
      ...prev,
      sedationPlan: { ...(prev.sedationPlan as any), [key]: !(prev.sedationPlan as any)[key] }
    }));
    restoreScroll(top);
  };

  const handleDrugChange = (drugName: string, field: 'dose' | 'unit', value: string) => {
    setFormData(prev => ({
      ...prev,
      plannedDrugs: {
        ...prev.plannedDrugs,
        [drugName]: {
          ...prev.plannedDrugs[drugName as keyof typeof prev.plannedDrugs],
          [field]: value
        }
      }
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

    // Validate required fields
    const requiredFields = ['patientName', 'chartNumber', 'date', 'time'] as const;
    const missingFields = requiredFields.filter(field => !formData[field]);

    // Check if all required signatures/initials are completed
    const requiredSignatures = [
      'patientInfoInitials',
      'treatmentDescriptionInitials',
      'materialRisksInitials',
      'sedationInitials',
      'financialInitials',
      'photoVideoInitials',
      'opioidInitials',
      'patientSignature',
      'witnessSignature'
    ] as const;

    const missingSignatures = requiredSignatures.filter(sig => !formData[sig]);

    // Check alternatives initials
    const alternativesFields = Object.values(formData.alternativesInitials);
    if (alternativesFields.some(field => !field || (typeof field === 'string' && field.trim() === ''))) {
      missingSignatures.push('All alternatives must be initialed');
    }

    if (missingFields.length > 0 || missingSignatures.length > 0) {
      // Map missing items to their tabs and labels for a guided message
      const fieldToTab: Record<string, string> = {
        patientName: 'patient-info',
        chartNumber: 'patient-info',
        date: 'patient-info',
        time: 'patient-info',
      };
      const signatureToTab: Record<string, string> = {
        patientInfoInitials: 'patient-info',
        treatmentDescriptionInitials: 'treatment',
        materialRisksInitials: 'risks',
        sedationInitials: 'sedation',
        financialInitials: 'financial',
        photoVideoInitials: 'media',
        opioidInitials: 'opioid',
        patientSignature: 'final',
        witnessSignature: 'final',
      };
      const signatureLabels: Record<string, string> = {
        patientInfoInitials: 'Patient Info Initials',
        treatmentDescriptionInitials: 'Treatment Description Initials',
        materialRisksInitials: 'Material Risks Initials',
        sedationInitials: 'Sedation Initials',
        financialInitials: 'Financial Initials',
        photoVideoInitials: 'Photo/Video Initials',
        opioidInitials: 'Opioid Initials',
        patientSignature: 'Patient Signature',
        witnessSignature: 'Witness Signature',
      };

      const issues: Array<{tab: string; label: string; key: string}> = [];
      for (const f of missingFields) {
        issues.push({ tab: fieldToTab[f], label: f.replace(/([A-Z])/g, ' $1'), key: f });
      }
      for (const s of missingSignatures) {
        if (s === 'All alternatives must be initialed') {
          issues.push({ tab: 'treatment', label: 'All alternatives must be initialed', key: 'alternativesInitials' });
        } else {
          issues.push({ tab: signatureToTab[s], label: signatureLabels[s] || s, key: s });
        }
      }

      // Build readable, grouped message
      const grouped: Record<string, string[]> = {};
      for (const item of issues) {
        grouped[item.tab] = grouped[item.tab] || [];
        grouped[item.tab].push(item.label);
      }
      const lines = Object.entries(grouped).map(([tab, labels]) => `- ${steps.find(s => s.id === tab)?.label || tab}: ${labels.join(', ')}`);

      alert(`Please complete the following:\n${lines.join('\n')}`);

      // Auto-navigate to the first tab with issues
      const firstTab = issues[0]?.tab;
      if (firstTab && firstTab !== activeTab) setActiveTab(firstTab);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Fixed Header - Full Width */}
      <DialogHeader className="flex-shrink-0 w-full px-6 pt-6 pb-4 border-b">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Consent Packet for Full Arch Surgery
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
                  onClick={() => setActiveTab(step.id)}
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
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
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
                          handleInputChange('time', currentTime);
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
                          handleInputChange('archType', value);
                          // Reset jaw selections when arch type changes
                          if (value === 'upper') {
                            handleInputChange('upperJaw', 'yes');
                            handleInputChange('lowerJaw', '');
                            handleInputChange('upperSameDayLoad', '');
                            handleInputChange('lowerSameDayLoad', '');
                          } else if (value === 'lower') {
                            handleInputChange('upperJaw', '');
                            handleInputChange('lowerJaw', 'yes');
                            handleInputChange('upperSameDayLoad', '');
                            handleInputChange('lowerSameDayLoad', '');
                          } else if (value === 'dual') {
                            handleInputChange('upperJaw', 'yes');
                            handleInputChange('lowerJaw', 'yes');
                            handleInputChange('upperSameDayLoad', '');
                            handleInputChange('lowerSameDayLoad', '');
                          }
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
                              onChange={(e) => handleInputChange('upperTeethRegions', e.target.value)}
                              placeholder="Enter teeth/regions"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="upperImplants" className="text-sm font-medium text-gray-700">
                              # Implants
                            </Label>
                            <Input
                              id="upperImplants"
                              type="number"
                              value={formData.upperImplants}
                              onChange={(e) => handleInputChange('upperImplants', e.target.value)}
                              placeholder="Number of implants"
                              className="h-10"
                            />
                          </div>
                        </div>

                        {/* Graft Material */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center">
                              <Checkbox
                                id="upperAllograft"
                                checked={formData.upperGraftMaterial.allograft}
                                onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, allograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="upperAllograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.upperGraftMaterial.allograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Allograft
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="upperXenograft"
                                checked={formData.upperGraftMaterial.xenograft}
                                onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, xenograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="upperXenograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.upperGraftMaterial.xenograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Xenograft
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="upperAutograft"
                                checked={formData.upperGraftMaterial.autograft}
                                onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, autograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="upperAutograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.upperGraftMaterial.autograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Autograft
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Prosthesis */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center">
                              <Checkbox
                                id="upperZirconia"
                                checked={formData.upperProsthesis.zirconia}
                                onCheckedChange={(checked) => handleInputChange('upperProsthesis', {...formData.upperProsthesis, zirconia: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="upperZirconia"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.upperProsthesis.zirconia
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Fixed Zirconia Bridge
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="upperOverdenture"
                                checked={formData.upperProsthesis.overdenture}
                                onCheckedChange={(checked) => handleInputChange('upperProsthesis', {...formData.upperProsthesis, overdenture: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="upperOverdenture"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.upperProsthesis.overdenture
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Removable Overdenture
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Same-day Load */}
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-gray-700 w-32">Same-day Load:</Label>
                          <RadioGroup
                            value={formData.upperSameDayLoad}
                            onValueChange={(value) => handleInputChange('upperSameDayLoad', value)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="yes" id="upperSameDayYes" className="sr-only" />
                              <Label
                                htmlFor="upperSameDayYes"
                                className={`px-6 py-3 rounded-lg border cursor-pointer text-base font-medium transition-all ${
                                  formData.upperSameDayLoad === 'yes'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="no" id="upperSameDayNo" className="sr-only" />
                              <Label
                                htmlFor="upperSameDayNo"
                                className={`px-6 py-3 rounded-lg border cursor-pointer text-base font-medium transition-all ${
                                  formData.upperSameDayLoad === 'no'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
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
                              onChange={(e) => handleInputChange('lowerTeethRegions', e.target.value)}
                              placeholder="Enter teeth/regions"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lowerImplants" className="text-sm font-medium text-gray-700">
                              # Implants
                            </Label>
                            <Input
                              id="lowerImplants"
                              type="number"
                              value={formData.lowerImplants}
                              onChange={(e) => handleInputChange('lowerImplants', e.target.value)}
                              placeholder="Number of implants"
                              className="h-10"
                            />
                          </div>
                        </div>

                        {/* Graft Material */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center">
                              <Checkbox
                                id="lowerAllograft"
                                checked={formData.lowerGraftMaterial.allograft}
                                onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, allograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="lowerAllograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.lowerGraftMaterial.allograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Allograft
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="lowerXenograft"
                                checked={formData.lowerGraftMaterial.xenograft}
                                onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, xenograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="lowerXenograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.lowerGraftMaterial.xenograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Xenograft
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="lowerAutograft"
                                checked={formData.lowerGraftMaterial.autograft}
                                onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, autograft: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="lowerAutograft"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.lowerGraftMaterial.autograft
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Autograft
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Prosthesis */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center">
                              <Checkbox
                                id="lowerZirconia"
                                checked={formData.lowerProsthesis.zirconia}
                                onCheckedChange={(checked) => handleInputChange('lowerProsthesis', {...formData.lowerProsthesis, zirconia: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="lowerZirconia"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.lowerProsthesis.zirconia
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Fixed Zirconia Bridge
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id="lowerOverdenture"
                                checked={formData.lowerProsthesis.overdenture}
                                onCheckedChange={(checked) => handleInputChange('lowerProsthesis', {...formData.lowerProsthesis, overdenture: checked})}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="lowerOverdenture"
                                className={`px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                  formData.lowerProsthesis.overdenture
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Removable Overdenture
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Same-day Load */}
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium text-gray-700 w-32">Same-day Load:</Label>
                          <RadioGroup
                            value={formData.lowerSameDayLoad}
                            onValueChange={(value) => handleInputChange('lowerSameDayLoad', value)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="yes" id="lowerSameDayYes" className="sr-only" />
                              <Label
                                htmlFor="lowerSameDayYes"
                                className={`px-6 py-3 rounded-lg border cursor-pointer text-base font-medium transition-all ${
                                  formData.lowerSameDayLoad === 'yes'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="no" id="lowerSameDayNo" className="sr-only" />
                              <Label
                                htmlFor="lowerSameDayNo"
                                className={`px-6 py-3 rounded-lg border cursor-pointer text-base font-medium transition-all ${
                                  formData.lowerSameDayLoad === 'no'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                }`}
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
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
                                  onChange={(e) => handleInputChange('upperTeethRegions', e.target.value)}
                                  placeholder="Enter teeth/regions"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="upperImplants" className="text-sm font-medium text-gray-700">
                                  # Implants
                                </Label>
                                <Input
                                  id="upperImplants"
                                  type="number"
                                  value={formData.upperImplants}
                                  onChange={(e) => handleInputChange('upperImplants', e.target.value)}
                                  placeholder="Number of implants"
                                  className="h-10"
                                />
                              </div>
                            </div>

                            {/* Upper Graft Material */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                  <Checkbox
                                    id="upperAllograft"
                                    checked={formData.upperGraftMaterial.allograft}
                                    onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, allograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="upperAllograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.upperGraftMaterial.allograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Allograft
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="upperXenograft"
                                    checked={formData.upperGraftMaterial.xenograft}
                                    onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, xenograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="upperXenograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.upperGraftMaterial.xenograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Xenograft
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="upperAutograft"
                                    checked={formData.upperGraftMaterial.autograft}
                                    onCheckedChange={(checked) => handleInputChange('upperGraftMaterial', {...formData.upperGraftMaterial, autograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="upperAutograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.upperGraftMaterial.autograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Autograft
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Upper Prosthesis */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                  <Checkbox
                                    id="upperZirconia"
                                    checked={formData.upperProsthesis.zirconia}
                                    onCheckedChange={(checked) => handleInputChange('upperProsthesis', {...formData.upperProsthesis, zirconia: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="upperZirconia"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.upperProsthesis.zirconia
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Fixed Zirconia Bridge
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="upperOverdenture"
                                    checked={formData.upperProsthesis.overdenture}
                                    onCheckedChange={(checked) => handleInputChange('upperProsthesis', {...formData.upperProsthesis, overdenture: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="upperOverdenture"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.upperProsthesis.overdenture
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Removable Overdenture
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Upper Same-day Load */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Same-day Load:</Label>
                              <RadioGroup
                                value={formData.upperSameDayLoad}
                                onValueChange={(value) => handleInputChange('upperSameDayLoad', value)}
                                className="flex gap-3"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id="upperSameDayYes" className="sr-only" />
                                  <Label
                                    htmlFor="upperSameDayYes"
                                    className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                      formData.upperSameDayLoad === 'yes'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id="upperSameDayNo" className="sr-only" />
                                  <Label
                                    htmlFor="upperSameDayNo"
                                    className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                      formData.upperSameDayLoad === 'no'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
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
                                  onChange={(e) => handleInputChange('lowerTeethRegions', e.target.value)}
                                  placeholder="Enter teeth/regions"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lowerImplants" className="text-sm font-medium text-gray-700">
                                  # Implants
                                </Label>
                                <Input
                                  id="lowerImplants"
                                  type="number"
                                  value={formData.lowerImplants}
                                  onChange={(e) => handleInputChange('lowerImplants', e.target.value)}
                                  placeholder="Number of implants"
                                  className="h-10"
                                />
                              </div>
                            </div>

                            {/* Lower Graft Material */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Graft Material</Label>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                  <Checkbox
                                    id="lowerAllograft"
                                    checked={formData.lowerGraftMaterial.allograft}
                                    onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, allograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="lowerAllograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.lowerGraftMaterial.allograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Allograft
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="lowerXenograft"
                                    checked={formData.lowerGraftMaterial.xenograft}
                                    onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, xenograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="lowerXenograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.lowerGraftMaterial.xenograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Xenograft
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="lowerAutograft"
                                    checked={formData.lowerGraftMaterial.autograft}
                                    onCheckedChange={(checked) => handleInputChange('lowerGraftMaterial', {...formData.lowerGraftMaterial, autograft: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="lowerAutograft"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.lowerGraftMaterial.autograft
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Autograft
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Lower Prosthesis */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Prosthesis</Label>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                  <Checkbox
                                    id="lowerZirconia"
                                    checked={formData.lowerProsthesis.zirconia}
                                    onCheckedChange={(checked) => handleInputChange('lowerProsthesis', {...formData.lowerProsthesis, zirconia: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="lowerZirconia"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.lowerProsthesis.zirconia
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Fixed Zirconia Bridge
                                  </Label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox
                                    id="lowerOverdenture"
                                    checked={formData.lowerProsthesis.overdenture}
                                    onCheckedChange={(checked) => handleInputChange('lowerProsthesis', {...formData.lowerProsthesis, overdenture: checked})}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="lowerOverdenture"
                                    className={`px-2 py-1 rounded border cursor-pointer text-xs font-medium transition-all ${
                                      formData.lowerProsthesis.overdenture
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Removable Overdenture
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Lower Same-day Load */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Same-day Load:</Label>
                              <RadioGroup
                                value={formData.lowerSameDayLoad}
                                onValueChange={(value) => handleInputChange('lowerSameDayLoad', value)}
                                className="flex gap-3"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id="lowerSameDayYes" className="sr-only" />
                                  <Label
                                    htmlFor="lowerSameDayYes"
                                    className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                      formData.lowerSameDayLoad === 'yes'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id="lowerSameDayNo" className="sr-only" />
                                  <Label
                                    htmlFor="lowerSameDayNo"
                                    className={`px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                      formData.lowerSameDayLoad === 'no'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-blue-300 bg-white text-gray-700 hover:border-blue-500'
                                    }`}
                                  >
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
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
                    <Label className="text-sm font-semibold mb-3 block">Planned Drugs & Max Doses:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Midazolam */}
                      <div className="space-y-2">
                        <Label htmlFor="midazolam" className="text-sm font-medium text-gray-700">Midazolam</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="midazolam"
                            type="number"
                            placeholder="0"
                            value={formData.plannedDrugs.midazolam.dose}
                            onChange={(e) => handleDrugChange('midazolam', 'dose', e.target.value)}
                            className="flex-1 h-10"
                          />
                          <Select
                            value={formData.plannedDrugs.midazolam.unit}
                            onValueChange={(value) => handleDrugChange('midazolam', 'unit', value)}
                          >
                            <SelectTrigger className="w-20 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Fentanyl */}
                      <div className="space-y-2">
                        <Label htmlFor="fentanyl" className="text-sm font-medium text-gray-700">Fentanyl</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="fentanyl"
                            type="number"
                            placeholder="0"
                            value={formData.plannedDrugs.fentanyl.dose}
                            onChange={(e) => handleDrugChange('fentanyl', 'dose', e.target.value)}
                            className="flex-1 h-10"
                          />
                          <Select
                            value={formData.plannedDrugs.fentanyl.unit}
                            onValueChange={(value) => handleDrugChange('fentanyl', 'unit', value)}
                          >
                            <SelectTrigger className="w-20 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="µg">µg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Ketamine */}
                      <div className="space-y-2">
                        <Label htmlFor="ketamine" className="text-sm font-medium text-gray-700">Ketamine</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="ketamine"
                            type="number"
                            placeholder="0"
                            value={formData.plannedDrugs.ketamine.dose}
                            onChange={(e) => handleDrugChange('ketamine', 'dose', e.target.value)}
                            className="flex-1 h-10"
                          />
                          <Select
                            value={formData.plannedDrugs.ketamine.unit}
                            onValueChange={(value) => handleDrugChange('ketamine', 'unit', value)}
                          >
                            <SelectTrigger className="w-20 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dexamethasone */}
                      <div className="space-y-2">
                        <Label htmlFor="dexamethasone" className="text-sm font-medium text-gray-700">Dexamethasone</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="dexamethasone"
                            type="number"
                            placeholder="0"
                            value={formData.plannedDrugs.dexamethasone.dose}
                            onChange={(e) => handleDrugChange('dexamethasone', 'dose', e.target.value)}
                            className="flex-1 h-10"
                          />
                          <Select
                            value={formData.plannedDrugs.dexamethasone.unit}
                            onValueChange={(value) => handleDrugChange('dexamethasone', 'unit', value)}
                          >
                            <SelectTrigger className="w-20 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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
                  <div className="flex items-center justify-between gap-8">
                    {/* Anesthesia Provider Initials - Left Side */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center justify-center">
                        {formData.anesthesiaProviderInitials ? (
                          <SignaturePreview
                            signature={formData.anesthesiaProviderInitials}
                            onEdit={() => handleSignatureDialogOpen('anesthesiaProviderInitials')}
                            onClear={() => handleSignatureClear('anesthesiaProviderInitials')}
                            className="w-64 h-16 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSignatureDialogOpen('anesthesiaProviderInitials')}
                            className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Sign Here
                          </Button>
                        )}
                      </div>
                      <div className="w-64 border-t border-gray-300 pt-2">
                        <div className="flex items-center justify-center">
                          <Label className="text-sm font-semibold">Anesthesia Provider Signature</Label>
                        </div>
                      </div>
                    </div>

                    {/* Patient Initials - Right Side */}
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
              <CardContent className="space-y-6 w-full">
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
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="surgicalExtractionsYes"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="surgicalExtractionsYes" className="text-sm cursor-pointer">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="surgicalExtractionsNo"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="surgicalExtractionsNo" className="text-sm cursor-pointer">No</Label>
                                  </div>
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
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="implantFixturesYes"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="implantFixturesYes" className="text-sm cursor-pointer">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="implantFixturesNo"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="implantFixturesNo" className="text-sm cursor-pointer">No</Label>
                                  </div>
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
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="zirconiabridgeYes"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="zirconiabridgeYes" className="text-sm cursor-pointer">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="zirconiabridgeNo"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="zirconiabridgeNo" className="text-sm cursor-pointer">No</Label>
                                  </div>
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
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="ivSedationYes"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="ivSedationYes" className="text-sm cursor-pointer">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="ivSedationNo"
                                      className="h-4 w-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label htmlFor="ivSedationNo" className="text-sm cursor-pointer">No</Label>
                                  </div>
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

                      {/* Anesthesia Provider Information */}
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
                                    value={formData.anesthesiaProviderName}
                                    onChange={(e) => handleInputChange('anesthesiaProviderName', e.target.value)}
                                    placeholder="Dr. _______________"
                                    className="h-10"
                                  />
                                </div>

                                <div className="space-y-2 flex-shrink-0">
                                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                                  <div className="h-10 flex items-center">
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">Anesthesia</span>
                                  </div>
                                </div>
                              </div>

                              {/* Date/Time on separate row */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date/Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={formData.anesthesiaProviderDate}
                                  onChange={(e) => handleInputChange('anesthesiaProviderDate', e.target.value)}
                                  className="h-10"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const now = new Date();
                                    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                    handleInputChange('anesthesiaProviderDate', localDateTime);
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
                                {formData.anesthesiaProviderSignature ? (
                                  <SignaturePreview
                                    signature={formData.anesthesiaProviderSignature}
                                    onEdit={() => handleSignatureDialogOpen('anesthesiaProviderSignature')}
                                    onClear={() => handleSignatureClear('anesthesiaProviderSignature')}
                                    className="w-64 h-32 border border-gray-300 rounded-md"
                                  />
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSignatureDialogOpen('anesthesiaProviderSignature')}
                                    className="w-64 h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Sign Here
                                  </Button>
                                )}
                              </div>
                              <div className="w-64 border-t border-gray-300 pt-2">
                                <div className="flex items-center justify-center">
                                  <Label className="text-sm font-semibold">Anesthesia Provider Signature</Label>
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

                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.patientSignature ? (
                      <SignaturePreview
                        signature={formData.patientSignature}
                        onEdit={() => handleSignatureDialogOpen('patientSignature')}
                        onClear={() => handleSignatureClear('patientSignature')}
                        className="w-64 h-16 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSignatureDialogOpen('patientSignature')}
                        className="w-64 h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                  <div className="w-64 border-t border-gray-300 pt-2">
                    <div className="flex items-center justify-center">
                      <Label className="text-sm font-semibold">Patient Signature</Label>
                    </div>
                  </div>
                </div>
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
                  {isEditing ? 'Update Form' : 'Save Form'}
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
      anesthesiaProviderInitials: "Anesthesia Provider Initials",
      financialInitials: "Patient Initials - Financial Disclosure",
      photoVideoInitials: "Patient Initials - Photo/Video Authorization",
      opioidInitials: "Patient Initials - Opioid Consent",
      // finalInitials removed; using Patient Signature instead on Final tab
      surgeonSignature: "Surgeon Signature",
      anesthesiaProviderSignature: "Anesthesia Provider Signature",
      patientSignature: "Patient Signature",
      witnessSignature: "Witness Signature"
    };
    return titles[key] || "Signature";
  }

  function getSignatureValue(key: string): string {
    return formData[key as keyof typeof formData] as string || '';
  }
}
