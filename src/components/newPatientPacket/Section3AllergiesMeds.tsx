import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pill, AlertTriangle, Shield, Building2 } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section3AllergiesMedsProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section3AllergiesMeds({ formData, onInputChange, onNestedInputChange }: Section3AllergiesMedsProps) {
  
  // Dental-related allergies
  const dentalAllergies = [
    'Local Anesthetic (Lidocaine, Novocaine)',
    'Antibiotics (Penicillin, Amoxicillin)',
    'Latex',
    'Iodine/Betadine',
    'Aspirin',
    'Metals (Nickel, Chrome)',
    'Dental Materials'
  ];

  // Common medication allergies
  const medicationAllergies = [
    'Sulfa Drugs',
    'Codeine',
    'Aspirin',
    'Ibuprofen',
    'Acetaminophen',
    'Morphine',
    'Penicillin',
    'Erythromycin'
  ];

  // Other common allergies
  const otherAllergies = [
    'Shellfish',
    'Nuts',
    'Eggs',
    'Dairy',
    'Soy',
    'Gluten',
    'Pollen',
    'Dust',
    'Pet Dander'
  ];

  // Emergency medications
  const emergencyMedications = [
    'Rescue Inhaler (Albuterol)',
    'EpiPen',
    'Nitroglycerin',
    'Insulin',
    'Emergency Steroids'
  ];

  // Bone/Osteoporosis medications
  const boneMedications = [
    'Fosamax (Alendronate)',
    'Boniva (Ibandronate)',
    'Actonel (Risedronate)',
    'Reclast (Zoledronic Acid)',
    'Prolia (Denosumab)'
  ];

  // Specialized medications
  const specializedMedications = [
    'Blood Thinners (Warfarin, Coumadin)',
    'Chemotherapy Drugs',
    'Immunosuppressants',
    'Steroids (Prednisone)',
    'Seizure Medications',
    'Heart Medications'
  ];

  const handleAllergyChange = (category: string, allergy: string, checked: boolean) => {
    const currentAllergies = formData.allergies[category as keyof typeof formData.allergies] as string[] || [];
    let newAllergies;
    
    if (checked) {
      newAllergies = [...currentAllergies, allergy];
      // If any allergy is selected, uncheck "none"
      onNestedInputChange('allergies', 'none', false);
    } else {
      newAllergies = currentAllergies.filter(a => a !== allergy);
    }
    
    onNestedInputChange('allergies', category, newAllergies);
  };

  const handleMedicationChange = (category: string, medication: string, checked: boolean) => {
    const currentMedications = formData.currentMedications[category as keyof typeof formData.currentMedications] as string[] || [];
    let newMedications;
    
    if (checked) {
      newMedications = [...currentMedications, medication];
      // If any medication is selected, uncheck "none"
      onNestedInputChange('currentMedications', 'none', false);
    } else {
      newMedications = currentMedications.filter(m => m !== medication);
    }
    
    onNestedInputChange('currentMedications', category, newMedications);
  };

  const handleNoAllergiesChange = (checked: boolean) => {
    if (checked) {
      // Clear all allergies
      onInputChange('allergies', {
        dentalRelated: [],
        medications: [],
        other: [],
        food: '',
        none: true
      });
    } else {
      onNestedInputChange('allergies', 'none', false);
    }
  };

  const handleNoMedicationsChange = (checked: boolean) => {
    if (checked) {
      // Clear all medications
      onInputChange('currentMedications', {
        emergency: [],
        boneOsteoporosis: [],
        specialized: [],
        complete: '',
        none: true
      });
    } else {
      onNestedInputChange('currentMedications', 'none', false);
    }
  };

  // Check if any critical allergies are selected
  const hasCriticalAllergies = 
    formData.allergies.dentalRelated?.some(allergy => 
      allergy.includes('Anesthetic') || allergy.includes('Antibiotic')
    ) ||
    formData.allergies.medications?.some(allergy => 
      allergy.includes('Penicillin') || allergy.includes('Sulfa')
    );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Pill className="h-5 w-5 text-orange-600" />
            </div>
            Allergies & Current Medications
            <Badge variant="secondary" className="ml-auto">5 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please provide detailed information about your allergies and current medications. This is critical for your safety.
          </p>
        </CardHeader>
      </Card>

      {/* Allergies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Allergies
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please check all allergies that apply to you. This information is crucial for safe treatment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dental-Related Allergies */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-3 w-3 text-red-600" />
              </div>
              Dental-Related Allergies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dentalAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dental-${allergy}`}
                    checked={formData.allergies.dentalRelated?.includes(allergy) || false}
                    onCheckedChange={(checked) => handleAllergyChange('dentalRelated', allergy, checked as boolean)}
                  />
                  <Label htmlFor={`dental-${allergy}`} className="text-sm">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Medication Allergies */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <Pill className="h-3 w-3 text-orange-600" />
              </div>
              Medication Allergies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {medicationAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`medication-${allergy}`}
                    checked={formData.allergies.medications?.includes(allergy) || false}
                    onCheckedChange={(checked) => handleAllergyChange('medications', allergy, checked as boolean)}
                  />
                  <Label htmlFor={`medication-${allergy}`} className="text-sm">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Other Allergies */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
              Other Allergies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {otherAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`other-${allergy}`}
                    checked={formData.allergies.other?.includes(allergy) || false}
                    onCheckedChange={(checked) => handleAllergyChange('other', allergy, checked as boolean)}
                  />
                  <Label htmlFor={`other-${allergy}`} className="text-sm">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Food Allergies */}
          <div>
            <Label htmlFor="foodAllergies" className="text-sm font-semibold">
              Food Allergies (please specify)
            </Label>
            <Input
              id="foodAllergies"
              value={formData.allergies.food || ''}
              onChange={(e) => onNestedInputChange('allergies', 'food', e.target.value)}
              placeholder="List any food allergies not mentioned above"
            />
          </div>

          {/* No Allergies */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="noAllergies"
              checked={formData.allergies.none}
              onCheckedChange={handleNoAllergiesChange}
            />
            <Label htmlFor="noAllergies" className="text-sm font-medium">
              I have no known allergies
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-blue-600" />
            Current Medications
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please list all medications you are currently taking, including over-the-counter drugs and supplements.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emergency Medications */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-red-600" />
              </div>
              Emergency Medications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {emergencyMedications.map((medication) => (
                <div key={medication} className="flex items-center space-x-2">
                  <Checkbox
                    id={`emergency-${medication}`}
                    checked={formData.currentMedications.emergency?.includes(medication) || false}
                    onCheckedChange={(checked) => handleMedicationChange('emergency', medication, checked as boolean)}
                  />
                  <Label htmlFor={`emergency-${medication}`} className="text-sm">
                    {medication}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Bone/Osteoporosis Medications */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="h-3 w-3 text-purple-600" />
              </div>
              Bone/Osteoporosis Medications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {boneMedications.map((medication) => (
                <div key={medication} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bone-${medication}`}
                    checked={formData.currentMedications.boneOsteoporosis?.includes(medication) || false}
                    onCheckedChange={(checked) => handleMedicationChange('boneOsteoporosis', medication, checked as boolean)}
                  />
                  <Label htmlFor={`bone-${medication}`} className="text-sm">
                    {medication}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Medications */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Pill className="h-3 w-3 text-blue-600" />
              </div>
              Specialized Medications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {specializedMedications.map((medication) => (
                <div key={medication} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialized-${medication}`}
                    checked={formData.currentMedications.specialized?.includes(medication) || false}
                    onCheckedChange={(checked) => handleMedicationChange('specialized', medication, checked as boolean)}
                  />
                  <Label htmlFor={`specialized-${medication}`} className="text-sm">
                    {medication}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Medication List */}
          <div>
            <Label htmlFor="completeMedications" className="text-sm font-semibold">
              Complete List of All Current Medications
            </Label>
            <Textarea
              id="completeMedications"
              value={formData.currentMedications.complete}
              onChange={(e) => onNestedInputChange('currentMedications', 'complete', e.target.value)}
              placeholder="Please list ALL medications you are currently taking, including dosages, over-the-counter drugs, vitamins, and supplements..."
              rows={4}
            />
          </div>

          {/* No Medications */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="noMedications"
              checked={formData.currentMedications.none}
              onCheckedChange={handleNoMedicationsChange}
            />
            <Label htmlFor="noMedications" className="text-sm font-medium">
              I am not currently taking any medications
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Current Pharmacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-green-600" />
            Current Pharmacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pharmacyName" className="text-sm font-semibold">
                Pharmacy Name
              </Label>
              <Input
                id="pharmacyName"
                value={formData.currentPharmacy.name}
                onChange={(e) => onNestedInputChange('currentPharmacy', 'name', e.target.value)}
                placeholder="e.g., CVS Pharmacy, Walgreens"
              />
            </div>
            <div>
              <Label htmlFor="pharmacyCity" className="text-sm font-semibold">
                City/Location
              </Label>
              <Input
                id="pharmacyCity"
                value={formData.currentPharmacy.city}
                onChange={(e) => onNestedInputChange('currentPharmacy', 'city', e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alert for Allergies */}
      {hasCriticalAllergies && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Allergy Alert:</strong> You have indicated allergies to anesthetics or antibiotics. 
            This information will be prominently displayed in your chart and communicated to all treatment providers.
          </AlertDescription>
        </Alert>
      )}

      {/* Medication Interaction Warning */}
      {(formData.currentMedications.boneOsteoporosis?.length > 0 || 
        formData.currentMedications.specialized?.some(med => med.includes('Blood Thinner'))) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Medication Alert:</strong> You are taking medications that may require special precautions during dental treatment. 
            Our team will coordinate with your physician as needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
