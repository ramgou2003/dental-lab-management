import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Track ongoing uploads to prevent duplicates
const ongoingUploads = new Set<string>();

// Upload audio recording to Supabase Storage
// Upload audio recording to Supabase Storage
export async function uploadAudioRecording(
  audioBlob: Blob,
  appointmentId: string,
  patientName?: string,
  type: 'consultation' | 'encounter' = 'encounter'
): Promise<string | null> {
  // Create a unique key for this upload to prevent duplicates
  const uploadKey = `${appointmentId}-${audioBlob.size}-${Date.now()}`;

  // Check if this upload is already in progress
  if (ongoingUploads.has(uploadKey)) {
    console.log('Upload already in progress for:', uploadKey);
    return null;
  }

  // Mark this upload as in progress
  ongoingUploads.add(uploadKey);

  try {
    console.log('Starting audio upload:', {
      size: audioBlob.size,
      type: audioBlob.type,
      appointmentId,
      patientName,
      uploadKey
    });

    // Determine file extension based on blob type
    let fileExt = 'webm';
    if (audioBlob.type.includes('mp4')) {
      fileExt = 'mp4';
    } else if (audioBlob.type.includes('ogg')) {
      fileExt = 'ogg';
    } else if (audioBlob.type.includes('wav')) {
      fileExt = 'wav';
    }

    // Determine bucket based on type
    const bucketName = type === 'consultation' ? 'consultation-recordings' : 'encounter-recordings';
    const folderPrefix = type === 'consultation' ? 'consultations' : 'encounters';
    const filePrefix = type === 'consultation' ? 'consultation' : 'encounter';

    // Create a unique filename with timestamp, appointment ID, and blob size for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const patientPrefix = patientName ? `${patientName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
    const uniqueId = `${timestamp}_${audioBlob.size}_${Math.random().toString(36).substr(2, 9)}`;

    const fileName = `${patientPrefix}${filePrefix}_${appointmentId}_${uniqueId}.${fileExt}`;
    // Structure: [FolderPrefix]/[AppointmentID]/[FileName]
    const filePath = `${folderPrefix}/${appointmentId}/${fileName}`;

    console.log(`Uploading to ${bucketName} at path:`, filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, audioBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: audioBlob.type || 'audio/webm'
      });

    if (error) {
      console.error('Supabase storage error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      toast.error('Failed to save recording to storage');
      return null;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);
    toast.success('Recording saved successfully');
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading audio recording:', error);
    toast.error('Failed to save recording');
    return null;
  } finally {
    // Remove the upload key from ongoing uploads
    ongoingUploads.delete(uploadKey);
  }
}

// Save recording metadata to database
export async function saveRecordingMetadata(
  appointmentId: string,
  audioUrl: string,
  duration: number,
  patientName?: string
): Promise<boolean> {
  try {
    console.log('Saving recording metadata:', {
      appointmentId,
      audioUrl,
      duration,
      patientName
    });

    // Logic to update appointment notes with recording info has been removed as per user request.
    // The recording is already saved in storage and will be listed via file listing.
    console.log('Recording uploaded successfully. Metadata note addition skipped.');
    return true;
  } catch (error) {
    console.error('Error saving recording metadata:', error);
    toast.error('Failed to save recording metadata');
    return false;
  }
}

// List recordings for an appointment
export async function listRecordingsForAppointment(
  appointmentId: string,
  type: 'consultation' | 'encounter' = 'encounter'
): Promise<string[]> {
  try {
    console.log(`Listing ${type} recordings for appointment:`, appointmentId);

    const bucketName = type === 'consultation' ? 'consultation-recordings' : 'encounter-recordings';
    const folderPrefix = type === 'consultation' ? 'consultations' : 'encounters';

    // Fetch from both new structure (root) and potential legacy structure (folderPrefix)
    const [rootResult, legacyResult] = await Promise.all([
      supabase.storage
        .from(bucketName)
        .list(`${appointmentId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        }),
      supabase.storage
        .from(bucketName)
        .list(`${folderPrefix}/${appointmentId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })
    ]);

    // Process root files
    const rootFiles = (rootResult.data || []).filter(file =>
      file.name.endsWith('.webm') ||
      file.name.endsWith('.mp4') ||
      file.name.endsWith('.ogg') ||
      file.name.endsWith('.wav')
    ).map(file => ({
      ...file,
      // Add a property to know where this file came from for URL generation
      _sourcePath: `${appointmentId}/${file.name}`
    }));

    // Process legacy files
    const legacyFiles = (legacyResult.data || []).filter(file =>
      file.name.endsWith('.webm') ||
      file.name.endsWith('.mp4') ||
      file.name.endsWith('.ogg') ||
      file.name.endsWith('.wav')
    ).map(file => ({
      ...file,
      _sourcePath: `${folderPrefix}/${appointmentId}/${file.name}`
    }));

    // Combine all files
    const allFiles = [...rootFiles, ...legacyFiles];

    if (allFiles.length === 0) {
      if (rootResult.error) console.error('Error listing root recordings:', rootResult.error);
      if (legacyResult.error) console.error('Error listing legacy recordings:', legacyResult.error);
      return [];
    }

    // Remove duplicates based on file size and creation time proximity
    const uniqueFiles = removeDuplicateFiles(allFiles);

    const urls = uniqueFiles.map(file => {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file._sourcePath);
      return urlData.publicUrl;
    });

    console.log('Found recordings (after deduplication):', urls);
    return urls;
  } catch (error) {
    console.error('Error listing recordings:', error);
    return [];
  }
}

// Helper function to remove duplicate files based on size and creation time
function removeDuplicateFiles(files: any[]): any[] {
  const seen = new Map<string, any>();

  for (const file of files) {
    // Create a key based on file size and rounded creation time (within 5 minutes)
    const createdAt = new Date(file.created_at);
    const roundedTime = Math.floor(createdAt.getTime() / (5 * 60 * 1000)); // 5-minute intervals
    const key = `${file.metadata?.size || 0}-${roundedTime}`;

    // Keep the first file for each unique key (most recent due to sorting)
    if (!seen.has(key)) {
      seen.set(key, file);
    } else {
      // Log potential duplicate
      console.log('Potential duplicate detected:', file.name, 'vs', seen.get(key)?.name);
    }
  }

  return Array.from(seen.values());
}

// Delete a recording
export async function deleteRecording(recordingUrl: string): Promise<boolean> {
  try {
    console.log('Deleting recording:', recordingUrl);

    // Extract file path from URL
    const url = new URL(recordingUrl);
    const pathParts = url.pathname.split('/').filter(part => part !== '');

    // Determine bucket from URL
    let bucketName = '';
    let bucketIndex = -1;

    if (pathParts.includes('consultation-recordings')) {
      bucketName = 'consultation-recordings';
      bucketIndex = pathParts.indexOf('consultation-recordings');
    } else if (pathParts.includes('encounter-recordings')) {
      bucketName = 'encounter-recordings';
      bucketIndex = pathParts.indexOf('encounter-recordings');
    }

    if (bucketIndex === -1) {
      console.error('Could not find known bucket name (consultation-recordings or encounter-recordings) in URL:', recordingUrl);
      return false;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    console.log(`Extracted file path for deletion from ${bucketName}:`, filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
      return false;
    }

    console.log('Recording deleted successfully');
    toast.success('Recording deleted');
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    toast.error('Failed to delete recording');
    return false;
  }
}
