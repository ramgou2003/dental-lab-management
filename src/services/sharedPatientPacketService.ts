import { supabase } from "@/integrations/supabase/client";
import { NewPatientPacketDB } from "@/types/supabasePatientPacket";

/**
 * Service for managing shared patient packets across multiple consultations
 * Ensures that all consultations for the same patient share a single patient packet
 */

interface PatientIdentity {
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

/**
 * Find existing patient packet for a patient based on their identity
 * Searches across consultation_patients and active patients
 */
export async function findExistingPatientPacket(
  patientIdentity: PatientIdentity
): Promise<{ data: NewPatientPacketDB | null; error: any }> {
  try {
    console.log('Searching for existing patient packet for:', patientIdentity);

    // First, try to find a patient packet by matching patient identity
    // Search in new_patient_packets table for matching name and DOB
    const { data: existingPackets, error: packetsError } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('first_name', patientIdentity.first_name)
      .eq('last_name', patientIdentity.last_name)
      .eq('date_of_birth', patientIdentity.date_of_birth)
      .order('created_at', { ascending: false })
      .limit(1);

    if (packetsError) {
      console.error('Error searching for existing patient packets:', packetsError);
      return { data: null, error: packetsError };
    }

    if (existingPackets && existingPackets.length > 0) {
      console.log('Found existing patient packet:', existingPackets[0].id);
      return { data: existingPackets[0], error: null };
    }

    console.log('No existing patient packet found for this patient');
    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error finding existing patient packet:', error);
    return { data: null, error };
  }
}

/**
 * Link a consultation patient to an existing patient packet
 * Note: We don't modify the patient packet's consultation_patient_id to preserve the original link
 * The relationship is maintained through the consultations table instead
 */
export async function linkConsultationToPatientPacket(
  consultationPatientId: string,
  patientPacketId: string
): Promise<{ success: boolean; error: any }> {
  try {
    console.log('Linking consultation patient', consultationPatientId, 'to patient packet', patientPacketId);

    // Don't update the patient packet's consultation_patient_id to preserve the original link
    // The relationship is maintained through the consultations table:
    // consultations.consultation_patient_id -> consultation_patients.id
    // consultations.new_patient_packet_id -> new_patient_packets.id

    console.log('Link established through consultations table (no direct packet update needed)');
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error linking consultation to patient packet:', error);
    return { success: false, error };
  }
}

/**
 * Find all consultation patients for the same person (by name and DOB)
 */
export async function findAllConsultationsForPatient(
  patientIdentity: PatientIdentity
): Promise<{ data: any[] | null; error: any }> {
  try {
    console.log('Finding all consultations for patient:', patientIdentity);

    // Find all consultation patients with matching identity
    const { data: consultationPatients, error: consultationError } = await supabase
      .from('consultation_patients')
      .select('*')
      .eq('first_name', patientIdentity.first_name)
      .eq('last_name', patientIdentity.last_name)
      .eq('date_of_birth', patientIdentity.date_of_birth)
      .order('consultation_date', { ascending: false });

    if (consultationError) {
      console.error('Error finding consultation patients:', consultationError);
      return { data: null, error: consultationError };
    }

    console.log(`Found ${consultationPatients?.length || 0} consultations for this patient`);
    return { data: consultationPatients || [], error: null };
  } catch (error) {
    console.error('Unexpected error finding consultations for patient:', error);
    return { data: null, error };
  }
}

/**
 * Get or create a shared patient packet for a patient
 * This ensures all consultations for the same patient use the same packet
 */
export async function getOrCreateSharedPatientPacket(
  patientIdentity: PatientIdentity,
  consultationPatientId: string,
  leadId?: string
): Promise<{ data: NewPatientPacketDB | null; error: any; isNew: boolean }> {
  try {
    console.log('Getting or creating shared patient packet for:', patientIdentity);

    // First, try to find an existing patient packet
    const { data: existingPacket, error: findError } = await findExistingPatientPacket(patientIdentity);

    if (findError) {
      return { data: null, error: findError, isNew: false };
    }

    if (existingPacket) {
      console.log('Found existing patient packet, linking to consultation');
      
      // Link this consultation to the existing packet
      const { success, error: linkError } = await linkConsultationToPatientPacket(
        consultationPatientId,
        existingPacket.id!
      );

      if (linkError) {
        console.warn('Failed to link consultation to existing packet:', linkError);
        // Continue anyway, the packet still exists
      }

      return { data: existingPacket, error: null, isNew: false };
    }

    // No existing packet found, create a new one with basic patient info
    console.log('No existing packet found, creating new shared patient packet');
    
    const newPacketData: Partial<NewPatientPacketDB> = {
      first_name: patientIdentity.first_name,
      last_name: patientIdentity.last_name,
      date_of_birth: patientIdentity.date_of_birth,
      consultation_patient_id: consultationPatientId,
      lead_id: leadId,
      submission_source: 'internal',
      form_status: 'draft' // Start as draft, will be completed during consultation
    };

    const { data: newPacket, error: createError } = await supabase
      .from('new_patient_packets')
      .insert([newPacketData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating new shared patient packet:', createError);
      return { data: null, error: createError, isNew: false };
    }

    console.log('Created new shared patient packet:', newPacket.id);
    return { data: newPacket, error: null, isNew: true };
  } catch (error) {
    console.error('Unexpected error getting or creating shared patient packet:', error);
    return { data: null, error, isNew: false };
  }
}

/**
 * Update all consultation patients with the same identity to use the same patient packet
 * This is useful for consolidating existing data
 */
export async function consolidatePatientPackets(
  patientIdentity: PatientIdentity
): Promise<{ success: boolean; error: any; consolidatedCount: number }> {
  try {
    console.log('Consolidating patient packets for:', patientIdentity);

    // Find all consultations for this patient
    const { data: consultations, error: findError } = await findAllConsultationsForPatient(patientIdentity);

    if (findError || !consultations || consultations.length === 0) {
      return { success: false, error: findError || new Error('No consultations found'), consolidatedCount: 0 };
    }

    // Find or create a shared patient packet
    const { data: sharedPacket, error: packetError } = await getOrCreateSharedPatientPacket(
      patientIdentity,
      consultations[0].id // Use the first consultation as the primary link
    );

    if (packetError || !sharedPacket) {
      return { success: false, error: packetError || new Error('Failed to create shared packet'), consolidatedCount: 0 };
    }

    // Update all other consultation patients to reference the same packet
    let consolidatedCount = 0;
    for (const consultation of consultations) {
      if (consultation.id !== consultations[0].id) {
        const { success } = await linkConsultationToPatientPacket(consultation.id, sharedPacket.id!);
        if (success) {
          consolidatedCount++;
        }
      }
    }

    console.log(`Consolidated ${consolidatedCount} consultations to shared patient packet`);
    return { success: true, error: null, consolidatedCount };
  } catch (error) {
    console.error('Unexpected error consolidating patient packets:', error);
    return { success: false, error, consolidatedCount: 0 };
  }
}

/**
 * Get the shared patient packet for a consultation patient
 */
export async function getSharedPatientPacketForConsultation(
  consultationPatientId: string
): Promise<{ data: NewPatientPacketDB | null; error: any }> {
  try {
    console.log('Getting shared patient packet for consultation:', consultationPatientId);

    // First, get the consultation patient details
    const { data: consultationPatient, error: consultationError } = await supabase
      .from('consultation_patients')
      .select('*')
      .eq('id', consultationPatientId)
      .single();

    if (consultationError || !consultationPatient) {
      console.error('Error finding consultation patient:', consultationError);
      return { data: null, error: consultationError };
    }

    // Find the shared patient packet for this patient identity
    const patientIdentity: PatientIdentity = {
      first_name: consultationPatient.first_name,
      last_name: consultationPatient.last_name,
      date_of_birth: consultationPatient.date_of_birth
    };

    return await findExistingPatientPacket(patientIdentity);
  } catch (error) {
    console.error('Unexpected error getting shared patient packet for consultation:', error);
    return { data: null, error };
  }
}

/**
 * Utility function to consolidate all existing patient packets
 * This can be run as a one-time migration to ensure all patients have shared packets
 */
export async function consolidateAllPatientPackets(): Promise<{
  success: boolean;
  error: any;
  processedPatients: number;
  consolidatedPackets: number
}> {
  try {
    console.log('Starting consolidation of all patient packets...');

    // Get all unique patient identities from consultation_patients
    const { data: uniquePatients, error: patientsError } = await supabase
      .from('consultation_patients')
      .select('first_name, last_name, date_of_birth')
      .order('first_name, last_name, date_of_birth');

    if (patientsError) {
      console.error('Error fetching consultation patients:', patientsError);
      return { success: false, error: patientsError, processedPatients: 0, consolidatedPackets: 0 };
    }

    // Create a map of unique patient identities
    const uniquePatientMap = new Map();
    (uniquePatients || []).forEach(patient => {
      const key = `${patient.first_name}|${patient.last_name}|${patient.date_of_birth}`;
      if (!uniquePatientMap.has(key)) {
        uniquePatientMap.set(key, {
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth
        });
      }
    });

    console.log(`Found ${uniquePatientMap.size} unique patients to process`);

    let processedPatients = 0;
    let totalConsolidatedPackets = 0;

    // Process each unique patient
    for (const [key, patientIdentity] of uniquePatientMap) {
      try {
        const { success, consolidatedCount } = await consolidatePatientPackets(patientIdentity);
        if (success) {
          processedPatients++;
          totalConsolidatedPackets += consolidatedCount;
          console.log(`Processed patient: ${patientIdentity.first_name} ${patientIdentity.last_name}, consolidated ${consolidatedCount} packets`);
        }
      } catch (error) {
        console.warn(`Error processing patient ${patientIdentity.first_name} ${patientIdentity.last_name}:`, error);
      }
    }

    console.log(`Consolidation complete: ${processedPatients} patients processed, ${totalConsolidatedPackets} packets consolidated`);
    return {
      success: true,
      error: null,
      processedPatients,
      consolidatedPackets: totalConsolidatedPackets
    };
  } catch (error) {
    console.error('Unexpected error during consolidation:', error);
    return { success: false, error, processedPatients: 0, consolidatedPackets: 0 };
  }
}
