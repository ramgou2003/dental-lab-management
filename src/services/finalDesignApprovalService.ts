import { supabase } from '@/integrations/supabase/client';

export interface FinalDesignApprovalFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  date_of_service?: string;
  
  // Treatment Details
  treatment?: string; // "UPPER", "LOWER", "DUAL"
  material?: string;
  shade_selected?: string;
  
  // Design Approval & Fee Agreement Acknowledgments
  design_review_acknowledged?: boolean;
  final_fabrication_approved?: boolean;
  post_approval_changes_understood?: boolean;
  warranty_reminder_understood?: boolean;
  
  // Signatures
  patient_full_name?: string;
  patient_signature?: string;
  patient_signature_date?: string;
  witness_name?: string;
  witness_signature?: string;
  witness_signature_date?: string;
  
  // Office Use Only
  design_added_to_chart?: boolean;
  fee_agreement_scanned?: boolean;
  
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
 * Get final design approval forms for a specific patient
 */
export async function getFinalDesignApprovalFormsByPatientId(patientId: string): Promise<{ data: FinalDesignApprovalFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('final_design_approval_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching final design approval forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching final design approval forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific final design approval form by ID
 */
export async function getFinalDesignApprovalForm(formId: string): Promise<{ data: FinalDesignApprovalFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('final_design_approval_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching final design approval form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching final design approval form:', error);
    return { data: null, error };
  }
}

/**
 * Create a new final design approval form
 */
export async function createFinalDesignApprovalForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('final_design_approval_forms')
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating final design approval form:', error);
      return { data: null, error };
    }

    console.log('✅ Created final design approval form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating final design approval form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing final design approval form
 */
export async function updateFinalDesignApprovalForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('final_design_approval_forms')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating final design approval form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated final design approval form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating final design approval form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a final design approval form
 */
export async function deleteFinalDesignApprovalForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('final_design_approval_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting final design approval form:', error);
      return { error };
    }

    console.log('✅ Deleted final design approval form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting final design approval form:', error);
    return { error };
  }
}

/**
 * Format final design approval form for display
 */
export function formatFinalDesignApprovalFormForDisplay(form: FinalDesignApprovalFormData) {
  const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ');
  
  return {
    id: form.id,
    title: `Final Design Approval - ${fullName || 'Unknown Patient'}`,
    subtitle: form.treatment ? `Treatment: ${form.treatment}` : '',
    date: form.date_of_service || form.created_at?.split('T')[0],
    status: form.status,
    treatment: form.treatment,
    material: form.material,
    shade: form.shade_selected,
    hasSignatures: !!(form.patient_signature || form.witness_signature),
    allAcknowledgmentsChecked: form.design_review_acknowledged && form.final_fabrication_approved && 
                              form.post_approval_changes_understood && form.warranty_reminder_understood,
    officeTasksCompleted: form.design_added_to_chart && form.fee_agreement_scanned,
    createdAt: form.created_at
  };
}
