import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { FileText, User, CreditCard, Calendar, AlertTriangle, Check, DollarSign, Clock, Edit, Download } from "lucide-react";
import { toast } from "sonner";
import { generatePartialPaymentAgreementPdf } from "@/utils/partialPaymentAgreementPdfGenerator";

interface PartialPaymentAgreementFormProps {
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

export function PartialPaymentAgreementForm({
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
}: PartialPaymentAgreementFormProps) {
  const [formData, setFormData] = useState(() => {
    // The initialData comes from the service already converted to camelCase
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year from now
    const oneYearFromNow = futureDate.toISOString().split('T')[0];

    const initialFormData = {
      // Agreement Details
      agreementDate: initialData?.agreementDate || today,
      providerLicenseNumber: initialData?.providerLicenseNumber || "",

      // Patient Information
      firstName: initialData?.firstName || patientName.split(' ')[0] || "",
      lastName: initialData?.lastName || patientName.split(' ').slice(1).join(' ') || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",

      // Payment Details
      paymentAmount: initialData?.paymentAmount || "",
      paymentDate: initialData?.paymentDate || today,
      estimatedTotalCost: initialData?.estimatedTotalCost || "",
      remainingBalance: initialData?.remainingBalance || "",
      finalPaymentDueDate: initialData?.finalPaymentDueDate || oneYearFromNow,

      // Treatment Selection
      selectedTreatments: initialData?.selectedTreatments || [],

      // Patient Acknowledgments
      readAndUnderstood: initialData?.readAndUnderstood ?? false,
      understandRefundPolicy: initialData?.understandRefundPolicy ?? false,
      understandFullPaymentRequired: initialData?.understandFullPaymentRequired ?? false,
      agreeNoDisputes: initialData?.agreeNoDisputes ?? false,
      understandOneYearValidity: initialData?.understandOneYearValidity ?? false,
      understandNoCashPayments: initialData?.understandNoCashPayments ?? false,
      enteringVoluntarily: initialData?.enteringVoluntarily ?? false,

      // Signatures
      patientFullName: initialData?.patientFullName || patientName || "",
      patientSignature: initialData?.patientSignature || "",
      patientSignatureDate: initialData?.patientSignatureDate || today,
      providerRepName: initialData?.providerRepresentativeName || "",
      providerRepTitle: initialData?.providerRepresentativeTitle || "",
      practiceSignatureDate: initialData?.practiceSignatureDate || today
    };

    console.log('🏁 Initial Partial Payment Agreement form data setup:', {
      firstName: initialFormData.firstName,
      lastName: initialFormData.lastName,
      paymentAmount: initialFormData.paymentAmount,
      fromInitialData: !!initialData,
      initialDataId: initialData?.id,
      hasInitialData: !!initialData
    });

    return initialFormData;
  });

  const [hasFormData, setHasFormData] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);

  // Update form data when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('🔄 Updating form data with initialData for editing:', initialData);

      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const oneYearFromNow = futureDate.toISOString().split('T')[0];

      const updatedFormData = {
        // Agreement Details
        agreementDate: initialData.agreementDate || today,
        providerLicenseNumber: initialData.providerLicenseNumber || "",

        // Patient Information
        firstName: initialData.firstName || patientName.split(' ')[0] || "",
        lastName: initialData.lastName || patientName.split(' ').slice(1).join(' ') || "",
        address: initialData.address || "",
        email: initialData.email || "",
        phone: initialData.phone || "",

        // Payment Details
        paymentAmount: initialData.paymentAmount || "",
        paymentDate: initialData.paymentDate || today,
        estimatedTotalCost: initialData.estimatedTotalCost || "",
        remainingBalance: initialData.remainingBalance || "",
        finalPaymentDueDate: initialData.finalPaymentDueDate || oneYearFromNow,

        // Treatment Selection
        selectedTreatments: initialData.selectedTreatments || [],

        // Patient Acknowledgments
        readAndUnderstood: initialData.readAndUnderstood ?? false,
        understandRefundPolicy: initialData.understandRefundPolicy ?? false,
        understandFullPaymentRequired: initialData.understandFullPaymentRequired ?? false,
        agreeNoDisputes: initialData.agreeNoDisputes ?? false,
        understandOneYearValidity: initialData.understandOneYearValidity ?? false,
        understandNoCashPayments: initialData.understandNoCashPayments ?? false,
        enteringVoluntarily: initialData.enteringVoluntarily ?? false,

        // Signatures
        patientFullName: initialData.patientFullName || patientName || "",
        patientSignature: initialData.patientSignature || "",
        patientSignatureDate: initialData.patientSignatureDate || today,
        providerRepName: initialData.providerRepresentativeName || "",
        providerRepTitle: initialData.providerRepresentativeTitle || "",
        practiceSignatureDate: initialData.practiceSignatureDate || today
      };

      console.log('✅ Setting updated form data:', updatedFormData);
      setFormData(updatedFormData);
      setIsFormInitialized(true);
    }
  }, [initialData, isEditing, patientName]);

  // Treatment options
  const treatmentOptions = [
    "Wisdom Teeth Extraction",
    "Denture (Lower)",
    "Denture (Upper)",
    "Implant Supported Denture (Lower)",
    "Implant Supported Denture (Upper)",
    "Implant Supported Denture (Dual Arch)",
    "Fixed Implant Zirconia Bridge (Lower)",
    "Fixed Implant Zirconia Bridge (Upper)",
    "Fixed Implant Zirconia Bridge (Dual Arch)",
    "Single Implant",
    "Multiple Implants",
    "Extraction(s)",
    "Fixed Implant Nano-ceramic Bridge (Upper)",
    "Fixed Implant Nano-ceramic Bridge (Lower)",
    "Fixed Implant Nano-ceramic Bridge (Dual Arch)",
    "Surgical Revision",
    "Extractions and Implant Placement",
    "Lateral Window Sinus Lift"
  ];

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && initialData.id) {
      console.log('🔄 Updating Partial Payment Agreement form data from initialData:', initialData);
      console.log('🔍 isEditing:', isEditing, 'readOnly:', readOnly);

      // The initialData comes from the service with camelCase field names
      // We need to map them to the form's expected field names
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const oneYearFromNow = futureDate.toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        // Agreement Details
        agreementDate: initialData.agreementDate || prev.agreementDate || today,
        providerLicenseNumber: initialData.providerLicenseNumber || prev.providerLicenseNumber || "",

        // Patient Information
        firstName: initialData.firstName || prev.firstName || "",
        lastName: initialData.lastName || prev.lastName || "",
        address: initialData.address || prev.address || "",
        email: initialData.email || prev.email || "",
        phone: initialData.phone || prev.phone || "",

        // Payment Details
        paymentAmount: initialData.paymentAmount || prev.paymentAmount || "",
        paymentDate: initialData.paymentDate || prev.paymentDate || today,
        estimatedTotalCost: initialData.estimatedTotalCost || prev.estimatedTotalCost || "",
        remainingBalance: initialData.remainingBalance || prev.remainingBalance || "",
        finalPaymentDueDate: initialData.finalPaymentDueDate || prev.finalPaymentDueDate || oneYearFromNow,

        // Treatment Selection
        selectedTreatments: initialData.selectedTreatments || prev.selectedTreatments || [],

        // Agreement Acknowledgments (use ?? for boolean values to preserve false)
        readAndUnderstood: initialData.readAndUnderstood ?? prev.readAndUnderstood ?? false,
        understandRefundPolicy: initialData.understandRefundPolicy ?? prev.understandRefundPolicy ?? false,
        understandFullPaymentRequired: initialData.understandFullPaymentRequired ?? prev.understandFullPaymentRequired ?? false,
        agreeNoDisputes: initialData.agreeNoDisputes ?? prev.agreeNoDisputes ?? false,
        understandOneYearValidity: initialData.understandOneYearValidity ?? prev.understandOneYearValidity ?? false,
        understandNoCashPayments: initialData.understandNoCashPayments ?? prev.understandNoCashPayments ?? false,
        enteringVoluntarily: initialData.enteringVoluntarily ?? prev.enteringVoluntarily ?? false,

        // Signatures
        patientSignature: initialData.patientSignature || prev.patientSignature || "",
        patientSignatureDate: initialData.patientSignatureDate || prev.patientSignatureDate || today,
        patientFullName: initialData.patientFullName || prev.patientFullName || patientName || "",
        providerRepName: initialData.providerRepresentativeName || prev.providerRepName || "",
        providerRepTitle: initialData.providerRepresentativeTitle || prev.providerRepTitle || "",
        practiceSignatureDate: initialData.practiceSignatureDate || prev.practiceSignatureDate || today
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

    // Check if form has meaningful data (including address)
    const hasData = formData.firstName || formData.lastName || formData.paymentAmount ||
                   formData.estimatedTotalCost || formData.selectedTreatments?.length ||
                   formData.patientSignature || formData.email || formData.phone ||
                   formData.address || formData.providerLicenseNumber;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Auto-saving Partial Payment Agreement form with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        paymentAmount: formData.paymentAmount,
        estimatedTotalCost: formData.estimatedTotalCost,
        address: formData.address,
        providerLicenseNumber: formData.providerLicenseNumber,
        isFormInitialized: isFormInitialized
      });
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, isFormInitialized]);

  const handleInputChange = (field: string, value: any) => {
    if (!readOnly) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Format US phone number as (XXX) XXX-XXXX
  const formatUSPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format based on length
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleTreatmentChange = (treatment: string, checked: boolean) => {
    if (!readOnly) {
      setFormData(prev => ({
        ...prev,
        selectedTreatments: checked
          ? [...prev.selectedTreatments, treatment]
          : prev.selectedTreatments.filter(t => t !== treatment)
      }));
    }
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    if (!readOnly) {
      setFormData(prev => ({ ...prev, patientSignature: signatureData }));
    }
  };

  const handlePatientSignatureClear = () => {
    if (!readOnly) {
      setFormData(prev => ({ ...prev, patientSignature: "" }));
    }
  };

  const calculateRemainingBalance = () => {
    const total = parseFloat(formData.estimatedTotalCost) || 0;
    const payment = parseFloat(formData.paymentAmount) || 0;
    return total - payment;
  };

  // Auto-calculate remaining balance when payment amount or total cost changes
  useEffect(() => {
    const calculatedBalance = calculateRemainingBalance();
    if (calculatedBalance >= 0 && calculatedBalance !== parseFloat(formData.remainingBalance || "0")) {
      setFormData(prev => ({
        ...prev,
        remainingBalance: calculatedBalance.toFixed(2)
      }));
    }
  }, [formData.paymentAmount, formData.estimatedTotalCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (readOnly) return;

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required patient information fields');
      return;
    }

    if (!formData.paymentAmount || !formData.estimatedTotalCost || !formData.finalPaymentDueDate) {
      toast.error('Please fill in all required payment details');
      return;
    }

    if (formData.selectedTreatments.length === 0) {
      toast.error('Please select at least one treatment');
      return;
    }

    if (!formData.readAndUnderstood || !formData.understandRefundPolicy || 
        !formData.understandFullPaymentRequired || !formData.agreeNoDisputes ||
        !formData.understandOneYearValidity || !formData.understandNoCashPayments || 
        !formData.enteringVoluntarily) {
      toast.error('Please acknowledge all required items');
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
      agreement_date: isValidDate(formData.agreementDate) ? formData.agreementDate : currentDate,
      provider_license_number: formData.providerLicenseNumber,
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      payment_amount: formData.paymentAmount,
      payment_date: isValidDate(formData.paymentDate) ? formData.paymentDate : currentDate,
      estimated_total_cost: formData.estimatedTotalCost,
      remaining_balance: calculateRemainingBalance().toString(),
      final_payment_due_date: isValidDate(formData.finalPaymentDueDate) ? formData.finalPaymentDueDate : currentDate,
      selected_treatments: formData.selectedTreatments,
      read_and_understood: formData.readAndUnderstood,
      understand_refund_policy: formData.understandRefundPolicy,
      understand_full_payment_required: formData.understandFullPaymentRequired,
      agree_no_disputes: formData.agreeNoDisputes,
      understand_one_year_validity: formData.understandOneYearValidity,
      understand_no_cash_payments: formData.understandNoCashPayments,
      entering_voluntarily: formData.enteringVoluntarily,
      patient_signature: formData.patientSignature,
      patient_signature_date: isValidDate(formData.patientSignatureDate) ? formData.patientSignatureDate : currentDate,
      patient_full_name: formData.patientFullName,
      provider_representative_name: formData.providerRepName,
      provider_representative_title: formData.providerRepTitle,
      practice_signature_date: isValidDate(formData.practiceSignatureDate) ? formData.practiceSignatureDate : currentDate
    };

    onSubmit(submissionData);
    toast.success('Partial Payment Agreement form submitted successfully');
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
          <FileText className="h-5 w-5" />
          Partial Payment Agreement for Future Treatment
          {getAutoSaveIndicator() && (
            <div className="ml-auto">
              {getAutoSaveIndicator()}
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
              {/* Practice Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold mb-2">NEW YORK DENTAL IMPLANTS</h1>
                    <h2 className="text-lg mb-2">PARTIAL PAYMENT AGREEMENT FOR FUTURE TREATMENT</h2>
                    <div className="text-sm">
                      <p>344 North Main Street, Canandaigua, NY 14424</p>
                      <p>Phone: (585) 394-5910</p>
                    </div>
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
                </div>
              </div>

              {/* Agreement Parties Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Agreement Parties
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agreementDate">Agreement Date</Label>
                      <Input
                        id="agreementDate"
                        type="date"
                        value={formData.agreementDate}
                        onChange={(e) => handleInputChange('agreementDate', e.target.value)}
                        required
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold text-blue-800">Provider</Label>
                        <p className="text-sm mb-2">New York Dental Implants</p>
                        <Label htmlFor="providerLicenseNumber">License Number</Label>
                        <Input
                          id="providerLicenseNumber"
                          value={formData.providerLicenseNumber}
                          onChange={(e) => handleInputChange('providerLicenseNumber', e.target.value)}
                          placeholder="Enter license number"
                          disabled={readOnly}
                        />
                      </div>
                      <div>
                        <Label className="font-semibold text-blue-800">Patient</Label>
                        <p className="text-sm mb-2">{formData.firstName} {formData.lastName}</p>
                        <p className="text-xs text-gray-600">(To be completed below)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Terms Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    📋 Key Terms at a Glance
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-yellow-50 border-2 border-yellow-400 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">💰</div>
                      <p className="font-semibold text-yellow-800">Minimum</p>
                      <p className="text-sm">$350/month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <p className="font-semibold text-yellow-800">Goal</p>
                      <p className="text-sm">$3,200 minimum</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⏰</div>
                      <p className="font-semibold text-yellow-800">Valid for</p>
                      <p className="text-sm">1 year</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💳</div>
                      <p className="font-semibold text-yellow-800">Payment</p>
                      <p className="text-sm">No cash payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter full address"
                        required
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
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
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium">
                          🇺🇸 +1
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            const formatted = formatUSPhoneNumber(e.target.value);
                            handleInputChange('phone', formatted);
                          }}
                          placeholder="(555) 123-4567"
                          required
                          disabled={readOnly}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Structure & Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Payment Structure & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Fields */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Payment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentAmount">Amount of This Payment ($)</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={formData.paymentAmount}
                          onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                          placeholder="0.00"
                          required
                          disabled={readOnly}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentDate">Date of Payment</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={formData.paymentDate}
                          onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                          required
                          disabled={readOnly}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimatedTotalCost">Estimated Total Treatment Cost ($)</Label>
                        <Input
                          id="estimatedTotalCost"
                          type="number"
                          value={formData.estimatedTotalCost}
                          onChange={(e) => handleInputChange('estimatedTotalCost', e.target.value)}
                          placeholder="0.00"
                          required
                          disabled={readOnly}
                        />
                      </div>
                      <div>
                        <Label htmlFor="remainingBalance">Remaining Balance Due ($)</Label>
                        <Input
                          id="remainingBalance"
                          type="number"
                          value={calculateRemainingBalance()}
                          placeholder="Calculated automatically"
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="finalPaymentDueDate">Final Payment Due Date</Label>
                        <Input
                          id="finalPaymentDueDate"
                          type="date"
                          value={formData.finalPaymentDueDate}
                          onChange={(e) => handleInputChange('finalPaymentDueDate', e.target.value)}
                          required
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accepted Payment Methods */}
                  <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">Accepted Payment Methods</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">ACH Bank Transfer (Checking Account)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Debit Cards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Major Credit Cards (Visa, Mastercard, Amex, Discover)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">✗</span>
                        <span className="text-sm font-semibold">Cash installments NOT accepted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Treatment Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {treatmentOptions.map((treatment, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              readOnly ? 'cursor-default' : 'cursor-pointer'
                            } transition-colors ${
                              formData.selectedTreatments.includes(treatment)
                                ? 'bg-blue-100'
                                : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-blue-300' : ''}`
                            }`}
                            onClick={() => !readOnly && handleTreatmentChange(treatment, !formData.selectedTreatments.includes(treatment))}
                          >
                            {formData.selectedTreatments.includes(treatment) && (
                              <Check className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Label
                              className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800`}
                              onClick={() => !readOnly && handleTreatmentChange(treatment, !formData.selectedTreatments.includes(treatment))}
                            >
                              {treatment}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Select all treatments that this payment agreement covers. Multiple selections are allowed.
                  </p>
                </CardContent>
              </Card>

              {/* Timeline & Validity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    ⏱️ Important Timelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-purple-50 border-2 border-purple-500 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="font-semibold text-purple-800">Credit Valid For:</p>
                        <p className="text-sm">One (1) year from payment date</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏥</span>
                      <div>
                        <p className="font-semibold text-purple-800">Treatment Scheduling:</p>
                        <p className="text-sm">Based on provider availability after full payment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="font-semibold text-purple-800">Minimum Monthly Payment:</p>
                        <p className="text-sm">$350 until $3,200 minimum reached</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Refund Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* General Non-Refundable Policy */}
                  <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">General Policy: Non-Refundable</h4>
                    <p className="text-sm text-red-700 mb-3">Payments are generally non-refundable in the following circumstances:</p>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Patient chooses not to proceed with treatment</li>
                      <li>• Unable to complete payment schedule</li>
                      <li>• Personal or financial changes</li>
                      <li>• Wants different treatment than originally selected</li>
                    </ul>
                  </div>

                  {/* Exceptions - Refunds Available */}
                  <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">Exceptions - Refunds ARE Available If:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Provider is unable to perform the treatment</li>
                      <li>• Documented medical conditions make treatment unsafe</li>
                      <li>• Provider recommends different treatment (payment can transfer)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Acknowledgments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Check className="h-5 w-5 text-green-600" />
                    Patient Acknowledgment
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-gray-50 border border-gray-300 p-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.readAndUnderstood
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('readAndUnderstood', !formData.readAndUnderstood)}
                      >
                        {formData.readAndUnderstood && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('readAndUnderstood', !formData.readAndUnderstood)}
                        >
                          I have read and understood all terms of this agreement
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.understandRefundPolicy
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandRefundPolicy', !formData.understandRefundPolicy)}
                      >
                        {formData.understandRefundPolicy && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('understandRefundPolicy', !formData.understandRefundPolicy)}
                        >
                          I understand the refund policy and exceptions
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.understandFullPaymentRequired
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandFullPaymentRequired', !formData.understandFullPaymentRequired)}
                      >
                        {formData.understandFullPaymentRequired && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('understandFullPaymentRequired', !formData.understandFullPaymentRequired)}
                        >
                          I understand that full payment is required before treatment begins
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.agreeNoDisputes
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('agreeNoDisputes', !formData.agreeNoDisputes)}
                      >
                        {formData.agreeNoDisputes && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('agreeNoDisputes', !formData.agreeNoDisputes)}
                        >
                          I agree not to dispute legitimate charges
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.understandOneYearValidity
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandOneYearValidity', !formData.understandOneYearValidity)}
                      >
                        {formData.understandOneYearValidity && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('understandOneYearValidity', !formData.understandOneYearValidity)}
                        >
                          I understand the one-year validity period
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.understandNoCashPayments
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('understandNoCashPayments', !formData.understandNoCashPayments)}
                      >
                        {formData.understandNoCashPayments && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('understandNoCashPayments', !formData.understandNoCashPayments)}
                        >
                          I understand that no cash payments are accepted
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        } transition-colors ${
                          formData.enteringVoluntarily
                            ? 'bg-green-100'
                            : `border-2 border-gray-300 bg-white ${!readOnly ? 'hover:border-green-300' : ''}`
                        }`}
                        onClick={() => !readOnly && handleInputChange('enteringVoluntarily', !formData.enteringVoluntarily)}
                      >
                        {formData.enteringVoluntarily && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !readOnly && handleInputChange('enteringVoluntarily', !formData.enteringVoluntarily)}
                        >
                          I am entering this agreement voluntarily
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
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Provider Representative Section - Left Side */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="providerRepName">Practice Representative Name</Label>
                          <Input
                            id="providerRepName"
                            value={formData.providerRepName}
                            onChange={(e) => handleInputChange('providerRepName', e.target.value)}
                            placeholder="Enter representative name"
                            className="mt-1"
                            disabled={readOnly}
                          />
                        </div>
                        <div>
                          <Label htmlFor="providerRepTitle">Title</Label>
                          <Input
                            id="providerRepTitle"
                            value={formData.providerRepTitle}
                            onChange={(e) => handleInputChange('providerRepTitle', e.target.value)}
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
                            placeholder="Enter full name"
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
                              onEdit={readOnly ? undefined : () => setShowPatientSignatureDialog(true)}
                              onClear={readOnly ? undefined : handlePatientSignatureClear}
                              label="Patient Signature"
                              readOnly={readOnly}
                            />
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={readOnly ? undefined : () => setShowPatientSignatureDialog(true)}
                              className="w-64 h-20 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center gap-2"
                              disabled={readOnly}
                            >
                              <Edit className="h-4 w-4" />
                              {readOnly ? 'No Signature' : 'Sign Here'}
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

              {/* Legal Footer */}
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-2">
                  This Agreement is legally binding and governed by the laws of the State of New York.
                </p>
                <p className="text-xs text-gray-600">
                  A copy of this signed agreement will be provided to the patient.
                </p>
              </div>
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
                  {isEditing ? 'Update Form' : 'Submit'}
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
