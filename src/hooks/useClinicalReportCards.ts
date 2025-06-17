import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalReportCard {
  id: string;
  report_card_id: string | null;
  lab_script_id: string | null;
  patient_name: string;
  arch_type: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  insertion_date: string;
  fit_assessment: string;
  occlusion_check: string;
  patient_comfort: string;
  retention_stability: string;
  aesthetic_satisfaction: string;
  functional_assessment: string;
  tissue_response: string | null;
  speech_impact: string | null;
  eating_comfort: string | null;
  follow_up_required: string | null;
  follow_up_date: string | null;
  adjustments_made: string | null;
  patient_instructions: string | null;
  clinical_notes: string | null;
  overall_satisfaction: string;
  treatment_success: string | null;
  status: 'completed' | 'submitted';
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalReportCardFormData {
  patient_name: string;
  arch_type: string;
  upper_appliance_type?: string;
  lower_appliance_type?: string;
  insertion_date: string;
  fit_assessment: string;
  occlusion_check: string;
  patient_comfort: string;
  retention_stability: string;
  aesthetic_satisfaction: string;
  functional_assessment: string;
  tissue_response?: string;
  speech_impact?: string;
  eating_comfort?: string;
  follow_up_required?: string;
  follow_up_date?: string;
  adjustments_made?: string;
  patient_instructions?: string;
  clinical_notes?: string;
  overall_satisfaction: string;
  treatment_success?: string;
}

export function useClinicalReportCards() {
  const [clinicalReportCards, setClinicalReportCards] = useState<ClinicalReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClinicalReportCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('clinical_report_cards')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching clinical report cards:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load clinical report cards",
          variant: "destructive",
        });
        return;
      }

      setClinicalReportCards(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addClinicalReportCard = async (
    formData: ClinicalReportCardFormData, 
    reportCardId: string, 
    labScriptId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('clinical_report_cards')
        .upsert([{
          report_card_id: reportCardId,
          lab_script_id: labScriptId,
          patient_name: formData.patient_name,
          arch_type: formData.arch_type,
          upper_appliance_type: formData.upper_appliance_type || null,
          lower_appliance_type: formData.lower_appliance_type || null,
          insertion_date: formData.insertion_date,
          fit_assessment: formData.fit_assessment,
          occlusion_check: formData.occlusion_check,
          patient_comfort: formData.patient_comfort,
          retention_stability: formData.retention_stability,
          aesthetic_satisfaction: formData.aesthetic_satisfaction,
          functional_assessment: formData.functional_assessment,
          tissue_response: formData.tissue_response || null,
          speech_impact: formData.speech_impact || null,
          eating_comfort: formData.eating_comfort || null,
          follow_up_required: formData.follow_up_required || 'no',
          follow_up_date: formData.follow_up_date || null,
          adjustments_made: formData.adjustments_made || null,
          patient_instructions: formData.patient_instructions || null,
          clinical_notes: formData.clinical_notes || null,
          overall_satisfaction: formData.overall_satisfaction,
          treatment_success: formData.treatment_success || 'successful',
          status: 'completed'
        }], {
          onConflict: 'report_card_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding clinical report card:', error);
        toast({
          title: "Error",
          description: "Failed to submit clinical report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Clinical report card submitted successfully",
      });

      // Refresh the list
      await fetchClinicalReportCards();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const updateClinicalReportCard = async (id: string, updates: Partial<ClinicalReportCardFormData>) => {
    try {
      const { data, error } = await supabase
        .from('clinical_report_cards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating clinical report card:', error);
        toast({
          title: "Error",
          description: "Failed to update clinical report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Clinical report card updated successfully",
      });

      // Refresh the list
      await fetchClinicalReportCards();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const deleteClinicalReportCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clinical_report_cards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting clinical report card:', error);
        toast({
          title: "Error",
          description: "Failed to delete clinical report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Clinical report card deleted successfully",
      });

      // Refresh the list
      await fetchClinicalReportCards();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const getClinicalReportCardByReportCardId = useCallback(async (reportCardId: string): Promise<ClinicalReportCard | null> => {
    try {
      const { data, error } = await supabase
        .from('clinical_report_cards')
        .select('*')
        .eq('report_card_id', reportCardId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching clinical report card:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchClinicalReportCards();
  }, []);

  return {
    clinicalReportCards,
    loading,
    error,
    fetchClinicalReportCards,
    addClinicalReportCard,
    updateClinicalReportCard,
    deleteClinicalReportCard,
    getClinicalReportCardByReportCardId
  };
}
