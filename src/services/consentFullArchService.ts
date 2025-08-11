import { supabase } from '@/integrations/supabase/client';

export interface ConsentFullArchFormData {
  id: string;
  patient_id: string;
  patient_name?: string;
  chart_number?: string;
  consent_date?: string;
  consent_time?: string;
  status: 'draft' | 'submitted' | 'signed' | 'void';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  form_data?: any; // JSONB backup
  
  // Patient & Interpreter Information
  primary_language?: string;
  other_language_text?: string;
  interpreter_required?: string;
  interpreter_name?: string;
  interpreter_credential?: string;
  patient_info_initials?: string;
  
  // Treatment Description
  arch_type?: string;
  upper_jaw?: string;
  lower_jaw?: string;
  
  // Signatures
  patient_signature?: string;
  patient_signature_date?: string;
  surgeon_signature?: string;
  surgeon_date?: string;
  witness_signature?: string;
  witness_signature_date?: string;
}

/**
 * Get consent forms for a specific patient
 */
export async function getConsentFormsByPatientId(patientId: string): Promise<{ data: ConsentFullArchFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consent forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching consent forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific consent form by ID
 */
export async function getConsentForm(formId: string): Promise<{ data: ConsentFullArchFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching consent form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching consent form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing consent form
 */
export async function updateConsentForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating consent form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated consent form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating consent form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a consent form
 */
export async function deleteConsentForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('consent_full_arch_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting consent form:', error);
      return { error };
    }

    console.log('✅ Deleted consent form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting consent form:', error);
    return { error };
  }
}

/**
 * Format consent form for display
 */
export function formatConsentFormForDisplay(form: ConsentFullArchFormData) {
  return {
    id: form.id,
    title: `Consent Full Arch - ${form.patient_name || 'Unknown Patient'}`,
    subtitle: form.chart_number ? `Chart #${form.chart_number}` : '',
    date: form.consent_date || form.created_at?.split('T')[0],
    status: form.status,
    archType: form.arch_type,
    hasSignatures: !!(form.patient_signature || form.surgeon_signature),
    createdAt: form.created_at
  };
}
