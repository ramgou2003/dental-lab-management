import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, FileText, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TreatmentFormData {
  clinicalAssessment: string;
  treatmentRecommendations: {
    implantPlacement: boolean;
    implantRestoration: boolean;
    implantSupported: boolean;
    extraction: boolean;
    bonGraft: boolean;
    sinusLift: boolean;
    denture: boolean;
    bridge: boolean;
    crown: boolean;
  };
  additionalInformation: string;
}

interface TreatmentFormProps {
  patientPacketId: string;
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
      implantPlacement: false,
      implantRestoration: false,
      implantSupported: false,
      extraction: false,
      bonGraft: false,
      sinusLift: false,
      denture: false,
      bridge: false,
      crown: false,
    },
    additionalInformation: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing treatment data from consultations table
  useEffect(() => {
    const loadTreatmentData = async () => {
      try {
        // Use appointment_id as primary lookup (required for multiple consultations)
        if (!appointmentId) {
          console.warn('No appointment ID provided, cannot load treatment data');
          return;
        }

        const { data, error } = await supabase
          .from('consultations')
          .select('clinical_assessment, treatment_recommendations, additional_information, updated_at')
          .eq('appointment_id', appointmentId)
          .single();

        if (data && !error) {
          setFormData({
            clinicalAssessment: data.clinical_assessment || '',
            treatmentRecommendations: data.treatment_recommendations || formData.treatmentRecommendations,
            additionalInformation: data.additional_information || ''
          });
          setLastSaved(new Date(data.updated_at));
        }
      } catch (error) {
        console.error('Error loading treatment data:', error);
      }
    };

    if (patientPacketId) {
      loadTreatmentData();
    }
  }, [patientPacketId, appointmentId]);

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
        new_patient_packet_id: patientPacketId,
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

  const handleCheckboxChange = (field: keyof TreatmentFormData['treatmentRecommendations']) => {
    const newData = {
      ...formData,
      treatmentRecommendations: {
        ...formData.treatmentRecommendations,
        [field]: !formData.treatmentRecommendations[field]
      }
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const treatmentOptions = [
    { key: 'implantPlacement', label: 'Implant Placement' },
    { key: 'implantRestoration', label: 'Implant Restoration' },
    { key: 'implantSupported', label: 'Implant Supported' },
    { key: 'extraction', label: 'Extraction' },
    { key: 'bonGraft', label: 'Bon Graft' },
    { key: 'sinusLift', label: 'Sinus Lift' },
    { key: 'denture', label: 'Denture' },
    { key: 'bridge', label: 'Bridge' },
    { key: 'crown', label: 'Crown' }
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
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {treatmentOptions.map((option) => (
              <Button
                key={option.key}
                type="button"
                variant={formData.treatmentRecommendations[option.key as keyof TreatmentFormData['treatmentRecommendations']] ? "default" : "outline"}
                onClick={() => handleCheckboxChange(option.key as keyof TreatmentFormData['treatmentRecommendations'])}
                className={`px-4 py-3 h-auto text-left justify-start ${
                  formData.treatmentRecommendations[option.key as keyof TreatmentFormData['treatmentRecommendations']]
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
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
