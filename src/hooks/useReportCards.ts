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
