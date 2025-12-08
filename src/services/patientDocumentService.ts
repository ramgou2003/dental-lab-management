import { supabase } from '@/lib/supabase';

export interface PatientDocument {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  category: string;
  title?: string;
  description?: string;
  document_date?: string;
  uploaded_by?: string;
  uploaded_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgressInfo {
  progress: number;
  loaded: number;
  total: number;
}

export const patientDocumentService = {
  async uploadDocument(
    patientId: string,
    file: File,
    category: string,
    title?: string,
    description?: string,
    documentDate?: string,
    uploadedBy?: string,
    uploadedById?: string,
    onProgress?: (info: UploadProgressInfo) => void
  ): Promise<PatientDocument> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${category}/${Date.now()}.${fileExt}`;

    // Get the storage URL and auth token for direct upload with progress
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const uploadUrl = `${supabaseUrl}/storage/v1/object/patient-documents/${fileName}`;
    const authToken = session?.access_token || supabaseAnonKey;

    // Upload file with XMLHttpRequest for real progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 90); // 90% for upload
          onProgress({
            progress,
            loaded: event.loaded,
            total: event.total
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.send(file);
    });

    if (onProgress) onProgress({ progress: 92, loaded: file.size, total: file.size });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(fileName);

    if (onProgress) onProgress({ progress: 95, loaded: file.size, total: file.size });

    // Save document metadata to database
    const { data, error } = await (supabase as any)
      .from('patient_documents')
      .insert({
        patient_id: patientId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        category,
        title: title || file.name,
        description,
        document_date: documentDate || new Date().toISOString().split('T')[0],
        uploaded_by: uploadedBy,
        uploaded_by_id: uploadedById,
      })
      .select()
      .single();

    if (error) throw error;

    if (onProgress) onProgress({ progress: 100, loaded: file.size, total: file.size });

    return data;
  },

  async getDocumentsByPatient(patientId: string): Promise<PatientDocument[]> {
    const { data, error } = await (supabase as any)
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDocumentsByCategory(patientId: string, category: string): Promise<PatientDocument[]> {
    const { data, error } = await (supabase as any)
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteDocument(document: PatientDocument): Promise<void> {
    // Extract file path from URL
    const urlParts = document.file_url.split('/patient-documents/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from('patient-documents').remove([filePath]);
    }

    // Delete from database
    const { error } = await (supabase as any)
      .from('patient_documents')
      .delete()
      .eq('id', document.id);

    if (error) throw error;
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

