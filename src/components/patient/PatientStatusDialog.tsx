// Patient Status Dialog - Shows treatment progress with dynamic stepper UI based on appliances
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
} from '@/components/ui/stepper';
import { UserPlus, Stethoscope, Syringe, Package, CheckCircle2, LoaderCircleIcon, FileText, FlaskConical, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { LabScriptDetail } from '@/components/LabScriptDetail';
import { ViewLabReportCard } from '@/components/ViewLabReportCard';
import { ViewClinicalReportCard } from '@/components/ViewClinicalReportCard';
import type { LabScript } from '@/hooks/useLabScripts';
import type { ReportCard } from '@/hooks/useReportCards';

interface PatientStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

interface Step {
  title: string;
  fullTitle?: string; // Full form of the title (e.g., "Printed Try-In" instead of "PTI")
  icon: any;
  description: string;
  status?: 'completed' | 'in-progress' | 'pending';
  labScriptId?: string; // Add lab script ID to track which lab script this step belongs to
  reportCardId?: string; // Add report card ID for clinical report
  requestedDate?: string; // Add requested date from lab script
}

export function PatientStatusDialog({ open, onOpenChange, patientId, patientName }: PatientStatusDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepDetails, setStepDetails] = useState<Record<number, string>>({});
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null); // Track which step is selected

  // Preview dialogs state
  const [showLabScriptPreview, setShowLabScriptPreview] = useState(false);
  const [showLabReportPreview, setShowLabReportPreview] = useState(false);
  const [showClinicalReportPreview, setShowClinicalReportPreview] = useState(false);
  const [selectedLabScript, setSelectedLabScript] = useState<LabScript | null>(null);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientStatus();
    }
  }, [open, patientId]);

  // Handler functions for preview buttons
  const handleViewLabScript = async (labScriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_scripts')
        .select('*')
        .eq('id', labScriptId)
        .single();

      if (error) {
        console.error('Error fetching lab script:', error);
        return;
      }

      setSelectedLabScript(data as LabScript);
      setShowLabScriptPreview(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewLabReport = async (labScriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('report_cards')
        .select('*')
        .eq('lab_script_id', labScriptId)
        .single();

      if (error) {
        console.error('Error fetching report card:', error);
        return;
      }

      setSelectedReportCard(data as ReportCard);
      setShowLabReportPreview(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewClinicalReport = async (reportCardId: string) => {
    if (!reportCardId) return;

    try {
      const { data, error } = await supabase
        .from('report_cards')
        .select('*')
        .eq('id', reportCardId)
        .single();

      if (error) {
        console.error('Error fetching report card:', error);
        return;
      }

      setSelectedReportCard(data as ReportCard);
      setShowClinicalReportPreview(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helper function to convert appliance type to friendly label
  const getApplianceLabel = (applianceType: string): string => {
    const labels: Record<string, string> = {
      'surgical-day-appliance': 'SDA',
      'printed-tryin': 'PTI',
      'direct-load-zirconia': 'Final - Direct Load Zirconia',
      'ti-bar-superstructure': 'Final - Ti-Bar & Superstructure',
      'direct-load-pmma': 'Final - Direct Load PMMA',
      'night-guard': 'Night Guard',
      'crown': 'Crown',
      'bridge': 'Bridge',
      'custom-abutment-crown': 'Custom Abutment & Crown',
    };
    return labels[applianceType] || applianceType;
  };

  const getApplianceFullName = (applianceType: string): string => {
    const fullNames: Record<string, string> = {
      'surgical-day-appliance': 'Surgical Day Appliance',
      'printed-tryin': 'Printed Try-In',
      'direct-load-zirconia': 'Final - Direct Load Zirconia',
      'ti-bar-superstructure': 'Final - Ti-Bar & Superstructure',
      'direct-load-pmma': 'Final - Direct Load PMMA',
      'night-guard': 'Night Guard',
      'crown': 'Crown',
      'bridge': 'Bridge',
      'custom-abutment-crown': 'Custom Abutment & Crown',
    };
    return fullNames[applianceType] || applianceType;
  };

  const fetchPatientStatus = async () => {
    setLoading(true);
    try {
      const dynamicSteps: Step[] = [];
      const details: Record<number, string> = {};
      let stepIndex = 1;
      let calculatedCurrentStep = 1;

      // Step 1: Registration (always present and completed)
      dynamicSteps.push({
        title: 'Patient Registration',
        icon: UserPlus,
        description: 'Patient registered in system',
        status: 'completed',
      });
      details[stepIndex] = 'Patient successfully registered';
      stepIndex++;

      // Step 2: Check for Consultation
      const { data: consultations } = await supabase
        .from('consultations')
        .select('id, consultation_status, completed_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Step 2: Check for Consultation (if available for that patient)
      if (consultations && consultations.length > 0) {
        const consultation = consultations[0];
        const isCompleted = consultation.consultation_status === 'completed';

        dynamicSteps.push({
          title: 'Consultation',
          icon: Stethoscope,
          description: 'Initial consultation',
          status: isCompleted ? 'completed' : 'in-progress',
        });

        if (isCompleted) {
          details[stepIndex] = `Consultation completed`;
        } else {
          details[stepIndex] = `Consultation ${consultation.consultation_status}`;
          calculatedCurrentStep = stepIndex;
        }
        stepIndex++;
      }

      // Step 3+: Fetch lab scripts ordered by requested_date (show regardless of consultation)
      // Try to fetch by patient_id first, then fallback to patient_name
      let labScripts: any[] = [];
      let labScriptsError: any = null;

      const { data: labScriptsByPatientId, error: errorById } = await supabase
        .from('lab_scripts')
        .select('*')
        .eq('patient_id', patientId)
        .order('requested_date', { ascending: true });

      console.log('Lab Scripts Query by patient_id:', { patientId, labScriptsByPatientId, errorById });

      if (labScriptsByPatientId && labScriptsByPatientId.length > 0) {
        labScripts = labScriptsByPatientId;
      } else {
        // Fallback: try to fetch by patient_name
        const { data: labScriptsByName, error: errorByName } = await supabase
          .from('lab_scripts')
          .select('*')
          .eq('patient_name', patientName)
          .order('requested_date', { ascending: true });

        console.log('Lab Scripts Query by patient_name:', { patientName, labScriptsByName, errorByName });

        if (labScriptsByName && labScriptsByName.length > 0) {
          labScripts = labScriptsByName;
        }
        labScriptsError = errorByName;
      }

      console.log('Final Lab Scripts:', { labScripts, labScriptsError });

      if (labScripts && labScripts.length > 0) {
        // For each lab script, create ONE step (not separate steps for upper/lower)
        for (const labScript of labScripts) {
          console.log('Processing lab script:', labScript);

          // Fetch lab report card for this lab script
          const { data: labReportCard, error: labReportError } = await supabase
            .from('lab_report_cards')
            .select('upper_appliance_number, lower_appliance_number, upper_appliance_type, lower_appliance_type')
            .eq('lab_script_id', labScript.id)
            .maybeSingle();

          console.log('Lab Report Card:', { labReportCard, labReportError });

          // Fetch report card for clinical report
          const { data: reportCard, error: reportCardError } = await supabase
            .from('report_cards')
            .select('*')
            .eq('lab_script_id', labScript.id)
            .maybeSingle();

          console.log('Report Card:', { reportCard, reportCardError });

          // Determine which appliance type fields to use
          // Priority: lab_report_cards appliance types > lab_scripts appliance types
          const upperType = labReportCard?.upper_appliance_type || labScript.upper_appliance_type;
          const lowerType = labReportCard?.lower_appliance_type || labScript.lower_appliance_type;
          const upperNumber = labReportCard?.upper_appliance_number;
          const lowerNumber = labReportCard?.lower_appliance_number;

          // Determine the step title and description based on arch type
          let stepTitle = '';
          let stepFullTitle = '';
          let stepDescription = '';

          if (labScript.arch_type === 'dual' && upperType && lowerType) {
            // Dual arch - show both appliances in one step
            const applianceLabel = getApplianceLabel(upperType);
            const applianceFullName = getApplianceFullName(upperType);
            stepTitle = `${applianceLabel} (Dual)`;
            stepFullTitle = `${applianceFullName} (Dual)`;

            // Build description with both appliance numbers
            const parts = [];
            if (upperNumber) parts.push(`Upper: ${upperNumber}`);
            if (lowerNumber) parts.push(`Lower: ${lowerNumber}`);
            stepDescription = parts.length > 0 ? parts.join(', ') : 'Dual arch appliance';
          } else if (upperType) {
            // Upper only
            const applianceLabel = getApplianceLabel(upperType);
            const applianceFullName = getApplianceFullName(upperType);
            stepTitle = applianceLabel;
            stepFullTitle = applianceFullName;
            stepDescription = upperNumber ? `Upper: ${upperNumber}` : 'Upper appliance';
          } else if (lowerType) {
            // Lower only
            const applianceLabel = getApplianceLabel(lowerType);
            const applianceFullName = getApplianceFullName(lowerType);
            stepTitle = applianceLabel;
            stepFullTitle = applianceFullName;
            stepDescription = lowerNumber ? `Lower: ${lowerNumber}` : 'Lower appliance';
          } else {
            // Fallback
            stepTitle = 'Lab Script';
            stepFullTitle = 'Lab Script';
            stepDescription = labScript.arch_type;
          }

          const isCompleted = labScript.status === 'completed';

          dynamicSteps.push({
            title: stepTitle,
            fullTitle: stepFullTitle,
            icon: Syringe,
            description: stepDescription,
            status: isCompleted ? 'completed' : 'in-progress',
            labScriptId: labScript.id,
            reportCardId: reportCard?.id,
            requestedDate: labScript.requested_date,
          });

          if (isCompleted) {
            details[stepIndex] = `${stepTitle} completed - ${stepDescription}`;
          } else {
            details[stepIndex] = `${stepTitle} - ${labScript.status} - ${stepDescription}`;
            if (calculatedCurrentStep === stepIndex - 1 || (calculatedCurrentStep < stepIndex && !isCompleted)) {
              calculatedCurrentStep = stepIndex;
            }
          }
          stepIndex++;
        }
      }

      console.log('Final steps:', dynamicSteps);
      console.log('Final details:', details);
      console.log('Final currentStep:', calculatedCurrentStep);

      setSteps(dynamicSteps);
      setStepDetails(details);
      setCurrentStep(calculatedCurrentStep);

      // Set the latest lab script step as selected by default
      const labScriptSteps = dynamicSteps.filter(step => step.labScriptId);
      if (labScriptSteps.length > 0) {
        const latestStepIndex = dynamicSteps.indexOf(labScriptSteps[labScriptSteps.length - 1]);
        setSelectedStepIndex(latestStepIndex);
      }
    } catch (error) {
      console.error('Error fetching patient status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-600">Patient Treatment Progress</DialogTitle>
          <p className="text-lg font-semibold text-gray-700 mt-2">{patientName}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoaderCircleIcon className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">No treatment progress data available for this patient.</p>
            <p className="text-sm text-gray-400 mt-2">Lab scripts and consultations will appear here once created.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4 flex-1 overflow-y-auto">
            {/* Progress Bar Section */}
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b-2 border-blue-200 bg-blue-50">
                <h3 className="text-sm font-semibold text-blue-700">Treatment Progress</h3>
                <p className="text-xs text-blue-600 mt-1">Click on any step to view details</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-400 scrollbar-track-transparent hover:scrollbar-thumb-blue-500 transition-all">
                  <Stepper value={currentStep} className="min-w-max w-full">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = step.status === 'completed';
                const isActive = stepNumber === currentStep && step.status !== 'completed';
                const isSelected = selectedStepIndex === index;

                return (
                  <StepperItem
                    key={index}
                    step={stepNumber}
                    completed={isCompleted}
                    className="relative flex-shrink-0 flex items-center"
                    style={{ minWidth: '150px' }}
                  >
                    <div className="flex flex-col items-center gap-2 w-full pt-2">
                      {/* Circle with number - clickable */}
                      <button
                        onClick={() => setSelectedStepIndex(index)}
                        className={cn(
                          "flex items-center justify-center rounded-full size-10 font-semibold text-sm transition-all z-10 cursor-pointer hover:scale-110",
                          isCompleted && "bg-blue-500 text-white hover:bg-blue-600",
                          isActive && "bg-blue-500 text-white hover:bg-blue-600",
                          !isCompleted && !isActive && "bg-white text-gray-400 border-2 border-gray-300 hover:border-blue-400",
                          isSelected && "ring-4 ring-blue-200"
                        )}
                      >
                        {stepNumber}
                      </button>

                      {/* Step title below circle */}
                      <div className="flex flex-col items-center gap-1 text-center mt-1">
                        <span className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          isCompleted && "text-blue-600",
                          isActive && "text-blue-600",
                          !isCompleted && !isActive && "text-gray-400"
                        )}>
                          {step.title}
                        </span>

                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {step.description}
                        </span>
                      </div>
                    </div>

                    {/* Connection line - positioned absolutely to align with circle center with gap */}
                    {stepNumber < steps.length && (
                      <div
                        className={cn(
                          "absolute h-0.5 transition-all",
                          isCompleted ? "bg-blue-500" : "bg-gray-300"
                        )}
                        style={{
                          left: '50%',
                          right: '-50%',
                          top: '28px', // Half of circle size (40px / 2 = 20px) + padding-top (8px) = 28px
                          transform: 'translateY(-50%)',
                          width: 'calc(100% - 60px)', // Full width minus circle size and gaps (40px circle + 20px gaps)
                          marginLeft: '30px' // Half of circle size (20px) + gap (10px)
                        }}
                      />
                    )}
                  </StepperItem>
                );
              })}
                  </Stepper>
                </div>
              </div>
            </div>

            {/* Selected Step Details */}
            {(() => {
              // Show details for the selected step
              if (selectedStepIndex === null || !steps[selectedStepIndex]) return null;

              const selectedStep = steps[selectedStepIndex];

              // Format the requested date
              const formatDate = (dateString?: string) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
              };

              return (
                <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b-2 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-blue-700">Step Details</h3>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        Step {selectedStepIndex + 1}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {selectedStep.fullTitle || selectedStep.title}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedStep.description}</p>
                      {selectedStep.requestedDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Requested: {formatDate(selectedStep.requestedDate)}
                        </p>
                      )}
                    </div>

                    {/* Only show buttons if this step has a lab script */}
                    {selectedStep.labScriptId && (
                      <div className="pt-4 border-t-2 border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-3">Related Documents</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLabScript(selectedStep.labScriptId!)}
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          >
                            <FlaskConical className="h-4 w-4 mr-2" />
                            Lab Script
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLabReport(selectedStep.labScriptId!)}
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Lab Report
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClinicalReport(selectedStep.reportCardId!)}
                            disabled={!selectedStep.reportCardId}
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:hover:bg-white"
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Clinical Report
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </DialogContent>

      {/* Lab Script Preview Dialog */}
      <LabScriptDetail
        open={showLabScriptPreview}
        onClose={() => {
          setShowLabScriptPreview(false);
          setSelectedLabScript(null);
        }}
        labScript={selectedLabScript}
        onUpdate={() => {}}
        initialEditMode={false}
      />

      {/* Lab Report Card Preview Dialog */}
      <Dialog open={showLabReportPreview} onOpenChange={setShowLabReportPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <ViewLabReportCard
              reportCard={selectedReportCard}
              onClose={() => {
                setShowLabReportPreview(false);
                setSelectedReportCard(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Clinical Report Card Preview Dialog */}
      <Dialog open={showClinicalReportPreview} onOpenChange={setShowClinicalReportPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReportCard && (
            <ViewClinicalReportCard
              reportCardId={selectedReportCard.id}
              onClose={() => {
                setShowClinicalReportPreview(false);
                setSelectedReportCard(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
