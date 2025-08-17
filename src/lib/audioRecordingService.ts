import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Upload audio recording to Supabase Storage
export async function uploadAudioRecording(
  audioBlob: Blob, 
  appointmentId: string, 
  patientName?: string
): Promise<string | null> {
  try {
    console.log('Starting audio upload:', { 
      size: audioBlob.size, 
      type: audioBlob.type, 
      appointmentId,
      patientName 
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

    // Create a unique filename with timestamp and appointment ID
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const patientPrefix = patientName ? `${patientName.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
    const fileName = `${patientPrefix}consultation_${appointmentId}_${timestamp}.${fileExt}`;
    const filePath = `consultations/${appointmentId}/${fileName}`;

    console.log('Uploading to path:', filePath);

    // Upload to Supabase Storage - using dedicated audio bucket
    const { data, error } = await supabase.storage
      .from('consultation-recordings')
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
      .from('consultation-recordings')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);
    toast.success('Recording saved successfully');
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading audio recording:', error);
    toast.error('Failed to save recording');
    return null;
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

    // For now, we'll add a note to the appointment with the recording info
    // In the future, you might want to create a dedicated recordings table
    const recordingNote = `🎙️ Audio Recording: ${duration}s - ${new Date().toLocaleString()}`;

    // First get the current notes
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('notes')
      .eq('id', appointmentId)
      .single();

    if (fetchError) {
      console.error('Error fetching appointment:', fetchError);
      toast.error('Failed to save recording metadata');
      return false;
    }

    // Append the new recording note
    const currentNotes = appointment?.notes || '';
    const updatedNotes = currentNotes ? `${currentNotes}\n${recordingNote}` : recordingNote;

    const { error } = await supabase
      .from('appointments')
      .update({ notes: updatedNotes })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error saving recording metadata:', error);
      toast.error('Failed to save recording metadata');
      return false;
    }

    console.log('Recording metadata saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving recording metadata:', error);
    toast.error('Failed to save recording metadata');
    return false;
  }
}

// List recordings for an appointment
export async function listRecordingsForAppointment(appointmentId: string): Promise<string[]> {
  try {
    console.log('Listing recordings for appointment:', appointmentId);

    const { data, error } = await supabase.storage
      .from('consultation-recordings')
      .list(`consultations/${appointmentId}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing recordings:', error);
      return [];
    }

    // Filter for audio files and get public URLs
    const audioFiles = data?.filter(file => 
      file.name.endsWith('.webm') || 
      file.name.endsWith('.mp4') || 
      file.name.endsWith('.ogg') || 
      file.name.endsWith('.wav')
    ) || [];

    const urls = audioFiles.map(file => {
      const { data: urlData } = supabase.storage
        .from('consultation-recordings')
        .getPublicUrl(`consultations/${appointmentId}/${file.name}`);
      return urlData.publicUrl;
    });

    console.log('Found recordings:', urls);
    return urls;
  } catch (error) {
    console.error('Error listing recordings:', error);
    return [];
  }
}

// Delete a recording
export async function deleteRecording(recordingUrl: string): Promise<boolean> {
  try {
    console.log('Deleting recording:', recordingUrl);

    // Extract file path from URL
    const url = new URL(recordingUrl);
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    const bucketIndex = pathParts.findIndex(part => part === 'consultation-recordings');

    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', recordingUrl);
      return false;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    console.log('Extracted file path for deletion:', filePath);

    const { error } = await supabase.storage
      .from('consultation-recordings')
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
