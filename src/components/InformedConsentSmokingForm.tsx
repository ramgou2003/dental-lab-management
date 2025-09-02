import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { Heart, AlertTriangle, Calendar, Users, CheckCircle, FileText, Check, Clock, AlertCircle } from "lucide-react";

interface InformedConsentSmokingFormProps {
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
}

export function InformedConsentSmokingForm({
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
}: InformedConsentSmokingFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    firstName: initialData?.first_name || patientName.split(' ')[0] || "",
    lastName: initialData?.last_name || patientName.split(' ').slice(1).join(' ') || "",
    dateOfBirth: initialData?.date_of_birth || patientDateOfBirth || "",
    nicotineUse: initialData?.nicotine_use || "",

    // Patient Understanding and Agreement
    understandsNicotineEffects: initialData?.understands_nicotine_effects || false,
    understandsRisks: initialData?.understands_risks || false,
    understandsTimeline: initialData?.understands_timeline || false,
    understandsInsurance: initialData?.understands_insurance || false,
    offeredResources: initialData?.offered_resources || false,
    takesResponsibility: initialData?.takes_responsibility || false,

    // Signatures
    patientSignature: initialData?.patient_signature || "",
    signatureDate: initialData?.signature_date || new Date().toISOString().split('T')[0],

    // Staff Use
    signedConsent: initialData?.signed_consent || "",
    refusalReason: initialData?.refusal_reason || ""
  });

  // Signature dialog states
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [hasFormData, setHasFormData] = useState(false);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!onAutoSave || readOnly) return;

    // Check if form has meaningful data
    const hasData = formData.firstName || formData.lastName || formData.nicotineUse ||
                   formData.understandsNicotineEffects || formData.understandsRisks ||
                   formData.understandsTimeline || formData.understandsInsurance ||
                   formData.offeredResources || formData.takesResponsibility ||
                   formData.patientSignature;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, readOnly]);

  const handleInputChange = (field: string, value: any) => {
    if (!readOnly) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (!readOnly) {
      setFormData(prev => ({
        ...prev,
        [field]: checked
      }));
    }
  };

  const handlePatientSignatureSave = (signature: string) => {
    if (!readOnly) {
      handleInputChange('patientSignature', signature);
      setShowPatientSignatureDialog(false);
    }
  };

  const handlePatientSignatureClear = () => {
    if (!readOnly) {
      handleInputChange('patientSignature', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Informed Consent - Nicotine Use and Surgery
          </DialogTitle>

          {/* Auto-save Status Indicator */}
          {onAutoSave && !readOnly && (hasFormData || autoSaveStatus === 'error') && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-2 ${
              autoSaveStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {autoSaveStatus === 'error' ? (
                <AlertCircle className="h-3 w-3 text-red-600" />
              ) : (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-200 border-t-green-600"></div>
              )}
              <span className="font-medium">
                {autoSaveStatus === 'error' ? autoSaveMessage : 'Auto-saving changes...'}
              </span>
            </div>
          )}
        </div>
        <div className="w-full h-1 bg-blue-200 rounded-full mt-2"></div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-blue-50 pb-4">
            <CardTitle className="text-lg font-semibold text-blue-800">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Nicotine Use Status *</Label>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        readOnly ? 'cursor-default' : 'cursor-pointer'
                      } transition-colors ${
                        formData.nicotineUse === 'yes'
                          ? 'bg-blue-100'
                          : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                      }`}
                      onClick={readOnly ? undefined : () => handleInputChange('nicotineUse', 'yes')}
                    >
                      {formData.nicotineUse === 'yes' && (
                        <Check className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label
                        className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                        onClick={readOnly ? undefined : () => handleInputChange('nicotineUse', 'yes')}
                      >
                        Yes (includes cigarettes, e-cigarettes, vaping, chewing tobacco, nicotine patches/gum)
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        readOnly ? 'cursor-default' : 'cursor-pointer'
                      } transition-colors ${
                        formData.nicotineUse === 'no'
                          ? 'bg-blue-100'
                          : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                      }`}
                      onClick={readOnly ? undefined : () => handleInputChange('nicotineUse', 'no')}
                    >
                      {formData.nicotineUse === 'no' && (
                        <Check className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label
                        className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                        onClick={readOnly ? undefined : () => handleInputChange('nicotineUse', 'no')}
                      >
                        No
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Information Alert */}
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Critical Information</h3>
                <p className="text-red-700 font-medium">
                  All nicotine use must stop at least 3 weeks before surgery to prevent serious complications and implant failure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Title */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800">Understanding Nicotine Risks for Your Surgery</h2>
        </div>

        {/* Why This Matters Section */}
        <Card className="border-2 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Heart className="h-6 w-6 text-red-500 flex-shrink-0" />
              <h3 className="text-xl font-bold text-gray-800">Why This Matters - We Want Your Surgery to Succeed</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Your health and the success of your surgery are our top priorities. We're committed to working with you as partners
              to ensure the best possible outcome. This form helps us make sure you have all the information you need to make
              informed decisions about your care and recovery.
            </p>
          </CardContent>
        </Card>

        {/* How Nicotine Affects Healing */}
        <Card className="border-2 border-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl">🔬</div>
              <h3 className="text-xl font-bold text-gray-800">How Nicotine Affects Your Healing</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Nicotine narrows your blood vessels, which reduces the amount of oxygen and nutrients that can reach your surgical site.
              This makes it much harder for your body to heal properly and significantly increases the risk of complications.
              Even small amounts of nicotine can have these effects.
            </p>
          </CardContent>
        </Card>

        {/* Specific Risks */}
        <Card className="border-2 border-red-100">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <h3 className="text-xl font-bold text-gray-800">Specific Risks You Face</h3>
            </div>
            <div className="space-y-3">
              {[
                "Complete implant failure requiring removal and replacement",
                "Wound healing problems, including wounds that won't close",
                "Loss of skin grafts or flaps",
                "Infection at the surgical site",
                "Need for additional surgeries",
                "Significant financial costs not covered by insurance"
              ].map((risk, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{risk}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Requirements */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <h3 className="text-xl font-bold text-orange-800">Required Timeline for Nicotine Cessation</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800 font-medium">
                  <strong>Before Surgery:</strong> Stop ALL nicotine use at least 3 weeks prior
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800 font-medium">
                  <strong>After Surgery:</strong> Continue nicotine-free until cleared by doctor
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800 font-medium">
                  <strong>Secondhand Smoke:</strong> Also avoid exposure throughout recovery
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Users className="h-6 w-6 text-green-600 flex-shrink-0" />
              <h3 className="text-xl font-bold text-green-800">Free Support Available - You Don't Have to Do This Alone</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Program:</span>
                  <span className="text-green-700">Commit to Quit!</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Organization:</span>
                  <span className="text-green-700">University of Rochester</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Phone:</span>
                  <span className="text-green-700 font-mono">(585) 602-0720</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Email:</span>
                  <span className="text-green-700 text-sm">healthyliving@urmc.rochester.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Format:</span>
                  <span className="text-green-700">6 virtual sessions</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Cost:</span>
                  <span className="text-green-700 font-bold">FREE - No referral needed</span>
                </div>
              </div>
            </div>
            <p className="text-green-700 text-sm mt-4 italic">
              For additional information, call the number provided above.
            </p>
          </CardContent>
        </Card>

        {/* Encouragement Message */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-3">You Can Do This!</h3>
              <p className="text-blue-700 leading-relaxed">
                Many of our patients have successfully quit nicotine before surgery. Taking this step not only improves
                your surgical outcome but also benefits your overall health. We're here to support you through this process.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Patient Understanding and Agreement */}
        <Card className="border-2 border-gray-300">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800">Patient Understanding and Agreement</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[
              { key: 'understandsNicotineEffects', text: 'I understand how nicotine affects surgical healing' },
              { key: 'understandsRisks', text: 'I understand the serious risks if I continue nicotine use' },
              { key: 'understandsTimeline', text: 'I understand I must stop all nicotine at least 3 weeks before surgery' },
              { key: 'understandsInsurance', text: 'I understand insurance may not cover complications from nicotine use' },
              { key: 'offeredResources', text: 'I have been offered resources to help me quit' },
              { key: 'takesResponsibility', text: 'I take responsibility for following these recommendations' }
            ].map((item) => (
              <div key={item.key} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    readOnly ? 'cursor-default' : 'cursor-pointer'
                  } transition-colors ${
                    formData[item.key as keyof typeof formData]
                      ? 'bg-blue-100'
                      : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                  }`}
                  onClick={readOnly ? undefined : () => handleCheckboxChange(item.key, !formData[item.key as keyof typeof formData])}
                >
                  {formData[item.key as keyof typeof formData] && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                    onClick={readOnly ? undefined : () => handleCheckboxChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    {item.text}
                  </Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="signatureDate" className="text-sm font-medium">Date *</Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>

              {/* Patient Signature */}
              <div className="space-y-2">
                {formData.patientSignature ? (
                  <SignaturePreview
                    signature={formData.patientSignature}
                    onEdit={readOnly ? undefined : () => !readOnly && setShowPatientSignatureDialog(true)}
                    onClear={readOnly ? undefined : handlePatientSignatureClear}
                    label="Patient Signature *"
                    readOnly={readOnly}
                  />
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={readOnly ? undefined : () => !readOnly && setShowPatientSignatureDialog(true)}
                      className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      disabled={readOnly}
                    >
                      {readOnly ? 'No Signature' : 'Click to Sign'}
                    </Button>
                    <Separator className="my-2" />
                    <Label className="text-sm font-medium text-center block">Patient Signature *</Label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Use Section */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800">For Office Use Only</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Signature Status</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    } transition-colors ${
                      formData.signedConsent === 'signed'
                        ? 'bg-blue-100'
                        : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                    }`}
                    onClick={readOnly ? undefined : () => handleInputChange('signedConsent', 'signed')}
                  >
                    {formData.signedConsent === 'signed' && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                      onClick={readOnly ? undefined : () => handleInputChange('signedConsent', 'signed')}
                    >
                      Signed consent form
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    } transition-colors ${
                      formData.signedConsent === 'refused'
                        ? 'bg-blue-100'
                        : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                    }`}
                    onClick={readOnly ? undefined : () => handleInputChange('signedConsent', 'refused')}
                  >
                    {formData.signedConsent === 'refused' && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                      onClick={readOnly ? undefined : () => handleInputChange('signedConsent', 'refused')}
                    >
                      Refused to sign (document reason in patient chart)
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {formData.signedConsent === 'refused' && (
              <div>
                <Label htmlFor="refusalReason" className="text-sm font-medium">Reason for Refusal</Label>
                <Input
                  id="refusalReason"
                  value={formData.refusalReason}
                  onChange={(e) => handleInputChange('refusalReason', e.target.value)}
                  placeholder="Document reason for refusal..."
                  disabled={readOnly}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {!readOnly ? (
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Update Informed Consent Form' : 'Save Informed Consent Form'}
            </Button>
          ) : (
            <Button type="button" disabled className="bg-gray-400 text-white">
              View Only
            </Button>
          )}
        </div>
      </form>

      {/* Signature Dialog */}
      {!readOnly && (
        <SignatureDialog
          isOpen={showPatientSignatureDialog}
          onClose={() => setShowPatientSignatureDialog(false)}
          onSave={handlePatientSignatureSave}
          title="Patient Signature"
          currentSignature={formData.patientSignature}
        />
      )}
    </div>
  );
}
