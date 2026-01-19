// Force update
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Info,
  Shield,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface RecordingConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
  onRecordingStart: (mediaRecorder: MediaRecorder) => void;
  patientName?: string;
  mode?: 'consultation' | 'encounter';
}

export function RecordingConsentDialog({
  isOpen,
  onClose,
  onConsent,
  onRecordingStart,
  patientName = "Patient",
  mode = 'consultation'
}: RecordingConsentDialogProps) {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const isEncounter = mode === 'encounter';
  const typeLabel = isEncounter ? 'Encounter' : 'Consultation';
  const typeLabelLower = isEncounter ? 'encounter' : 'consultation';
  const durationLabel = isEncounter ? '30 minutes' : '90 minutes';

  const requestMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    setPermissionDenied(false);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Permission granted, start recording
      // Determine the best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      console.log('Using MIME type for initial recording:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      // Call the parent component's callback with the media recorder
      onRecordingStart(mediaRecorder);
      onConsent();

      toast.success("Recording started successfully");
      onClose();

    } catch (error) {
      console.error('Microphone permission denied or error:', error);
      setPermissionDenied(true);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error(`Microphone permission denied. Please allow microphone access to record the ${typeLabelLower}.`);
        } else if (error.name === 'NotFoundError') {
          toast.error("No microphone found. Please connect a microphone and try again.");
        } else {
          toast.error("Error accessing microphone. Please check your device settings.");
        }
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleStartRecording = () => {
    requestMicrophonePermission();
  };

  const handleClose = () => {
    setPermissionDenied(false);
    setIsRequestingPermission(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mic className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recording Consent Required</h2>
              <p className="text-sm text-gray-600">{typeLabel} with {patientName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Main consent text */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-2">
                This {typeLabelLower} will be recorded for quality and training purposes.
              </p>
              <p className="text-sm text-gray-600">
                The recording will help us improve our services and ensure the highest standard of care for all patients.
              </p>
            </div>
          </div>

          {/* What we record section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">What we record:</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Audio of the {typeLabelLower} conversation</li>
              <li>• Duration: Up to {durationLabel}</li>
              <li>• Auto-saved every 5 minutes for reliability</li>
            </ul>
          </div>

          {/* Consent text */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By clicking "Accept & Start Recording", you consent to the recording of this {typeLabelLower} session.
            All recordings are stored securely and used only for authorized purposes.
          </p>

          {/* Permission denied warning */}
          {permissionDenied && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Microphone Permission Required</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Please allow microphone access in your browser to record the {typeLabelLower}.
                You may need to click the microphone icon in your browser's address bar.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-full border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            disabled={isRequestingPermission}
          >
            Decline
          </Button>
          <Button
            onClick={handleStartRecording}
            disabled={isRequestingPermission}
            className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isRequestingPermission ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Requesting Permission...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Accept & Start Recording
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
