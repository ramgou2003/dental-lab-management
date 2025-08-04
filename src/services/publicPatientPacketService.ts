import { createClient } from '@supabase/supabase-js';
import { NewPatientFormData } from '@/types/newPatientPacket';
import { NewPatientPacketDB } from '@/types/supabasePatientPacket';
import { convertFormDataToDatabase } from '@/utils/patientPacketConverter';

// For public submissions, we might need to use a different approach
// This service handles public form submissions without authentication

const SUPABASE_URL = "https://tofoatpggdudjvgoixwp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZm9hdHBnZ2R1ZGp2Z29peHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyOTE5NTEsImV4cCI6MjA2NDg2Nzk1MX0.szgJXH6rKE7DY4uB6SvITfNQXJeOjJUB5lZQGsiqIGs";

// Create a dedicated client for public operations
const publicSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Don't persist sessions for public operations
    autoRefreshToken: false, // Don't auto-refresh tokens
  }
});

/**
 * Save a patient packet from a public form submission
 * This function handles the submission without requiring authentication
 */
export async function savePublicPatientPacket(
  formData: NewPatientFormData,
  leadId: string
): Promise<{ data: NewPatientPacketDB | null; error: any }> {
  try {
    console.log('Starting public patient packet submission...');
    console.log('Lead ID:', leadId);
    console.log('Form data summary:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    });

    // Convert form data to database format
    const dbData = convertFormDataToDatabase(formData, undefined, leadId, 'public');
    
    console.log('Converted database data:', {
      first_name: dbData.first_name,
      last_name: dbData.last_name,
      email: dbData.email,
      lead_id: dbData.lead_id,
      submission_source: dbData.submission_source
    });

    // Try to insert the data
    console.log('Attempting to insert patient packet...');
    const { data, error } = await publicSupabase
      .from('new_patient_packets')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting patient packet:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { data: null, error };
    }

    console.log('Patient packet inserted successfully:', data);
    return { data, error: null };

  } catch (error) {
    console.error('Unexpected error in savePublicPatientPacket:', error);
    return { data: null, error };
  }
}

/**
 * Add a comment to the lead about packet completion
 */
export async function addLeadComment(
  leadId: string,
  patientName: string,
  packetId?: string
): Promise<{ success: boolean; error: any }> {
  try {
    console.log('Adding comment to lead:', leadId);
    
    const { error } = await publicSupabase
      .from('lead_comments')
      .insert({
        lead_id: leadId,
        user_id: null, // Use null instead of 'patient' since user_id expects UUID
        user_name: patientName,
        comment: packetId
          ? `Patient packet completed and submitted. Packet ID: ${packetId}`
          : 'Patient packet completed and submitted.',
        comment_type: 'important' // Use 'important' since 'packet_completed' is not allowed
      });

    if (error) {
      console.error('Error adding lead comment:', error);
      return { success: false, error };
    }

    console.log('Lead comment added successfully');
    return { success: true, error: null };

  } catch (error) {
    console.error('Unexpected error adding lead comment:', error);
    return { success: false, error };
  }
}

/**
 * Complete public patient packet submission with comment
 */
export async function completePublicSubmission(
  formData: NewPatientFormData,
  leadId: string
): Promise<{ success: boolean; data: NewPatientPacketDB | null; error: any }> {
  try {
    // Save the patient packet
    const { data, error } = await savePublicPatientPacket(formData, leadId);
    
    if (error) {
      return { success: false, data: null, error };
    }

    // Add comment to lead
    const patientName = `${formData.firstName} ${formData.lastName}`;
    const { success: commentSuccess, error: commentError } = await addLeadComment(
      leadId, 
      patientName, 
      data?.id
    );

    if (!commentSuccess) {
      console.warn('Patient packet saved but comment failed:', commentError);
      // Don't fail the whole submission for comment error
    }

    return { success: true, data, error: null };

  } catch (error) {
    console.error('Error in completePublicSubmission:', error);
    return { success: false, data: null, error };
  }
}
