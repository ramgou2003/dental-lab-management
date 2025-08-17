# Audio Recordings Setup Guide

## Overview
This guide explains how to set up audio recording functionality for consultation sessions in the dental lab management system.

## Current Implementation
The audio recording feature is currently implemented to use the existing `surgical-recall-images` bucket for storing audio files. While this works, it's recommended to create a dedicated bucket for better organization.

## Features Implemented

### 🎙️ **Recording Functionality**
- **Live Audio Recording**: Record consultation sessions with real-time audio visualization
- **Audio Visualizer**: 20-bar visualizer with live dB level display
- **Automatic Upload**: Recordings are automatically saved to Supabase Storage when stopped
- **Metadata Storage**: Recording information is added to appointment notes

### 📁 **File Management**
- **Organized Storage**: Files stored in `consultations/{appointmentId}/` folders
- **Unique Filenames**: Timestamped filenames with patient names
- **Multiple Formats**: Supports WebM, MP4, OGG, and WAV formats
- **Public URLs**: Generates accessible URLs for playback and download

### 🎵 **Playback & Management**
- **Recording List**: View all recordings for a consultation
- **Audio Player**: Built-in play/pause controls
- **Download**: Download recordings for offline use
- **Delete**: Remove unwanted recordings with confirmation

## Recommended Bucket Setup (Optional)

For better organization, create a dedicated audio recordings bucket:

### 1. Create Bucket in Supabase Dashboard
1. Go to Storage in your Supabase dashboard
2. Click "Create bucket"
3. Name: `consultation-recordings`
4. Make it public: ✅
5. File size limit: `50MB` (52,428,800 bytes)
6. Allowed MIME types:
   - `audio/webm`
   - `audio/mp4`
   - `audio/ogg`
   - `audio/wav`
   - `audio/mpeg`

### 2. Update Code (if using dedicated bucket)
If you create the dedicated bucket, update the bucket name in:
- `src/lib/audioRecordingService.ts` (change `surgical-recall-images` to `consultation-recordings`)

### 3. Set Up Storage Policies
Create RLS policies for the bucket:

```sql
-- Allow authenticated users to upload recordings
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'consultation-recordings');

-- Allow authenticated users to view recordings
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'consultation-recordings');

-- Allow authenticated users to delete their recordings
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'consultation-recordings');
```

## Usage Instructions

### For Users
1. **Start Recording**: Click "Record Consultation" button during a session
2. **Grant Permission**: Allow microphone access when prompted
3. **Monitor Audio**: Watch the live audio visualizer to ensure proper recording
4. **Stop Recording**: Click "Stop & Save" to end and automatically save the recording
5. **View Recordings**: Scroll down in the patient information panel to see saved recordings
6. **Playback**: Use play/pause controls to listen to recordings
7. **Download**: Click download button to save recordings locally
8. **Delete**: Click trash button to remove unwanted recordings

### Technical Details
- **Audio Format**: Primary format is WebM with Opus codec
- **Fallback Formats**: MP4, OGG supported based on browser compatibility
- **File Naming**: `{PatientName}_consultation_{AppointmentID}_{Timestamp}.{ext}`
- **Storage Path**: `consultations/{appointmentId}/{filename}`
- **Metadata**: Recording duration and timestamp added to appointment notes

## Browser Compatibility
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari (limited format support)
- ✅ Edge

## Security Considerations
- Recordings require microphone permission
- Files are stored with public URLs (consider privacy implications)
- RLS policies should be configured for production use
- Consider HIPAA compliance requirements for medical recordings

## Troubleshooting

### Recording Not Working
1. Check microphone permissions in browser
2. Ensure HTTPS connection (required for microphone access)
3. Check browser console for errors
4. Verify Supabase storage configuration

### Upload Failures
1. Check file size limits (current: 10MB for existing bucket)
2. Verify Supabase storage policies
3. Check network connectivity
4. Ensure proper authentication

### Playback Issues
1. Verify file format compatibility
2. Check browser audio codec support
3. Ensure files uploaded successfully
4. Test with different browsers

## Future Enhancements
- [ ] Dedicated audio recordings bucket
- [ ] Audio transcription integration
- [ ] Recording quality settings
- [ ] Automatic recording cleanup
- [ ] Enhanced metadata storage
- [ ] Recording search functionality
- [ ] Audio compression options
- [ ] Batch download functionality
