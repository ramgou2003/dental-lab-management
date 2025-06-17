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
  treatment_type: string | null;
  status: string;
  last_visit: string | null;
  next_appointment: string | null;
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
    treatmentType: '',
    lastVisit: '',
    nextAppointment: '',
    status: 'Treatment not started',
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
  const { toast } = useToast();

  // Populate form with existing patient data
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        dateOfBirth: patient.date_of_birth || '',
        phone: patient.phone || '',
        treatmentType: patient.treatment_type || '',
        lastVisit: patient.last_visit || '',
        nextAppointment: patient.next_appointment || '',
        status: patient.status || 'Treatment not started',
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
          treatment_type: formData.treatmentType || null,
          last_visit: formData.lastVisit || null,
          next_appointment: formData.nextAppointment || null,
          status: formData.status,
          street: formData.street || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          gender: formData.gender,
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
            <Label htmlFor="treatmentType">Treatment Type</Label>
            <Select value={formData.treatmentType} onValueChange={(value) => handleInputChange('treatmentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restorative">Restorative</SelectItem>
                <SelectItem value="Cosmetic">Cosmetic</SelectItem>
                <SelectItem value="Orthodontics">Orthodontics</SelectItem>
                <SelectItem value="Periodontal">Periodontal</SelectItem>
                <SelectItem value="Oral Surgery">Oral Surgery</SelectItem>
                <SelectItem value="Preventive">Preventive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastVisit">Last Visit</Label>
              <Input
                id="lastVisit"
                type="date"
                value={formData.lastVisit}
                onChange={(e) => handleInputChange('lastVisit', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nextAppointment">Next Appointment</Label>
              <Input
                id="nextAppointment"
                type="date"
                value={formData.nextAppointment}
                onChange={(e) => handleInputChange('nextAppointment', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Treatment not started">Treatment Not Started</SelectItem>
                <SelectItem value="Treatment in progress">Treatment In Progress</SelectItem>
                <SelectItem value="Treatment completed">Treatment Completed</SelectItem>
                <SelectItem value="Patient deceased">Patient Deceased</SelectItem>
              </SelectContent>
            </Select>
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
