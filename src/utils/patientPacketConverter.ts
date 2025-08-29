import { NewPatientFormData } from '@/types/newPatientPacket';
import { NewPatientPacketDB } from '@/types/supabasePatientPacket';

/**
 * Converts form data to database format for saving to Supabase
 */
export function convertFormDataToDatabase(
  formData: NewPatientFormData,
  patientId?: string,
  leadId?: string,
  submissionSource: 'public' | 'internal' = 'public',
  consultationPatientId?: string
): NewPatientPacketDB {
  return {
    // IDs
    patient_id: patientId,
    lead_id: leadId,
    consultation_patient_id: consultationPatientId,
    
    // Section 1: Patient Identification & Contacts
    first_name: formData.firstName,
    last_name: formData.lastName,
    gender: formData.gender,
    date_of_birth: formData.dateOfBirth instanceof Date
      ? formData.dateOfBirth.toISOString().split('T')[0]
      : formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
        : undefined,
    height: formData.height && formData.height.feet && formData.height.inches
      ? `${(parseInt(formData.height.feet) * 12) + parseInt(formData.height.inches)}`
      : formData.height && typeof formData.height === 'string'
      ? formData.height
      : undefined,
    weight: formData.weight,
    bmi: formData.bmi,
    address_street: formData.address?.street,
    address_city: formData.address?.city,
    address_state: formData.address?.state,
    address_zip: formData.address?.zip,
    phone_cell: formData.phone?.cell,
    phone_work: formData.phone?.work,
    email: formData.email,
    emergency_contact_name: formData.emergencyContact?.name,
    emergency_contact_relationship: formData.emergencyContact?.relationship,
    emergency_contact_phone: formData.emergencyContact?.phone,
    has_pcp: formData.primaryCarePhysician?.hasPCP,
    pcp_name: formData.primaryCarePhysician?.name,
    pcp_practice: formData.primaryCarePhysician?.practice,
    pcp_phone: formData.primaryCarePhysician?.phone,
    
    // Section 2: Complete Medical History
    critical_conditions: formData.criticalConditions,
    system_specific: formData.systemSpecific,
    additional_conditions: formData.additionalConditions,
    recent_health_changes: formData.recentHealthChanges,
    
    // Section 3: Allergies & Medications
    allergies: formData.allergies,
    current_medications: formData.currentMedications,
    current_pharmacy_name: formData.currentPharmacy?.name,
    current_pharmacy_city: formData.currentPharmacy?.city,
    
    // Section 4: Current Oral Health Status
    dental_status: formData.dentalStatus,
    previous_solutions: formData.previousSolutions,
    current_symptoms: formData.currentSymptoms,
    healing_issues: formData.healingIssues,
    
    // Section 5: Lifestyle Factors
    pregnancy: formData.pregnancy,
    tobacco_use: formData.tobaccoUse,
    alcohol_consumption: formData.alcoholConsumption,
    
    // Section 6: Patient Comfort Preferences
    anxiety_control: formData.anxietyControl,
    pain_injection: formData.painInjection,
    communication: formData.communication,
    sensory_sensitivities: formData.sensorySensitivities,
    physical_comfort: formData.physicalComfort,
    service_preferences: formData.servicePreferences,
    other_concerns: formData.otherConcerns,
    
    // Section 7: Office Policies
    acknowledgments: formData.acknowledgments,
    wants_financial_info: formData.wantsFinancialInfo,
    
    // Section 8: Legal Documentation
    photo_video_auth: formData.photoVideoAuth,
    hipaa_acknowledgment: formData.hipaaAcknowledgment,
    
    // Section 9: Signatures
    patient_attestation: formData.patientAttestation,
    patient_name_signature: formData.patientNameSignature,
    signature_data: formData.signature,
    signature_date: formData.date instanceof Date
      ? formData.date.toISOString().split('T')[0]
      : formData.date
        ? new Date(formData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0], // Default to today if no date provided
    
    // Metadata
    form_status: 'completed', // Mark as completed when converting for submission
    submission_source: submissionSource,
    submitted_at: new Date().toISOString()
  };
}

/**
 * Converts database data back to form format for editing
 */
export function convertDatabaseToFormData(dbData: NewPatientPacketDB): NewPatientFormData {
  return {
    // Section 1: Patient Identification & Contacts
    firstName: dbData.first_name || '',
    lastName: dbData.last_name || '',
    gender: dbData.gender || 'prefer-not-to-answer',
    dateOfBirth: dbData.date_of_birth ? new Date(dbData.date_of_birth) : new Date(),
    height: dbData.height
      ? {
          feet: Math.floor(parseInt(dbData.height) / 12).toString(),
          inches: (parseInt(dbData.height) % 12).toString()
        }
      : { feet: '', inches: '' },
    weight: dbData.weight || '',
    bmi: dbData.bmi || undefined,
    address: {
      street: dbData.address_street || '',
      city: dbData.address_city || '',
      state: dbData.address_state || '',
      zip: dbData.address_zip || ''
    },
    phone: {
      cell: dbData.phone_cell || '',
      work: dbData.phone_work || ''
    },
    email: dbData.email || '',
    emergencyContact: {
      name: dbData.emergency_contact_name || '',
      relationship: dbData.emergency_contact_relationship || '',
      phone: dbData.emergency_contact_phone || ''
    },
    primaryCarePhysician: {
      hasPCP: dbData.has_pcp || false,
      name: dbData.pcp_name || '',
      practice: dbData.pcp_practice || '',
      phone: dbData.pcp_phone || ''
    },
    
    // Section 2: Complete Medical History
    criticalConditions: dbData.critical_conditions || {
      acidReflux: false,
      cancer: { has: false },
      depressionAnxiety: false,
      diabetes: { has: false, type: undefined, a1cLevel: undefined },
      heartDisease: false,
      periodontalDisease: false,
      substanceAbuse: false,
      highBloodPressure: false,
      none: false
    },
    systemSpecific: dbData.system_specific || {
      respiratory: [],
      cardiovascular: [],
      gastrointestinal: [],
      neurological: [],
      endocrineRenal: []
    },
    additionalConditions: dbData.additional_conditions || [],
    recentHealthChanges: dbData.recent_health_changes || {
      hasChanges: false
    },
    
    // Section 3: Allergies & Medications
    allergies: dbData.allergies || {
      dentalRelated: [],
      medications: [],
      other: [],
      none: false
    },
    currentMedications: dbData.current_medications || {
      emergency: [],
      boneOsteoporosis: [],
      specialized: [],
      complete: '',
      none: false
    },
    currentPharmacy: {
      name: dbData.current_pharmacy_name || '',
      city: dbData.current_pharmacy_city || ''
    },
    
    // Section 4: Current Oral Health Status
    dentalStatus: dbData.dental_status || {
      upperJaw: 'all-teeth',
      lowerJaw: 'all-teeth'
    },
    previousSolutions: dbData.previous_solutions || [],
    currentSymptoms: dbData.current_symptoms || {
      facialOralPain: false,
      jawPainOpening: false,
      jawClicking: false,
      digestiveProblems: false
    },
    healingIssues: dbData.healing_issues || {
      bleedingBruising: false,
      delayedHealing: false,
      recurrentInfections: false,
      none: false
    },
    
    // Section 5: Lifestyle Factors
    pregnancy: dbData.pregnancy || {
      status: 'not-applicable'
    },
    tobaccoUse: dbData.tobacco_use || {
      type: 'none'
    },
    alcoholConsumption: dbData.alcohol_consumption || {
      frequency: 'none'
    },
    
    // Section 6: Patient Comfort Preferences
    anxietyControl: dbData.anxiety_control || [],
    painInjection: dbData.pain_injection || [],
    communication: dbData.communication || [],
    sensorySensitivities: dbData.sensory_sensitivities || [],
    physicalComfort: dbData.physical_comfort || [],
    servicePreferences: dbData.service_preferences || [],
    otherConcerns: dbData.other_concerns || '',
    
    // Section 7: Office Policies
    acknowledgments: dbData.acknowledgments || {
      treatmentBasedOnHealth: false,
      financialResponsibility: false,
      insuranceCourtesy: false,
      punctualityImportance: false,
      lateFeePolicy: false,
      depositRequirement: false,
      emergencyDefinition: false,
      emergencyProcedure: false
    },
    wantsFinancialInfo: dbData.wants_financial_info || false,
    
    // Section 8: Legal Documentation
    photoVideoAuth: dbData.photo_video_auth || 'disagree',
    hipaaAcknowledgment: dbData.hipaa_acknowledgment || {
      receivedNotice: false,
      understandsRights: false
    },
    
    // Section 9: Signatures
    patientAttestation: dbData.patient_attestation || {
      reviewedAll: false,
      noOmissions: false,
      willNotifyChanges: false,
      informationAccurate: false
    },
    patientNameSignature: dbData.patient_name_signature || '',
    signature: dbData.signature_data || '',
    date: dbData.signature_date ? new Date(dbData.signature_date) : new Date()
  };
}
