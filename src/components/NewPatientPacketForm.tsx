import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Heart,
  Pill,
  Stethoscope,
  Coffee,
  Smile,
  FileText,
  Shield,
  PenTool,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

// Import section components
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

interface NewPatientPacketFormProps {
  onSubmit: (formData: NewPatientFormData) => void;
  onCancel?: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  patientGender?: string;
  showWelcomeHeader?: boolean; // New prop to control logo and greetings
  initialData?: NewPatientFormData; // New prop for prefilling form data
  submitButtonText?: string; // Custom submit button text
}

export interface NewPatientPacketFormRef {
  submitForm: () => void;
}

export const NewPatientPacketForm = forwardRef<NewPatientPacketFormRef, NewPatientPacketFormProps>(({
  onSubmit,
  onCancel,
  patientName = "",
  patientDateOfBirth = "",
  patientGender = "",
  showWelcomeHeader = false,
  initialData,
  submitButtonText = "Submit Patient Packet"
}, ref) => {
  const [activeSection, setActiveSection] = useState(1);

  // Helper function to get default form data
  const getDefaultFormData = (): NewPatientFormData => ({
    // Section 1: Patient Identification & Contacts
    firstName: patientName.split(' ')[0] || "",
    lastName: patientName.split(' ').slice(1).join(' ') || "",
    gender: patientGender as 'male' | 'female' | 'prefer-not-to-answer' || 'prefer-not-to-answer',
    dateOfBirth: patientDateOfBirth ? new Date(patientDateOfBirth) : new Date(),
    height: "",
    weight: "",
    bmi: 0,
    address: {
      street: "",
      city: "",
      state: "",
      zip: ""
    },
    phone: {
      cell: "",
      work: ""
    },
    email: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    primaryCarePhysician: {
      hasPCP: false,
      name: "",
      practice: "",
      phone: ""
    },

    // Section 2: Complete Medical History
    criticalConditions: {
      acidReflux: false,
      cancer: { has: false, type: "" },
      depressionAnxiety: false,
      diabetes: { has: false, type: undefined },
      heartDisease: false,
      periodontalDisease: false,
      substanceAbuse: false,
      highBloodPressure: false,
      other: "",
      none: false
    },
    systemSpecific: {
      respiratory: [],
      cardiovascular: [],
      gastrointestinal: [],
      neurological: [],
      endocrineRenal: []
    },
    additionalConditions: [],
    recentHealthChanges: {
      hasChanges: false,
      description: ""
    },

    // Section 3: Allergies & Medications
    allergies: {
      dentalRelated: [],
      medications: [],
      other: [],
      food: "",
      none: false
    },
    currentMedications: {
      emergency: [],
      boneOsteoporosis: [],
      specialized: [],
      complete: "",
      none: false
    },
    currentPharmacy: {
      name: "",
      city: ""
    },

    // Section 4: Current Oral Health Status
    dentalStatus: {
      upperJaw: 'all-teeth',
      lowerJaw: 'all-teeth'
    },
    previousSolutions: [],
    currentSymptoms: {
      facialOralPain: false,
      jawPainOpening: false,
      jawClicking: false,
      digestiveProblems: false,
      symptomDuration: ""
    },
    healingIssues: {
      bleedingBruising: false,
      delayedHealing: false,
      recurrentInfections: false,
      none: false
    },

    // Section 5: Lifestyle Factors
    pregnancy: {
      status: 'not-applicable',
      weeks: 0
    },
    tobaccoUse: {
      type: 'none',
      duration: undefined
    },
    alcoholConsumption: {
      frequency: 'none',
      duration: undefined
    },

    // Section 6: Patient Comfort Preferences
    anxietyControl: [],
    painInjection: [],
    communication: [],
    sensorySensitivities: [],
    physicalComfort: [],
    servicePreferences: [],
    otherConcerns: "",

    // Section 7: Office Policies
    acknowledgments: {
      treatmentBasedOnHealth: false,
      financialResponsibility: false,
      insuranceCourtesy: false,
      punctualityImportance: false,
      lateFeePolicy: false,
      depositRequirement: false,
      emergencyDefinition: false,
      emergencyProcedure: false
    },
    wantsFinancialInfo: false,

    // Section 8: Legal Documentation
    photoVideoAuth: 'disagree',
    hipaaAcknowledgment: {
      receivedNotice: false,
      understandsRights: false
    },

    // Section 9: Signatures
    patientAttestation: {
      reviewedAll: false,
      noOmissions: false,
      willNotifyChanges: false,
      informationAccurate: false
    },
    patientNameSignature: "",
    signature: "",
    date: new Date()
  });

  const [formData, setFormData] = useState<NewPatientFormData>(() => {
    // Use a function to ensure proper initialization
    if (initialData) {
      return initialData;
    }
    return getDefaultFormData();
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Expose submit function to parent component
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit
  }));



  // Section configuration
  const sections = [
    {
      id: 1,
      title: "Patient Information",
      shortName: "Patient Info",
      icon: User,
      time: 5,
      description: "Personal details and contact information"
    },
    {
      id: 2,
      title: "Medical History",
      shortName: "Medical",
      icon: Heart,
      time: 10,
      description: "Health conditions and medical background"
    },
    {
      id: 3,
      title: "Allergies & Medications",
      shortName: "Allergies",
      icon: Pill,
      time: 5,
      description: "Current medications and known allergies"
    },
    {
      id: 4,
      title: "Oral Health Status",
      shortName: "Oral Health",
      icon: Smile,
      time: 4,
      description: "Current dental condition and history"
    },
    {
      id: 5,
      title: "Lifestyle Factors",
      shortName: "Lifestyle",
      icon: Coffee,
      time: 3,
      description: "Habits that may affect treatment"
    },
    {
      id: 6,
      title: "Comfort Preferences",
      shortName: "Comfort",
      icon: Shield,
      time: 5,
      description: "Anxiety management and comfort options"
    },
    {
      id: 7,
      title: "Office Policies",
      shortName: "Policies",
      icon: FileText,
      time: 3,
      description: "Financial and appointment policies"
    },
    {
      id: 8,
      title: "Legal Documentation",
      shortName: "Legal",
      icon: PenTool,
      time: 3,
      description: "Consent forms and legal agreements"
    },
    {
      id: 9,
      title: "Signatures",
      shortName: "Signatures",
      icon: CheckCircle,
      time: 2,
      description: "Patient attestation and signatures"
    }
  ];

  // Calculate progress
  const totalSections = sections.length;
  const completedSections = activeSection - 1;
  const progressPercentage = (completedSections / totalSections) * 100;
  const totalTime = sections.reduce((sum, section) => sum + section.time, 0);
  const remainingTime = sections.slice(activeSection - 1).reduce((sum, section) => sum + section.time, 0);

  // Auto-save functionality (only for new forms, not when editing existing data)
  useEffect(() => {
    // Don't auto-save when editing existing data
    if (initialData) {
      return;
    }

    const autoSave = setTimeout(() => {
      try {
        const dataToSave = {
          ...formData,
          // Convert Date objects to ISO strings for proper serialization
          dateOfBirth: formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString() : formData.dateOfBirth,
          lastSaved: new Date().toISOString(),
          sectionCompleted: activeSection
        };
        localStorage.setItem('dentalFormDraft', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [formData, activeSection, initialData]);

  // Load draft on mount (only if no initialData is provided)
  useEffect(() => {
    // Don't load draft if we have initialData (edit mode)
    if (initialData) {
      return;
    }

    const draft = localStorage.getItem('dentalFormDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        // Only load draft if it's recent (within 24 hours)
        const lastSaved = new Date(parsedDraft.lastSaved);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          // Preserve the patient info from props and merge with draft
          const mergedData = {
            ...parsedDraft,
            firstName: patientName.split(' ')[0] || parsedDraft.firstName,
            lastName: patientName.split(' ').slice(1).join(' ') || parsedDraft.lastName,
            gender: patientGender as 'male' | 'female' | 'prefer-not-to-answer' || parsedDraft.gender,
            dateOfBirth: patientDateOfBirth ? new Date(patientDateOfBirth) : (parsedDraft.dateOfBirth ? new Date(parsedDraft.dateOfBirth) : new Date()),
          };
          setFormData(mergedData);
          setActiveSection(parsedDraft.sectionCompleted || 1);
        } else {
          // Clear old draft if it's too old
          localStorage.removeItem('dentalFormDraft');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        // Clear corrupted draft
        localStorage.removeItem('dentalFormDraft');
      }
    }
  }, [patientName, patientDateOfBirth, patientGender, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof NewPatientFormData],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (activeSection < totalSections) {
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

  const handleSubmit = () => {
    // Clear draft on successful submission
    localStorage.removeItem('dentalFormDraft');
    onSubmit(formData);
  };

  // Function to clear draft manually if needed
  const clearDraft = () => {
    localStorage.removeItem('dentalFormDraft');
    // Reset form to initial state
    setFormData({
      // Section 1: Patient Identification & Contacts
      firstName: patientName.split(' ')[0] || "",
      lastName: patientName.split(' ').slice(1).join(' ') || "",
      gender: patientGender as 'male' | 'female' | 'prefer-not-to-answer' || 'prefer-not-to-answer',
      dateOfBirth: patientDateOfBirth ? new Date(patientDateOfBirth) : new Date(),
      height: "",
      weight: "",
      bmi: 0,
      address: {
        street: "",
        city: "",
        state: "",
        zip: ""
      },
      phone: {
        cell: "",
        work: ""
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      },
      email: "",

      // Section 2: Complete Medical History
      criticalConditions: {
        acidReflux: false,
        cancer: { has: false, type: "" },
        depressionAnxiety: false,
        diabetes: { has: false, type: undefined },
        heartDisease: false,
        periodontalDisease: false,
        substanceAbuse: false,
        highBloodPressure: false,
        other: "",
        none: false
      },
      systemSpecific: {
        respiratory: [],
        cardiovascular: [],
        gastrointestinal: [],
        neurological: [],
        endocrineRenal: []
      },
      additionalConditions: [],
      recentHealthChanges: {
        hasChanges: false,
        description: ""
      },

      // Section 3: Allergies & Medications
      allergies: {
        dentalRelated: [],
        medications: [],
        other: [],
        food: "",
        none: false
      },
      currentMedications: {
        emergency: [],
        boneOsteoporosis: [],
        specialized: [],
        complete: "",
        none: false
      },
      currentPharmacy: {
        name: "",
        city: ""
      },

      // Section 4: Current Oral Health Status
      dentalStatus: {
        upperJaw: 'all-teeth',
        lowerJaw: 'all-teeth'
      },
      previousSolutions: [],
      currentSymptoms: {
        facialOralPain: false,
        jawPainOpening: false,
        jawClicking: false,
        digestiveProblems: false,
        symptomDuration: ""
      },
      healingIssues: {
        bleedingBruising: false,
        delayedHealing: false,
        recurrentInfections: false,
        none: false
      },

      // Section 5: Lifestyle Factors
      pregnancy: {
        status: 'not-applicable',
        weeks: 0
      },
      tobaccoUse: {
        type: 'none',
        duration: undefined
      },
      alcoholConsumption: {
        frequency: 'none',
        duration: undefined
      },

      // Section 6: Patient Comfort Preferences
      anxietyControl: [],
      painInjection: [],
      communication: [],
      sensorySensitivities: [],
      physicalComfort: [],
      servicePreferences: [],
      otherConcerns: "",

      // Section 7: Office Policies
      acknowledgments: {
        treatmentBasedOnHealth: false,
        financialResponsibility: false,
        insuranceCourtesy: false,
        punctualityImportance: false,
        lateFeePolicy: false,
        depositRequirement: false,
        emergencyDefinition: false,
        emergencyProcedure: false
      },
      wantsFinancialInfo: false,

      // Section 8: Legal Documentation
      photoVideoAuth: 'disagree',
      hipaaAcknowledgment: {
        receivedNotice: false,
        understandsRights: false
      },

      // Section 9: Signatures
      patientAttestation: {
        reviewedAll: false,
        noOmissions: false,
        willNotifyChanges: false,
        informationAccurate: false
      },
      patientNameSignature: "",
      signature: "",
      date: new Date()
    });
    setActiveSection(1);
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="w-full">
      {/* Logo and Greeting Section - Only show on public links */}
      {showWelcomeHeader && (
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/logo-wide.png"
              alt="Practice Logo"
              className="h-16 mx-auto mb-4"
            />
          </div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome{patientName ? `, ${patientName}` : ''}!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for choosing our practice for your dental care.
            </p>
            <p className="text-sm text-gray-500">
              Please complete this patient packet to help us provide you with the best possible care.
            </p>
          </div>
        </div>
      )}

      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Section {activeSection} of {totalSections}: {currentSection?.title}
              </h3>
              <p className="text-sm text-gray-600">{currentSection?.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{remainingTime} min remaining</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Section Navigation */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              const isCompleted = section.id < activeSection;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : isCompleted
                      ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
                  title={section.title}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                  ) : (
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                  )}
                  <div className="text-xs font-medium text-center leading-tight">{section.shortName}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <div className="min-h-[600px]">
        {activeSection === 1 && (
          <Section1PatientInfo
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 2 && (
          <Section2MedicalHistory
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 3 && (
          <Section3AllergiesMeds
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 4 && (
          <Section4OralHealth
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 5 && (
          <Section5Lifestyle
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
            patientGender={patientGender}
          />
        )}
        {activeSection === 6 && (
          <Section6Comfort
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 7 && (
          <Section7Policies
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 8 && (
          <Section8Legal
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
        {activeSection === 9 && (
          <Section9Signatures
            formData={formData}
            onInputChange={handleInputChange}
            onNestedInputChange={handleNestedInputChange}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={activeSection === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {activeSection === totalSections ? (
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  {submitButtonText}
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Next Section
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

NewPatientPacketForm.displayName = 'NewPatientPacketForm';
