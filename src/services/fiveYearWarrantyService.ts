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
  created_at?: string;
  updated_at?: string;
}

export const fiveYearWarrantyService = {
  async createForm(formData: Omit<FiveYearWarrantyFormData, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('five_year_warranty_forms')
      .insert([formData])
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
      .update(formData)
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

  async autoSaveForm(formData: Partial<FiveYearWarrantyFormData>) {
    // For auto-save, we either update existing or create new
    if (formData.id) {
      return this.updateForm(formData.id, formData);
    } else {
      // Create a new form for auto-save
      return this.createForm(formData as Omit<FiveYearWarrantyFormData, 'id' | 'created_at' | 'updated_at'>);
    }
  }
};

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
    created_at: form.created_at,
    updated_at: form.updated_at
  };
};
