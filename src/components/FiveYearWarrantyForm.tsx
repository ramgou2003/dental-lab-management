import { useState, useEffect, useRef } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { Shield, User, CheckCircle, Edit, Building2, Check, DollarSign, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

interface FiveYearWarrantyFormProps {
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
  setAutoSaveStatus?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setAutoSaveMessage?: (message: string) => void;
}

export function FiveYearWarrantyForm({
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
  setAutoSaveStatus,
  setAutoSaveMessage
}: FiveYearWarrantyFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    firstName: initialData?.first_name || patientName.split(' ')[0] || "",
    lastName: initialData?.last_name || patientName.split(' ').slice(1).join(' ') || "",
    dateOfBirth: initialData?.date_of_birth || patientDateOfBirth,
    phone: initialData?.phone || "",
    email: initialData?.email || "",

    // Warranty Plan Acknowledgments
    understandOptionalPlan: initialData?.understand_optional_plan || false,
    understandMonthlyCost: initialData?.understand_monthly_cost || false,
    understandCoverageDetails: initialData?.understand_coverage_details || false,
    understandPaymentProcess: initialData?.understand_payment_process || false,
    questionsAnswered: initialData?.questions_answered || false,
    voluntarilyEnrolling: initialData?.voluntarily_enrolling || false,
    coverageBeginsAfterPayment: initialData?.coverage_begins_after_payment || false,

    // Payment Authorization
    authorizePayment: initialData?.authorize_payment || false,

    // Signatures
    patientFullName: initialData?.patient_full_name || patientName,
    patientSignature: initialData?.patient_signature || "",
    patientSignatureDate: initialData?.patient_signature_date || new Date().toISOString().split('T')[0],
    practiceRepName: initialData?.practice_representative_name || "",
    practiceRepTitle: initialData?.practice_representative_title || "",
    practiceSignatureDate: initialData?.practice_signature_date || new Date().toISOString().split('T')[0]
  });

  // Signature dialog states
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔍 FiveYearWarrantyForm - initialData received:', initialData);
    if (initialData) {
      console.log('🔄 FiveYearWarrantyForm - Mapping database fields to form fields');
      // Map database fields to form fields
      setFormData(prev => ({
        ...prev,
        firstName: initialData.first_name || prev.firstName,
        lastName: initialData.last_name || prev.lastName,
        dateOfBirth: initialData.date_of_birth || prev.dateOfBirth,
        phone: initialData.phone || prev.phone,
        email: initialData.email || prev.email,
        understandOptionalPlan: initialData.understand_optional_plan || prev.understandOptionalPlan,
        understandMonthlyCost: initialData.understand_monthly_cost || prev.understandMonthlyCost,
        understandCoverageDetails: initialData.understand_coverage_details || prev.understandCoverageDetails,
        understandPaymentProcess: initialData.understand_payment_process || prev.understandPaymentProcess,
        questionsAnswered: initialData.questions_answered || prev.questionsAnswered,
        voluntarilyEnrolling: initialData.voluntarily_enrolling || prev.voluntarilyEnrolling,
        coverageBeginsAfterPayment: initialData.coverage_begins_after_payment || prev.coverageBeginsAfterPayment,
        authorizePayment: initialData.authorize_payment || prev.authorizePayment,
        patientFullName: `${initialData.first_name || ''} ${initialData.last_name || ''}`.trim() || prev.patientFullName,
        patientSignature: initialData.patient_signature || prev.patientSignature,
        patientSignatureDate: initialData.patient_signature_date || prev.patientSignatureDate,
        practiceRepName: initialData.practice_representative_name || prev.practiceRepName,
        practiceRepTitle: initialData.practice_representative_title || prev.practiceRepTitle,
        practiceSignatureDate: initialData.practice_signature_date || prev.practiceSignatureDate
      }));
    }
  }, [initialData]);

  // Auto-save effect
  useEffect(() => {
    if (readOnly || !onAutoSave) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (setAutoSaveStatus) {
        setAutoSaveStatus('saving');
      }
      if (setAutoSaveMessage) {
        setAutoSaveMessage('Auto-saving changes...');
      }
      onAutoSave(formData);
    }, 2000); // Auto-save after 2 seconds of inactivity

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, readOnly, onAutoSave, setAutoSaveStatus, setAutoSaveMessage]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    setFormData(prev => ({ ...prev, patientSignature: signatureData }));
  };

  const handlePatientSignatureClear = () => {
    setFormData(prev => ({ ...prev, patientSignature: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone || !formData.email) {
      toast.error('Please fill in all required patient information fields');
      return;
    }

    if (!formData.understandOptionalPlan || !formData.understandMonthlyCost ||
        !formData.understandCoverageDetails || !formData.understandPaymentProcess ||
        !formData.questionsAnswered || !formData.voluntarilyEnrolling ||
        !formData.coverageBeginsAfterPayment) {
      toast.error('Please acknowledge all required warranty plan items');
      return;
    }

    if (!formData.authorizePayment) {
      toast.error('Payment authorization is required to proceed');
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
      date_of_birth: isValidDate(formData.dateOfBirth) ? formData.dateOfBirth : currentDate,
      phone: formData.phone,
      email: formData.email,
      understand_optional_plan: formData.understandOptionalPlan,
      understand_monthly_cost: formData.understandMonthlyCost,
      understand_coverage_details: formData.understandCoverageDetails,
      understand_payment_process: formData.understandPaymentProcess,
      questions_answered: formData.questionsAnswered,
      voluntarily_enrolling: formData.voluntarilyEnrolling,
      coverage_begins_after_payment: formData.coverageBeginsAfterPayment,
      authorize_payment: formData.authorizePayment,
      patient_signature: formData.patientSignature,
      patient_signature_date: isValidDate(formData.patientSignatureDate) ? formData.patientSignatureDate : currentDate,
      practice_representative_name: formData.practiceRepName,
      practice_representative_title: formData.practiceRepTitle,
      practice_signature_date: isValidDate(formData.practiceSignatureDate) ? formData.practiceSignatureDate : currentDate
    };

    onSubmit(submissionData);
    toast.success('5-Year Extended Warranty Plan form submitted successfully');
  };

  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
      case 'saved':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Fixed Header - Full Width */}
      <DialogHeader className="flex-shrink-0 mb-3 w-full px-3 py-2">
        <DialogTitle className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          5-Year Extended Warranty Plan
          {(autoSaveStatus !== 'idle' || autoSaveMessage) && (
            <div className="ml-auto flex items-center gap-2">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Auto-saving changes...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Changes saved</span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">{autoSaveMessage || 'Save error'}</span>
                </div>
              )}
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      {/* Content Container with full width */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-hidden px-6">
            <div className="space-y-6 h-full overflow-y-auto scrollbar-hidden">
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
                        disabled={readOnly}
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
                        disabled={readOnly}
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
                        disabled={readOnly}
                        readOnly={!!patientDateOfBirth}
                        className={patientDateOfBirth ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        required
                        disabled={readOnly}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warranty Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Warranty Plan Investment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Investment Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      5-Year Extended Warranty Plan
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">$150</p>
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">5%</p>
                        <p className="text-sm text-gray-600">Processing Fee</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">5</p>
                        <p className="text-sm text-gray-600">Years Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">$9,000</p>
                        <p className="text-sm text-gray-600">Total Investment</p>
                      </div>
                    </div>
                  </div>

                  {/* Value Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <h4 className="font-semibold text-red-800 mb-2">Without Warranty</h4>
                      <p className="text-3xl font-bold text-red-600">$6,500</p>
                      <p className="text-sm text-red-600">Average repair cost</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <h4 className="font-semibold text-green-800 mb-2">With This Plan</h4>
                      <p className="text-3xl font-bold text-green-600">$150/mo</p>
                      <p className="text-sm text-green-600">Complete protection</p>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="font-semibold text-green-800">
                      95% of our warranty patients avoid major out-of-pocket repairs
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Warranty Plan Acknowledgments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Warranty Plan Acknowledgments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.understandOptionalPlan
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandOptionalPlan', !formData.understandOptionalPlan)}
                      >
                        {formData.understandOptionalPlan && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('understandOptionalPlan', !formData.understandOptionalPlan)}
                        >
                          I understand this is an optional 5-year extended warranty plan
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.understandMonthlyCost
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandMonthlyCost', !formData.understandMonthlyCost)}
                      >
                        {formData.understandMonthlyCost && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('understandMonthlyCost', !formData.understandMonthlyCost)}
                        >
                          I understand the cost is $150/month plus 5% processing fee
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.understandCoverageDetails
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandCoverageDetails', !formData.understandCoverageDetails)}
                      >
                        {formData.understandCoverageDetails && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('understandCoverageDetails', !formData.understandCoverageDetails)}
                        >
                          I understand the coverage details and limitations
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.understandPaymentProcess
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandPaymentProcess', !formData.understandPaymentProcess)}
                      >
                        {formData.understandPaymentProcess && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('understandPaymentProcess', !formData.understandPaymentProcess)}
                        >
                          I understand the automatic payment process
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.questionsAnswered
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('questionsAnswered', !formData.questionsAnswered)}
                      >
                        {formData.questionsAnswered && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('questionsAnswered', !formData.questionsAnswered)}
                        >
                          All my questions have been answered satisfactorily
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.voluntarilyEnrolling
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('voluntarilyEnrolling', !formData.voluntarilyEnrolling)}
                      >
                        {formData.voluntarilyEnrolling && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('voluntarilyEnrolling', !formData.voluntarilyEnrolling)}
                        >
                          I am voluntarily enrolling in this warranty plan
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          formData.coverageBeginsAfterPayment
                            ? 'bg-blue-100'
                            : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => !readOnly && handleInputChange('coverageBeginsAfterPayment', !formData.coverageBeginsAfterPayment)}
                      >
                        {formData.coverageBeginsAfterPayment && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className="text-sm font-medium cursor-pointer text-blue-800"
                          onClick={() => !readOnly && handleInputChange('coverageBeginsAfterPayment', !formData.coverageBeginsAfterPayment)}
                        >
                          I understand coverage begins after the first successful payment
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Authorization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Payment Authorization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        formData.authorizePayment
                          ? 'bg-green-100'
                          : 'border-2 border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => !readOnly && handleInputChange('authorizePayment', !formData.authorizePayment)}
                    >
                      {formData.authorizePayment && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label
                        className="text-sm font-medium cursor-pointer text-green-800"
                        onClick={() => !readOnly && handleInputChange('authorizePayment', !formData.authorizePayment)}
                      >
                        <strong>I authorize New York Dental Implants</strong> to charge my payment method $150 monthly
                        plus 5% processing fee for the 5-Year Extended Warranty Plan.
                      </Label>
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
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Practice Representative Section - Left Side */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="practiceRepName">Practice Representative Name</Label>
                          <Input
                            id="practiceRepName"
                            value={formData.practiceRepName}
                            onChange={(e) => handleInputChange('practiceRepName', e.target.value)}
                            placeholder="Enter representative name"
                            className="mt-1"
                            disabled={readOnly}
                          />
                        </div>
                        <div>
                          <Label htmlFor="practiceRepTitle">Title</Label>
                          <Input
                            id="practiceRepTitle"
                            value={formData.practiceRepTitle}
                            onChange={(e) => handleInputChange('practiceRepTitle', e.target.value)}
                            placeholder="Enter job title"
                            className="mt-1"
                            disabled={readOnly}
                          />
                        </div>
                        <div>
                          <Label htmlFor="practiceSignatureDate">Date</Label>
                          <Input
                            id="practiceSignatureDate"
                            type="date"
                            value={formData.practiceSignatureDate}
                            onChange={(e) => handleInputChange('practiceSignatureDate', e.target.value)}
                            className="mt-1"
                            disabled={readOnly}
                          />
                        </div>
                      </div>
                    </div>

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
                            disabled={readOnly}
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
                            disabled={readOnly}
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
                              disabled={readOnly}
                            >
                              <Edit className="h-4 w-4" />
                              Sign Here
                            </Button>
                          )}
                        </div>

                        {/* Separator below signature */}
                        <Separator className="w-64 my-6" />

                        {/* Patient Signature Label */}
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600 font-medium">Patient Signature</p>
                        </div>
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

      {/* Signature Dialog */}
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

