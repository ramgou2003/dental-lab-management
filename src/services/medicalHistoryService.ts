import { supabase } from "@/integrations/supabase/client";

export interface MedicalHistoryData {
  id?: string;
  patient_id: string;
  patient_packet_id?: string | null;
  
  // Medical Conditions
  critical_conditions?: any;
  system_specific?: any;
  additional_conditions?: string[];
  recent_health_changes?: any;
  
  // Allergies
  allergies?: any;
  
  // Current Medications
  current_medications?: any;
  current_pharmacy?: any;
  
  // Comfort Preferences
  anxiety_control?: string[];
  pain_injection?: string[];
  communication?: string[];
  sensory_sensitivities?: string[];
  physical_comfort?: string[];
  service_preferences?: string[];
  other_concerns?: string;
  
  // Metadata
  source?: 'patient_packet' | 'manual';
  is_active?: boolean;
  created_by_id?: string;
  updated_by_id?: string;
}

/**
 * Get active medical history for a patient
 */
export async function getActiveMedicalHistory(patientId: string) {
  const { data, error } = await supabase
    .from('medical_history')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

/**
 * Get all medical history records for a patient (including inactive/historical)
 */
export async function getAllMedicalHistory(patientId: string) {
  const { data, error } = await supabase
    .from('medical_history')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Create new medical history record
 * Automatically deactivates previous active records
 */
export async function createMedicalHistory(medicalHistoryData: MedicalHistoryData) {
  // First, deactivate any existing active records for this patient
  const { error: deactivateError } = await supabase
    .from('medical_history')
    .update({ is_active: false })
    .eq('patient_id', medicalHistoryData.patient_id)
    .eq('is_active', true);

  if (deactivateError) {
    console.error('Error deactivating previous medical history:', deactivateError);
  }

  // Create new active record
  const { data, error } = await supabase
    .from('medical_history')
    .insert({
      ...medicalHistoryData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update existing medical history record
 */
export async function updateMedicalHistory(id: string, medicalHistoryData: Partial<MedicalHistoryData>) {
  const { data, error } = await supabase
    .from('medical_history')
    .update({
      ...medicalHistoryData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete medical history record
 */
export async function deleteMedicalHistory(id: string) {
  const { error } = await supabase
    .from('medical_history')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Sync medical history from patient packet
 * Creates new record or updates existing one linked to the packet
 */
export async function syncMedicalHistoryFromPacket(patientId: string, patientPacketId: string, packetData: any, userId?: string) {
  // Check if medical history already exists for this packet
  const { data: existingHistory } = await supabase
    .from('medical_history')
    .select('*')
    .eq('patient_packet_id', patientPacketId)
    .single();

  // Construct pharmacy object from separate fields or existing object
  const currentPharmacy = packetData.current_pharmacy || {
    name: packetData.current_pharmacy_name || '',
    city: packetData.current_pharmacy_city || ''
  };

  const medicalHistoryData: MedicalHistoryData = {
    patient_id: patientId,
    patient_packet_id: patientPacketId,
    critical_conditions: packetData.critical_conditions || {},
    system_specific: packetData.system_specific || {},
    additional_conditions: packetData.additional_conditions || [],
    recent_health_changes: packetData.recent_health_changes || {},
    allergies: packetData.allergies || {},
    current_medications: packetData.current_medications || {},
    current_pharmacy: currentPharmacy,
    anxiety_control: packetData.anxiety_control || [],
    pain_injection: packetData.pain_injection || [],
    communication: packetData.communication || [],
    sensory_sensitivities: packetData.sensory_sensitivities || [],
    physical_comfort: packetData.physical_comfort || [],
    service_preferences: packetData.service_preferences || [],
    other_concerns: packetData.other_concerns || '',
    source: 'patient_packet',
    updated_by_id: userId
  };

  if (existingHistory) {
    // Update existing record
    return await updateMedicalHistory(existingHistory.id, medicalHistoryData);
  } else {
    // Create new record
    return await createMedicalHistory({
      ...medicalHistoryData,
      created_by_id: userId
    });
  }
}

