import { useState } from "react";
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
  upperTreatment: string;
  lowerTreatment: string;
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
    upperTreatment: initialData?.upperTreatment || "",
    lowerTreatment: initialData?.lowerTreatment || "",
    upperSurgeryDate: initialData?.upperSurgeryDate || "",
    lowerSurgeryDate: initialData?.lowerSurgeryDate || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TreatmentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      upperTreatment: "",
      lowerTreatment: "",
      upperSurgeryDate: "",
      lowerSurgeryDate: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Stethoscope className="h-5 w-5 text-purple-600" />
            </div>
            Add Treatment Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Treatment Sections Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upper Treatment Section */}
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

            {/* Lower Treatment Section */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">Lower Arch Treatment</h3>
              </div>

              <div>
                <Label htmlFor="lowerTreatment" className="text-green-800 font-medium">
                  Lower Treatment Type
                </Label>
                <Select
                  value={formData.lowerTreatment}
                  onValueChange={(value) => handleInputChange('lowerTreatment', value)}
                >
                  <SelectTrigger className="mt-2 border-green-300 focus:border-green-500">
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
                <Label htmlFor="lowerSurgeryDate" className="text-green-800 font-medium">
                  Lower Surgery Date
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="lowerSurgeryDate"
                    type="date"
                    value={formData.lowerSurgeryDate}
                    onChange={(e) => handleInputChange('lowerSurgeryDate', e.target.value)}
                    className="border-green-300 focus:border-green-500 pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>

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
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              {isSubmitting ? "Saving..." : "Save Treatment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
