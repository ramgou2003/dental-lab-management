import { supabase } from '@/integrations/supabase/client';

export interface MedicalRecordsReleaseFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;

  // Patient Information (simplified)
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  patient_name?: string;

  // Date and Time with EST sync
  signature_date?: string;
  signature_time?: string;

  // Agreement and Signatures
  has_agreed?: boolean;
  patient_signature?: string;

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
 * Auto-save medical records release form (create or update)
 */
export async function autoSaveMedicalRecordsReleaseForm(
  formData: any,
  patientId: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingFormId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    // Prepare the data for saving
    const saveData = {
      patient_id: patientId,
      lead_id: leadId || null,
      new_patient_packet_id: newPatientPacketId || null,
      first_name: formData.firstName || '',
      last_name: formData.lastName || '',
      date_of_birth: formData.dateOfBirth || null,
      patient_name: formData.patientName || '',
      signature_date: formData.signatureDate || null,
      signature_time: formData.signatureTime || null,
      has_agreed: formData.hasAgreed || false,
      patient_signature: formData.patientSignature || '',
      status: formData.status || 'draft' // Use provided status or default to draft
    };

    console.log('🔄 Auto-saving medical records release form with payload:', saveData);
    console.log('🆔 Existing form ID:', existingFormId);

    if (existingFormId) {
      // Only preserve status if not explicitly set (i.e., during auto-save)
      if (!formData.status) {
        // Get current record to check status
        const { data: currentRecord } = await supabase
          .from('medical_records_release_forms')
          .select('status')
          .eq('id', existingFormId)
          .single();

        // Preserve completed, signed, or submitted status, otherwise set to draft
        const preservedStatuses = ['completed', 'signed', 'submitted'];
        saveData.status = preservedStatuses.includes(currentRecord?.status) ? currentRecord.status : 'draft';
      }

      // Update existing form
      console.log('📝 Updating existing form with ID:', existingFormId, 'Status:', saveData.status);
      return await updateMedicalRecordsReleaseForm(existingFormId, saveData);
    } else {
      // Before creating a new form, check if there's already a draft form for this patient
      console.log('🔍 Checking for existing draft forms for patient:', patientId);
      const { data: existingDrafts, error: checkError } = await supabase
        .from('medical_records_release_forms')
        .select('id')
        .eq('patient_id', patientId)
        .eq('status', 'draft')
        .limit(1);

      if (checkError) {
        console.error('Error checking for existing drafts:', checkError);
        // Continue with creation if check fails
      } else if (existingDrafts && existingDrafts.length > 0) {
        // Update the existing draft instead of creating a new one
        const existingDraftId = existingDrafts[0].id;
        console.log('📝 Found existing draft, updating instead of creating new:', existingDraftId);
        return await updateMedicalRecordsReleaseForm(existingDraftId, saveData);
      }

      // Create new form only if no draft exists
      console.log('🆕 Creating new form');
      return await createMedicalRecordsReleaseForm(saveData);
    }
  } catch (error) {
    console.error('Error in autoSaveMedicalRecordsReleaseForm:', error);
    return { data: null, error };
  }
}

/**
 * Format medical records release form for display
 */
export function formatMedicalRecordsReleaseFormForDisplay(form: MedicalRecordsReleaseFormData) {
  const patientName = form.patient_name || (form.first_name && form.last_name ? `${form.first_name} ${form.last_name}` : 'Unknown Patient');

  return {
    id: form.id,
    title: `Medical Records Release - ${patientName}`,
    subtitle: 'Authorization for Release of Protected Health Information',
    date: form.signature_date || form.created_at?.split('T')[0],
    status: form.status,
    hasSignatures: !!form.patient_signature,
    signatureDate: form.signature_date,
    signatureTime: form.signature_time,
    createdAt: form.created_at
  };
}
