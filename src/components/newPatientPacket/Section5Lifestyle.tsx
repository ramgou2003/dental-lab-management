import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Baby, Cigarette, Wine, AlertTriangle, Info } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section5LifestyleProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
  patientGender?: string;
}

export function Section5Lifestyle({ formData, onInputChange, onNestedInputChange, patientGender }: Section5LifestyleProps) {
  
  // Calculate age from date of birth to determine if pregnancy questions should be shown
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);
  
  // Show pregnancy questions for females between 13 and 50
  const showPregnancyQuestions = patientGender?.toLowerCase() === 'female' && age >= 13 && age <= 50;

  // Smoking status options
  const tobaccoOptions = [
    { value: 'none', label: 'None' },
    { value: 'few-cigarettes', label: 'Few cigarettes per day (1-5)' },
    { value: 'half-pack', label: 'Half pack per day (10 cigarettes)' },
    { value: 'one-pack', label: 'One pack per day (20 cigarettes)' },
    { value: 'more-than-pack', label: 'More than one pack per day' },
    { value: 'vaping', label: 'Vaping' },
    { value: 'recreational-marijuana', label: 'Recreational marijuana' },
    { value: 'medicinal-marijuana', label: 'Medicinal marijuana' }
  ];

  // Duration options
  const durationOptions = [
    { value: 'less-than-1', label: 'Less than 1 year' },
    { value: '1-year', label: '1 year' },
    { value: '2-years', label: '2 years' },
    { value: '3-years', label: '3 years' },
    { value: '4-years', label: '4 years' },
    { value: '5-years', label: '5 years' },
    { value: '5-plus-years', label: '5+ years' }
  ];

  // Alcohol consumption options
  const alcoholOptions = [
    { value: 'none', label: 'None' },
    { value: 'casual', label: 'Casual (1-2 drinks per week)' },
    { value: 'regular', label: 'Regular (3-7 drinks per week)' },
    { value: 'heavy', label: 'Heavy (8+ drinks per week)' }
  ];

  // Alcohol duration options (same as tobacco for consistency)
  const alcoholDurationOptions = [
    { value: 'less-than-1', label: 'Less than 1 year' },
    { value: '1-year', label: '1 year' },
    { value: '2-years', label: '2 years' },
    { value: '3-years', label: '3 years' },
    { value: '4-years', label: '4 years' },
    { value: '5-years', label: '5 years' },
    { value: '5-plus-years', label: '5+ years' }
  ];

  // Check if smoking status requires duration
  const showTobaccoDuration = formData.tobaccoUse.type !== 'none';

  // Check if alcohol consumption requires duration
  const showAlcoholDuration = formData.alcoholConsumption.frequency !== 'none';

  // Check for concerning lifestyle factors
  const hasConcerningFactors =
    formData.tobaccoUse.type !== 'none' ||
    formData.alcoholConsumption.frequency === 'heavy' ||
    formData.pregnancy.status === 'pregnant';

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Home className="h-5 w-5 text-purple-600" />
            </div>
            Lifestyle Factors
            <Badge variant="secondary" className="ml-auto">3 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please provide information about lifestyle factors that may affect your dental treatment.
          </p>
        </CardHeader>
      </Card>

      {/* Pregnancy Status (for applicable patients) */}
      {showPregnancyQuestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Baby className="h-5 w-5 text-pink-600" />
              Pregnancy Status
            </CardTitle>
            <p className="text-sm text-gray-600">
              This information is important for safe treatment planning.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pregnancyStatus" className="text-sm font-semibold">
                Current Status
              </Label>
              <Select 
                value={formData.pregnancy.status} 
                onValueChange={(value) => onNestedInputChange('pregnancy', 'status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pregnancy status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-applicable">Not applicable</SelectItem>
                  <SelectItem value="pregnant">Currently pregnant</SelectItem>
                  <SelectItem value="nursing">Currently nursing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.pregnancy.status === 'pregnant' && (
              <div>
                <Label htmlFor="pregnancyWeeks" className="text-sm font-semibold">
                  How many weeks pregnant?
                </Label>
                <Input
                  id="pregnancyWeeks"
                  type="number"
                  value={formData.pregnancy.weeks || ''}
                  onChange={(e) => onNestedInputChange('pregnancy', 'weeks', parseInt(e.target.value) || 0)}
                  placeholder="Enter number of weeks"
                  min="1"
                  max="42"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Smoking Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cigarette className="h-5 w-5 text-orange-600" />
            Smoking Status
          </CardTitle>
          <p className="text-sm text-gray-600">
            Smoking can significantly affect healing and treatment outcomes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Do you smoke?
            </Label>
            <div className="flex gap-2">
              <div
                className={`flex items-center justify-center px-3 py-2 rounded-md border-2 cursor-pointer transition-all duration-200 text-sm ${
                  formData.tobaccoUse.type === 'none'
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => {
                  onNestedInputChange('tobaccoUse', 'type', 'none');
                  onNestedInputChange('tobaccoUse', 'duration', undefined);
                }}
              >
                No
              </div>
              <div
                className={`flex items-center justify-center px-3 py-2 rounded-md border-2 cursor-pointer transition-all duration-200 text-sm ${
                  formData.tobaccoUse.type !== 'none'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // If switching from no to yes, set to empty string to show type selection
                  if (formData.tobaccoUse.type === 'none') {
                    onNestedInputChange('tobaccoUse', 'type', '');
                  }
                }}
              >
                Yes
              </div>
            </div>
          </div>

          {formData.tobaccoUse.type !== 'none' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tobaccoType" className="text-sm font-semibold">
                  Type and Amount of Smoking
                </Label>
                <Select
                  value={formData.tobaccoUse.type}
                  onValueChange={(value) => onNestedInputChange('tobaccoUse', 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type and amount" />
                  </SelectTrigger>
                  <SelectContent>
                    {tobaccoOptions.filter(option => option.value !== 'none').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showTobaccoDuration && (
                <div>
                  <Label htmlFor="tobaccoDuration" className="text-sm font-semibold">
                    How long have you been smoking?
                  </Label>
                  <Select
                    value={formData.tobaccoUse.duration || ''}
                    onValueChange={(value) => onNestedInputChange('tobaccoUse', 'duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alcohol Consumption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wine className="h-5 w-5 text-purple-600" />
            Alcohol Consumption
          </CardTitle>
          <p className="text-sm text-gray-600">
            Alcohol consumption can affect medication interactions and healing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Do you drink alcohol?
            </Label>
            <div className="flex gap-2">
              <div
                className={`flex items-center justify-center px-3 py-2 rounded-md border-2 cursor-pointer transition-all duration-200 text-sm ${
                  formData.alcoholConsumption.frequency === 'none'
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => {
                  onNestedInputChange('alcoholConsumption', 'frequency', 'none');
                  onNestedInputChange('alcoholConsumption', 'duration', undefined);
                }}
              >
                No
              </div>
              <div
                className={`flex items-center justify-center px-3 py-2 rounded-md border-2 cursor-pointer transition-all duration-200 text-sm ${
                  formData.alcoholConsumption.frequency !== 'none'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // If switching from no to yes, set to empty string to show frequency selection
                  if (formData.alcoholConsumption.frequency === 'none') {
                    onNestedInputChange('alcoholConsumption', 'frequency', '');
                  }
                }}
              >
                Yes
              </div>
            </div>
          </div>

          {formData.alcoholConsumption.frequency !== 'none' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alcoholFrequency" className="text-sm font-semibold">
                  Frequency of Alcohol Consumption
                </Label>
                <Select
                  value={formData.alcoholConsumption.frequency}
                  onValueChange={(value) => onNestedInputChange('alcoholConsumption', 'frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alcohol consumption frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {alcoholOptions.filter(option => option.value !== 'none').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showAlcoholDuration && (
                <div>
                  <Label htmlFor="alcoholDuration" className="text-sm font-semibold">
                    How long have you been drinking alcohol regularly?
                  </Label>
                  <Select
                    value={formData.alcoholConsumption.duration || ''}
                    onValueChange={(value) => onNestedInputChange('alcoholConsumption', 'duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {alcoholDurationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifestyle Alerts */}
      {formData.pregnancy.status === 'pregnant' && (
        <Alert className="border-pink-200 bg-pink-50">
          <Baby className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-pink-800">
            <strong>Pregnancy Considerations:</strong> We will take special precautions during your treatment 
            to ensure the safety of both you and your baby. Some procedures may be postponed until after delivery.
          </AlertDescription>
        </Alert>
      )}

      {formData.pregnancy.status === 'nursing' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Baby className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Nursing Considerations:</strong> We will carefully select medications that are safe 
            during nursing and discuss any necessary precautions.
          </AlertDescription>
        </Alert>
      )}

      {formData.tobaccoUse.type !== 'none' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Cigarette className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Tobacco Use Impact:</strong> Tobacco use can significantly affect healing after dental procedures 
            and increase the risk of complications. We strongly recommend cessation and can provide resources to help.
          </AlertDescription>
        </Alert>
      )}

      {formData.alcoholConsumption === 'heavy' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Alcohol Interaction Warning:</strong> Heavy alcohol consumption can interact with medications 
            and affect healing. Please inform us of any alcohol consumption before procedures.
          </AlertDescription>
        </Alert>
      )}

      {/* General Information */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Confidential Information:</strong> All lifestyle information is kept strictly confidential 
          and is used solely for providing you with the safest and most effective dental care.
        </AlertDescription>
      </Alert>
    </div>
  );
}
