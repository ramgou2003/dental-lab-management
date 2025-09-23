import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Save,
  X,
  Stethoscope,
  FileText,
  Search,
  Plus
} from "lucide-react";

interface CreateTreatmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (treatmentData: any) => void;
  editingTreatment?: any;
}

export function CreateTreatmentDialog({
  isOpen,
  onClose,
  onSubmit,
  editingTreatment
}: CreateTreatmentDialogProps) {
  const [treatmentData, setTreatmentData] = useState({
    name: "",
    description: "",
    estimatedCost: ""
  });

  const [procedures, setProcedures] = useState([]);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);





  // Fetch procedures from Supabase
  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching procedures:', error);
        setProcedures([]);
      } else {
        setProcedures(data || []);
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProcedures();

      // Populate form if editing
      if (editingTreatment) {
        setTreatmentData({
          name: editingTreatment.name || "",
          description: editingTreatment.description || "",
          estimatedCost: editingTreatment.total_cost ? editingTreatment.total_cost.toString() : ""
        });
        // Ensure procedures have quantity property
        const proceduresWithQuantity = (editingTreatment.procedures || []).map(proc => ({
          ...proc,
          quantity: proc.quantity || 1
        }));
        setSelectedProcedures(proceduresWithQuantity);
      } else {
        // Reset form for new treatment
        setTreatmentData({
          name: "",
          description: "",
          estimatedCost: ""
        });
        setSelectedProcedures([]);
      }
    }
  }, [isOpen, editingTreatment]);

  const handleTreatmentChange = (field: string, value: string) => {
    setTreatmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProcedureToggle = useCallback((procedure: any) => {
    setSelectedProcedures(prev => {
      const isSelected = prev.some(p => p.id === procedure.id);
      if (isSelected) {
        return prev.filter(p => p.id !== procedure.id);
      } else {
        return [...prev, { ...procedure, quantity: 1 }];
      }
    });
  }, []);

  const handleQuantityChange = useCallback((procedureId: string, quantity: number) => {
    setSelectedProcedures(prev =>
      prev.map(p =>
        p.id === procedureId
          ? { ...p, quantity: Math.max(1, quantity) }
          : p
      )
    );
  }, []);

  const filteredProcedures = useMemo(() => {
    return procedures.filter(procedure =>
      procedure.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.cdt_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.cpt_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procedures, searchTerm]);

  // Calculate total cost from selected procedures with quantities
  const calculatedCost = useMemo(() => {
    return selectedProcedures.reduce((total, procedure) => {
      const cost = parseFloat(procedure.cost || 0);
      const quantity = procedure.quantity || 1;
      return total + (cost * quantity);
    }, 0);
  }, [selectedProcedures]);

  // Update treatment cost when calculated cost changes
  useEffect(() => {
    if (calculatedCost > 0) {
      setTreatmentData(prev => ({
        ...prev,
        estimatedCost: calculatedCost.toFixed(2)
      }));
    }
  }, [calculatedCost]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treatmentData.name.trim()) {
      return;
    }

    setLoading(true);

    try {
      let treatmentData_db;

      if (editingTreatment) {
        // Update existing treatment
        const { data, error: treatmentError } = await supabase
          .from('treatments')
          .update({
            name: treatmentData.name,
            description: treatmentData.description || null,
            total_cost: treatmentData.estimatedCost ? parseFloat(treatmentData.estimatedCost) : null,
            procedure_count: selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0)
          })
          .eq('id', editingTreatment.id)
          .select()
          .single();

        if (treatmentError) {
          console.error('Error updating treatment:', treatmentError);
          alert('Failed to update treatment. Please try again.');
          return;
        }

        treatmentData_db = data;

        // Delete existing procedure relationships
        await supabase
          .from('treatment_procedures')
          .delete()
          .eq('treatment_id', editingTreatment.id);

      } else {
        // Insert new treatment
        const { data, error: treatmentError } = await supabase
          .from('treatments')
          .insert({
            name: treatmentData.name,
            description: treatmentData.description || null,
            total_cost: treatmentData.estimatedCost ? parseFloat(treatmentData.estimatedCost) : null,
            procedure_count: selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0)
          })
          .select()
          .single();

        if (treatmentError) {
          console.error('Error creating treatment:', treatmentError);
          alert('Failed to create treatment. Please try again.');
          return;
        }

        treatmentData_db = data;
      }

      // Insert treatment-procedure relationships
      if (selectedProcedures.length > 0) {
        const treatmentProcedures = selectedProcedures.map(procedure => ({
          treatment_id: treatmentData_db.id,
          procedure_id: procedure.id,
          quantity: procedure.quantity || 1
        }));

        const { error: proceduresError } = await supabase
          .from('treatment_procedures')
          .insert(treatmentProcedures);

        if (proceduresError) {
          console.error('Error linking procedures to treatment:', proceduresError);
          // Treatment was created/updated but procedures weren't linked
          alert(`Treatment ${editingTreatment ? 'updated' : 'created'} but some procedures could not be linked.`);
        }
      }

      // Create treatment object for parent component
      const treatmentWithData = {
        ...treatmentData,
        procedures: selectedProcedures,
        id: treatmentData_db.id,
        procedureCount: selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0),
        createdAt: treatmentData_db.created_at
      };

      onSubmit(treatmentWithData);

      // Reset form
      setTreatmentData({
        name: "",
        description: "",
        estimatedCost: ""
      });
      setSelectedProcedures([]);
      setSearchTerm("");

      onClose();

    } catch (error) {
      console.error('Unexpected error creating treatment:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTreatmentData({
      name: "",
      description: "",
      estimatedCost: ""
    });
    setSelectedProcedures([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${editingTreatment ? 'bg-blue-100' : 'bg-green-100'}`}>
                <Stethoscope className={`h-5 w-5 ${editingTreatment ? 'text-blue-600' : 'text-green-600'}`} />
              </div>
              {editingTreatment ? 'Edit Treatment' : 'Create Treatment'}
              {loading && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  {editingTreatment ? 'Updating...' : 'Saving...'}
                </span>
              )}
            </DialogTitle>
            <Separator />
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-treatment-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Treatment Information */}
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50 pb-4">
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Treatment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="treatmentName" className="text-sm font-medium">
                      Treatment Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="treatmentName"
                      value={treatmentData.name}
                      onChange={(e) => handleTreatmentChange('name', e.target.value)}
                      placeholder="Enter treatment name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedCost" className="text-sm font-medium">
                      Total Treatment Cost
                      {calculatedCost > 0 && (
                        <span className="text-xs text-green-600 ml-2">
                          (Auto-calculated: ${calculatedCost.toFixed(2)})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      value={treatmentData.estimatedCost}
                      onChange={(e) => handleTreatmentChange('estimatedCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {calculatedCost > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cost calculated from {selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0)} procedure{selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0) !== 1 ? 's' : ''} ({selectedProcedures.length} type{selectedProcedures.length !== 1 ? 's' : ''}). You can override this value.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="treatmentDescription" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="treatmentDescription"
                    value={treatmentData.description}
                    onChange={(e) => handleTreatmentChange('description', e.target.value)}
                    placeholder="Describe the treatment..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Procedures Summary */}
            {selectedProcedures.length > 0 && (
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-blue-50 pb-4">
                  <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Selected Procedures ({selectedProcedures.length} types, {selectedProcedures.reduce((total, p) => total + (p.quantity || 1), 0)} total)
                  </CardTitle>
                  {calculatedCost > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-green-700">
                        Total Cost: ${calculatedCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {selectedProcedures.map((procedure) => (
                      <div key={procedure.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        {/* Procedure Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {procedure.name}
                            </h4>

                            {/* Codes Row */}
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                {procedure.cdt_code && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-500">CDT:</span>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                      {procedure.cdt_code}
                                    </span>
                                  </div>
                                )}
                                {procedure.cpt_code && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-500">CPT:</span>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                      {procedure.cpt_code}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cost per unit */}
                            {procedure.cost && (
                              <div className="text-xs text-green-600 font-medium">
                                ${parseFloat(procedure.cost).toFixed(2)} each
                              </div>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleProcedureToggle(procedure)}
                            className="ml-4 text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>

                        {/* Quantity and Total Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-500">Quantity:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(procedure.id, (procedure.quantity || 1) - 1)}
                                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                                disabled={(procedure.quantity || 1) <= 1}
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {procedure.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(procedure.id, (procedure.quantity || 1) + 1)}
                                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Total cost */}
                          {procedure.cost && (
                            <div className="text-right">
                              <span className="text-xs font-medium text-gray-500">Total: </span>
                              <span className="text-sm font-semibold text-green-600">
                                ${(parseFloat(procedure.cost) * (procedure.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Procedures Section */}
            <Card className="border-2 border-green-100">
              <CardHeader className="bg-green-50 pb-4">
                <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Select Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search procedures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>



                {/* Procedures List */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading procedures...
                    </div>
                  ) : filteredProcedures.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No procedures found
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredProcedures.map((procedure) => {
                        const isSelected = selectedProcedures.some(p => p.id === procedure.id);
                        return (
                          <div
                            key={procedure.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  handleProcedureToggle(procedure);
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {procedure.name}
                                  </h4>
                                  <div className="flex gap-1">
                                    {procedure.cdt_code && (
                                      <Badge variant="outline" className="text-xs">
                                        CDT: {procedure.cdt_code}
                                      </Badge>
                                    )}
                                    {procedure.cpt_code && (
                                      <Badge variant="outline" className="text-xs">
                                        CPT: {procedure.cpt_code}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {procedure.description && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    {procedure.description}
                                  </p>
                                )}
                                {procedure.cost && (
                                  <p className="text-sm font-medium text-green-600">
                                    ${parseFloat(procedure.cost).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-end gap-3">
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
              form="create-treatment-form"
              className={`text-white ${editingTreatment ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
              disabled={!treatmentData.name || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading
                ? (editingTreatment ? 'Updating...' : 'Creating...')
                : (editingTreatment ? 'Update Treatment' : 'Create Treatment')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
