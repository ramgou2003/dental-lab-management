import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SignatureDialog } from "@/components/SignatureDialog";
import {
  Clock,
  CreditCard,
  Package,
  Calendar,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Check,
  Edit,
  AlertCircle
} from "lucide-react";

interface ThreeYearCarePackageFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  isViewing?: boolean;
  // Auto-save props
  onAutoSave?: (formData: any) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  autoSaveMessage?: string;
  lastSavedTime?: string;
  setAutoSaveStatus?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setAutoSaveMessage?: (message: string) => void;
}

export function ThreeYearCarePackageForm({
  onSubmit,
  onCancel,
  patientName = "",
  patientDateOfBirth = "",
  initialData,
  isEditing = false,
  isViewing = false,
  onAutoSave,
  autoSaveStatus = 'idle',
  autoSaveMessage = '',
  lastSavedTime = '',
  setAutoSaveStatus,
  setAutoSaveMessage
}: ThreeYearCarePackageFormProps) {
  const readOnly = isViewing;
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);
  const [showWitnessSignatureDialog, setShowWitnessSignatureDialog] = useState(false);

  const [formData, setFormData] = useState(() => {
    const initialFormData = {
      // Patient Information
      patientName: initialData?.patientName || patientName,
      dateOfBirth: initialData?.dateOfBirth || patientDateOfBirth || "",
      enrollmentDate: initialData?.enrollmentDate || new Date().toISOString().split('T')[0],
      enrollmentTime: initialData?.enrollmentTime || new Date().toTimeString().slice(0, 5),

    // Daily Care Requirements Acknowledgment
    chlorhexidineRinse: initialData?.chlorhexidineRinse || false,
    waterFlosser: initialData?.waterFlosser || false,
    electricToothbrush: initialData?.electricToothbrush || false,
    attendCheckups: initialData?.attendCheckups || false,

    // Enrollment Choice
    enrollmentChoice: initialData?.enrollmentChoice || "", // "enroll" or "defer"

    // Payment Method
    paymentMethod: initialData?.paymentMethod || "",

    // Legal Acknowledgments
    cancellationPolicy: initialData?.cancellationPolicy || false,
    governingLaw: initialData?.governingLaw || false,
    arbitrationClause: initialData?.arbitrationClause || false,
    hipaaConsent: initialData?.hipaaConsent || false,

    // Signatures
    patientSignature: initialData?.patientSignature || "",
    patientSignatureDate: initialData?.patientSignatureDate || new Date().toISOString().split('T')[0],
    witnessName: initialData?.witnessName || "",
    witnessSignature: initialData?.witnessSignature || "",
    witnessSignatureDate: initialData?.witnessSignatureDate || new Date().toISOString().split('T')[0],

    // Age/Language Confirmation
    ageConfirmation: initialData?.ageConfirmation || false,
    languageConfirmation: initialData?.languageConfirmation || false,

    // Acknowledgment
    acknowledgmentRead: initialData?.acknowledgmentRead || false,

      // Staff Use
      staffProcessedBy: initialData?.staffProcessedBy || "",
      staffProcessedDate: initialData?.staffProcessedDate || ""
    };

    console.log('🏁 Initial form data setup:', {
      patientName: initialFormData.patientName,
      fromInitialData: initialData?.patientName,
      fromPatientName: patientName,
      hasInitialData: !!initialData,
      initialDataId: initialData?.id
    });

    return initialFormData;
  });

  const [hasFormData, setHasFormData] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && initialData.id) {
      console.log('🔄 Updating 3-Year Care Package form data from initialData:', initialData);
      console.log('🔍 isEditing:', isEditing, 'isViewing:', isViewing);
      setFormData(prev => ({
        ...prev,
        // Patient Information
        patientName: initialData.patientName || prev.patientName,
        dateOfBirth: initialData.dateOfBirth || prev.dateOfBirth,
        enrollmentDate: initialData.enrollmentDate || prev.enrollmentDate,
        enrollmentTime: initialData.enrollmentTime || prev.enrollmentTime,

        // Daily Care Requirements Acknowledgment
        chlorhexidineRinse: initialData.chlorhexidineRinse ?? prev.chlorhexidineRinse,
        waterFlosser: initialData.waterFlosser ?? prev.waterFlosser,
        electricToothbrush: initialData.electricToothbrush ?? prev.electricToothbrush,
        attendCheckups: initialData.attendCheckups ?? prev.attendCheckups,

        // Enrollment Choice
        enrollmentChoice: initialData.enrollmentChoice || prev.enrollmentChoice,

        // Payment Method
        paymentMethod: initialData.paymentMethod || prev.paymentMethod,

        // Legal Acknowledgments
        cancellationPolicy: initialData.cancellationPolicy ?? prev.cancellationPolicy,
        governingLaw: initialData.governingLaw ?? prev.governingLaw,
        arbitrationClause: initialData.arbitrationClause ?? prev.arbitrationClause,
        hipaaConsent: initialData.hipaaConsent ?? prev.hipaaConsent,

        // Signatures
        patientSignature: initialData.patientSignature || prev.patientSignature,
        patientSignatureDate: initialData.patientSignatureDate || prev.patientSignatureDate,
        witnessName: initialData.witnessName || prev.witnessName,
        witnessSignature: initialData.witnessSignature || prev.witnessSignature,
        witnessSignatureDate: initialData.witnessSignatureDate || prev.witnessSignatureDate,

        // Age/Language Confirmation
        ageConfirmation: initialData.ageConfirmation ?? prev.ageConfirmation,
        languageConfirmation: initialData.languageConfirmation ?? prev.languageConfirmation,

        // Acknowledgment
        acknowledgmentRead: initialData.acknowledgmentRead ?? prev.acknowledgmentRead,

        // Staff Use
        staffProcessedBy: initialData.staffProcessedBy || prev.staffProcessedBy,
        staffProcessedDate: initialData.staffProcessedDate || prev.staffProcessedDate
      }));
    }
  }, [initialData?.id]); // Trigger when form ID changes

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!onAutoSave || readOnly) return;

    // Check if form has meaningful data
    const hasData = formData.patientName || formData.enrollmentChoice ||
                   formData.paymentMethod || formData.chlorhexidineRinse ||
                   formData.waterFlosser || formData.electricToothbrush ||
                   formData.attendCheckups || formData.cancellationPolicy ||
                   formData.governingLaw || formData.arbitrationClause ||
                   formData.hipaaConsent || formData.patientSignature ||
                   formData.witnessSignature;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Auto-saving 3-Year Care Package form with data:', {
        patientName: formData.patientName,
        enrollmentChoice: formData.enrollmentChoice,
        paymentMethod: formData.paymentMethod
      });
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, readOnly]);

  const handleInputChange = (field: string, value: any) => {
    if (!readOnly) {
      console.log(`🔄 Form field changed: ${field} = ${value}`);
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };
        console.log('📝 Updated form data:', { [field]: value, patientName: newData.patientName });
        return newData;
      });
    }
  };

  const handlePatientSignatureSave = (signatureData: string) => {
    if (!readOnly) {
      handleInputChange('patientSignature', signatureData);
      setShowPatientSignatureDialog(false);
    }
  };

  const handlePatientSignatureClear = () => {
    if (!readOnly) {
      handleInputChange('patientSignature', '');
    }
  };

  const handleWitnessSignatureSave = (signatureData: string) => {
    if (!readOnly) {
      handleInputChange('witnessSignature', signatureData);
      setShowWitnessSignatureDialog(false);
    }
  };

  const handleWitnessSignatureClear = () => {
    if (!readOnly) {
      handleInputChange('witnessSignature', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (readOnly) return;
    console.log('🚀 3-Year Care Package form handleSubmit called');
    console.log('🔍 Current formData:', JSON.stringify(formData, null, 2));
    console.log('🔍 Patient name:', formData.patientName);
    console.log('🔍 Enrollment choice:', formData.enrollmentChoice);
    console.log('🔍 Payment method:', formData.paymentMethod);
    console.log('🔍 Form data has values:', Object.keys(formData).filter(key => formData[key] && formData[key] !== ""));

    // Validate that we have some data before submitting
    if (!formData.patientName) {
      console.error('❌ No patient name in form data - something is wrong!');
    }

    onSubmit(formData);
  };

  const paymentSchedule = [
    { payment: 1, amount: 345, due: "Due at enrollment" },
    { payment: 2, amount: 345, due: "Month 3" },
    { payment: 3, amount: 345, due: "Month 6" },
    { payment: 4, amount: 345, due: "Month 9" },
    { payment: 5, amount: 345, due: "Month 12" },
    { payment: 6, amount: 345, due: "Month 15" },
    { payment: 7, amount: 345, due: "Month 18" },
    { payment: 8, amount: 345, due: "Month 21" },
    { payment: 9, amount: 345, due: "Month 24" },
    { payment: 10, amount: 345, due: "Month 27" }
  ];

  const packageContents = [
    "12 bottles of chlorhexidine rinse",
    "Oral-B electric toothbrush + head",
    "Oral-B water flosser",
    "Crest toothpaste",
    "Super-floss",
    "Interproximal brushes"
  ];

  // Calculate expiration date (3 years from enrollment date)
  const calculateExpirationDate = (enrollmentDate: string) => {
    if (!enrollmentDate) return '';

    const enrollment = new Date(enrollmentDate);
    const expiration = new Date(enrollment);
    expiration.setFullYear(expiration.getFullYear() + 3);

    return expiration.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold mb-2">NEW YORK DENTAL IMPLANTS</h1>
              <h2 className="text-xl font-semibold mb-1">3-Year Care Package Enrollment Agreement</h2>
              <p className="text-sm opacity-90">Form Version 2.0 | Effective 07/2025</p>
            </div>

            {/* Auto-save Status Indicator */}
            {onAutoSave && !isViewing && (hasFormData || autoSaveStatus === 'error') && (
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
        </div>

        {/* Urgent Deadline Warning */}
        <Card className="border-yellow-400 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Important Deadline</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  <strong>Must enroll by one-week post-op visit</strong>
                </p>
                <p className="text-sm text-yellow-700">
                  Missing deadline = no warranty, pay full price for repairs ($5,000-$15,000)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Enter patient name"
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
                />
              </div>
              <div>
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="enrollmentTime">Enrollment Time</Label>
                <Input
                  id="enrollmentTime"
                  type="time"
                  value={formData.enrollmentTime}
                  onChange={(e) => handleInputChange('enrollmentTime', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WITH Care Package */}
          <Card className="border-green-400 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                WITH Care Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Full 3-year warranty coverage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  All supplies included ($3,800+ value)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Priority scheduling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  80% lower complication rate
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Free adjustments & repairs
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* WITHOUT Care Package */}
          <Card className="border-red-400 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                WITHOUT Care Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  NO warranty protection
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Buy supplies yourself
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Standard scheduling only
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Higher risk of problems
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Pay full price for repairs
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment Schedule */}
        <Card className="border-blue-400 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CreditCard className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-lg font-semibold text-blue-800">
                Total Investment: $3,450 (10 payments of $345)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paymentSchedule.map((payment) => (
                <div key={payment.payment} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">
                    Payment #{payment.payment}
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    ${payment.amount}
                  </div>
                  <div className="text-xs text-blue-600">
                    {payment.due}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              What's Included in Each Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {packageContents.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Your Care Package Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Single row timeline with all 10 packages */}
              <div className="relative px-8 py-6">
                <div className="flex justify-between items-start relative">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                      {/* Connecting line segment - only show for first 9 circles */}
                      {i < 9 && (
                        <div className="absolute top-6 left-6 w-full h-0.5 bg-blue-400 z-0"></div>
                      )}
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 shadow-lg text-sm relative z-10">
                        {i + 1}
                      </div>
                      <div className="text-xs text-center text-gray-600 max-w-[70px]">
                        <div className="font-semibold text-blue-800">Package {i + 1}</div>
                        <div className="text-gray-500">{i === 0 ? 'Enrollment' : `Month ${i * 3}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline description */}
              <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg mt-4">
                <p className="font-medium text-blue-800">Your 3-Year Care Journey</p>
                <p>Receive a comprehensive care package every 3 months to maintain your dental implants</p>
                {formData.enrollmentDate && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="font-semibold text-blue-900">
                      Package Expiration Date: {calculateExpirationDate(formData.enrollmentDate)}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your care package coverage ends 3 years from enrollment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Care Requirements */}
        <Card className="border-yellow-400 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <CheckCircle className="h-5 w-5" />
              Daily Care Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.chlorhexidineRinse
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-yellow-50 border-yellow-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('chlorhexidineRinse', !formData.chlorhexidineRinse)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.chlorhexidineRinse
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-yellow-400 bg-white'
                  }`}
                >
                  {formData.chlorhexidineRinse && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-yellow-800 leading-relaxed`}
                  >
                    <strong>Rinse with chlorhexidine:</strong>
                    <br />
                    <span className="text-xs text-yellow-700">
                      First 90 days: 5 times daily (15ml each) | After 90 days: 3 times daily
                    </span>
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.waterFlosser
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-yellow-50 border-yellow-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('waterFlosser', !formData.waterFlosser)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.waterFlosser
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-yellow-400 bg-white'
                  }`}
                >
                  {formData.waterFlosser && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-yellow-800 leading-relaxed`}
                  >
                    <strong>Use water flosser:</strong>
                    <br />
                    <span className="text-xs text-yellow-700">
                      Start 1 month after surgery | Begin at lowest pressure
                    </span>
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.electricToothbrush
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-yellow-50 border-yellow-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('electricToothbrush', !formData.electricToothbrush)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.electricToothbrush
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-yellow-400 bg-white'
                  }`}
                >
                  {formData.electricToothbrush && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-yellow-800 leading-relaxed`}
                  >
                    <strong>Brush twice daily:</strong>
                    <br />
                    <span className="text-xs text-yellow-700">
                      Use provided electric toothbrush | Clean under appliance with super-floss
                    </span>
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.attendCheckups
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-yellow-50 border-yellow-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('attendCheckups', !formData.attendCheckups)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.attendCheckups
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-yellow-400 bg-white'
                  }`}
                >
                  {formData.attendCheckups && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-yellow-800 leading-relaxed`}
                  >
                    <strong>Attend all check-ups:</strong>
                    <br />
                    <span className="text-xs text-yellow-700">
                      Every 6 months | 48-hour notice to reschedule (or $100 fee)
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Box */}
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              IMPORTANT: What Voids Your Warranty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Missing ANY daily care requirements
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Missing appointments without 48-hour notice
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Not enrolling by one-week deadline
              </li>
            </ul>
            <div className="mt-3 p-3 bg-red-100 rounded-lg">
              <p className="text-sm font-semibold text-red-800">
                Consequence: Pay standard rates ($250/visit + $150/lab-hour)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <HelpCircle className="h-5 w-5" />
              We're Here to Help You Succeed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-green-700">
                • Text/email reminders available<br />
                • Support for struggling patients<br />
                • Flexible scheduling
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-green-600">Questions</div>
                    <div className="text-sm font-medium">(585) 394-5910</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-green-600">Emergency</div>
                    <div className="text-sm font-medium">(585) 394-5910</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-green-600">Email</div>
                    <div className="text-sm font-medium">contact@nysdentalimplants.com</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Enrollment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.enrollmentChoice === 'enroll'
                    ? 'bg-green-100 border-green-500 shadow-sm'
                    : `bg-green-50 border-green-300 ${!readOnly ? 'hover:border-green-400 hover:bg-green-100' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('enrollmentChoice', 'enroll')}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.enrollmentChoice === 'enroll'
                      ? 'border-green-600 bg-green-600'
                      : 'border-green-400 bg-white'
                  }`}
                >
                  {formData.enrollmentChoice === 'enroll' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} leading-relaxed`}
                  >
                    <strong>ENROLL NOW</strong> - Protect investment, activate warranty
                    <br />
                    <span className="text-xs text-green-700">
                      Start your 3-year warranty coverage and receive all care packages
                    </span>
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.enrollmentChoice === 'defer'
                    ? 'bg-red-100 border-red-500 shadow-sm'
                    : `bg-red-50 border-red-300 ${!readOnly ? 'hover:border-red-400 hover:bg-red-100' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('enrollmentChoice', 'defer')}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.enrollmentChoice === 'defer'
                      ? 'border-red-600 bg-red-600'
                      : 'border-red-400 bg-white'
                  }`}
                >
                  {formData.enrollmentChoice === 'defer' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} leading-relaxed`}
                  >
                    <strong>DEFER ENROLLMENT</strong> - Decline coverage, $150 reinstatement fee later
                    <br />
                    <span className="text-xs text-red-700">
                      No warranty protection, pay full price for any issues
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="paymentMethod">Select Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                  disabled={readOnly}
                >
                  <option value="">Choose payment method...</option>
                  <option value="credit-card">Credit/Debit Cards (Visa, MC, Amex, Discover)</option>
                  <option value="carecredit">CareCredit financing</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="payment-plan">Payment plan (contact office)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Terms */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Legal Terms (Simplified)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.cancellationPolicy
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-gray-50 border-gray-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('cancellationPolicy', !formData.cancellationPolicy)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.cancellationPolicy
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {formData.cancellationPolicy && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-800 leading-relaxed`}
                  >
                    I understand the cancellation policy
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.governingLaw
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-gray-50 border-gray-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('governingLaw', !formData.governingLaw)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.governingLaw
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {formData.governingLaw && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-800 leading-relaxed`}
                  >
                    I agree to New York governing law
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.arbitrationClause
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-gray-50 border-gray-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('arbitrationClause', !formData.arbitrationClause)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.arbitrationClause
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {formData.arbitrationClause && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-800 leading-relaxed`}
                  >
                    I agree to arbitration clause
                  </Label>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.hipaaConsent
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-gray-50 border-gray-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('hipaaConsent', !formData.hipaaConsent)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.hipaaConsent
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {formData.hipaaConsent && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-800 leading-relaxed`}
                  >
                    I provide HIPAA consent
                  </Label>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.ageConfirmation
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-blue-50 border-blue-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-100' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('ageConfirmation', !formData.ageConfirmation)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.ageConfirmation
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-blue-400 bg-white'
                  }`}
                >
                  {formData.ageConfirmation && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-blue-800 leading-relaxed`}
                  >
                    I confirm I am 18+ years old and understand this document in English
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card className="border-2 border-dashed border-blue-300">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">
              Signature Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div
                className={`flex items-center space-x-3 p-5 rounded-lg border-2 transition-all duration-200 min-h-[60px] ${
                  readOnly ? 'cursor-default' : 'cursor-pointer'
                } ${
                  formData.acknowledgmentRead
                    ? 'bg-blue-100 border-blue-500 shadow-sm'
                    : `bg-gray-50 border-gray-300 ${!readOnly ? 'hover:border-blue-400 hover:bg-blue-50' : ''}`
                }`}
                onClick={readOnly ? undefined : () => handleInputChange('acknowledgmentRead', !formData.acknowledgmentRead)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.acknowledgmentRead
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {formData.acknowledgmentRead && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-800 leading-relaxed`}
                  >
                    <span className="text-red-500">*</span> I acknowledge that I have read and understand this 3-Year Care Package Enrollment Agreement.
                    I understand the benefits, requirements, and consequences outlined above.
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* First Column - Witness Section */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Witness Information</h3>

                {/* Witness Name */}
                <div>
                  <Label htmlFor="witnessName" className="text-sm font-semibold">Witness Name (Print)</Label>
                  <Input
                    id="witnessName"
                    value={formData.witnessName}
                    onChange={(e) => handleInputChange('witnessName', e.target.value)}
                    placeholder="Print witness name"
                    className="mt-1"
                    disabled={readOnly}
                  />
                </div>

                {/* Witness Date */}
                <div>
                  <Label htmlFor="witnessSignatureDate" className="text-sm font-semibold">Witness Date</Label>
                  <Input
                    id="witnessSignatureDate"
                    type="date"
                    value={formData.witnessSignatureDate}
                    onChange={(e) => handleInputChange('witnessSignatureDate', e.target.value)}
                    className="mt-1"
                    disabled={readOnly}
                  />
                </div>

                {/* Witness Signature */}
                <div>
                  <Label className="text-sm font-semibold">Witness Signature</Label>
                  <div className="mt-2">
                    {formData.witnessSignature && formData.witnessSignature.length > 0 ? (
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Witness Signature Captured</span>
                          {!readOnly && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleWitnessSignatureClear}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <img
                          src={formData.witnessSignature}
                          alt="Witness Signature"
                          className="max-w-full h-20 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={readOnly ? undefined : () => setShowWitnessSignatureDialog(true)}
                        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 flex items-center justify-center gap-2"
                        disabled={readOnly}
                      >
                        <Edit className="h-4 w-4" />
                        {readOnly ? 'No Witness Signature' : 'Click to Sign (Witness)'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="flex justify-center">
                <Separator orientation="vertical" className="hidden lg:block h-auto min-h-[300px]" />
                <Separator className="lg:hidden w-full" />
              </div>

              {/* Second Column - Patient Section */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>

                {/* Patient Name */}
                <div>
                  <Label htmlFor="patientName" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Patient Name (Print)
                  </Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Print patient name"
                    className="mt-1"
                    required
                    disabled={readOnly}
                  />
                </div>

                {/* Patient Date */}
                <div>
                  <Label htmlFor="patientSignatureDate" className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Date
                  </Label>
                  <Input
                    id="patientSignatureDate"
                    type="date"
                    value={formData.patientSignatureDate}
                    onChange={(e) => handleInputChange('patientSignatureDate', e.target.value)}
                    className="mt-1"
                    required
                    disabled={readOnly}
                  />
                </div>

                {/* Patient Signature */}
                <div>
                  <Label className="text-sm font-semibold">
                    <span className="text-red-500">*</span> Patient Signature
                  </Label>
                  <div className="mt-2">
                    {formData.patientSignature && formData.patientSignature.length > 0 ? (
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Signature Captured</span>
                          {!readOnly && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handlePatientSignatureClear}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <img
                          src={formData.patientSignature}
                          alt="Patient Signature"
                          className="max-w-full h-20 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={readOnly ? undefined : () => setShowPatientSignatureDialog(true)}
                        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 flex items-center justify-center gap-2"
                        disabled={readOnly}
                      >
                        <Edit className="h-4 w-4" />
                        {readOnly ? 'No Patient Signature' : 'Click to Sign'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Use Section */}
        <Card className="border-gray-300 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Staff Use Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staffProcessedBy" className="text-sm font-semibold text-gray-700">
                  Form Processed By
                </Label>
                <Input
                  id="staffProcessedBy"
                  value={formData.staffProcessedBy || ''}
                  onChange={(e) => handleInputChange('staffProcessedBy', e.target.value)}
                  placeholder="Staff member name"
                  className="mt-1"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="staffProcessedDate" className="text-sm font-semibold text-gray-700">
                  Processing Date
                </Label>
                <Input
                  id="staffProcessedDate"
                  type="date"
                  value={formData.staffProcessedDate || ''}
                  onChange={(e) => handleInputChange('staffProcessedDate', e.target.value)}
                  className="mt-1"
                  disabled={readOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? 'Update Form' : 'Submit'}
          </Button>
        </div>
      </form>

      {/* Signature Dialogs */}
      {!readOnly && (
        <>
          <SignatureDialog
            isOpen={showPatientSignatureDialog}
            onClose={() => setShowPatientSignatureDialog(false)}
            onSave={handlePatientSignatureSave}
            title="Patient Signature"
          />

          <SignatureDialog
            isOpen={showWitnessSignatureDialog}
            onClose={() => setShowWitnessSignatureDialog(false)}
            onSave={handleWitnessSignatureSave}
            title="Witness Signature"
          />
        </>
      )}
    </div>
  );
}
