import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smile, Heart, MessageCircle, Eye, User, Star, Info } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section6ComfortProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section6Comfort({ formData, onInputChange, onNestedInputChange }: Section6ComfortProps) {
  
  // Anxiety control preferences
  const anxietyControlOptions = [
    'I gag easily during dental procedures',
    'I feel out of control during treatment',
    'I need to know what\'s happening at all times',
    'I prefer sedation for anxiety',
    'I need frequent breaks during treatment',
    'I have had traumatic dental experiences',
    'I prefer nitrous oxide (laughing gas)',
    'I need someone to hold my hand'
  ];

  // Pain and injection preferences
  const painInjectionOptions = [
    'Pain relief is my top priority',
    'I don\'t like shots/injections',
    'I prefer topical numbing before injections',
    'I need extra numbing medication',
    'I prefer to avoid pain medication if possible',
    'I have a high pain tolerance',
    'I prefer alternative pain management',
    'I need to discuss pain management options'
  ];

  // Communication preferences
  const communicationOptions = [
    'I need detailed explanations of procedures',
    'I have difficulty remembering instructions',
    'I prefer written instructions',
    'I need a translator/interpreter',
    'I prefer simple, non-technical explanations',
    'I want to see X-rays and photos',
    'I need extra time to process information',
    'I prefer to have a family member present'
  ];

  // Sensory sensitivities
  const sensorySensitivitiesOptions = [
    'I don\'t like the sound of dental drills',
    'I\'m sensitive to bright lights',
    'I don\'t like the smell of dental materials',
    'I\'m sensitive to taste of dental materials',
    'I need music or headphones during treatment',
    'I prefer dimmed lighting',
    'I need sunglasses during treatment',
    'I\'m sensitive to vibrations'
  ];

  // Physical comfort needs
  const physicalComfortOptions = [
    'I have back problems and need support',
    'I have neck problems',
    'I need frequent position changes',
    'I have trouble keeping my mouth open',
    'I need a pillow or cushion',
    'I have joint problems',
    'I need assistance getting in/out of chair',
    'I have mobility limitations'
  ];

  // Service preferences
  const servicePreferencesOptions = [
    'Respect for my time is important',
    'I want cost transparency upfront',
    'I prefer appointment reminders',
    'I want treatment options explained',
    'I prefer conservative treatment approaches',
    'I want to be involved in treatment decisions',
    'I prefer same-day treatment when possible',
    'I need flexible scheduling'
  ];

  const handlePreferenceChange = (category: string, preference: string, checked: boolean) => {
    const currentPreferences = formData[category as keyof NewPatientFormData] as string[] || [];
    let newPreferences;
    
    if (checked) {
      newPreferences = [...currentPreferences, preference];
    } else {
      newPreferences = currentPreferences.filter(p => p !== preference);
    }
    
    onInputChange(category, newPreferences);
  };

  // Check for special needs
  const hasSpecialNeeds = 
    formData.anxietyControl?.length > 0 ||
    formData.sensorySensitivities?.length > 0 ||
    formData.physicalComfort?.length > 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-pink-200 bg-pink-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Smile className="h-5 w-5 text-pink-600" />
            </div>
            Patient Comfort Preferences
            <Badge variant="secondary" className="ml-auto">5 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Help us provide the most comfortable experience by sharing your preferences and concerns.
          </p>
        </CardHeader>
      </Card>

      {/* Anxiety Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-red-600" />
            Anxiety Control
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check any anxiety-related concerns or preferences you have.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {anxietyControlOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`anxiety-${option}`}
                  checked={formData.anxietyControl?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('anxietyControl', option, checked as boolean)}
                />
                <Label htmlFor={`anxiety-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pain and Injection Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-orange-600" />
            Pain Management & Injection Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us understand your pain management preferences and concerns.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {painInjectionOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`pain-${option}`}
                  checked={formData.painInjection?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('painInjection', option, checked as boolean)}
                />
                <Label htmlFor={`pain-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Communication Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            Let us know how you prefer to receive and process information.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {communicationOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`communication-${option}`}
                  checked={formData.communication?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('communication', option, checked as boolean)}
                />
                <Label htmlFor={`communication-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensory Sensitivities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-purple-600" />
            Sensory Sensitivities
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please let us know about any sensitivities to sounds, lights, smells, or other sensory experiences.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sensorySensitivitiesOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`sensory-${option}`}
                  checked={formData.sensorySensitivities?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('sensorySensitivities', option, checked as boolean)}
                />
                <Label htmlFor={`sensory-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Physical Comfort */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-green-600" />
            Physical Comfort Needs
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check any physical comfort needs or limitations you have.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {physicalComfortOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`physical-${option}`}
                  checked={formData.physicalComfort?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('physicalComfort', option, checked as boolean)}
                />
                <Label htmlFor={`physical-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-indigo-600" />
            Service Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us understand your preferences for how we provide our services.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {servicePreferencesOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${option}`}
                  checked={formData.servicePreferences?.includes(option) || false}
                  onCheckedChange={(checked) => handlePreferenceChange('servicePreferences', option, checked as boolean)}
                />
                <Label htmlFor={`service-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Concerns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            Additional Concerns or Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="otherConcerns" className="text-sm font-semibold">
              Please describe any other concerns, preferences, or special needs
            </Label>
            <Textarea
              id="otherConcerns"
              value={formData.otherConcerns || ''}
              onChange={(e) => onInputChange('otherConcerns', e.target.value)}
              placeholder="Please share any additional information that would help us provide better care..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Needs Alert */}
      {hasSpecialNeeds && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Personalized Care Plan:</strong> Based on your preferences, we will create a customized 
            approach to ensure your comfort during treatment. Our team will review these preferences before your visit.
          </AlertDescription>
        </Alert>
      )}

      {/* Anxiety Support */}
      {formData.anxietyControl?.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <Heart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Anxiety Support:</strong> We understand dental anxiety and have many options to help you feel 
            comfortable, including sedation options, relaxation techniques, and taking breaks as needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Communication Support */}
      {formData.communication?.some(pref => pref.includes('translator') || pref.includes('difficulty remembering')) && (
        <Alert className="border-purple-200 bg-purple-50">
          <MessageCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Communication Support:</strong> We will ensure clear communication and provide additional 
            support as needed, including written instructions and extra time for explanations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
