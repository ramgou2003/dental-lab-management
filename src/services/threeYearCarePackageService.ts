import { supabase } from "@/integrations/supabase/client";

export interface ThreeYearCarePackageFormData {
  id?: string;
  patient_id?: string;
  patient_name: string;
  date_of_birth: string;
  enrollment_date: string;
  enrollment_time: string;
  
  // Daily Care Requirements Acknowledgment
  chlorhexidine_rinse: boolean;
  water_flosser: boolean;
  electric_toothbrush: boolean;
  attend_checkups: boolean;
  
  // Enrollment Choice
  enrollment_choice: string;
  
  // Payment Method
  payment_method: string;
  
  // Legal Acknowledgments
  cancellation_policy: boolean;
  governing_law: boolean;
  arbitration_clause: boolean;
  hipaa_consent: boolean;
  
  // Signatures
  patient_signature: string;
  patient_signature_date: string;
  witness_name: string;
  witness_signature: string;
  witness_signature_date: string;
  
  // Age/Language Confirmation
  age_confirmation: boolean;
  language_confirmation: boolean;
  
  // Acknowledgment
  acknowledgment_read: boolean;
  
  // Staff Use
  staff_processed_by: string;
  staff_processed_date: string;
  
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDatabase(
  formData: any,
  patientId?: string
): Omit<ThreeYearCarePackageFormData, 'id' | 'created_at' | 'updated_at'> {
  return {
    patient_id: patientId,
    patient_name: formData.patientName || '',
    date_of_birth: formData.dateOfBirth || '',
    enrollment_date: formData.enrollmentDate || '',
    enrollment_time: formData.enrollmentTime || '',
    
    // Daily Care Requirements Acknowledgment
    chlorhexidine_rinse: formData.chlorhexidineRinse || false,
    water_flosser: formData.waterFlosser || false,
    electric_toothbrush: formData.electricToothbrush || false,
    attend_checkups: formData.attendCheckups || false,
    
    // Enrollment Choice
    enrollment_choice: formData.enrollmentChoice || '',
    
    // Payment Method
    payment_method: formData.paymentMethod || '',
    
    // Legal Acknowledgments
    cancellation_policy: formData.cancellationPolicy || false,
    governing_law: formData.governingLaw || false,
    arbitration_clause: formData.arbitrationClause || false,
    hipaa_consent: formData.hipaaConsent || false,
    
    // Signatures
    patient_signature: formData.patientSignature || '',
    patient_signature_date: formData.patientSignatureDate || '',
    witness_name: formData.witnessName || '',
    witness_signature: formData.witnessSignature || '',
    witness_signature_date: formData.witnessSignatureDate || '',
    
    // Age/Language Confirmation
    age_confirmation: formData.ageConfirmation || false,
    language_confirmation: formData.languageConfirmation || false,
    
    // Acknowledgment
    acknowledgment_read: formData.acknowledgmentRead || false,
    
    // Staff Use
    staff_processed_by: formData.staffProcessedBy || '',
    staff_processed_date: formData.staffProcessedDate || ''
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: ThreeYearCarePackageFormData): any {
  return {
    patientName: dbData.patient_name || '',
    dateOfBirth: dbData.date_of_birth || '',
    enrollmentDate: dbData.enrollment_date || '',
    enrollmentTime: dbData.enrollment_time || '',
    
    // Daily Care Requirements Acknowledgment
    chlorhexidineRinse: dbData.chlorhexidine_rinse || false,
    waterFlosser: dbData.water_flosser || false,
    electricToothbrush: dbData.electric_toothbrush || false,
    attendCheckups: dbData.attend_checkups || false,
    
    // Enrollment Choice
    enrollmentChoice: dbData.enrollment_choice || '',
    
    // Payment Method
    paymentMethod: dbData.payment_method || '',
    
    // Legal Acknowledgments
    cancellationPolicy: dbData.cancellation_policy || false,
    governingLaw: dbData.governing_law || false,
    arbitrationClause: dbData.arbitration_clause || false,
    hipaaConsent: dbData.hipaa_consent || false,
    
    // Signatures
    patientSignature: dbData.patient_signature || '',
    patientSignatureDate: dbData.patient_signature_date || '',
    witnessName: dbData.witness_name || '',
    witnessSignature: dbData.witness_signature || '',
    witnessSignatureDate: dbData.witness_signature_date || '',
    
    // Age/Language Confirmation
    ageConfirmation: dbData.age_confirmation || false,
    languageConfirmation: dbData.language_confirmation || false,
    
    // Acknowledgment
    acknowledgmentRead: dbData.acknowledgment_read || false,
    
    // Staff Use
    staffProcessedBy: dbData.staff_processed_by || '',
    staffProcessedDate: dbData.staff_processed_date || ''
  };
}

/**
 * Create a new 3-Year Care Package form
 */
export async function createThreeYearCarePackageForm(
  formData: any,
  patientId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    const dbData = convertFormDataToDatabase(formData, patientId);
    
    const { data, error } = await supabase
      .from('three_year_care_package_forms')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating 3-Year Care Package form:', error);
      return { data: null, error };
    }

    console.log('✅ Created 3-Year Care Package form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating 3-Year Care Package form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing 3-Year Care Package form
 */
export async function updateThreeYearCarePackageForm(
  id: string,
  formData: any,
  patientId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    const dbData = convertFormDataToDatabase(formData, patientId);
    
    const { data, error } = await supabase
      .from('three_year_care_package_forms')
      .update({
        ...dbData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating 3-Year Care Package form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated 3-Year Care Package form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating 3-Year Care Package form:', error);
    return { data: null, error };
  }
}

/**
 * Get 3-Year Care Package forms by patient ID
 */
export async function getThreeYearCarePackageFormsByPatientId(
  patientId: string
): Promise<{ data: ThreeYearCarePackageFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('three_year_care_package_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching 3-Year Care Package forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching 3-Year Care Package forms:', error);
    return { data: null, error };
  }
}

/**
 * Delete a 3-Year Care Package form
 */
export async function deleteThreeYearCarePackageForm(
  id: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('three_year_care_package_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting 3-Year Care Package form:', error);
      return { error };
    }

    console.log('✅ Deleted 3-Year Care Package form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting 3-Year Care Package form:', error);
    return { error };
  }
}

/**
 * Format 3-Year Care Package form for display
 */
export function formatThreeYearCarePackageFormForDisplay(form: ThreeYearCarePackageFormData): any {
  return convertDatabaseToFormData(form);
}
