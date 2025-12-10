
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "./PhoneInput";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewPatientFormProps {
  onSubmit: (patientData: any) => void;
  onCancel: () => void;
}

export function NewPatientForm({ onSubmit, onCancel }: NewPatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    chartNumber: '',
    gender: 'male',
    status: 'ACTIVE',
    treatmentStatus: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      firstName: !formData.firstName.trim(),
      lastName: !formData.lastName.trim(),
      dateOfBirth: !formData.dateOfBirth.trim()
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (newErrors.firstName || newErrors.lastName || newErrors.dateOfBirth) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const patientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone || null,
        email: formData.email || null,
        gender: formData.gender,
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        chart_number: formData.chartNumber || null,
        status: formData.status,
        treatment_status: formData.treatmentStatus || null,
        patient_source: 'Direct',
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        emergency_contact_relationship: formData.emergencyContactRelationship || null
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        toast.error("Failed to create patient");
        return;
      }

      toast.success("Patient created successfully");

      onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to create patient");
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
        <CardTitle className="text-blue-600">Add New Patient</CardTitle>
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

          <div className="col-span-2">
            <Label htmlFor="chartNumber">
              Chart Number
            </Label>
            <Input
              id="chartNumber"
              value={formData.chartNumber}
              onChange={(e) => handleInputChange('chartNumber', e.target.value)}
              placeholder="Enter chart number"
            />
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

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="patient@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <AddressAutocomplete
            street={formData.street}
            city={formData.city}
            state={formData.state}
            zipCode={formData.zipCode}
            onAddressChange={handleInputChange}
          />

          {/* Emergency Contact Section */}
          <div className="col-span-2 mt-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Emergency contact name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone No</Label>
                  <PhoneInput
                    value={formData.emergencyContactPhone}
                    onChange={(value) => handleInputChange('emergencyContactPhone', value)}
                    hideLabel={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <Label htmlFor="treatmentStatus">
              Treatment Status (Optional)
            </Label>
            <Select
              value={formData.treatmentStatus}
              onValueChange={(value) => handleInputChange('treatmentStatus', value)}
            >
              <SelectTrigger id="treatmentStatus">
                <SelectValue placeholder="Select treatment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Treatment Not Started">Treatment Not Started</SelectItem>
                <SelectItem value="Treatment In Progress">Treatment In Progress</SelectItem>
                <SelectItem value="Treatment Completed">Treatment Completed</SelectItem>
                <SelectItem value="Patient Deceased">Patient Deceased</SelectItem>
                <SelectItem value="Dismissed DNC">Dismissed DNC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isSubmitting}>
              {isSubmitting ? "Adding Patient..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
