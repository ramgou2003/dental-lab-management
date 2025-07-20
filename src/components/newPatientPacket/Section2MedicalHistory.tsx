import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, AlertTriangle, Activity, Brain, Zap } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section2MedicalHistoryProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section2MedicalHistory({ formData, onInputChange, onNestedInputChange }: Section2MedicalHistoryProps) {
  
  // Critical conditions that require special attention
  const criticalConditions = [
    { key: 'acidReflux', label: 'Acid Reflux/GERD', critical: false },
    { key: 'cancer', label: 'Cancer (any type)', critical: true },
    { key: 'depressionAnxiety', label: 'Depression/Anxiety', critical: false },
    { key: 'diabetes', label: 'Diabetes', critical: true },
    { key: 'heartDisease', label: 'Heart Disease', critical: true },
    { key: 'periodontalDisease', label: 'Periodontal Disease', critical: false },
    { key: 'substanceAbuse', label: 'Substance Abuse', critical: true },
    { key: 'highBloodPressure', label: 'High Blood Pressure', critical: false }
  ];

  // System-specific conditions
  const systemConditions = {
    respiratory: [
      'Asthma', 'COPD', 'Sleep Apnea', 'Chronic Cough', 'Shortness of Breath'
    ],
    cardiovascular: [
      'High Blood Pressure', 'Heart Attack', 'Stroke', 'Pacemaker', 'Heart Murmur', 'Chest Pain'
    ],
    gastrointestinal: [
      'Ulcers', 'Liver Disease', 'Hepatitis', 'Crohn\'s Disease', 'IBS', 'Gallbladder Disease'
    ],
    neurological: [
      'Seizures', 'Migraines', 'Parkinson\'s', 'Multiple Sclerosis', 'Memory Problems'
    ],
    endocrineRenal: [
      'Thyroid Disease', 'Kidney Disease', 'Adrenal Problems', 'Osteoporosis'
    ]
  };

  // Additional conditions checklist
  const additionalConditions = [
    'Prolonged Bleeding', 'Fainting/Dizziness', 'Frequent Headaches', 
    'Joint Problems', 'Skin Disorders', 'Vision Problems', 'Hearing Problems',
    'Chronic Fatigue', 'Weight Loss/Gain', 'Night Sweats'
  ];

  const handleCriticalConditionChange = (key: string, checked: boolean) => {
    if (key === 'none') {
      // If "none" is checked, uncheck all other conditions
      if (checked) {
        const clearedConditions = { ...formData.criticalConditions };
        Object.keys(clearedConditions).forEach(k => {
          if (k !== 'none') {
            if (typeof clearedConditions[k as keyof typeof clearedConditions] === 'boolean') {
              (clearedConditions as any)[k] = false;
            } else if (typeof clearedConditions[k as keyof typeof clearedConditions] === 'object') {
              (clearedConditions as any)[k] = { has: false, type: '' };
            }
          }
        });
        clearedConditions.none = true;
        onInputChange('criticalConditions', clearedConditions);
      } else {
        onNestedInputChange('criticalConditions', 'none', false);
      }
    } else {
      // If any other condition is checked, uncheck "none"
      if (checked) {
        onNestedInputChange('criticalConditions', 'none', false);
      }
      
      if (key === 'cancer' || key === 'diabetes') {
        onNestedInputChange('criticalConditions', key, { has: checked, type: '' });
      } else {
        onNestedInputChange('criticalConditions', key, checked);
      }
    }
  };

  const handleSystemConditionChange = (system: string, condition: string, checked: boolean) => {
    const currentConditions = formData.systemSpecific[system as keyof typeof formData.systemSpecific] || [];
    let newConditions;
    
    if (checked) {
      newConditions = [...currentConditions, condition];
    } else {
      newConditions = currentConditions.filter(c => c !== condition);
    }
    
    onNestedInputChange('systemSpecific', system, newConditions);
  };

  const handleAdditionalConditionChange = (condition: string, checked: boolean) => {
    const currentConditions = formData.additionalConditions || [];
    let newConditions;
    
    if (checked) {
      newConditions = [...currentConditions, condition];
    } else {
      newConditions = currentConditions.filter(c => c !== condition);
    }
    
    onInputChange('additionalConditions', newConditions);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            Complete Medical History
            <Badge variant="secondary" className="ml-auto">10 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please provide detailed information about your medical history. This helps us provide safe and effective treatment.
          </p>
        </CardHeader>
      </Card>

      {/* Critical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical Medical Conditions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check any conditions that apply to you. These require special attention during treatment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalConditions.map((condition) => (
              <div key={condition.key} className="flex items-center space-x-2">
                <Checkbox
                  id={condition.key}
                  checked={
                    condition.key === 'cancer' || condition.key === 'diabetes'
                      ? (formData.criticalConditions[condition.key as keyof typeof formData.criticalConditions] as any)?.has || false
                      : formData.criticalConditions[condition.key as keyof typeof formData.criticalConditions] as boolean || false
                  }
                  onCheckedChange={(checked) => handleCriticalConditionChange(condition.key, checked as boolean)}
                />
                <Label htmlFor={condition.key} className={`text-sm ${condition.critical ? 'font-semibold text-red-700' : ''}`}>
                  {condition.label}
                  {condition.critical && <span className="text-red-500 ml-1">⚠️</span>}
                </Label>
              </div>
            ))}
          </div>

          {/* Cancer Type */}
          {formData.criticalConditions.cancer?.has && (
            <div className="mt-4">
              <Label htmlFor="cancerType" className="text-sm font-semibold">
                Type of Cancer
              </Label>
              <Input
                id="cancerType"
                value={formData.criticalConditions.cancer.type || ''}
                onChange={(e) => onNestedInputChange('criticalConditions', 'cancer', { 
                  has: true, 
                  type: e.target.value 
                })}
                placeholder="Please specify the type of cancer"
              />
            </div>
          )}

          {/* Diabetes Type */}
          {formData.criticalConditions.diabetes?.has && (
            <div className="mt-4">
              <Label htmlFor="diabetesType" className="text-sm font-semibold">
                Type of Diabetes
              </Label>
              <Select 
                value={formData.criticalConditions.diabetes.type || ''} 
                onValueChange={(value) => onNestedInputChange('criticalConditions', 'diabetes', { 
                  has: true, 
                  type: value as '1' | '2'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select diabetes type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Type 1</SelectItem>
                  <SelectItem value="2">Type 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Other Conditions */}
          <div>
            <Label htmlFor="otherCritical" className="text-sm font-semibold">
              Other Critical Conditions
            </Label>
            <Input
              id="otherCritical"
              value={formData.criticalConditions.other || ''}
              onChange={(e) => onNestedInputChange('criticalConditions', 'other', e.target.value)}
              placeholder="Please specify any other critical medical conditions"
            />
          </div>

          {/* None Checkbox */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="noCriticalConditions"
              checked={formData.criticalConditions.none}
              onCheckedChange={(checked) => handleCriticalConditionChange('none', checked as boolean)}
            />
            <Label htmlFor="noCriticalConditions" className="text-sm font-medium">
              None of the above apply to me
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* System-Specific Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-600" />
            System-Specific Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Respiratory */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-3 w-3 text-blue-600" />
              </div>
              Respiratory System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {systemConditions.respiratory.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`respiratory-${condition}`}
                    checked={formData.systemSpecific.respiratory?.includes(condition) || false}
                    onCheckedChange={(checked) => handleSystemConditionChange('respiratory', condition, checked as boolean)}
                  />
                  <Label htmlFor={`respiratory-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cardiovascular */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="h-3 w-3 text-red-600" />
              </div>
              Cardiovascular System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {systemConditions.cardiovascular.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cardiovascular-${condition}`}
                    checked={formData.systemSpecific.cardiovascular?.includes(condition) || false}
                    onCheckedChange={(checked) => handleSystemConditionChange('cardiovascular', condition, checked as boolean)}
                  />
                  <Label htmlFor={`cardiovascular-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Gastrointestinal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="h-3 w-3 text-green-600" />
              </div>
              Gastrointestinal System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {systemConditions.gastrointestinal.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gastrointestinal-${condition}`}
                    checked={formData.systemSpecific.gastrointestinal?.includes(condition) || false}
                    onCheckedChange={(checked) => handleSystemConditionChange('gastrointestinal', condition, checked as boolean)}
                  />
                  <Label htmlFor={`gastrointestinal-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Neurological */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="h-3 w-3 text-purple-600" />
              </div>
              Neurological System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {systemConditions.neurological.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`neurological-${condition}`}
                    checked={formData.systemSpecific.neurological?.includes(condition) || false}
                    onCheckedChange={(checked) => handleSystemConditionChange('neurological', condition, checked as boolean)}
                  />
                  <Label htmlFor={`neurological-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Endocrine/Renal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 text-yellow-600" />
              </div>
              Endocrine & Renal System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {systemConditions.endocrineRenal.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`endocrineRenal-${condition}`}
                    checked={formData.systemSpecific.endocrineRenal?.includes(condition) || false}
                    onCheckedChange={(checked) => handleSystemConditionChange('endocrineRenal', condition, checked as boolean)}
                  />
                  <Label htmlFor={`endocrineRenal-${condition}`} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Additional Medical Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {additionalConditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`additional-${condition}`}
                  checked={formData.additionalConditions?.includes(condition) || false}
                  onCheckedChange={(checked) => handleAdditionalConditionChange(condition, checked as boolean)}
                />
                <Label htmlFor={`additional-${condition}`} className="text-sm">
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Health Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Health Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasRecentChanges"
              checked={formData.recentHealthChanges.hasChanges}
              onCheckedChange={(checked) => onNestedInputChange('recentHealthChanges', 'hasChanges', checked)}
            />
            <Label htmlFor="hasRecentChanges" className="text-sm font-medium">
              I have experienced recent changes in my health
            </Label>
          </div>

          {formData.recentHealthChanges.hasChanges && (
            <div>
              <Label htmlFor="healthChangesDescription" className="text-sm font-semibold">
                Please describe the recent health changes
              </Label>
              <Textarea
                id="healthChangesDescription"
                value={formData.recentHealthChanges.description || ''}
                onChange={(e) => onNestedInputChange('recentHealthChanges', 'description', e.target.value)}
                placeholder="Please provide details about recent changes in your health..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alert */}
      {(formData.criticalConditions.cancer?.has || 
        formData.criticalConditions.diabetes?.has || 
        formData.criticalConditions.heartDisease ||
        formData.criticalConditions.substanceAbuse) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Important:</strong> You have indicated critical medical conditions that require special attention. 
            Our medical team will review this information carefully to ensure your safety during treatment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
