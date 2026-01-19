import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Clock
} from "lucide-react";

interface RecordingControlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStop: () => void;
  duration: number;
  audioLevel: number;
  patientName?: string;
  isProcessing?: boolean;
}

export function RecordingControlDialog({
  isOpen,
  onClose,
  onStop,
  duration,
  audioLevel,
  patientName = "Patient",
  isProcessing = false
}: RecordingControlDialogProps) {

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (isProcessing) return;
    onStop();
    // Allow parent to handle closing
    onClose();
  };

  // Convert dB to percentage for visualization (0% = -60dB, 100% = 0dB)
  const getVolumePercentage = () => {
    return Math.max(0, Math.min(100, ((audioLevel + 60) / 60) * 100));
  };

  // Get color based on audio level
  const getVolumeColor = () => {
    const percentage = getVolumePercentage();
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Mic className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Recording in Progress
              </h2>
              <p className="text-sm text-red-700">Consultation with {patientName}</p>
            </div>
          </div>
        </div>

        {/* Recording Status */}
        <div className="px-6 py-6">
          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-mono font-bold text-gray-900 mb-1">
              {formatDuration(duration)}
            </div>
            <p className="text-sm text-gray-600">
              Recording active
            </p>
          </div>

          {/* Audio Visualizer */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Voice Level</p>
              <div className="text-lg font-mono text-gray-900">
                {audioLevel > -60 ? `${Math.round(audioLevel)} dB` : '-- dB'}
              </div>
            </div>

            {/* Volume Bars */}
            <div className="flex items-end justify-center gap-1 h-16 mb-2">
              {Array.from({ length: 20 }, (_, i) => {
                const barThreshold = (i / 19) * 100;
                const isActive = getVolumePercentage() > barThreshold;
                const height = Math.max(8, (i + 1) * 3);

                return (
                  <div
                    key={i}
                    className={`w-2 rounded-t transition-all duration-75 ${isActive
                        ? `${getVolumeColor()} opacity-100`
                        : 'bg-gray-300 opacity-50'
                      }`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            {/* Volume Level Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-75 ${getVolumeColor()}`}
                style={{ width: `${getVolumePercentage()}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center">
            {/* Stop Button */}
            <Button
              onClick={handleStop}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Stop & Save
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Recording will be automatically saved when stopped
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
