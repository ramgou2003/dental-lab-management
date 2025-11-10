import { supabase } from '@/lib/supabase';

export interface PartialPaymentAgreementFormData {
  id?: string;
  patient_id?: string;
  agreement_date: string;
  provider_license_number: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  phone: string;
  payment_amount: string;
  payment_date: string;
  estimated_total_cost: string;
  remaining_balance: string;
  final_payment_due_date: string;
  selected_treatments: string[];
  read_and_understood: boolean;
  understand_refund_policy: boolean;
  understand_full_payment_required: boolean;
  agree_no_disputes: boolean;
  understand_one_year_validity: boolean;
  understand_no_cash_payments: boolean;
  entering_voluntarily: boolean;
  patient_signature: string;
  patient_signature_date: string;
  patient_full_name?: string;
  provider_representative_name: string;
  provider_representative_title: string;
  practice_signature_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const partialPaymentAgreementService = {
  async createForm(formData: Omit<PartialPaymentAgreementFormData, 'id' | 'created_at' | 'updated_at'>): Promise<PartialPaymentAgreementFormData> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .insert([{
        ...formData,
        status: 'completed' // Set status to completed for regular form submissions
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating partial payment agreement form:', error);
      throw error;
    }

    return data;
  },

  async getFormsByPatientId(patientId: string): Promise<PartialPaymentAgreementFormData[]> {
    console.log('🔄 Service: Fetching forms for patient ID:', patientId);

    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    console.log('📥 Service: Raw Supabase response:', { data, error });

    if (error) {
      console.error('❌ Service: Error fetching partial payment agreement forms:', error);
      throw error;
    }

    console.log('✅ Service: Returning data:', data?.length || 0, 'forms');
    return data || [];
  },

  async getFormById(id: string): Promise<PartialPaymentAgreementFormData | null> {
    console.log('🔄 Service: Fetching form by ID:', id);

    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .select('*')
      .eq('id', id)
      .single();

    console.log('📥 Service: getFormById response:', { data, error });

    if (error) {
      console.error('❌ Service: Error fetching partial payment agreement form:', error);
      throw error;
    }

    console.log('✅ Service: Returning form data:', data);
    return data;
  },

  async updateForm(id: string, formData: Partial<PartialPaymentAgreementFormData>): Promise<PartialPaymentAgreementFormData> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .update({
        ...formData,
        status: formData.status || 'submitted' // Preserve existing status or set to submitted
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating partial payment agreement form:', error);
      throw error;
    }

    return data;
  },

  async deleteForm(id: string): Promise<void> {
    const { error } = await supabase
      .from('partial_payment_agreement_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting partial payment agreement form:', error);
      throw error;
    }
  }
};

/**
 * Auto-save Partial Payment Agreement form
 */
export async function autoSavePartialPaymentAgreementForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving Partial Payment Agreement form...');
    console.log('📝 Input formData:', JSON.stringify(formData, null, 2));
    console.log('📝 patientId:', patientId);
    console.log('📝 existingId:', existingId);
    console.log('📝 formData.status:', formData.status);

    const dbData = convertFormDataToDatabase(formData, patientId);
    console.log('📝 Processed dbData:', JSON.stringify(dbData, null, 2));
    console.log('📝 Key fields check:', {
      paymentAmount: formData.paymentAmount,
      estimatedTotalCost: formData.estimatedTotalCost,
      firstName: formData.firstName,
      lastName: formData.lastName,
      providerLicenseNumber: formData.providerLicenseNumber
    });

    // Validate that we have some meaningful data
    if (!dbData.first_name && !dbData.last_name && !dbData.payment_amount) {
      console.warn('⚠️ Warning: Saving form with minimal data');
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('partial_payment_agreement_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // If form data explicitly sets status to completed (from submission), use that
      // Otherwise preserve completed status, or set to draft for auto-save
      if (formData.status === 'completed') {
        dbData.status = 'completed';
        console.log('📝 Form submission - setting status to completed');
      } else {
        dbData.status = currentRecord?.status === 'completed' ? 'completed' : 'draft';
        console.log('📝 Auto-save - preserving status or setting to draft:', dbData.status);
      }

      // Update existing record
      console.log('📝 Updating existing Partial Payment Agreement form with status:', dbData.status);
      const { data, error } = await supabase
        .from('partial_payment_agreement_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Partial Payment Agreement form:', error);
        return { data: null, error };
      }

      console.log('✅ Partial Payment Agreement form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing forms for this patient first
      if (patientId) {
        // Check for any existing forms (both draft and submitted)
        const { data: existingForms } = await supabase
          .from('partial_payment_agreement_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (existingForms && existingForms.length > 0) {
          // Look for existing draft to update first
          const draftForm = existingForms.find(form => form.status === 'draft');
          if (draftForm) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing Partial Payment Agreement draft:', draftForm.id);
            const { data, error } = await supabase
              .from('partial_payment_agreement_forms')
              .update({
                ...dbData,
                status: formData.status === 'completed' ? 'completed' : 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', draftForm.id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing Partial Payment Agreement draft:', error);
              return { data: null, error };
            }

            console.log('✅ Partial Payment Agreement draft updated successfully:', data);
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
      console.log('📝 Creating new Partial Payment Agreement form draft');
      const { data, error } = await supabase
        .from('partial_payment_agreement_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Partial Payment Agreement form:', error);
        return { data: null, error };
      }

      console.log('✅ Partial Payment Agreement form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving Partial Payment Agreement form:', error);
    return { data: null, error };
  }
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDatabase(
  formData: any,
  patientId?: string
): Omit<PartialPaymentAgreementFormData, 'id' | 'created_at' | 'updated_at'> {
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

  // Helper function to get value from either camelCase or snake_case
  const getValue = (camelCase: string, snakeCase: string, defaultValue: any = '') => {
    const value = formData[camelCase] !== undefined ? formData[camelCase] :
                  formData[snakeCase] !== undefined ? formData[snakeCase] : defaultValue;

    // Log important fields for debugging
    if (['firstName', 'first_name', 'paymentAmount', 'payment_amount', 'estimatedTotalCost', 'estimated_total_cost'].includes(camelCase) ||
        ['firstName', 'first_name', 'paymentAmount', 'payment_amount', 'estimatedTotalCost', 'estimated_total_cost'].includes(snakeCase)) {
      console.log(`🔍 getValue(${camelCase}, ${snakeCase}): ${value} (from ${formData[camelCase] !== undefined ? 'camelCase' : formData[snakeCase] !== undefined ? 'snakeCase' : 'default'})`);
    }

    return value;
  };

  return {
    patient_id: patientId,
    agreement_date: validateDate(getValue('agreementDate', 'agreement_date')) || new Date().toISOString().split('T')[0],
    provider_license_number: getValue('providerLicenseNumber', 'provider_license_number'),
    first_name: getValue('firstName', 'first_name'),
    last_name: getValue('lastName', 'last_name'),
    address: getValue('address', 'address'),
    email: getValue('email', 'email'),
    phone: getValue('phone', 'phone'),
    payment_amount: getValue('paymentAmount', 'payment_amount'),
    payment_date: validateDate(getValue('paymentDate', 'payment_date')) || new Date().toISOString().split('T')[0],
    estimated_total_cost: getValue('estimatedTotalCost', 'estimated_total_cost'),
    remaining_balance: getValue('remainingBalance', 'remaining_balance'),
    final_payment_due_date: validateDate(getValue('finalPaymentDueDate', 'final_payment_due_date')) || new Date().toISOString().split('T')[0],
    selected_treatments: getValue('selectedTreatments', 'selected_treatments', []),
    read_and_understood: getValue('readAndUnderstood', 'read_and_understood', false),
    understand_refund_policy: getValue('understandRefundPolicy', 'understand_refund_policy', false),
    understand_full_payment_required: getValue('understandFullPaymentRequired', 'understand_full_payment_required', false),
    agree_no_disputes: getValue('agreeNoDisputes', 'agree_no_disputes', false),
    understand_one_year_validity: getValue('understandOneYearValidity', 'understand_one_year_validity', false),
    understand_no_cash_payments: getValue('understandNoCashPayments', 'understand_no_cash_payments', false),
    entering_voluntarily: getValue('enteringVoluntarily', 'entering_voluntarily', false),
    patient_signature: getValue('patientSignature', 'patient_signature'),
    patient_signature_date: validateDate(getValue('patientSignatureDate', 'patient_signature_date')),
    patient_full_name: getValue('patientFullName', 'patient_full_name'),
    provider_representative_name: getValue('providerRepName', 'provider_representative_name') || getValue('providerRepresentativeName', 'provider_representative_name'),
    provider_representative_title: getValue('providerRepTitle', 'provider_representative_title') || getValue('providerRepresentativeTitle', 'provider_representative_title'),
    practice_signature_date: validateDate(getValue('practiceSignatureDate', 'practice_signature_date')),
    status: getValue('status', 'status', 'draft')
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: PartialPaymentAgreementFormData): any {
  console.log('🔄 Converting database data to form format:', dbData);

  const converted = {
    id: dbData.id,
    agreementDate: dbData.agreement_date || '',
    providerLicenseNumber: dbData.provider_license_number || '',
    firstName: dbData.first_name || '',
    lastName: dbData.last_name || '',
    address: dbData.address || '',
    email: dbData.email || '',
    phone: dbData.phone || '',
    paymentAmount: dbData.payment_amount || '',
    paymentDate: dbData.payment_date || '',
    estimatedTotalCost: dbData.estimated_total_cost || '',
    remainingBalance: dbData.remaining_balance || '',
    finalPaymentDueDate: dbData.final_payment_due_date || '',
    selectedTreatments: dbData.selected_treatments || [],
    readAndUnderstood: dbData.read_and_understood ?? false,
    understandRefundPolicy: dbData.understand_refund_policy ?? false,
    understandFullPaymentRequired: dbData.understand_full_payment_required ?? false,
    agreeNoDisputes: dbData.agree_no_disputes ?? false,
    understandOneYearValidity: dbData.understand_one_year_validity ?? false,
    understandNoCashPayments: dbData.understand_no_cash_payments ?? false,
    enteringVoluntarily: dbData.entering_voluntarily ?? false,
    patientSignature: dbData.patient_signature || '',
    patientSignatureDate: dbData.patient_signature_date || '',
    patientFullName: dbData.patient_full_name || '',
    providerRepresentativeName: dbData.provider_representative_name || '',
    providerRepresentativeTitle: dbData.provider_representative_title || '',
    // Also add the short versions for PDF generator compatibility
    providerRepName: dbData.provider_representative_name || '',
    providerRepTitle: dbData.provider_representative_title || '',
    practiceSignatureDate: dbData.practice_signature_date || '',
    formDate: dbData.agreement_date || new Date().toISOString().split('T')[0],
    status: dbData.status || 'draft'
  };

  console.log('✅ Converted form data:', converted);
  return converted;
}

export const formatPartialPaymentAgreementFormForDisplay = (form: PartialPaymentAgreementFormData) => {
  return convertDatabaseToFormData(form);
};
