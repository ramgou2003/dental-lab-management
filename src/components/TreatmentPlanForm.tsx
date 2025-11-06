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
  ChevronRight,
  Trash2
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
      procedures: initialData?.procedures || [],
      notes: initialData?.notes || "",
      discount: initialData?.discount || 0,
    };
  });

  const [showTreatmentListDialog, setShowTreatmentListDialog] = useState(false);
  const [showProcedureListDialog, setShowProcedureListDialog] = useState(false);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());
  const [addingProceduresToTreatment, setAddingProceduresToTreatment] = useState<number | null>(null);



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
    if (addingProceduresToTreatment !== null) {
      // Add procedures to existing treatment
      setFormData(prev => {
        const newTreatments = [...prev.treatments];
        const treatment = { ...newTreatments[addingProceduresToTreatment] };
        const existingProcedures = [...treatment.procedures];

        // Add new procedures to existing ones
        const updatedProcedures = [...existingProcedures, ...selectedProcedures];
        treatment.procedures = updatedProcedures;
        treatment.procedure_count = updatedProcedures.length;

        // Recalculate treatment total cost
        treatment.total_cost = updatedProcedures.reduce((total, proc) => {
          const costType = proc.cost_type || 'dental';
          const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
          const quantity = proc.quantity || 1;
          return total + (cost * quantity);
        }, 0);

        newTreatments[addingProceduresToTreatment] = treatment;

        return {
          ...prev,
          treatments: newTreatments
        };
      });

      setAddingProceduresToTreatment(null);
    } else {
      // Add procedures directly as individual procedures
      setFormData(prev => ({
        ...prev,
        procedures: [...prev.procedures, ...selectedProcedures]
      }));
    }

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

  const handleProcedureEdit = (treatmentIndex: number, procedureIndex: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newTreatments = [...prev.treatments];
      const treatment = { ...newTreatments[treatmentIndex] };
      const procedures = [...treatment.procedures];
      const procedure = { ...procedures[procedureIndex] };

      if (field === 'quantity') {
        procedure.quantity = Math.max(1, Number(value));
      } else if (field === 'cost') {
        procedure.dental_cost = value.toString();
      }

      procedures[procedureIndex] = procedure;
      treatment.procedures = procedures;

      // Recalculate treatment total cost
      treatment.total_cost = procedures.reduce((total, proc) => {
        const costType = proc.cost_type || 'dental';
        const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
        const quantity = proc.quantity || 1;
        return total + (cost * quantity);
      }, 0);

      newTreatments[treatmentIndex] = treatment;

      return {
        ...prev,
        treatments: newTreatments
      };
    });
  };

  const handleRemoveProcedure = (treatmentIndex: number, procedureIndex: number) => {
    setFormData(prev => {
      const newTreatments = [...prev.treatments];
      const treatment = { ...newTreatments[treatmentIndex] };
      const procedures = [...treatment.procedures];

      procedures.splice(procedureIndex, 1);
      treatment.procedures = procedures;
      treatment.procedure_count = procedures.length;

      // Recalculate treatment total cost
      treatment.total_cost = procedures.reduce((total, proc) => {
        const costType = proc.cost_type || 'dental';
        const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
        const quantity = proc.quantity || 1;
        return total + (cost * quantity);
      }, 0);

      newTreatments[treatmentIndex] = treatment;

      return {
        ...prev,
        treatments: newTreatments
      };
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
                    onClick={() => {
                      setAddingProceduresToTreatment(null);
                      setShowProcedureListDialog(true);
                    }}
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
              {formData.treatments.length === 0 && (!formData.procedures || formData.procedures.length === 0) ? (
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
                                    <div key={procIndex} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden">
                                      {/* Gradient Header */}
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h4 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                                              {procedure.name}
                                            </h4>

                                            {/* Medical Codes */}
                                            <div className="flex items-center gap-3">
                                              {procedure.cdt_code && (
                                                <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                  CDT {procedure.cdt_code}
                                                </div>
                                              )}
                                              {procedure.cpt_code && (
                                                <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                  CPT {procedure.cpt_code}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Remove Button */}
                                          {!readOnly && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveProcedure(index, procIndex)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                                              title="Remove procedure"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Content Area */}
                                      <div className="px-6 py-5">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                          {/* Quantity Section */}
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                              Quantity
                                            </label>
                                            {readOnly ? (
                                              <div className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                <span className="text-xl font-bold text-blue-700">
                                                  {procedure.quantity || 1}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                                                {/* Decrease Button */}
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    const currentQty = procedure.quantity || 1;
                                                    if (currentQty > 1) {
                                                      handleProcedureEdit(index, procIndex, 'quantity', currentQty - 1);
                                                    }
                                                  }}
                                                  disabled={procedure.quantity <= 1}
                                                  className="h-12 w-12 rounded-l-lg rounded-r-none border-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                >
                                                  <span className="text-xl font-bold">−</span>
                                                </Button>

                                                {/* Quantity Input */}
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  value={procedure.quantity || 1}
                                                  onChange={(e) => handleProcedureEdit(index, procIndex, 'quantity', e.target.value)}
                                                  className="flex-1 h-12 text-center text-lg font-semibold border-0 border-l border-r border-gray-200 rounded-none focus:ring-0 focus:border-transparent bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />

                                                {/* Increase Button */}
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    const currentQty = procedure.quantity || 1;
                                                    handleProcedureEdit(index, procIndex, 'quantity', currentQty + 1);
                                                  }}
                                                  className="h-12 w-12 rounded-r-lg rounded-l-none border-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                                >
                                                  <span className="text-xl font-bold">+</span>
                                                </Button>
                                              </div>
                                            )}
                                          </div>

                                          {/* Unit Price Section */}
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                              Unit Price
                                            </label>
                                            {readOnly ? (
                                              <div className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                                                <span className="text-lg font-bold text-gray-900">
                                                  ${(
                                                    parseFloat(
                                                      procedure.cost_type === 'medical'
                                                        ? procedure.medical_cost || 0
                                                        : procedure.dental_cost || 0
                                                    )
                                                  ).toFixed(2)}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="w-full h-12 bg-white border border-gray-300 rounded-lg flex items-center px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all duration-200">
                                                <span className="text-gray-500 text-lg font-medium mr-2">$</span>
                                                <Input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  value={procedure.cost_type === 'medical' ? procedure.medical_cost || 0 : procedure.dental_cost || 0}
                                                  onChange={(e) => handleProcedureEdit(index, procIndex, 'cost', e.target.value)}
                                                  className="flex-1 border-0 bg-transparent text-lg font-medium text-right focus:ring-0 focus:outline-none p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                  placeholder="0.00"
                                                />
                                              </div>
                                            )}
                                          </div>

                                          {/* Total Cost Section */}
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                              Total Cost
                                            </label>
                                            <div className="relative">
                                              <div className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                                                <span className="text-xl font-bold text-gray-900">
                                                  ${(
                                                    (parseFloat(
                                                      procedure.cost_type === 'medical'
                                                        ? procedure.medical_cost || 0
                                                        : procedure.dental_cost || 0
                                                    )) * (procedure.quantity || 1)
                                                  ).toFixed(2)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Procedure Button */}
                                {!readOnly && (
                                  <div className="mt-6">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setAddingProceduresToTreatment(index);
                                        setShowProcedureListDialog(true);
                                      }}
                                      className="w-full h-14 border-2 border-dashed border-blue-300 text-blue-600 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                                    >
                                      <div className="flex items-center justify-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                          <Plus className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">Add Another Procedure</span>
                                      </div>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}

                  {/* Individual Procedures */}
                  {formData.procedures && formData.procedures.length > 0 && (
                    <div className="space-y-4">
                      {formData.procedures.map((procedure, index) => (
                        <div key={`proc_${index}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          {/* Header with Procedure Name and Codes */}
                          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 leading-tight">
                                {procedure.name}
                              </h4>
                              {/* Medical Codes */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {procedure.cdt_code && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs font-medium border-0">
                                    CDT {procedure.cdt_code}
                                  </Badge>
                                )}
                                {procedure.cpt_code && (
                                  <Badge className="bg-purple-100 text-purple-700 text-xs font-medium border-0">
                                    CPT {procedure.cpt_code}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {!readOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    procedures: prev.procedures.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            )}
                          </div>

                          {/* Procedure Details Grid */}
                          <div className="px-6 py-4">
                            <div className="grid grid-cols-3 gap-6">
                              {/* Quantity */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                {readOnly ? (
                                  <div className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                                    <span className="text-lg font-bold text-gray-900">{procedure.quantity || 1}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                                    {/* Decrease Button */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentQty = procedure.quantity || 1;
                                        if (currentQty > 1) {
                                          setFormData(prev => ({
                                            ...prev,
                                            procedures: prev.procedures.map((p, i) =>
                                              i === index ? { ...p, quantity: currentQty - 1 } : p
                                            )
                                          }));
                                        }
                                      }}
                                      disabled={procedure.quantity <= 1}
                                      className="h-12 w-12 rounded-l-lg rounded-r-none border-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                      <span className="text-xl font-bold">−</span>
                                    </Button>

                                    {/* Quantity Input */}
                                    <Input
                                      type="number"
                                      min="1"
                                      value={procedure.quantity || 1}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          procedures: prev.procedures.map((p, i) =>
                                            i === index ? { ...p, quantity: parseInt(e.target.value) || 1 } : p
                                          )
                                        }));
                                      }}
                                      className="flex-1 h-12 text-center text-lg font-semibold border-0 border-l border-r border-gray-200 rounded-none focus:ring-0 focus:border-transparent bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />

                                    {/* Increase Button */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentQty = procedure.quantity || 1;
                                        setFormData(prev => ({
                                          ...prev,
                                          procedures: prev.procedures.map((p, i) =>
                                            i === index ? { ...p, quantity: currentQty + 1 } : p
                                          )
                                        }));
                                      }}
                                      className="h-12 w-12 rounded-r-lg rounded-l-none border-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                    >
                                      <span className="text-xl font-bold">+</span>
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Unit Price */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                                {readOnly ? (
                                  <div className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                                    <span className="text-lg font-bold text-gray-900">
                                      ${(
                                        parseFloat(
                                          procedure.cost_type === 'medical'
                                            ? procedure.medical_cost || 0
                                            : procedure.dental_cost || 0
                                        )
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-full h-12 bg-white border border-gray-300 rounded-lg flex items-center px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all duration-200">
                                    <span className="text-gray-500 text-lg font-medium mr-2">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={procedure.cost_type === 'medical' ? procedure.medical_cost || 0 : procedure.dental_cost || 0}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          procedures: prev.procedures.map((p, i) => {
                                            if (i === index) {
                                              const costType = p.cost_type || 'dental';
                                              return costType === 'medical'
                                                ? { ...p, medical_cost: e.target.value }
                                                : { ...p, dental_cost: e.target.value };
                                            }
                                            return p;
                                          })
                                        }));
                                      }}
                                      className="flex-1 border-0 bg-transparent text-lg font-medium text-right focus:ring-0 focus:outline-none p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0.00"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Total Cost */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
                                <div className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-white">
                                  <span className="text-lg font-bold text-gray-900">
                                    ${(
                                      parseFloat(
                                        procedure.cost_type === 'medical'
                                          ? procedure.medical_cost || 0
                                          : procedure.dental_cost || 0
                                      ) * (procedure.quantity || 1)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Treatment Summary */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Treatment Plan Summary</p>
                            <p className="text-xs text-blue-600">
                              {formData.treatments.length} treatment{formData.treatments.length !== 1 ? 's' : ''} selected
                              {formData.procedures && formData.procedures.length > 0 && ` + ${formData.procedures.length} procedure${formData.procedures.length !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="space-y-2 border-t border-blue-200 pt-3">
                          {(() => {
                            const subtotal = (formData.treatments || []).reduce((total, treatment) => {
                              const treatmentTotal = (treatment.procedures || []).reduce((procTotal, proc) => {
                                const costType = proc.cost_type || 'dental';
                                const unitPrice = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
                                const quantity = proc.quantity || 1;
                                return procTotal + (unitPrice * quantity);
                              }, 0);
                              return total + treatmentTotal;
                            }, 0) +
                            ((formData.procedures && Array.isArray(formData.procedures)) ? formData.procedures.reduce((total, proc) => {
                              const costType = proc.cost_type || 'dental';
                              const unitPrice = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
                              const quantity = proc.quantity || 1;
                              return total + (unitPrice * quantity);
                            }, 0) : 0);

                            const discount = parseFloat(formData.discount || 0);
                            const finalTotal = Math.max(0, subtotal - discount);

                            return (
                              <>
                                <div className="flex items-center justify-end">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-blue-700">Subtotal:</span>
                                    <span className="text-sm font-semibold text-blue-800 w-20 text-right">${subtotal.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                  <label className="text-sm text-blue-700">Courtesy:</label>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={formData.discount || ''}
                                      onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                                      className="w-20 h-8 px-2 border border-blue-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder=""
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-end border-t border-blue-200 pt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-blue-900">Final Total:</span>
                                    <span className="text-lg font-bold text-blue-900 w-20 text-right">${finalTotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
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
                {isEditing ? "Update Treatment Plan" : "Submit Treatment Plan"}
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
