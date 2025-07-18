import { useState } from "react";
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
import { FileText, User, CheckCircle, Edit, Building2, Check } from "lucide-react";

interface FinalDesignApprovalFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
}

export function FinalDesignApprovalForm({ onSubmit, onCancel, patientName = "", patientDateOfBirth = "" }: FinalDesignApprovalFormProps) {
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

  const [formData, setFormData] = useState({
    // Patient Information
    firstName: patientName.split(' ')[0] || "",
    lastName: patientName.split(' ').slice(1).join(' ') || "",
    dateOfBirth: patientDateOfBirth,
    dateOfService: new Date().toISOString().split('T')[0],

    // Treatment Details
    treatment: "", // "UPPER", "LOWER", "DUAL"
    material: "",
    shadeSelected: "",

    // Design Approval & Fee Agreement Acknowledgments
    designReviewAcknowledged: false,
    finalFabricationApproved: false,
    postApprovalChangesUnderstood: false,
    warrantyReminderUnderstood: false,

    // Signatures
    patientFullName: patientName,
    patientSignature: "",
    patientSignatureDate: new Date().toISOString().split('T')[0],
    witnessName: "",
    witnessSignature: "",
    witnessSignatureDate: new Date().toISOString().split('T')[0],

    // Office Use Only
    designAddedToChart: false,
    feeAgreementScanned: false
  });

  // Signature dialog states
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [showWitnessSignatureDialog, setShowWitnessSignatureDialog] = useState(false);

  const handleInputChange = (field: string, value: any) => {
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
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Final Design Approval Form
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
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




        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Final Design Approval
          </Button>
        </div>
      </form>

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
