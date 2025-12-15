import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PatientAutocomplete } from "@/components/PatientAutocomplete";
import { User, FlaskConical, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useLabScriptComments } from "@/hooks/useLabScriptComments";
import { enhanceLabInstructions } from "@/services/geminiAI";
import { LabScript } from "@/hooks/useLabScripts";
import { useLabScriptConfig } from "@/hooks/useLabScriptConfig";
import { useFieldVisibilityRules } from "@/hooks/useFieldVisibilityRules";

interface EditLabScriptFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<any>;
  labScript: LabScript | null;
}

export function EditLabScriptForm({ open, onClose, onSubmit, labScript }: EditLabScriptFormProps) {

  const { addComment } = useLabScriptComments();
  const { treatmentTypes, applianceTypes, materials, shades } = useLabScriptConfig();
  const { shouldShowField } = useFieldVisibilityRules();

  // Convert dynamic data to options format
  const options = {
    treatment_type: treatmentTypes.map(t => ({ id: t.id, value: t.value, label: t.name })),
    appliance_type: applianceTypes.map(a => ({ id: a.id, value: a.value, label: a.name })),
    screw_type: [
      { id: '19', value: 'dc_screw', label: 'DC Screw' },
      { id: '20', value: 'rosen', label: 'Rosen' },
      { id: '21', value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
      { id: '22', value: 'powerball', label: 'Powerball' },
      { id: '23', value: 'dess', label: 'Dess' },
      { id: '24', value: 'sin_prh30', label: 'SIN PRH30' },
      { id: '25', value: 'neodent', label: 'Neodent' },
      { id: '26', value: 'other', label: 'Other' }
    ],
    vdo_details: [
      { id: '27', value: 'open_4mm_without', label: 'Open up to 4mm without calling Doctor' },
      { id: '28', value: 'open_4mm_with', label: 'Open up to 4mm with calling Doctor' },
      { id: '29', value: 'open_based_requirement', label: 'Open VDO based on requirement' },
      { id: '30', value: 'no_changes', label: 'No changes required in VDO' }
    ],
    material: materials.map(m => ({ id: m.id, value: m.value, label: m.name })),
    shade: shades.map(s => ({ id: s.id, value: s.value, label: s.name }))
  };

  // AI Enhancement states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState({ start: 0, end: 0 });
  const [showSelectionShortcut, setShowSelectionShortcut] = useState(false);

  // Hide selection shortcut when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSelectionShortcut(false);
    };

    if (showSelectionShortcut) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSelectionShortcut]);

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    archType: "",
    upperTreatmentType: "",
    lowerTreatmentType: "",
    upperApplianceType: "",
    lowerApplianceType: "",
    screwType: "",
    customScrewType: "",
    material: "",
    shade: "",
    vdoDetails: "",
    isNightguardNeeded: "",
    requestedDate: new Date().toISOString().split('T')[0], // Today's date
    dueDate: "",
    instructions: "",
    notes: ""
  });

  // Pre-fill form data when labScript changes
  useEffect(() => {
    if (labScript && open) {
      setFormData({
        patientId: labScript.patient_id || "",
        patientName: labScript.patient_name || "",
        archType: labScript.arch_type || "",
        upperTreatmentType: labScript.upper_treatment_type || "",
        lowerTreatmentType: labScript.lower_treatment_type || "",
        upperApplianceType: labScript.upper_appliance_type || "",
        lowerApplianceType: labScript.lower_appliance_type || "",
        screwType: labScript.screw_type || "",
        customScrewType: labScript.custom_screw_type || "",
        material: labScript.material || "",
        shade: labScript.shade || "",
        vdoDetails: labScript.vdo_details || "",
        isNightguardNeeded: labScript.is_nightguard_needed || "",
        requestedDate: labScript.requested_date || "",
        dueDate: labScript.due_date || "",
        instructions: labScript.instructions || "",
        notes: labScript.notes || ""
      });
    }
  }, [labScript, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({
      ...prev,
      patientId: patientId,
      patientName: patientName
    }));
  };

  // Text selection handling for AI enhancement
  const handleTextSelection = () => {
    const textarea = document.getElementById('instructions') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      
      if (selected.length > 0) {
        setSelectedText(selected);
        setSelectionPosition({ start, end });
        setShowSelectionShortcut(true);
      } else {
        setShowSelectionShortcut(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!labScript) {
      toast.error("No lab script selected for editing");
      return;
    }

    // Validation logic for required fields (matching NewLabScriptForm)
    const errors: string[] = [];

    // Patient is always required
    if (!formData.patientId || !formData.patientName) {
      errors.push("Patient selection is required");
    }

    // Arch type is always required
    if (!formData.archType) {
      errors.push("Arch type is required");
    }

    // Treatment type validation based on arch selection
    if (formData.archType === "upper" && !formData.upperTreatmentType) {
      errors.push("Upper treatment type is required");
    }
    if (formData.archType === "lower" && !formData.lowerTreatmentType) {
      errors.push("Lower treatment type is required");
    }
    if (formData.archType === "dual") {
      if (!formData.upperTreatmentType) {
        errors.push("Upper treatment type is required");
      }
      if (!formData.lowerTreatmentType) {
        errors.push("Lower treatment type is required");
      }
    }

    // Appliance type validation based on arch selection
    if (formData.archType === "upper" && !formData.upperApplianceType) {
      errors.push("Upper appliance type is required");
    }
    if (formData.archType === "lower" && !formData.lowerApplianceType) {
      errors.push("Lower appliance type is required");
    }
    if (formData.archType === "dual") {
      if (!formData.upperApplianceType) {
        errors.push("Upper appliance type is required for dual arch");
      }
      if (!formData.lowerApplianceType) {
        errors.push("Lower appliance type is required for dual arch");
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast.error(`Please complete the following required fields:\n${errors.join('\n')}`);
      return;
    }

    try {
      // Submit the updated lab script
      await onSubmit(labScript.id, formData);

      // If there's a notes field with content and we got a lab script ID, save it as a comment
      if (formData.notes && formData.notes.trim() && labScript?.id) {
        try {
          await addComment({
            comment_text: formData.notes.trim(),
            author_name: "Guest",
            author_role: "Guest"
          }, labScript.id);
        } catch (commentError) {
          console.error("Error adding comment:", commentError);
          // Don't fail the whole operation if comment fails
          toast.error("Lab script updated but failed to save comment");
        }
      }

      onClose();
    } catch (error) {
      console.error("Error updating lab script:", error);
      toast.error("Failed to update lab script. Please try again.");
    }
  };

  // AI Enhancement function for selected text
  const enhanceSelectedText = async () => {
    if (!selectedText.trim()) {
      toast.error("No text selected for enhancement.");
      return;
    }

    setIsEnhancing(true);
    setShowSelectionShortcut(false);

    try {
      console.log('🤖 Enhancing selected text with Google Gemini...');
      const enhancedText = await enhanceLabInstructions(selectedText);

      // Replace the selected text with enhanced version
      const currentInstructions = formData.instructions;
      const newInstructions =
        currentInstructions.substring(0, selectionPosition.start) +
        enhancedText +
        currentInstructions.substring(selectionPosition.end);

      handleInputChange("instructions", newInstructions);
      toast.success("Selected text professionally rewritten!");

    } catch (error) {
      console.error('💥 Error enhancing selected text:', error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("AI enhancement failed. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  // AI Enhancement function for entire text
  const enhanceInstructions = async () => {
    const currentInstructions = formData.instructions.trim();

    if (!currentInstructions) {
      toast.error("Please enter some instructions first before enhancing.");
      return;
    }

    if (currentInstructions.length < 10) {
      toast.error("Please enter more detailed instructions before enhancing.");
      return;
    }

    setIsEnhancing(true);

    try {
      console.log('🤖 Enhancing instructions with Google Gemini...');
      const enhancedText = await enhanceLabInstructions(currentInstructions);

      handleInputChange("instructions", enhancedText);
      toast.success("Design instructions professionally rewritten with proper dental terminology!");

    } catch (error) {
      console.error('💥 Error enhancing instructions:', error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("AI enhancement failed. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FlaskConical className="h-6 w-6 text-indigo-600" />
            Edit Lab Script
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Patient Information
            </h3>
            <div>
              <PatientAutocomplete
                value={formData.patientName}
                onChange={handlePatientSelect}
                placeholder="Search for a patient..."
                required
              />
            </div>
          </div>

          {/* Appliance Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-600" />
              Appliance Details
            </h3>
            {/* Arch Type Selection */}
            <div>
              <Label>Arch Type *</Label>
              <div className="flex gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => handleInputChange("archType", "upper")}
                  className={`flex-1 px-2 py-2 h-10 rounded-md text-xs font-medium transition-all duration-200 border whitespace-nowrap flex items-center justify-center gap-2 ${
                    formData.archType === "upper"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    formData.archType === "upper"
                      ? "border-white"
                      : "border-gray-400"
                  }`}>
                    {formData.archType === "upper" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  Upper Arch
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("archType", "lower")}
                  className={`flex-1 px-2 py-2 h-10 rounded-md text-xs font-medium transition-all duration-200 border whitespace-nowrap flex items-center justify-center gap-2 ${
                    formData.archType === "lower"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    formData.archType === "lower"
                      ? "border-white"
                      : "border-gray-400"
                  }`}>
                    {formData.archType === "lower" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  Lower Arch
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("archType", "dual")}
                  className={`flex-1 px-2 py-2 h-10 rounded-md text-xs font-medium transition-all duration-200 border whitespace-nowrap flex items-center justify-center gap-2 ${
                    formData.archType === "dual"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    formData.archType === "dual"
                      ? "border-white"
                      : "border-gray-400"
                  }`}>
                    {formData.archType === "dual" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  Dual Arch
                </button>
              </div>
            </div>

            {/* Dynamic Treatment Type based on Arch Selection */}
            {formData.archType === "upper" && (
              <div>
                <Label htmlFor="upperTreatmentType">Upper Treatment Type *</Label>
                <Select value={formData.upperTreatmentType} onValueChange={(value) => handleInputChange("upperTreatmentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select upper treatment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.treatment_type.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.archType === "lower" && (
              <div>
                <Label htmlFor="lowerTreatmentType">Lower Treatment Type *</Label>
                <Select value={formData.lowerTreatmentType} onValueChange={(value) => handleInputChange("lowerTreatmentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lower treatment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.treatment_type.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dual Arch Treatment Types - Full Width Row */}
            {formData.archType === "dual" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upperTreatmentType">Upper Treatment Type *</Label>
                  <Select value={formData.upperTreatmentType} onValueChange={(value) => handleInputChange("upperTreatmentType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select upper treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.treatment_type.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lowerTreatmentType">Lower Treatment Type *</Label>
                  <Select value={formData.lowerTreatmentType} onValueChange={(value) => handleInputChange("lowerTreatmentType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lower treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.treatment_type.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Dynamic Appliance Type based on Arch Selection */}
            {formData.archType === "upper" && (
              <div>
                <Label htmlFor="upperApplianceType">Upper Appliance Type *</Label>
                <Select value={formData.upperApplianceType} onValueChange={(value) => handleInputChange("upperApplianceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select upper appliance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.appliance_type.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.archType === "lower" && (
              <div>
                <Label htmlFor="lowerApplianceType">Lower Appliance Type *</Label>
                <Select value={formData.lowerApplianceType} onValueChange={(value) => handleInputChange("lowerApplianceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lower appliance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.appliance_type.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dual Arch Appliance Types - Full Width Row */}
            {formData.archType === "dual" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upperApplianceType">Upper Appliance Type *</Label>
                  <Select value={formData.upperApplianceType} onValueChange={(value) => handleInputChange("upperApplianceType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select upper appliance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.appliance_type.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lowerApplianceType">Lower Appliance Type *</Label>
                  <Select value={formData.lowerApplianceType} onValueChange={(value) => handleInputChange("lowerApplianceType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lower appliance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.appliance_type.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Screw Type - Checkbox Buttons - Conditional Display */}
          {(() => {
            // Using dynamic visibility rules
            const screwTypeVisible = shouldShowField('screw_type', {
              archType: formData.archType,
              upperTreatmentType: formData.upperTreatmentType,
              lowerTreatmentType: formData.lowerTreatmentType,
              upperApplianceType: formData.upperApplianceType,
              lowerApplianceType: formData.lowerApplianceType,
            });

            return screwTypeVisible ? (
              <div>
                <Label>Screw Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {options.screw_type.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleInputChange("screwType", formData.screwType === option.label ? "" : option.label)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                        formData.screwType === option.label
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.screwType === option.label
                          ? "border-white"
                          : "border-gray-400"
                      }`}>
                        {formData.screwType === option.label && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom Screw Type Input - Shows when "Other" is selected */}
                {formData.screwType === "Other" && (
                  <div className="mt-3">
                    <Label htmlFor="customScrewType">Specify Other Screw Type</Label>
                    <Input
                      id="customScrewType"
                      value={formData.customScrewType}
                      onChange={(e) => handleInputChange("customScrewType", e.target.value)}
                      placeholder="Enter custom screw type..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            ) : null;
          })()}

          {/* VDO Details - Checkbox Buttons - Conditional Display */}
          {(() => {
            // Using dynamic visibility rules
            const vdoDetailsVisible = shouldShowField('vdo_details', {
              archType: formData.archType,
              upperTreatmentType: formData.upperTreatmentType,
              lowerTreatmentType: formData.lowerTreatmentType,
              upperApplianceType: formData.upperApplianceType,
              lowerApplianceType: formData.lowerApplianceType,
            });

            return vdoDetailsVisible ? (
              <div>
                <Label>VDO Details *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {options.vdo_details.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleInputChange("vdoDetails", formData.vdoDetails === option.label ? "" : option.label)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border text-left flex items-center gap-2 ${
                        formData.vdoDetails === option.label
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.vdoDetails === option.label
                          ? "border-white"
                          : "border-gray-400"
                      }`}>
                        {formData.vdoDetails === option.label && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Is Nightguard Needed - Conditional Display */}
          {(() => {
            // Using dynamic visibility rules
            const nightguardQuestionVisible = shouldShowField('nightguard_question', {
              archType: formData.archType,
              upperTreatmentType: formData.upperTreatmentType,
              lowerTreatmentType: formData.lowerTreatmentType,
              upperApplianceType: formData.upperApplianceType,
              lowerApplianceType: formData.lowerApplianceType,
            });

            return nightguardQuestionVisible ? (
              <div>
                <Label>Is Nightguard needed? *</Label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange("isNightguardNeeded", formData.isNightguardNeeded === "yes" ? "" : "yes")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-2 ${
                      formData.isNightguardNeeded === "yes"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      formData.isNightguardNeeded === "yes"
                        ? "border-white"
                        : "border-gray-400"
                    }`}>
                      {formData.isNightguardNeeded === "yes" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("isNightguardNeeded", formData.isNightguardNeeded === "no" ? "" : "no")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-2 ${
                      formData.isNightguardNeeded === "no"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      formData.isNightguardNeeded === "no"
                        ? "border-white"
                        : "border-gray-400"
                    }`}>
                      {formData.isNightguardNeeded === "no" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    No
                  </button>
                </div>
              </div>
            ) : null;
          })()}

          {/* Material and Shade Fields - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="material">Material</Label>
              <Select
                value={options.material.find(opt => opt.label === formData.material)?.value || formData.material}
                onValueChange={(value) => {
                  // Find the option and save the label (which has correct case)
                  const selectedOption = options.material.find(opt => opt.value === value);
                  handleInputChange("material", selectedOption ? selectedOption.label : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {options.material.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shade">Shade</Label>
              <Select
                value={options.shade.find(opt => opt.label === formData.shade)?.value || formData.shade}
                onValueChange={(value) => {
                  // Find the option and save the label (which has correct case)
                  const selectedOption = options.shade.find(opt => opt.value === value);
                  handleInputChange("shade", selectedOption ? selectedOption.label : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shade" />
                </SelectTrigger>
                <SelectContent>
                  {options.shade.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Fields - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestedDate">Requested Date *</Label>
              <div className="relative">
                <Input
                  id="requestedDate"
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => handleInputChange("requestedDate", e.target.value)}
                  required
                  className="[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  required
                  className="[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Instructions & Notes */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="instructions">Special Instructions *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={enhanceInstructions}
                  disabled={isEnhancing || !formData.instructions.trim()}
                  className="flex items-center gap-2 text-xs"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Professional Rewrite
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  onSelect={handleTextSelection}
                  onMouseUp={handleTextSelection}
                  placeholder="Enter any special instructions for the lab..."
                  rows={3}
                  required
                />
                {showSelectionShortcut && (
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={enhanceSelectedText}
                      disabled={isEnhancing}
                      className="text-xs bg-white shadow-md"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Enhance Selected
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes or comments..."
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Update Lab Script
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
