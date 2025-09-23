import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TreatmentListDialog } from "@/components/TreatmentListDialog";
import {
  Stethoscope,
  Calendar,
  DollarSign,
  FileText,
  Save,
  X,
  Plus
} from "lucide-react";

interface AddTreatmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (treatmentData: any) => void;
}

export function AddTreatmentDialog({
  isOpen,
  onClose,
  onSubmit
}: AddTreatmentDialogProps) {
  const [treatmentData, setTreatmentData] = useState({
    treatmentType: "",
    arch: "",
    description: "",
    estimatedCost: "",
    scheduledDate: "",
    priority: "",
    notes: ""
  });

  const [showTreatmentListDialog, setShowTreatmentListDialog] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<any[]>([]);

  const treatmentTypes = [
    "Full Arch Fixed",
    "Denture",
    "Implant Removable Denture",
    "Single Implant",
    "Multiple Implants",
    "Extraction",
    "Extraction and Graft",
    "Crown",
    "Bridge",
    "Root Canal",
    "Cleaning",
    "Whitening",
    "Other"
  ];

  const archOptions = [
    "Upper",
    "Lower",
    "Both"
  ];

  const priorityOptions = [
    "High",
    "Medium",
    "Low"
  ];

  const handleInputChange = (field: string, value: string) => {
    setTreatmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectTreatment = (treatment: any) => {
    setSelectedTreatments(prev => [...prev, treatment]);
    setShowTreatmentListDialog(false);
  };

  const handleRemoveTreatment = (treatmentId: string) => {
    setSelectedTreatments(prev => prev.filter(t => t.id !== treatmentId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit all selected treatments
    selectedTreatments.forEach(treatment => {
      onSubmit(treatment);
    });
    // Reset form
    setSelectedTreatments([]);
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setSelectedTreatments([]);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Stethoscope className="h-5 w-5 text-green-600" />
            </div>
            Add Treatment
          </DialogTitle>
          <Separator />
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Add New Treatment Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800"
              onClick={() => setShowTreatmentListDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Treatment
            </Button>
          </div>

          <form id="add-treatment-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Treatments */}
            {selectedTreatments.length === 0 ? (
              <div className="text-center py-16 text-gray-500 min-h-[400px] flex flex-col justify-center">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No treatments selected</p>
                <p className="text-base">Click "Add New Treatment" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedTreatments.map((treatment) => (
                  <Card key={treatment.id} className="border-2 border-blue-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{treatment.name}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {treatment.category}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {treatment.procedureCount} procedures
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                          <p className="text-lg font-semibold text-green-600">
                            ${treatment.estimatedCost?.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-treatment-form"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={selectedTreatments.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Add Treatment{selectedTreatments.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Treatment List Dialog */}
    <TreatmentListDialog
      isOpen={showTreatmentListDialog}
      onClose={() => setShowTreatmentListDialog(false)}
      onSelectTreatment={handleSelectTreatment}
    />
  </>
  );
}
