import { supabase } from "@/integrations/supabase/client";

// Cast to any to access tables not in TypeScript types
const db = supabase as any;

export interface PatientDocument {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  category: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const DOCUMENT_CATEGORIES = [
  { value: 'xray', label: 'X-Ray' },
  { value: 'scan', label: 'Scan/CBCT' },
  { value: 'photo', label: 'Photo' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'consent', label: 'Consent Form' },
  { value: 'lab', label: 'Lab Report' },
  { value: 'referral', label: 'Referral' },
  { value: 'general', label: 'General' },
];

// Upload document to Supabase Storage
export async function uploadPatientDocument(
  file: File,
  patientId: string,
  category: string = 'general',
  description: string = '',
  uploadedBy: string | null = null
): Promise<PatientDocument | null> {
  try {
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${patientId}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await db.storage
      .from('patient-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = db.storage
      .from('patient-documents')
      .getPublicUrl(filePath);

    // Save record to database
    const { data, error } = await db
      .from('patient_documents')
      .insert({
        patient_id: patientId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        category,
        description: description || null,
        uploaded_by: uploadedBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving document record:', error);
      // Try to delete the uploaded file
      await db.storage.from('patient-documents').remove([filePath]);
      return null;
    }

    return data as PatientDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}

// Get all documents for a patient
export async function getPatientDocuments(patientId: string): Promise<PatientDocument[]> {
  try {
    const { data, error } = await db
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data as PatientDocument[];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

// Delete a document
export async function deletePatientDocument(document: PatientDocument): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(document.file_url);
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    const bucketIndex = pathParts.findIndex(part => part === 'patient-documents');

    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      await db.storage.from('patient-documents').remove([filePath]);
    }

    // Delete database record
    const { error } = await db
      .from('patient_documents')
      .delete()
      .eq('id', document.id);

    if (error) {
      console.error('Error deleting document record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// Update document metadata
export async function updatePatientDocument(
  documentId: string,
  updates: { category?: string; description?: string }
): Promise<boolean> {
  try {
    const { error } = await db
      .from('patient_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating document:', error);
    return false;
  }
}

