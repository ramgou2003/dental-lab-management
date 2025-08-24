import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { FileText, User, CheckCircle, Edit, Building2, Check, AlertTriangle } from "lucide-react";

interface FinalDesignApprovalFormProps {
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

export function FinalDesignApprovalForm({
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
}: FinalDesignApprovalFormProps) {
  // Material and Shade options from lab scripts form
  const materialOptions = [
    "Flexera Smile Ultra Plus", "Sprint Ray ONX", "Sprint Ray Nightguard Flex",
    "Flexera Model X", "Zirconia", "PMMA", "ONX Tough", "Titanium & Zirconia", "Titanium"
  ];

  const shadeOptions = [
    "N/A", "A1", "A2", "A3", "A3.5", "A4", "B1", "B2", "B3", "B4",
    "C1", "C2", "C3", "C4", "D2", "D3", "D4", "BL1", "BL2", "BL3", "BL4",
    "BLEACH", "NW", "Clear", "Custom"
  ];

  const [formData, setFormData] = useState(() => {
    // The initialData comes from the service already converted to camelCase
    const today = new Date().toISOString().split('T')[0];

    const initialFormData = {
      // Patient Information
      firstName: initialData?.firstName || patientName.split(' ')[0] || "",
      lastName: initialData?.lastName || patientName.split(' ').slice(1).join(' ') || "",
      dateOfBirth: initialData?.dateOfBirth || patientDateOfBirth || "",
      dateOfService: initialData?.dateOfService || today,

      // Treatment Details
      treatment: initialData?.treatment || "", // "UPPER", "LOWER", "DUAL"
      material: initialData?.material || "",
      shadeSelected: initialData?.shadeSelected || "",

      // Design Approval & Fee Agreement Acknowledgments
      designReviewAcknowledged: initialData?.designReviewAcknowledged ?? false,
      finalFabricationApproved: initialData?.finalFabricationApproved ?? false,
      postApprovalChangesUnderstood: initialData?.postApprovalChangesUnderstood ?? false,
      warrantyReminderUnderstood: initialData?.warrantyReminderUnderstood ?? false,

      // Signatures
      patientFullName: initialData?.patientFullName || patientName || "",
      patientSignature: initialData?.patientSignature || "",
      patientSignatureDate: initialData?.patientSignatureDate || today,
      witnessName: initialData?.witnessName || "",
      witnessSignature: initialData?.witnessSignature || "",
      witnessSignatureDate: initialData?.witnessSignatureDate || today,

      // Office Use Only
      designAddedToChart: initialData?.designAddedToChart ?? false,
      feeAgreementScanned: initialData?.feeAgreementScanned ?? false
    };

    console.log('🏁 Initial Final Design Approval form data setup:', {
      firstName: initialFormData.firstName,
      lastName: initialFormData.lastName,
      treatment: initialFormData.treatment,
      material: initialFormData.material,
      fromInitialData: !!initialData,
      initialDataId: initialData?.id,
      hasInitialData: !!initialData
    });

    return initialFormData;
  });

  const [hasFormData, setHasFormData] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Signature dialog states
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [showWitnessSignatureDialog, setShowWitnessSignatureDialog] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && initialData.id) {
      console.log('🔄 Updating Final Design Approval form data from initialData:', initialData);
      console.log('🔍 isEditing:', isEditing, 'readOnly:', readOnly);

      const today = new Date().toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        // Patient Information
        firstName: initialData.firstName || prev.firstName || "",
        lastName: initialData.lastName || prev.lastName || "",
        dateOfBirth: initialData.dateOfBirth || prev.dateOfBirth || "",
        dateOfService: initialData.dateOfService || prev.dateOfService || today,

        // Treatment Details
        treatment: initialData.treatment || prev.treatment || "",
        material: initialData.material || prev.material || "",
        shadeSelected: initialData.shadeSelected || prev.shadeSelected || "",

        // Design Approval & Fee Agreement Acknowledgments
        designReviewAcknowledged: initialData.designReviewAcknowledged ?? prev.designReviewAcknowledged ?? false,
        finalFabricationApproved: initialData.finalFabricationApproved ?? prev.finalFabricationApproved ?? false,
        postApprovalChangesUnderstood: initialData.postApprovalChangesUnderstood ?? prev.postApprovalChangesUnderstood ?? false,
        warrantyReminderUnderstood: initialData.warrantyReminderUnderstood ?? prev.warrantyReminderUnderstood ?? false,

        // Signatures
        patientFullName: initialData.patientFullName || prev.patientFullName || patientName || "",
        patientSignature: initialData.patientSignature || prev.patientSignature || "",
        patientSignatureDate: initialData.patientSignatureDate || prev.patientSignatureDate || today,
        witnessName: initialData.witnessName || prev.witnessName || "",
        witnessSignature: initialData.witnessSignature || prev.witnessSignature || "",
        witnessSignatureDate: initialData.witnessSignatureDate || prev.witnessSignatureDate || today,

        // Office Use Only
        designAddedToChart: initialData.designAddedToChart ?? prev.designAddedToChart ?? false,
        feeAgreementScanned: initialData.feeAgreementScanned ?? prev.feeAgreementScanned ?? false
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
    const hasData = formData.firstName || formData.lastName || formData.treatment ||
                   formData.material || formData.patientSignature ||
                   formData.designReviewAcknowledged || formData.finalFabricationApproved;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Auto-saving Final Design Approval form with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        treatment: formData.treatment,
        material: formData.material,
        isFormInitialized: isFormInitialized
      });
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, isFormInitialized]);

  const handleInputChange = (field: string, value: any) => {
    console.log('📝 Input changed:', field, '=', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTreatmentChange = (treatmentType: string) => {
    setFormData(prev => ({
      ...prev,
      treatment: treatmentType
    }));
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, patientSignature: signatureData }));
  };

  const handlePatientSignatureClear = () => {
    setFormData(prev => ({ ...prev, patientSignature: "" }));
  };

  const handleWitnessSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, witnessSignature: signatureData }));
  };

  const handleWitnessSignatureClear = () => {
    setFormData(prev => ({ ...prev, witnessSignature: "" }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast.error('Please fill in patient first and last name');
      return;
    }

    if (!formData.treatment) {
      toast.error('Please select a treatment type');
      return;
    }

    if (!formData.material) {
      toast.error('Please select a material');
      return;
    }

    if (!formData.designReviewAcknowledged || !formData.finalFabricationApproved ||
        !formData.postApprovalChangesUnderstood || !formData.warrantyReminderUnderstood) {
      toast.error('Please acknowledge all design approval items');
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

    // Convert form data to match service interface
    const submissionData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: isValidDate(formData.dateOfBirth) ? formData.dateOfBirth : null,
      date_of_service: isValidDate(formData.dateOfService) ? formData.dateOfService : currentDate,
      treatment: formData.treatment,
      material: formData.material,
      shade_selected: formData.shadeSelected,
      design_review_acknowledged: formData.designReviewAcknowledged,
      final_fabrication_approved: formData.finalFabricationApproved,
      post_approval_changes_understood: formData.postApprovalChangesUnderstood,
      warranty_reminder_understood: formData.warrantyReminderUnderstood,
      patient_full_name: formData.patientFullName,
      patient_signature: formData.patientSignature,
      patient_signature_date: isValidDate(formData.patientSignatureDate) ? formData.patientSignatureDate : currentDate,
      witness_name: formData.witnessName,
      witness_signature: formData.witnessSignature,
      witness_signature_date: isValidDate(formData.witnessSignatureDate) ? formData.witnessSignatureDate : currentDate,
      design_added_to_chart: formData.designAddedToChart,
      fee_agreement_scanned: formData.feeAgreementScanned
    };

    onSubmit(submissionData);
    toast.success('Final Design Approval form submitted successfully');
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Fixed Header - Full Width */}
      <DialogHeader className="flex-shrink-0 mb-3 w-full px-3 py-2">
        <DialogTitle className="text-xl font-bold text-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Final Design Approval Form
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

      {/* Content Container with full width */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden px-6">
            <div className="space-y-6 h-full overflow-y-auto">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  readOnly={!!patientDateOfBirth}
                  className={patientDateOfBirth ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="dateOfService">Date of Service (design review)</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={formData.dateOfService}
                  onChange={(e) => handleInputChange('dateOfService', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Treatment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Treatment</Label>
              <div className="flex flex-row gap-3 mt-2">
                <Button
                  type="button"
                  variant={formData.treatment === "UPPER" ? "default" : "outline"}
                  onClick={() => handleTreatmentChange('UPPER')}
                  className={`px-6 py-2 ${
                    formData.treatment === "UPPER"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  UPPER
                </Button>
                <Button
                  type="button"
                  variant={formData.treatment === "LOWER" ? "default" : "outline"}
                  onClick={() => handleTreatmentChange('LOWER')}
                  className={`px-6 py-2 ${
                    formData.treatment === "LOWER"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  LOWER
                </Button>
                <Button
                  type="button"
                  variant={formData.treatment === "DUAL" ? "default" : "outline"}
                  onClick={() => handleTreatmentChange('DUAL')}
                  className={`px-6 py-2 ${
                    formData.treatment === "DUAL"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  DUAL
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material">Material</Label>
                <Select value={formData.material} onValueChange={(value) => handleInputChange('material', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shadeSelected">Shade Selected</Label>
                <Select value={formData.shadeSelected} onValueChange={(value) => handleInputChange('shadeSelected', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shade" />
                  </SelectTrigger>
                  <SelectContent>
                    {shadeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Approval & Fee Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Design Approval & Fee Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.designReviewAcknowledged
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('designReviewAcknowledged', !formData.designReviewAcknowledged)}
                >
                  {formData.designReviewAcknowledged && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('designReviewAcknowledged', !formData.designReviewAcknowledged)}
                  >
                    <span className="text-red-500">*</span> <strong>1. Design Review.</strong> I confirm I have had adequate time to feel, inspect, and try in the proposed final appliance design supplied by the dental office. I understand the shape, contours, occlusion, shade, and materials as presented today.
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.finalFabricationApproved
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('finalFabricationApproved', !formData.finalFabricationApproved)}
                >
                  {formData.finalFabricationApproved && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('finalFabricationApproved', !formData.finalFabricationApproved)}
                  >
                    <span className="text-red-500">*</span> <strong>2. Final Fabrication.</strong> By signing below, I hereby approve the design as‑is and authorize fabrication of my final prosthesis. No further design changes will be made prior to fabrication.
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.postApprovalChangesUnderstood
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('postApprovalChangesUnderstood', !formData.postApprovalChangesUnderstood)}
                >
                  {formData.postApprovalChangesUnderstood && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('postApprovalChangesUnderstood', !formData.postApprovalChangesUnderstood)}
                  >
                    <span className="text-red-500">*</span> <strong>3. Post‑Approval Changes.</strong> I acknowledge that any modification, adjustment, remake, or replacement requested after this approval (including but not limited to changes in shade, shape, fit, or occlusion) will incur a fixed surcharge of $6,354. This fee is in addition to any standard laboratory, clinical, or warranty costs, and is not covered under the dental office's three‑year warranty.
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.warrantyReminderUnderstood
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('warrantyReminderUnderstood', !formData.warrantyReminderUnderstood)}
                >
                  {formData.warrantyReminderUnderstood && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('warrantyReminderUnderstood', !formData.warrantyReminderUnderstood)}
                  >
                    <span className="text-red-500">*</span> <strong>4. Warranty Reminder.</strong> I understand the three‑year warranty covers defects in materials and workmanship but does not cover patient‑driven design changes.
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="h-5 w-5 text-blue-600" />
              Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Two Column Layout */}
            <div className="flex items-start justify-between gap-8">
              {/* Witness Section - Left Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="witnessName">Witness Name (print)</Label>
                    <Input
                      id="witnessName"
                      value={formData.witnessName}
                      onChange={(e) => handleInputChange('witnessName', e.target.value)}
                      placeholder="Enter witness name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="witnessSignatureDate">Date</Label>
                    <Input
                      id="witnessSignatureDate"
                      type="date"
                      value={formData.witnessSignatureDate}
                      onChange={(e) => handleInputChange('witnessSignatureDate', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Witness Signature */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.witnessSignature ? (
                      <SignaturePreview
                        signature={formData.witnessSignature}
                        onEdit={() => setShowWitnessSignatureDialog(true)}
                        onClear={handleWitnessSignatureClear}
                        label="Witness Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowWitnessSignatureDialog(true)}
                        className="w-64 h-20 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <Separator orientation="vertical" className={`self-stretch ${
                !formData.witnessSignature && !formData.patientSignature
                  ? 'min-h-[250px]'
                  : 'min-h-[300px]'
              }`} />

              {/* Patient Section - Right Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="patientFullName">Patient Full Name (print)</Label>
                    <Input
                      id="patientFullName"
                      value={formData.patientFullName}
                      onChange={(e) => handleInputChange('patientFullName', e.target.value)}
                      placeholder="Enter patient full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientSignatureDate">Date</Label>
                    <Input
                      id="patientSignatureDate"
                      type="date"
                      value={formData.patientSignatureDate}
                      onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Patient Signature */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center justify-center">
                    {formData.patientSignature ? (
                      <SignaturePreview
                        signature={formData.patientSignature}
                        onEdit={() => setShowPatientSignatureDialog(true)}
                        onClear={handlePatientSignatureClear}
                        label="Patient Signature"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPatientSignatureDialog(true)}
                        className="w-64 h-20 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sign Here
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Use Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              Office Use Only
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.designAddedToChart
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('designAddedToChart', !formData.designAddedToChart)}
                >
                  {formData.designAddedToChart && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('designAddedToChart', !formData.designAddedToChart)}
                  >
                    Design added to patient's chart
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.feeAgreementScanned
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('feeAgreementScanned', !formData.feeAgreementScanned)}
                >
                  {formData.feeAgreementScanned && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium cursor-pointer text-blue-800"
                    onClick={() => handleInputChange('feeAgreementScanned', !formData.feeAgreementScanned)}
                  >
                    Fee agreement scanned to chart
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>




            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 border-t bg-white px-3 py-2">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {!readOnly ? (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Submit
                </Button>
              ) : (
                <Button type="button" disabled className="bg-gray-400 text-white">
                  View Only
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Signature Dialogs */}
      <SignatureDialog
        isOpen={showPatientSignatureDialog}
        onClose={() => setShowPatientSignatureDialog(false)}
        onSave={handlePatientSignatureSave}
        title="Patient Signature"
        currentSignature={formData.patientSignature}
      />

      <SignatureDialog
        isOpen={showWitnessSignatureDialog}
        onClose={() => setShowWitnessSignatureDialog(false)}
        onSave={handleWitnessSignatureSave}
        title="Witness Signature"
        currentSignature={formData.witnessSignature}
      />
    </div>
  );
}
