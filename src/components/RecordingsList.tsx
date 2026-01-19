import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Download,
  Trash2,
  Volume2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { listRecordingsForAppointment, deleteRecording } from "@/lib/audioRecordingService";
import { toast } from "sonner";

import { RecordingPlayerDialog } from "@/components/RecordingPlayerDialog";

interface RecordingsListProps {
  appointmentId: string;
  patientName?: string;
  isReadOnly?: boolean;
  type?: 'consultation' | 'encounter';
}

export function RecordingsList({ appointmentId, patientName, isReadOnly = false, type = 'encounter' }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioDurations, setAudioDurations] = useState<Map<string, number>>(new Map());

  // Player Dialog State
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [playingRecordingUrl, setPlayingRecordingUrl] = useState<string | null>(null);
  const [playingRecordingTitle, setPlayingRecordingTitle] = useState<string>('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, [appointmentId]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const recordingUrls = await listRecordingsForAppointment(appointmentId, type);
      setRecordings(recordingUrls);

      // Load durations for each recording
      recordingUrls.forEach(url => {
        loadAudioDuration(url);
      });
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const loadAudioDuration = (url: string) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';

    const onLoaded = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setAudioDurations(prev => new Map(prev.set(url, audio.duration)));
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('canplaythrough', onLoaded); // Redundant backup

    // Set the source after setting up event listeners
    audio.src = url;
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0 || !isFinite(seconds)) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingDateTime = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      // Extract timestamp from filename
      const parts = fileName.split('_');
      if (parts.length >= 3) {
        // Find the timestamp part (contains T and Z)
        let timestampPart = '';
        for (const part of parts) {
          if (part.includes('T') && part.includes('Z')) {
            timestampPart = part.replace(/\.(webm|mp4|ogg|wav)$/, '');
            break;
          }
        }

        if (timestampPart) {
          // Convert the timestamp back to ISO format
          // The timestamp format is: 2025-08-20T11-06-38-428Z (ISO with dashes instead of colons and dots)
          const isoTimestamp = timestampPart.replace(/-/g, (match, offset, string) => {
            // Only replace dashes that are in time positions (after T)
            const beforeT = string.substring(0, offset);
            const tIndex = beforeT.lastIndexOf('T');
            if (tIndex !== -1) {
              // This dash is after T, so it should be a colon or dot
              const afterT = string.substring(tIndex + 1, offset);
              const dashCount = (afterT.match(/-/g) || []).length;
              if (dashCount === 0) return ':'; // First dash after T -> colon (hours:minutes)
              if (dashCount === 1) return ':'; // Second dash after T -> colon (minutes:seconds)
              if (dashCount === 2) return '.'; // Third dash after T -> dot (seconds.milliseconds)
            }
            return match; // Keep original dash (for date part)
          });

          const date = new Date(isoTimestamp);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString();
          }
        }
      }

      return new Date().toLocaleString(); // Fallback to current time
    } catch {
      return new Date().toLocaleString();
    }
  };

  const [playingRecordingDuration, setPlayingRecordingDuration] = useState<number>(0);

  const handlePlayRecording = (url: string) => {
    const title = `Recording ${getRecordingDateTime(url)}`;
    setPlayingRecordingUrl(url);
    setPlayingRecordingTitle(title);
    setPlayingRecordingDuration(audioDurations.get(url) || 0); // Get duration from map
    setShowPlayerDialog(true);
  };

  const downloadRecording = async (url: string) => {
    try {
      toast.info("Preparing download...");

      // Fetch the file as a blob to force download
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      // Create a filename based on the recording date/time
      const dateTime = getRecordingDateTime(url);

      // Determine extension from blob type or url
      let extension = 'webm';
      if (blob.type.includes('mp4')) extension = 'mp4';
      else if (blob.type.includes('ogg')) extension = 'ogg';
      else if (blob.type.includes('wav')) extension = 'wav';

      link.download = `Recording_${dateTime.replace(/[/:,\s]/g, '_')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Recording downloaded');
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error('Failed to download recording');
      // Fallback
      window.open(url, '_blank');
    }
  };

  const handleDeleteRecording = (url: string) => {
    setRecordingToDelete(url);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRecording = async () => {
    if (!recordingToDelete) return;

    try {
      setIsDeleting(true);
      const success = await deleteRecording(recordingToDelete);
      if (success) {
        setRecordings(prev => prev.filter(r => r !== recordingToDelete));

        // Also close player if deleting currently playing
        if (playingRecordingUrl === recordingToDelete) {
          setShowPlayerDialog(false);
          setPlayingRecordingUrl(null);
        }

        toast.success('Recording deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setRecordingToDelete(null);
    }
  };

  const cancelDeleteRecording = () => {
    setShowDeleteDialog(false);
    setRecordingToDelete(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Consultation Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recordings found for this consultation.</p>
            <p className="text-sm mt-2">Start a recording during the consultation to save audio notes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recordingsContent = (
    <div className="space-y-4">
      {recordings.map((url, index) => (
        <div key={url} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Play Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlayRecording(url)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
              >
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Play</span>
              </Button>

              {/* Recording Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    Recording {getRecordingDateTime(url)}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Recording #{index + 1}
                  </span>
                  {(() => {
                    const duration = audioDurations.get(url);
                    const formattedDuration = duration ? formatDuration(duration) : '';
                    return formattedDuration && (
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <Clock className="h-3 w-3" />
                        {formattedDuration}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadRecording(url)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Download recording"
              >
                <Download className="h-4 w-4" />
              </Button>
              {!isReadOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRecording(url)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete recording"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {recordingsContent}

      {/* Detail Player Dialog */}
      <RecordingPlayerDialog
        isOpen={showPlayerDialog}
        onClose={() => setShowPlayerDialog(false)}
        audioUrl={playingRecordingUrl}
        title={playingRecordingTitle}
        duration={playingRecordingDuration}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Recording
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recording? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteRecording}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRecording}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Recording'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
