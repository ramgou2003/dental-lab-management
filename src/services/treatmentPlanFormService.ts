import { supabase } from '@/lib/supabase';

export interface TreatmentPlanFormData {
  id?: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  treatments: TreatmentData[];
  plan_date?: string;
  form_status?: 'draft' | 'completed';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentData {
  id: string;
  name: string;
  description?: string;
  total_cost: number;
  procedure_count: number;
  procedures: ProcedureData[];
}

export interface ProcedureData {
  id: string;
  name: string;
  cdt_code?: string;
  cpt_code?: string;
  cost?: string;
  quantity: number;
}

export interface TreatmentPlanFormDB {
  id: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  treatments: any; // JSONB
  plan_date?: string;
  form_status: 'draft' | 'completed';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save a new treatment plan form to the database
 */
export async function saveTreatmentPlanForm(
  formData: TreatmentPlanFormData,
  userId?: string
): Promise<{ data: TreatmentPlanFormDB | null; error: any }> {
  try {
    console.log('Saving treatment plan form...', {
      first_name: formData.first_name,
      last_name: formData.last_name,
      treatments_count: formData.treatments.length
    });

    const dbData = {
      patient_id: formData.patient_id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      treatments: formData.treatments,
      plan_date: formData.plan_date || new Date().toISOString().split('T')[0],
      form_status: formData.form_status || 'draft',
      created_by: userId
    };

    const { data, error } = await supabase
      .from('treatment_plan_forms')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving treatment plan form:', error);
      return { data: null, error };
    }

    console.log('Treatment plan form saved successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error saving treatment plan form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing treatment plan form
 */
export async function updateTreatmentPlanForm(
  formId: string,
  formData: TreatmentPlanFormData,
  userId?: string
): Promise<{ data: TreatmentPlanFormDB | null; error: any }> {
  try {
    console.log('Updating treatment plan form:', formId);

    // Check current status first
    const { data: currentForm } = await supabase
      .from('treatment_plan_forms')
      .select('form_status')
      .eq('id', formId)
      .single();

    const currentStatus = currentForm?.form_status;
    console.log('Current form status:', currentStatus);

    const dbData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      treatments: formData.treatments,
      plan_date: formData.plan_date,
      form_status: formData.form_status || currentStatus || 'draft'
    };

    const { data, error } = await supabase
      .from('treatment_plan_forms')
      .update(dbData)
      .eq('id', formId)
      .select()
      .single();

    if (error) {
      console.error('Error updating treatment plan form:', error);
      return { data: null, error };
    }

    console.log('Treatment plan form updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating treatment plan form:', error);
    return { data: null, error };
  }
}

/**
 * Auto-save treatment plan form (preserves completed status)
 */
export async function autoSaveTreatmentPlanForm(
  formId: string,
  formData: TreatmentPlanFormData
): Promise<{ data: TreatmentPlanFormDB | null; error: any }> {
  try {
    console.log('Auto-saving treatment plan form:', formId);

    // Check current status to preserve it
    const { data: currentForm, error: fetchError } = await supabase
      .from('treatment_plan_forms')
      .select('form_status')
      .eq('id', formId)
      .single();

    if (fetchError) {
      console.error('Error fetching current form status:', fetchError);
      return { data: null, error: fetchError };
    }

    const currentStatus = currentForm?.form_status;
    console.log('Current form status:', currentStatus);

    // ABSOLUTE RULE: If form is completed, it NEVER goes back to draft
    let finalStatus: 'completed' | 'draft';
    if (currentStatus === 'completed') {
      finalStatus = 'completed';
      console.log('ABSOLUTE RULE: COMPLETED FORM STAYS COMPLETED FOREVER');
    } else {
      finalStatus = 'draft';
      console.log('Form is draft, keeping as draft');
    }

    const dbData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      treatments: formData.treatments,
      plan_date: formData.plan_date,
      form_status: finalStatus
    };

    const { data, error } = await supabase
      .from('treatment_plan_forms')
      .update(dbData)
      .eq('id', formId)
      .select()
      .single();

    if (error) {
      console.error('Error auto-saving treatment plan form:', error);
      return { data: null, error };
    }

    console.log('Treatment plan form auto-saved successfully with status:', data.form_status);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error auto-saving treatment plan form:', error);
    return { data: null, error };
  }
}

/**
 * Get a treatment plan form by ID
 */
export async function getTreatmentPlanForm(formId: string): Promise<{ data: TreatmentPlanFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('treatment_plan_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching treatment plan form:', error);
      return { data: null, error };
    }

    return { data: data as TreatmentPlanFormData, error: null };
  } catch (error) {
    console.error('Unexpected error fetching treatment plan form:', error);
    return { data: null, error };
  }
}

/**
 * Get all treatment plan forms for a specific patient
 */
export async function getTreatmentPlanFormsByPatientId(patientId: string): Promise<{ data: TreatmentPlanFormDB[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('treatment_plan_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching treatment plan forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching treatment plan forms:', error);
    return { data: null, error };
  }
}

/**
 * Get all treatment plan forms with pagination
 */
export async function getAllTreatmentPlanForms(
  page: number = 1,
  pageSize: number = 50,
  status?: 'draft' | 'completed'
): Promise<{ data: TreatmentPlanFormDB[] | null; count: number | null; error: any }> {
  try {
    let query = supabase
      .from('treatment_plan_forms')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) {
      query = query.eq('form_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching all treatment plan forms:', error);
      return { data: null, count: null, error };
    }

    return { data, count, error: null };
  } catch (error) {
    console.error('Unexpected error fetching all treatment plan forms:', error);
    return { data: null, count: null, error };
  }
}

/**
 * Delete a treatment plan form
 */
export async function deleteTreatmentPlanForm(formId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('treatment_plan_forms')
      .delete()
      .eq('id', formId);

    if (error) {
      console.error('Error deleting treatment plan form:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting treatment plan form:', error);
    return { success: false, error };
  }
}
