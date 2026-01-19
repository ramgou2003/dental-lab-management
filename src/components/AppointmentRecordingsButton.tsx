import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RecordingsList } from "@/components/RecordingsList";
import { Mic } from "lucide-react";

interface AppointmentRecordingsButtonProps {
    appointmentId: string;
    patientName?: string;
    type: 'consultation' | 'encounter';
}

export function AppointmentRecordingsButton({ appointmentId, patientName, type }: AppointmentRecordingsButtonProps) {
    const label = type === 'consultation' ? 'Consultation Recordings' : 'Encounter Recordings';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 mt-2 w-full sm:w-auto justify-start"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Mic className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">{label}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-blue-600" />
                        {label}
                    </DialogTitle>
                </DialogHeader>
                <RecordingsList
                    appointmentId={appointmentId}
                    patientName={patientName}
                    type={type}
                />
            </DialogContent>
        </Dialog>
    );
}
