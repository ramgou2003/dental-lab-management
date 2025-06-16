import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, User, FlaskConical } from "lucide-react";
import type { ReportCard } from "@/hooks/useReportCards";

interface LabReportCardFormProps {
  reportCard: ReportCard;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export function LabReportCardForm({ reportCard, onSubmit, onCancel }: LabReportCardFormProps) {
  const [formData, setFormData] = useState({
    // Synced fields (read-only)
    patient_name: reportCard.patient_name,
    arch_type: reportCard.lab_script?.arch_type || '',
    upper_appliance_type: reportCard.lab_script?.upper_appliance_type || '',
    lower_appliance_type: reportCard.lab_script?.lower_appliance_type || '',

    // Editable fields
    screw: reportCard.lab_script?.screw_type || '',
    shade: reportCard.lab_script?.notes || '',

    // New fields
    implant_on_upper: '',
    implant_on_lower: '',
    tooth_library_upper: '',
    tooth_library_lower: '',
    upper_appliance_number: '',
    lower_appliance_number: '',
    notes_and_remarks: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields
    const errors: string[] = [];
    const newFieldErrors: Record<string, boolean> = {};

    // Lab Specifications
    if (!formData.screw) {
      errors.push("Screw Type is required");
      newFieldErrors.screw = true;
    }
    if (!formData.shade) {
      errors.push("Shade is required");
      newFieldErrors.shade = true;
    }

    // Implant Libraries (conditional based on arch type)
    if (showUpperFields && !formData.implant_on_upper) {
      errors.push("Upper Implant Library is required");
      newFieldErrors.implant_on_upper = true;
    }
    if (showLowerFields && !formData.implant_on_lower) {
      errors.push("Lower Implant Library is required");
      newFieldErrors.implant_on_lower = true;
    }

    // Tooth Libraries (conditional based on arch type)
    if (showUpperFields && !formData.tooth_library_upper) {
      errors.push("Upper Tooth Library is required");
      newFieldErrors.tooth_library_upper = true;
    }
    if (showLowerFields && !formData.tooth_library_lower) {
      errors.push("Lower Tooth Library is required");
      newFieldErrors.tooth_library_lower = true;
    }

    // Appliance Numbers (conditional based on arch type)
    if (showUpperFields && !formData.upper_appliance_number.trim()) {
      errors.push("Upper Appliance Number is required");
      newFieldErrors.upper_appliance_number = true;
    }
    if (showLowerFields && !formData.lower_appliance_number.trim()) {
      errors.push("Lower Appliance Number is required");
      newFieldErrors.lower_appliance_number = true;
    }

    // Notes and Remarks
    if (!formData.notes_and_remarks.trim()) {
      errors.push("Notes and Remarks by Designer is required");
      newFieldErrors.notes_and_remarks = true;
    }

    // Update field errors state
    setFieldErrors(newFieldErrors);

    // Show validation errors if any
    if (errors.length > 0) {
      alert(`Please complete the following required fields:\n\n${errors.join('\n')}`);
      return;
    }

    onSubmit(formData);
  };

  // Dropdown options
  const screwOptions = [
    "DC Screw", "SIN PRH30", "Rosen", "Hyrax", "Rapid Palatal Expander",
    "Quad Helix", "Nance Appliance", "Custom Screw"
  ];

  const shadeOptions = [
    "A1", "A2", "A3", "A3.5", "A4",
    "B1", "B2", "B3", "B4",
    "C1", "C2", "C3", "C4",
    "D2", "D3", "D4"
  ];

  const toothLibraryOptions = [
    "Anterior Teeth", "Posterior Teeth", "Canine Teeth", "Premolar Teeth",
    "Molar Teeth", "Incisor Teeth", "Custom Library"
  ];

  const implantOptions = [
    "Nobel Biocare", "Straumann", "Zimmer Biomet", "Dentsply Sirona",
    "BioHorizons", "Osstem", "MIS Implants", "None"
  ];

  // Format appliance type for display
  const formatApplianceType = (type: string | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const showUpperFields = formData.arch_type === 'upper' || formData.arch_type === 'dual';
  const showLowerFields = formData.arch_type === 'lower' || formData.arch_type === 'dual';

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <FileText className="h-6 w-6 text-indigo-600" />
          Lab Report Card
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
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
              <Label htmlFor="arch_type">Arch Type</Label>
              <Input
                id="arch_type"
                value={formData.arch_type?.charAt(0).toUpperCase() + formData.arch_type?.slice(1)}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Appliance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-600" />
            Appliance Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="upper_appliance_type">Upper Appliance Type</Label>
                <Input
                  id="upper_appliance_type"
                  value={formatApplianceType(formData.upper_appliance_type)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="lower_appliance_type">Lower Appliance Type</Label>
                <Input
                  id="lower_appliance_type"
                  value={formatApplianceType(formData.lower_appliance_type)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lab Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Lab Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="screw">
                Screw Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.screw} onValueChange={(value) => handleInputChange('screw', value)} required>
                <SelectTrigger className={fieldErrors.screw ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select screw type" />
                </SelectTrigger>
                <SelectContent>
                  {screwOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shade">
                Shade <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.shade} onValueChange={(value) => handleInputChange('shade', value)} required>
                <SelectTrigger className={fieldErrors.shade ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select shade" />
                </SelectTrigger>
                <SelectContent>
                  {shadeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Implant & Library Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Implant & Library Information</h3>

          {/* Implants Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="implant_on_upper">
                  Upper Implant Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.implant_on_upper} onValueChange={(value) => handleInputChange('implant_on_upper', value)} required>
                  <SelectTrigger className={fieldErrors.implant_on_upper ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select upper implant library" />
                  </SelectTrigger>
                  <SelectContent>
                    {implantOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="implant_on_lower">
                  Lower Implant Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.implant_on_lower} onValueChange={(value) => handleInputChange('implant_on_lower', value)} required>
                  <SelectTrigger className={fieldErrors.implant_on_lower ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select lower implant library" />
                  </SelectTrigger>
                  <SelectContent>
                    {implantOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tooth Library Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="tooth_library_upper">
                  Upper Tooth Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tooth_library_upper} onValueChange={(value) => handleInputChange('tooth_library_upper', value)} required>
                  <SelectTrigger className={fieldErrors.tooth_library_upper ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select upper tooth library" />
                  </SelectTrigger>
                  <SelectContent>
                    {toothLibraryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="tooth_library_lower">
                  Lower Tooth Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tooth_library_lower} onValueChange={(value) => handleInputChange('tooth_library_lower', value)} required>
                  <SelectTrigger className={fieldErrors.tooth_library_lower ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select lower tooth library" />
                  </SelectTrigger>
                  <SelectContent>
                    {toothLibraryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Appliance Numbers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="upper_appliance_number">
                  Upper Appliance Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="upper_appliance_number"
                  value={formData.upper_appliance_number}
                  onChange={(e) => handleInputChange('upper_appliance_number', e.target.value)}
                  placeholder="Enter upper appliance number"
                  className={fieldErrors.upper_appliance_number ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="lower_appliance_number">
                  Lower Appliance Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lower_appliance_number"
                  value={formData.lower_appliance_number}
                  onChange={(e) => handleInputChange('lower_appliance_number', e.target.value)}
                  placeholder="Enter lower appliance number"
                  className={fieldErrors.lower_appliance_number ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes & Remarks */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes_and_remarks">
              Notes and Remarks by Designer <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes_and_remarks"
              value={formData.notes_and_remarks}
              onChange={(e) => handleInputChange('notes_and_remarks', e.target.value)}
              placeholder="Enter any additional notes or remarks..."
              className={fieldErrors.notes_and_remarks ? "border-red-500 focus:border-red-500" : ""}
              rows={4}
              required
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            Submit Lab Report
          </Button>
        </div>
      </form>
    </>
  );
}
