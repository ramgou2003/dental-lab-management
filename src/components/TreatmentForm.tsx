import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, FileText, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const TreatmentForm: React.FC<TreatmentFormProps> = ({
  patientPacketId,
  patientName
}) => {
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
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            clinical_assessment,
            consultation_notes,
            treatment_implant_placement,
            treatment_implant_restoration,
            treatment_implant_supported,
            treatment_extraction,
            treatment_bon_graft,
            treatment_sinus_lift,
            treatment_denture,
            treatment_bridge,
            treatment_crown,
            updated_at
          `)
          .eq('new_patient_packet_id', patientPacketId)
          .single();

        if (data && !error) {
          setFormData({
            clinicalAssessment: data.clinical_assessment || '',
            treatmentRecommendations: {
              implantPlacement: data.treatment_implant_placement || false,
              implantRestoration: data.treatment_implant_restoration || false,
              implantSupported: data.treatment_implant_supported || false,
              extraction: data.treatment_extraction || false,
              bonGraft: data.treatment_bon_graft || false,
              sinusLift: data.treatment_sinus_lift || false,
              denture: data.treatment_denture || false,
              bridge: data.treatment_bridge || false,
              crown: data.treatment_crown || false,
            },
            additionalInformation: data.consultation_notes || ''
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
  }, [patientPacketId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const treatmentData = {
        new_patient_packet_id: patientPacketId,
        patient_name: patientName || 'Unknown Patient',
        clinical_assessment: formData.clinicalAssessment,
        consultation_notes: formData.additionalInformation,
        // Individual treatment recommendation fields
        treatment_implant_placement: formData.treatmentRecommendations.implantPlacement,
        treatment_implant_restoration: formData.treatmentRecommendations.implantRestoration,
        treatment_implant_supported: formData.treatmentRecommendations.implantSupported,
        treatment_extraction: formData.treatmentRecommendations.extraction,
        treatment_bon_graft: formData.treatmentRecommendations.bonGraft,
        treatment_sinus_lift: formData.treatmentRecommendations.sinusLift,
        treatment_denture: formData.treatmentRecommendations.denture,
        treatment_bridge: formData.treatmentRecommendations.bridge,
        treatment_crown: formData.treatmentRecommendations.crown,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving treatment data:', treatmentData);

      const { error } = await supabase
        .from('consultations')
        .upsert(treatmentData);

      if (error) throw error;

      setLastSaved(new Date());
      console.log('✅ Treatment data saved to consultations table successfully');
    } catch (error) {
      console.error('❌ Error saving treatment data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckboxChange = (field: keyof TreatmentFormData['treatmentRecommendations']) => {
    setFormData(prev => ({
      ...prev,
      treatmentRecommendations: {
        ...prev.treatmentRecommendations,
        [field]: !prev.treatmentRecommendations[field]
      }
    }));
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
          <div className="grid grid-cols-3 gap-4">
            {treatmentOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox
                  id={option.key}
                  checked={formData.treatmentRecommendations[option.key as keyof TreatmentFormData['treatmentRecommendations']]}
                  onCheckedChange={() => handleCheckboxChange(option.key as keyof TreatmentFormData['treatmentRecommendations'])}
                />
                <Label
                  htmlFor={option.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
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
};
