import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    X
} from "lucide-react";

interface RecordingPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    audioUrl: string | null;
    title?: string;
    duration?: number;
}

export function RecordingPlayerDialog({
    isOpen,
    onClose,
    audioUrl,
    title = "Audio Recording",
    duration: initialDuration = 0
}: RecordingPlayerDialogProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Sync duration from props
    useEffect(() => {
        if (initialDuration > 0) {
            setDuration(initialDuration);
        }
    }, [initialDuration]);

    // Initialize audio when url changes or dialog opens
    useEffect(() => {
        if (isOpen && audioUrl) {
            // Reset state
            setCurrentTime(0);
            setIsPlaying(false);

            // Apply initial duration again to be safe
            if (initialDuration > 0) {
                setDuration(initialDuration);
            }
            setIsPlaying(false);

            const audio = new Audio(audioUrl);
            audio.crossOrigin = 'anonymous';
            audioRef.current = audio;

            // Event listeners
            const setAudioData = () => {
                const d = audio.duration;
                if (isFinite(d) && d > 0) {
                    setDuration(d);
                }
            };

            const setAudioTime = () => {
                const curr = audio.currentTime;
                setCurrentTime(curr);

                // Fallback: If duration is unknown or less than current time, update it
                // This handles cases where duration is Infinity or not yet loaded
                setDuration(d => {
                    const audioDur = audio.duration;
                    if (isFinite(audioDur) && audioDur > 0) return audioDur; // Prefer actual duration
                    return Math.max(d, curr); // Otherwise grow with playback
                });
            };

            const handleEnded = () => {
                setIsPlaying(false);
                setCurrentTime(0); // Optional: reset to start
            };

            audio.addEventListener('loadedmetadata', setAudioData);
            audio.addEventListener('timeupdate', setAudioTime);
            audio.addEventListener('ended', handleEnded);

            // Auto play
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(err => console.error("Auto-play failed:", err));

            return () => {
                audio.pause();
                audio.removeEventListener('loadedmetadata', setAudioData);
                audio.removeEventListener('timeupdate', setAudioTime);
                audio.removeEventListener('ended', handleEnded);
                audioRef.current = null;
            };
        } else {
            // Cleanup if dialog closes
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
        }
    }, [isOpen, audioUrl, initialDuration]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const skip = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(
                Math.max(audioRef.current.currentTime + seconds, 0),
                duration
            );
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        if (audioRef.current) {
            const newVol = value[0];
            audioRef.current.volume = newVol;
            setVolume(newVol);
            if (newVol > 0 && isMuted) {
                setIsMuted(false);
                audioRef.current.muted = false;
            }
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border-none" hideCloseButton={true}>
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Volume2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Playing Audio</h3>
                                <p className="text-xs text-gray-500 max-w-[200px] truncate">{title}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 text-gray-500">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Time & Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(-10)}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                            title="-10s"
                        >
                            <SkipBack className="h-5 w-5" />
                            <span className="sr-only">Rewind 10s</span>
                        </Button>

                        <Button
                            onClick={togglePlay}
                            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 fill-current" />
                            ) : (
                                <Play className="h-6 w-6 fill-current ml-1" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(10)}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                            title="+10s"
                        >
                            <SkipForward className="h-5 w-5" />
                            <span className="sr-only">Forward 10s</span>
                        </Button>
                    </div>

                    {/* Volume Control (Optional, kept simple) */}
                    <div className="flex items-center gap-2 px-2">
                        <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="flex-1"
                        />
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
