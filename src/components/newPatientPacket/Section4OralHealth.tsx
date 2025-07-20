import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, AlertTriangle, Clock, Shield } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section4OralHealthProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section4OralHealth({ formData, onInputChange, onNestedInputChange }: Section4OralHealthProps) {
  
  // Previous dental solutions
  const previousSolutions = [
    'Partial Dentures (Upper)',
    'Partial Dentures (Lower)',
    'Complete Dentures (Upper)',
    'Complete Dentures (Lower)',
    'Dental Implants',
    'Dental Bridges',
    'Crowns',
    'Root Canals',
    'Extractions',
    'Orthodontic Treatment (Braces)',
    'Periodontal Treatment',
    'Oral Surgery'
  ];

  // Symptom duration options
  const symptomDurations = [
    'Less than 1 week',
    '1-2 weeks',
    '1 month',
    '2-3 months',
    '6 months',
    '1 year',
    'More than 1 year'
  ];

  const handlePreviousSolutionChange = (solution: string, checked: boolean) => {
    const currentSolutions = formData.previousSolutions || [];
    let newSolutions;
    
    if (checked) {
      newSolutions = [...currentSolutions, solution];
    } else {
      newSolutions = currentSolutions.filter(s => s !== solution);
    }
    
    onInputChange('previousSolutions', newSolutions);
  };

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    onNestedInputChange('currentSymptoms', symptom, checked);
    
    // If any symptom is unchecked, clear the duration
    if (!checked && symptom !== 'symptomDuration') {
      const hasAnySymptoms = Object.entries(formData.currentSymptoms)
        .filter(([key]) => key !== 'symptomDuration')
        .some(([key, value]) => key === symptom ? false : value);
      
      if (!hasAnySymptoms) {
        onNestedInputChange('currentSymptoms', 'symptomDuration', '');
      }
    }
  };

  const handleHealingIssueChange = (issue: string, checked: boolean) => {
    if (issue === 'none') {
      if (checked) {
        // If "none" is checked, uncheck all other issues
        onInputChange('healingIssues', {
          bleedingBruising: false,
          delayedHealing: false,
          recurrentInfections: false,
          none: true
        });
      } else {
        onNestedInputChange('healingIssues', 'none', false);
      }
    } else {
      // If any other issue is checked, uncheck "none"
      if (checked) {
        onNestedInputChange('healingIssues', 'none', false);
      }
      onNestedInputChange('healingIssues', issue, checked);
    }
  };

  // Check if any symptoms are present
  const hasSymptoms = formData.currentSymptoms.facialOralPain || 
                     formData.currentSymptoms.jawPainOpening || 
                     formData.currentSymptoms.jawClicking || 
                     formData.currentSymptoms.digestiveProblems;

  // Check for concerning symptoms
  const hasConcerningSymptoms = formData.currentSymptoms.facialOralPain || 
                               formData.currentSymptoms.jawPainOpening ||
                               formData.healingIssues.bleedingBruising ||
                               formData.healingIssues.delayedHealing ||
                               formData.healingIssues.recurrentInfections;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-green-600" />
            </div>
            Current Oral Health Status
            <Badge variant="secondary" className="ml-auto">4 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please provide information about your current dental condition and any symptoms you may be experiencing.
          </p>
        </CardHeader>
      </Card>

      {/* Current Dental Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-green-600" />
            Current Dental Status
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please describe the current condition of your teeth.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="upperJaw" className="text-sm font-semibold">
                Upper Jaw Status
              </Label>
              <Select 
                value={formData.dentalStatus.upperJaw} 
                onValueChange={(value) => onNestedInputChange('dentalStatus', 'upperJaw', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select upper jaw status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-teeth">All teeth present</SelectItem>
                  <SelectItem value="some-missing">Some teeth missing</SelectItem>
                  <SelectItem value="no-teeth">No teeth remaining</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lowerJaw" className="text-sm font-semibold">
                Lower Jaw Status
              </Label>
              <Select 
                value={formData.dentalStatus.lowerJaw} 
                onValueChange={(value) => onNestedInputChange('dentalStatus', 'lowerJaw', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lower jaw status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-teeth">All teeth present</SelectItem>
                  <SelectItem value="some-missing">Some teeth missing</SelectItem>
                  <SelectItem value="no-teeth">No teeth remaining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Dental Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Previous Dental Solutions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check all dental treatments or appliances you have had in the past.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {previousSolutions.map((solution) => (
              <div key={solution} className="flex items-center space-x-2">
                <Checkbox
                  id={`solution-${solution}`}
                  checked={formData.previousSolutions?.includes(solution) || false}
                  onCheckedChange={(checked) => handlePreviousSolutionChange(solution, checked as boolean)}
                />
                <Label htmlFor={`solution-${solution}`} className="text-sm">
                  {solution}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Current Symptoms
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check any symptoms you are currently experiencing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="facialOralPain"
                checked={formData.currentSymptoms.facialOralPain}
                onCheckedChange={(checked) => handleSymptomChange('facialOralPain', checked as boolean)}
              />
              <Label htmlFor="facialOralPain" className="text-sm">
                Facial or oral pain
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="jawPainOpening"
                checked={formData.currentSymptoms.jawPainOpening}
                onCheckedChange={(checked) => handleSymptomChange('jawPainOpening', checked as boolean)}
              />
              <Label htmlFor="jawPainOpening" className="text-sm">
                Jaw pain when opening mouth
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="jawClicking"
                checked={formData.currentSymptoms.jawClicking}
                onCheckedChange={(checked) => handleSymptomChange('jawClicking', checked as boolean)}
              />
              <Label htmlFor="jawClicking" className="text-sm">
                Jaw clicking or popping
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="digestiveProblems"
                checked={formData.currentSymptoms.digestiveProblems}
                onCheckedChange={(checked) => handleSymptomChange('digestiveProblems', checked as boolean)}
              />
              <Label htmlFor="digestiveProblems" className="text-sm">
                Digestive problems related to chewing
              </Label>
            </div>
          </div>

          {/* Symptom Duration */}
          {hasSymptoms && (
            <div className="mt-4">
              <Label htmlFor="symptomDuration" className="text-sm font-semibold">
                How long have you been experiencing these symptoms?
              </Label>
              <Select 
                value={formData.currentSymptoms.symptomDuration || ''} 
                onValueChange={(value) => onNestedInputChange('currentSymptoms', 'symptomDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {symptomDurations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Healing Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-red-600" />
            Healing Issues
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check if you have experienced any of the following healing-related issues.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bleedingBruising"
                checked={formData.healingIssues.bleedingBruising}
                onCheckedChange={(checked) => handleHealingIssueChange('bleedingBruising', checked as boolean)}
              />
              <Label htmlFor="bleedingBruising" className="text-sm">
                Excessive bleeding or bruising
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delayedHealing"
                checked={formData.healingIssues.delayedHealing}
                onCheckedChange={(checked) => handleHealingIssueChange('delayedHealing', checked as boolean)}
              />
              <Label htmlFor="delayedHealing" className="text-sm">
                Delayed healing after dental procedures
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurrentInfections"
                checked={formData.healingIssues.recurrentInfections}
                onCheckedChange={(checked) => handleHealingIssueChange('recurrentInfections', checked as boolean)}
              />
              <Label htmlFor="recurrentInfections" className="text-sm">
                Recurrent infections in mouth
              </Label>
            </div>
          </div>

          {/* None Option */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="noHealingIssues"
              checked={formData.healingIssues.none}
              onCheckedChange={(checked) => handleHealingIssueChange('none', checked as boolean)}
            />
            <Label htmlFor="noHealingIssues" className="text-sm font-medium">
              I have not experienced any healing issues
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Alerts for concerning symptoms */}
      {hasConcerningSymptoms && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> You have indicated symptoms that may require immediate attention. 
            Our clinical team will prioritize evaluation of these concerns during your visit.
          </AlertDescription>
        </Alert>
      )}

      {/* Missing teeth alert */}
      {(formData.dentalStatus.upperJaw === 'no-teeth' || formData.dentalStatus.lowerJaw === 'no-teeth') && (
        <Alert className="border-blue-200 bg-blue-50">
          <Stethoscope className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Treatment Planning:</strong> You have indicated missing teeth. Our team will discuss 
            comprehensive treatment options including implants, dentures, and other restorative solutions.
          </AlertDescription>
        </Alert>
      )}

      {/* Healing issues alert */}
      {(formData.healingIssues.bleedingBruising || 
        formData.healingIssues.delayedHealing || 
        formData.healingIssues.recurrentInfections) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Healing Concerns:</strong> You have indicated healing issues that may affect treatment planning. 
            We may need to coordinate with your physician and take special precautions during procedures.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
