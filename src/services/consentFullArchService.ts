import { supabase } from '@/integrations/supabase/client';

export interface ConsentFullArchFormData {
  id: string;
  patient_id: string;
  patient_name?: string;
  chart_number?: string;
  consent_date?: string;
  consent_time?: string;
  status: 'draft' | 'submitted' | 'signed' | 'void';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  form_data?: any; // JSONB backup
  
  // Patient & Interpreter Information
  primary_language?: string;
  other_language_text?: string;
  interpreter_required?: string;
  interpreter_name?: string;
  interpreter_credential?: string;
  patient_info_initials?: string;
  
  // Treatment Description
  arch_type?: string;
  upper_jaw?: string;
  lower_jaw?: string;

  // Planned Drugs (boolean flags)
  midazolam?: boolean;
  fentanyl?: boolean;
  ketamine?: boolean;
  dexamethasone?: boolean;
  
  // Signatures
  patient_signature?: string;
  patient_signature_date?: string;
  surgeon_signature?: string;
  surgeon_date?: string;
  witness_signature?: string;
  witness_signature_date?: string;
}

/**
 * Get consent forms for a specific patient
 */
export async function getConsentFormsByPatientId(patientId: string): Promise<{ data: ConsentFullArchFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consent forms:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching consent forms:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific consent form by ID
 */
export async function getConsentForm(formId: string): Promise<{ data: ConsentFullArchFormData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Error fetching consent form:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching consent form:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing consent form
 */
export async function updateConsentForm(
  id: string,
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .update({
        ...formData,
        status: formData.status || 'submitted', // Preserve existing status or set to submitted
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating consent form:', error);
      return { data: null, error };
    }

    console.log('✅ Updated consent form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating consent form:', error);
    return { data: null, error };
  }
}

/**
 * Delete a consent form
 */
export async function deleteConsentForm(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('consent_full_arch_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting consent form:', error);
      return { error };
    }

    console.log('✅ Deleted consent form:', id);
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting consent form:', error);
    return { error };
  }
}

/**
 * Create a new consent form
 */
export async function createConsentForm(
  formData: any
): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_full_arch_forms')
      .insert([{
        ...formData,
        status: 'submitted' // Set status to submitted for regular form submissions
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating consent form:', error);
      return { data: null, error };
    }

    console.log('✅ Created consent form:', data?.id);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating consent form:', error);
    return { data: null, error };
  }
}

/**
 * Auto-save Consent Full Arch form
 */
export async function autoSaveConsentFullArchForm(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving Consent Full Arch form...');
    console.log('📝 Input formData:', JSON.stringify(formData, null, 2));
    console.log('📝 patientId:', patientId);
    console.log('📝 existingId:', existingId);
    console.log('📝 formData.status:', formData.status);

    const dbData = convertFormDataToDatabase(formData, patientId);
    console.log('📝 Processed dbData:', JSON.stringify(dbData, null, 2));

    // Validate required fields
    if (!dbData.patient_id) {
      console.error('❌ Error: patient_id is required');
      return { data: null, error: new Error('Patient ID is required') };
    }

    // Validate that we have some meaningful data
    if (!dbData.patient_name && !dbData.arch_type && !dbData.patient_signature) {
      console.warn('⚠️ Warning: Saving form with minimal data');
    }

    if (existingId) {
      // Get current record to check status
      const { data: currentRecord } = await supabase
        .from('consent_full_arch_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Use the status from formData if provided, otherwise preserve current status or set to draft
      dbData.status = formData.status ||
        (currentRecord?.status === 'submitted' ? 'submitted' : 'draft');

      // Update existing record
      console.log('📝 Updating existing Consent Full Arch form with status:', dbData.status);
      const { data, error } = await supabase
        .from('consent_full_arch_forms')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Consent Full Arch form:', error);
        return { data: null, error };
      }

      console.log('✅ Consent Full Arch form auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Check for existing forms for this patient first
      if (patientId) {
        // Check for any existing forms (both draft and submitted)
        const { data: existingForms } = await supabase
          .from('consent_full_arch_forms')
          .select('id, status')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (existingForms && existingForms.length > 0) {
          // Look for existing draft to update first
          const draftForm = existingForms.find(form => form.status === 'draft');
          if (draftForm) {
            // Update the existing draft instead of creating a new one
            console.log('📝 Updating existing Consent Full Arch draft:', draftForm.id);
            const { data, error } = await supabase
              .from('consent_full_arch_forms')
              .update({
                ...dbData,
                status: formData.status || 'draft',
                updated_at: new Date().toISOString()
              })
              .eq('id', draftForm.id)
              .select()
              .single();

            if (error) {
              console.error('❌ Error updating existing Consent Full Arch draft:', error);
              return { data: null, error };
            }

            console.log('✅ Consent Full Arch draft updated successfully:', data);
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
      console.log('📝 Creating new Consent Full Arch form draft');
      const { data, error } = await supabase
        .from('consent_full_arch_forms')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Consent Full Arch form:', error);
        return { data: null, error };
      }

      console.log('✅ Consent Full Arch form auto-saved successfully:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving Consent Full Arch form:', error);
    return { data: null, error };
  }
}

/**
 * Format consent form for display
 */
export function formatConsentFormForDisplay(form: ConsentFullArchFormData) {
  return convertDatabaseToFormData(form);
}

/**
 * Convert form data to database format
 */
export function convertFormDataToDatabase(
  formData: any,
  patientId?: string
): Omit<ConsentFullArchFormData, 'id' | 'created_at' | 'updated_at'> {
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

  // Helper function to validate and format time
  const validateTime = (timeValue: any): string | null => {
    if (!timeValue) return null;
    if (typeof timeValue === 'string' && timeValue.trim() === '') return null;

    // Check if it's already in HH:MM or HH:MM:SS format
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      return timeValue;
    }

    return null;
  };

  return {
    patient_id: patientId || formData.patient_id,
    patient_name: formData.patientName || '',
    chart_number: formData.chartNumber || '',
    consent_date: validateDate(formData.consentDate) || new Date().toISOString().split('T')[0],
    consent_time: validateTime(formData.consentTime),

    // Patient & Interpreter Information
    primary_language: formData.primaryLanguage || 'english',
    other_language_text: formData.otherLanguageText || '',
    interpreter_required: formData.interpreterRequired || 'no',
    interpreter_name: formData.interpreterName || '',
    interpreter_credential: formData.interpreterCredential || '',
    patient_info_initials: formData.patientInfoInitials || '',

    // Treatment Description
    arch_type: formData.archType || '',
    upper_jaw: formData.upperJaw || '',
    lower_jaw: formData.lowerJaw || '',

    // Upper Arch Treatment Details
    upper_teeth_regions: formData.upperTeethRegions || '',
    upper_implants: formData.upperImplants || '',
    upper_same_day_load: formData.upperSameDayLoad || '',

    // Lower Arch Treatment Details
    lower_teeth_regions: formData.lowerTeethRegions || '',
    lower_implants: formData.lowerImplants || '',
    lower_same_day_load: formData.lowerSameDayLoad || '',

    // Upper Arch Graft Material
    upper_graft_allograft: formData.upperGraftMaterial?.allograft ?? false,
    upper_graft_xenograft: formData.upperGraftMaterial?.xenograft ?? false,
    upper_graft_autograft: formData.upperGraftMaterial?.autograft ?? false,

    // Upper Arch Prosthesis
    upper_prosthesis_zirconia: formData.upperProsthesis?.zirconia ?? false,
    upper_prosthesis_overdenture: formData.upperProsthesis?.overdenture ?? false,

    // Lower Arch Graft Material
    lower_graft_allograft: formData.lowerGraftMaterial?.allograft ?? false,
    lower_graft_xenograft: formData.lowerGraftMaterial?.xenograft ?? false,
    lower_graft_autograft: formData.lowerGraftMaterial?.autograft ?? false,

    // Lower Arch Prosthesis
    lower_prosthesis_zirconia: formData.lowerProsthesis?.zirconia ?? false,
    lower_prosthesis_overdenture: formData.lowerProsthesis?.overdenture ?? false,

    // Sedation Plan
    sedation_local_only: formData.sedationPlan?.localOnly ?? false,
    sedation_nitrous: formData.sedationPlan?.nitrous ?? false,
    sedation_iv_conscious: formData.sedationPlan?.ivConscious ?? false,
    sedation_general_hospital: formData.sedationPlan?.generalHospital ?? false,

    // ASA Physical Status
    asa_physical_status: formData.asaPhysicalStatus || '',

    // Treatment Description Initials
    treatment_description_initials: formData.treatmentDescriptionInitials || '',

    // Planned Drugs
    midazolam: formData.plannedDrugs?.midazolam ?? formData.midazolam ?? false,
    fentanyl: formData.plannedDrugs?.fentanyl ?? formData.fentanyl ?? false,
    ketamine: formData.plannedDrugs?.ketamine ?? formData.ketamine ?? false,
    dexamethasone: formData.plannedDrugs?.dexamethasone ?? formData.dexamethasone ?? false,

    // Alternatives Initials
    alternatives_no_treatment_initials: formData.alternativesInitials?.noTreatment || '',
    alternatives_conventional_dentures_initials: formData.alternativesInitials?.conventionalDentures || '',
    alternatives_segmented_extraction_initials: formData.alternativesInitials?.segmentedExtraction || '',
    alternatives_removable_overdentures_initials: formData.alternativesInitials?.removableOverdentures || '',
    alternatives_zygomatic_implants_initials: formData.alternativesInitials?.zygomaticImplants || '',

    // Signatures
    patient_signature: formData.patientSignature || '',
    patient_signature_date: validateDate(formData.patientSignatureDate),
    surgeon_signature: formData.surgeonSignature || '',
    surgeon_date: validateDate(formData.surgeonDate),
    witness_signature: formData.witnessSignature || '',
    witness_signature_date: validateDate(formData.witnessSignatureDate),

    // Always include form_data as backup (required field)
    form_data: formData,

    status: formData.status || 'draft'
  };
}

/**
 * Convert database data to form format
 */
export function convertDatabaseToFormData(dbData: ConsentFullArchFormData): any {
  console.log('🔄 Converting database data to form format:', dbData);

  const converted = {
    id: dbData.id,
    patientName: dbData.patient_name || '',
    chartNumber: dbData.chart_number || '',
    consentDate: dbData.consent_date || '',
    consentTime: dbData.consent_time || '',

    // Patient & Interpreter Information
    primaryLanguage: dbData.primary_language || '',
    otherLanguageText: dbData.other_language_text || '',
    interpreterRequired: dbData.interpreter_required || '',
    interpreterName: dbData.interpreter_name || '',
    interpreterCredential: dbData.interpreter_credential || '',
    patientInfoInitials: dbData.patient_info_initials || '',

    // Treatment Description
    archType: dbData.arch_type || '',
    upperJaw: dbData.upper_jaw || '',
    lowerJaw: dbData.lower_jaw || '',

    // Upper Arch Treatment Details
    upperTeethRegions: dbData.upper_teeth_regions || '',
    upperImplants: dbData.upper_implants || '',
    upperSameDayLoad: dbData.upper_same_day_load || '',

    // Lower Arch Treatment Details
    lowerTeethRegions: dbData.lower_teeth_regions || '',
    lowerImplants: dbData.lower_implants || '',
    lowerSameDayLoad: dbData.lower_same_day_load || '',

    // Upper Arch Graft Material
    upperGraftAllograft: dbData.upper_graft_allograft ?? false,
    upperGraftXenograft: dbData.upper_graft_xenograft ?? false,
    upperGraftAutograft: dbData.upper_graft_autograft ?? false,

    // Upper Arch Prosthesis
    upperProsthesisZirconia: dbData.upper_prosthesis_zirconia ?? false,
    upperProsthesisOverdenture: dbData.upper_prosthesis_overdenture ?? false,

    // Lower Arch Graft Material
    lowerGraftAllograft: dbData.lower_graft_allograft ?? false,
    lowerGraftXenograft: dbData.lower_graft_xenograft ?? false,
    lowerGraftAutograft: dbData.lower_graft_autograft ?? false,

    // Lower Arch Prosthesis
    lowerProsthesisZirconia: dbData.lower_prosthesis_zirconia ?? false,
    lowerProsthesisOverdenture: dbData.lower_prosthesis_overdenture ?? false,

    // Sedation Plan
    sedationLocalOnly: dbData.sedation_local_only ?? false,
    sedationNitrous: dbData.sedation_nitrous ?? false,
    sedationIvConscious: dbData.sedation_iv_conscious ?? false,
    sedationGeneralHospital: dbData.sedation_general_hospital ?? false,

    // ASA Physical Status
    asaPhysicalStatus: dbData.asa_physical_status || '',

    // Treatment Description Initials
    treatmentDescriptionInitials: dbData.treatment_description_initials || '',

    // Planned Drugs
    midazolam: dbData.midazolam ?? false,
    fentanyl: dbData.fentanyl ?? false,
    ketamine: dbData.ketamine ?? false,
    dexamethasone: dbData.dexamethasone ?? false,

    // Alternatives Initials
    alternativesNoTreatmentInitials: dbData.alternatives_no_treatment_initials || '',
    alternativesConventionalDenturesInitials: dbData.alternatives_conventional_dentures_initials || '',
    alternativesSegmentedExtractionInitials: dbData.alternatives_segmented_extraction_initials || '',
    alternativesRemovableOverdenturesInitials: dbData.alternatives_removable_overdentures_initials || '',
    alternativesZygomaticImplantsInitials: dbData.alternatives_zygomatic_implants_initials || '',

    // Signatures
    patientSignature: dbData.patient_signature || '',
    patientSignatureDate: dbData.patient_signature_date || '',
    surgeonSignature: dbData.surgeon_signature || '',
    surgeonDate: dbData.surgeon_date || '',
    witnessSignature: dbData.witness_signature || '',
    witnessSignatureDate: dbData.witness_signature_date || '',

    status: dbData.status || 'draft'
  };

  console.log('✅ Converted form data:', converted);
  return converted;
}
