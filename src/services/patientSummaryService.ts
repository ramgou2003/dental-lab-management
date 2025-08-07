import { supabase } from '@/integrations/supabase/client';

export interface PatientSummary {
  id?: string;
  patient_packet_id: string;
  medical_history_summary: string;
  allergies_summary: string;
  dental_history_summary: string;
  attention_items: string[];
  potential_complications: string[];
  overall_assessment: string;
  generated_at?: string;
  updated_at?: string;
  created_by?: string;
}

/**
 * Save or update a patient summary in the database
 */
export const savePatientSummary = async (
  patientPacketId: string,
  summaryData: {
    medicalHistorySummary: string;
    allergiesSummary: string;
    dentalHistorySummary: string;
    attentionItems: string[];
    potentialComplications: string[];
    overallAssessment: string;
  }
): Promise<PatientSummary> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const summaryRecord = {
      patient_packet_id: patientPacketId,
      medical_history_summary: summaryData.medicalHistorySummary,
      allergies_summary: summaryData.allergiesSummary,
      dental_history_summary: summaryData.dentalHistorySummary,
      attention_items: summaryData.attentionItems,
      potential_complications: summaryData.potentialComplications,
      overall_assessment: summaryData.overallAssessment,
      created_by: user?.id,
      updated_at: new Date().toISOString()
    };

    // Try to update existing summary first
    const { data: existingSummary, error: fetchError } = await supabase
      .from('patient_summaries')
      .select('id')
      .eq('patient_packet_id', patientPacketId)
      .single();

    if (existingSummary && !fetchError) {
      // Update existing summary
      const { data, error } = await supabase
        .from('patient_summaries')
        .update(summaryRecord)
        .eq('id', existingSummary.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new summary
      const { data, error } = await supabase
        .from('patient_summaries')
        .insert(summaryRecord)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving patient summary:', error);
    throw new Error('Failed to save patient summary');
  }
};

/**
 * Get a patient summary by patient packet ID
 */
export const getPatientSummary = async (patientPacketId: string): Promise<PatientSummary | null> => {
  try {
    const { data, error } = await supabase
      .from('patient_summaries')
      .select('*')
      .eq('patient_packet_id', patientPacketId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No summary found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching patient summary:', error);
    return null;
  }
};

/**
 * Delete a patient summary
 */
export const deletePatientSummary = async (patientPacketId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('patient_summaries')
      .delete()
      .eq('patient_packet_id', patientPacketId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting patient summary:', error);
    throw new Error('Failed to delete patient summary');
  }
};

/**
 * Get all patient summaries for a user
 */
export const getUserPatientSummaries = async (): Promise<PatientSummary[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('patient_summaries')
      .select(`
        *,
        new_patient_packets (
          first_name,
          last_name,
          created_at
        )
      `)
      .eq('created_by', user?.id)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user patient summaries:', error);
    return [];
  }
};
