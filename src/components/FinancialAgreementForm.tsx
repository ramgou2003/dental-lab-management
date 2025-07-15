import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { FileText, User, Calendar, DollarSign, CreditCard, Shield, CheckCircle, Edit } from "lucide-react";

interface FinancialAgreementFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
}

export function FinancialAgreementForm({ onSubmit, onCancel, patientName = "" }: FinancialAgreementFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: patientName,
    dateOfBirth: "",
    
    // Treatment and Financial Information
    acceptedTreatment: [] as string[],
    totalCostOfTreatment: "",
    patientPayment: "",
    remainingBalanceDue: "",
    remainingBalance: "",
    paymentMethod: "",
    thirdPartyFinanceCompany: "",
    fiveYearWarrantyEndDate: "",
    chlorhexidineProgram: "",
    additionalNotes: "",
    
    // Agreement Acknowledgment
    termsAgreed: false,

    // Signatures
    patientSignature: "",
    patientSignatureDate: new Date().toISOString().split('T')[0]
  });

  // Treatment options from the reference document
  const treatmentOptions = [
    "Implant Supported Denture (Lower)",
    "Implant Supported Denture (Upper)",
    "Implant Supported Denture (Dual Arch)",
    "Surgical Revision",
    "Extraction(s)",
    "Fixed Implant Nano-ceramic Bridge (Dual Arch)",
    "Multiple Implants",
    "Extractions and Implant Placement",
    "Fixed Implant Nano-ceramic Bridge (Lower)",
    "Wisdom Teeth Extraction",
    "Fixed Implant Nano-ceramic Bridge (Upper)",
    "Single Implant",
    "Denture (Upper)",
    "Denture (Lower)",
    "Fixed Implant Zirconia Bridge (Upper)",
    "Fixed Implant Zirconia Bridge (Lower)",
    "Fixed Implant Zirconia Bridge (Dual Arch)"
  ];

  // Auto-sync patient name when it changes
  useEffect(() => {
    if (patientName && patientName !== formData.patientName) {
      setFormData(prev => ({ ...prev, patientName: patientName }));
    }
  }, [patientName, formData.patientName]);

  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentChange = (treatment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptedTreatment: checked
        ? [...prev.acceptedTreatment, treatment]
        : prev.acceptedTreatment.filter(t => t !== treatment)
    }));
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, patientSignature: signatureData }));
    setShowPatientSignatureDialog(false);
  };

  const handlePatientSignatureClear = () => {
    setFormData(prev => ({ ...prev, patientSignature: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Financial Agreement
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
                <Label htmlFor="patientName" className="text-sm font-semibold">
                  <span className="text-red-500">*</span> Patient Name
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Treatment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Accepted Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {treatmentOptions.map((treatment) => (
                <button
                  key={treatment}
                  type="button"
                  onClick={() => handleTreatmentChange(treatment, !formData.acceptedTreatment.includes(treatment))}
                  className={`
                    relative p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                    ${formData.acceptedTreatment.includes(treatment)
                      ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium pr-2">{treatment}</span>
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${formData.acceptedTreatment.includes(treatment)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                      }
                    `}>
                      {formData.acceptedTreatment.includes(treatment) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalCostOfTreatment">Total Cost of Treatment</Label>
                <Input
                  id="totalCostOfTreatment"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalCostOfTreatment}
                  onChange={(e) => handleInputChange('totalCostOfTreatment', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patientPayment">Patient Payment</Label>
                <Input
                  id="patientPayment"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.patientPayment}
                  onChange={(e) => handleInputChange('patientPayment', e.target.value)}
                />
              </div>
            </div>

            {/* Remaining Balance Due */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Is there a remaining balance due?</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('remainingBalanceDue', 'yes')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    formData.remainingBalanceDue === 'yes'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('remainingBalanceDue', 'no')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    formData.remainingBalanceDue === 'no'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {formData.remainingBalanceDue === 'yes' && (
              <div>
                <Label htmlFor="remainingBalance">Remaining Balance</Label>
                <Input
                  id="remainingBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.remainingBalance}
                  onChange={(e) => handleInputChange('remainingBalance', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Payment Method</Label>
              <div className="space-y-2">
                {[
                  { value: 'payment-in-full-cash', label: 'Payment in Full - Cash' },
                  { value: 'third-party-financing', label: 'Third Party Financing' },
                  { value: 'cash-and-third-party-financing', label: 'Cash and Third Party Financing' }
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleInputChange('paymentMethod', method.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                      formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.label}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.paymentMethod === method.value && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {(formData.paymentMethod === 'third-party-financing' || formData.paymentMethod === 'cash-and-third-party-financing') && (
              <div className="mt-4">
                <Label htmlFor="thirdPartyFinanceCompany">Third Party Finance Company</Label>
                <Input
                  id="thirdPartyFinanceCompany"
                  value={formData.thirdPartyFinanceCompany}
                  onChange={(e) => handleInputChange('thirdPartyFinanceCompany', e.target.value)}
                  placeholder="Enter finance company name"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warranty and Program Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              Warranty & Program Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fiveYearWarrantyEndDate">5 Year Warranty End Date</Label>
              <Input
                id="fiveYearWarrantyEndDate"
                type="date"
                value={formData.fiveYearWarrantyEndDate}
                onChange={(e) => handleInputChange('fiveYearWarrantyEndDate', e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Does the patient agree to participating in the Chlorhexidine Program?</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('chlorhexidineProgram', 'yes')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    formData.chlorhexidineProgram === 'yes'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('chlorhexidineProgram', 'no')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    formData.chlorhexidineProgram === 'no'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clauses and Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-semibold mb-2 text-amber-800">Remaining Balance Clause:</p>
                <p className="text-amber-700">
                  Patients understand that this payment, <strong>"Patient Payment"</strong> does not cover the full length of the treatment.
                  To complete the full treatment, the remaining balance must be paid upfront. I acknowledge and agree to these terms for my treatment.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold mb-2 text-blue-800">Financial Consideration Clause:</p>
                <p className="text-blue-700 italic">
                  Oral health treatment is an excellent investment in your medical and psychological well-being.
                  It is understood that financial considerations are always part of deciding what works best for you.
                  We advise that you have a financial plan in place to account for the fee involved with your treatment.
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold mb-2 text-red-800">Lab Fee:</p>
                <p className="text-red-700">
                  A <strong>$10,000 non-refundable fee</strong> is charged once records are submitted to the lab.
                  This fee was discussed with me and I agree to pursue treatment at this time.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 italic">
                  I have read and understood the office financial policy. I am responsible for payment of all fees for myself or my dependents.
                  <strong> There is a 5-year Peace of Mind Guarantee contingent on coming for regular oral health appointments every 6 months.</strong>
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-700 italic">
                  I have read and agreed to all terms discussed in this agreement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Acknowledgment */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Checkbox
                id="termsAgreed"
                checked={formData.termsAgreed}
                onCheckedChange={(checked) => handleInputChange('termsAgreed', checked as boolean)}
                className="mt-1"
                required
              />
              <div className="flex-1">
                <Label htmlFor="termsAgreed" className="text-sm font-medium cursor-pointer text-blue-800">
                  <span className="text-red-500">*</span> I have read and agreed to all terms discussed in this agreement.
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              Patient Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient Signature</Label>
                <div className="mt-1">
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
                      className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Sign Here
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="patientSignatureDate">Date Signed</Label>
                <Input
                  id="patientSignatureDate"
                  type="date"
                  value={formData.patientSignatureDate}
                  onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                  required
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
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Financial Agreement
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
    </div>
  );
}
