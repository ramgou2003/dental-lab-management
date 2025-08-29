import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleCheckbox } from "@/components/SimpleCheckbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PenTool, CheckCircle, AlertTriangle, FileText, Edit } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { SignatureDialog } from "@/components/SignatureDialog";
import { useState } from "react";

interface Section9SignaturesProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section9Signatures({ formData, onInputChange, onNestedInputChange }: Section9SignaturesProps) {

  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  // Add error boundary and logging
  if (!formData) {
    console.error('Section9Signatures: formData is undefined');
    return <div>Error: Form data not available</div>;
  }

  // Debug logging for date issues
  console.log('Section9Signatures formData.date:', formData.date, typeof formData.date);

  // Patient attestation items
  const attestationItems = [
    {
      key: 'reviewedAll',
      title: 'Complete Review',
      description: 'I have reviewed all sections of this patient packet and answered all questions to the best of my knowledge.'
    },
    {
      key: 'noOmissions',
      title: 'No Omissions',
      description: 'I have not omitted any important medical, dental, or personal information that could affect my treatment.'
    },
    {
      key: 'willNotifyChanges',
      title: 'Future Updates',
      description: 'I will notify the dental office of any changes to my health status, medications, or contact information.'
    },
    {
      key: 'informationAccurate',
      title: 'Information Accuracy',
      description: 'I certify that all information provided in this form is true, complete, and accurate to the best of my knowledge.'
    }
  ];

  const handleAttestationChange = (key: string, checked: boolean) => {
    onNestedInputChange('patientAttestation', key, checked);
  };

  const handleSignatureSave = (signatureData: string) => {
    onInputChange('signature', signatureData);
    setShowSignatureDialog(false);
  };

  const handleSignatureClear = () => {
    onInputChange('signature', '');
  };

  // Check completion status with error handling
  const allAttestationsChecked = formData?.patientAttestation ? Object.values(formData.patientAttestation).every(Boolean) : false;
  const hasPatientName = formData?.patientNameSignature ? formData.patientNameSignature.trim().length > 0 : false;
  const hasSignature = formData?.signature ? formData.signature.length > 0 : false;
  const hasDate = formData?.date ? true : false;

  const isSignatureSectionComplete = allAttestationsChecked && hasPatientName && hasSignature && hasDate;

  // Format date for display with error handling
  const formatDate = (date: Date | string | any) => {
    try {
      let dateObj: Date;

      if (!date) {
        dateObj = new Date();
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date();
      }

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <PenTool className="h-5 w-5 text-emerald-600" />
            </div>
            Patient Attestation & Signatures
            <Badge variant="secondary" className="ml-auto">2 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please review your attestation and provide your signature to complete the patient packet.
          </p>
        </CardHeader>
      </Card>

      {/* Patient Attestation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Patient Attestation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please read each statement carefully and check the box to confirm your agreement.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {attestationItems.map((item) => (
            <Card key={item.key} className="border-gray-200">
              <CardContent className="p-4">
                <SimpleCheckbox
                  id={item.key}
                  checked={formData?.patientAttestation ? (formData.patientAttestation[item.key as keyof typeof formData.patientAttestation] || false) : false}
                  onCheckedChange={(checked) => handleAttestationChange(item.key, checked as boolean)}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </SimpleCheckbox>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="h-5 w-5 text-blue-600" />
            Patient Signature
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide your printed name and signature to complete the form.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Name and Date */}
            <div className="space-y-6">
              {/* Printed Name */}
              <div>
                <Label htmlFor="patientNameSignature" className="text-sm font-semibold">
                  <span className="text-red-500">*</span> Patient Name (Print)
                </Label>
                <Input
                  id="patientNameSignature"
                  value={formData?.patientNameSignature || ''}
                  onChange={(e) => onInputChange('patientNameSignature', e.target.value)}
                  placeholder="Auto-filled from patient information"
                  required
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from Section 1. You can edit if needed.
                </p>
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="signatureDate" className="text-sm font-semibold">
                  <span className="text-red-500">*</span> Date
                </Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={(() => {
                    try {
                      if (formData?.date) {
                        const date = formData.date instanceof Date ? formData.date : new Date(formData.date);
                        return date.toISOString().split('T')[0];
                      }
                      return new Date().toISOString().split('T')[0];
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return new Date().toISOString().split('T')[0];
                    }
                  })()}
                  onChange={(e) => onInputChange('date', new Date(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Right Side - Digital Signature */}
            <div>
              <Label className="text-sm font-semibold">
                <span className="text-red-500">*</span> Patient Signature
              </Label>
              <div className="mt-2">
                {formData?.signature && formData.signature.length > 0 ? (
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Signature Captured</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSignatureClear}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Clear
                      </Button>
                    </div>
                    <img
                      src={formData?.signature || ''}
                      alt="Patient Signature"
                      className="max-w-full h-20 border border-gray-300 rounded bg-white"
                    />
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSignatureDialog(true)}
                    className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Click to Sign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Statement */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <FileText className="h-5 w-5 text-blue-600" />
            Legal Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-3">
            <strong>By signing this document, I acknowledge that:</strong>
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>I have read and understood all sections of this patient packet</li>
            <li>All information provided is true and complete to the best of my knowledge</li>
            <li>I understand that withholding information may compromise my treatment</li>
            <li>I consent to the dental examination and treatment as outlined</li>
            <li>I have received and understand the office policies and privacy practices</li>
            <li>This signature has the same legal effect as a handwritten signature</li>
          </ul>
        </CardContent>
      </Card>

      {/* Completion Status Alerts */}
      {!allAttestationsChecked && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Attestation Required:</strong> Please review and check all attestation items to confirm 
            your agreement before signing.
          </AlertDescription>
        </Alert>
      )}

      {!hasPatientName && allAttestationsChecked && (
        <Alert className="border-orange-200 bg-orange-50">
          <PenTool className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Printed Name Required:</strong> Please enter your full legal name in the printed name field.
          </AlertDescription>
        </Alert>
      )}

      {!hasSignature && allAttestationsChecked && hasPatientName && (
        <Alert className="border-orange-200 bg-orange-50">
          <PenTool className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Signature Required:</strong> Please click the signature area to provide your digital signature.
          </AlertDescription>
        </Alert>
      )}

      {isSignatureSectionComplete && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Form Complete:</strong> Thank you for completing the New Patient Packet. Your information 
            has been recorded and will be reviewed by our clinical team before your appointment.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Summary */}
      {isSignatureSectionComplete && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Form Completion Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-emerald-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Patient Name:</strong> {formData?.patientNameSignature || 'Not provided'}</p>
                <p><strong>Completion Date:</strong> {formatDate(formData?.date || new Date())}</p>
              </div>
              <div>
                <p><strong>Form Status:</strong> Complete</p>
                <p><strong>Signature Status:</strong> Digitally Signed</p>
              </div>
            </div>
            <p className="mt-4 text-xs">
              This completed form will be securely stored in your patient record and reviewed by our clinical team.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Signature Dialog */}
      <SignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onSave={handleSignatureSave}
        title="Patient Signature"
      />
    </div>
  );
}
