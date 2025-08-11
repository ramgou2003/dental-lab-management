import { supabase } from '@/integrations/supabase/client';

export interface ConsultationData {
  id?: string;
  
  // Patient Basic Details
  patient_id?: string;
  patient_packet_id: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_email?: string;
  patient_phone?: string;
  patient_date_of_birth?: string;
  patient_gender?: string;
  patient_address?: string;
  
  // New Patient Packet Summary
  medical_conditions?: any;
  allergies?: any;
  current_medications?: any;
  dental_status?: any;
  current_symptoms?: any;
  healing_issues?: any;
  tobacco_use?: any;
  patient_preferences?: any;
  
  // AI Summary Results
  ai_medical_summary?: string;
  ai_allergies_summary?: string;
  ai_dental_summary?: string;
  ai_attention_items?: string[];
  ai_potential_complications?: string[];
  ai_overall_assessment?: string;
  
  // Treatment Details
  clinical_assessment?: string;
  treatment_recommendations?: any;
  treatment_notes?: string;
  
  // Financial & Outcome Details
  treatment_cost?: number;
  insurance_coverage?: number;
  patient_payment?: number;
  payment_plan?: any;
  financial_notes?: string;
  
  // Consultation Outcome
  consultation_status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  treatment_plan_approved?: boolean;
  next_appointment_date?: string;
  follow_up_required?: boolean;
  follow_up_notes?: string;
  
  // Consultation Metadata
  consultation_date?: string;
  consultation_duration_minutes?: number;
  consultation_type?: 'initial' | 'follow-up' | 'emergency' | 'consultation';
  provider_id?: string;
  provider_name?: string;
}

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
export async function populateConsultationFromPacket(patientPacketId: string): Promise<Partial<ConsultationData> | null> {
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
          email,
          phone,
          date_of_birth,
          gender,
          address
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

    // Construct consultation data
    const consultationData: Partial<ConsultationData> = {
      patient_packet_id: patientPacketId,
      patient_id: packetData.patients?.id,
      
      // Patient basic details
      patient_first_name: packetData.patients?.first_name || packetData.first_name,
      patient_last_name: packetData.patients?.last_name || packetData.last_name,
      patient_email: packetData.patients?.email || packetData.email,
      patient_phone: packetData.patients?.phone || packetData.phone,
      patient_date_of_birth: packetData.patients?.date_of_birth || packetData.date_of_birth,
      patient_gender: packetData.patients?.gender || packetData.gender,
      patient_address: packetData.patients?.address,
      
      // Patient packet data
      medical_conditions: packetData.critical_conditions,
      allergies: packetData.allergies,
      current_medications: packetData.current_medications,
      dental_status: packetData.dental_status,
      current_symptoms: packetData.current_symptoms,
      healing_issues: packetData.healing_issues,
      tobacco_use: packetData.tobacco_use,
      patient_preferences: {
        anxiety_control: packetData.anxiety_control,
        pain_injection: packetData.pain_injection,
        communication: packetData.communication,
        physical_comfort: packetData.physical_comfort
      },
      
      // AI summary data
      ai_medical_summary: summaryData?.medical_history_summary,
      ai_allergies_summary: summaryData?.allergies_summary,
      ai_dental_summary: summaryData?.dental_history_summary,
      ai_attention_items: summaryData?.attention_items,
      ai_potential_complications: summaryData?.potential_complications,
      ai_overall_assessment: summaryData?.overall_assessment,
      
      // Treatment data
      clinical_assessment: treatmentData?.clinical_assessment,
      treatment_recommendations: treatmentData?.treatment_recommendations,
      treatment_notes: treatmentData?.additional_information,
      
      // Default consultation metadata
      consultation_type: 'initial',
      consultation_status: 'scheduled',
      consultation_date: new Date().toISOString()
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

    return await saveConsultation(consultationData as ConsultationData);
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

      const firstName = consultation.patient_first_name || packetData.first_name || 'Unknown';
      const lastName = consultation.patient_last_name || packetData.last_name || 'Patient';

      // Handle date of birth - ensure it's in the correct format
      let dateOfBirth = consultation.patient_date_of_birth || packetData.date_of_birth;
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
      let gender = consultation.patient_gender || packetData.gender;
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
        phone: consultation.patient_phone || packetData.phone || null,
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
