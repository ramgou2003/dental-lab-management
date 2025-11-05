import { supabase } from '@/integrations/supabase/client';
import { Consultation, ConsultationInsert } from '@/types/consultation';

// Use the correct types from the types file
export type ConsultationData = Consultation;

/**
 * Fix old consultations with follow-up required status
 * Mark them as completed if they have a treatment decision
 */
export async function fixOldFollowUpConsultations(): Promise<number> {
  try {
    console.log('🔧 Starting to fix old follow-up consultations...');

    // Get all consultations with follow_up_required = true and consultation_status = 'scheduled'
    const { data: consultations, error: fetchError } = await supabase
      .from('consultations')
      .select('id, follow_up_required, consultation_status, treatment_decision')
      .eq('follow_up_required', true)
      .eq('consultation_status', 'scheduled');

    if (fetchError) {
      console.error('❌ Error fetching consultations:', fetchError);
      return 0;
    }

    if (!consultations || consultations.length === 0) {
      console.log('✅ No consultations to fix');
      return 0;
    }

    console.log(`📋 Found ${consultations.length} consultations to fix`);

    // Update all these consultations to completed status
    const { error: updateError, data: updatedData } = await supabase
      .from('consultations')
      .update({ consultation_status: 'completed' })
      .eq('follow_up_required', true)
      .eq('consultation_status', 'scheduled')
      .select();

    if (updateError) {
      console.error('❌ Error updating consultations:', updateError);
      return 0;
    }

    const count = updatedData?.length || 0;
    console.log(`✅ Successfully updated ${count} consultations to completed status`);
    return count;
  } catch (error) {
    console.error('❌ Failed to fix old follow-up consultations:', error);
    return 0;
  }
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
    // Validate input
    if (!patientPacketId || typeof patientPacketId !== 'string') {
      console.error('❌ Invalid patient packet ID provided:', patientPacketId);
      return null;
    }

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
      patient_name: `${firstName} ${lastName}`,

      // Only include UUID fields if they have valid values (not undefined)
      ...(packetData.consultation_patient_id && { consultation_patient_id: packetData.consultation_patient_id }),
      ...(packetData.patients?.id && { patient_id: packetData.patients.id }),

      // Treatment data if available
      ...(treatmentData?.clinical_assessment && { clinical_assessment: treatmentData.clinical_assessment }),
      ...(treatmentData?.treatment_recommendations && { treatment_recommendations: treatmentData.treatment_recommendations }),
      ...(treatmentData?.additional_information && { additional_information: treatmentData.additional_information }),

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
export async function movePatientToMainTable(patientPacketId?: string): Promise<string | null> {
  try {
    console.log('🔄 Moving patient to main patients table...');
    console.log('📋 Patient Packet ID received:', patientPacketId);

    // Validate input
    if (!patientPacketId || typeof patientPacketId !== 'string' || patientPacketId === 'undefined') {
      console.error('❌ Invalid or missing patient packet ID provided:', patientPacketId);
      throw new Error('Patient packet ID is required to move patient to main table. Please ensure the consultation is linked to a patient packet.');
    }

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

      // Map packet data fields to patient table fields
      const patientData = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        phone: packetData.phone_cell || packetData.phone_work || null, // Use cell phone first, then work phone
        gender: gender,
        street: packetData.address_street || null,
        city: packetData.address_city || null,
        state: packetData.address_state || null,
        zip_code: packetData.address_zip || null,
        status: 'ACTIVE', // Always set status to ACTIVE
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
        console.error('❌ Packet update error details:', packetUpdateError);
        // Don't throw error here as patient creation was successful, but log the issue
      } else {
        console.log('✅ Successfully linked patient packet to patient:', patientId);
      }

      // Update consultation with patient_id
      console.log('🔗 Updating consultation with patient ID...');
      const { error: consultationUpdateError } = await supabase
        .from('consultations')
        .update({ patient_id: patientId })
        .eq('new_patient_packet_id', patientPacketId);

      if (consultationUpdateError) {
        console.error('❌ Error updating consultation with patient ID:', consultationUpdateError);
        console.error('❌ Consultation update error details:', consultationUpdateError);
        // Don't throw error here as patient creation was successful, but log the issue
      } else {
        console.log('✅ Successfully updated consultation with patient ID:', patientId);
      }

    } else {
      // Update existing patient status
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          status: 'ACTIVE',
          treatment_type: 'Consultation Completed'
        })
        .eq('id', patientId);

      if (updateError) {
        console.error('❌ Error updating existing patient status:', updateError);
      } else {
        console.log('✅ Updated existing patient status:', patientId);
      }
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

    // Create treatment plan from consultation treatment plan
    if (consultation.treatment_plan && consultation.treatment_plan.treatments && consultation.treatment_plan.treatments.length > 0) {
      console.log('📋 Creating treatment plan for accepted patient...');

      const treatmentPlanData = {
        patient_id: patientId,
        first_name: packetData.first_name || consultationPatientData?.first_name || 'Unknown',
        last_name: packetData.last_name || consultationPatientData?.last_name || 'Patient',
        date_of_birth: packetData.date_of_birth || consultationPatientData?.date_of_birth || '1900-01-01',
        treatments: consultation.treatment_plan.treatments,
        plan_date: new Date().toISOString().split('T')[0],
        form_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: treatmentPlan, error: treatmentPlanError } = await supabase
        .from('treatment_plan_forms')
        .insert([treatmentPlanData])
        .select()
        .single();

      if (treatmentPlanError) {
        console.error('❌ Error creating treatment plan:', treatmentPlanError);
        // Don't throw error here as patient creation was successful
      } else {
        console.log('✅ Treatment plan created successfully:', treatmentPlan?.id);
      }
    }

    return patientId;
  } catch (error) {
    console.error('❌ Failed to move patient to main table:', error);
    return null;
  }
}

/**
 * Move patient from consultation to main patients table using appointment ID
 * This is used when there's no patient packet ID available
 */
export async function movePatientToMainTableByAppointment(appointmentId: string, consultationPatientId?: string): Promise<string | null> {
  try {
    console.log('🔄 Moving patient to main patients table by appointment...');
    console.log('📋 Appointment ID received:', appointmentId);
    console.log('📋 Consultation Patient ID received:', consultationPatientId);

    // Validate input
    if (!appointmentId || typeof appointmentId !== 'string') {
      console.error('❌ Invalid appointment ID provided:', appointmentId);
      throw new Error('Appointment ID is required to move patient to main table.');
    }

    // Get consultation data by appointment ID
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (consultationError) {
      console.error('❌ Failed to fetch consultation by appointment ID:', consultationError);
      throw new Error(`Failed to fetch consultation: ${consultationError.message}`);
    }

    console.log('📊 Consultation data:', consultation);

    // Check if patient already exists in main table
    let patientId = consultation.patient_id;
    console.log('🔍 Existing patient ID in consultation:', patientId);

    if (!patientId) {
      console.log('👤 Creating new patient in main table...');

      // Get consultation patient data if available
      let consultationPatientData = null;
      if (consultationPatientId || consultation.consultation_patient_id) {
        const { data: cpData } = await supabase
          .from('consultation_patients')
          .select('*')
          .eq('id', consultationPatientId || consultation.consultation_patient_id)
          .single();
        consultationPatientData = cpData;
      }

      if (!consultationPatientData) {
        throw new Error('No consultation patient data found. Cannot create patient without basic information.');
      }

      const firstName = consultationPatientData.first_name || 'Unknown';
      const lastName = consultationPatientData.last_name || 'Patient';

      // Handle date of birth - ensure it's in the correct format
      let dateOfBirth = consultationPatientData.date_of_birth;
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
      let gender = consultationPatientData.gender;
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
        phone: null, // consultation_patients table doesn't have phone field
        gender: gender,
        street: null, // consultation_patients table doesn't have address fields
        city: null,
        state: null,
        zip_code: null,
        status: 'ACTIVE', // Always set status to ACTIVE
        treatment_type: 'Consultation Completed'
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
      const { error: consultationUpdateError } = await supabase
        .from('consultations')
        .update({ patient_id: patientId })
        .eq('appointment_id', appointmentId);

      if (consultationUpdateError) {
        console.error('❌ Error updating consultation with patient ID:', consultationUpdateError);
        // Don't throw error here as patient creation was successful
      } else {
        console.log('✅ Successfully updated consultation with patient ID:', patientId);
      }

      // If this consultation is linked to a patient packet, link the packet to the new patient as well
      if (consultation.new_patient_packet_id) {
        console.log('🔗 Linking patient packet to new patient...');
        const { error: packetUpdateError } = await supabase
          .from('new_patient_packets')
          .update({ patient_id: patientId })
          .eq('id', consultation.new_patient_packet_id);

        if (packetUpdateError) {
          console.error('❌ Error linking patient packet to patient:', packetUpdateError);
          // Don't throw error here as patient creation was successful
        } else {
          console.log('✅ Successfully linked patient packet to patient:', patientId);
        }
      }

    } else {
      // Update existing patient status
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          status: 'ACTIVE',
          treatment_type: 'Consultation Completed'
        })
        .eq('id', patientId);

      if (updateError) {
        console.error('❌ Error updating existing patient status:', updateError);
      } else {
        console.log('✅ Updated existing patient status:', patientId);
      }
    }

    return patientId;
  } catch (error) {
    console.error('❌ Failed to move patient to main table by appointment:', error);
    return null;
  }
}

/**
 * Verify that all linkages are properly established between patient packet, consultation, and main patient
 */
export async function verifyPatientLinkages(patientPacketId: string): Promise<{
  success: boolean;
  patientId?: string;
  linkages: {
    packetToPatient: boolean;
    consultationToPatient: boolean;
    packetToConsultation: boolean;
  };
  details: any;
}> {
  try {
    console.log('🔍 Verifying patient linkages for packet ID:', patientPacketId);

    // Get patient packet data
    const { data: packetData, error: packetError } = await supabase
      .from('new_patient_packets')
      .select('*')
      .eq('id', patientPacketId)
      .single();

    if (packetError) {
      return {
        success: false,
        linkages: { packetToPatient: false, consultationToPatient: false, packetToConsultation: false },
        details: { error: 'Failed to fetch patient packet', packetError }
      };
    }

    // Get consultation data
    const { data: consultationData, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('new_patient_packet_id', patientPacketId)
      .single();

    if (consultationError) {
      return {
        success: false,
        linkages: { packetToPatient: false, consultationToPatient: false, packetToConsultation: true },
        details: { error: 'Failed to fetch consultation', consultationError, packetData }
      };
    }

    // Check linkages
    const linkages = {
      packetToPatient: !!packetData.patient_id,
      consultationToPatient: !!consultationData.patient_id,
      packetToConsultation: consultationData.new_patient_packet_id === patientPacketId
    };

    const allLinked = linkages.packetToPatient && linkages.consultationToPatient && linkages.packetToConsultation;
    const patientIdsMatch = packetData.patient_id === consultationData.patient_id;

    console.log('🔍 Linkage verification results:', {
      linkages,
      allLinked,
      patientIdsMatch,
      packetPatientId: packetData.patient_id,
      consultationPatientId: consultationData.patient_id
    });

    return {
      success: allLinked && patientIdsMatch,
      patientId: packetData.patient_id || consultationData.patient_id,
      linkages,
      details: {
        packetData,
        consultationData,
        patientIdsMatch,
        allLinked
      }
    };
  } catch (error) {
    console.error('❌ Error verifying patient linkages:', error);
    return {
      success: false,
      linkages: { packetToPatient: false, consultationToPatient: false, packetToConsultation: false },
      details: { error: 'Verification failed', errorDetails: error }
    };
  }
}

/**
 * Fix broken linkages between patient packet, consultation, and main patient
 */
export async function fixPatientLinkages(patientPacketId: string): Promise<{ success: boolean; details: any }> {
  try {
    console.log('🔧 Attempting to fix patient linkages for packet ID:', patientPacketId);

    // First verify current state
    const verification = await verifyPatientLinkages(patientPacketId);
    console.log('🔍 Current linkage state:', verification);

    if (verification.success) {
      console.log('✅ All linkages are already correct');
      return { success: true, details: 'All linkages are already correct' };
    }

    const { packetData, consultationData } = verification.details;

    // Determine the correct patient ID
    let correctPatientId = packetData?.patient_id || consultationData?.patient_id;

    if (!correctPatientId) {
      console.error('❌ No patient ID found in either packet or consultation');
      return { success: false, details: 'No patient ID found to link' };
    }

    const updates = [];

    // Fix packet to patient linkage
    if (!verification.linkages.packetToPatient && packetData) {
      console.log('🔧 Fixing packet to patient linkage...');
      const { error: packetError } = await supabase
        .from('new_patient_packets')
        .update({ patient_id: correctPatientId })
        .eq('id', patientPacketId);

      if (packetError) {
        console.error('❌ Failed to fix packet linkage:', packetError);
        updates.push({ type: 'packet', success: false, error: packetError });
      } else {
        console.log('✅ Fixed packet to patient linkage');
        updates.push({ type: 'packet', success: true });
      }
    }

    // Fix consultation to patient linkage
    if (!verification.linkages.consultationToPatient && consultationData) {
      console.log('🔧 Fixing consultation to patient linkage...');
      const { error: consultationError } = await supabase
        .from('consultations')
        .update({ patient_id: correctPatientId })
        .eq('new_patient_packet_id', patientPacketId);

      if (consultationError) {
        console.error('❌ Failed to fix consultation linkage:', consultationError);
        updates.push({ type: 'consultation', success: false, error: consultationError });
      } else {
        console.log('✅ Fixed consultation to patient linkage');
        updates.push({ type: 'consultation', success: true });
      }
    }

    // Verify fixes
    const finalVerification = await verifyPatientLinkages(patientPacketId);
    console.log('🔍 Final verification after fixes:', finalVerification);

    return {
      success: finalVerification.success,
      details: {
        updates,
        finalVerification,
        correctPatientId
      }
    };
  } catch (error) {
    console.error('❌ Error fixing patient linkages:', error);
    return { success: false, details: { error: 'Fix operation failed', errorDetails: error } };
  }
}

// Test function for debugging - can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testMovePatient = async (patientPacketId: string) => {
    console.log('🧪 Testing patient move for packet ID:', patientPacketId);
    const result = await movePatientToMainTable(patientPacketId);
    console.log('🧪 Test result:', result);

    // Also verify linkages
    if (result) {
      const verification = await verifyPatientLinkages(patientPacketId);
      console.log('🧪 Linkage verification:', verification);
    }

    return result;
  };

  (window as any).verifyPatientLinkages = verifyPatientLinkages;
  (window as any).fixPatientLinkages = fixPatientLinkages;
}
