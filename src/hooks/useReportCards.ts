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
  lab_report_completed_by?: string;
  lab_report_completed_by_name?: string;
  clinical_report_completed_by?: string;
  clinical_report_completed_by_name?: string;
  created_at: string;
  updated_at: string;
  // Lab script details
  lab_script?: {
    arch_type: string;
    upper_appliance_type?: string;
    lower_appliance_type?: string;
    screw_type?: string;
    custom_screw_type?: string;
    material?: string;
    shade?: string;
    notes?: string;
    requested_date?: string;
    due_date?: string;
  };
}

export function useReportCards() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for faster UI
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
            custom_screw_type,
            material,
            shade,
            notes,
            requested_date,
            due_date
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

      // Fetch completed_by and completed_at information from lab_report_cards and clinical_report_cards for each report card
      const enrichedData = await Promise.all((data || []).map(async (card) => {
        let enrichedCard = { ...card };

        // Fetch lab report completion info
        if (card.lab_report_status === 'completed' && card.lab_script_id) {
          const { data: labReportData } = await supabase
            .from('lab_report_cards')
            .select('completed_by, completed_by_name, completed_at')
            .eq('lab_script_id', card.lab_script_id)
            .single();

          enrichedCard = {
            ...enrichedCard,
            lab_report_completed_by: labReportData?.completed_by,
            lab_report_completed_by_name: labReportData?.completed_by_name,
            lab_report_completed_at: labReportData?.completed_at
          };
        }

        // Fetch clinical report completion info
        if (card.clinical_report_status === 'completed') {
          const { data: clinicalReportData } = await supabase
            .from('clinical_report_cards')
            .select('completed_by, completed_by_name, completed_at')
            .eq('report_card_id', card.id)
            .single();

          enrichedCard = {
            ...enrichedCard,
            clinical_report_completed_by: clinicalReportData?.completed_by,
            clinical_report_completed_by_name: clinicalReportData?.completed_by_name,
            clinical_report_completed_at: clinicalReportData?.completed_at
          };
        }

        return enrichedCard;
      }));

      setReportCards(enrichedData);
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

      // Immediately update local state for the user who updated it
      setReportCards(prev =>
        prev.map(card =>
          card.id === reportCardId
            ? {
                ...card,
                lab_report_status: status,
                lab_report_data: reportData,
                lab_report_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : card
        )
      );

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

          // Use the completed_at_timestamp from the form data (already in EST and converted to ISO)
          const completedAtTimestamp = reportData.completed_at_timestamp;

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
            follow_up_required: reportData.follow_up_required || 'no',
            follow_up_date: handleEmptyString(reportData.follow_up_date),
            adjustments_made: handleEmptyString(reportData.adjustments_made),
            patient_instructions: handleEmptyString(reportData.patient_instructions),
            clinical_notes: handleEmptyString(reportData.clinical_notes),
            overall_satisfaction: reportData.overall_satisfaction,
            treatment_success: reportData.treatment_success || 'successful',
            completed_at: completedAtTimestamp,
            completed_by: reportData.completed_by || null,
            completed_by_name: reportData.completed_by_name || null,
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

      // Immediately update local state for the user who updated it
      setReportCards(prev =>
        prev.map(card =>
          card.id === reportCardId
            ? {
                ...card,
                clinical_report_status: status,
                clinical_report_data: reportData,
                clinical_report_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : card
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating clinical report status:', err);
      throw err;
    }
  };

  // Load report cards and set up real-time subscription
  useEffect(() => {
    fetchReportCards();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      subscription = supabase
        .channel('report_cards_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'report_cards'
          },
          (payload) => {
            console.log('🔄 Real-time report card change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Add new report card to existing list
              setReportCards(prev => {
                // Check if report card already exists to avoid duplicates
                if (prev.some(card => card.id === payload.new.id)) {
                  return prev;
                }
                // Insert at the beginning (most recent first)
                return [payload.new as ReportCard, ...prev];
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Update specific report card in the list
              setReportCards(prev =>
                prev.map(card =>
                  card.id === payload.new.id ? payload.new as ReportCard : card
                )
              );

            } else if (payload.eventType === 'DELETE' && payload.old) {
              // Remove deleted report card from the list
              setReportCards(prev => prev.filter(card => card.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lab_report_cards'
          },
          (payload) => {
            console.log('🔄 Real-time lab report card change received:', payload.eventType);
            // When lab report cards change, refresh the main report cards to get updated status
            fetchReportCards();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clinical_report_cards'
          },
          (payload) => {
            console.log('🔄 Real-time clinical report card change received:', payload.eventType);
            // When clinical report cards change, refresh the main report cards to get updated status
            fetchReportCards();
          }
        )
        .subscribe((status) => {
          console.log('📡 Report cards real-time subscription status:', status);
        });
    } else {
      console.warn('⚠️ Supabase real-time not available - report cards will not update in real-time');
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
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
