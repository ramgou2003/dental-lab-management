
import { useState } from "react";
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
    street: '',
    city: '',
    state: '',
    zipCode: '',
    gender: 'male',
    status: 'New patient'
  });

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    dateOfBirth: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
        gender: formData.gender,
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        status: formData.status
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        toast({
          title: "Error",
          description: "Failed to create patient",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Patient created successfully",
      });

      onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create patient",
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
        <CardTitle>Add New Patient</CardTitle>
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

          <AddressAutocomplete
            street={formData.street}
            city={formData.city}
            state={formData.state}
            zipCode={formData.zipCode}
            onAddressChange={handleInputChange}
          />

          <div>
            <Label className="text-base font-medium">Gender</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Adding Patient..." : "Add Patient"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
