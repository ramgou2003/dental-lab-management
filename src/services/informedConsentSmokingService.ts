import { supabase } from '@/integrations/supabase/client';

export interface InformedConsentSmokingFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nicotine_use?: string;
  
  // Patient Understanding and Agreement
  understands_nicotine_effects?: boolean;
  understands_risks?: boolean;
  understands_timeline?: boolean;
  understands_insurance?: boolean;
  offered_resources?: boolean;
  takes_responsibility?: boolean;
  
  // Signatures
  patient_signature?: string;
  signature_date?: string;
  
  // Staff Use
  signed_consent?: string;
  refusal_reason?: string;
  
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
 * Get informed consent smoking forms for a specific patient
 */
export async function getInformedConsentSmokingFormsByPatientId(patientId: string): Promise<{ data: InformedConsentSmokingFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('informed_consent_smoking_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching informed consent smoking forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching informed consent smoking forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific informed consent smoking form by ID
 */
export async function getInformedConsentSmokingForm(formId: string): Promise<{ data: InformedConsentSmokingFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('informed_consent_smoking_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching informed consent smoking form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching informed consent smoking form:', error);
    return { data: null, error };
  }
}

/**
 * Create a new informed consent smoking form
 */
export async function createInformedConsentSmokingForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('informed_consent_smoking_forms')
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating informed consent smoking form:', error);
      return { data: null, error };
    }

    console.log('✅ Created informed consent smoking form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating informed consent smoking form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing informed consent smoking form
 */
export async function updateInformedConsentSmokingForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('informed_consent_smoking_forms')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating informed consent smoking form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated informed consent smoking form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating informed consent smoking form:', error);
    return { data: null, error };
  }
}

/**
 * Delete an informed consent smoking form
 */
export async function deleteInformedConsentSmokingForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('informed_consent_smoking_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting informed consent smoking form:', error);
      return { error };
    }

    console.log('✅ Deleted informed consent smoking form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting informed consent smoking form:', error);
    return { error };
  }
}

/**
 * Auto-save informed consent smoking form (upsert with draft status)
 */
export async function autoSaveInformedConsentSmokingForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving informed consent smoking form...');
    const dbData = convertFormDataToDatabase(formData, patientId, leadId, newPatientPacketId);

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('informed_consent_smoking_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Preserve submitted status, otherwise set to draft
      dbData.status = currentRecord?.status === 'submitted' ? 'submitted' : 'draft';

      // Update existing record
      console.log('📝 Updating existing informed consent smoking form with status:', dbData.status);
      const { data, error } = await supabase
        .from('informed_consent_smoking_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating informed consent smoking form:', error);
        return { data: null, error };
      }

      console.log('✅ Informed consent smoking form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Create new record - always start as draft
      dbData.status = 'draft';
      console.log('📝 Creating new informed consent smoking form draft');
      const { data, error } = await supabase
        .from('informed_consent_smoking_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating informed consent smoking form:', error);
        return { data: null, error };
      }

      console.log('✅ Informed consent smoking form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving informed consent smoking form:', error);
    return { data: null, error };
  }
}

/**
 * Convert form data to database format
 */
function convertFormDataToDatabase(formData: any, patientId?: string, leadId?: string, newPatientPacketId?: string) {
  return {
    patient_id: patientId,
    lead_id: leadId,
    new_patient_packet_id: newPatientPacketId,

    // Patient Information
    first_name: formData.firstName,
    last_name: formData.lastName,
    date_of_birth: formData.dateOfBirth,
    nicotine_use: formData.nicotineUse,

    // Patient Understanding and Agreement
    understands_nicotine_effects: formData.understandsNicotineEffects,
    understands_risks: formData.understandsRisks,
    understands_timeline: formData.understandsTimeline,
    understands_insurance: formData.understandsInsurance,
    offered_resources: formData.offeredResources,
    takes_responsibility: formData.takesResponsibility,

    // Signatures
    patient_signature: formData.patientSignature,
    signature_date: formData.signatureDate,

    // Staff Use
    signed_consent: formData.signedConsent,
    refusal_reason: formData.refusalReason,

    // Backup JSONB field
    form_data: formData
  };
}

/**
 * Format informed consent smoking form for display
 */
export function formatInformedConsentSmokingFormForDisplay(form: InformedConsentSmokingFormData) {
  const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ');
  
  return {
    id: form.id,
    title: `Informed Consent - Nicotine Use - ${fullName || 'Unknown Patient'}`,
    subtitle: form.nicotine_use ? `Nicotine Use: ${form.nicotine_use}` : '',
    date: form.signature_date || form.created_at?.split('T')[0],
    status: form.status,
    nicotineUse: form.nicotine_use,
    hasSignature: !!form.patient_signature,
    allAgreementsChecked: form.understands_nicotine_effects && form.understands_risks && 
                         form.understands_timeline && form.understands_insurance && 
                         form.offered_resources && form.takes_responsibility,
    createdAt: form.created_at
  };
}
