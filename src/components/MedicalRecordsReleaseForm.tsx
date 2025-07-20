import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignatureDialog } from "@/components/SignatureDialog";
import { FileText, User, Calendar, Building2, Shield, Phone, Mail } from "lucide-react";

interface MedicalRecordsReleaseFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
}

export function MedicalRecordsReleaseForm({ onSubmit, onCancel, patientName = "", patientDateOfBirth = "" }: MedicalRecordsReleaseFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: patientName,
    dateOfBirth: patientDateOfBirth || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    
    // Release Information
    dateOfRequest: new Date().toISOString().split('T')[0],
    recordsFromDate: "",
    recordsToDate: "",
    
    // Records to Release (checkboxes)
    recordTypes: {
      completeRecord: false,
      xrays: false,
      labResults: false,
      consultationNotes: false,
      treatmentPlans: false,
      surgicalReports: false,
      prescriptions: false,
      photographs: false,
      models: false,
      other: false
    },
    otherRecordsDescription: "",
    
    // Release To Information
    releaseToName: "",
    releaseToTitle: "",
    releaseToOrganization: "",
    releaseToAddress: "",
    releaseToCity: "",
    releaseToState: "",
    releaseToZipCode: "",
    releaseToPhone: "",
    releaseToFax: "",
    
    // Purpose of Release
    purposeOfRelease: "",
    
    // Authorization Details
    authorizationExpiration: "",
    rightToRevoke: true,
    copyToPatient: false,
    
    // Signatures
    patientSignature: "",
    patientSignatureDate: new Date().toISOString().split('T')[0],
    witnessSignature: "",
    witnessSignatureDate: new Date().toISOString().split('T')[0],
    witnessName: ""
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

  const handleRecordTypeChange = (recordType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recordTypes: {
        ...prev.recordTypes,
        [recordType]: checked
      }
    }));
  };

  const handlePatientSignatureSave = (signature: string) => {
    handleInputChange('patientSignature', signature);
    setShowPatientSignatureDialog(false);
  };

  const handleWitnessSignatureSave = (signature: string) => {
    handleInputChange('witnessSignature', signature);
    setShowWitnessSignatureDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Check if any record types are selected
  const hasSelectedRecords = Object.values(formData.recordTypes).some(Boolean);

  return (
    <div className="max-w-5xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Medical Records Release Authorization
        </DialogTitle>
        <p className="text-sm text-gray-600 mt-2">Authorization for Release of Protected Health Information</p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Full legal name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="CA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="patient@email.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Calendar className="h-5 w-5" />
              Records to be Released
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recordsFromDate">Records From Date</Label>
                <Input
                  id="recordsFromDate"
                  type="date"
                  value={formData.recordsFromDate}
                  onChange={(e) => handleInputChange('recordsFromDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recordsToDate">Records To Date</Label>
                <Input
                  id="recordsToDate"
                  type="date"
                  value={formData.recordsToDate}
                  onChange={(e) => handleInputChange('recordsToDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-semibold mb-3 block">Select Records to Release *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'completeRecord', label: 'Complete Medical Record' },
                  { key: 'xrays', label: 'X-rays/Radiographs' },
                  { key: 'labResults', label: 'Laboratory Results' },
                  { key: 'consultationNotes', label: 'Consultation Notes' },
                  { key: 'treatmentPlans', label: 'Treatment Plans' },
                  { key: 'surgicalReports', label: 'Surgical Reports' },
                  { key: 'prescriptions', label: 'Prescription Records' },
                  { key: 'photographs', label: 'Clinical Photographs' },
                  { key: 'models', label: 'Dental Models/Impressions' },
                  { key: 'other', label: 'Other (specify below)' }
                ].map((record) => (
                  <div key={record.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={record.key}
                      checked={formData.recordTypes[record.key as keyof typeof formData.recordTypes]}
                      onCheckedChange={(checked) => handleRecordTypeChange(record.key, checked as boolean)}
                    />
                    <Label htmlFor={record.key} className="text-sm font-normal">
                      {record.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {formData.recordTypes.other && (
              <div>
                <Label htmlFor="otherRecordsDescription">Other Records Description</Label>
                <Textarea
                  id="otherRecordsDescription"
                  value={formData.otherRecordsDescription}
                  onChange={(e) => handleInputChange('otherRecordsDescription', e.target.value)}
                  placeholder="Please specify other records to be released..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Release To Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Building2 className="h-5 w-5" />
              Release Records To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="releaseToName">Contact Person Name *</Label>
                <Input
                  id="releaseToName"
                  value={formData.releaseToName}
                  onChange={(e) => handleInputChange('releaseToName', e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="releaseToTitle">Title</Label>
                <Input
                  id="releaseToTitle"
                  value={formData.releaseToTitle}
                  onChange={(e) => handleInputChange('releaseToTitle', e.target.value)}
                  placeholder="DDS, Oral Surgeon"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="releaseToOrganization">Organization/Practice Name *</Label>
              <Input
                id="releaseToOrganization"
                value={formData.releaseToOrganization}
                onChange={(e) => handleInputChange('releaseToOrganization', e.target.value)}
                placeholder="ABC Dental Practice"
                required
              />
            </div>

            <div>
              <Label htmlFor="releaseToAddress">Address *</Label>
              <Input
                id="releaseToAddress"
                value={formData.releaseToAddress}
                onChange={(e) => handleInputChange('releaseToAddress', e.target.value)}
                placeholder="Street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="releaseToCity">City *</Label>
                <Input
                  id="releaseToCity"
                  value={formData.releaseToCity}
                  onChange={(e) => handleInputChange('releaseToCity', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="releaseToState">State *</Label>
                <Input
                  id="releaseToState"
                  value={formData.releaseToState}
                  onChange={(e) => handleInputChange('releaseToState', e.target.value)}
                  placeholder="CA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="releaseToZipCode">ZIP Code *</Label>
                <Input
                  id="releaseToZipCode"
                  value={formData.releaseToZipCode}
                  onChange={(e) => handleInputChange('releaseToZipCode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="releaseToPhone">Phone Number</Label>
                <Input
                  id="releaseToPhone"
                  value={formData.releaseToPhone}
                  onChange={(e) => handleInputChange('releaseToPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="releaseToFax">Fax Number</Label>
                <Input
                  id="releaseToFax"
                  value={formData.releaseToFax}
                  onChange={(e) => handleInputChange('releaseToFax', e.target.value)}
                  placeholder="(555) 123-4568"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purpose and Authorization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Shield className="h-5 w-5" />
              Purpose and Authorization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="purposeOfRelease">Purpose of Release *</Label>
              <Textarea
                id="purposeOfRelease"
                value={formData.purposeOfRelease}
                onChange={(e) => handleInputChange('purposeOfRelease', e.target.value)}
                placeholder="Continuing care, consultation, insurance claim, legal proceedings, etc."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="authorizationExpiration">Authorization Expiration Date</Label>
              <Input
                id="authorizationExpiration"
                type="date"
                value={formData.authorizationExpiration}
                onChange={(e) => handleInputChange('authorizationExpiration', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                If no date is specified, this authorization will expire one year from the date signed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rightToRevoke"
                  checked={formData.rightToRevoke}
                  onCheckedChange={(checked) => handleInputChange('rightToRevoke', checked)}
                />
                <Label htmlFor="rightToRevoke" className="text-sm">
                  I understand that I have the right to revoke this authorization at any time by providing written notice to the practice.
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyToPatient"
                  checked={formData.copyToPatient}
                  onCheckedChange={(checked) => handleInputChange('copyToPatient', checked)}
                />
                <Label htmlFor="copyToPatient" className="text-sm">
                  I would like to receive a copy of the released records.
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <FileText className="h-5 w-5" />
              Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Patient Signature *</Label>
                {formData.patientSignature && formData.patientSignature.length > 0 ? (
                  <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <img
                      src={formData.patientSignature}
                      alt="Patient Signature"
                      className="max-h-16 mx-auto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPatientSignatureDialog(true)}
                      className="w-full mt-2"
                    >
                      Update Signature
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPatientSignatureDialog(true)}
                    className="w-full mt-2"
                  >
                    Sign Here
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="patientSignatureDate">Date *</Label>
                <Input
                  id="patientSignatureDate"
                  type="date"
                  value={formData.patientSignatureDate}
                  onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Witness Signature */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="witnessName">Witness Name</Label>
                <Input
                  id="witnessName"
                  value={formData.witnessName}
                  onChange={(e) => handleInputChange('witnessName', e.target.value)}
                  placeholder="Witness full name"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Witness Signature</Label>
                {formData.witnessSignature && formData.witnessSignature.length > 0 ? (
                  <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <img
                      src={formData.witnessSignature}
                      alt="Witness Signature"
                      className="max-h-16 mx-auto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWitnessSignatureDialog(true)}
                      className="w-full mt-2"
                    >
                      Update Signature
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWitnessSignatureDialog(true)}
                    className="w-full mt-2"
                  >
                    Sign Here
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="witnessSignatureDate">Date</Label>
                <Input
                  id="witnessSignatureDate"
                  type="date"
                  value={formData.witnessSignatureDate}
                  onChange={(e) => handleInputChange('witnessSignatureDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!hasSelectedRecords || !formData.patientSignature}
          >
            Save Medical Records Release
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
