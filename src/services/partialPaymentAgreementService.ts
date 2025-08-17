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
  created_at?: string;
  updated_at?: string;
}

export const partialPaymentAgreementService = {
  async createForm(formData: Omit<PartialPaymentAgreementFormData, 'id' | 'created_at' | 'updated_at'>): Promise<PartialPaymentAgreementFormData> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .insert([formData])
      .select()
      .single();

    if (error) {
      console.error('Error creating partial payment agreement form:', error);
      throw error;
    }

    return data;
  },

  async getFormsByPatientId(patientId: string): Promise<PartialPaymentAgreementFormData[]> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partial payment agreement forms:', error);
      throw error;
    }

    return data || [];
  },

  async getFormById(id: string): Promise<PartialPaymentAgreementFormData | null> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching partial payment agreement form:', error);
      throw error;
    }

    return data;
  },

  async updateForm(id: string, formData: Partial<PartialPaymentAgreementFormData>): Promise<PartialPaymentAgreementFormData> {
    const { data, error } = await supabase
      .from('partial_payment_agreement_forms')
      .update(formData)
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

export const formatPartialPaymentAgreementFormForDisplay = (form: PartialPaymentAgreementFormData) => {
  return {
    id: form.id,
    agreement_date: form.agreement_date,
    provider_license_number: form.provider_license_number,
    first_name: form.first_name,
    last_name: form.last_name,
    address: form.address,
    email: form.email,
    phone: form.phone,
    payment_amount: form.payment_amount,
    payment_date: form.payment_date,
    estimated_total_cost: form.estimated_total_cost,
    remaining_balance: form.remaining_balance,
    final_payment_due_date: form.final_payment_due_date,
    selected_treatments: form.selected_treatments,
    read_and_understood: form.read_and_understood,
    understand_refund_policy: form.understand_refund_policy,
    understand_full_payment_required: form.understand_full_payment_required,
    agree_no_disputes: form.agree_no_disputes,
    understand_one_year_validity: form.understand_one_year_validity,
    understand_no_cash_payments: form.understand_no_cash_payments,
    entering_voluntarily: form.entering_voluntarily,
    patient_signature: form.patient_signature,
    patient_signature_date: form.patient_signature_date,
    provider_representative_name: form.provider_representative_name,
    provider_representative_title: form.provider_representative_title,
    provider_signature_date: form.provider_signature_date,
    patient_full_name: form.patient_full_name,
    practice_signature_date: form.practice_signature_date,
    created_at: form.created_at,
    updated_at: form.updated_at
  };
};
