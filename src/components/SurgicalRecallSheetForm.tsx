import { DialogTitle, Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, User, Calendar, Check, Plus, Camera } from "lucide-react";
import { useState } from "react";
import { SmartCameraCapture } from "./SmartCameraCapture";

interface SurgicalRecallSheetFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  editingSheet?: any;
}

export function SurgicalRecallSheetForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
  editingSheet
}: SurgicalRecallSheetFormProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    patient_name: patientName,
    surgery_date: editingSheet?.surgery_date || new Date().toISOString().split('T')[0],
    arch_type: editingSheet?.arch_type || '',
    upper_surgery_type: editingSheet?.upper_surgery_type || '',
    lower_surgery_type: editingSheet?.lower_surgery_type || '',

    // Upper Implants
    upper_implant_count: editingSheet?.upper_implant_count || '',
    upper_implant_positions: editingSheet?.upper_implant_positions || '',
    upper_implant_brand: editingSheet?.upper_implant_brand || '',
    upper_implant_size: editingSheet?.upper_implant_size || '',
    upper_complications: editingSheet?.upper_complications || '',
    upper_notes: editingSheet?.upper_notes || '',

    // Lower Implants
    lower_implant_count: editingSheet?.lower_implant_count || '',
    lower_implant_positions: editingSheet?.lower_implant_positions || '',
    lower_implant_brand: editingSheet?.lower_implant_brand || '',
    lower_implant_size: editingSheet?.lower_implant_size || '',
    lower_complications: editingSheet?.lower_complications || '',
    lower_notes: editingSheet?.lower_notes || '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showImplantDialog, setShowImplantDialog] = useState(false);
  const [implantDialogType, setImplantDialogType] = useState<'upper' | 'lower'>('upper');
  const [showImplantCamera, setShowImplantCamera] = useState(false);
  const [showMuaCamera, setShowMuaCamera] = useState(false);
  const [implantData, setImplantData] = useState({
    position: '',
    mua_brand: '',
    mua_subtype: '',
    mua_size: '',
    mua_picture: null as File | null,
    brand: '',
    subtype: '',
    size: '',
    implant_picture: null as File | null
  });

  // Calculate total steps and step names based on arch type
  const getTotalSteps = () => {
    if (!formData.arch_type) return 1; // Only Basic Info
    if (formData.arch_type === 'dual') return 3; // Basic Info + Upper Implants + Lower Implants
    return 2; // Basic Info + Single arch (Upper or Lower Implants)
  };

  const getStepName = (stepNumber: number) => {
    if (stepNumber === 1) return 'Basic Info';
    if (formData.arch_type === 'dual') {
      if (stepNumber === 2) return 'Upper Implants';
      if (stepNumber === 3) return 'Lower Implants';
    } else if (formData.arch_type === 'upper') {
      if (stepNumber === 2) return 'Upper Implants';
    } else if (formData.arch_type === 'lower') {
      if (stepNumber === 2) return 'Lower Implants';
    }
    return '';
  };

  const totalSteps = getTotalSteps();

  // Step completion validation
  const isStep1Complete = () => {
    const hasBasicInfo = formData.surgery_date && formData.arch_type;
    if (!hasBasicInfo) return false;

    // Check surgery type based on arch type
    if (formData.arch_type === 'upper') {
      return formData.upper_surgery_type !== '';
    } else if (formData.arch_type === 'lower') {
      return formData.lower_surgery_type !== '';
    } else if (formData.arch_type === 'dual') {
      return formData.upper_surgery_type !== '' && formData.lower_surgery_type !== '';
    }
    return false;
  };

  const isStep2Complete = () => {
    // For now, we'll consider step 2 complete if arch type is selected
    // Later you can add specific validation for implant fields
    return formData.arch_type !== '';
  };

  const isStep3Complete = () => {
    // For dual arch, step 3 is for lower implants
    // For now, we'll consider it complete if we're on dual arch
    return formData.arch_type === 'dual';
  };

  const isStepComplete = (stepNumber: number) => {
    if (stepNumber === 1) return isStep1Complete();
    if (stepNumber === 2) return isStep2Complete();
    if (stepNumber === 3) return isStep3Complete();
    return false;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset to step 1 if arch type changes
    if (field === 'arch_type') {
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      patient_id: patientId,
      status: 'completed'
    });
  };

  const handleAddImplant = (type: 'upper' | 'lower') => {
    setImplantDialogType(type);
    setImplantData({
      position: '',
      mua_brand: '',
      mua_subtype: '',
      mua_size: '',
      mua_picture: null,
      brand: '',
      subtype: '',
      size: '',
      implant_picture: null
    });
    setShowImplantDialog(true);
  };

  const handleImplantDataChange = (field: string, value: string) => {
    setImplantData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setImplantData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSaveImplant = () => {
    // Here you would save the implant data to the form
    // For now, we'll just close the dialog
    setShowImplantDialog(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-3 relative">
        <div className="flex items-center justify-between pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Activity className="h-5 w-5 text-blue-600" />
            Surgical Recall Sheet - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </div>
      </div>

      {/* Step Progress Indicator - Horizontal like IV Sedation */}
      <div className="flex-shrink-0 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Step 1: Basic Info - Always visible */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 pb-2">
              <div className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Basic Info
              </div>
              {isStep1Complete() && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className={`h-1 w-full rounded-full ${currentStep === 1 ? 'bg-blue-600' : currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>

          {/* Step 2: Dynamic based on arch type */}
          {formData.arch_type && (
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 pb-2">
                <div className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : currentStep > 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {formData.arch_type === 'upper' ? 'Upper Implants' :
                   formData.arch_type === 'lower' ? 'Lower Implants' : 'Upper Implants'}
                </div>
                {isStep2Complete() && currentStep > 2 && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className={`h-1 w-full rounded-full ${currentStep === 2 ? 'bg-blue-600' : currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          )}

          {/* Step 3: Lower Implants - Only for dual arch */}
          {formData.arch_type === 'dual' && (
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 pb-2">
                <div className={`text-sm font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Lower Implants
                </div>
                {isStep3Complete() && currentStep > 3 && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className={`h-1 w-full rounded-full ${currentStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          )}
        </div>
      </div>

      {/* Form Content - exactly like IV sedation structure */}
      <div className="flex-1 flex flex-col min-h-0">
        <form className="flex-1 flex flex-col min-h-0">
          {/* Step Content Container - Hidden Scrollbar */}
          <div className="flex-1 px-6 py-2 overflow-y-auto scrollbar-hidden">


            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient_name">Patient Name</Label>
                      <Input
                        id="patient_name"
                        value={formData.patient_name}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="surgery_date">Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="surgery_date"
                        type="date"
                        value={formData.surgery_date}
                        onChange={(e) => handleInputChange('surgery_date', e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Arch Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Arch Type <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'upper')}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        formData.arch_type === 'upper'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Upper
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'lower')}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        formData.arch_type === 'lower'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Lower
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'dual')}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        formData.arch_type === 'dual'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Dual
                    </button>
                  </div>
                </div>

                {/* Dynamic Surgery Type based on Arch Type */}
                {formData.arch_type && (
                  <div className="space-y-4">
                    {/* For dual arch - show upper and lower side by side */}
                    {formData.arch_type === 'dual' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upper Surgery Type */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Upper Surgery Type <span className="text-red-500">*</span></Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleInputChange('upper_surgery_type', 'surgery')}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                formData.upper_surgery_type === 'surgery'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgery
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange('upper_surgery_type', 'surgical_revision')}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                formData.upper_surgery_type === 'surgical_revision'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgical Revision
                            </button>
                          </div>
                        </div>

                        {/* Lower Surgery Type */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Lower Surgery Type <span className="text-red-500">*</span></Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleInputChange('lower_surgery_type', 'surgery')}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                formData.lower_surgery_type === 'surgery'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgery
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange('lower_surgery_type', 'surgical_revision')}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                formData.lower_surgery_type === 'surgical_revision'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgical Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* For single arch - show only relevant surgery type */}
                    {formData.arch_type === 'upper' && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Upper Surgery Type <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInputChange('upper_surgery_type', 'surgery')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                              formData.upper_surgery_type === 'surgery'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgery
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('upper_surgery_type', 'surgical_revision')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                              formData.upper_surgery_type === 'surgical_revision'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgical Revision
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.arch_type === 'lower' && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Lower Surgery Type <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInputChange('lower_surgery_type', 'surgery')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                              formData.lower_surgery_type === 'surgery'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgery
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('lower_surgery_type', 'surgical_revision')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                              formData.lower_surgery_type === 'surgical_revision'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgical Revision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Upper Implants (for upper or dual) */}
            {currentStep === 2 && (formData.arch_type === 'upper' || formData.arch_type === 'dual') && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Upper Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('upper')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>Click "Add Implant" to add upper implant details...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Lower Implants (for lower only) */}
            {currentStep === 2 && formData.arch_type === 'lower' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Lower Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('lower')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>Click "Add Implant" to add lower implant details...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Lower Implants (for dual only) */}
            {currentStep === 3 && formData.arch_type === 'dual' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Lower Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('lower')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>Click "Add Implant" to add lower implant details...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions - exactly like IV sedation footer */}
          <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              Previous
            </Button>

            <Button
              type="button"
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === totalSteps ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </div>

      {/* Add Implant Dialog */}
      <Dialog open={showImplantDialog} onOpenChange={setShowImplantDialog}>
        <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add {implantDialogType === 'upper' ? 'Upper' : 'Lower'} Implant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="implant_position">Implant Position <span className="text-red-500">*</span></Label>
              <Select value={implantData.position} onValueChange={(value) => handleImplantDataChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${implantDialogType} tooth number`} />
                </SelectTrigger>
                <SelectContent>
                  {implantDialogType === 'upper' ? (
                    // Upper teeth numbers (1-16 in US numbering system)
                    <>
                      <SelectItem value="1">1 - Upper Right Third Molar</SelectItem>
                      <SelectItem value="2">2 - Upper Right Second Molar</SelectItem>
                      <SelectItem value="3">3 - Upper Right First Molar</SelectItem>
                      <SelectItem value="4">4 - Upper Right Second Premolar</SelectItem>
                      <SelectItem value="5">5 - Upper Right First Premolar</SelectItem>
                      <SelectItem value="6">6 - Upper Right Canine</SelectItem>
                      <SelectItem value="7">7 - Upper Right Lateral Incisor</SelectItem>
                      <SelectItem value="8">8 - Upper Right Central Incisor</SelectItem>
                      <SelectItem value="9">9 - Upper Left Central Incisor</SelectItem>
                      <SelectItem value="10">10 - Upper Left Lateral Incisor</SelectItem>
                      <SelectItem value="11">11 - Upper Left Canine</SelectItem>
                      <SelectItem value="12">12 - Upper Left First Premolar</SelectItem>
                      <SelectItem value="13">13 - Upper Left Second Premolar</SelectItem>
                      <SelectItem value="14">14 - Upper Left First Molar</SelectItem>
                      <SelectItem value="15">15 - Upper Left Second Molar</SelectItem>
                      <SelectItem value="16">16 - Upper Left Third Molar</SelectItem>
                    </>
                  ) : (
                    // Lower teeth numbers (17-32 in US numbering system)
                    <>
                      <SelectItem value="17">17 - Lower Left Third Molar</SelectItem>
                      <SelectItem value="18">18 - Lower Left Second Molar</SelectItem>
                      <SelectItem value="19">19 - Lower Left First Molar</SelectItem>
                      <SelectItem value="20">20 - Lower Left Second Premolar</SelectItem>
                      <SelectItem value="21">21 - Lower Left First Premolar</SelectItem>
                      <SelectItem value="22">22 - Lower Left Canine</SelectItem>
                      <SelectItem value="23">23 - Lower Left Lateral Incisor</SelectItem>
                      <SelectItem value="24">24 - Lower Left Central Incisor</SelectItem>
                      <SelectItem value="25">25 - Lower Right Central Incisor</SelectItem>
                      <SelectItem value="26">26 - Lower Right Lateral Incisor</SelectItem>
                      <SelectItem value="27">27 - Lower Right Canine</SelectItem>
                      <SelectItem value="28">28 - Lower Right First Premolar</SelectItem>
                      <SelectItem value="29">29 - Lower Right Second Premolar</SelectItem>
                      <SelectItem value="30">30 - Lower Right First Molar</SelectItem>
                      <SelectItem value="31">31 - Lower Right Second Molar</SelectItem>
                      <SelectItem value="32">32 - Lower Right Third Molar</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Two column layout starting from second row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="implant_brand">Implant Brand</Label>
                  <Select value={implantData.brand} onValueChange={(value) => {
                    handleImplantDataChange('brand', value);
                    // Reset subtype and size when brand changes
                    handleImplantDataChange('subtype', '');
                    handleImplantDataChange('size', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neodent">Neodent</SelectItem>
                      <SelectItem value="sin">SIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtype dropdown - for both Neodent and SIN */}
                {(implantData.brand === 'neodent' || implantData.brand === 'sin') && (
                  <div>
                    <Label htmlFor="implant_subtype">Implant Series</Label>
                    <Select value={implantData.subtype} onValueChange={(value) => {
                      handleImplantDataChange('subtype', value);
                      // Reset size when subtype changes
                      handleImplantDataChange('size', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select series" />
                      </SelectTrigger>
                      <SelectContent>
                        {implantData.brand === 'neodent' && (
                          <>
                            <SelectItem value="GM HELIX ACQUA">GM HELIX ACQUA</SelectItem>
                            <SelectItem value="GM ZYGOMA">GM ZYGOMA</SelectItem>
                            <SelectItem value="GM ZYGOMA S">GM ZYGOMA S</SelectItem>
                          </>
                        )}
                        {implantData.brand === 'sin' && (
                          <SelectItem value="Epikut Plus">Epikut Plus</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="implant_size">Implant Size</Label>
                  {(implantData.brand === 'neodent' || implantData.brand === 'sin') && implantData.subtype ? (
                    <Select value={implantData.size} onValueChange={(value) => handleImplantDataChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${implantData.subtype} size`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                    {implantData.subtype === 'GM HELIX ACQUA' && (
                      <>
                        <SelectItem value="3.5 X 8">3.5 X 8</SelectItem>
                        <SelectItem value="3.5 X 10">3.5 X 10</SelectItem>
                        <SelectItem value="3.5 X 11.5">3.5 X 11.5</SelectItem>
                        <SelectItem value="3.5 X 13">3.5 X 13</SelectItem>
                        <SelectItem value="3.5 X 16">3.5 X 16</SelectItem>
                        <SelectItem value="3.5 X 18">3.5 X 18</SelectItem>
                        <SelectItem value="3.75 X 8">3.75 X 8</SelectItem>
                        <SelectItem value="3.75 X 10">3.75 X 10</SelectItem>
                        <SelectItem value="3.75 X 11.5">3.75 X 11.5</SelectItem>
                        <SelectItem value="3.75 X 13">3.75 X 13</SelectItem>
                        <SelectItem value="3.75 X 16">3.75 X 16</SelectItem>
                        <SelectItem value="3.75 X 18">3.75 X 18</SelectItem>
                        <SelectItem value="3.75 X 20">3.75 X 20</SelectItem>
                        <SelectItem value="3.75 X 22.5">3.75 X 22.5</SelectItem>
                        <SelectItem value="3.75 X 25">3.75 X 25</SelectItem>
                        <SelectItem value="4 X 8">4 X 8</SelectItem>
                        <SelectItem value="4 X 10">4 X 10</SelectItem>
                        <SelectItem value="4 X 11.5">4 X 11.5</SelectItem>
                        <SelectItem value="4 X 13">4 X 13</SelectItem>
                        <SelectItem value="4 X 16">4 X 16</SelectItem>
                        <SelectItem value="4 X 18">4 X 18</SelectItem>
                        <SelectItem value="4 X 20">4 X 20</SelectItem>
                        <SelectItem value="4 X 22.5">4 X 22.5</SelectItem>
                        <SelectItem value="4 X 25">4 X 25</SelectItem>
                        <SelectItem value="4.3 X 8">4.3 X 8</SelectItem>
                        <SelectItem value="4.3 X 10">4.3 X 10</SelectItem>
                        <SelectItem value="4.3 X 11.5">4.3 X 11.5</SelectItem>
                        <SelectItem value="4.3 X 13">4.3 X 13</SelectItem>
                        <SelectItem value="4.3 X 16">4.3 X 16</SelectItem>
                        <SelectItem value="4.3 X 18">4.3 X 18</SelectItem>
                        <SelectItem value="5.0 X 8">5.0 X 8</SelectItem>
                        <SelectItem value="5.0 X 10">5.0 X 10</SelectItem>
                        <SelectItem value="5.0 X 11.5">5.0 X 11.5</SelectItem>
                        <SelectItem value="5.0 X 13">5.0 X 13</SelectItem>
                        <SelectItem value="5.0 X 16">5.0 X 16</SelectItem>
                        <SelectItem value="5.0 X 18">5.0 X 18</SelectItem>
                        <SelectItem value="6.0 X 8">6.0 X 8</SelectItem>
                        <SelectItem value="6.0 X 10">6.0 X 10</SelectItem>
                        <SelectItem value="6.0 X 11.5">6.0 X 11.5</SelectItem>
                        <SelectItem value="6.0 X 13">6.0 X 13</SelectItem>
                        <SelectItem value="7.0 X 8">7.0 X 8</SelectItem>
                        <SelectItem value="7.0 X 10">7.0 X 10</SelectItem>
                        <SelectItem value="7.0 X 11.5">7.0 X 11.5</SelectItem>
                        <SelectItem value="7.0 X 13">7.0 X 13</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'GM ZYGOMA' && (
                      <>
                        <SelectItem value="4 X 30">4 X 30</SelectItem>
                        <SelectItem value="4 X 35">4 X 35</SelectItem>
                        <SelectItem value="4 X 37.5">4 X 37.5</SelectItem>
                        <SelectItem value="4 X 40">4 X 40</SelectItem>
                        <SelectItem value="4 X 42.5">4 X 42.5</SelectItem>
                        <SelectItem value="4 X 45">4 X 45</SelectItem>
                        <SelectItem value="4 X 47.5">4 X 47.5</SelectItem>
                        <SelectItem value="4 X 50">4 X 50</SelectItem>
                        <SelectItem value="4 X 52.5">4 X 52.5</SelectItem>
                        <SelectItem value="4 X 55">4 X 55</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'GM ZYGOMA S' && (
                      <>
                        <SelectItem value="3.5 X 30">3.5 X 30</SelectItem>
                        <SelectItem value="3.5 X 35">3.5 X 35</SelectItem>
                        <SelectItem value="3.5 X 37.5">3.5 X 37.5</SelectItem>
                        <SelectItem value="3.5 X 40">3.5 X 40</SelectItem>
                        <SelectItem value="3.5 X 42.5">3.5 X 42.5</SelectItem>
                        <SelectItem value="3.5 X 45">3.5 X 45</SelectItem>
                        <SelectItem value="3.5 X 47.5">3.5 X 47.5</SelectItem>
                        <SelectItem value="3.5 X 50">3.5 X 50</SelectItem>
                        <SelectItem value="3.5 X 52.5">3.5 X 52.5</SelectItem>
                        <SelectItem value="3.5 X 55">3.5 X 55</SelectItem>
                        <SelectItem value="3.75 X 30">3.75 X 30</SelectItem>
                        <SelectItem value="3.75 X 35">3.75 X 35</SelectItem>
                        <SelectItem value="3.75 X 37.5">3.75 X 37.5</SelectItem>
                        <SelectItem value="3.75 X 40">3.75 X 40</SelectItem>
                        <SelectItem value="3.75 X 42.5">3.75 X 42.5</SelectItem>
                        <SelectItem value="3.75 X 45">3.75 X 45</SelectItem>
                        <SelectItem value="3.75 X 47.5">3.75 X 47.5</SelectItem>
                        <SelectItem value="3.75 X 50">3.75 X 50</SelectItem>
                        <SelectItem value="3.75 X 52.5">3.75 X 52.5</SelectItem>
                        <SelectItem value="3.75 X 55">3.75 X 55</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'Epikut Plus' && (
                      <>
                        <SelectItem value="3.5 X 8.5">3.5 X 8.5</SelectItem>
                        <SelectItem value="3.5 X 10">3.5 X 10</SelectItem>
                        <SelectItem value="3.5 X 11.5">3.5 X 11.5</SelectItem>
                        <SelectItem value="3.5 X 13">3.5 X 13</SelectItem>
                        <SelectItem value="3.5 X 15">3.5 X 15</SelectItem>
                        <SelectItem value="3.8 X 8.5">3.8 X 8.5</SelectItem>
                        <SelectItem value="3.8 X 10">3.8 X 10</SelectItem>
                        <SelectItem value="3.8 X 11.5">3.8 X 11.5</SelectItem>
                        <SelectItem value="3.8 X 13">3.8 X 13</SelectItem>
                        <SelectItem value="3.8 X 15">3.8 X 15</SelectItem>
                        <SelectItem value="4.5 X 8.5">4.5 X 8.5</SelectItem>
                        <SelectItem value="4.5 X 10">4.5 X 10</SelectItem>
                        <SelectItem value="4.5 X 11.5">4.5 X 11.5</SelectItem>
                        <SelectItem value="4.5 X 13">4.5 X 13</SelectItem>
                        <SelectItem value="4.5 X 15">4.5 X 15</SelectItem>
                        <SelectItem value="5 X 8.5">5 X 8.5</SelectItem>
                        <SelectItem value="5 X 10">5 X 10</SelectItem>
                        <SelectItem value="5 X 11.5">5 X 11.5</SelectItem>
                        <SelectItem value="5 X 13">5 X 13</SelectItem>
                        <SelectItem value="5 X 15">5 X 15</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                  ) : (
                    <Input
                      id="implant_size"
                      value={implantData.size}
                      onChange={(e) => handleImplantDataChange('size', e.target.value)}
                      placeholder={
                        (implantData.brand === 'neodent' || implantData.brand === 'sin') && !implantData.subtype
                          ? "Select series first"
                          : "Enter implant size"
                      }
                      disabled={(implantData.brand === 'neodent' || implantData.brand === 'sin') && !implantData.subtype}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="implant_picture">Implant Sticker Picture</Label>
                  <Button
                    type="button"
                    onClick={() => setShowImplantCamera(true)}
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    {implantData.implant_picture ? 'Retake Picture' : 'Capture Sticker'}
                  </Button>
                  {implantData.implant_picture && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Picture captured: {implantData.implant_picture.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(implantData.implant_picture.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - MUA Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mua_brand">MUA Brand</Label>
                  <Select value={implantData.mua_brand} onValueChange={(value) => {
                    handleImplantDataChange('mua_brand', value);
                    // Reset subtype and size when brand changes
                    handleImplantDataChange('mua_subtype', '');
                    handleImplantDataChange('mua_size', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select MUA brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neodent">Neodent</SelectItem>
                      <SelectItem value="sin">SIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MUA Subtype dropdown - for both Neodent and SIN */}
                {(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && (
                  <div>
                    <Label htmlFor="mua_subtype">MUA Series</Label>
                    <Select value={implantData.mua_subtype} onValueChange={(value) => {
                      handleImplantDataChange('mua_subtype', value);
                      // Reset size when subtype changes
                      handleImplantDataChange('mua_size', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select MUA series" />
                      </SelectTrigger>
                      <SelectContent>
                        {implantData.mua_brand === 'neodent' && (
                          <SelectItem value="GM MUA">GM MUA</SelectItem>
                        )}
                        {implantData.mua_brand === 'sin' && (
                          <SelectItem value="SIN MUA">SIN MUA</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="mua_size">MUA Size</Label>
                  {(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && implantData.mua_subtype ? (
                    <Select value={implantData.mua_size} onValueChange={(value) => handleImplantDataChange('mua_size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${implantData.mua_subtype} size`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {implantData.mua_subtype === 'GM MUA' && (
                          <>
                            <SelectItem value="0° X 0.8">0° X 0.8</SelectItem>
                            <SelectItem value="0° X 1.5">0° X 1.5</SelectItem>
                            <SelectItem value="0° X 2.5">0° X 2.5</SelectItem>
                            <SelectItem value="0° X 3.5">0° X 3.5</SelectItem>
                            <SelectItem value="0° X 4.5">0° X 4.5</SelectItem>
                            <SelectItem value="0° X 5.5">0° X 5.5</SelectItem>
                            <SelectItem value="17° X 1.5">17° X 1.5</SelectItem>
                            <SelectItem value="17° X 2.5">17° X 2.5</SelectItem>
                            <SelectItem value="17° X 3.5">17° X 3.5</SelectItem>
                            <SelectItem value="30° X 1.5">30° X 1.5</SelectItem>
                            <SelectItem value="30° X 2.5">30° X 2.5</SelectItem>
                            <SelectItem value="30° X 3.5">30° X 3.5</SelectItem>
                            <SelectItem value="45° X 1.5">45° X 1.5</SelectItem>
                            <SelectItem value="45° X 2.5">45° X 2.5</SelectItem>
                            <SelectItem value="45° Slim X 1.5">45° Slim X 1.5</SelectItem>
                            <SelectItem value="45° Slim X 2.5">45° Slim X 2.5</SelectItem>
                            <SelectItem value="52° X 1.5">52° X 1.5</SelectItem>
                            <SelectItem value="52° X 2.5">52° X 2.5</SelectItem>
                            <SelectItem value="60° X 1.5">60° X 1.5</SelectItem>
                            <SelectItem value="60° X 2.5">60° X 2.5</SelectItem>
                          </>
                        )}

                        {implantData.mua_subtype === 'SIN MUA' && (
                          <>
                            <SelectItem value="MUA-Straight - 4.8 X 0.8">MUA-Straight - 4.8 X 0.8</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 1.5">MUA-Straight - 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 2.5">MUA-Straight - 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 3.5">MUA-Straight - 4.8 X 3.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 4.5">MUA-Straight - 4.8 X 4.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 5.5">MUA-Straight - 4.8 X 5.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 1.5">MUA-17° X 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 2.5">MUA-17° X 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 3.5">MUA-17° X 4.8 X 3.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 1.5">MUA-30° X 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 2.5">MUA-30° X 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 3.5">MUA-30° X 4.8 X 3.5</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="mua_size"
                      value={implantData.mua_size}
                      onChange={(e) => handleImplantDataChange('mua_size', e.target.value)}
                      placeholder={
                        (implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && !implantData.mua_subtype
                          ? "Select MUA series first"
                          : "Enter MUA size"
                      }
                      disabled={(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && !implantData.mua_subtype}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="mua_picture">MUA Sticker Picture</Label>
                  <Button
                    type="button"
                    onClick={() => setShowMuaCamera(true)}
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    {implantData.mua_picture ? 'Retake Picture' : 'Capture Sticker'}
                  </Button>
                  {implantData.mua_picture && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Picture captured: {implantData.mua_picture.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(implantData.mua_picture.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImplantDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveImplant}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Implant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Camera Capture for Implant Sticker */}
      <SmartCameraCapture
        isOpen={showImplantCamera}
        onClose={() => setShowImplantCamera(false)}
        onCapture={(file) => {
          handleFileChange('implant_picture', file);
          setShowImplantCamera(false);
        }}
        title="Implant Sticker"
      />

      {/* Smart Camera Capture for MUA Sticker */}
      <SmartCameraCapture
        isOpen={showMuaCamera}
        onClose={() => setShowMuaCamera(false)}
        onCapture={(file) => {
          handleFileChange('mua_picture', file);
          setShowMuaCamera(false);
        }}
        title="MUA Sticker"
      />
    </div>
  );
}
