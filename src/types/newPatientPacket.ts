// Section 1: Patient Identification & Contacts
export interface PatientInfo {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'prefer-not-to-answer';
  dateOfBirth: Date;
  height?: {
    feet: string;
    inches: string;
  };
  weight?: string;
  bmi?: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: {
    cell: string;
    work?: string;
  };
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryCarePhysician?: {
    hasPCP: boolean;
    name?: string;
    practice?: string;
    phone?: string;
  };
}

// Section 2: Complete Medical History
export interface MedicalHistory {
  criticalConditions: {
    acidReflux: boolean;
    cancer: { has: boolean; type?: string };
    depressionAnxiety: boolean;
    diabetes: { has: boolean; type?: '1' | '2'; a1cLevel?: string };
    heartDisease: boolean;
    periodontalDisease: boolean;
    substanceAbuse: boolean;
    highBloodPressure: boolean;
    other?: string;
    none: boolean;
  };
  systemSpecific: {
    respiratory: string[];
    cardiovascular: string[];
    gastrointestinal: string[];
    neurological: string[];
    endocrineRenal: string[];
  };
  additionalConditions: string[];
  recentHealthChanges: {
    hasChanges: boolean;
    description?: string;
  };
}

// Section 3: Allergies & Medications
export interface AllergiesMedications {
  allergies: {
    dentalRelated: string[];
    medications: string[];
    other: string[];
    food?: string;
    none: boolean;
  };
  currentMedications: {
    emergency: string[];
    boneOsteoporosis: string[];
    specialized: string[];
    complete: string;
    none: boolean;
  };
  currentPharmacy: {
    name: string;
    city: string;
  };
}

// Section 4: Current Oral Health Status
export interface OralHealthStatus {
  dentalStatus: {
    upperJaw: 'all-teeth' | 'some-missing' | 'no-teeth';
    lowerJaw: 'all-teeth' | 'some-missing' | 'no-teeth';
  };
  previousSolutions: string[];
  currentSymptoms: {
    facialOralPain: boolean;
    jawPainOpening: boolean;
    jawClicking: boolean;
    digestiveProblems: boolean;
    symptomDuration?: string;
  };
  healingIssues: {
    bleedingBruising: boolean;
    delayedHealing: boolean;
    recurrentInfections: boolean;
    none: boolean;
  };
}

// Section 5: Lifestyle Factors
export interface LifestyleFactors {
  pregnancy: {
    status: 'pregnant' | 'nursing' | 'not-applicable';
    weeks?: number;
  };
  tobaccoUse: {
    type: 'none' | 'few-cigarettes' | 'half-pack' | 'one-pack' | 'more-than-pack' | 'vaping' | 'recreational-marijuana' | 'medicinal-marijuana';
    duration?: 'less-than-1' | '1-year' | '2-years' | '3-years' | '4-years' | '5-years' | '5-plus-years';
  };
  alcoholConsumption: {
    frequency: 'none' | 'casual' | 'regular' | 'heavy';
    duration?: 'less-than-1' | '1-year' | '2-years' | '3-years' | '4-years' | '5-years' | '5-plus-years';
  };
}

// Section 6: Patient Comfort Preferences
export interface ComfortPreferences {
  anxietyControl: string[];
  painInjection: string[];
  communication: string[];
  sensorySensitivities: string[];
  physicalComfort: string[];
  servicePreferences: string[];
  otherConcerns?: string;
}

// Section 7: Office Policies
export interface OfficePolicies {
  acknowledgments: {
    treatmentBasedOnHealth: boolean;
    financialResponsibility: boolean;
    insuranceCourtesy: boolean;
    punctualityImportance: boolean;
    lateFeePolicy: boolean;
    depositRequirement: boolean;
    emergencyDefinition: boolean;
    emergencyProcedure: boolean;
  };
  wantsFinancialInfo: boolean;
}

// Section 8: Legal Documentation
export interface LegalDocumentation {
  photoVideoAuth: 'agree' | 'disagree';
  hipaaAcknowledgment: {
    receivedNotice: boolean;
    understandsRights: boolean;
  };
}

// Section 9: Signatures
export interface Signatures {
  patientAttestation: {
    reviewedAll: boolean;
    noOmissions: boolean;
    willNotifyChanges: boolean;
    informationAccurate: boolean;
  };
  patientNameSignature: string;
  signature: string;
  date: Date;
}

// Complete form data interface
export interface NewPatientFormData extends
  PatientInfo,
  MedicalHistory,
  AllergiesMedications,
  OralHealthStatus,
  LifestyleFactors,
  ComfortPreferences,
  OfficePolicies,
  LegalDocumentation,
  Signatures {
  // Form metadata
  formStatus?: 'draft' | 'completed' | 'submitted';
}

// Validation schema types
export interface ValidationError {
  field: string;
  message: string;
}

export interface SectionValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Critical alerts types
export interface CriticalAlert {
  type: 'red' | 'yellow';
  message: string;
  field: string;
}

export interface AlertSummary {
  redFlags: CriticalAlert[];
  yellowFlags: CriticalAlert[];
}

// Staff review types
export interface StaffReview {
  completionStatus: {
    section: string;
    completed: boolean;
    hasErrors: boolean;
  }[];
  criticalAlerts: AlertSummary;
  patientComfortNotes: string[];
  missingRequiredFields: string[];
  reviewedBy?: string;
  reviewDate?: Date;
}

// Form progress types
export interface FormProgress {
  currentSection: number;
  completedSections: number[];
  totalSections: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
}

// Auto-save types
export interface AutoSaveData {
  formData: NewPatientFormData;
  lastSaved: Date;
  sectionCompleted: number;
  isDraft: boolean;
}
