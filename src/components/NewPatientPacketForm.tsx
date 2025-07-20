import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Home, 
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
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  patientGender?: string;
}

export function NewPatientPacketForm({ 
  onSubmit, 
  onCancel, 
  patientName = "",
  patientDateOfBirth = "",
  patientGender = ""
}: NewPatientPacketFormProps) {
  const [activeSection, setActiveSection] = useState(1);
  const [formData, setFormData] = useState<NewPatientFormData>({
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

  // Section configuration
  const sections = [
    { 
      id: 1, 
      title: "Patient Info", 
      icon: User, 
      time: 5, 
      description: "Basic information and contacts",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: 2, 
      title: "Medical History", 
      icon: Heart, 
      time: 10, 
      description: "Complete medical background",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    { 
      id: 3, 
      title: "Allergies & Meds", 
      icon: Pill, 
      time: 5, 
      description: "Allergies and medications",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      id: 4, 
      title: "Oral Health", 
      icon: Stethoscope, 
      time: 4, 
      description: "Current dental status",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      id: 5, 
      title: "Lifestyle", 
      icon: Home, 
      time: 3, 
      description: "Lifestyle factors",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      id: 6, 
      title: "Comfort", 
      icon: Smile, 
      time: 5, 
      description: "Patient preferences",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    { 
      id: 7, 
      title: "Policies", 
      icon: FileText, 
      time: 3, 
      description: "Office policies",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    { 
      id: 8, 
      title: "Legal", 
      icon: Shield, 
      time: 3, 
      description: "Legal documentation",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    { 
      id: 9, 
      title: "Signatures", 
      icon: PenTool, 
      time: 2, 
      description: "Final signatures",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  // Calculate progress
  const totalSections = sections.length;
  const completedSections = activeSection - 1;
  const progressPercentage = (completedSections / totalSections) * 100;
  const totalTime = sections.reduce((sum, section) => sum + section.time, 0);
  const remainingTime = sections.slice(activeSection - 1).reduce((sum, section) => sum + section.time, 0);

  // Auto-save functionality
  useEffect(() => {
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
  }, [formData, activeSection]);

  // Load draft on mount
  useEffect(() => {
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
  }, [patientName, patientDateOfBirth, patientGender]);

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
      referredBy: "",

      // Section 2: Medical History
      medicalHistory: {
        heartConditions: [],
        bloodPressure: [],
        bloodDisorders: [],
        respiratoryConditions: [],
        liverKidneyConditions: [],
        diabetesEndocrine: [],
        neurologicalConditions: [],
        psychiatricConditions: [],
        cancerTumors: [],
        infectiousDiseases: [],
        immuneAutoimmune: [],
        boneJointConditions: [],
        skinConditions: [],
        eyeEarNoseThroat: [],
        additionalConditions: [],
        none: false
      },
      hospitalizations: {
        surgeries: "",
        emergencyVisits: "",
        none: false
      },
      familyHistory: {
        heartDisease: false,
        cancer: false,
        diabetes: false,
        bleedingDisorders: false,
        mentalHealth: false,
        other: "",
        none: false
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
    <div className="max-w-6xl mx-auto">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          New Patient Packet
        </DialogTitle>
      </DialogHeader>

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
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              const isCompleted = section.id < activeSection;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? `${section.bgColor} ${section.color} border border-current`
                      : isCompleted
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span>{section.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {section.time}m
                  </Badge>
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
                  Complete Form
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
}
