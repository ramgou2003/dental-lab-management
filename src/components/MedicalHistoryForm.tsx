import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { MedicalHistoryData, createMedicalHistory, updateMedicalHistory } from "@/services/medicalHistoryService";
import { Section2MedicalHistory } from "./newPatientPacket/Section2MedicalHistory";
import { Section3AllergiesMeds } from "./newPatientPacket/Section3AllergiesMeds";
import { Section6Comfort } from "./newPatientPacket/Section6Comfort";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface MedicalHistoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  existingData?: MedicalHistoryData | null;
  onSuccess?: () => void;
}

export function MedicalHistoryForm({ 
  open, 
  onOpenChange, 
  patientId, 
  existingData,
  onSuccess 
}: MedicalHistoryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("medical");

  // Initialize form data
  const [formData, setFormData] = useState<Partial<NewPatientFormData>>({
    // Medical History
    criticalConditions: {
      acidReflux: false,
      cancer: { has: false, type: '' },
      depressionAnxiety: false,
      diabetes: { has: false, type: undefined, a1cLevel: '' },
      heartDisease: false,
      periodontalDisease: false,
      substanceAbuse: false,
      highBloodPressure: false,
      other: '',
      none: false
    },
    systemSpecific: {
      respiratory: [],
      cardiovascular: [],
      gastrointestinal: [],
      neurological: [],
      endocrineRenal: []
    },
    additionalConditions: [],
    recentHealthChanges: {
      hasChanges: false,
      description: ''
    },
    
    // Allergies & Medications
    allergies: {
      dentalRelated: [],
      medications: [],
      other: [],
      food: '',
      none: false
    },
    currentMedications: {
      emergency: [],
      boneOsteoporosis: [],
      specialized: [],
      complete: '',
      none: false
    },
    currentPharmacy: {
      name: '',
      city: ''
    },
    
    // Comfort Preferences
    anxietyControl: [],
    painInjection: [],
    communication: [],
    sensorySensitivities: [],
    physicalComfort: [],
    servicePreferences: [],
    otherConcerns: ''
  });

  // Load existing data when dialog opens
  useEffect(() => {
    if (open && existingData) {
      setFormData({
        criticalConditions: existingData.critical_conditions || formData.criticalConditions,
        systemSpecific: existingData.system_specific || formData.systemSpecific,
        additionalConditions: existingData.additional_conditions || [],
        recentHealthChanges: existingData.recent_health_changes || formData.recentHealthChanges,
        allergies: existingData.allergies || formData.allergies,
        currentMedications: existingData.current_medications || formData.currentMedications,
        currentPharmacy: existingData.current_pharmacy || formData.currentPharmacy,
        anxietyControl: existingData.anxiety_control || [],
        painInjection: existingData.pain_injection || [],
        communication: existingData.communication || [],
        sensorySensitivities: existingData.sensory_sensitivities || [],
        physicalComfort: existingData.physical_comfort || [],
        servicePreferences: existingData.service_preferences || [],
        otherConcerns: existingData.other_concerns || ''
      });
    }
  }, [open, existingData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const medicalHistoryData: MedicalHistoryData = {
        patient_id: patientId,
        critical_conditions: formData.criticalConditions,
        system_specific: formData.systemSpecific,
        additional_conditions: formData.additionalConditions,
        recent_health_changes: formData.recentHealthChanges,
        allergies: formData.allergies,
        current_medications: formData.currentMedications,
        current_pharmacy: formData.currentPharmacy,
        anxiety_control: formData.anxietyControl,
        pain_injection: formData.painInjection,
        communication: formData.communication,
        sensory_sensitivities: formData.sensorySensitivities,
        physical_comfort: formData.physicalComfort,
        service_preferences: formData.servicePreferences,
        other_concerns: formData.otherConcerns,
        source: 'manual'
      };

      let result;
      if (existingData?.id) {
        result = await updateMedicalHistory(existingData.id, medicalHistoryData);
      } else {
        result = await createMedicalHistory(medicalHistoryData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: existingData ? "Medical history updated successfully" : "Medical history created successfully"
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving medical history:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save medical history",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {existingData ? 'Edit Medical History' : 'Add Medical History'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="allergies">Allergies & Medications</TabsTrigger>
            <TabsTrigger value="comfort">Comfort Preferences</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="medical" className="mt-0">
              <Section2MedicalHistory
                formData={formData as NewPatientFormData}
                onInputChange={handleInputChange}
                onNestedInputChange={handleNestedInputChange}
              />
            </TabsContent>

            <TabsContent value="allergies" className="mt-0">
              <Section3AllergiesMeds
                formData={formData as NewPatientFormData}
                onInputChange={handleInputChange}
                onNestedInputChange={handleNestedInputChange}
              />
            </TabsContent>

            <TabsContent value="comfort" className="mt-0">
              <Section6Comfort
                formData={formData as NewPatientFormData}
                onInputChange={handleInputChange}
                onNestedInputChange={handleNestedInputChange}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingData ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

