import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "./PhoneInput";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

export function EditPatientForm({ patient, onSubmit }: EditPatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    gender: 'male'
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing patient data
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        dateOfBirth: patient.date_of_birth || '',
        phone: patient.phone || '',
        street: patient.street || '',
        city: patient.city || '',
        state: patient.state || '',
        zipCode: patient.zip_code || '',
        gender: patient.gender || 'male'
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
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone || null,
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        gender: formData.gender,
        updated_at: new Date().toISOString()
      };

      console.log('Updating patient with data:', updateData);
      console.log('Patient ID:', patient.id);

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        toast.error(`Failed to update patient: ${error.message}`);
        return;
      }

      toast.success("Patient updated successfully");

      onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      console.error('Caught error details:', error);
      toast.error(`Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="w-full max-w-2xl mx-auto">
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
            <Label className="text-base font-medium">Gender</Label>
            <div className="flex gap-4 mt-2">
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-colors ${
                  formData.gender === 'male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                onClick={() => handleInputChange('gender', 'male')}
              >
                <span className="font-medium">Male</span>
              </div>
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-md border-2 cursor-pointer transition-colors ${
                  formData.gender === 'female'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                onClick={() => handleInputChange('gender', 'female')}
              >
                <span className="font-medium">Female</span>
              </div>
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

          <AddressAutocomplete
            street={formData.street}
            city={formData.city}
            state={formData.state}
            zipCode={formData.zipCode}
            onAddressChange={handleInputChange}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Patient"}
            </Button>
          </div>
      </form>
    </div>
  );
}
