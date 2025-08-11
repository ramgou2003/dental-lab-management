import { supabase } from '@/integrations/supabase/client';

export interface ThankYouPreSurgeryFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  patient_name?: string;
  phone?: string;
  date_of_birth?: string;
  email?: string;
  treatment_type?: string;
  form_date?: string;
  
  // Medical Screening
  heart_conditions?: boolean;
  blood_thinners?: boolean;
  diabetes?: boolean;
  high_blood_pressure?: boolean;
  allergies?: boolean;
  pregnancy_nursing?: boolean;
  recent_illness?: boolean;
  medication_changes?: boolean;
  
  // Timeline Acknowledgments - 3 Days Before
  start_medrol?: boolean;
  start_amoxicillin?: boolean;
  no_alcohol_3days?: boolean;
  arrange_ride?: boolean;
  
  // Timeline Acknowledgments - Night Before
  take_diazepam?: boolean;
  no_food_after_midnight?: boolean;
  no_water_after_6am?: boolean;
  confirm_ride?: boolean;
  
  // Timeline Acknowledgments - Morning Of
  no_breakfast?: boolean;
  no_pills?: boolean;
  wear_comfortable?: boolean;
  arrive_on_time?: boolean;
  
  // Timeline Acknowledgments - After Surgery
  no_alcohol_24hrs?: boolean;
  no_driving_24hrs?: boolean;
  follow_instructions?: boolean;
  call_if_concerns?: boolean;
  
  // Patient Acknowledgments
  read_instructions?: boolean;
  understand_medications?: boolean;
  understand_sedation?: boolean;
  arranged_transport?: boolean;
  understand_restrictions?: boolean;
  will_follow_instructions?: boolean;
  understand_emergency?: boolean;
  
  // Signatures
  patient_signature?: string;
  signature_date?: string;
  patient_print_name?: string;
  
  // Status and Metadata
  status: 'draft' | 'submitted' | 'signed' | 'void';
  form_version?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  signed_at?: string;
  created_by?: string;
  updated_by?: string;
  
  // Public Link Support
  public_link_id?: string;
  public_link_status?: 'active' | 'inactive' | 'expired';
  public_link_expires_at?: string;
  is_public_submission?: boolean;
  
  // Backup JSONB field
  form_data?: any;
}

/**
 * Get thank you pre-surgery forms for a specific patient
 */
export async function getThankYouPreSurgeryFormsByPatientId(patientId: string): Promise<{ data: ThankYouPreSurgeryFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching thank you pre-surgery forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching thank you pre-surgery forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific thank you pre-surgery form by ID
 */
export async function getThankYouPreSurgeryForm(formId: string): Promise<{ data: ThankYouPreSurgeryFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching thank you pre-surgery form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Create a new thank you pre-surgery form
 */
export async function createThankYouPreSurgeryForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating thank you pre-surgery form:', error);
      return { data: null, error };
    }

    console.log('✅ Created thank you pre-surgery form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing thank you pre-surgery form
 */
export async function updateThankYouPreSurgeryForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating thank you pre-surgery form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated thank you pre-surgery form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a thank you pre-surgery form
 */
export async function deleteThankYouPreSurgeryForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting thank you pre-surgery form:', error);
      return { error };
    }

    console.log('✅ Deleted thank you pre-surgery form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting thank you pre-surgery form:', error);
    return { error };
  }
}

/**
 * Format thank you pre-surgery form for display
 */
export function formatThankYouPreSurgeryFormForDisplay(form: ThankYouPreSurgeryFormData) {
  return {
    id: form.id,
    title: `Thank You & Pre-Surgery - ${form.patient_name || 'Unknown Patient'}`,
    subtitle: form.treatment_type ? `Treatment: ${form.treatment_type}` : '',
    date: form.form_date || form.created_at?.split('T')[0],
    status: form.status,
    treatmentType: form.treatment_type,
    hasSignature: !!form.patient_signature,
    medicalScreeningComplete: form.heart_conditions !== undefined && form.blood_thinners !== undefined,
    timelineAcknowledgmentsComplete: form.start_medrol !== undefined && form.take_diazepam !== undefined && 
                                   form.no_breakfast !== undefined && form.no_alcohol_24hrs !== undefined,
    patientAcknowledgmentsComplete: form.read_instructions && form.understand_medications && 
                                  form.understand_sedation && form.arranged_transport && 
                                  form.understand_restrictions && form.will_follow_instructions && 
                                  form.understand_emergency,
    createdAt: form.created_at
  };
}
