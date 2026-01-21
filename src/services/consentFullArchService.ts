import { supabase } from '@/integrations/supabase/client';

export interface ConsentFullArchFormData {
  id: string;
  patient_id: string;
  patient_name?: string;
  chart_number?: string;
  consent_date?: string;
  consent_time?: string;
  status: 'draft' | 'submitted' | 'completed' | 'signed' | 'void';
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
  treatment_description_initials?: string;

  // Material Risks
  risks_understood?: boolean;
  material_risks_initials?: string;

  // Sedation & Anesthesia Consent
  escort_name?: string;
  escort_phone?: string;
  medications_disclosed?: boolean;
  decline_iv_sedation?: boolean;
  sedation_initials?: string;
  iv_sedation_fee?: string;
  iv_sedation_covered?: string;

  // Planned Drugs (boolean flags)
  midazolam?: boolean;
  fentanyl?: boolean;
  ketamine?: boolean;
  dexamethasone?: boolean;
  versed?: boolean;
  ketorolac?: boolean;
  benadryl?: boolean;
  acetaminophen?: boolean;
  valium?: boolean;
  clindamycin?: boolean;
  lidocaine?: boolean;

  // Financial Disclosure
  surgical_extractions_count?: string;
  surgical_extractions_fee?: string;
  surgical_extractions_covered?: string;
  endosteal_implants_count?: string;
  endosteal_implants_fee?: string;
  endosteal_implants_covered?: string;
  zirconia_bridge_fee?: string;
  zirconia_bridge_covered?: string;
  financial_initials?: string;

  // Photo/Video Authorization
  internal_record_keeping?: string;
  professional_education?: string;
  marketing_social_media?: string;
  photo_video_initials?: string;

  // HIPAA Email/SMS Authorization
  hipaa_email_sms?: boolean;
  hipaa_email?: string;
  hipaa_phone?: string;

  // Opioid Consent
  opioid_initials?: string;
  smallest_opioid_supply?: boolean;

  // Patient Acknowledgment & Authorization
  acknowledgment_read?: boolean;
  acknowledgment_outcome?: boolean;
  acknowledgment_authorize?: boolean;

  // Signatures
  surgeon_name?: string;
  surgeon_signature?: string;
  surgeon_date?: string;
  surgeon_time?: string;
  patient_signature?: string;
  patient_signature_date?: string;
  patient_signature_time?: string;
  witness_name?: string;
  witness_signature?: string;
  witness_signature_date?: string;
  final_initials?: string;
}

/**
 * Get consent forms for a specific patient
 */
export async function getConsentFormsByPatientId(patientId: string): Promise<{ data: ConsentFullArchFormData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_forms')
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
      .from('consent_forms')
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
      .from('consent_forms')
      .update({
        ...formData,
        status: formData.status || 'completed', // Preserve existing status or set to completed
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
      .from('consent_forms')
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
      .from('consent_forms')
      .insert([{
        ...formData,
        status: 'completed' // Set status to completed for regular form submissions
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
        .from('consent_forms')
        .select('status')
        .eq('id', existingId)
        .single();

      // Use the status from formData if provided, otherwise preserve current status or set to draft
      dbData.status = formData.status ||
        (currentRecord?.status === 'completed' ? 'completed' : 'draft');

      // Update existing record
      console.log('📝 Updating existing Consent Full Arch form with status:', dbData.status);
      const { data, error } = await supabase
        .from('consent_forms')
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
      // Create new record
      dbData.status = 'draft';
      console.log('📝 Creating new Consent Full Arch form draft');
      const { data, error } = await supabase
        .from('consent_forms')
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
    consent_date: validateDate(formData.date) || new Date().toISOString().split('T')[0],
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
    upper_surgery_type: formData.upperSurgeryType || '',
    lower_surgery_type: formData.lowerSurgeryType || '',
    upper_jaw: formData.upperJaw || '',
    lower_jaw: formData.lowerJaw || '',

    // Upper Arch Treatment Details
    upper_teeth_regions: formData.upperTeethRegions || '',
    upper_implants: formData.upperImplants || '',
    upper_treatment_type: formData.upperTreatmentType || '',
    upper_same_day_load: formData.upperSameDayLoad || '',

    // Lower Arch Treatment Details
    lower_teeth_regions: formData.lowerTeethRegions || '',
    lower_implants: formData.lowerImplants || '',
    lower_treatment_type: formData.lowerTreatmentType || '',
    lower_same_day_load: formData.lowerSameDayLoad || '',

    // Upper Arch Graft Material
    upper_graft_allograft: formData.upperGraftMaterial?.allograft ?? false,
    upper_graft_xenograft: formData.upperGraftMaterial?.xenograft ?? false,
    upper_graft_autograft: formData.upperGraftMaterial?.autograft ?? false,
    upper_graft_prf: formData.upperGraftMaterial?.prf ?? false,

    // Upper Arch Prosthesis
    upper_prosthesis_zirconia: formData.upperProsthesis?.zirconia ?? false,
    upper_prosthesis_overdenture: formData.upperProsthesis?.overdenture ?? false,

    // Lower Arch Graft Material
    lower_graft_allograft: formData.lowerGraftMaterial?.allograft ?? false,
    lower_graft_xenograft: formData.lowerGraftMaterial?.xenograft ?? false,
    lower_graft_autograft: formData.lowerGraftMaterial?.autograft ?? false,
    lower_graft_prf: formData.lowerGraftMaterial?.prf ?? false,

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

    // Material Risks
    risks_understood: formData.risksUnderstood ?? false,
    material_risks_initials: formData.materialRisksInitials || '',

    // Sedation & Anesthesia Consent
    escort_name: formData.escortName || '',
    escort_phone: formData.escortPhone || '',
    medications_disclosed: formData.medicationsDisclosed ?? false,
    decline_iv_sedation: formData.declineIVSedation ?? false,
    sedation_initials: formData.sedationInitials || '',

    iv_sedation_fee: formData.ivSedation?.fee || '',
    iv_sedation_covered: formData.ivSedation?.covered || '',

    // Planned Drugs
    midazolam: formData.plannedDrugs?.midazolam ?? formData.midazolam ?? false,
    fentanyl: formData.plannedDrugs?.fentanyl ?? formData.fentanyl ?? false,
    ketamine: formData.plannedDrugs?.ketamine ?? formData.ketamine ?? false,
    dexamethasone: formData.plannedDrugs?.dexamethasone ?? formData.dexamethasone ?? false,
    versed: formData.plannedDrugs?.versed ?? formData.versed ?? false,
    ketorolac: formData.plannedDrugs?.ketorolac ?? formData.ketorolac ?? false,
    benadryl: formData.plannedDrugs?.benadryl ?? formData.benadryl ?? false,
    acetaminophen: formData.plannedDrugs?.acetaminophen ?? formData.acetaminophen ?? false,
    valium: formData.plannedDrugs?.valium ?? formData.valium ?? false,
    clindamycin: formData.plannedDrugs?.clindamycin ?? formData.clindamycin ?? false,
    lidocaine: formData.plannedDrugs?.lidocaine ?? formData.lidocaine ?? false,

    // Alternatives Initials
    alternatives_no_treatment_initials: formData.alternativesInitials?.noTreatment || '',
    alternatives_conventional_dentures_initials: formData.alternativesInitials?.conventionalDentures || '',
    alternatives_segmented_extraction_initials: formData.alternativesInitials?.segmentedExtraction || '',
    alternatives_removable_overdentures_initials: formData.alternativesInitials?.removableOverdentures || '',
    alternatives_zygomatic_implants_initials: formData.alternativesInitials?.zygomaticImplants || '',

    // Financial Disclosure
    surgical_extractions_count: formData.surgicalExtractions?.count || '',
    surgical_extractions_fee: formData.surgicalExtractions?.fee || '',
    surgical_extractions_covered: formData.surgicalExtractions?.covered || '',
    endosteal_implants_count: formData.implantFixtures?.count || '',
    endosteal_implants_fee: formData.implantFixtures?.fee || '',
    endosteal_implants_covered: formData.implantFixtures?.covered || '',
    zirconia_bridge_fee: formData.zirconiabridge?.fee || '',
    zirconia_bridge_covered: formData.zirconiabridge?.covered || '',
    financial_initials: formData.financialInitials || '',

    // Photo/Video Authorization
    internal_record_keeping: formData.internalRecordKeeping || '',
    professional_education: formData.professionalEducation || '',
    marketing_social_media: formData.marketingSocialMedia || '',
    photo_video_initials: formData.photoVideoInitials || '',

    // HIPAA Email/SMS Authorization
    hipaa_email_sms: formData.hipaaEmailSms ?? false,
    hipaa_email: formData.hipaaEmail || '',
    hipaa_phone: formData.hipaaPhone || '',

    // Opioid Consent
    opioid_initials: formData.opioidInitials || '',
    smallest_opioid_supply: formData.smallestOpioidSupply ?? false,

    // Patient Acknowledgment & Authorization
    acknowledgment_read: formData.acknowledgmentRead ?? false,
    acknowledgment_outcome: formData.acknowledgmentOutcome ?? false,
    acknowledgment_authorize: formData.acknowledgmentAuthorize ?? false,

    // Signatures
    surgeon_name: formData.surgeonName || '',
    surgeon_signature: formData.surgeonSignature || '',
    surgeon_date: formData.surgeonDate ? formData.surgeonDate.split('T')[0] : null,
    surgeon_time: formData.surgeonDate ? formData.surgeonDate.split('T')[1] : null,
    patient_signature: formData.patientSignature || '',
    patient_signature_date: validateDate(formData.patientSignatureDate),
    patient_signature_time: formData.patientSignatureTime || '',
    witness_name: formData.witnessName || '',
    witness_signature: formData.witnessSignature || '',
    witness_signature_date: validateDate(formData.witnessSignatureDate),
    final_initials: formData.finalInitials || '',

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
  console.log('🔍 Risks data from database:', {
    risks_understood: dbData.risks_understood,
    material_risks_initials: dbData.material_risks_initials
  });
  console.log('🔍 Sedation data from database:', {
    escort_name: dbData.escort_name,
    escort_phone: dbData.escort_phone,
    medications_disclosed: dbData.medications_disclosed,
    decline_iv_sedation: dbData.decline_iv_sedation,
    sedation_initials: dbData.sedation_initials,

    iv_sedation_fee: dbData.iv_sedation_fee,
    iv_sedation_covered: dbData.iv_sedation_covered
  });
  console.log('🔍 Financial data from database:', {
    surgical_extractions_count: dbData.surgical_extractions_count,
    surgical_extractions_fee: dbData.surgical_extractions_fee,
    surgical_extractions_covered: dbData.surgical_extractions_covered,
    implant_fixtures_count: dbData.implant_fixtures_count,
    implant_fixtures_fee: dbData.implant_fixtures_fee,
    implant_fixtures_covered: dbData.implant_fixtures_covered,
    zirconia_bridge_fee: dbData.zirconia_bridge_fee,
    zirconia_bridge_covered: dbData.zirconia_bridge_covered,
    financial_initials: dbData.financial_initials
  });
  console.log('🔍 Media data from database:', {
    internal_record_keeping: dbData.internal_record_keeping,
    professional_education: dbData.professional_education,
    marketing_social_media: dbData.marketing_social_media,
    photo_video_initials: dbData.photo_video_initials
  });
  console.log('🔍 HIPAA data from database:', {
    hipaa_email_sms: dbData.hipaa_email_sms,
    hipaa_email: dbData.hipaa_email,
    hipaa_phone: dbData.hipaa_phone
  });
  console.log('🔍 Opioid data from database:', {
    opioid_initials: dbData.opioid_initials,
    smallest_opioid_supply: dbData.smallest_opioid_supply
  });
  console.log('🔍 Final section data from database:', {
    surgeon_name: dbData.surgeon_name,
    surgeon_signature: dbData.surgeon_signature,
    surgeon_date: dbData.surgeon_date,
    surgeon_time: dbData.surgeon_time,
    patient_signature: dbData.patient_signature,
    patient_signature_date: dbData.patient_signature_date,
    witness_name: dbData.witness_name,
    witness_signature: dbData.witness_signature,
    witness_signature_date: dbData.witness_signature_date,
    final_initials: dbData.final_initials
  });
  console.log('🔍 Acknowledgment data from database:', {
    acknowledgment_read: dbData.acknowledgment_read,
    acknowledgment_outcome: dbData.acknowledgment_outcome,
    acknowledgment_authorize: dbData.acknowledgment_authorize
  });
  console.log('🔍 Date/Time data from database:', {
    consent_date: dbData.consent_date,
    consent_time: dbData.consent_time
  });

  const converted = {
    id: dbData.id,
    patientName: dbData.patient_name || '',
    chartNumber: dbData.chart_number || '',
    date: dbData.consent_date || '',
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
    upperSurgeryType: dbData.upper_surgery_type || '',
    lowerSurgeryType: dbData.lower_surgery_type || '',
    upperJaw: dbData.upper_jaw || '',
    lowerJaw: dbData.lower_jaw || '',

    // Upper Arch Treatment Details
    upperTeethRegions: dbData.upper_teeth_regions || '',
    upperImplants: dbData.upper_implants || '',
    upperTreatmentType: dbData.upper_treatment_type || '',
    upperSameDayLoad: dbData.upper_same_day_load || '',

    // Lower Arch Treatment Details
    lowerTeethRegions: dbData.lower_teeth_regions || '',
    lowerImplants: dbData.lower_implants || '',
    lowerTreatmentType: dbData.lower_treatment_type || '',
    lowerSameDayLoad: dbData.lower_same_day_load || '',

    // Upper Arch Graft Material (as object)
    upperGraftMaterial: {
      allograft: dbData.upper_graft_allograft ?? false,
      xenograft: dbData.upper_graft_xenograft ?? false,
      autograft: dbData.upper_graft_autograft ?? false,
      prf: dbData.upper_graft_prf ?? false
    },

    // Upper Arch Prosthesis (as object)
    upperProsthesis: {
      zirconia: dbData.upper_prosthesis_zirconia ?? false,
      overdenture: dbData.upper_prosthesis_overdenture ?? false
    },

    // Lower Arch Graft Material (as object)
    lowerGraftMaterial: {
      allograft: dbData.lower_graft_allograft ?? false,
      xenograft: dbData.lower_graft_xenograft ?? false,
      autograft: dbData.lower_graft_autograft ?? false,
      prf: dbData.lower_graft_prf ?? false
    },

    // Lower Arch Prosthesis (as object)
    lowerProsthesis: {
      zirconia: dbData.lower_prosthesis_zirconia ?? false,
      overdenture: dbData.lower_prosthesis_overdenture ?? false
    },

    // Sedation Plan (as object)
    sedationPlan: {
      localOnly: dbData.sedation_local_only ?? false,
      nitrous: dbData.sedation_nitrous ?? false,
      ivConscious: dbData.sedation_iv_conscious ?? false,
      generalHospital: dbData.sedation_general_hospital ?? false
    },

    // ASA Physical Status
    asaPhysicalStatus: dbData.asa_physical_status || '',

    // Treatment Description Initials
    treatmentDescriptionInitials: dbData.treatment_description_initials || '',

    // Material Risks
    risksUnderstood: dbData.risks_understood ?? false,
    materialRisksInitials: dbData.material_risks_initials || '',

    // Sedation & Anesthesia Consent
    escortName: dbData.escort_name || '',
    escortPhone: dbData.escort_phone || '',
    medicationsDisclosed: dbData.medications_disclosed ?? false,
    declineIVSedation: dbData.decline_iv_sedation ?? false,
    sedationInitials: dbData.sedation_initials || '',
    ivSedation: {
      fee: dbData.iv_sedation_fee || '',
      covered: dbData.iv_sedation_covered || ''
    },

    // Planned Drugs (as object)
    plannedDrugs: {
      midazolam: dbData.midazolam ?? false,
      fentanyl: dbData.fentanyl ?? false,
      ketamine: dbData.ketamine ?? false,
      dexamethasone: dbData.dexamethasone ?? false,
      versed: dbData.versed ?? false,
      ketorolac: dbData.ketorolac ?? false,
      benadryl: dbData.benadryl ?? false,
      acetaminophen: dbData.acetaminophen ?? false,
      valium: dbData.valium ?? false,
      clindamycin: dbData.clindamycin ?? false,
      lidocaine: dbData.lidocaine ?? false
    },

    // Financial Disclosure
    surgicalExtractions: {
      count: dbData.surgical_extractions_count || '',
      fee: dbData.surgical_extractions_fee || '',
      covered: dbData.surgical_extractions_covered || ''
    },
    implantFixtures: {
      count: dbData.endosteal_implants_count || '',
      fee: dbData.endosteal_implants_fee || '',
      covered: dbData.endosteal_implants_covered || ''
    },
    zirconiabridge: {
      fee: dbData.zirconia_bridge_fee || '',
      covered: dbData.zirconia_bridge_covered || ''
    },
    financialInitials: dbData.financial_initials || '',

    // Photo/Video Authorization
    internalRecordKeeping: dbData.internal_record_keeping || '',
    professionalEducation: dbData.professional_education || '',
    marketingSocialMedia: dbData.marketing_social_media || '',
    photoVideoInitials: dbData.photo_video_initials || '',

    // HIPAA Email/SMS Authorization
    hipaaEmailSms: dbData.hipaa_email_sms ?? false,
    hipaaEmail: dbData.hipaa_email || '',
    hipaaPhone: dbData.hipaa_phone || '',

    // Opioid Consent
    opioidInitials: dbData.opioid_initials || '',
    smallestOpioidSupply: dbData.smallest_opioid_supply ?? false,

    // Patient Acknowledgment & Authorization
    acknowledgmentRead: dbData.acknowledgment_read ?? false,
    acknowledgmentOutcome: dbData.acknowledgment_outcome ?? false,
    acknowledgmentAuthorize: dbData.acknowledgment_authorize ?? false,

    // Alternatives Initials (as object)
    alternativesInitials: {
      noTreatment: dbData.alternatives_no_treatment_initials || '',
      conventionalDentures: dbData.alternatives_conventional_dentures_initials || '',
      segmentedExtraction: dbData.alternatives_segmented_extraction_initials || '',
      removableOverdentures: dbData.alternatives_removable_overdentures_initials || '',
      zygomaticImplants: dbData.alternatives_zygomatic_implants_initials || ''
    },

    // Signatures
    surgeonName: dbData.surgeon_name || '',
    surgeonSignature: dbData.surgeon_signature || '',
    surgeonDate: (dbData.surgeon_date && dbData.surgeon_time)
      ? `${dbData.surgeon_date}T${dbData.surgeon_time}`
      : dbData.surgeon_date || '',
    patientSignature: dbData.patient_signature || '',
    patientSignatureDate: dbData.patient_signature_date || '',
    patientSignatureTime: dbData.patient_signature_time || '',
    witnessName: dbData.witness_name || '',
    witnessSignature: dbData.witness_signature || '',
    witnessSignatureDate: dbData.witness_signature_date || '',
    finalInitials: dbData.final_initials || '',

    status: dbData.status || 'draft'
  };

  console.log('✅ Converted form data:', converted);
  console.log('🔍 Converted risks data:', {
    risksUnderstood: converted.risksUnderstood,
    materialRisksInitials: converted.materialRisksInitials
  });
  console.log('🔍 Converted sedation data:', {
    escortName: converted.escortName,
    escortPhone: converted.escortPhone,
    medicationsDisclosed: converted.medicationsDisclosed,
    declineIVSedation: converted.declineIVSedation,
    sedationInitials: converted.sedationInitials,

    ivSedation: converted.ivSedation
  });
  console.log('🔍 Converted financial data:', {
    surgicalExtractions: converted.surgicalExtractions,
    implantFixtures: converted.implantFixtures,
    zirconiabridge: converted.zirconiabridge,
    financialInitials: converted.financialInitials
  });
  console.log('🔍 Converted media data:', {
    internalRecordKeeping: converted.internalRecordKeeping,
    professionalEducation: converted.professionalEducation,
    marketingSocialMedia: converted.marketingSocialMedia,
    photoVideoInitials: converted.photoVideoInitials
  });
  console.log('🔍 Converted HIPAA data:', {
    hipaaEmailSms: converted.hipaaEmailSms,
    hipaaEmail: converted.hipaaEmail,
    hipaaPhone: converted.hipaaPhone
  });
  console.log('🔍 Converted opioid data:', {
    opioidInitials: converted.opioidInitials,
    smallestOpioidSupply: converted.smallestOpioidSupply
  });
  console.log('🔍 Converted final section data:', {
    surgeonName: converted.surgeonName,
    surgeonSignature: converted.surgeonSignature,
    surgeonDate: converted.surgeonDate,
    patientSignature: converted.patientSignature,
    patientSignatureDate: converted.patientSignatureDate,
    witnessName: converted.witnessName,
    witnessSignature: converted.witnessSignature,
    witnessSignatureDate: converted.witnessSignatureDate,
    finalInitials: converted.finalInitials
  });
  console.log('🔍 Surgeon datetime conversion:', {
    originalSurgeonDate: converted.surgeonDate,
    splitDate: converted.surgeonDate ? converted.surgeonDate.split('T')[0] : null,
    splitTime: converted.surgeonDate ? converted.surgeonDate.split('T')[1] : null
  });
  console.log('🔍 Converted acknowledgment data:', {
    acknowledgmentRead: converted.acknowledgmentRead,
    acknowledgmentOutcome: converted.acknowledgmentOutcome,
    acknowledgmentAuthorize: converted.acknowledgmentAuthorize
  });
  console.log('🔍 Converted date/time data:', {
    date: converted.date,
    consentTime: converted.consentTime
  });
  return converted;
}
