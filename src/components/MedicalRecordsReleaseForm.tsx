import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { SimpleCheckbox } from "@/components/SimpleCheckbox";
import { FileText, User, Clock, CheckCircle, AlertCircle, Edit, Download } from "lucide-react";
import { toast } from "sonner";
import { generateMedicalRecordsReleasePdf } from "@/utils/medicalRecordsReleasePdfGenerator";

interface MedicalRecordsReleaseFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
  onAutoSave?: (formData: any) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  autoSaveMessage?: string;
  lastSavedTime?: string;
}

export function MedicalRecordsReleaseForm({
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
  lastSavedTime = ''
}: MedicalRecordsReleaseFormProps) {
  const [formData, setFormData] = useState(() => {
    // Extract first and last names from patientName if not provided in initialData
    let firstName = initialData?.first_name || "";
    let lastName = initialData?.last_name || "";

    // If we don't have first/last names but have patientName, try to extract them
    if (!firstName && !lastName && patientName) {
      const nameParts = patientName.trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' '); // Handle multiple last names
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }
    }

    return {
      firstName,
      lastName,
      dateOfBirth: initialData?.date_of_birth || patientDateOfBirth || "",
      patientName: initialData?.patient_name || patientName,
      signatureDate: initialData?.signature_date || new Date().toISOString().split('T')[0],
      signatureTime: initialData?.signature_time || new Date().toTimeString().slice(0, 5),
      patientSignature: initialData?.patient_signature || "",
      hasAgreed: initialData?.has_agreed || false
    };
  });

  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [hasFormData, setHasFormData] = useState(false);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!onAutoSave || readOnly) return;

    // Check if form has meaningful data
    const hasMeaningfulData = formData.firstName || formData.lastName || formData.patientSignature;
    setHasFormData(hasMeaningfulData);

    const timeoutId = setTimeout(() => {
      // Only auto-save if there's meaningful data
      if (hasMeaningfulData) {
        onAutoSave(formData);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, readOnly]);

  // Sync patient name when first/last name changes
  useEffect(() => {
    if (formData.firstName && formData.lastName && !formData.patientName) {
      setFormData(prev => ({
        ...prev,
        patientName: `${formData.firstName} ${formData.lastName}`
      }));
    }
  }, [formData.firstName, formData.lastName, formData.patientName]);



  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-sync patient name when first or last name changes
      if (field === 'firstName' || field === 'lastName') {
        const firstName = field === 'firstName' ? value : prev.firstName;
        const lastName = field === 'lastName' ? value : prev.lastName;
        if (firstName && lastName) {
          newData.patientName = `${firstName} ${lastName}`;
        } else if (firstName) {
          newData.patientName = firstName;
        } else if (lastName) {
          newData.patientName = lastName;
        }
      }

      return newData;
    });
  };

  const handlePatientSignatureSave = (signature: string) => {
    handleInputChange('patientSignature', signature);
    setShowPatientSignatureDialog(false);
  };

  const handlePatientSignatureClear = () => {
    handleInputChange('patientSignature', '');
  };

  const handleSyncCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    setFormData(prev => ({ ...prev, signatureDate: currentDate, signatureTime: currentTime }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = { ...formData, status: 'completed' };
    console.log('🔄 Submitting Medical Records Release form data:', submissionData);
    onSubmit(submissionData);
  };



  return (
    <div className="flex flex-col h-full w-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Medical Records Release Authorization
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">Simplified Form – Effective 08/2025</p>
            </div>

            {/* Auto-save Status Indicator */}
            {onAutoSave && !readOnly && (hasFormData || autoSaveStatus === 'error') && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-2 ${
                autoSaveStatus === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : autoSaveStatus === 'saved'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {autoSaveStatus === 'error' ? (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                ) : autoSaveStatus === 'saved' ? (
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                ) : (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-200 border-t-green-600"></div>
                )}
                <span className="font-medium">
                  {autoSaveStatus === 'error'
                    ? autoSaveMessage
                    : autoSaveStatus === 'saved'
                    ? `Saved ${lastSavedTime}`
                    : 'Auto-saving changes...'}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-0">
          <Card className="rounded-none border-l-0 border-r-0 border-t-0">
            <CardHeader className="px-6">
              <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    required
                    readOnly={readOnly}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    required
                    readOnly={readOnly}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  readOnly={readOnly}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

        <Card className="rounded-none border-l-0 border-r-0 border-t-0">
          <CardHeader className="px-6">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <FileText className="h-5 w-5" />
              Authorization Content
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                By signing this form, I authorize you to release confidential health information about me, by releasing a copy of my medical records, or a summary or narrative of my protected health information, to the physician/person/facility/entity listed:
              </p>
              <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
                <p className="text-sm font-medium text-blue-900">
                  Germain Jean-Charles DDS PC<br />
                  344 N Main Street,<br />
                  Canandaigua, NY<br />
                  14424
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-l-0 border-r-0 border-t-0 border-b-0">
          <CardHeader className="px-6">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Edit className="h-5 w-5" />
              Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            {/* Agreement Checkbox */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <SimpleCheckbox
                id="agreement"
                checked={formData.hasAgreed || false}
                onCheckedChange={(checked) => handleInputChange('hasAgreed', checked)}
              >
                <span className="text-sm text-blue-800 font-medium">
                  I have read, understood, and agreed to all terms above.
                </span>
              </SimpleCheckbox>
            </div>

            {/* Signature Section - Horizontal Layout */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Patient Full Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Patient Full Name (print)</Label>
                  <Input
                    value={formData.patientName || (formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : '')}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Full patient name"
                    className="bg-gray-50"
                    readOnly={readOnly}
                  />
                </div>

                {/* Date/Time */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date/Time</Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={formData.signatureDate}
                      onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                      className="bg-gray-50"
                      readOnly={readOnly}
                    />
                    <div className="relative">
                      <Input
                        type="time"
                        value={formData.signatureTime}
                        onChange={(e) => handleInputChange('signatureTime', e.target.value)}
                        className="bg-gray-50 pr-32"
                        readOnly={readOnly}
                      />
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSyncCurrentDateTime}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2 flex items-center gap-1 border border-blue-300 bg-white hover:bg-blue-50 text-blue-600 text-xs rounded"
                          title="Set current date and time"
                        >
                          <Clock className="h-3 w-3" />
                          Current Date & Time
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Signature *</Label>
                  {formData.patientSignature ? (
                    <div className="border border-gray-300 rounded-lg p-2 bg-white min-h-[80px] flex items-center justify-center relative">
                      <img
                        src={formData.patientSignature}
                        alt="Patient Signature"
                        className="max-h-16 max-w-full object-contain"
                      />
                      {!readOnly && (
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPatientSignatureDialog(true)}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title="Edit signature"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handlePatientSignatureClear}
                            className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                            title="Clear signature"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPatientSignatureDialog(true)}
                      className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                      disabled={readOnly}
                    >
                      <Edit className="h-4 w-4" />
                      Sign Here
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 py-4 px-6">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.patientSignature || !formData.hasAgreed}
            >
              {isEditing ? 'Update Medical Records Release' : 'Submit'}
            </Button>
          )}
        </div>
      </div>

      <SignatureDialog
        isOpen={showPatientSignatureDialog}
        onClose={() => setShowPatientSignatureDialog(false)}
        onSave={handlePatientSignatureSave}
        title="Patient Signature"
        currentSignature={formData.patientSignature}
      />
    </div>
  );
}
