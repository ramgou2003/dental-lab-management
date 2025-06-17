import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReportCard {
  id: string;
  lab_script_id: string;
  patient_name: string;
  lab_report_status: 'pending' | 'completed';
  clinical_report_status: 'pending' | 'completed';
  lab_report_data?: any;
  clinical_report_data?: any;
  lab_report_completed_at?: string;
  clinical_report_completed_at?: string;
  created_at: string;
  updated_at: string;
  // Lab script details
  lab_script?: {
    arch_type: string;
    upper_appliance_type?: string;
    lower_appliance_type?: string;
    screw_type?: string;
    notes?: string;
  };
}

export function useReportCards() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportCards = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('report_cards')
        .select(`
          *,
          lab_script:lab_scripts(
            arch_type,
            upper_appliance_type,
            lower_appliance_type,
            screw_type,
            notes
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching report cards:', error);
        setError(error.message);
        setReportCards([]);
        setLoading(false);
        return;
      }

      setReportCards(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching report cards:', err);
      setError('Failed to load report cards');
    } finally {
      setLoading(false);
    }
  };

  const updateLabReportStatus = async (reportCardId: string, status: 'completed', reportData?: any) => {
    try {
      const { data, error } = await supabase
        .from('report_cards')
        .update({
          lab_report_status: status,
          lab_report_data: reportData,
          lab_report_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportCardId)
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchReportCards();
      return data;
    } catch (err) {
      console.error('Error updating lab report status:', err);
      throw err;
    }
  };

  const updateClinicalReportStatus = async (reportCardId: string, status: 'completed', reportData?: any) => {
    try {
      // First, save the detailed clinical report data to the clinical_report_cards table
      if (reportData) {
        const reportCard = reportCards.find(card => card.id === reportCardId);
        if (reportCard) {
          // Helper function to handle empty strings
          const handleEmptyString = (value: string) => {
            return value && value.trim() !== '' ? value : null;
          };

          const clinicalData = {
            report_card_id: reportCardId,
            lab_script_id: reportCard.lab_script_id,
            patient_name: reportData.patient_name,
            arch_type: reportData.arch_type,
            upper_appliance_type: handleEmptyString(reportData.upper_appliance_type),
            lower_appliance_type: handleEmptyString(reportData.lower_appliance_type),
            insertion_date: reportData.insertion_date,
            fit_assessment: reportData.fit_assessment,
            occlusion_check: reportData.occlusion_check,
            patient_comfort: reportData.patient_comfort,
            retention_stability: reportData.retention_stability,
            aesthetic_satisfaction: reportData.aesthetic_satisfaction,
            functional_assessment: reportData.functional_assessment,
            tissue_response: handleEmptyString(reportData.tissue_response),
            speech_impact: handleEmptyString(reportData.speech_impact),
            eating_comfort: handleEmptyString(reportData.eating_comfort),
            follow_up_required: reportData.follow_up_required || 'no',
            follow_up_date: handleEmptyString(reportData.follow_up_date),
            adjustments_made: handleEmptyString(reportData.adjustments_made),
            patient_instructions: handleEmptyString(reportData.patient_instructions),
            clinical_notes: handleEmptyString(reportData.clinical_notes),
            overall_satisfaction: reportData.overall_satisfaction,
            treatment_success: reportData.treatment_success || 'successful',
            status: 'completed'
          };

          // Check if clinical report already exists for this report card
          const { data: existingClinical } = await supabase
            .from('clinical_report_cards')
            .select('id')
            .eq('report_card_id', reportCardId)
            .single();

          let clinicalError;
          if (existingClinical) {
            // Update existing clinical report
            const { error } = await supabase
              .from('clinical_report_cards')
              .update(clinicalData)
              .eq('report_card_id', reportCardId);
            clinicalError = error;
          } else {
            // Insert new clinical report
            const { error } = await supabase
              .from('clinical_report_cards')
              .insert([clinicalData]);
            clinicalError = error;
          }

          if (clinicalError) {
            console.error('Error saving clinical report card:', clinicalError);
            throw clinicalError;
          }
        }
      }

      // Then update the report_cards table status
      const { data, error } = await supabase
        .from('report_cards')
        .update({
          clinical_report_status: status,
          clinical_report_data: reportData,
          clinical_report_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportCardId)
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchReportCards();
      return data;
    } catch (err) {
      console.error('Error updating clinical report status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReportCards();
  }, []);

  return {
    reportCards,
    loading,
    error,
    fetchReportCards,
    updateLabReportStatus,
    updateClinicalReportStatus
  };
}
