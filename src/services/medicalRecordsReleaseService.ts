import { supabase } from '@/integrations/supabase/client';

export interface MedicalRecordsReleaseFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  patient_name?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  
  // Release Information
  date_of_request?: string;
  records_from_date?: string;
  records_to_date?: string;
  
  // Records to Release (checkboxes)
  complete_record?: boolean;
  xrays?: boolean;
  lab_results?: boolean;
  consultation_notes?: boolean;
  treatment_plans?: boolean;
  surgical_reports?: boolean;
  prescriptions?: boolean;
  photographs?: boolean;
  models?: boolean;
  other_records?: boolean;
  other_records_description?: string;
  
  // Release To Information
  release_to_name?: string;
  release_to_title?: string;
  release_to_organization?: string;
  release_to_address?: string;
  release_to_city?: string;
  release_to_state?: string;
  release_to_zip_code?: string;
  release_to_phone?: string;
  release_to_fax?: string;
  
  // Purpose of Release
  purpose_of_release?: string;
  
  // Authorization Details
  authorization_expiration?: string;
  right_to_revoke?: boolean;
  copy_to_patient?: boolean;
  
  // Signatures
  patient_signature?: string;
  patient_signature_date?: string;
  witness_signature?: string;
  witness_signature_date?: string;
  witness_name?: string;
  
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
 * Get medical records release forms for a specific patient
 */
export async function getMedicalRecordsReleaseFormsByPatientId(patientId: string): Promise<{ data: MedicalRecordsReleaseFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('medical_records_release_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medical records release forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching medical records release forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific medical records release form by ID
 */
export async function getMedicalRecordsReleaseForm(formId: string): Promise<{ data: MedicalRecordsReleaseFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('medical_records_release_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching medical records release form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching medical records release form:', error);
    return { data: null, error };
  }
}

/**
 * Create a new medical records release form
 */
export async function createMedicalRecordsReleaseForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('medical_records_release_forms')
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating medical records release form:', error);
      return { data: null, error };
    }

    console.log('✅ Created medical records release form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating medical records release form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing medical records release form
 */
export async function updateMedicalRecordsReleaseForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('medical_records_release_forms')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating medical records release form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated medical records release form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating medical records release form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a medical records release form
 */
export async function deleteMedicalRecordsReleaseForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('medical_records_release_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting medical records release form:', error);
      return { error };
    }

    console.log('✅ Deleted medical records release form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting medical records release form:', error);
    return { error };
  }
}

/**
 * Format medical records release form for display
 */
export function formatMedicalRecordsReleaseFormForDisplay(form: MedicalRecordsReleaseFormData) {
  return {
    id: form.id,
    title: `Medical Records Release - ${form.patient_name || 'Unknown Patient'}`,
    subtitle: form.release_to_organization ? `To: ${form.release_to_organization}` : '',
    date: form.date_of_request || form.created_at?.split('T')[0],
    status: form.status,
    purpose: form.purpose_of_release,
    hasSignatures: !!(form.patient_signature || form.witness_signature),
    expirationDate: form.authorization_expiration,
    createdAt: form.created_at
  };
}
