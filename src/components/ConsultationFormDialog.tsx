import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Save,
  CheckCircle
} from "lucide-react";
import { TreatmentForm, TreatmentFormRef } from "@/components/TreatmentForm";
import { FinancialOutcomeForm, FinancialOutcomeFormRef } from "@/components/FinancialOutcomeForm";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface ConsultationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  patientPacketId?: string;
  patientName?: string;
  consultationPatientId?: string;
  appointmentId?: string;
}

const sections = [
  { 
    id: 1, 
    title: "Treatment", 
    shortName: "Treatment", 
    icon: Stethoscope, 
    description: "Clinical assessment and treatment recommendations" 
  },
  { 
    id: 2, 
    title: "Financial & Outcome", 
    shortName: "Financial", 
    icon: DollarSign, 
    description: "Treatment costs and consultation outcomes" 
  }
];

export function ConsultationFormDialog({
  isOpen,
  onClose,
  onComplete,
  patientPacketId,
  patientName,
  consultationPatientId,
  appointmentId
}: ConsultationFormDialogProps) {
  const [activeSection, setActiveSection] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  // Refs for form components
  const treatmentFormRef = React.useRef<TreatmentFormRef>(null);
  const financialFormRef = React.useRef<FinancialOutcomeFormRef>(null);

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

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      console.log('🚀 Starting consultation completion...');
      console.log('🔍 Treatment form ref:', treatmentFormRef.current);
      console.log('🔍 Financial form ref:', financialFormRef.current);

      // Save treatment data
      if (treatmentFormRef.current) {
        console.log('💾 Saving treatment data...');
        await treatmentFormRef.current.saveData();
        console.log('✅ Treatment data saved');
      } else {
        console.warn('⚠️ Treatment form ref is null');
      }

      // Save financial data
      if (financialFormRef.current) {
        console.log('💾 Saving financial data...');
        await financialFormRef.current.saveData();
        console.log('✅ Financial data saved');
      } else {
        console.warn('⚠️ Financial form ref is null');
      }

      // Update consultation status to completed in the database
      if (patientPacketId) {
        console.log('💾 Updating consultation status to completed...');
        const { error: statusError } = await supabase
          .from('consultations')
          .update({
            consultation_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('new_patient_packet_id', patientPacketId);

        if (statusError) {
          console.error('❌ Error updating consultation status:', statusError);
          throw statusError;
        }
        console.log('✅ Consultation status updated to completed');
      }

      console.log('✅ Consultation completed successfully');
      toast.success('Consultation completed successfully!');
      onComplete?.() || onClose();
    } catch (error) {
      console.error('❌ Error completing consultation:', error);
      toast.error('Failed to complete consultation. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderCurrentSection = () => {


    return (
      <div>
        {/* Always render both forms but hide inactive ones */}
        <div style={{ display: activeSection === 1 ? 'block' : 'none' }}>
          <TreatmentForm
            ref={treatmentFormRef}
            patientPacketId={patientPacketId || undefined}
            patientName={patientName || 'Unknown Patient'}
            consultationPatientId={consultationPatientId}
            appointmentId={appointmentId}
          />
        </div>
        <div style={{ display: activeSection === 2 ? 'block' : 'none' }}>
          <FinancialOutcomeForm
            ref={financialFormRef}
            patientPacketId={patientPacketId || undefined}
            patientName={patientName || 'Unknown Patient'}
            consultationPatientId={consultationPatientId}
            appointmentId={appointmentId}
          />
        </div>
      </div>
    );
  };

  const currentSection = sections[activeSection - 1];
  const progress = (activeSection / sections.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="w-full space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Consultation Form
            </DialogTitle>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Section {activeSection} of {sections.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Section Navigation */}
          <div className="flex gap-2 justify-center overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isCompleted = activeSection > section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : isCompleted
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.shortName}</span>
                  {isCompleted && <CheckCircle className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          {/* Current Section Content */}
          <Card className="min-h-[500px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <currentSection.icon className="h-6 w-6 text-blue-600" />
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

          {/* Footer Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={activeSection === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {activeSection < sections.length ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {isCompleting ? (
                    <>
                      <Save className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Consultation
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
