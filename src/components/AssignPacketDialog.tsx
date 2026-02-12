import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, User, Calendar, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewPatientPacketDB } from "@/types/supabasePatientPacket";

interface AssignPacketDialogProps {
    isOpen: boolean;
    onClose: () => void;
    packet: NewPatientPacketDB;
    onAssignSuccess: () => void;
}

interface ConsultationPatient {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    new_patient_packet_id: string | null;
    created_at: string;
}

export function AssignPacketDialog({ isOpen, onClose, packet, onAssignSuccess }: AssignPacketDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<ConsultationPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<ConsultationPatient | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && packet?.id) {
            // Auto-search with packet name
            const initialSearch = `${packet.first_name || ''} ${packet.last_name || ''}`.trim();
            setSearchTerm(initialSearch);
            if (initialSearch) {
                searchPatients(initialSearch);
            }
        } else if (!isOpen && !showOverwriteConfirm) {
            setSearchTerm('');
            setPatients([]);
            setSelectedPatient(null);
        }
    }, [isOpen, packet, showOverwriteConfirm]);

    const searchPatients = async (term: string) => {
        if (!term.trim()) {
            setPatients([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('consultation_patients')
                .select('id, first_name, last_name, date_of_birth, gender, new_patient_packet_id, created_at')
                .or(`first_name.ilike.%${term}%, last_name.ilike.%${term}%`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            console.log("Found matching patients:", data);
            setPatients(data || []);

        } catch (error) {
            console.error('Error searching consultation patients:', error);
            toast.error('Failed to search patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchPatients(searchTerm);
    };

    const handleAssign = async (bypassConfirm = false) => {
        if (!selectedPatient || !packet.id) return;

        // Show overwrite confirmation dialog if patient already has a packet and we haven't bypassed it
        if (selectedPatient.new_patient_packet_id && !bypassConfirm) {
            setShowOverwriteConfirm(true);
            return;
        }

        setIsAssigning(true);
        try {
            // Updating the consultation_patient_id on the packet 
            // will trigger the Postgres bulk linkage logic.
            const { error: packetError } = await supabase
                .from('new_patient_packets')
                .update({
                    consultation_patient_id: selectedPatient.id
                })
                .eq('id', packet.id);

            if (packetError) throw packetError;

            toast.success("Packet successfully assigned and linked to all consultations");
            setShowOverwriteConfirm(false);
            onAssignSuccess();
            onClose();

        } catch (error) {
            console.error('Error assigning packet:', error);
            toast.error('Failed to assign packet');
        } finally {
            setIsAssigning(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open && !showOverwriteConfirm) {
                        onClose();
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign to Consultation</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search consultation patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" size="sm" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                            </Button>
                        </form>

                        <div className="border rounded-md">
                            <ScrollArea className="h-[300px]">
                                {patients.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        {loading ? "Searching..." : "No consultation patients found matching your search."}
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {patients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedPatient?.id === patient.id ? 'bg-indigo-50 hover:bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <Avatar className="h-10 w-10 mt-1">
                                                    <AvatarFallback className={selectedPatient?.id === patient.id ? "bg-indigo-100 text-indigo-700" : ""}>
                                                        {`${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase() || 'UP'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm text-gray-900">
                                                            {patient.first_name} {patient.last_name}
                                                        </h4>
                                                        <div className="flex gap-1">
                                                            {patient.new_patient_packet_id && (
                                                                <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                                    Has Packet
                                                                </Badge>
                                                            )}
                                                            {patient.gender && (
                                                                <Badge variant="outline" className="text-xs capitalize">
                                                                    {patient.gender}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        DOB: {formatDate(patient.date_of_birth || '')}
                                                    </div>
                                                </div>
                                                {selectedPatient?.id === patient.id && (
                                                    <Check className="h-4 w-4 text-indigo-600 mt-1" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {selectedPatient && (
                            <div className={`border rounded-md p-3 flex items-start gap-2 text-sm ${selectedPatient.new_patient_packet_id ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${selectedPatient.new_patient_packet_id ? 'text-red-500' : 'text-amber-500'}`} />
                                <div>
                                    <p className="font-medium">
                                        {selectedPatient.new_patient_packet_id ? 'Warning: Patient Already Linked' : 'Confirm Assignment'}
                                    </p>
                                    <p className={`text-xs mt-1 ${selectedPatient.new_patient_packet_id ? 'text-red-700' : 'text-amber-700'}`}>
                                        {selectedPatient.new_patient_packet_id ? (
                                            <>
                                                <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong> is already linked to another packet. Assigning this new packet will <strong>overwrite</strong> the existing link for the patient and all their consultations.
                                            </>
                                        ) : (
                                            <>
                                                This will link the packet from <strong>{packet.first_name} {packet.last_name}</strong> to <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong> and all their consultations.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isAssigning}>Cancel</Button>
                        <Button
                            onClick={() => handleAssign()}
                            disabled={!selectedPatient || isAssigning}
                            className="gap-2"
                        >
                            {isAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
                            Assign Packet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showOverwriteConfirm} onOpenChange={setShowOverwriteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Overwrite Existing Link?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This patient is already linked to another packet. Assigning this packet will overwrite the existing connection for this patient and <strong>all</strong> associated consultations.
                            <br /><br />
                            Are you sure you want to proceed with this assignment?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleAssign(true)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, Overwrite & Link
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
