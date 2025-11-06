import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { TreatmentListDialog } from '@/components/TreatmentListDialog';
import { ProcedureListDialog } from '@/components/ProcedureListDialog';
import { Save, FileText, CheckSquare, Plus, X, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ConsultationTreatmentFormData,
  TreatmentData,
  ProcedureData,
  TreatmentPlanData,
  calculateTreatmentTotalCost
} from '@/types/treatment';

// Type alias for backward compatibility
type TreatmentFormData = ConsultationTreatmentFormData;

interface TreatmentFormProps {
  patientPacketId?: string;
  patientName: string;
  consultationPatientId?: string;
  appointmentId?: string;
  onDataChange?: (data: TreatmentFormData) => void;
}

export interface TreatmentFormRef {
  saveData: () => Promise<void>;
  getFormData: () => TreatmentFormData;
  getTreatmentPlanTotal: () => number;
}

/**
 * IMPORTANT: Data Structure Compatibility
 *
 * The treatment plan data structure in this form is designed to be compatible
 * with the main treatment_plan_forms table. This allows for easy migration of
 * treatment data between:
 *
 * 1. Consultation Form (consultations.treatment_plan JSONB)
 * 2. Treatment Plan Form (treatment_plan_forms.treatments JSONB)
 * 3. Patient Profile Treatment Plans
 *
 * The TreatmentData and ProcedureData interfaces are defined in src/types/treatment.ts
 * to ensure consistency across all forms.
 *
 * When migrating data between forms, ensure:
 * - All TreatmentData objects have id, name, total_cost, procedure_count, procedures
 * - All ProcedureData objects have id, name, cost, quantity, and optional cdt_code/cpt_code
 * - Costs are stored as strings to preserve decimal precision
 * - total_cost is auto-calculated from procedures
 */

export const TreatmentForm = React.forwardRef<TreatmentFormRef, TreatmentFormProps>(({
  patientPacketId,
  patientName,
  consultationPatientId,
  appointmentId,
  onDataChange
}, ref) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    clinicalAssessment: '',
    treatmentRecommendations: {
      archType: '',
      upperTreatment: [],
      lowerTreatment: [],
    },
    treatmentPlan: {
      treatments: []
    },
    procedures: [],
    discount: 0,
    additionalInformation: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Treatment Plan Dialog States
  const [showTreatmentListDialog, setShowTreatmentListDialog] = useState(false);
  const [showProcedureListDialog, setShowProcedureListDialog] = useState(false);
  const [addingProceduresToTreatment, setAddingProceduresToTreatment] = useState<string | null>(null);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  // Load existing treatment data from consultations table
  useEffect(() => {
    console.log('🔄 TreatmentForm: useEffect triggered with appointmentId:', appointmentId);

    const loadTreatmentData = async () => {
      try {
        // Use appointment_id as primary lookup (required for multiple consultations)
        if (!appointmentId) {
          console.warn('❌ TreatmentForm: No appointment ID provided, cannot load treatment data');
          return;
        }

        console.log('📡 TreatmentForm: Loading data for appointmentId:', appointmentId);

        const { data, error } = await supabase
          .from('consultations')
          .select('clinical_assessment, treatment_recommendations, treatment_plan, additional_information, updated_at')
          .eq('appointment_id', appointmentId)
          .single();

        if (data && !error) {
          console.log('✅ TreatmentForm: Data loaded successfully:', data);

          // Handle migration from old format to new format
          let treatmentRecommendations = formData.treatmentRecommendations;

          if (data.treatment_recommendations) {
            // Check if it's the new format (has archType) or old format (has boolean fields)
            if (data.treatment_recommendations.archType !== undefined) {
              // New format - use as is
              console.log('📊 TreatmentForm: Using new arch-based format');
              treatmentRecommendations = data.treatment_recommendations;

              // Convert string values to arrays if needed (migration support)
              if (typeof treatmentRecommendations.upperTreatment === 'string') {
                console.log('🔄 Converting upperTreatment from string to array');
                treatmentRecommendations.upperTreatment = treatmentRecommendations.upperTreatment
                  ? [treatmentRecommendations.upperTreatment]
                  : [];
              }
              if (typeof treatmentRecommendations.lowerTreatment === 'string') {
                console.log('🔄 Converting lowerTreatment from string to array');
                treatmentRecommendations.lowerTreatment = treatmentRecommendations.lowerTreatment
                  ? [treatmentRecommendations.lowerTreatment]
                  : [];
              }
            } else {
              // Old format - migrate to new format
              console.log('🔄 TreatmentForm: Migrating old format to new arch-based format');
              treatmentRecommendations = {
                archType: '',
                upperTreatment: [],
                lowerTreatment: [],
              };
            }
          }

          // Handle treatment plan data
          let treatmentPlan = { treatments: [] };
          let procedures: ProcedureData[] = [];
          let discount = 0;

          if (data.treatment_plan) {
            // Ensure treatment_plan has the correct structure
            if (typeof data.treatment_plan === 'object' && data.treatment_plan !== null) {
              treatmentPlan = {
                treatments: Array.isArray(data.treatment_plan.treatments)
                  ? data.treatment_plan.treatments
                  : []
              };
              // Load procedures and discount from treatment_plan
              procedures = Array.isArray(data.treatment_plan.procedures) ? data.treatment_plan.procedures : [];
              discount = data.treatment_plan.discount || 0;
            }
          }

          console.log('📝 TreatmentForm: Setting form data:', {
            clinicalAssessment: data.clinical_assessment,
            treatmentRecommendations,
            treatmentPlan,
            procedures,
            discount,
            additionalInformation: data.additional_information
          });

          setFormData({
            clinicalAssessment: data.clinical_assessment || '',
            treatmentRecommendations,
            treatmentPlan,
            procedures,
            discount,
            additionalInformation: data.additional_information || ''
          });
          setLastSaved(new Date(data.updated_at));
        } else if (error) {
          console.error('❌ TreatmentForm: Error loading data:', error);
        } else {
          console.warn('⚠️ TreatmentForm: No data found for appointmentId:', appointmentId);
        }
      } catch (error) {
        console.error('Error loading treatment data:', error);
      }
    };

    if (appointmentId) {
      loadTreatmentData();
    }
  }, [appointmentId]);

  const handleSave = async () => {
    console.log('💾 Saving treatment data...');
    setIsSaving(true);
    try {
      // First, get existing data to avoid overwriting financial data
      // Use appointment_id as primary lookup (required for multiple consultations)
      if (!appointmentId) {
        throw new Error('Appointment ID is required for loading existing consultation data');
      }

      const { data: existingData } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      const treatmentData = {
        new_patient_packet_id: patientPacketId || null,
        consultation_patient_id: consultationPatientId || null,
        appointment_id: appointmentId || null,
        patient_name: patientName || 'Unknown Patient',
        clinical_assessment: formData.clinicalAssessment,
        treatment_recommendations: formData.treatmentRecommendations,
        treatment_plan: {
          ...formData.treatmentPlan,
          procedures: formData.procedures || [],
          discount: formData.discount || 0
        },
        additional_information: formData.additionalInformation,
        consultation_status: existingData?.consultation_status || 'in_progress',
        progress_step: Math.max(existingData?.progress_step || 0, 1),
        updated_at: new Date().toISOString(),
        // Preserve existing financial data if it exists
        ...(existingData && {
          treatment_decision: existingData.treatment_decision,
          treatment_cost: existingData.treatment_cost,
          global_treatment_value: existingData.global_treatment_value,
          financing_options: existingData.financing_options,
          financing_not_approved_reason: existingData.financing_not_approved_reason,
          financial_notes: existingData.financial_notes,
          followup_date: existingData.followup_date,
          followup_reason: existingData.followup_reason,
          treatment_plan_approved: existingData.treatment_plan_approved,
          follow_up_required: existingData.follow_up_required
        })
      };

      console.log('💾 Saving treatment data:', treatmentData);
      console.log('🔍 IDs being saved:', {
        patientPacketId,
        consultationPatientId,
        patientName
      });
      console.log('📋 Existing data found:', existingData ? 'Yes' : 'No');
      if (existingData) {
        console.log('🔄 Preserving financial data:', {
          treatment_decision: existingData.treatment_decision,
          treatment_cost: existingData.treatment_cost,
          financial_notes: existingData.financial_notes
        });
      }

      // Use appointment_id for conflict resolution (now has unique constraint)
      if (!appointmentId) {
        throw new Error('Appointment ID is required for saving consultation data');
      }

      const { data, error } = await supabase
        .from('consultations')
        .upsert(treatmentData, {
          onConflict: 'appointment_id'
        })
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Treatment data saved successfully:', data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('❌ Error saving treatment data:', error);
      // Show user-friendly error message
      toast.error('Failed to save treatment data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Expose save function to parent component
  React.useImperativeHandle(ref, () => ({
    saveData: handleSave,
    getFormData: () => formData,
    getTreatmentPlanTotal: () => {
      // Calculate subtotal from all treatments and individual procedures
      const subtotal = (formData.treatmentPlan?.treatments || []).reduce((total, treatment) => {
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

      // Apply discount to get final total
      const discount = parseFloat(formData.discount || 0);
      const finalTotal = Math.max(0, subtotal - discount);

      return finalTotal;
    }
  }));

  const handleArchTypeChange = (archType: 'upper' | 'lower' | 'dual') => {
    const newData = {
      ...formData,
      treatmentRecommendations: {
        ...formData.treatmentRecommendations,
        archType,
        // Reset treatments when arch type changes
        upperTreatment: [],
        lowerTreatment: [],
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleTreatmentChange = (type: 'upper' | 'lower', treatments: string[]) => {
    const newData = {
      ...formData,
      treatmentRecommendations: {
        ...formData.treatmentRecommendations,
        [type === 'upper' ? 'upperTreatment' : 'lowerTreatment']: treatments
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  // Treatment Plan Functions
  const handleSelectTreatment = (treatment: any) => {
    const newTreatment = {
      ...treatment,
      id: `treatment_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString()
    };

    const newData = {
      ...formData,
      treatmentPlan: {
        ...formData.treatmentPlan,
        treatments: [...formData.treatmentPlan.treatments, newTreatment]
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleSelectProcedures = (selectedProcedures: any[]) => {
    if (addingProceduresToTreatment) {
      // Add procedures to existing treatment
      const updatedTreatments = formData.treatmentPlan.treatments.map(treatment => {
        if (treatment.id === addingProceduresToTreatment) {
          const newProcedures = selectedProcedures.map(proc => ({
            ...proc,
            quantity: proc.quantity || 1
          }));

          const allProcedures = [...treatment.procedures, ...newProcedures];
          const totalCost = allProcedures.reduce((sum, proc) => {
            const costType = proc.cost_type || 'dental';
            const cost = parseFloat(costType === 'medical' ? proc.medical_cost || '0' : proc.dental_cost || '0');
            return sum + (cost * proc.quantity);
          }, 0);

          return {
            ...treatment,
            procedures: allProcedures,
            total_cost: totalCost,
            procedure_count: allProcedures.length
          };
        }
        return treatment;
      });

      const newData = {
        ...formData,
        treatmentPlan: {
          ...formData.treatmentPlan,
          treatments: updatedTreatments
        }
      };
      setFormData(newData);
      onDataChange?.(newData);
      setAddingProceduresToTreatment(null);
    } else {
      // Add procedures directly as individual procedures
      const newProcedures = selectedProcedures.map(proc => ({
        ...proc,
        quantity: proc.quantity || 1
      }));

      const newData = {
        ...formData,
        procedures: [...(formData.procedures || []), ...newProcedures]
      };
      setFormData(newData);
      onDataChange?.(newData);
    }

    setShowProcedureListDialog(false);
  };

  const removeTreatment = (treatmentId: string) => {
    const newData = {
      ...formData,
      treatmentPlan: {
        ...formData.treatmentPlan,
        treatments: formData.treatmentPlan.treatments.filter(t => t.id !== treatmentId)
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const removeProcedureFromTreatment = (treatmentId: string, procedureId: string) => {
    const updatedTreatments = formData.treatmentPlan.treatments.map(treatment => {
      if (treatment.id === treatmentId) {
        const updatedProcedures = treatment.procedures.filter(proc => proc.id !== procedureId);
        const totalCost = updatedProcedures.reduce((sum, proc) =>
          sum + (parseFloat(proc.dental_cost || '0') * proc.quantity), 0
        );

        return {
          ...treatment,
          procedures: updatedProcedures,
          total_cost: totalCost,
          procedure_count: updatedProcedures.length
        };
      }
      return treatment;
    });

    const newData = {
      ...formData,
      treatmentPlan: {
        ...formData.treatmentPlan,
        treatments: updatedTreatments
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const removeIndividualProcedure = (procedureId: string) => {
    const newData = {
      ...formData,
      procedures: (formData.procedures || []).filter(proc => proc.id !== procedureId)
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleProcedureEdit = (treatmentId: string, procedureId: string, field: string, value: string | number) => {
    const updatedTreatments = formData.treatmentPlan.treatments.map(treatment => {
      if (treatment.id === treatmentId) {
        const updatedProcedures = treatment.procedures.map(proc => {
          if (proc.id === procedureId) {
            const updatedProc = { ...proc };
            if (field === 'quantity') {
              updatedProc.quantity = Math.max(1, Number(value));
            } else if (field === 'cost') {
              updatedProc.dental_cost = value.toString();
            }
            return updatedProc;
          }
          return proc;
        });

        // Recalculate total cost
        const newTotalCost = updatedProcedures.reduce((sum, p) => sum + (parseFloat(p.dental_cost || '0') * p.quantity), 0);

        return {
          ...treatment,
          procedures: updatedProcedures,
          total_cost: newTotalCost
        };
      }
      return treatment;
    });

    const newData = {
      ...formData,
      treatmentPlan: {
        ...formData.treatmentPlan,
        treatments: updatedTreatments
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const toggleTreatmentExpansion = (treatmentId: string) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(treatmentId)) {
      newExpanded.delete(treatmentId);
    } else {
      newExpanded.add(treatmentId);
    }
    setExpandedTreatments(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const treatmentOptions = [
    'NO TREATMENT',
    'FULL ARCH FIXED',
    'DENTURE',
    'IMPLANT REMOVABLE DENTURE',
    'SINGLE IMPLANT',
    'MULTIPLE IMPLANTS',
    'EXTRACTION',
    'EXTRACTION AND GRAFT',
    'SURGICAL REVISION',
    'TRANSITIONAL SMILE APPLIANCE',
    'SINUS LIFT',
    'LATERAL WINDOW SINUS LIFT',
    'ALL ON X WITH REMOTE ANCHORAGE'
  ];

  return (
    <div className="space-y-6">


      {/* Clinical Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-blue-500" />
            Clinical Assessment (Diagnosis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter clinical assessment and diagnosis details..."
            value={formData.clinicalAssessment}
            onChange={(e) => setFormData(prev => ({ ...prev, clinicalAssessment: e.target.value }))}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Treatment Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-green-500" />
            Treatment Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Arch Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <Label className="text-base font-medium text-gray-900">Select Arch Type</Label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={formData.treatmentRecommendations.archType === 'upper' ? "default" : "outline"}
                onClick={() => handleArchTypeChange('upper')}
                className={`px-4 py-3 h-auto ${
                  formData.treatmentRecommendations.archType === 'upper'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Upper Arch
              </Button>
              <Button
                type="button"
                variant={formData.treatmentRecommendations.archType === 'lower' ? "default" : "outline"}
                onClick={() => handleArchTypeChange('lower')}
                className={`px-4 py-3 h-auto ${
                  formData.treatmentRecommendations.archType === 'lower'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Lower Arch
              </Button>
              <Button
                type="button"
                variant={formData.treatmentRecommendations.archType === 'dual' ? "default" : "outline"}
                onClick={() => handleArchTypeChange('dual')}
                className={`px-4 py-3 h-auto ${
                  formData.treatmentRecommendations.archType === 'dual'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Dual Arch
              </Button>
            </div>
          </div>

          {/* Treatment Selections - Side by side for dual arch, single for individual arch */}
          {formData.treatmentRecommendations.archType === 'dual' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Upper Arch Treatment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Label className="text-base font-medium text-gray-900">Upper Arch Treatment</Label>
                </div>
                <div>
                  <MultiSelect
                    options={treatmentOptions}
                    value={formData.treatmentRecommendations.upperTreatment}
                    onChange={(value) => handleTreatmentChange('upper', value)}
                    placeholder="Select upper treatment types"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Lower Arch Treatment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Label className="text-base font-medium text-gray-900">Lower Arch Treatment</Label>
                </div>
                <div>
                  <MultiSelect
                    options={treatmentOptions}
                    value={formData.treatmentRecommendations.lowerTreatment}
                    onChange={(value) => handleTreatmentChange('lower', value)}
                    placeholder="Select lower treatment types"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upper Arch Treatment - Single column for upper only */}
          {formData.treatmentRecommendations.archType === 'upper' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Label className="text-base font-medium text-gray-900">Upper Arch Treatment</Label>
              </div>
              <div>
                <MultiSelect
                  options={treatmentOptions}
                  value={formData.treatmentRecommendations.upperTreatment}
                  onChange={(value) => handleTreatmentChange('upper', value)}
                  placeholder="Select upper treatment types"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Lower Arch Treatment - Single column for lower only */}
          {formData.treatmentRecommendations.archType === 'lower' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Label className="text-base font-medium text-gray-900">Lower Arch Treatment</Label>
              </div>
              <div>
                <MultiSelect
                  options={treatmentOptions}
                  value={formData.treatmentRecommendations.lowerTreatment}
                  onChange={(value) => handleTreatmentChange('lower', value)}
                  placeholder="Select lower treatment types"
                  className="w-full"
                />
              </div>
            </div>
          )}
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
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {formData.treatmentPlan.treatments.length === 0 && (!formData.procedures || formData.procedures.length === 0) ? (
            <div className="text-center py-16 text-gray-500 min-h-[300px] flex flex-col justify-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No Treatments Added</p>
              <p className="text-base">Click "Add Treatment" to select treatments for this plan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.treatmentPlan.treatments.map((treatment, index) => {
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              treatmentPlan: {
                                ...prev.treatmentPlan,
                                treatments: prev.treatmentPlan.treatments.filter((_, i) => i !== index)
                              }
                            }));
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProcedureFromTreatment(treatment.id, procedure.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                                        title="Remove procedure"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
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
                                        <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                                          {/* Decrease Button */}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const currentQty = procedure.quantity || 1;
                                              if (currentQty > 1) {
                                                handleProcedureEdit(treatment.id, procedure.id, 'quantity', currentQty - 1);
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
                                            onChange={(e) => handleProcedureEdit(treatment.id, procedure.id, 'quantity', e.target.value)}
                                            className="flex-1 h-12 text-center text-lg font-semibold border-0 border-l border-r border-gray-200 rounded-none focus:ring-0 focus:border-transparent bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />

                                          {/* Increase Button */}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const currentQty = procedure.quantity || 1;
                                              handleProcedureEdit(treatment.id, procedure.id, 'quantity', currentQty + 1);
                                            }}
                                            className="h-12 w-12 rounded-r-lg rounded-l-none border-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                          >
                                            <span className="text-xl font-bold">+</span>
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Unit Price Section */}
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Unit Price
                                        </label>
                                        <div className="w-full h-12 bg-white border border-gray-300 rounded-lg flex items-center px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all duration-200">
                                          <span className="text-gray-500 text-lg font-medium mr-2">$</span>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={procedure.cost_type === 'medical' ? procedure.medical_cost || 0 : procedure.dental_cost || 0}
                                            onChange={(e) => handleProcedureEdit(treatment.id, procedure.id, 'cost', e.target.value)}
                                            className="flex-1 border-0 bg-transparent text-lg font-medium text-right focus:ring-0 focus:outline-none p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0.00"
                                          />
                                        </div>
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
                      </div>

                      {/* Procedure Details Grid */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-6">
                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
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
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
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
                          {formData.treatmentPlan.treatments.length} treatment{formData.treatmentPlan.treatments.length !== 1 ? 's' : ''} selected
                          {formData.procedures && formData.procedures.length > 0 && ` + ${formData.procedures.length} procedure${formData.procedures.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 border-t border-blue-200 pt-3">
                      {(() => {
                        const subtotal = (formData.treatmentPlan.treatments || []).reduce((total, treatment) => {
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
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    discount: parseFloat(e.target.value) || 0
                                  }))}
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

      {/* Additional Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-purple-500" />
            Additional Information (Consultation Notes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter additional consultation notes, special considerations, or other relevant information..."
            value={formData.additionalInformation}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInformation: e.target.value }))}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Treatment List Dialog */}
      <TreatmentListDialog
        isOpen={showTreatmentListDialog}
        onClose={() => setShowTreatmentListDialog(false)}
        onSelectTreatment={handleSelectTreatment}
      />

      {/* Procedure List Dialog */}
      <ProcedureListDialog
        isOpen={showProcedureListDialog}
        onClose={() => {
          setShowProcedureListDialog(false);
          setAddingProceduresToTreatment(null);
        }}
        onSelectProcedures={handleSelectProcedures}
      />
    </div>
  );
});
