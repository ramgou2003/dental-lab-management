import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleCheckbox } from "@/components/SimpleCheckbox";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Heart, AlertCircle } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section1PatientInfoProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section1PatientInfo({ formData, onInputChange, onNestedInputChange }: Section1PatientInfoProps) {

  // Calculate BMI with specific values
  const calculateBMI = (heightFeet?: string, heightInches?: string, weight?: string) => {
    const feet = parseFloat(heightFeet || formData.height?.feet || '0');
    const inches = parseFloat(heightInches || formData.height?.inches || '0');
    const weightInPounds = parseFloat(weight || formData.weight || '0');
    const totalHeightInInches = (feet * 12) + inches;

    if (totalHeightInInches > 0 && weightInPounds > 0 && !isNaN(totalHeightInInches) && !isNaN(weightInPounds)) {
      const bmi = (weightInPounds / (totalHeightInInches * totalHeightInInches)) * 703;
      onInputChange('bmi', Math.round(bmi * 10) / 10);
    } else {
      // Clear BMI if inputs are invalid or empty
      onInputChange('bmi', undefined);
    }
  };

  // Format US phone number as (XXX) XXX-XXXX
  const formatUSPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format based on length
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleHeightFeetChange = (value: string) => {
    onNestedInputChange('height', 'feet', value);
    // Calculate BMI with the new feet value
    calculateBMI(value, formData.height?.inches, formData.weight);
  };

  const handleHeightInchesChange = (value: string) => {
    onNestedInputChange('height', 'inches', value);
    // Calculate BMI with the new inches value
    calculateBMI(formData.height?.feet, value, formData.weight);
  };

  const handleWeightChange = (value: string) => {
    onInputChange('weight', value);
    // Calculate BMI with the new weight value
    calculateBMI(formData.height?.feet, formData.height?.inches, value);
  };

  // Recalculate BMI when form data changes (for cases like loading saved data)
  useEffect(() => {
    if (formData.height?.feet && formData.height?.inches && formData.weight) {
      calculateBMI();
    }
  }, [formData.height?.feet, formData.height?.inches, formData.weight]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Patient Identification & Contact Information
            <Badge variant="secondary" className="ml-auto">5 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please provide your basic information and emergency contact details.
          </p>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-semibold">
                <span className="text-red-500">*</span> First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => onInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => onInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gender" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Gender
              </Label>
              <Select value={formData.gender} onValueChange={(value) => onInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth ?
                  (formData.dateOfBirth instanceof Date ?
                    formData.dateOfBirth.toISOString().split('T')[0] :
                    formData.dateOfBirth) :
                  ''}
                onChange={(e) => onInputChange('dateOfBirth', new Date(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold">
                Height (feet and inches)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    id="heightFeet"
                    type="number"
                    value={formData.height?.feet || ''}
                    onChange={(e) => handleHeightFeetChange(e.target.value)}
                    placeholder="Feet"
                    min="3"
                    max="8"
                  />
                  <Label htmlFor="heightFeet" className="text-xs text-gray-500 mt-1 block">
                    Feet
                  </Label>
                </div>
                <div>
                  <Input
                    id="heightInches"
                    type="number"
                    value={formData.height?.inches || ''}
                    onChange={(e) => handleHeightInchesChange(e.target.value)}
                    placeholder="Inches"
                    min="0"
                    max="11"
                  />
                  <Label htmlFor="heightInches" className="text-xs text-gray-500 mt-1 block">
                    Inches
                  </Label>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm font-semibold">
                Weight (lbs)
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="e.g., 150"
                min="50"
                max="500"
              />
            </div>
            <div>
              <Label htmlFor="bmi" className="text-sm font-semibold">
                BMI (calculated)
              </Label>
              <Input
                id="bmi"
                value={formData.bmi != null ? formData.bmi.toString() : ''}
                readOnly
                className="bg-gray-50"
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-blue-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cellPhone" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Cell Phone
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium">
                  🇺🇸 +1
                </div>
                <Input
                  id="cellPhone"
                  type="tel"
                  value={formData.phone.cell}
                  onChange={(e) => {
                    const formatted = formatUSPhoneNumber(e.target.value);
                    onNestedInputChange('phone', 'cell', formatted);
                  }}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="workPhone" className="text-sm font-semibold">
                Work Phone
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium">
                  🇺🇸 +1
                </div>
                <Input
                  id="workPhone"
                  type="tel"
                  value={formData.phone.work || ''}
                  onChange={(e) => {
                    const formatted = formatUSPhoneNumber(e.target.value);
                    onNestedInputChange('phone', 'work', formatted);
                  }}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street" className="text-sm font-semibold">
              <span className="text-red-500">*</span> Street Address
            </Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={(e) => onNestedInputChange('address', 'street', e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-semibold">
                <span className="text-red-500">*</span> City
              </Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => onNestedInputChange('address', 'city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-sm font-semibold">
                <span className="text-red-500">*</span> State
              </Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => onNestedInputChange('address', 'state', e.target.value)}
                placeholder="NY"
                required
              />
            </div>
            <div>
              <Label htmlFor="zip" className="text-sm font-semibold">
                <span className="text-red-500">*</span> ZIP Code
              </Label>
              <Input
                id="zip"
                value={formData.address.zip}
                onChange={(e) => onNestedInputChange('address', 'zip', e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergencyName" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Full Name
              </Label>
              <Input
                id="emergencyName"
                value={formData.emergencyContact.name}
                onChange={(e) => onNestedInputChange('emergencyContact', 'name', e.target.value)}
                placeholder="Emergency contact name"
                required
              />
            </div>
            <div>
              <Label htmlFor="emergencyRelationship" className="text-sm font-semibold">
                Relationship
              </Label>
              <Input
                id="emergencyRelationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) => onNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone" className="text-sm font-semibold">
                <span className="text-red-500">*</span> Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium">
                  🇺🇸 +1
                </div>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => {
                    const formatted = formatUSPhoneNumber(e.target.value);
                    onNestedInputChange('emergencyContact', 'phone', formatted);
                  }}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Care Physician */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-blue-600" />
            Primary Care Physician
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Do you have a primary care physician?
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNestedInputChange('primaryCarePhysician', 'hasPCP', true)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${formData.primaryCarePhysician?.hasPCP === true
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onNestedInputChange('primaryCarePhysician', 'hasPCP', false)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${formData.primaryCarePhysician?.hasPCP === false
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                No
              </button>
            </div>
          </div>

          {formData.primaryCarePhysician?.hasPCP === true && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="pcpName" className="text-sm font-semibold">
                  Physician Name
                </Label>
                <Input
                  id="pcpName"
                  value={formData.primaryCarePhysician?.name || ''}
                  onChange={(e) => onNestedInputChange('primaryCarePhysician', 'name', e.target.value)}
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <Label htmlFor="pcpPractice" className="text-sm font-semibold">
                  Practice/Hospital
                </Label>
                <Input
                  id="pcpPractice"
                  value={formData.primaryCarePhysician?.practice || ''}
                  onChange={(e) => onNestedInputChange('primaryCarePhysician', 'practice', e.target.value)}
                  placeholder="Medical Center"
                />
              </div>
              <div>
                <Label htmlFor="pcpPhone" className="text-sm font-semibold">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium">
                    🇺🇸 +1
                  </div>
                  <Input
                    id="pcpPhone"
                    type="tel"
                    value={formData.primaryCarePhysician?.phone || ''}
                    onChange={(e) => {
                      const formatted = formatUSPhoneNumber(e.target.value);
                      onNestedInputChange('primaryCarePhysician', 'phone', formatted);
                    }}
                    placeholder="(555) 123-4567"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
