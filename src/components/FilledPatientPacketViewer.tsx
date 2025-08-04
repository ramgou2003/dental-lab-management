import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { NewPatientFormData } from "@/types/newPatientPacket";

interface FilledPatientPacketViewerProps {
  formData: NewPatientFormData;
  submittedAt?: string;
  onClose?: () => void;
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

export function FilledPatientPacketViewer({ 
  formData, 
  submittedAt, 
  onClose 
}: FilledPatientPacketViewerProps) {
  const [activeSection, setActiveSection] = useState(1);

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
    // Create a dummy onChange function since we're in read-only mode
    const dummyOnChange = () => {};
    const dummyNestedOnChange = () => {};

    const commonProps = {
      formData,
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
          return <Section5Lifestyle {...commonProps} />;
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
      <div className="read-only-form">
        {sectionContent}
      </div>
    );
  };

  const currentSection = sections[activeSection - 1];
  const progress = (activeSection / sections.length) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Header with submission info */}
      {submittedAt && (
        <div className="text-center">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted {new Date(submittedAt).toLocaleDateString()}
          </Badge>
        </div>
      )}

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
          const isCompleted = true; // All sections are completed in a submitted form
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`navigation-button p-3 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : isCompleted
                  ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
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
