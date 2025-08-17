import { supabase } from '@/integrations/supabase/client';
import { Consultation, ConsultationInsert } from '@/types/consultation';

// Use the correct types from the types file
export type ConsultationData = Consultation;

/**
 * Create or update a comprehensive consultation record
 */
export async function saveConsultation(consultationData: ConsultationData): Promise<ConsultationData | null> {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .upsert({
        ...consultationData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving consultation:', error);
      throw error;
    }

    console.log('✅ Consultation saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to save consultation:', error);
    return null;
  }
}

/**
 * Get consultation by patient packet ID
 */
export async function getConsultationByPacketId(patientPacketId: string): Promise<ConsultationData | null> {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('new_patient_packet_id', patientPacketId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching consultation:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('❌ Failed to fetch consultation:', error);
    return null;
  }
}

/**
 * Get all consultations for a provider
 */
export async function getConsultationsByProvider(providerId: string): Promise<ConsultationData[]> {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('provider_id', providerId)
      .order('consultation_date', { ascending: false });

    if (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch consultations:', error);
    return [];
  }
}

/**
 * Update consultation status
 */
export async function updateConsultationStatus(
  consultationId: string, 
  status: ConsultationData['consultation_status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('consultations')
      .update({ 
        consultation_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultationId);

    if (error) {
      console.error('Error updating consultation status:', error);
      throw error;
    }

    console.log('✅ Consultation status updated:', status);
    return true;
  } catch (error) {
    console.error('❌ Failed to update consultation status:', error);
    return false;
  }
}

/**
 * Populate consultation with patient packet data
 */
export async function populateConsultationFromPacket(patientPacketId: string): Promise<ConsultationInsert | null> {
  try {
    // Get patient packet data
    const { data: packetData, error: packetError } = await supabase
      .from('new_patient_packets')
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          street,
          city,
          state,
          zip_code
        )
      `)
      .eq('id', patientPacketId)
      .single();

    if (packetError) {
      console.error('Error fetching patient packet:', packetError);
      return null;
    }

    // Get AI summary if exists
    const { data: summaryData } = await supabase
      .from('patient_summaries')
      .select('*')
      .eq('patient_packet_id', patientPacketId)
      .single();

    // Get treatment plan if exists
    const { data: treatmentData } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_packet_id', patientPacketId)
      .single();

    // Construct consultation data - only use fields that exist in consultations table
    const firstName = packetData.patients?.first_name || packetData.first_name || 'Unknown';
    const lastName = packetData.patients?.last_name || packetData.last_name || 'Patient';

    const consultationData: ConsultationInsert = {
      new_patient_packet_id: patientPacketId,
      consultation_patient_id: packetData.consultation_patient_id || undefined,
      patient_id: packetData.patients?.id || undefined,
      patient_name: `${firstName} ${lastName}`,

      // Treatment data if available
      clinical_assessment: treatmentData?.clinical_assessment || undefined,
      treatment_recommendations: treatmentData?.treatment_recommendations || undefined,
      additional_information: treatmentData?.additional_information || undefined,

      // Default consultation metadata
      consultation_status: 'scheduled',
      consultation_date: new Date().toISOString(),
      progress_step: 1
    };

    return consultationData;
  } catch (error) {
    console.error('❌ Failed to populate consultation from packet:', error);
    return null;
  }
}

/**
 * Create consultation from patient packet data
 */
export async function createConsultationFromPacket(patientPacketId: string): Promise<ConsultationData | null> {
  try {
    const consultationData = await populateConsultationFromPacket(patientPacketId);

    if (!consultationData) {
      throw new Error('Failed to populate consultation data');
    }

    // Insert the consultation directly using Supabase
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }

    console.log('✅ Consultation created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create consultation from packet:', error);
    return null;
  }
}

/**
 * Move patient from consultation to main patients table when treatment is accepted
 */
export async function movePatientToMainTable(patientPacketId: string): Promise<string | null> {
  try {
    console.log('🔄 Moving patient to main patients table...');
    console.log('📋 Patient Packet ID received:', patientPacketId);

    // Get consultation data
    let consultation = await getConsultationByPacketId(patientPacketId);
    console.log('📊 Consultation data:', consultation);

    if (!consultation) {
      console.log('⚠️ No consultation found, creating one from patient packet...');
      consultation = await createConsultationFromPacket(patientPacketId);

      if (!consultation) {
        console.error('❌ Failed to create consultation for packet ID:', patientPacketId);
        throw new Error('Failed to create consultation');
      }

      console.log('✅ Created consultation:', consultation);
    }

    // Get patient packet data for additional details
    const { data: packetData, error: packetError } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('id', patientPacketId)
      .single();

    console.log('📦 Patient packet data:', packetData);
    console.log('📦 Packet error:', packetError);

    if (packetError) {
      console.error('❌ Failed to fetch patient packet data:', packetError);
      throw new Error(`Failed to fetch patient packet data: ${packetError.message}`);
    }

    // Check if patient already exists in main table
    let patientId = consultation.patient_id;
    console.log('🔍 Existing patient ID in consultation:', patientId);

    if (!patientId) {
      console.log('👤 Creating new patient in main table...');

      // Get patient data from packet (primary source) or consultation patient
      let consultationPatientData = null;
      if (consultation.consultation_patient_id) {
        const { data: cpData } = await supabase
          .from('consultation_patients')
          .select('*')
          .eq('id', consultation.consultation_patient_id)
          .single();
        consultationPatientData = cpData;
      }

      const firstName = packetData.first_name || consultationPatientData?.first_name || 'Unknown';
      const lastName = packetData.last_name || consultationPatientData?.last_name || 'Patient';

      // Handle date of birth - ensure it's in the correct format
      let dateOfBirth = packetData.date_of_birth || consultationPatientData?.date_of_birth;
      if (!dateOfBirth) {
        // If no date provided, use a default date (this shouldn't happen in real scenarios)
        dateOfBirth = '1900-01-01';
        console.warn('⚠️ No date of birth provided, using default date');
      }

      // Ensure date is in YYYY-MM-DD format
      if (typeof dateOfBirth === 'string' && dateOfBirth.includes('T')) {
        dateOfBirth = dateOfBirth.split('T')[0];
      }

      // Handle gender - ensure it's a valid value
      let gender = packetData.gender || consultationPatientData?.gender;
      if (gender && !['male', 'female'].includes(gender.toLowerCase())) {
        console.warn('⚠️ Invalid gender value, setting to null:', gender);
        gender = null;
      } else if (gender) {
        gender = gender.toLowerCase();
      }

      const patientData = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        phone: packetData.phone || null,
        gender: gender,
        street: packetData.street || null,
        city: packetData.city || null,
        state: packetData.state || null,
        zip_code: packetData.zip_code || null,
        status: 'Treatment not started', // Valid status from constraint
        treatment_type: 'Consultation Completed'
        // Note: full_name is a generated column and will be automatically created
        // created_at and updated_at have default values, so we don't need to specify them
      };

      console.log('📝 Patient data to insert:', patientData);

      // Validate required fields
      if (!patientData.first_name || !patientData.last_name || !patientData.date_of_birth) {
        throw new Error(`Missing required patient data: first_name=${patientData.first_name}, last_name=${patientData.last_name}, date_of_birth=${patientData.date_of_birth}`);
      }

      // Create new patient in main patients table
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating patient:', createError);
        throw new Error(`Failed to create patient: ${createError.message}`);
      }

      patientId = newPatient.id;
      console.log('✅ Created new patient in main table:', patientId);
      console.log('👤 New patient data:', newPatient);

      // Link the patient packet to the newly created patient
      console.log('🔗 Linking patient packet to new patient...');
      const { error: packetUpdateError } = await supabase
        .from('new_patient_packets')
        .update({ patient_id: patientId })
        .eq('id', patientPacketId);

      if (packetUpdateError) {
        console.error('❌ Error linking patient packet to patient:', packetUpdateError);
        // Don't throw error here as patient creation was successful
      } else {
        console.log('✅ Successfully linked patient packet to patient:', patientId);
      }

      // Update consultation with patient_id
      await supabase
        .from('consultations')
        .update({ patient_id: patientId })
        .eq('new_patient_packet_id', patientPacketId);

    } else {
      // Update existing patient status
      await supabase
        .from('patients')
        .update({
          status: 'Treatment not started',
          treatment_type: 'Consultation Completed'
        })
        .eq('id', patientId);

      console.log('✅ Updated existing patient status:', patientId);
    }

    // Update lead status to indicate patient has been moved
    if (packetData.lead_id) {
      await supabase
        .from('leads')
        .update({
          status: 'Converted to Patient',
          updated_at: new Date().toISOString()
        })
        .eq('id', packetData.lead_id);

      console.log('✅ Updated lead status to converted');
    }

    return patientId;
  } catch (error) {
    console.error('❌ Failed to move patient to main table:', error);
    return null;
  }
}

// Test function for debugging - can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testMovePatient = async (patientPacketId: string) => {
    console.log('🧪 Testing patient move for packet ID:', patientPacketId);
    const result = await movePatientToMainTable(patientPacketId);
    console.log('🧪 Test result:', result);
    return result;
  };
}
