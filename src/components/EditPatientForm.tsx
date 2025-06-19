import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "./PhoneInput";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  gender: string | null;
  date_of_birth: string;
  status: string | null;
  treatment_type: string | null;
  upper_arch: boolean | null;
  lower_arch: boolean | null;
  upper_treatment: string | null;
  lower_treatment: string | null;
  upper_surgery_date: string | null;
  lower_surgery_date: string | null;
  profile_picture?: string | null;
}

interface EditPatientFormProps {
  patient: Patient;
  onSubmit: (patientData: any) => void;
  onCancel: () => void;
}

export function EditPatientForm({ patient, onSubmit, onCancel }: EditPatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    status: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    gender: 'male',
    treatmentType: '',
    upperArch: false,
    lowerArch: false
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Populate form with existing patient data
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        dateOfBirth: patient.date_of_birth || '',
        phone: patient.phone || '',
        status: patient.status || '',
        street: patient.street || '',
        city: patient.city || '',
        state: patient.state || '',
        zipCode: patient.zip_code || '',
        gender: patient.gender || 'male',
        treatmentType: patient.treatment_type || '',
        upperArch: patient.upper_arch || false,
        lowerArch: patient.lower_arch || false
      });
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors = {
      firstName: !formData.firstName.trim(),
      lastName: !formData.lastName.trim(),
      dateOfBirth: !formData.dateOfBirth
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          date_of_birth: formData.dateOfBirth,
          phone: formData.phone || null,
          status: formData.status || null,
          street: formData.street || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          gender: formData.gender,
          treatment_type: formData.treatmentType || null,
          upper_arch: formData.upperArch,
          lower_arch: formData.lowerArch,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        toast({
          title: "Error",
          description: "Failed to update patient",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Patient updated successfully",
      });

      onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing in a required field
    if (field === 'firstName' || field === 'lastName' || field === 'dateOfBirth') {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Patient Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className={errors.firstName ? "text-red-500" : ""}>
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
            <div>
              <Label htmlFor="lastName" className={errors.lastName ? "text-red-500" : ""}>
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className={errors.dateOfBirth ? "text-red-500" : ""}>
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
          </div>

          <PhoneInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
          />

          <div>
            <Label>Gender</Label>
            <RadioGroup 
              value={formData.gender} 
              onValueChange={(value) => handleInputChange('gender', value)}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <AddressAutocomplete
            street={formData.street}
            city={formData.city}
            state={formData.state}
            zipCode={formData.zipCode}
            onAddressChange={(address) => {
              handleInputChange('street', address.street);
              handleInputChange('city', address.city);
              handleInputChange('state', address.state);
              handleInputChange('zipCode', address.zipCode);
            }}
          />



          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Status Set</SelectItem>
                <SelectItem value="New patient">New Patient</SelectItem>
                <SelectItem value="Treatment not started">Treatment Not Started</SelectItem>
                <SelectItem value="Treatment in progress">Treatment In Progress</SelectItem>
                <SelectItem value="Treatment completed">Treatment Completed</SelectItem>
                <SelectItem value="Patient deceased">Patient Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Treatment Information Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Treatment Information</h3>

            <div>
              <Label htmlFor="treatmentType">Treatment Type</Label>
              <Select value={formData.treatmentType} onValueChange={(value) => handleInputChange('treatmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Treatment Type</SelectItem>
                  <SelectItem value="Orthodontics">Orthodontics</SelectItem>
                  <SelectItem value="Dental Cleaning">Dental Cleaning</SelectItem>
                  <SelectItem value="Root Canal">Root Canal</SelectItem>
                  <SelectItem value="Dental Implant">Dental Implant</SelectItem>
                  <SelectItem value="Teeth Whitening">Teeth Whitening</SelectItem>
                  <SelectItem value="Periodontal Treatment">Periodontal Treatment</SelectItem>
                  <SelectItem value="Crown Replacement">Crown Replacement</SelectItem>
                  <SelectItem value="Wisdom Tooth Extraction">Wisdom Tooth Extraction</SelectItem>
                  <SelectItem value="Dental Bridge">Dental Bridge</SelectItem>
                  <SelectItem value="Cavity Filling">Cavity Filling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Arch Selection</Label>
              <div className="flex space-x-4 mt-2">
                <div
                  className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-colors ${
                    formData.upperArch
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('upperArch', !formData.upperArch)}
                >
                  <input
                    type="checkbox"
                    checked={formData.upperArch}
                    onChange={(e) => handleInputChange('upperArch', e.target.checked)}
                    className="sr-only"
                  />
                  <span className="font-medium">Upper</span>
                </div>

                <div
                  className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-colors ${
                    formData.lowerArch
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('lowerArch', !formData.lowerArch)}
                >
                  <input
                    type="checkbox"
                    checked={formData.lowerArch}
                    onChange={(e) => handleInputChange('lowerArch', e.target.checked)}
                    className="sr-only"
                  />
                  <span className="font-medium">Lower</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
