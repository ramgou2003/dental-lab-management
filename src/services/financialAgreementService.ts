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
  balance_due_date?: string;
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
  scanned_to_chart?: boolean;
  countersigned_by_manager?: boolean;
  
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
    balance_due_date: formData.balanceDueDate || null,
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
    scanned_to_chart: formData.scannedToChart || false,
    countersigned_by_manager: formData.countersignedByManager || false,
    
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
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating financial agreement:', error);
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
