import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Pill, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HealthHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

export function HealthHistoryDialog({ open, onOpenChange, patientId, patientName }: HealthHistoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    if (open && patientId) {
      fetchHealthHistory();
    }
  }, [open, patientId]);

  const fetchHealthHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('new_patient_packets')
        .select('critical_conditions, system_specific, additional_conditions, recent_health_changes, allergies, current_medications, current_pharmacy_name, current_pharmacy_city')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setHealthData(data);
    } catch (error) {
      console.error('Error fetching health history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCriticalConditions = () => {
    if (!healthData?.critical_conditions) return <p className="text-sm text-gray-500">No data available</p>;
    
    const conditions = healthData.critical_conditions;
    const activeConditions = [];
    
    if (conditions.acidReflux) activeConditions.push('Acid Reflux');
    if (conditions.cancer?.has) activeConditions.push(`Cancer${conditions.cancer.type ? ` (${conditions.cancer.type})` : ''}`);
    if (conditions.depressionAnxiety) activeConditions.push('Depression/Anxiety');
    if (conditions.diabetes?.has) activeConditions.push(`Diabetes${conditions.diabetes.type ? ` Type ${conditions.diabetes.type}` : ''}`);
    if (conditions.heartDisease) activeConditions.push('Heart Disease');
    if (conditions.periodontalDisease) activeConditions.push('Periodontal Disease');
    if (conditions.substanceAbuse) activeConditions.push('Substance Abuse');
    if (conditions.highBloodPressure) activeConditions.push('High Blood Pressure');
    if (conditions.other) activeConditions.push(conditions.other);
    
    if (conditions.none || activeConditions.length === 0) {
      return <p className="text-sm text-gray-500">None reported</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {activeConditions.map((condition, index) => (
          <Badge key={index} variant="destructive">{condition}</Badge>
        ))}
      </div>
    );
  };

  const renderSystemSpecific = () => {
    if (!healthData?.system_specific) return <p className="text-sm text-gray-500">No data available</p>;
    
    const systems = healthData.system_specific;
    const allConditions: string[] = [];
    
    if (systems.respiratory?.length) allConditions.push(...systems.respiratory);
    if (systems.cardiovascular?.length) allConditions.push(...systems.cardiovascular);
    if (systems.gastrointestinal?.length) allConditions.push(...systems.gastrointestinal);
    if (systems.neurological?.length) allConditions.push(...systems.neurological);
    if (systems.endocrineRenal?.length) allConditions.push(...systems.endocrineRenal);
    
    if (allConditions.length === 0) {
      return <p className="text-sm text-gray-500">None reported</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {allConditions.map((condition, index) => (
          <Badge key={index} variant="secondary">{condition}</Badge>
        ))}
      </div>
    );
  };

  const renderAllergies = () => {
    if (!healthData?.allergies) return <p className="text-sm text-gray-500">No data available</p>;
    
    const allergies = healthData.allergies;
    const allAllergies: string[] = [];
    
    if (allergies.dentalRelated?.length) allAllergies.push(...allergies.dentalRelated.map((a: string) => `Dental: ${a}`));
    if (allergies.medications?.length) allAllergies.push(...allergies.medications.map((a: string) => `Medication: ${a}`));
    if (allergies.other?.length) allAllergies.push(...allergies.other.map((a: string) => `Other: ${a}`));
    if (allergies.food) allAllergies.push(`Food: ${allergies.food}`);
    
    if (allergies.none || allAllergies.length === 0) {
      return <p className="text-sm text-gray-500">None reported</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {allAllergies.map((allergy, index) => (
          <Badge key={index} variant="outline" className="border-orange-300 text-orange-700">{allergy}</Badge>
        ))}
      </div>
    );
  };

  const renderMedications = () => {
    if (!healthData?.current_medications) return <p className="text-sm text-gray-500">No data available</p>;
    
    const meds = healthData.current_medications;
    const allMeds: string[] = [];
    
    if (meds.emergency?.length) allMeds.push(...meds.emergency);
    if (meds.boneOsteoporosis?.length) allMeds.push(...meds.boneOsteoporosis);
    if (meds.specialized?.length) allMeds.push(...meds.specialized);
    if (meds.complete) allMeds.push(meds.complete);
    
    if (meds.none || allMeds.length === 0) {
      return <p className="text-sm text-gray-500">None reported</p>;
    }
    
    return (
      <div className="space-y-1">
        {allMeds.map((med, index) => (
          <p key={index} className="text-sm text-gray-700">• {med}</p>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Health History - {patientName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading health history...</p>
          </div>
        ) : !healthData ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No health history found for this patient.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Row 1: Critical Conditions and Allergies */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Critical Conditions */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Critical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCriticalConditions()}
                </CardContent>
              </Card>

              {/* Allergies */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderAllergies()}
                </CardContent>
              </Card>
            </div>

            {/* Row 2: System-Specific Conditions and Current Medications */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* System-Specific Conditions */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-blue-600" />
                    System-Specific Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSystemSpecific()}
                </CardContent>
              </Card>

              {/* Current Medications */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5 text-green-600" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMedications()}
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Additional Conditions and Pharmacy (if they exist) */}
            {((healthData.additional_conditions && healthData.additional_conditions.length > 0) ||
              (healthData.current_pharmacy_name || healthData.current_pharmacy_city)) && (
              <div className="grid grid-cols-2 gap-4 items-start">
                {/* Additional Conditions */}
                {healthData.additional_conditions && healthData.additional_conditions.length > 0 ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {healthData.additional_conditions.map((condition: string, index: number) => (
                          <Badge key={index} variant="secondary">{condition}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div></div>
                )}

                {/* Pharmacy Information */}
                {(healthData.current_pharmacy_name || healthData.current_pharmacy_city) ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Pharmacy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        {healthData.current_pharmacy_name}
                        {healthData.current_pharmacy_city && `, ${healthData.current_pharmacy_city}`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div></div>
                )}
              </div>
            )}

            {/* Recent Health Changes - Full Width */}
            {healthData.recent_health_changes?.hasChanges && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Health Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{healthData.recent_health_changes.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

