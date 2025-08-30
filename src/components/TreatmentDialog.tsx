import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Stethoscope, X } from "lucide-react";

interface TreatmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (treatmentData: TreatmentData) => void;
  initialData?: TreatmentData;
}

export interface TreatmentData {
  archType: string;
  upperTreatment: string[];
  lowerTreatment: string[];
  upperSurgeryDate: string;
  lowerSurgeryDate: string;
}

const treatmentOptions = [
  "NO TREATMENT",
  "FULL ARCH FIXED",
  "DENTURE",
  "IMPLANT REMOVABLE DENTURE",
  "SINGLE IMPLANT",
  "MULTIPLE IMPLANTS",
  "EXTRACTION",
  "EXTRACTION AND GRAFT"
];

export function TreatmentDialog({ isOpen, onClose, onSubmit, initialData }: TreatmentDialogProps) {
  const [formData, setFormData] = useState<TreatmentData>({
    archType: initialData?.archType || "",
    upperTreatment: initialData?.upperTreatment || [],
    lowerTreatment: initialData?.lowerTreatment || [],
    upperSurgeryDate: initialData?.upperSurgeryDate || "",
    lowerSurgeryDate: initialData?.lowerSurgeryDate || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    console.log('TreatmentDialog initialData changed:', initialData); // Debug log
    if (initialData) {
      const newFormData = {
        archType: initialData.archType || "",
        upperTreatment: initialData.upperTreatment || "",
        lowerTreatment: initialData.lowerTreatment || "",
        upperSurgeryDate: initialData.upperSurgeryDate || "",
        lowerSurgeryDate: initialData.lowerSurgeryDate || ""
      };
      console.log('Setting form data to:', newFormData); // Debug log
      setFormData(newFormData);
    } else {
      // Reset form for new treatment
      setFormData({
        archType: "",
        upperTreatment: "",
        lowerTreatment: "",
        upperSurgeryDate: "",
        lowerSurgeryDate: ""
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof TreatmentData, value: string) => {
    setFormData(prev => {
      // If changing arch type, clear related fields
      if (field === 'archType') {
        const newData = {
          ...prev,
          [field]: value,
          // Clear all treatment fields when arch type changes
          upperTreatment: "",
          lowerTreatment: "",
          upperSurgeryDate: "",
          lowerSurgeryDate: ""
        };
        return newData;
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting treatment data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      archType: "",
      upperTreatment: "",
      lowerTreatment: "",
      upperSurgeryDate: "",
      lowerSurgeryDate: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              {initialData ? "Edit Treatment Information" : "Add Treatment Information"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Arch Type Selection */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-blue-900">Select Arch Type</h3>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => handleInputChange('archType', 'upper')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.archType === 'upper'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                Upper Arch
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange('archType', 'lower')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.archType === 'lower'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                Lower Arch
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange('archType', 'dual')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.archType === 'dual'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                Dual Arch
              </Button>
            </div>
          </div>

          {/* Treatment Sections - Conditional based on arch type */}
          {formData.archType && (
            <div className={`grid grid-cols-1 ${formData.archType === 'dual' ? 'md:grid-cols-2' : ''} gap-6`}>
            {/* Upper Treatment Section */}
            {(formData.archType === 'upper' || formData.archType === 'dual') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-blue-900">Upper Arch Treatment</h3>
                </div>

                <div>
                  <Label htmlFor="upperTreatment" className="text-blue-800 font-medium">
                    Upper Treatment Type
                  </Label>
                  <Select
                    value={formData.upperTreatment}
                    onValueChange={(value) => handleInputChange('upperTreatment', value)}
                  >
                    <SelectTrigger className="mt-2 border-blue-300 focus:border-blue-500">
                      <SelectValue placeholder="Select upper treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatmentOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="upperSurgeryDate" className="text-blue-800 font-medium">
                    Upper Surgery Date
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="upperSurgeryDate"
                      type="date"
                      value={formData.upperSurgeryDate}
                      onChange={(e) => handleInputChange('upperSurgeryDate', e.target.value)}
                      className="border-blue-300 focus:border-blue-500 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Lower Treatment Section */}
            {(formData.archType === 'lower' || formData.archType === 'dual') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-blue-900">Lower Arch Treatment</h3>
                </div>

                <div>
                  <Label htmlFor="lowerTreatment" className="text-blue-800 font-medium">
                    Lower Treatment Type
                  </Label>
                  <Select
                    value={formData.lowerTreatment}
                    onValueChange={(value) => handleInputChange('lowerTreatment', value)}
                  >
                    <SelectTrigger className="mt-2 border-blue-300 focus:border-blue-500">
                      <SelectValue placeholder="Select lower treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatmentOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lowerSurgeryDate" className="text-blue-800 font-medium">
                    Lower Surgery Date
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="lowerSurgeryDate"
                      type="date"
                      value={formData.lowerSurgeryDate}
                      onChange={(e) => handleInputChange('lowerSurgeryDate', e.target.value)}
                      className="border-blue-300 focus:border-blue-500 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.archType}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSubmitting ? "Saving..." : (initialData ? "Update Treatment" : "Save Treatment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
