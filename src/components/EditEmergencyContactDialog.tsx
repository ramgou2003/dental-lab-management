import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "./PhoneInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Patient {
  id: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
}

interface EditEmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onSuccess: (updatedPatient: Patient) => void;
}

export function EditEmergencyContactDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: EditEmergencyContactDialogProps) {
  const [formData, setFormData] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing patient data
  useEffect(() => {
    if (patient) {
      setFormData({
        emergencyContactName: patient.emergency_contact_name || '',
        emergencyContactPhone: patient.emergency_contact_phone || '',
        emergencyContactRelationship: patient.emergency_contact_relationship || ''
      });
    }
  }, [patient]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const updateData = {
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        emergency_contact_relationship: formData.emergencyContactRelationship || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating emergency contact:', error);
        toast.error("Failed to update emergency contact");
        return;
      }

      toast.success("Emergency contact updated successfully");
      onSuccess(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update emergency contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-blue-600">Edit Emergency Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone No</Label>
            <PhoneInput
              value={formData.emergencyContactPhone}
              onChange={(value) => handleInputChange('emergencyContactPhone', value)}
              hideLabel={true}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Emergency Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

