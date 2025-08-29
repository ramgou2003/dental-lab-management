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
      .insert([{
        ...formData,
        status: 'completed' // Set status to completed for regular form submissions
      }])
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
        status: formData.status || 'submitted', // Preserve existing status or set to submitted
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
  return convertDatabaseToFormData(form);
}

/**
 * Auto-save Final Design Approval form
 */
export async function autoSaveFinalDesignApprovalForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving Final Design Approval form...');
    console.log('📝 Input formData:', JSON.stringify(formData, null, 2));
    console.log('📝 patientId:', patientId);
    console.log('📝 existingId:', existingId);
    console.log('📝 formData.status:', formData.status);

    const dbData = convertFormDataToDatabase(formData, patientId);
    console.log('📝 Processed dbData:', JSON.stringify(dbData, null, 2));

    // Validate that we have some meaningful data
    if (!dbData.first_name && !dbData.last_name && !dbData.treatment) {
      console.warn('⚠️ Warning: Saving form with minimal data');
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('final_design_approval_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Use the status from formData if provided, otherwise preserve current status or set to draft
      dbData.status = formData.status ||
        (currentRecord?.status === 'submitted' ? 'submitted' : 'draft');

      // Update existing record
      console.log('📝 Updating existing Final Design Approval form with status:', dbData.status);
      const { data, error } = await supabase
        .from('final_design_approval_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Final Design Approval form:', error);
        return { data: null, error };
      }

      console.log('✅ Final Design Approval form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing forms for this patient first
      if (patientId) {
        // Check for any existing forms (both draft and submitted)
        const { data: existingForms } = await supabase
          .from('final_design_approval_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (existingForms && existingForms.length > 0) {
          // Look for existing draft to update first
          const draftForm = existingForms.find(form => form.status === 'draft');
          if (draftForm) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing Final Design Approval draft:', draftForm.id);
            const { data, error } = await supabase
              .from('final_design_approval_forms')
              .update({
                ...dbData,
                status: formData.status || 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', draftForm.id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing Final Design Approval draft:', error);
              return { data: null, error };
            }

            console.log('✅ Final Design Approval draft updated successfully:', data);
            return { data, error: null };
          }

          // Check if there's already a submitted form (only prevent new drafts, not submissions)
          const submittedForm = existingForms.find(form => form.status === 'submitted');
          if (submittedForm && !formData.status) {
            // Don't create new drafts if a submitted form already exists (unless explicitly submitting)
            console.log('⚠️ Submitted form already exists, not creating new draft');
            return { data: submittedForm, error: null };
          }
        }
      }

      // Create new record only if no existing draft found
      dbData.status = 'draft';
      console.log('📝 Creating new Final Design Approval form draft');
      const { data, error } = await supabase
        .from('final_design_approval_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Final Design Approval form:', error);
        return { data: null, error };
      }

      console.log('✅ Final Design Approval form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving Final Design Approval form:', error);
    return { data: null, error };
  }
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDatabase(
  formData: any,
  patientId?: string
): Omit<FinalDesignApprovalFormData, 'id' | 'created_at' | 'updated_at'> {
  // Helper function to validate and format dates
  const validateDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string' && dateValue.trim() === '') return null;

    // Check if it's already in YYYY-MM-DD format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return dateValue;
      }
    }

    // Try to parse and format the date
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  };

  return {
    patient_id: patientId,
    first_name: formData.firstName || '',
    last_name: formData.lastName || '',
    date_of_birth: validateDate(formData.dateOfBirth),
    date_of_service: validateDate(formData.dateOfService) || new Date().toISOString().split('T')[0],
    treatment: formData.treatment || '',
    material: formData.material || '',
    shade_selected: formData.shadeSelected || '',
    design_review_acknowledged: formData.designReviewAcknowledged || false,
    final_fabrication_approved: formData.finalFabricationApproved || false,
    post_approval_changes_understood: formData.postApprovalChangesUnderstood || false,
    warranty_reminder_understood: formData.warrantyReminderUnderstood || false,
    patient_full_name: formData.patientFullName || '',
    patient_signature: formData.patientSignature || '',
    patient_signature_date: validateDate(formData.patientSignatureDate),
    witness_name: formData.witnessName || '',
    witness_signature: formData.witnessSignature || '',
    witness_signature_date: validateDate(formData.witnessSignatureDate),
    design_added_to_chart: formData.designAddedToChart || false,
    fee_agreement_scanned: formData.feeAgreementScanned || false,
    status: formData.status || 'draft'
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: FinalDesignApprovalFormData): any {
  console.log('🔄 Converting database data to form format:', dbData);

  const converted = {
    id: dbData.id,
    firstName: dbData.first_name || '',
    lastName: dbData.last_name || '',
    dateOfBirth: dbData.date_of_birth || '',
    dateOfService: dbData.date_of_service || '',
    treatment: dbData.treatment || '',
    material: dbData.material || '',
    shadeSelected: dbData.shade_selected || '',
    designReviewAcknowledged: dbData.design_review_acknowledged ?? false,
    finalFabricationApproved: dbData.final_fabrication_approved ?? false,
    postApprovalChangesUnderstood: dbData.post_approval_changes_understood ?? false,
    warrantyReminderUnderstood: dbData.warranty_reminder_understood ?? false,
    patientFullName: dbData.patient_full_name || '',
    patientSignature: dbData.patient_signature || '',
    patientSignatureDate: dbData.patient_signature_date || '',
    witnessName: dbData.witness_name || '',
    witnessSignature: dbData.witness_signature || '',
    witnessSignatureDate: dbData.witness_signature_date || '',
    designAddedToChart: dbData.design_added_to_chart ?? false,
    feeAgreementScanned: dbData.fee_agreement_scanned ?? false,
    status: dbData.status || 'draft'
  };

  console.log('✅ Converted form data:', converted);
  return converted;
}
