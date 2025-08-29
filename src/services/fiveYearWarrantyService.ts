import { supabase } from '@/lib/supabase';

export interface FiveYearWarrantyFormData {
  id?: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  understand_optional_plan: boolean;
  understand_monthly_cost: boolean;
  understand_coverage_details: boolean;
  understand_payment_process: boolean;
  questions_answered: boolean;
  voluntarily_enrolling: boolean;
  coverage_begins_after_payment: boolean;
  authorize_payment: boolean;
  patient_signature: string;
  patient_signature_date: string;
  practice_representative_name: string;
  practice_representative_title: string;
  practice_signature_date: string;
  status?: string; // 'draft', 'submitted', 'signed'
  created_at?: string;
  updated_at?: string;
}

export const fiveYearWarrantyService = {
  async createForm(formData: Omit<FiveYearWarrantyFormData, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .insert([{
        ...formData,
        status: 'completed' // Set status to completed for regular form submissions
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating five year warranty form:', error);
      throw error;
    }

    return data;
  },

  async updateForm(id: string, formData: Partial<FiveYearWarrantyFormData>) {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .update({
        ...formData,
        status: formData.status || 'submitted' // Preserve existing status or set to submitted
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating five year warranty form:', error);
      throw error;
    }

    return data;
  },

  async getForm(id: string) {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching five year warranty form:', error);
      throw error;
    }

    return data;
  },

  async getFormsByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching five year warranty forms by patient:', error);
      throw error;
    }

    return data || [];
  },

  async getAllForms() {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all five year warranty forms:', error);
      throw error;
    }

    return data || [];
  },

  async deleteForm(id: string) {
    const { error } = await supabase
      .from('five_year_warranty_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting five year warranty form:', error);
      throw error;
    }

    return true;
  },

  async autoSaveForm(formData: Partial<FiveYearWarrantyFormData>, patientId?: string, existingId?: string) {
    try {
      console.log('🔄 Auto-saving 5-Year Warranty form...');

      if (existingId) {
        // Get current record to check status
        const { data: currentRecord } = await supabase
          .from('five_year_warranty_forms')
          .select('status')
          .eq('id', existingId)
          .single();

        // Use the status from formData if provided, otherwise preserve current status or set to draft
        const status = formData.status ||
          (currentRecord?.status === 'submitted' ? 'submitted' : 'draft');

        // Update existing record
        console.log('📝 Updating existing 5-Year Warranty form with status:', status);
        const { data, error } = await supabase
          .from('five_year_warranty_forms')
          .update({
            ...formData,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating 5-Year Warranty form:', error);
          throw error;
        }

        console.log('✅ 5-Year Warranty form auto-saved successfully:', data);
        return data;
      } else {
        // Check for existing draft for this patient first
        if (patientId) {
          const { data: existingDrafts } = await supabase
            .from('five_year_warranty_forms')
            .select('id, status')
            .eq('patient_id', patientId)
            .eq('status', 'draft')
            .order('created_at', { ascending: false })
            .limit(1);

          if (existingDrafts && existingDrafts.length > 0) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing 5-Year Warranty draft:', existingDrafts[0].id);
            const { data, error } = await supabase
              .from('five_year_warranty_forms')
              .update({
                ...formData,
                status: formData.status || 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingDrafts[0].id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing 5-Year Warranty draft:', error);
              throw error;
            }

            console.log('✅ 5-Year Warranty draft updated successfully:', data);
            return data;
          }
        }

        // Create new record only if no existing draft found
        console.log('📝 Creating new 5-Year Warranty form draft');
        const { data, error } = await supabase
          .from('five_year_warranty_forms')
          .insert([{
            ...formData,
            patient_id: patientId,
            status: formData.status || 'draft'
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating 5-Year Warranty form:', error);
          throw error;
        }

        console.log('✅ 5-Year Warranty form auto-saved successfully:', data);
        return data;
      }
    } catch (error) {
      console.error('❌ Error auto-saving 5-Year Warranty form:', error);
      throw error;
    }
  }
};

/**
 * Auto-save 5-Year Warranty form (upsert with draft status)
 */
export async function autoSaveFiveYearWarrantyForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving 5-Year Warranty form...');
    console.log('📝 Input formData:', formData);

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

    // Helper function to validate UUID
    const validateUUID = (uuid: any): string | null => {
      if (!uuid) return null;
      if (typeof uuid === 'string' && uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return uuid;
      }
      return null;
    };

    // Convert form data to database format
    // Handle both old field names (from form) and new field names (from submission)
    const dbData = {
      patient_id: validateUUID(patientId),
      first_name: formData.first_name || formData.firstName || '',
      last_name: formData.last_name || formData.lastName || '',
      date_of_birth: validateDate(formData.date_of_birth || formData.dateOfBirth),
      phone: formData.phone || '',
      email: formData.email || '',
      understand_optional_plan: formData.understand_optional_plan ?? formData.understandOptionalPlan ?? false,
      understand_monthly_cost: formData.understand_monthly_cost ?? formData.understandMonthlyCost ?? false,
      understand_coverage_details: formData.understand_coverage_details ?? formData.understandCoverageDetails ?? false,
      understand_payment_process: formData.understand_payment_process ?? formData.understandPaymentProcess ?? false,
      questions_answered: formData.questions_answered ?? formData.questionsAnswered ?? false,
      voluntarily_enrolling: formData.voluntarily_enrolling ?? formData.voluntarilyEnrolling ?? false,
      coverage_begins_after_payment: formData.coverage_begins_after_payment ?? formData.coverageBeginsAfterPayment ?? false,
      authorize_payment: formData.authorize_payment ?? formData.authorizePayment ?? false,
      patient_signature: formData.patient_signature || formData.patientSignature || '',
      patient_signature_date: validateDate(formData.patient_signature_date || formData.patientSignatureDate),
      practice_representative_name: formData.practice_representative_name || formData.practiceRepName || '',
      practice_representative_title: formData.practice_representative_title || formData.practiceRepTitle || '',
      practice_signature_date: validateDate(formData.practice_signature_date || formData.practiceSignatureDate)
    };

    console.log('📝 Processed dbData:', dbData);

    // Validate required fields
    if (!dbData.first_name || !dbData.last_name) {
      const error = new Error('First name and last name are required');
      console.error('❌ Validation error:', error.message);
      return { data: null, error };
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('five_year_warranty_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Use the status from formData if provided, otherwise preserve current status or set to draft
      if (formData.status) {
        dbData.status = formData.status;
      } else {
        // Preserve submitted status, otherwise set to draft
        dbData.status = currentRecord?.status === 'submitted' ? 'submitted' : 'draft';
      }

      // Update existing record
      console.log('📝 Updating existing 5-Year Warranty form with status:', dbData.status);
      const { data, error } = await supabase
        .from('five_year_warranty_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating 5-Year Warranty form:', error);
        return { data: null, error };
      }

      console.log('✅ 5-Year Warranty form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing draft for this patient first
      if (patientId) {
        const { data: existingDrafts } = await supabase
          .from('five_year_warranty_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingDrafts && existingDrafts.length > 0) {
          // Update the existing draft instead of creating a new one
          console.log('📝 Updating existing 5-Year Warranty draft:', existingDrafts[0].id);
          const { data, error } = await supabase
            .from('five_year_warranty_forms')
            .update({
              ...dbData,
              status: formData.status || 'draft',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingDrafts[0].id)
            .select()
            .single();

          if (error) {
            console.error('❌ Error updating existing 5-Year Warranty draft:', error);
            return { data: null, error };
          }

          console.log('✅ 5-Year Warranty draft updated successfully:', data);
          return { data, error: null };
        }
      }

      // Create new record only if no existing draft found
      dbData.status = formData.status || 'draft';
      console.log('📝 Creating new 5-Year Warranty form with status:', dbData.status);
      const { data, error } = await supabase
        .from('five_year_warranty_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating 5-Year Warranty form:', error);
        return { data: null, error };
      }

      console.log('✅ 5-Year Warranty form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving 5-Year Warranty form:', error);
    return { data: null, error };
  }
}

export const formatFiveYearWarrantyFormForDisplay = (form: FiveYearWarrantyFormData) => {
  return {
    id: form.id,
    first_name: form.first_name,
    last_name: form.last_name,
    date_of_birth: form.date_of_birth,
    phone: form.phone,
    email: form.email,
    understand_optional_plan: form.understand_optional_plan,
    understand_monthly_cost: form.understand_monthly_cost,
    understand_coverage_details: form.understand_coverage_details,
    understand_payment_process: form.understand_payment_process,
    questions_answered: form.questions_answered,
    voluntarily_enrolling: form.voluntarily_enrolling,
    coverage_begins_after_payment: form.coverage_begins_after_payment,
    authorize_payment: form.authorize_payment,
    patient_signature: form.patient_signature,
    patient_signature_date: form.patient_signature_date,
    practice_representative_name: form.practice_representative_name,
    practice_representative_title: form.practice_representative_title,
    practice_signature_date: form.practice_signature_date,
    status: form.status,
    created_at: form.created_at,
    updated_at: form.updated_at
  };
};
