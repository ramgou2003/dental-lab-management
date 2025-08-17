// Supabase database types for new_patient_packets table
export interface NewPatientPacketDB {
  id?: string;
  patient_id?: string;
  lead_id?: string;
  consultation_patient_id?: string;
  
  // Section 1: Patient Identification & Contacts
  first_name: string;
  last_name: string;
  gender?: 'male' | 'female' | 'prefer-not-to-answer';
  date_of_birth?: string; // ISO date string
  height?: string;
  weight?: string;
  bmi?: number;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  phone_cell?: string;
  phone_work?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  has_pcp?: boolean;
  pcp_name?: string;
  pcp_practice?: string;
  pcp_phone?: string;
  
  // Section 2: Complete Medical History (stored as JSONB)
  critical_conditions?: {
    acidReflux?: boolean;
    cancer?: { has: boolean; type?: string };
    depressionAnxiety?: boolean;
    diabetes?: { has: boolean; type?: '1' | '2' };
    heartDisease?: boolean;
    periodontalDisease?: boolean;
    substanceAbuse?: boolean;
    highBloodPressure?: boolean;
    other?: string;
    none?: boolean;
  };
  system_specific?: {
    respiratory?: string[];
    cardiovascular?: string[];
    gastrointestinal?: string[];
    neurological?: string[];
    endocrineRenal?: string[];
  };
  additional_conditions?: string[];
  recent_health_changes?: {
    hasChanges?: boolean;
    description?: string;
  };
  
  // Section 3: Allergies & Medications (stored as JSONB)
  allergies?: {
    dentalRelated?: string[];
    medications?: string[];
    other?: string[];
    food?: string;
    none?: boolean;
  };
  current_medications?: {
    emergency?: string[];
    boneOsteoporosis?: string[];
    specialized?: string[];
    complete?: string;
    none?: boolean;
  };
  current_pharmacy_name?: string;
  current_pharmacy_city?: string;
  
  // Section 4: Current Oral Health Status (stored as JSONB)
  dental_status?: {
    upperJaw?: 'all-teeth' | 'some-missing' | 'no-teeth';
    lowerJaw?: 'all-teeth' | 'some-missing' | 'no-teeth';
  };
  previous_solutions?: string[];
  current_symptoms?: {
    facialOralPain?: boolean;
    jawPainOpening?: boolean;
    jawClicking?: boolean;
    digestiveProblems?: boolean;
    symptomDuration?: string;
  };
  healing_issues?: {
    bleedingBruising?: boolean;
    delayedHealing?: boolean;
    recurrentInfections?: boolean;
    none?: boolean;
  };
  
  // Section 5: Lifestyle Factors (stored as JSONB)
  pregnancy?: {
    status?: 'pregnant' | 'nursing' | 'not-applicable';
    weeks?: number;
  };
  tobacco_use?: {
    type?: 'none' | 'few-cigarettes' | 'half-pack' | 'one-pack' | 'more-than-pack' | 'vaping' | 'recreational-marijuana' | 'medicinal-marijuana';
    duration?: 'less-than-1' | '1-year' | '2-years' | '3-years' | '4-years' | '5-years' | '5-plus-years';
  };
  alcohol_consumption?: {
    frequency?: 'none' | 'casual' | 'regular' | 'heavy';
    duration?: 'less-than-1' | '1-year' | '2-years' | '3-years' | '4-years' | '5-years' | '5-plus-years';
  };
  
  // Section 6: Patient Comfort Preferences (stored as arrays)
  anxiety_control?: string[];
  pain_injection?: string[];
  communication?: string[];
  sensory_sensitivities?: string[];
  physical_comfort?: string[];
  service_preferences?: string[];
  other_concerns?: string;
  
  // Section 7: Office Policies (stored as JSONB)
  acknowledgments?: {
    treatmentBasedOnHealth?: boolean;
    financialResponsibility?: boolean;
    insuranceCourtesy?: boolean;
    punctualityImportance?: boolean;
    lateFeePolicy?: boolean;
    depositRequirement?: boolean;
    emergencyDefinition?: boolean;
    emergencyProcedure?: boolean;
  };
  wants_financial_info?: boolean;
  
  // Section 8: Legal Documentation
  photo_video_auth?: 'agree' | 'disagree';
  hipaa_acknowledgment?: {
    receivedNotice?: boolean;
    understandsRights?: boolean;
  };
  
  // Section 9: Signatures
  patient_attestation?: {
    reviewedAll?: boolean;
    noOmissions?: boolean;
    willNotifyChanges?: boolean;
    informationAccurate?: boolean;
  };
  patient_name_signature?: string;
  signature_data?: string; // Base64 encoded signature image
  signature_date?: string; // ISO date string
  
  // Metadata
  form_status?: 'draft' | 'completed' | 'submitted';
  submission_source?: 'public' | 'internal';
  submitted_at?: string; // ISO timestamp
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
}

// Note: PatientPacketView has been removed - we now use NewPatientPacketDB directly
// If you need patient or lead information, fetch it separately and join in the application code

// Summary type for dashboard/listing views
export interface PatientPacketSummary {
  id: string;
  patient_name: string;
  form_status: 'draft' | 'completed' | 'submitted';
  completion_percentage: number;
  submitted_at?: string;
  created_at: string;
}
