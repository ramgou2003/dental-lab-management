import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
import { generateThankYouPreSurgeryPdf } from "@/utils/thankYouPreSurgeryPdfGenerator";
import {
  Heart,
  AlertTriangle,
  Phone,
  Clock,
  CheckCircle,
  FileText,
  Check,
  Calendar,
  Pill,
  Shield,
  Users,
  MapPin,
  Mail,
  Download,
  Droplet,
  Zap,
  AlertCircle,
  Baby
} from "lucide-react";

interface ThankYouPreSurgeryFormProps {
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

export function ThankYouPreSurgeryForm({
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
}: ThankYouPreSurgeryFormProps) {
  const [formData, setFormData] = useState(() => {
    // The initialData comes from the service already converted to camelCase
    const today = new Date().toISOString().split('T')[0];

    const initialFormData = {
      // Patient Information
      patientName: initialData?.patientName || patientName || "",
      phone: initialData?.phone || "",
      dateOfBirth: initialData?.dateOfBirth || patientDateOfBirth || "",
      email: initialData?.email || "",
      treatmentType: initialData?.treatmentType || "",
      formDate: initialData?.formDate || today,

      // Medical Screening - flattened structure
      heartConditions: initialData?.heartConditions ?? false,
      bloodThinners: initialData?.bloodThinners ?? false,
      diabetes: initialData?.diabetes ?? false,
      highBloodPressure: initialData?.highBloodPressure ?? false,
      allergies: initialData?.allergies ?? false,
      pregnancyNursing: initialData?.pregnancyNursing ?? false,
      recentIllness: initialData?.recentIllness ?? false,
      medicationChanges: initialData?.medicationChanges ?? false,

      // Timeline Acknowledgments - 3 Days Before
      startMedrol: initialData?.startMedrol ?? false,
      startAmoxicillin: initialData?.startAmoxicillin ?? false,
      noAlcohol3Days: initialData?.noAlcohol3Days ?? false,
      arrangeRide: initialData?.arrangeRide ?? false,

      // Timeline Acknowledgments - Night Before
      takeDiazepam: initialData?.takeDiazepam ?? false,
      noFoodAfterMidnight: initialData?.noFoodAfterMidnight ?? false,
      noWaterAfter6Am: initialData?.noWaterAfter6Am ?? false,
      confirmRide: initialData?.confirmRide ?? false,

      // Timeline Acknowledgments - Morning Of
      noBreakfast: initialData?.noBreakfast ?? false,
      noPills: initialData?.noPills ?? false,
      wearComfortable: initialData?.wearComfortable ?? false,
      arriveOnTime: initialData?.arriveOnTime ?? false,

      // Timeline Acknowledgments - After Surgery
      noAlcohol24Hrs: initialData?.noAlcohol24Hrs ?? false,
      noDriving24Hrs: initialData?.noDriving24Hrs ?? false,
      followInstructions: initialData?.followInstructions ?? false,
      callIfConcerns: initialData?.callIfConcerns ?? false,

      // Patient Acknowledgments
      readInstructions: initialData?.readInstructions ?? false,
      understandMedications: initialData?.understandMedications ?? false,
      understandSedation: initialData?.understandSedation ?? false,
      arrangedTransport: initialData?.arrangedTransport ?? false,
      understandRestrictions: initialData?.understandRestrictions ?? false,
      willFollowInstructions: initialData?.willFollowInstructions ?? false,
      understandEmergency: initialData?.understandEmergency ?? false,

      // Signatures
      patientSignature: initialData?.patientSignature || "",
      signatureDate: initialData?.signatureDate || today,
      signatureTime: initialData?.signatureTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      patientPrintName: initialData?.patientPrintName || patientName || ""
    };

    console.log('🏁 Initial Thank You Pre-Surgery form data setup:', {
      patientName: initialFormData.patientName,
      treatmentType: initialFormData.treatmentType,
      patientSignature: initialFormData.patientSignature,
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

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && (isEditing || readOnly)) {
      console.log('🔄 Updating Thank You Pre-Surgery form data from initialData:', initialData);
      console.log('🔍 isEditing:', isEditing, 'readOnly:', readOnly);
      console.log('🔍 initialData.id:', initialData.id);

      const today = new Date().toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        // Patient Information
        patientName: initialData.patientName || prev.patientName || "",
        phone: initialData.phone || prev.phone || "",
        dateOfBirth: initialData.dateOfBirth || prev.dateOfBirth || "",
        email: initialData.email || prev.email || "",
        treatmentType: initialData.treatmentType || prev.treatmentType || "",
        formDate: initialData.formDate || prev.formDate || today,

        // Medical Screening
        heartConditions: initialData.heartConditions ?? prev.heartConditions ?? false,
        bloodThinners: initialData.bloodThinners ?? prev.bloodThinners ?? false,
        diabetes: initialData.diabetes ?? prev.diabetes ?? false,
        highBloodPressure: initialData.highBloodPressure ?? prev.highBloodPressure ?? false,
        allergies: initialData.allergies ?? prev.allergies ?? false,
        pregnancyNursing: initialData.pregnancyNursing ?? prev.pregnancyNursing ?? false,
        recentIllness: initialData.recentIllness ?? prev.recentIllness ?? false,
        medicationChanges: initialData.medicationChanges ?? prev.medicationChanges ?? false,

        // Timeline Acknowledgments - 3 Days Before
        startMedrol: initialData.startMedrol ?? prev.startMedrol ?? false,
        startAmoxicillin: initialData.startAmoxicillin ?? prev.startAmoxicillin ?? false,
        noAlcohol3Days: initialData.noAlcohol3Days ?? prev.noAlcohol3Days ?? false,
        arrangeRide: initialData.arrangeRide ?? prev.arrangeRide ?? false,

        // Timeline Acknowledgments - Night Before
        takeDiazepam: initialData.takeDiazepam ?? prev.takeDiazepam ?? false,
        noFoodAfterMidnight: initialData.noFoodAfterMidnight ?? prev.noFoodAfterMidnight ?? false,
        noWaterAfter6Am: initialData.noWaterAfter6Am ?? prev.noWaterAfter6Am ?? false,
        confirmRide: initialData.confirmRide ?? prev.confirmRide ?? false,

        // Timeline Acknowledgments - Morning Of
        noBreakfast: initialData.noBreakfast ?? prev.noBreakfast ?? false,
        noPills: initialData.noPills ?? prev.noPills ?? false,
        wearComfortable: initialData.wearComfortable ?? prev.wearComfortable ?? false,
        arriveOnTime: initialData.arriveOnTime ?? prev.arriveOnTime ?? false,

        // Timeline Acknowledgments - After Surgery
        noAlcohol24Hrs: initialData.noAlcohol24Hrs ?? prev.noAlcohol24Hrs ?? false,
        noDriving24Hrs: initialData.noDriving24Hrs ?? prev.noDriving24Hrs ?? false,
        followInstructions: initialData.followInstructions ?? prev.followInstructions ?? false,
        callIfConcerns: initialData.callIfConcerns ?? prev.callIfConcerns ?? false,

        // Patient Acknowledgments
        readInstructions: initialData.readInstructions ?? prev.readInstructions ?? false,
        understandMedications: initialData.understandMedications ?? prev.understandMedications ?? false,
        understandSedation: initialData.understandSedation ?? prev.understandSedation ?? false,
        arrangedTransport: initialData.arrangedTransport ?? prev.arrangedTransport ?? false,
        understandRestrictions: initialData.understandRestrictions ?? prev.understandRestrictions ?? false,
        willFollowInstructions: initialData.willFollowInstructions ?? prev.willFollowInstructions ?? false,
        understandEmergency: initialData.understandEmergency ?? prev.understandEmergency ?? false,

        // Signatures
        patientSignature: initialData.patientSignature || prev.patientSignature || "",
        signatureDate: initialData.signatureDate || prev.signatureDate || today,
        signatureTime: initialData.signatureTime || prev.signatureTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        patientPrintName: initialData.patientPrintName || prev.patientPrintName || patientName || ""
      }));

      // Mark form as initialized after loading initial data
      setIsFormInitialized(true);

      console.log('✅ Form data updated with initialData. Key fields check:', {
        patientName: initialData.patientName,
        treatmentType: initialData.treatmentType,
        readInstructions: initialData.readInstructions,
        understandMedications: initialData.understandMedications,
        patientSignature: initialData.patientSignature,
        heartConditions: initialData.heartConditions,
        startMedrol: initialData.startMedrol
      });
    } else if (!initialData) {
      // Mark form as initialized for new forms (no initial data)
      setIsFormInitialized(true);
    }
  }, [initialData, isEditing, readOnly, patientName]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!onAutoSave || !isFormInitialized || readOnly) return;

    // Check if form has meaningful data
    const hasData = formData.patientName || formData.treatmentType || formData.patientSignature ||
                   formData.readInstructions || formData.understandMedications ||
                   formData.heartConditions || formData.startMedrol;

    setHasFormData(hasData);

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      console.log('🔄 Auto-saving Thank You Pre-Surgery form with data:', {
        patientName: formData.patientName,
        treatmentType: formData.treatmentType,
        patientSignature: formData.patientSignature,
        isFormInitialized: isFormInitialized
      });
      onAutoSave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, onAutoSave, isFormInitialized, readOnly]);

  const handleInputChange = (field: string, value: any) => {
    if (!readOnly) {
      console.log('📝 Input changed:', field, '=', value);
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

    if (readOnly) return;

    // Validation
    if (!formData.patientName) {
      toast.error('Please enter patient name');
      return;
    }

    if (!formData.treatmentType) {
      toast.error('Please enter treatment type');
      return;
    }

    if (!formData.readInstructions || !formData.understandMedications ||
        !formData.understandSedation || !formData.arrangedTransport ||
        !formData.understandRestrictions || !formData.willFollowInstructions ||
        !formData.understandEmergency) {
      toast.error('Please acknowledge all patient acknowledgment items');
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
      patient_name: formData.patientName,
      phone: formData.phone,
      date_of_birth: isValidDate(formData.dateOfBirth) ? formData.dateOfBirth : null,
      email: formData.email,
      treatment_type: formData.treatmentType,
      form_date: isValidDate(formData.formDate) ? formData.formDate : currentDate,

      // Medical Screening
      heart_conditions: formData.heartConditions,
      blood_thinners: formData.bloodThinners,
      diabetes: formData.diabetes,
      high_blood_pressure: formData.highBloodPressure,
      allergies: formData.allergies,
      pregnancy_nursing: formData.pregnancyNursing,
      recent_illness: formData.recentIllness,
      medication_changes: formData.medicationChanges,

      // Timeline Acknowledgments - 3 Days Before
      start_medrol: formData.startMedrol,
      start_amoxicillin: formData.startAmoxicillin,
      no_alcohol_3days: formData.noAlcohol3Days,
      arrange_ride: formData.arrangeRide,

      // Timeline Acknowledgments - Night Before
      take_diazepam: formData.takeDiazepam,
      no_food_after_midnight: formData.noFoodAfterMidnight,
      no_water_after_6am: formData.noWaterAfter6Am,
      confirm_ride: formData.confirmRide,

      // Timeline Acknowledgments - Morning Of
      no_breakfast: formData.noBreakfast,
      no_pills: formData.noPills,
      wear_comfortable: formData.wearComfortable,
      arrive_on_time: formData.arriveOnTime,

      // Timeline Acknowledgments - After Surgery
      no_alcohol_24hrs: formData.noAlcohol24Hrs,
      no_driving_24hrs: formData.noDriving24Hrs,
      follow_instructions: formData.followInstructions,
      call_if_concerns: formData.callIfConcerns,

      // Patient Acknowledgments
      read_instructions: formData.readInstructions,
      understand_medications: formData.understandMedications,
      understand_sedation: formData.understandSedation,
      arranged_transport: formData.arrangedTransport,
      understand_restrictions: formData.understandRestrictions,
      will_follow_instructions: formData.willFollowInstructions,
      understand_emergency: formData.understandEmergency,

      // Signatures
      patient_signature: formData.patientSignature,
      signature_date: isValidDate(formData.signatureDate) ? formData.signatureDate : currentDate,
      signature_time: formData.signatureTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      patient_print_name: formData.patientPrintName
    };

    onSubmit(submissionData);
    toast.success('Thank You and Pre-Surgery Instructions form submitted successfully');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6" />
            Thank You and Pre-Surgery Instructions
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
        <div className="w-full h-1 bg-blue-200 rounded-full mt-2"></div>
        <p className="text-sm text-gray-600 mt-2">New York Dental Implants | 344 North Main Street, Canandaigua, NY 14424</p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-blue-50 pb-4">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName" className="text-sm font-medium">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="treatmentType" className="text-sm font-medium">Treatment Type</Label>
                <Select
                  value={formData.treatmentType}
                  onValueChange={(value) => handleInputChange('treatmentType', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL ARCH FIXED">FULL ARCH FIXED</SelectItem>
                    <SelectItem value="DENTURE">DENTURE</SelectItem>
                    <SelectItem value="IMPLANT REMOVABLE DENTURE">IMPLANT REMOVABLE DENTURE</SelectItem>
                    <SelectItem value="SINGLE IMPLANT">SINGLE IMPLANT</SelectItem>
                    <SelectItem value="MULTIPLE IMPLANTS">MULTIPLE IMPLANTS</SelectItem>
                    <SelectItem value="EXTRACTION">EXTRACTION</SelectItem>
                    <SelectItem value="EXTRACTION AND GRAFT">EXTRACTION AND GRAFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Phone className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">🚨 Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-700">Office Hours</h4>
                    <p className="text-red-600">(585) 394-5910</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-700">After Hours</h4>
                    <p className="text-red-600">[Emergency Number]</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-700">Life Threatening</h4>
                    <p className="text-red-600 font-bold">911</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="border-2 border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Heart className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="text-xl font-bold text-blue-800">Thank You for Choosing New York Dental Implants!</h3>
              <p className="text-gray-700 leading-relaxed">
                We are honored that you have chosen our practice for your dental implant treatment. Our mission is to provide 
                exceptional care with compassion, using the latest technology and techniques to help you achieve your best smile. 
                Your comfort, safety, and satisfaction are our top priorities throughout your treatment journey.
              </p>
              <p className="text-blue-700 font-medium">- The New York Dental Implants Team</p>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Pipeline */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Treatment Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {[
                  { stage: "Consultation", icon: Users, completed: true },
                  { stage: "Records", icon: FileText, completed: true },
                  { stage: "Pre-Surgery", icon: Pill, completed: false, current: true },
                  { stage: "Surgery", icon: Shield, completed: false },
                  { stage: "Recovery", icon: Heart, completed: false },
                  { stage: "Final Smile", icon: CheckCircle, completed: false }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-100 border-2 border-green-500' :
                      item.current ? 'bg-blue-100 border-4 border-blue-500' :
                      'bg-gray-100 border-2 border-gray-300'
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        item.completed ? 'text-green-600' :
                        item.current ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      item.current ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {item.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Progress: 33% Complete</strong> - You are currently in the Pre-Surgery preparation phase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Screening */}
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Medical Screening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700 font-medium">Please check any that apply to you:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'heartConditions', text: 'Heart conditions or pacemaker', icon: Heart },
                { key: 'bloodThinners', text: 'Taking blood thinners', icon: Droplet },
                { key: 'diabetes', text: 'Diabetes (Type 1 or 2)', icon: Zap },
                { key: 'highBloodPressure', text: 'High blood pressure', icon: AlertCircle },
                { key: 'allergies', text: 'Drug allergies or reactions', icon: AlertTriangle },
                { key: 'pregnancyNursing', text: 'Pregnant or nursing', icon: Baby },
                { key: 'recentIllness', text: 'Recent illness or fever', icon: Pill },
                { key: 'medicationChanges', text: 'Recent medication changes', icon: Shield }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.key}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 min-h-[56px] ${
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      formData[item.key as keyof typeof formData]
                        ? 'bg-red-100 border-red-500 shadow-sm'
                        : `bg-white border-gray-300 ${!readOnly ? 'hover:border-red-400 hover:bg-red-50' : ''}`
                    }`}
                    onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        formData[item.key as keyof typeof formData]
                          ? 'border-red-600 bg-red-600'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {formData[item.key as keyof typeof formData] && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <IconComponent className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <Label
                      className={`text-sm font-medium ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-red-800 leading-relaxed flex-1`}
                    >
                      {item.text}
                    </Label>
                  </div>
                );
              })}
            </div>
            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">⚠️ Important</h4>
                  <p className="text-yellow-700 text-sm">
                    If you checked any boxes above, please call our office immediately at (585) 394-5910.
                    These conditions may require special precautions or medication adjustments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surgical Timeline */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Surgical Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 3 Days Before */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-800 mb-3">3 Days Before Surgery</h4>
              <div className="space-y-2">
                {[
                  { key: 'startMedrol', text: 'Start taking Medrol Dose Pack as directed' },
                  { key: 'startAmoxicillin', text: 'Start taking Amoxicillin 500mg (3 times daily)' },
                  { key: 'noAlcohol3Days', text: 'No alcohol consumption' },
                  { key: 'arrangeRide', text: 'Confirm transportation arrangements' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData[item.key as keyof typeof formData]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          formData[item.key as keyof typeof formData]
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {formData[item.key as keyof typeof formData] && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <Label
                        className={`text-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-700 font-medium`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Night Before */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-800 mb-3">Night Before Surgery</h4>
              <div className="space-y-2">
                {[
                  { key: 'takeDiazepam', text: 'Take Diazepam 10mg at bedtime (if prescribed)' },
                  { key: 'noFoodAfterMidnight', text: 'No food or drink after midnight' },
                  { key: 'noWaterAfter6Am', text: 'No water after 6:00 AM on surgery day' },
                  { key: 'confirmRide', text: 'Confirm your ride for surgery day' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData[item.key as keyof typeof formData]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          formData[item.key as keyof typeof formData]
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {formData[item.key as keyof typeof formData] && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <Label
                        className={`text-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-700 font-medium`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Morning Of */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-800 mb-3">Morning of Surgery</h4>
              <div className="space-y-2">
                {[
                  { key: 'noBreakfast', text: 'NO breakfast, food, or beverages' },
                  { key: 'noPills', text: 'NO morning medications (unless approved)' },
                  { key: 'wearComfortable', text: 'Wear comfortable, loose-fitting clothes' },
                  { key: 'arriveOnTime', text: 'Arrive on time for your appointment' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData[item.key as keyof typeof formData]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          formData[item.key as keyof typeof formData]
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {formData[item.key as keyof typeof formData] && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <Label
                        className={`text-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-700 font-medium`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* After Surgery */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-800 mb-3">After Surgery</h4>
              <div className="space-y-2">
                {[
                  { key: 'noAlcohol24Hrs', text: 'No alcohol for 24 hours' },
                  { key: 'noDriving24Hrs', text: 'No driving for 24 hours' },
                  { key: 'followInstructions', text: 'Follow all post-operative instructions' },
                  { key: 'callIfConcerns', text: 'Call office with any concerns' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData[item.key as keyof typeof formData]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          formData[item.key as keyof typeof formData]
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {formData[item.key as keyof typeof formData] && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <Label
                        className={`text-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-700 font-medium`}
                      >
                        {item.text}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication Instructions */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Medrol Dose Pack */}
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Medrol Dose Pack</h4>
                <p className="text-sm text-orange-700 mb-2">Anti-inflammatory steroid</p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>Day 1: 6 tablets</li>
                  <li>Day 2: 5 tablets</li>
                  <li>Day 3: 4 tablets</li>
                  <li>Day 4: 3 tablets</li>
                  <li>Day 5: 2 tablets</li>
                  <li>Day 6: 1 tablet</li>
                </ul>
              </div>

              {/* Amoxicillin */}
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Amoxicillin 500mg</h4>
                <p className="text-sm text-orange-700 mb-2">Antibiotic</p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>Take 3 times daily</li>
                  <li>With or without food</li>
                  <li>Continue for full course</li>
                  <li>Start 3 days before surgery</li>
                </ul>
              </div>

              {/* Diazepam */}
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Diazepam 10mg</h4>
                <p className="text-sm text-orange-700 mb-2">Sedative (if prescribed)</p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>Take night before surgery</li>
                  <li>At bedtime only</li>
                  <li>Do not drive after taking</li>
                  <li>One dose only</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">🚨 Critical Safety Warning</h4>
                  <p className="text-red-700 text-sm">
                    Do NOT take any morning medications on surgery day unless specifically approved by our office.
                    This includes blood pressure medications, diabetes medications, and supplements.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IV Sedation Safety */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              IV Sedation Safety Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">What to Expect</h4>
              <p className="text-sm text-blue-700">
                IV sedation helps you relax and remain comfortable during your procedure. You will be monitored
                continuously and will have little to no memory of the surgery.
              </p>
            </div>

            <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">24-Hour Restrictions After Sedation</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• No driving or operating machinery</li>
                <li>• No alcohol consumption</li>
                <li>• No important decisions or legal documents</li>
                <li>• Must have responsible adult supervision</li>
                <li>• No work or strenuous activities</li>
              </ul>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Possible Side Effects</h4>
              <p className="text-sm text-yellow-700">
                Drowsiness, dizziness, nausea, or mild confusion are normal and will resolve within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Situations */}
        <Card className="border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              When to Seek Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">🚨 Call 911 Immediately If:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Difficulty breathing or swallowing</li>
                <li>• Severe allergic reaction (hives, swelling)</li>
                <li>• Chest pain or heart palpitations</li>
                <li>• Loss of consciousness</li>
                <li>• Severe bleeding that won't stop</li>
              </ul>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Call Our Office If:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Persistent nausea or vomiting</li>
                <li>• Excessive swelling or pain</li>
                <li>• Signs of infection (fever, pus)</li>
                <li>• Questions about medications</li>
                <li>• Any concerns about your recovery</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Patient Acknowledgments */}
        <Card className="border-2 border-gray-300">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800">Patient Acknowledgment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-700 mb-4">
              Please check each box to confirm your understanding:
            </p>
            <div className="space-y-2">
              {[
                { key: 'readInstructions', text: 'I have read and understand all pre-surgery instructions' },
                { key: 'understandMedications', text: 'I understand the medication schedule and requirements' },
                { key: 'understandSedation', text: 'I understand the IV sedation process and restrictions' },
                { key: 'arrangedTransport', text: 'I have arranged transportation to and from surgery' },
                { key: 'understandRestrictions', text: 'I understand the 24-hour post-sedation restrictions' },
                { key: 'willFollowInstructions', text: 'I agree to follow all pre and post-operative instructions' },
                { key: 'understandEmergency', text: 'I understand when to seek emergency help' }
              ].map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData[item.key as keyof typeof formData]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={readOnly ? undefined : () => handleInputChange(item.key, !formData[item.key as keyof typeof formData])}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        formData[item.key as keyof typeof formData]
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300 bg-white'
                      }`}
                    >
                      {formData[item.key as keyof typeof formData] && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <Label
                      className={`text-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'} text-gray-700 font-medium`}
                    >
                      {item.text}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Patient Signature & Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Patient Info */}
              <div className="space-y-4">
                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patientPrintName" className="text-sm font-medium">Patient Name</Label>
                  <Input
                    id="patientPrintName"
                    value={formData.patientPrintName || patientName || ""}
                    onChange={(e) => handleInputChange('patientPrintName', e.target.value)}
                    required
                    disabled={true}
                    className="bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureDate" className="text-sm font-medium">Date</Label>
                    <div className="relative">
                      <Input
                        id="signatureDate"
                        type="date"
                        value={formData.signatureDate}
                        onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                        required
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signatureTime" className="text-sm font-medium">Time</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="signatureTime"
                        type="time"
                        value={formData.signatureTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        onChange={(e) => handleInputChange('signatureTime', e.target.value)}
                        disabled={readOnly}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('signatureTime', new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))}
                        disabled={readOnly}
                        className="text-xs px-2"
                      >
                        Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Signature */}
              <div className="space-y-2">
                {formData.patientSignature ? (
                  <SignaturePreview
                    signature={formData.patientSignature}
                    onEdit={readOnly ? undefined : () => setShowPatientSignatureDialog(true)}
                    onClear={readOnly ? undefined : handlePatientSignatureClear}
                    label="Patient Signature"
                    readOnly={readOnly}
                  />
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={readOnly ? undefined : () => setShowPatientSignatureDialog(true)}
                      className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      disabled={readOnly}
                    >
                      {readOnly ? 'No Signature' : 'Click to Sign'}
                    </Button>
                    <Label className="text-sm font-medium text-center block">Patient Signature</Label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
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
