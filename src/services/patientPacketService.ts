import { supabase } from '@/integrations/supabase/client';
import { NewPatientFormData } from '@/types/newPatientPacket';
import { NewPatientPacketDB, PatientPacketSummary } from '@/types/supabasePatientPacket';
import { convertFormDataToDatabase, convertDatabaseToFormData } from '@/utils/patientPacketConverter';

/**
 * Save a new patient packet to the database
 */
export async function savePatientPacket(
  formData: NewPatientFormData,
  patientId?: string,
  leadId?: string,
  submissionSource: 'public' | 'internal' = 'public'
): Promise<{ data: NewPatientPacketDB | null; error: any }> {
  try {
    console.log('Converting form data to database format...');
    const dbData = convertFormDataToDatabase(formData, patientId, leadId, submissionSource);
    console.log('Database data prepared:', {
      first_name: dbData.first_name,
      last_name: dbData.last_name,
      email: dbData.email,
      submission_source: dbData.submission_source,
      patient_id: dbData.patient_id,
      lead_id: dbData.lead_id
    });

    console.log('Attempting to insert into new_patient_packets...');
    const { data, error } = await supabase
      .from('new_patient_packets')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving patient packet:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { data: null, error };
    }

    console.log('Patient packet saved successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error saving patient packet:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing patient packet
 */
export async function updatePatientPacket(
  packetId: string,
  formData: NewPatientFormData,
  submissionSource: 'public' | 'internal' = 'public'
): Promise<{ data: NewPatientPacketDB | null; error: any }> {
  try {
    const dbData = convertFormDataToDatabase(formData, undefined, undefined, submissionSource);
    // Remove IDs from update data since they shouldn't change
    delete dbData.patient_id;
    delete dbData.lead_id;
    
    const { data, error } = await supabase
      .from('new_patient_packets')
      .update(dbData)
      .eq('id', packetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient packet:', error);
      return { data: null, error };
    }

    console.log('Patient packet updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating patient packet:', error);
    return { data: null, error };
  }
}

/**
 * Get a patient packet by ID
 */
export async function getPatientPacket(packetId: string): Promise<{ data: NewPatientFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('id', packetId)
      .single();

    if (error) {
      console.error('Error fetching patient packet:', error);
      return { data: null, error };
    }

    const formData = convertDatabaseToFormData(data);
    return { data: formData, error: null };
  } catch (error) {
    console.error('Unexpected error fetching patient packet:', error);
    return { data: null, error };
  }
}

/**
 * Get all patient packets for a specific patient
 */
export async function getPatientPacketsByPatientId(patientId: string): Promise<{ data: NewPatientPacketDB[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient packets:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching patient packets:', error);
    return { data: null, error };
  }
}

/**
 * Get all patient packets for a specific lead
 */
export async function getPatientPacketsByLeadId(leadId: string): Promise<{ data: NewPatientPacketDB[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient packets for lead:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching patient packets for lead:', error);
    return { data: null, error };
  }
}

/**
 * Get patient packet summary for dashboard/listing
 */
export async function getPatientPacketSummary(packetId: string): Promise<{ data: PatientPacketSummary | null; error: any }> {
  try {
    const { data, error } = await supabase
      .rpc('get_patient_packet_summary', { packet_id: packetId });

    if (error) {
      console.error('Error fetching patient packet summary:', error);
      return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Unexpected error fetching patient packet summary:', error);
    return { data: null, error };
  }
}

/**
 * Mark a patient packet as completed
 */
export async function completePatientPacket(packetId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .rpc('complete_patient_packet', { packet_id: packetId });

    if (error) {
      console.error('Error completing patient packet:', error);
      return { success: false, error };
    }

    return { success: data, error: null };
  } catch (error) {
    console.error('Unexpected error completing patient packet:', error);
    return { success: false, error };
  }
}

/**
 * Delete a patient packet
 */
export async function deletePatientPacket(packetId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('new_patient_packets')
      .delete()
      .eq('id', packetId);

    if (error) {
      console.error('Error deleting patient packet:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting patient packet:', error);
    return { success: false, error };
  }
}

/**
 * Get all patient packets with pagination
 */
export async function getAllPatientPackets(
  page: number = 1,
  pageSize: number = 50,
  status?: 'draft' | 'completed' | 'submitted'
): Promise<{ data: NewPatientPacketDB[] | null; count: number | null; error: any }> {
  try {
    let query = supabase
      .from('new_patient_packets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) {
      query = query.eq('form_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching all patient packets:', error);
      return { data: null, count: null, error };
    }

    return { data, count, error: null };
  } catch (error) {
    console.error('Unexpected error fetching all patient packets:', error);
    return { data: null, count: null, error };
  }
}
