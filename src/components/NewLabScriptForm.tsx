import { useState } from "react";
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

interface NewLabScriptFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

export function NewLabScriptForm({ open, onClose, onSubmit }: NewLabScriptFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { addComment } = useLabScriptComments();

  // Hardcoded dropdown options
  const options = {
    appliance_type: [
      { id: 1, value: 'surgical-day-appliance', label: 'Surgical Day Appliance' },
      { id: 2, value: 'printed-tryin', label: 'Printed Tryin' },
      { id: 3, value: 'night-guard', label: 'Night Guard' },
      { id: 4, value: 'direct-load-pmma', label: 'Direct Load PMMA' },
      { id: 5, value: 'direct-load-zirconia', label: 'Direct Load Zirconia' },
      { id: 6, value: 'ti-bar-superstructure', label: 'Ti-Bar and Superstructure' },
      { id: 7, value: 'crown', label: 'Crown' },
      { id: 8, value: 'bridge', label: 'Bridge' }
    ],
    screw_type: [
      { id: 19, value: 'dc_screw', label: 'DC Screw' },
      { id: 20, value: 'rosen', label: 'Rosen' },
      { id: 21, value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
      { id: 22, value: 'powerball', label: 'Powerball' },
      { id: 23, value: 'dess', label: 'Dess' },
      { id: 24, value: 'sin_prh30', label: 'SIN PRH30' },
      { id: 25, value: 'neodent', label: 'Neodent' },
      { id: 26, value: 'other', label: 'Other' }
    ],
    vdo_details: [
      { id: 27, value: 'open_4mm_without', label: 'Open up to 4mm without calling Doctor' },
      { id: 28, value: 'open_4mm_with', label: 'Open up to 4mm with calling Doctor' },
      { id: 29, value: 'open_based_requirement', label: 'Open VDO based on requirement' },
      { id: 30, value: 'no_changes', label: 'No changes required in VDO' }
    ],
    material: [
      { id: 31, value: 'flexera-smile-ultra-plus', label: 'Flexera Smile Ultra Plus' },
      { id: 32, value: 'sprint-ray-onx', label: 'Sprint Ray ONX' },
      { id: 33, value: 'sprint-ray-nightguard-flex', label: 'Sprint Ray Nightguard Flex' },
      { id: 34, value: 'flexera-model-x', label: 'Flexera Model X' },
      { id: 35, value: 'zirconia', label: 'Zirconia' },
      { id: 36, value: 'pmma', label: 'PMMA' },
      { id: 37, value: 'onx-tough', label: 'ONX Tough' },
      { id: 38, value: 'titanium-zirconia', label: 'Titanium & Zirconia' },
      { id: 39, value: 'titanium', label: 'Titanium' }
    ],
    shade: [
      { id: 39, value: 'na', label: 'N/A' },
      { id: 40, value: 'a1', label: 'A1' },
      { id: 41, value: 'a2', label: 'A2' },
      { id: 42, value: 'a3', label: 'A3' },
      { id: 43, value: 'a3.5', label: 'A3.5' },
      { id: 44, value: 'a4', label: 'A4' },
      { id: 45, value: 'b1', label: 'B1' },
      { id: 46, value: 'b2', label: 'B2' },
      { id: 47, value: 'b3', label: 'B3' },
      { id: 48, value: 'b4', label: 'B4' },
      { id: 49, value: 'c1', label: 'C1' },
      { id: 50, value: 'c2', label: 'C2' },
      { id: 51, value: 'c3', label: 'C3' },
      { id: 52, value: 'c4', label: 'C4' },
      { id: 53, value: 'd2', label: 'D2' },
      { id: 54, value: 'd3', label: 'D3' },
      { id: 55, value: 'd4', label: 'D4' },
      { id: 56, value: 'bl1', label: 'BL1' },
      { id: 57, value: 'bl2', label: 'BL2' },
      { id: 58, value: 'bl3', label: 'BL3' },
      { id: 59, value: 'bl4', label: 'BL4' },
      { id: 60, value: 'bleach', label: 'BLEACH' },
      { id: 61, value: 'nw', label: 'NW' },
      { id: 62, value: 'clear', label: 'Clear' },
      { id: 63, value: 'custom', label: 'Custom' }
    ]
  };
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    archType: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation logic for required fields
    const errors: string[] = [];

    // Patient is always required
    if (!formData.patientId || !formData.patientName) {
      errors.push("Patient selection is required");
    }

    // Arch type is always required
    if (!formData.archType) {
      errors.push("Arch type is required");
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
        errors.push("Upper appliance type is required");
      }
      if (!formData.lowerApplianceType) {
        errors.push("Lower appliance type is required");
      }
    }

    // Screw type validation (when visible)
    const shouldShowScrewType = () => {
      if (formData.archType === "upper") {
        return formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "denture";
      } else if (formData.archType === "lower") {
        return formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "denture";
      } else if (formData.archType === "dual") {
        const upperIsNightGuardOrDenture = formData.upperApplianceType === "night-guard" || formData.upperApplianceType === "denture";
        const lowerIsNightGuardOrDenture = formData.lowerApplianceType === "night-guard" || formData.lowerApplianceType === "denture";
        return !(upperIsNightGuardOrDenture && lowerIsNightGuardOrDenture);
      }
      return false;
    };

    if (shouldShowScrewType() && !formData.screwType) {
      errors.push("Screw type is required");
    }

    // Custom screw type validation (when "Other" is selected)
    if (formData.screwType === "Other" && !formData.customScrewType.trim()) {
      errors.push("Custom screw type specification is required");
    }

    // VDO Details validation (when visible)
    const shouldShowVDODetails = () => {
      if (formData.archType === "upper") {
        return formData.upperApplianceType !== "night-guard";
      } else if (formData.archType === "lower") {
        return formData.lowerApplianceType !== "night-guard";
      } else if (formData.archType === "dual") {
        const upperIsNightGuard = formData.upperApplianceType === "night-guard";
        const lowerIsNightGuard = formData.lowerApplianceType === "night-guard";
        return !(upperIsNightGuard && lowerIsNightGuard);
      }
      return false;
    };

    if (shouldShowVDODetails() && !formData.vdoDetails) {
      errors.push("VDO details selection is required");
    }

    // Nightguard needed validation (when visible)
    const shouldShowNightguardQuestion = () => {
      if (formData.archType === "upper") {
        return formData.upperApplianceType !== "denture" && formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "";
      } else if (formData.archType === "lower") {
        return formData.lowerApplianceType !== "denture" && formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "";
      } else if (formData.archType === "dual") {
        const upperNeedQuestion = formData.upperApplianceType !== "denture" && formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "";
        const lowerNeedQuestion = formData.lowerApplianceType !== "denture" && formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "";
        return upperNeedQuestion || lowerNeedQuestion;
      }
      return false;
    };

    if (shouldShowNightguardQuestion() && !formData.isNightguardNeeded) {
      errors.push("Nightguard needed selection is required");
    }

    // Date validation
    if (!formData.requestedDate) {
      errors.push("Requested date is required");
    }
    if (!formData.dueDate) {
      errors.push("Due date is required");
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      errors.push("Special instructions are required");
    }

    // Show validation errors
    if (errors.length > 0) {
      toast.error(`Please complete the following required fields:\n${errors.join('\n')}`);
      return;
    }

    try {
      // Submit the lab script and get the created lab script with ID
      const createdLabScript = await onSubmit(formData);

      // If there's a notes field with content and we got a lab script ID, save it as a comment
      if (formData.notes && formData.notes.trim() && createdLabScript?.id) {
        try {
          await addComment({
            comment_text: formData.notes.trim(),
            author_name: "Guest",
            author_role: "Guest"
          }, createdLabScript.id);
        } catch (commentError) {
          console.error("Error adding comment:", commentError);
          // Don't fail the whole operation if comment fails
          toast.error("Lab script created but failed to save comment");
        }
      }

      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        archType: "",
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
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create lab script. Please try again.");
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // AI Enhancement function
  const enhanceInstructions = async () => {
    if (!formData.instructions.trim()) {
      toast.error("Please enter some instructions first");
      return;
    }

    setIsEnhancing(true);
    try {
      const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

      console.log('🔍 Detailed Environment check:', {
        hasOpenRouterKey: !!OPENROUTER_API_KEY,
        openRouterKeyLength: OPENROUTER_API_KEY?.length,
        openRouterKeyStart: OPENROUTER_API_KEY?.substring(0, 15) + '...',
        allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
        currentOrigin: window.location.origin,
        isProduction: import.meta.env.PROD
      });

      // Check if OpenRouter API key is configured
      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        console.error('❌ OpenRouter API key not configured properly');
        toast.error("AI enhancement unavailable. Please configure OpenRouter API key in .env file.");
        return;
      }

      // Validate OpenRouter API key format
      if (!OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
        console.error('❌ Invalid OpenRouter API key format. Expected format: sk-or-v1-...');
        toast.error("Invalid OpenRouter API key format.");
        return;
      }

      console.log('✅ API key validation passed, making request...');

      // Test API key with a simple request first
      try {
        console.log('🧪 Testing API key with simple request...');
        const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        if (testResponse.ok) {
          console.log('✅ API key test successful');
        } else {
          console.error('❌ API key test failed:', {
            status: testResponse.status,
            statusText: testResponse.statusText
          });
          toast.error(`OpenRouter API key test failed: ${testResponse.status}`);
          return;
        }
      } catch (testError) {
        console.error('💥 API key test error:', testError);
        toast.error("OpenRouter API key test failed. Please check your API key.");
        return;
      }

      let lastError = null;

      // Use only Google Gemini 2.0 Flash (FREE) from OpenRouter
      const model = 'google/gemini-2.0-flash-exp:free';

      try {
        console.log(`🔄 Using model: ${model} (FREE Gemini 2.0)`);

        const requestBody = {
          model: model,
            messages: [{
              role: 'user',
              content: `Please rewrite the following dental lab script instructions. This is clinical staff giving design instructions to the designer for patient appliance modifications or new designs:

"${formData.instructions}"

ENHANCEMENT RULES:
- Keep ALL abbreviations and short forms EXACTLY as written (PTI, SDA, USDA, etc.)
- Do NOT expand or elaborate any abbreviations
- Keep ALL numbers, measurements, specifications unchanged
- Keep ALL materials, shades, tooth numbers exactly as provided
- Rephrase the entire text comprehensively
- Use proper dental terminology and professional tone throughout
- Make the tone consistently professional and polished
- Correct grammar and improve sentence structure
- Format content with proper layout and structure
- Convert any lists into bullet points (•)
- Write as clinical staff instructing designer on patient design requirements
- End with only "Thank you." - nothing else
- Preserve the original meaning and all technical terms

Examples:
Input: "need PTI for upper, shade A1, make fast, also check bite, use good material"
Output: "Please design the following for the patient:
• PTI for upper, shade A1, with expedited completion
• Verify occlusal contacts during design
• Utilize high-quality materials

Thank you."

Input: "patient needs crown tooth 8, bridge 14-16, both rush, modify existing design"
Output: "Please modify the existing design and create:
• Crown for tooth #8
• Bridge for teeth #14-16
Both designs require expedited completion.

Thank you."

Please respond with only the professionally enhanced text, no additional commentary.`
            }],
            max_tokens: 500,
            temperature: 0.3
          };

          console.log('📤 Request details:', {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY.substring(0, 15)}...`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Dental Lab Management System'
            },
            bodySize: JSON.stringify(requestBody).length,
            model: requestBody.model,
            isFreeModel: model.includes(':free')
          });

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin || 'https://dental-lab-management.vercel.app',
              'X-Title': 'Dental Lab Management System',
              'Origin': window.location.origin || 'https://dental-lab-management.vercel.app'
            },
            body: JSON.stringify(requestBody)
          });

          console.log('📡 Response status:', response.status);
          console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Model ${model} failed:`, {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText,
              headers: Object.fromEntries(response.headers.entries()),
              requestHeaders: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY.substring(0, 15)}...`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Dental Lab Management System'
              }
            });

            // Provide specific error messages for Gemini 2.0
            if (response.status === 401) {
              toast.error("OpenRouter API key authentication failed. Please check your API key.");
            } else if (response.status === 403) {
              toast.error("Access forbidden to Gemini 2.0 Flash. Check your OpenRouter account permissions.");
            } else if (response.status === 429) {
              toast.error("Rate limit exceeded for Gemini 2.0 Flash. Please try again later.");
            } else if (response.status >= 500) {
              toast.error("Gemini 2.0 Flash service temporarily unavailable. Please try again.");
            } else {
              toast.error(`Gemini 2.0 Flash Error: ${response.status} - ${errorText}`);
            }

            throw new Error(`Gemini 2.0 Flash: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log(`✅ Gemini 2.0 Flash succeeded:`, data);
          const enhancedText = data.choices?.[0]?.message?.content;

          if (enhancedText) {
            handleInputChange("instructions", enhancedText.trim());
            toast.success("Instructions enhanced with AI! (Google Gemini 2.0 Flash - FREE!)");
            return; // Success! Exit the function
          } else {
            console.error(`❌ No enhanced text from Gemini 2.0 Flash:`, data);
            throw new Error('No enhanced text received from Gemini 2.0 Flash');
          }
        } catch (error) {
          console.error(`💥 Error with Gemini 2.0 Flash:`, error);
          throw error;
        }
    } catch (error) {
      console.error('💥 Error enhancing instructions:', {
        error: error,
        message: error.message,
        stack: error.stack
      });

      // Only show generic error if we haven't already shown a specific one
      if (!error.message.includes('API Error:')) {
        toast.error("AI enhancement failed. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      patientId: "",
      patientName: "",
      archType: "",
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FlaskConical className="h-6 w-6 text-indigo-600" />
            New Lab Script
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

            {/* Screw Type - Checkbox Buttons - Conditional Display */}
            {(() => {
              // Logic to determine if screw type should be shown
              const shouldShowScrewType = () => {
                if (formData.archType === "upper") {
                  // For upper arch, hide if night-guard or denture is selected
                  return formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "denture";
                } else if (formData.archType === "lower") {
                  // For lower arch, hide if night-guard or denture is selected
                  return formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "denture";
                } else if (formData.archType === "dual") {
                  // For dual arch, show if at least one appliance is NOT night-guard or denture
                  const upperIsNightGuardOrDenture = formData.upperApplianceType === "night-guard" || formData.upperApplianceType === "denture";
                  const lowerIsNightGuardOrDenture = formData.lowerApplianceType === "night-guard" || formData.lowerApplianceType === "denture";
                  return !(upperIsNightGuardOrDenture && lowerIsNightGuardOrDenture);
                }
                return false; // Hide if no arch type is selected
              };

              return shouldShowScrewType() ? (
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
              // Logic to determine if VDO details should be shown
              const shouldShowVDODetails = () => {
                if (formData.archType === "upper") {
                  // For upper arch, hide if night-guard is selected
                  return formData.upperApplianceType !== "night-guard";
                } else if (formData.archType === "lower") {
                  // For lower arch, hide if night-guard is selected
                  return formData.lowerApplianceType !== "night-guard";
                } else if (formData.archType === "dual") {
                  // For dual arch, show if at least one appliance is NOT night-guard
                  const upperIsNightGuard = formData.upperApplianceType === "night-guard";
                  const lowerIsNightGuard = formData.lowerApplianceType === "night-guard";
                  return !(upperIsNightGuard && lowerIsNightGuard);
                }
                return false; // Hide if no arch type is selected
              };

              return shouldShowVDODetails() ? (
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
              // Logic to determine if nightguard question should be shown
              const shouldShowNightguardQuestion = () => {
                if (formData.archType === "upper") {
                  // For upper arch, show if appliance is NOT denture or night-guard
                  return formData.upperApplianceType !== "denture" && formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "";
                } else if (formData.archType === "lower") {
                  // For lower arch, show if appliance is NOT denture or night-guard
                  return formData.lowerApplianceType !== "denture" && formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "";
                } else if (formData.archType === "dual") {
                  // For dual arch, show if at least one appliance is NOT denture or night-guard
                  const upperNeedQuestion = formData.upperApplianceType !== "denture" && formData.upperApplianceType !== "night-guard" && formData.upperApplianceType !== "";
                  const lowerNeedQuestion = formData.lowerApplianceType !== "denture" && formData.lowerApplianceType !== "night-guard" && formData.lowerApplianceType !== "";
                  return upperNeedQuestion || lowerNeedQuestion;
                }
                return false; // Hide if no arch type is selected
              };

              return shouldShowNightguardQuestion() ? (
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
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Enhance with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Enter any special instructions for the lab..."
                rows={3}
              />
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
              Create Lab Script
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
