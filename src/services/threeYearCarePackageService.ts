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

  // Status
  status?: string; // 'draft', 'submitted', 'signed'

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
    patient_name: formData.patientName || '',
    date_of_birth: validateDate(formData.dateOfBirth),
    enrollment_date: validateDate(formData.enrollmentDate),
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
    patient_signature_date: validateDate(formData.patientSignatureDate),
    witness_name: formData.witnessName || '',
    witness_signature: formData.witnessSignature || '',
    witness_signature_date: validateDate(formData.witnessSignatureDate),
    
    // Age/Language Confirmation
    age_confirmation: formData.ageConfirmation || false,
    language_confirmation: formData.languageConfirmation || false,
    
    // Acknowledgment
    acknowledgment_read: formData.acknowledgmentRead || false,
    
    // Staff Use
    staff_processed_by: formData.staffProcessedBy || '',
    staff_processed_date: validateDate(formData.staffProcessedDate),

    // Status
    status: formData.status || 'draft'
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: ThreeYearCarePackageFormData): any {
  return {
    id: dbData.id, // Include the ID so it can be used for updates
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
    staffProcessedDate: dbData.staff_processed_date || '',

    // Status
    status: dbData.status || 'draft'
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
 * Auto-save 3-Year Care Package form (upsert with draft status)
 */
export async function autoSaveThreeYearCarePackageForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving 3-Year Care Package form...');
    console.log('📝 Input formData:', JSON.stringify(formData, null, 2));
    console.log('📝 patientId:', patientId);
    console.log('📝 existingId:', existingId);
    const dbData = convertFormDataToDatabase(formData, patientId);
    console.log('📝 Processed dbData:', JSON.stringify(dbData, null, 2));

    // Validate that we have some meaningful data
    if (!dbData.patient_name && !dbData.enrollment_choice && !dbData.payment_method) {
      console.warn('⚠️ Warning: Saving form with minimal data');
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('three_year_care_package_forms')
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
      console.log('📝 Updating existing 3-Year Care Package form with status:', dbData.status);
      const { data, error } = await supabase
        .from('three_year_care_package_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating 3-Year Care Package form:', error);
        return { data: null, error };
      }

      console.log('✅ 3-Year Care Package form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing forms for this patient first
      if (patientId) {
        // Check for any existing forms (both draft and submitted)
        const { data: existingForms } = await supabase
          .from('three_year_care_package_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (existingForms && existingForms.length > 0) {
          // Check if there's already a submitted form
          const submittedForm = existingForms.find(form => form.status === 'submitted');
          if (submittedForm && !formData.status) {
            // Don't create new drafts if a submitted form already exists (unless explicitly submitting)
            console.log('⚠️ Submitted form already exists, not creating new draft');
            return { data: submittedForm, error: null };
          }

          // Look for existing draft to update
          const draftForm = existingForms.find(form => form.status === 'draft');
          if (draftForm) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing 3-Year Care Package draft:', draftForm.id);
            const { data, error } = await supabase
              .from('three_year_care_package_forms')
              .update({
                ...dbData,
                status: formData.status === 'completed' ? 'completed' : 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', draftForm.id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing 3-Year Care Package draft:', error);
              return { data: null, error };
            }

            console.log('✅ 3-Year Care Package draft updated successfully:', data);
            return { data, error: null };
          }
        }
      }

      // Create new record - use completed status if explicitly set, otherwise draft
      if (formData.status === 'completed') {
        dbData.status = 'completed';
        console.log('📝 Creating new 3-Year Care Package form with completed status');
      } else {
        dbData.status = 'draft';
        console.log('📝 Creating new 3-Year Care Package form draft');
      }
      const { data, error } = await supabase
        .from('three_year_care_package_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating 3-Year Care Package form:', error);
        return { data: null, error };
      }

      console.log('✅ 3-Year Care Package form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving 3-Year Care Package form:', error);
    return { data: null, error };
  }
}

/**
 * Format 3-Year Care Package form for display
 */
export function formatThreeYearCarePackageFormForDisplay(form: ThreeYearCarePackageFormData): any {
  return convertDatabaseToFormData(form);
}
