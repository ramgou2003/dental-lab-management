import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Heart, 
  Pill, 
  Smile, 
  Coffee, 
  Shield, 
  FileText, 
  PenTool,
  CheckCircle
} from "lucide-react";

// Import the existing section components
import { Section1PatientInfo } from "@/components/newPatientPacket/Section1PatientInfo";
import { Section2MedicalHistory } from "@/components/newPatientPacket/Section2MedicalHistory";
import { Section3AllergiesMeds } from "@/components/newPatientPacket/Section3AllergiesMeds";
import { Section4OralHealth } from "@/components/newPatientPacket/Section4OralHealth";
import { Section5Lifestyle } from "@/components/newPatientPacket/Section5Lifestyle";
import { Section6Comfort } from "@/components/newPatientPacket/Section6Comfort";
import { Section7Policies } from "@/components/newPatientPacket/Section7Policies";
import { Section8Legal } from "@/components/newPatientPacket/Section8Legal";
import { Section9Signatures } from "@/components/newPatientPacket/Section9Signatures";

// Import types
import { NewPatientFormData } from "@/types/newPatientPacket";
import { NewPatientPacketDB } from "@/types/supabasePatientPacket";

interface NewPatientPacketPreviewProps {
  onClose?: () => void;
  patientData?: NewPatientFormData | NewPatientPacketDB; // Optional: use real data from Supabase
}

// Function to transform Supabase data to form data structure
function transformSupabaseToFormData(dbData: NewPatientPacketDB): NewPatientFormData {
  // Convert height from inches to feet and inches
  const convertHeight = (heightInInches: string | undefined) => {
    if (!heightInInches) return { feet: '', inches: '' };
    const totalInches = parseInt(heightInInches);
    if (isNaN(totalInches)) return { feet: '', inches: '' };
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet: feet.toString(), inches: inches.toString() };
  };

  return {
    // Section 1: Patient Information
    firstName: dbData.first_name || '',
    lastName: dbData.last_name || '',
    gender: dbData.gender || 'prefer-not-to-answer',
    dateOfBirth: dbData.date_of_birth ? new Date(dbData.date_of_birth) : new Date(),
    height: convertHeight(dbData.height),
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

    // Section 2: Medical History
    criticalConditions: dbData.critical_conditions || {
      acidReflux: false,
      cancer: { has: false, type: '' },
      depressionAnxiety: false,
      diabetes: { has: false, type: undefined, a1cLevel: '' },
      heartDisease: false,
      periodontalDisease: false,
      substanceAbuse: false,
      highBloodPressure: false,
      other: '',
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
      hasChanges: false,
      description: ''
    },

    // Section 3: Allergies & Medications
    allergies: dbData.allergies || {
      dentalRelated: [],
      medications: [],
      other: [],
      food: '',
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

    // Section 4: Oral Health Status
    dentalStatus: dbData.dental_status || {
      upperJaw: 'all-teeth',
      lowerJaw: 'all-teeth'
    },
    previousSolutions: dbData.previous_solutions || [],
    currentSymptoms: dbData.current_symptoms || {
      facialOralPain: false,
      jawPainOpening: false,
      jawClicking: false,
      digestiveProblems: false,
      symptomDuration: ''
    },
    healingIssues: dbData.healing_issues || {
      bleedingBruising: false,
      delayedHealing: false,
      recurrentInfections: false,
      none: false
    },

    // Section 5: Lifestyle Factors
    pregnancy: dbData.pregnancy || {
      status: 'not-applicable',
      weeks: undefined
    },
    tobaccoUse: dbData.tobacco_use || {
      type: 'none',
      duration: undefined
    },
    alcoholConsumption: dbData.alcohol_consumption || {
      frequency: 'none',
      duration: undefined
    },

    // Section 6: Comfort Preferences
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
    date: dbData.signature_date ? new Date(dbData.signature_date) : new Date(),

    // Form metadata
    formStatus: dbData.form_status || 'draft'
  };
}

const sections = [
  { id: 1, title: "Patient Information", shortName: "Patient Info", icon: User, description: "Personal details and contact information" },
  { id: 2, title: "Medical History", shortName: "Medical", icon: Heart, description: "Health conditions and medical background" },
  { id: 3, title: "Allergies & Medications", shortName: "Allergies", icon: Pill, description: "Current medications and known allergies" },
  { id: 4, title: "Oral Health Status", shortName: "Oral Health", icon: Smile, description: "Current dental condition and history" },
  { id: 5, title: "Lifestyle Factors", shortName: "Lifestyle", icon: Coffee, description: "Habits that may affect treatment" },
  { id: 6, title: "Comfort Preferences", shortName: "Comfort", icon: Shield, description: "Anxiety management and comfort options" },
  { id: 7, title: "Office Policies", shortName: "Policies", icon: FileText, description: "Financial and appointment policies" },
  { id: 8, title: "Legal Documentation", shortName: "Legal", icon: PenTool, description: "Consent forms and legal agreements" },
  { id: 9, title: "Signatures", shortName: "Signatures", icon: CheckCircle, description: "Patient attestation and signatures" }
];

// Sample form data for preview
const sampleFormData: NewPatientFormData = {
  // Section 1: Patient Information
  firstName: 'John',
  lastName: 'Smith',
  gender: 'male',
  dateOfBirth: new Date('1985-06-15'),
  height: {
    feet: '5',
    inches: '10'
  },
  weight: '175',
  bmi: 25.1,
  address: {
    street: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zip: '12345'
  },
  phone: {
    cell: '(555) 123-4567',
    work: '(555) 987-6543'
  },
  email: 'john.smith@email.com',
  emergencyContact: {
    name: 'Jane Smith',
    relationship: 'Spouse',
    phone: '(555) 111-2222'
  },
  primaryCarePhysician: {
    hasPCP: true,
    name: 'Dr. Johnson',
    practice: 'Family Medical Center',
    phone: '(555) 333-4444'
  },

  // Section 2: Medical History
  criticalConditions: {
    acidReflux: true,
    cancer: { has: false, type: '' },
    depressionAnxiety: false,
    diabetes: { has: true, type: '2', a1cLevel: '7.2' },
    heartDisease: false,
    periodontalDisease: true,
    substanceAbuse: false,
    highBloodPressure: true,
    other: '',
    none: false
  },
  systemSpecific: {
    respiratory: ['Asthma', 'Sleep Apnea'],
    cardiovascular: ['High Blood Pressure'],
    gastrointestinal: ['Acid Reflux'],
    neurological: [],
    endocrineRenal: ['Diabetes Type 2']
  },
  additionalConditions: ['Arthritis', 'Osteoporosis'],
  recentHealthChanges: {
    hasChanges: true,
    description: 'Recently diagnosed with Type 2 diabetes'
  },

  // Section 3: Allergies & Medications
  allergies: {
    dentalRelated: ['Latex'],
    medications: ['Penicillin'],
    other: ['Shellfish'],
    food: 'Nuts, Shellfish',
    none: false
  },
  currentMedications: {
    emergency: [],
    boneOsteoporosis: [],
    specialized: ['Metformin 500mg', 'Lisinopril 10mg'],
    complete: 'Metformin 500mg twice daily, Lisinopril 10mg once daily',
    none: false
  },
  currentPharmacy: {
    name: 'CVS Pharmacy',
    city: 'Anytown'
  },

  // Section 4: Oral Health Status
  dentalStatus: {
    upperJaw: 'some-missing',
    lowerJaw: 'some-missing'
  },
  previousSolutions: ['Partial dentures', 'Dental bridges'],
  currentSymptoms: {
    facialOralPain: true,
    jawPainOpening: false,
    jawClicking: true,
    digestiveProblems: false,
    symptomDuration: '6 months'
  },
  healingIssues: {
    bleedingBruising: false,
    delayedHealing: true,
    recurrentInfections: false,
    none: false
  },

  // Section 5: Lifestyle Factors
  pregnancy: {
    status: 'not-applicable',
    weeks: undefined
  },
  tobaccoUse: {
    type: 'half-pack',
    duration: '5-plus-years'
  },
  alcoholConsumption: {
    frequency: 'casual',
    duration: '5-plus-years'
  },

  // Section 6: Comfort Preferences
  anxietyControl: ['Sedation options', 'Calming music'],
  painInjection: ['Topical numbing gel', 'Slow injection technique'],
  communication: ['Detailed explanations', 'Step-by-step updates'],
  sensorySensitivities: ['Bright lights', 'Loud noises'],
  physicalComfort: ['Neck pillow', 'Blanket'],
  servicePreferences: ['Female staff preferred'],
  otherConcerns: 'Please explain each step before proceeding. Had a painful procedure as a child.',

  // Section 7: Office Policies
  acknowledgments: {
    treatmentBasedOnHealth: true,
    financialResponsibility: true,
    insuranceCourtesy: true,
    punctualityImportance: true,
    lateFeePolicy: true,
    depositRequirement: true,
    emergencyDefinition: true,
    emergencyProcedure: true
  },
  wantsFinancialInfo: true,

  // Section 8: Legal Documentation
  photoVideoAuth: 'agree',
  hipaaAcknowledgment: {
    receivedNotice: true,
    understandsRights: true
  },

  // Section 9: Signatures
  patientAttestation: {
    reviewedAll: true,
    noOmissions: true,
    willNotifyChanges: true,
    informationAccurate: true
  },
  patientNameSignature: 'John Smith',
  signature: 'John Smith',
  date: new Date('2024-01-15')
};

export function NewPatientPacketPreview({ onClose, patientData }: NewPatientPacketPreviewProps) {
  const [activeSection, setActiveSection] = useState(1);

  // Use real patient data if provided, otherwise use sample data
  const formData = patientData ?
    // Check if it's Supabase data (has snake_case fields) or already transformed data
    ('first_name' in patientData ? transformSupabaseToFormData(patientData as NewPatientPacketDB) : patientData as NewPatientFormData)
    : sampleFormData;

  // Debug: Log the data to see what we're working with
  console.log('Preview - Original patientData:', patientData);
  console.log('Preview - Transformed formData:', formData);

  const handleNext = () => {
    if (activeSection < sections.length) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleSectionClick = (sectionId: number) => {
    setActiveSection(sectionId);
  };

  const renderCurrentSection = () => {
    // Create dummy onChange functions since we're in preview mode
    const dummyOnChange = () => {};
    const dummyNestedOnChange = () => {};

    const commonProps = {
      formData: formData,
      onInputChange: dummyOnChange,
      onNestedInputChange: dummyNestedOnChange,
    };

    // Wrap the section in a div that makes all inputs read-only
    const sectionContent = (() => {
      switch (activeSection) {
        case 1:
          return <Section1PatientInfo {...commonProps} />;
        case 2:
          return <Section2MedicalHistory {...commonProps} />;
        case 3:
          return <Section3AllergiesMeds {...commonProps} />;
        case 4:
          return <Section4OralHealth {...commonProps} />;
        case 5:
          return <Section5Lifestyle {...commonProps} patientGender={formData.gender} />;
        case 6:
          return <Section6Comfort {...commonProps} />;
        case 7:
          return <Section7Policies {...commonProps} />;
        case 8:
          return <Section8Legal {...commonProps} />;
        case 9:
          return <Section9Signatures {...commonProps} />;
        default:
          return <Section1PatientInfo {...commonProps} />;
      }
    })();

    return (
      <div className="preview-form">
        <style>{`
          /* Disable interactions but keep original styling */
          .preview-form input,
          .preview-form textarea,
          .preview-form select,
          .preview-form button[type="button"]:not(.navigation-button),
          .preview-form [role="button"]:not(.navigation-button),
          .preview-form [data-radix-collection-item],
          .preview-form [role="combobox"],
          .preview-form [data-radix-select-trigger],
          .preview-form [data-radix-popover-trigger] {
            pointer-events: none !important;
            cursor: default !important;
          }

          /* Keep navigation buttons functional */
          .preview-form .navigation-button {
            pointer-events: auto !important;
            cursor: pointer !important;
          }

          /* Disable form submission and editing buttons */
          .preview-form button:not(.navigation-button) {
            pointer-events: none !important;
            cursor: default !important;
          }

          /* Disable checkboxes and radio buttons interactions but keep styling */
          .preview-form input[type="checkbox"],
          .preview-form input[type="radio"],
          .preview-form [role="checkbox"],
          .preview-form [role="radio"] {
            pointer-events: none !important;
            cursor: default !important;
          }

          /* Disable dropdown interactions */
          .preview-form [data-radix-select-content],
          .preview-form [data-radix-select-item],
          .preview-form [data-radix-popover-content] {
            pointer-events: none !important;
          }

          /* Disable signature areas */
          .preview-form canvas,
          .preview-form .signature-pad {
            pointer-events: none !important;
            cursor: default !important;
          }
        `}</style>
        {sectionContent}
      </div>
    );
  };

  const currentSection = sections[activeSection - 1];
  const progress = (activeSection / sections.length) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">New Patient Packet Preview</h2>
        <p className="text-gray-600">Preview the structure and layout of the new patient packet form</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Section {activeSection} of {sections.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeSection;
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`navigation-button p-3 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
              }`}
              title={section.title}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <div className="text-xs font-medium text-center leading-tight">{section.shortName}</div>
            </button>
          );
        })}
      </div>

      {/* Current Section */}
      <Card className="min-h-[500px]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <currentSection.icon className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold">{currentSection.title}</h2>
              <p className="text-sm text-gray-600 font-normal">{currentSection.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderCurrentSection()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={activeSection === 1}
          className="flex items-center gap-2 navigation-button"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center">
          <span className="text-sm text-gray-600">
            Section {activeSection} of {sections.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={activeSection === sections.length}
          className="flex items-center gap-2 navigation-button"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
