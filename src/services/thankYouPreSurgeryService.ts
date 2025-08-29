import { supabase } from '@/integrations/supabase/client';

export interface ThankYouPreSurgeryFormData {
  id: string;
  patient_id: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  patient_name?: string;
  phone?: string;
  date_of_birth?: string;
  email?: string;
  treatment_type?: string;
  form_date?: string;
  
  // Medical Screening
  heart_conditions?: boolean;
  blood_thinners?: boolean;
  diabetes?: boolean;
  high_blood_pressure?: boolean;
  allergies?: boolean;
  pregnancy_nursing?: boolean;
  recent_illness?: boolean;
  medication_changes?: boolean;
  
  // Timeline Acknowledgments - 3 Days Before
  start_medrol?: boolean;
  start_amoxicillin?: boolean;
  no_alcohol_3days?: boolean;
  arrange_ride?: boolean;
  
  // Timeline Acknowledgments - Night Before
  take_diazepam?: boolean;
  no_food_after_midnight?: boolean;
  no_water_after_6am?: boolean;
  confirm_ride?: boolean;
  
  // Timeline Acknowledgments - Morning Of
  no_breakfast?: boolean;
  no_pills?: boolean;
  wear_comfortable?: boolean;
  arrive_on_time?: boolean;
  
  // Timeline Acknowledgments - After Surgery
  no_alcohol_24hrs?: boolean;
  no_driving_24hrs?: boolean;
  follow_instructions?: boolean;
  call_if_concerns?: boolean;
  
  // Patient Acknowledgments
  read_instructions?: boolean;
  understand_medications?: boolean;
  understand_sedation?: boolean;
  arranged_transport?: boolean;
  understand_restrictions?: boolean;
  will_follow_instructions?: boolean;
  understand_emergency?: boolean;
  
  // Signatures
  patient_signature?: string;
  signature_date?: string;
  patient_print_name?: string;
  
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
 * Get thank you pre-surgery forms for a specific patient
 */
export async function getThankYouPreSurgeryFormsByPatientId(patientId: string): Promise<{ data: ThankYouPreSurgeryFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching thank you pre-surgery forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching thank you pre-surgery forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific thank you pre-surgery form by ID
 */
export async function getThankYouPreSurgeryForm(formId: string): Promise<{ data: ThankYouPreSurgeryFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching thank you pre-surgery form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Create a new thank you pre-surgery form
 */
export async function createThankYouPreSurgeryForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .insert([{
        ...formData,
        status: 'completed' // Set status to completed for regular form submissions
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating thank you pre-surgery form:', error);
      return { data: null, error };
    }

    console.log('✅ Created thank you pre-surgery form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing thank you pre-surgery form
 */
export async function updateThankYouPreSurgeryForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .update({
        ...formData,
        status: formData.status || 'submitted', // Preserve existing status or set to submitted
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating thank you pre-surgery form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated thank you pre-surgery form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating thank you pre-surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a thank you pre-surgery form
 */
export async function deleteThankYouPreSurgeryForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('thank_you_pre_surgery_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting thank you pre-surgery form:', error);
      return { error };
    }

    console.log('✅ Deleted thank you pre-surgery form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting thank you pre-surgery form:', error);
    return { error };
  }
}

/**
 * Format thank you pre-surgery form for display
 */
export function formatThankYouPreSurgeryFormForDisplay(form: ThankYouPreSurgeryFormData) {
  return convertDatabaseToFormData(form);
}

/**
 * Auto-save Thank You Pre-Surgery form
 */
export async function autoSaveThankYouPreSurgeryForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving Thank You Pre-Surgery form...');
    console.log('📝 Input formData:', JSON.stringify(formData, null, 2));
    console.log('📝 patientId:', patientId);
    console.log('📝 existingId:', existingId);
    console.log('📝 formData.status:', formData.status);

    const dbData = convertFormDataToDatabase(formData, patientId);
    console.log('📝 Processed dbData:', JSON.stringify(dbData, null, 2));

    // Validate that we have some meaningful data
    if (!dbData.patient_name && !dbData.treatment_type && !dbData.patient_signature) {
      console.warn('⚠️ Warning: Saving form with minimal data');
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('thank_you_pre_surgery_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Use the status from formData if provided, otherwise preserve current status or set to draft
      dbData.status = formData.status ||
        (currentRecord?.status === 'submitted' ? 'submitted' : 'draft');

      // Update existing record
      console.log('📝 Updating existing Thank You Pre-Surgery form with status:', dbData.status);
      const { data, error } = await supabase
        .from('thank_you_pre_surgery_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Thank You Pre-Surgery form:', error);
        return { data: null, error };
      }

      console.log('✅ Thank You Pre-Surgery form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing forms for this patient first
      if (patientId) {
        // Check for any existing forms (both draft and submitted)
        const { data: existingForms } = await supabase
          .from('thank_you_pre_surgery_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (existingForms && existingForms.length > 0) {
          // Look for existing draft to update first
          const draftForm = existingForms.find(form => form.status === 'draft');
          if (draftForm) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing Thank You Pre-Surgery draft:', draftForm.id);
            const { data, error } = await supabase
              .from('thank_you_pre_surgery_forms')
              .update({
                ...dbData,
                status: formData.status || 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', draftForm.id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing Thank You Pre-Surgery draft:', error);
              return { data: null, error };
            }

            console.log('✅ Thank You Pre-Surgery draft updated successfully:', data);
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
      console.log('📝 Creating new Thank You Pre-Surgery form draft');
      const { data, error } = await supabase
        .from('thank_you_pre_surgery_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Thank You Pre-Surgery form:', error);
        return { data: null, error };
      }

      console.log('✅ Thank You Pre-Surgery form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving Thank You Pre-Surgery form:', error);
    return { data: null, error };
  }
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDatabase(
  formData: any,
  patientId?: string
): Omit<ThankYouPreSurgeryFormData, 'id' | 'created_at' | 'updated_at'> {
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
    phone: formData.phone || '',
    date_of_birth: validateDate(formData.dateOfBirth),
    email: formData.email || '',
    treatment_type: formData.treatmentType || '',
    form_date: validateDate(formData.formDate) || new Date().toISOString().split('T')[0],

    // Medical Screening
    heart_conditions: formData.heartConditions ?? false,
    blood_thinners: formData.bloodThinners ?? false,
    diabetes: formData.diabetes ?? false,
    high_blood_pressure: formData.highBloodPressure ?? false,
    allergies: formData.allergies ?? false,
    pregnancy_nursing: formData.pregnancyNursing ?? false,
    recent_illness: formData.recentIllness ?? false,
    medication_changes: formData.medicationChanges ?? false,

    // Timeline Acknowledgments - 3 Days Before
    start_medrol: formData.startMedrol ?? false,
    start_amoxicillin: formData.startAmoxicillin ?? false,
    no_alcohol_3days: formData.noAlcohol3Days ?? false,
    arrange_ride: formData.arrangeRide ?? false,

    // Timeline Acknowledgments - Night Before
    take_diazepam: formData.takeDiazepam ?? false,
    no_food_after_midnight: formData.noFoodAfterMidnight ?? false,
    no_water_after_6am: formData.noWaterAfter6Am ?? false,
    confirm_ride: formData.confirmRide ?? false,

    // Timeline Acknowledgments - Morning Of
    no_breakfast: formData.noBreakfast ?? false,
    no_pills: formData.noPills ?? false,
    wear_comfortable: formData.wearComfortable ?? false,
    arrive_on_time: formData.arriveOnTime ?? false,

    // Timeline Acknowledgments - After Surgery
    no_alcohol_24hrs: formData.noAlcohol24Hrs ?? false,
    no_driving_24hrs: formData.noDriving24Hrs ?? false,
    follow_instructions: formData.followInstructions ?? false,
    call_if_concerns: formData.callIfConcerns ?? false,

    // Patient Acknowledgments
    read_instructions: formData.readInstructions ?? false,
    understand_medications: formData.understandMedications ?? false,
    understand_sedation: formData.understandSedation ?? false,
    arranged_transport: formData.arrangedTransport ?? false,
    understand_restrictions: formData.understandRestrictions ?? false,
    will_follow_instructions: formData.willFollowInstructions ?? false,
    understand_emergency: formData.understandEmergency ?? false,

    // Signatures
    patient_signature: formData.patientSignature || '',
    signature_date: validateDate(formData.signatureDate),
    patient_print_name: formData.patientPrintName || '',

    status: formData.status || 'draft'
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: ThankYouPreSurgeryFormData): any {
  console.log('🔄 Converting database data to form format:', dbData);

  const converted = {
    id: dbData.id,
    patientName: dbData.patient_name || '',
    phone: dbData.phone || '',
    dateOfBirth: dbData.date_of_birth || '',
    email: dbData.email || '',
    treatmentType: dbData.treatment_type || '',
    formDate: dbData.form_date || '',

    // Medical Screening
    heartConditions: dbData.heart_conditions ?? false,
    bloodThinners: dbData.blood_thinners ?? false,
    diabetes: dbData.diabetes ?? false,
    highBloodPressure: dbData.high_blood_pressure ?? false,
    allergies: dbData.allergies ?? false,
    pregnancyNursing: dbData.pregnancy_nursing ?? false,
    recentIllness: dbData.recent_illness ?? false,
    medicationChanges: dbData.medication_changes ?? false,

    // Timeline Acknowledgments - 3 Days Before
    startMedrol: dbData.start_medrol ?? false,
    startAmoxicillin: dbData.start_amoxicillin ?? false,
    noAlcohol3Days: dbData.no_alcohol_3days ?? false,
    arrangeRide: dbData.arrange_ride ?? false,

    // Timeline Acknowledgments - Night Before
    takeDiazepam: dbData.take_diazepam ?? false,
    noFoodAfterMidnight: dbData.no_food_after_midnight ?? false,
    noWaterAfter6Am: dbData.no_water_after_6am ?? false,
    confirmRide: dbData.confirm_ride ?? false,

    // Timeline Acknowledgments - Morning Of
    noBreakfast: dbData.no_breakfast ?? false,
    noPills: dbData.no_pills ?? false,
    wearComfortable: dbData.wear_comfortable ?? false,
    arriveOnTime: dbData.arrive_on_time ?? false,

    // Timeline Acknowledgments - After Surgery
    noAlcohol24Hrs: dbData.no_alcohol_24hrs ?? false,
    noDriving24Hrs: dbData.no_driving_24hrs ?? false,
    followInstructions: dbData.follow_instructions ?? false,
    callIfConcerns: dbData.call_if_concerns ?? false,

    // Patient Acknowledgments
    readInstructions: dbData.read_instructions ?? false,
    understandMedications: dbData.understand_medications ?? false,
    understandSedation: dbData.understand_sedation ?? false,
    arrangedTransport: dbData.arranged_transport ?? false,
    understandRestrictions: dbData.understand_restrictions ?? false,
    willFollowInstructions: dbData.will_follow_instructions ?? false,
    understandEmergency: dbData.understand_emergency ?? false,

    // Signatures
    patientSignature: dbData.patient_signature || '',
    signatureDate: dbData.signature_date || '',
    patientPrintName: dbData.patient_print_name || '',

    status: dbData.status || 'draft'
  };

  console.log('✅ Converted form data:', converted);
  return converted;
}
