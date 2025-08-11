import { useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatureDialog } from "@/components/SignatureDialog";
import { SignaturePreview } from "@/components/SignaturePreview";
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
  Mail
} from "lucide-react";

interface ThankYouPreSurgeryFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
}

export function ThankYouPreSurgeryForm({
  onSubmit,
  onCancel,
  patientName = "",
  patientDateOfBirth = "",
  initialData = null,
  isEditing = false,
  readOnly = false
}: ThankYouPreSurgeryFormProps) {
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: initialData?.patient_name || patientName,
    phone: initialData?.phone || "",
    dateOfBirth: initialData?.date_of_birth || patientDateOfBirth || "",
    email: initialData?.email || "",
    treatmentType: initialData?.treatment_type || "",
    formDate: initialData?.form_date || new Date().toISOString().split('T')[0],

    // Medical Screening
    medicalConditions: {
      heartConditions: initialData?.heart_conditions || false,
      bloodThinners: initialData?.blood_thinners || false,
      diabetes: initialData?.diabetes || false,
      highBloodPressure: initialData?.high_blood_pressure || false,
      allergies: initialData?.allergies || false,
      pregnancyNursing: initialData?.pregnancy_nursing || false,
      recentIllness: initialData?.recent_illness || false,
      medicationChanges: initialData?.medication_changes || false
    },

    // Timeline Acknowledgments
    threeDaysBefore: {
      startMedrol: initialData?.start_medrol || false,
      startAmoxicillin: initialData?.start_amoxicillin || false,
      noAlcohol: initialData?.no_alcohol_3days || false,
      arrangeRide: initialData?.arrange_ride || false
    },
    nightBefore: {
      takeDiazepam: initialData?.take_diazepam || false,
      noFoodAfterMidnight: initialData?.no_food_after_midnight || false,
      noWaterAfter6AM: initialData?.no_water_after_6am || false,
      confirmRide: initialData?.confirm_ride || false
    },
    morningOf: {
      noBreakfast: initialData?.no_breakfast || false,
      noPills: initialData?.no_pills || false,
      wearComfortable: initialData?.wear_comfortable || false,
      arriveOnTime: initialData?.arrive_on_time || false
    },
    afterSurgery: {
      noAlcohol24hrs: initialData?.no_alcohol_24hrs || false,
      noDriving24hrs: initialData?.no_driving_24hrs || false,
      followInstructions: initialData?.follow_instructions || false,
      callIfConcerns: initialData?.call_if_concerns || false
    },

    // Patient Acknowledgments
    acknowledgments: {
      readInstructions: initialData?.read_instructions || false,
      understandMedications: initialData?.understand_medications || false,
      understandSedation: initialData?.understand_sedation || false,
      arrangedTransport: initialData?.arranged_transport || false,
      understandRestrictions: initialData?.understand_restrictions || false,
      willFollowInstructions: initialData?.will_follow_instructions || false,
      understandEmergency: initialData?.understand_emergency || false
    },

    // Signatures
    patientSignature: initialData?.patient_signature || "",
    signatureDate: initialData?.signature_date || new Date().toISOString().split('T')[0],
    patientPrintName: initialData?.patient_print_name || ""
  });

  // Signature dialog states
  const [showPatientSignatureDialog, setShowPatientSignatureDialog] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handlePatientSignatureSave = (signature: string) => {
    handleInputChange('patientSignature', signature);
    setShowPatientSignatureDialog(false);
  };

  const handlePatientSignatureClear = () => {
    handleInputChange('patientSignature', '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Heart className="h-6 w-6" />
          Thank You and Pre-Surgery Instructions
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
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
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
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="treatmentType" className="text-sm font-medium">Treatment Type</Label>
                <Input
                  id="treatmentType"
                  value={formData.treatmentType}
                  onChange={(e) => handleInputChange('treatmentType', e.target.value)}
                  placeholder="e.g., Full Arch Implants"
                />
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
                { key: 'heartConditions', text: 'Heart conditions or pacemaker' },
                { key: 'bloodThinners', text: 'Taking blood thinners' },
                { key: 'diabetes', text: 'Diabetes (Type 1 or 2)' },
                { key: 'highBloodPressure', text: 'High blood pressure' },
                { key: 'allergies', text: 'Drug allergies or reactions' },
                { key: 'pregnancyNursing', text: 'Pregnant or nursing' },
                { key: 'recentIllness', text: 'Recent illness or fever' },
                { key: 'medicationChanges', text: 'Recent medication changes' }
              ].map((item) => (
                <div key={item.key} className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                      formData.medicalConditions[item.key as keyof typeof formData.medicalConditions]
                        ? 'bg-red-100'
                        : 'border-2 border-gray-300 bg-white hover:border-red-300'
                    }`}
                    onClick={() => handleNestedChange('medicalConditions', item.key, !formData.medicalConditions[item.key as keyof typeof formData.medicalConditions])}
                  >
                    {formData.medicalConditions[item.key as keyof typeof formData.medicalConditions] && (
                      <Check className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <Label
                    className="text-sm font-medium cursor-pointer text-red-800"
                    onClick={() => handleNestedChange('medicalConditions', item.key, !formData.medicalConditions[item.key as keyof typeof formData.medicalConditions])}
                  >
                    {item.text}
                  </Label>
                </div>
              ))}
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
                  { key: 'noAlcohol', text: 'No alcohol consumption' },
                  { key: 'arrangeRide', text: 'Confirm transportation arrangements' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        formData.threeDaysBefore[item.key as keyof typeof formData.threeDaysBefore]
                          ? 'bg-green-100'
                          : 'border-2 border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleNestedChange('threeDaysBefore', item.key, !formData.threeDaysBefore[item.key as keyof typeof formData.threeDaysBefore])}
                    >
                      {formData.threeDaysBefore[item.key as keyof typeof formData.threeDaysBefore] && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <Label
                      className="text-sm cursor-pointer text-gray-700"
                      onClick={() => handleNestedChange('threeDaysBefore', item.key, !formData.threeDaysBefore[item.key as keyof typeof formData.threeDaysBefore])}
                    >
                      {item.text}
                    </Label>
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
                  { key: 'noWaterAfter6AM', text: 'No water after 6:00 AM on surgery day' },
                  { key: 'confirmRide', text: 'Confirm your ride for surgery day' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        formData.nightBefore[item.key as keyof typeof formData.nightBefore]
                          ? 'bg-green-100'
                          : 'border-2 border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleNestedChange('nightBefore', item.key, !formData.nightBefore[item.key as keyof typeof formData.nightBefore])}
                    >
                      {formData.nightBefore[item.key as keyof typeof formData.nightBefore] && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <Label
                      className="text-sm cursor-pointer text-gray-700"
                      onClick={() => handleNestedChange('nightBefore', item.key, !formData.nightBefore[item.key as keyof typeof formData.nightBefore])}
                    >
                      {item.text}
                    </Label>
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
                  <div key={item.key} className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        formData.morningOf[item.key as keyof typeof formData.morningOf]
                          ? 'bg-green-100'
                          : 'border-2 border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleNestedChange('morningOf', item.key, !formData.morningOf[item.key as keyof typeof formData.morningOf])}
                    >
                      {formData.morningOf[item.key as keyof typeof formData.morningOf] && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <Label
                      className="text-sm cursor-pointer text-gray-700"
                      onClick={() => handleNestedChange('morningOf', item.key, !formData.morningOf[item.key as keyof typeof formData.morningOf])}
                    >
                      {item.text}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* After Surgery */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-800 mb-3">After Surgery</h4>
              <div className="space-y-2">
                {[
                  { key: 'noAlcohol24hrs', text: 'No alcohol for 24 hours' },
                  { key: 'noDriving24hrs', text: 'No driving for 24 hours' },
                  { key: 'followInstructions', text: 'Follow all post-operative instructions' },
                  { key: 'callIfConcerns', text: 'Call office with any concerns' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        formData.afterSurgery[item.key as keyof typeof formData.afterSurgery]
                          ? 'bg-green-100'
                          : 'border-2 border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleNestedChange('afterSurgery', item.key, !formData.afterSurgery[item.key as keyof typeof formData.afterSurgery])}
                    >
                      {formData.afterSurgery[item.key as keyof typeof formData.afterSurgery] && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <Label
                      className="text-sm cursor-pointer text-gray-700"
                      onClick={() => handleNestedChange('afterSurgery', item.key, !formData.afterSurgery[item.key as keyof typeof formData.afterSurgery])}
                    >
                      {item.text}
                    </Label>
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
                  <li>Day 1: 6 tablets (2-2-2)</li>
                  <li>Day 2: 5 tablets (2-1-2)</li>
                  <li>Day 3: 4 tablets (2-0-2)</li>
                  <li>Day 4: 3 tablets (1-0-2)</li>
                  <li>Day 5: 2 tablets (1-0-1)</li>
                  <li>Day 6: 1 tablet (1-0-0)</li>
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
            {[
              { key: 'readInstructions', text: 'I have read and understand all pre-surgery instructions' },
              { key: 'understandMedications', text: 'I understand the medication schedule and requirements' },
              { key: 'understandSedation', text: 'I understand the IV sedation process and restrictions' },
              { key: 'arrangedTransport', text: 'I have arranged transportation to and from surgery' },
              { key: 'understandRestrictions', text: 'I understand the 24-hour post-sedation restrictions' },
              { key: 'willFollowInstructions', text: 'I agree to follow all pre and post-operative instructions' },
              { key: 'understandEmergency', text: 'I understand when to seek emergency help' }
            ].map((item) => (
              <div key={item.key} className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
                    formData.acknowledgments[item.key as keyof typeof formData.acknowledgments]
                      ? 'bg-blue-100'
                      : 'border-2 border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handleNestedChange('acknowledgments', item.key, !formData.acknowledgments[item.key as keyof typeof formData.acknowledgments])}
                >
                  {formData.acknowledgments[item.key as keyof typeof formData.acknowledgments] && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <Label
                  className="text-sm font-medium cursor-pointer text-gray-700"
                  onClick={() => handleNestedChange('acknowledgments', item.key, !formData.acknowledgments[item.key as keyof typeof formData.acknowledgments])}
                >
                  {item.text}
                </Label>
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
                />
              </div>

              {/* Patient Signature */}
              <div className="space-y-2">
                {formData.patientSignature ? (
                  <SignaturePreview
                    signature={formData.patientSignature}
                    onEdit={() => setShowPatientSignatureDialog(true)}
                    onClear={handlePatientSignatureClear}
                    label="Patient Signature *"
                  />
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPatientSignatureDialog(true)}
                      className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    >
                      Click to Sign
                    </Button>
                    <Separator className="my-2" />
                    <Label className="text-sm font-medium text-center block">Patient Signature *</Label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="patientPrintName" className="text-sm font-medium">Print Patient Name *</Label>
              <Input
                id="patientPrintName"
                value={formData.patientPrintName}
                onChange={(e) => handleInputChange('patientPrintName', e.target.value)}
                required
              />
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
              {isEditing ? 'Update Pre-Surgery Form' : 'Save Pre-Surgery Form'}
            </Button>
          ) : (
            <Button type="button" disabled className="bg-gray-400 text-white">
              View Only
            </Button>
          )}
        </div>
      </form>

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
