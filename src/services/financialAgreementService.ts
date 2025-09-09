import { supabase } from '@/integrations/supabase/client';

export interface FinancialAgreementData {
  // References
  patient_id?: string;
  lead_id?: string;
  new_patient_packet_id?: string;
  
  // Section 1: Patient & Treatment Identification
  patient_name: string;
  chart_number?: string;
  date_of_birth?: string;
  date_of_execution: string;
  time_of_execution: string;
  
  // Accepted Treatments (stored as JSONB array)
  accepted_treatments: Array<{
    service: string;
    fee: string;
    cdtCode: string;
    cptCode: string;
    initials: string;
  }>;
  total_cost_of_treatment?: number;
  
  // Section 2: Payment & Balance Terms
  patient_payment_today?: number;
  remaining_balance?: number;
  remaining_payment_plan?: string;
  payment_amount?: number;
  payment_terms_initials?: string;
  
  // Section 3: Non-Refundable & Lab Fees
  lab_fee_initials?: string;
  
  // Section 4: Warranty & Care Package Conditions
  care_package_fee?: number;
  care_package_election?: 'enroll' | 'defer';
  warranty_initials?: string;
  
  // Section 5: Capacity, Language & HIPAA
  capacity_confirmed?: boolean;
  hipaa_acknowledged?: boolean;
  capacity_initials?: string;
  
  // Section 6: Dispute Resolution
  dispute_initials?: string;
  
  // Section 7: Signatures
  terms_agreed?: boolean;
  patient_signature?: string;
  patient_signature_date?: string;
  patient_signature_time?: string;
  witness_name?: string;
  witness_role?: string;
  witness_signature?: string;
  witness_signature_date?: string;
  witness_signature_time?: string;
  
  // Section 8: Office Use Only
  downloaded_to_dental_management_software?: boolean;
  confirmed_by_staff_initials?: string;
  
  // Status and Metadata
  status?: 'draft' | 'completed' | 'signed' | 'executed';
  form_version?: string;
}

/**
 * Convert form data from FinancialAgreementForm to database format
 */
export function convertFormDataToDatabase(formData: any, patientId?: string, leadId?: string, newPatientPacketId?: string): FinancialAgreementData {
  console.log('🔄 Converting form data to database format...');
  console.log('📋 Input parameters:', { patientId, leadId, newPatientPacketId });
  console.log('📝 Form data received:', {
    patientName: formData.patientName,
    dateOfExecution: formData.dateOfExecution,
    timeOfExecution: formData.timeOfExecution,
    acceptedTreatments: formData.acceptedTreatments,
    totalCostOfTreatment: formData.totalCostOfTreatment
  });

  const converted = {
    // References
    patient_id: patientId,
    lead_id: leadId,
    new_patient_packet_id: newPatientPacketId,

    // Section 1: Patient & Treatment Identification
    patient_name: formData.patientName || 'Unknown Patient',
    chart_number: formData.chartNumber || null,
    date_of_birth: formData.dateOfBirth || null,
    date_of_execution: formData.dateOfExecution || new Date().toISOString().split('T')[0],
    time_of_execution: formData.timeOfExecution || new Date().toTimeString().slice(0, 5),
    
    // Accepted Treatments
    accepted_treatments: Array.isArray(formData.acceptedTreatments) ? formData.acceptedTreatments : [],
    total_cost_of_treatment: formData.totalCostOfTreatment ? parseFloat(formData.totalCostOfTreatment) : null,
    
    // Section 2: Payment & Balance Terms
    patient_payment_today: formData.patientPaymentToday ? parseFloat(formData.patientPaymentToday) : null,
    remaining_balance: formData.remainingBalance ? parseFloat(formData.remainingBalance) : null,
    remaining_payment_plan: formData.remainingPaymentPlan || null,
    payment_amount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : null,
    payment_terms_initials: formData.paymentTermsInitials || null,
    
    // Section 3: Non-Refundable & Lab Fees
    lab_fee_initials: formData.labFeeInitials || null,
    
    // Section 4: Warranty & Care Package Conditions
    care_package_fee: formData.carePackageFee ? parseFloat(formData.carePackageFee) : null,
    care_package_election: formData.carePackageElection || null,
    warranty_initials: formData.warrantyInitials || null,
    
    // Section 5: Capacity, Language & HIPAA
    capacity_confirmed: formData.capacityConfirmed || false,
    hipaa_acknowledged: formData.hipaaAcknowledged || false,
    capacity_initials: formData.capacityInitials || null,
    
    // Section 6: Dispute Resolution
    dispute_initials: formData.disputeInitials || null,
    
    // Section 7: Signatures
    terms_agreed: formData.termsAgreed || false,
    patient_signature: formData.patientSignature || null,
    patient_signature_date: formData.patientSignatureDate || null,
    patient_signature_time: formData.patientSignatureTime || null,
    witness_name: formData.witnessName || null,
    witness_role: formData.witnessRole || null,
    witness_signature: formData.witnessSignature || null,
    witness_signature_date: formData.witnessSignatureDate || null,
    witness_signature_time: formData.witnessSignatureTime || null,
    
    // Section 8: Office Use Only
    downloaded_to_dental_management_software: formData.downloadedToDentalManagementSoftware || false,
    confirmed_by_staff_initials: formData.confirmedByStaffInitials || null,
    
    // Status and Metadata
    status: 'draft',
    form_version: '1.0'
  };

  console.log('✅ Conversion complete:', {
    patient_name: converted.patient_name,
    patient_id: converted.patient_id,
    accepted_treatments_count: converted.accepted_treatments.length,
    total_cost_of_treatment: converted.total_cost_of_treatment,
    status: converted.status
  });

  return converted;
}

/**
 * Save a financial agreement to the database
 */
export async function saveFinancialAgreement(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Converting financial agreement form data to database format...');
    console.log('📝 Raw form data:', {
      patientName: formData.patientName,
      acceptedTreatments: formData.acceptedTreatments,
      totalCostOfTreatment: formData.totalCostOfTreatment,
      patientPaymentToday: formData.patientPaymentToday,
      termsAgreed: formData.termsAgreed
    });

    const dbData = convertFormDataToDatabase(formData, patientId, leadId, newPatientPacketId);

    // Set status to completed for manual save
    dbData.status = 'completed';

    console.log('🗄️ Financial agreement database data prepared:', {
      patient_name: dbData.patient_name,
      patient_id: dbData.patient_id,
      lead_id: dbData.lead_id,
      new_patient_packet_id: dbData.new_patient_packet_id,
      total_cost_of_treatment: dbData.total_cost_of_treatment,
      accepted_treatments_count: dbData.accepted_treatments.length,
      accepted_treatments: dbData.accepted_treatments,
      status: dbData.status
    });

    // Test database connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('financial_agreements')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return { data: null, error: testError };
    }

    console.log('✅ Database connection successful');
    console.log('📤 Attempting to insert financial agreement...');
    const { data, error } = await supabase
      .from('financial_agreements')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error saving financial agreement:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('❌ Failed data:', dbData);
      return { data: null, error };
    }

    console.log('✅ Financial agreement saved successfully:', data);

    // Update patient chart number if provided and patient_id exists
    if (dbData.chart_number && dbData.patient_id) {
      console.log('📋 Updating patient chart number:', dbData.chart_number);
      await updatePatientChartNumber(dbData.patient_id, dbData.chart_number);
    }

    return { data, error: null };
  } catch (error) {
    console.error('💥 Unexpected error saving financial agreement:', error);
    console.error('💥 Error stack:', error.stack);
    return { data: null, error };
  }
}

/**
 * Update an existing financial agreement
 */
export async function updateFinancialAgreement(
  id: string,
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('Converting financial agreement form data to database format for update...');
    const dbData = convertFormDataToDatabase(formData, patientId, leadId, newPatientPacketId);

    // Set status to completed for manual update
    dbData.status = 'completed';

    console.log('Attempting to update financial agreement:', id);
    const { data, error } = await supabase
      .from('financial_agreements')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating financial agreement:', error);
      return { data: null, error };
    }

    console.log('Financial agreement updated successfully:', data);

    // Update patient chart number if provided and patient_id exists
    if (dbData.chart_number && dbData.patient_id) {
      console.log('📋 Updating patient chart number:', dbData.chart_number);
      await updatePatientChartNumber(dbData.patient_id, dbData.chart_number);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating financial agreement:', error);
    return { data: null, error };
  }
}

/**
 * Auto-save financial agreement (upsert with draft status)
 */
export async function autoSaveFinancialAgreement(
  formData: any,
  patientId?: string,
  leadId?: string,
  newPatientPacketId?: string,
  existingId?: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Auto-saving financial agreement...');
    const dbData = convertFormDataToDatabase(formData, patientId, leadId, newPatientPacketId);

    if (existingId) {
      // Check current status before updating
      console.log('📝 Checking current status of financial agreement:', existingId);
      const { data: currentRecord, error: fetchError } = await supabase
        .from('financial_agreements')
        .select('status')
        .eq('id', existingId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current status:', fetchError);
        return { data: null, error: fetchError };
      }

      // If form data explicitly sets status to completed (from submission), use that
      // Otherwise preserve completed status, or set to draft for auto-save
      if (formData.status === 'completed') {
        dbData.status = 'completed';
        console.log('📝 Form submission - setting status to completed');
      } else {
        dbData.status = currentRecord?.status === 'completed' ? 'completed' : 'draft';
        console.log('📝 Auto-save - preserving status or setting to draft:', dbData.status);
      }

      // Update existing record
      console.log('📝 Updating existing financial agreement with status:', dbData.status);
      const { data, error } = await supabase
        .from('financial_agreements')
        .update(dbData)
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating financial agreement:', error);
        return { data: null, error };
      }

      console.log('✅ Financial agreement auto-saved successfully:', data);
      return { data, error: null };
    } else {
      // Before creating a new form, check if there's already a draft form for this patient/lead
      console.log('🔍 Checking for existing draft financial agreements for patient:', patientId, 'lead:', leadId);
      const { data: existingDrafts, error: checkError } = await supabase
        .from('financial_agreements')
        .select('id')
        .eq('patient_id', patientId)
        .eq('status', 'draft')
        .limit(1);

      if (checkError) {
        console.error('Error checking for existing drafts:', checkError);
        // Continue with creation if check fails
      } else if (existingDrafts && existingDrafts.length > 0) {
        // Update the existing draft instead of creating a new one
        const existingDraftId = existingDrafts[0].id;
        console.log('📝 Found existing draft, updating instead of creating new:', existingDraftId);

        // If form data explicitly sets status to completed (from submission), use that
        // Otherwise set to draft for auto-save
        if (formData.status === 'completed') {
          dbData.status = 'completed';
          console.log('📝 Form submission - updating existing draft to completed');
        } else {
          dbData.status = 'draft';
          console.log('📝 Auto-save - keeping as draft');
        }

        const { data, error } = await supabase
          .from('financial_agreements')
          .update(dbData)
          .eq('id', existingDraftId)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating existing draft financial agreement:', error);
          return { data: null, error };
        }

        console.log('✅ Financial agreement auto-saved successfully (updated existing draft):', data);

        // Update patient chart number if provided and patient_id exists
        if (dbData.chart_number && dbData.patient_id) {
          console.log('📋 Auto-save: Updating patient chart number:', dbData.chart_number);
          await updatePatientChartNumber(dbData.patient_id, dbData.chart_number);
        }

        return { data, error: null };
      }

      // Create new record - use completed status if explicitly set, otherwise draft
      if (formData.status === 'completed') {
        dbData.status = 'completed';
        console.log('📝 Creating new financial agreement with completed status');
      } else {
        dbData.status = 'draft';
        console.log('📝 Creating new financial agreement draft');
      }
      const { data, error } = await supabase
        .from('financial_agreements')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating financial agreement:', error);
        return { data: null, error };
      }

      console.log('✅ Financial agreement auto-saved successfully:', data);

      // Update patient chart number if provided and patient_id exists
      if (dbData.chart_number && dbData.patient_id) {
        console.log('📋 Auto-save: Updating patient chart number:', dbData.chart_number);
        await updatePatientChartNumber(dbData.patient_id, dbData.chart_number);
      }

      return { data, error: null };
    }
  } catch (error) {
    console.error('❌ Error auto-saving financial agreement:', error);
    return { data: null, error };
  }
}

/**
 * Get financial agreements for a patient
 */
export async function getFinancialAgreementsByPatientId(patientId: string): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('financial_agreements')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial agreements:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching financial agreements:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific financial agreement by ID
 */
export async function getFinancialAgreement(id: string): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('financial_agreements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching financial agreement:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching financial agreement:', error);
    return { data: null, error };
  }
}

/**
 * Delete a financial agreement by ID
 */
export async function deleteFinancialAgreement(id: string): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🗑️ Attempting to delete financial agreement:', id);
    const { data, error } = await supabase
      .from('financial_agreements')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error deleting financial agreement:', error);
      return { data: null, error };
    }

    console.log('✅ Financial agreement deleted successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('💥 Unexpected error deleting financial agreement:', error);
    return { data: null, error };
  }
}

/**
 * Update patient chart number in the patients table
 */
export async function updatePatientChartNumber(
  patientId: string,
  chartNumber: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('📋 Updating patient chart number:', { patientId, chartNumber });

    const { data, error } = await supabase
      .from('patients')
      .update({ chart_number: chartNumber })
      .eq('id', patientId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating patient chart number:', error);
      return { data: null, error };
    }

    console.log('✅ Patient chart number updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('💥 Unexpected error updating patient chart number:', error);
    return { data: null, error };
  }
}

/**
 * Sync chart number from patient profile to all related financial agreements
 */
export async function syncChartNumberToFinancialAgreements(
  patientId: string,
  chartNumber: string
): Promise<{ data: any | null; error: any }> {
  try {
    console.log('🔄 Syncing chart number to financial agreements:', { patientId, chartNumber });

    const { data, error } = await supabase
      .from('financial_agreements')
      .update({ chart_number: chartNumber })
      .eq('patient_id', patientId)
      .select();

    if (error) {
      console.error('❌ Error syncing chart number to financial agreements:', error);
      return { data: null, error };
    }

    console.log('✅ Chart number synced to financial agreements successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('💥 Unexpected error syncing chart number:', error);
    return { data: null, error };
  }
}
