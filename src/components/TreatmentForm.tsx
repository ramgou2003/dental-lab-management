import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Save, FileText, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TreatmentFormData {
  clinicalAssessment: string;
  treatmentRecommendations: {
    archType: 'upper' | 'lower' | 'dual' | '';
    upperTreatment: string[];
    lowerTreatment: string[];
  };
  additionalInformation: string;
}

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
}

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
    additionalInformation: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
          .select('clinical_assessment, treatment_recommendations, additional_information, updated_at')
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

          console.log('📝 TreatmentForm: Setting form data:', {
            clinicalAssessment: data.clinical_assessment,
            treatmentRecommendations,
            additionalInformation: data.additional_information
          });

          setFormData({
            clinicalAssessment: data.clinical_assessment || '',
            treatmentRecommendations,
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
    getFormData: () => formData
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
    </div>
  );
});
