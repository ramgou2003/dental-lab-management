import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    FileText,
    RefreshCw,
    Eye,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnmappedPacket {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_cell: string;
    date_of_birth: string;
    gender: string;
    form_status: string;
    submission_source: string;
    submitted_at: string;
    created_at: string;
    address_street?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
}

interface UnmappedPatientPacketsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UnmappedPatientPacketsDialog({
    isOpen,
    onClose,
}: UnmappedPatientPacketsDialogProps) {
    const [packets, setPackets] = useState<UnmappedPacket[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPacketId, setExpandedPacketId] = useState<string | null>(null);

    const fetchUnmappedPackets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('new_patient_packets')
                .select('id, first_name, last_name, email, phone_cell, date_of_birth, gender, form_status, submission_source, submitted_at, created_at, address_street, address_city, address_state, address_zip, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship')
                .is('patient_id', null)
                .is('consultation_patient_id', null)
                .eq('submission_source', 'public')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching unmapped packets:', error);
                toast.error('Failed to load unmapped patient packets');
                return;
            }

            setPackets(data || []);
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUnmappedPackets();
            setExpandedPacketId(null);
        }
    }, [isOpen]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/New_York',
            });
        } catch {
            return dateStr;
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedPacketId(expandedPacketId === id ? null : id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    Unmapped Patient Packets
                                </DialogTitle>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Packets submitted via public link — not yet linked to a consultation
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-700 font-semibold px-3 py-1"
                            >
                                {packets.length} packet{packets.length !== 1 ? 's' : ''}
                            </Badge>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={fetchUnmappedPackets}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                                <p className="text-sm text-gray-500">Loading patient packets...</p>
                            </div>
                        </div>
                    ) : packets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                No Unmapped Packets
                            </h3>
                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                All patient packets submitted via the public link have been mapped to consultations.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {packets.map((packet) => (
                                <div
                                    key={packet.id}
                                    className="border border-gray-200 rounded-xl bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
                                >
                                    {/* Compact Row */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                        onClick={() => toggleExpand(packet.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Avatar */}
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {(packet.first_name?.[0] || '').toUpperCase()}
                                                    {(packet.last_name?.[0] || '').toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Name & basic info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {packet.first_name} {packet.last_name}
                                                    </h4>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs px-2 py-0.5 ${packet.form_status === 'completed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {packet.form_status || 'unknown'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    {packet.email && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                            <Mail className="h-3 w-3" />
                                                            {packet.email}
                                                        </span>
                                                    )}
                                                    {packet.phone_cell && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {packet.phone_cell}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Submitted date */}
                                            <div className="text-right flex-shrink-0 hidden sm:block">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateTime(packet.submitted_at || packet.created_at)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand button */}
                                        <div className="ml-3 flex-shrink-0">
                                            {expandedPacketId === packet.id ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedPacketId === packet.id && (
                                        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50 rounded-b-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Personal Info */}
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Personal Information
                                                    </h5>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-gray-600">Name:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {packet.first_name} {packet.last_name}
                                                            </span>
                                                        </div>
                                                        {packet.date_of_birth && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-gray-600">DOB:</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {formatDate(packet.date_of_birth)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {packet.gender && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-gray-600">Gender:</span>
                                                                <span className="font-medium text-gray-900 capitalize">
                                                                    {packet.gender}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Contact Information
                                                    </h5>
                                                    <div className="space-y-1.5">
                                                        {packet.email && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-gray-600">Email:</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {packet.email}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {packet.phone_cell && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-gray-600">Phone:</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {packet.phone_cell}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(packet.address_street || packet.address_city) && (
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                                                <span className="text-gray-600">Address:</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {[packet.address_street, packet.address_city, packet.address_state, packet.address_zip]
                                                                        .filter(Boolean)
                                                                        .join(', ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Emergency Contact */}
                                                {packet.emergency_contact_name && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                            Emergency Contact
                                                        </h5>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-gray-600">Name:</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {packet.emergency_contact_name}
                                                                </span>
                                                            </div>
                                                            {packet.emergency_contact_relationship && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                                                    <span className="text-gray-600">Relationship:</span>
                                                                    <span className="font-medium text-gray-900">
                                                                        {packet.emergency_contact_relationship}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {packet.emergency_contact_phone && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                    <span className="text-gray-600">Phone:</span>
                                                                    <span className="font-medium text-gray-900">
                                                                        {packet.emergency_contact_phone}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Submission Info */}
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        Submission Details
                                                    </h5>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-gray-600">Submitted:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {formatDateTime(packet.submitted_at || packet.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-gray-600">Source:</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {packet.submission_source || 'public'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-gray-600">Status:</span>
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs ${packet.form_status === 'completed'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                    }`}
                                                            >
                                                                {packet.form_status || 'unknown'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
