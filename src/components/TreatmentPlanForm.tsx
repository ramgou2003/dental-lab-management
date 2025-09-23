import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TreatmentListDialog } from "@/components/TreatmentListDialog";
import { ProcedureListDialog } from "@/components/ProcedureListDialog";
import {
  FileText,
  Users,
  Calendar,
  Clock,
  Save,
  Plus,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface TreatmentPlanFormProps {
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

export function TreatmentPlanForm({
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
}: TreatmentPlanFormProps) {
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0];

    // Parse patient name into first and last name
    const nameParts = (initialData?.patientName || patientName || "").split(' ');
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(' ') || "";

    return {
      // Patient Information
      firstName: initialData?.firstName || firstName,
      lastName: initialData?.lastName || lastName,
      dateOfBirth: initialData?.dateOfBirth || patientDateOfBirth || "",
      planDate: initialData?.planDate || today,

      // Treatment Plan Details
      treatments: initialData?.treatments || [],
      notes: initialData?.notes || "",
    };
  });

  const [showTreatmentListDialog, setShowTreatmentListDialog] = useState(false);
  const [showProcedureListDialog, setShowProcedureListDialog] = useState(false);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  // Auto-save status badge component
  const AutoSaveStatusBadge = () => {
    if (!onAutoSave) return null;

    const getStatusConfig = () => {
      switch (autoSaveStatus) {
        case 'saving':
          return { text: 'Saving...', className: 'bg-yellow-100 text-yellow-800' };
        case 'saved':
          return { text: 'Saved', className: 'bg-green-100 text-green-800' };
        case 'error':
          return { text: 'Error saving', className: 'bg-red-100 text-red-800' };
        default:
          return { text: 'Draft', className: 'bg-gray-100 text-gray-800' };
      }
    };

    const { text, className } = getStatusConfig();

    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className={className}>
          {text}
        </Badge>
        {lastSavedTime && autoSaveStatus === 'saved' && (
          <span className="text-gray-500">
            Last saved: {lastSavedTime}
          </span>
        )}
      </div>
    );
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectTreatment = (treatmentData: any) => {
    const newTreatment = {
      id: Date.now().toString(), // Simple ID generation
      ...treatmentData,
      createdAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      treatments: [...prev.treatments, newTreatment]
    }));

    setShowTreatmentListDialog(false);
  };

  const handleSelectProcedures = (selectedProcedures: any[]) => {
    // Create individual treatments for each selected procedure
    const newTreatments = selectedProcedures.map(procedure => ({
      id: `proc_${Date.now()}_${Math.random()}`,
      name: procedure.name,
      description: procedure.description || `Individual procedure: ${procedure.name}`,
      total_cost: (parseFloat(procedure.cost || 0) * (procedure.quantity || 1)),
      procedure_count: procedure.quantity || 1,
      procedures: [procedure],
      createdAt: new Date().toISOString(),
      isIndividualProcedure: true
    }));

    setFormData(prev => ({
      ...prev,
      treatments: [...prev.treatments, ...newTreatments]
    }));

    setShowProcedureListDialog(false);
  };

  const toggleTreatmentExpansion = (treatmentId: string) => {
    setExpandedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const handleRemoveTreatment = (treatmentId: string) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.filter(t => t.id !== treatmentId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 z-10">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              Create Treatment Plan
            </DialogTitle>
            <AutoSaveStatusBadge />
          </div>
          <Separator />
        </DialogHeader>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <form id="treatment-plan-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information Card */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50 pb-4">
              <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Plan Details Card */}
          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50 pb-4">
              <CardTitle className="text-lg font-semibold text-green-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Treatment Plan Details
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800"
                    onClick={() => setShowProcedureListDialog(true)}
                    disabled={readOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800"
                    onClick={() => setShowTreatmentListDialog(true)}
                    disabled={readOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Treatment
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {formData.treatments.length === 0 ? (
                <div className="text-center py-16 text-gray-500 min-h-[300px] flex flex-col justify-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-medium mb-2">No Treatments Added</p>
                  <p className="text-base">Click "Add Treatment" to select treatments for this plan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.treatments.map((treatment, index) => {
                    const treatmentId = treatment.id || index.toString();
                    const isExpanded = expandedTreatments.has(treatmentId);

                    return (
                      <Card key={treatmentId} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        {/* Collapsed Header - Always Visible */}
                        <CardHeader
                          className="pb-3 cursor-pointer"
                          onClick={() => toggleTreatmentExpansion(treatmentId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Expand/Collapse Icon */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTreatmentExpansion(treatmentId);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>

                              {/* Treatment Info */}
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                  {treatment.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {treatment.total_cost && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                      ${parseFloat(treatment.total_cost).toFixed(2)}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {treatment.procedure_count || treatment.procedureCount || 0} procedures
                                  </Badge>
                                  {!isExpanded && treatment.procedures && treatment.procedures.length > 0 && (
                                    <Badge variant="outline" className="text-xs text-blue-600">
                                      Click to expand
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            {!readOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    treatments: prev.treatments.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>

                        {/* Expanded Content - Only Visible When Expanded */}
                        {isExpanded && (
                          <CardContent className="pt-0 border-t border-gray-100">
                            {treatment.description && (
                              <div className="mb-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Description:</p>
                                <p className="text-sm text-gray-600">{treatment.description}</p>
                              </div>
                            )}

                            {/* Show procedures if any */}
                            {treatment.procedures && treatment.procedures.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-3">Procedures ({treatment.procedures.length}):</p>
                                <div className="grid grid-cols-1 gap-3">
                                  {treatment.procedures.map((procedure, procIndex) => (
                                    <div key={procIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                      {/* Procedure Header */}
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            {procedure.name}
                                          </h4>

                                          {/* Codes and Quantity Row */}
                                          <div className="flex items-center gap-4 mb-2">
                                            <div className="flex items-center gap-2">
                                              {procedure.cdt_code && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs font-medium text-gray-500">CDT:</span>
                                                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                                                    {procedure.cdt_code}
                                                  </span>
                                                </div>
                                              )}
                                              {procedure.cpt_code && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs font-medium text-gray-500">CPT:</span>
                                                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                                                    {procedure.cpt_code}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Quantity Badge */}
                                            {procedure.quantity && (
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium text-gray-500">Qty:</span>
                                                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                  {procedure.quantity}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Cost Section */}
                                        {procedure.cost && (
                                          <div className="text-right ml-4 flex-shrink-0">
                                            {procedure.quantity && procedure.quantity > 1 ? (
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                  ${parseFloat(procedure.cost).toFixed(2)} × {procedure.quantity}
                                                </div>
                                                <div className="text-sm font-semibold text-green-600">
                                                  ${(parseFloat(procedure.cost) * (procedure.quantity || 1)).toFixed(2)}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="text-sm font-semibold text-green-600">
                                                ${parseFloat(procedure.cost).toFixed(2)}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}

                  {/* Treatment Summary */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Treatment Plan Summary</p>
                          <p className="text-xs text-blue-600">
                            {formData.treatments.length} treatment{formData.treatments.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-800">
                            Total: ${formData.treatments.reduce((total, treatment) => {
                              const cost = treatment.total_cost || treatment.estimatedCost || 0;
                              return total + parseFloat(cost);
                            }, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Plan Date: {formatDate(formData.planDate)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={readOnly}
            >
              Cancel
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                form="treatment-plan-form"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Submit Treatment Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Treatment List Dialog */}
      <TreatmentListDialog
        isOpen={showTreatmentListDialog}
        onClose={() => setShowTreatmentListDialog(false)}
        onSelectTreatment={handleSelectTreatment}
      />

      {/* Procedure List Dialog */}
      <ProcedureListDialog
        isOpen={showProcedureListDialog}
        onClose={() => setShowProcedureListDialog(false)}
        onSelectProcedures={handleSelectProcedures}
      />
    </div>
  );
}
