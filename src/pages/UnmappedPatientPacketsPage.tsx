import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Mail,
    Phone,
    Calendar,
    Clock,
    FileText,
    Eye,
    ArrowLeft,
    Copy,
    Link,
    X,
    UserPlus,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { FilledPatientPacketViewer } from "@/components/FilledPatientPacketViewer";
import { convertDatabaseToFormData } from "@/utils/patientPacketConverter";
import { NewPatientPacketDB } from "@/types/supabasePatientPacket";
import { AssignPacketDialog } from "@/components/AssignPacketDialog";

export function UnmappedPatientPacketsPage() {
    const navigate = useNavigate();
    const [packets, setPackets] = useState<NewPatientPacketDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPacket, setSelectedPacket] = useState<NewPatientPacketDB | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [packetToAssign, setPacketToAssign] = useState<NewPatientPacketDB | null>(null);

    const fetchUnmappedPackets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('new_patient_packets')
                .select('*')
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
        fetchUnmappedPackets();
    }, []);

    const formatDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return '—';
        try {
            const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
            const [year, month, day] = cleanDateStr.split('-').map(Number);
            return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr: string | undefined | null) => {
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

    const getInitials = (firstName: string | null, lastName: string | null) => {
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'UN';
    };

    const filteredPackets = packets.filter(packet => {
        const fullName = `${packet.first_name || ''} ${packet.last_name || ''}`.toLowerCase();
        const email = (packet.email || '').toLowerCase();
        const phone = (packet.phone_cell || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });

    const handleViewDetails = (packet: NewPatientPacketDB) => {
        setSelectedPacket(packet);
        setIsDetailOpen(true);
    };

    const handleAssignClick = (packet: NewPatientPacketDB) => {
        setPacketToAssign(packet);
        setIsAssignOpen(true);
    };

    const handleAssignSuccess = () => {
        fetchUnmappedPackets();
        setIsAssignOpen(false);
        setPacketToAssign(null);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <PageHeader
                    title="Unmapped Patient Packets"
                    badge={packets.length}
                    search={{
                        placeholder: "Search by name, email, or phone...",
                        value: searchTerm,
                        onChange: setSearchTerm
                    }}
                    secondaryAction={{
                        label: "Back to Consultations",
                        icon: ArrowLeft,
                        onClick: () => navigate('/consultation')
                    }}
                />
            </div>

            {/* Info Banner with Copy Link */}
            <div className="mx-4 mt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-sm text-amber-800">
                            These patient packets were submitted via the <strong>public link</strong> and are not yet linked to any consultation or patient record.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 flex items-center gap-2 bg-white border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                        onClick={() => {
                            const publicLink = `${window.location.origin}/patientpacket/new`;
                            navigator.clipboard.writeText(publicLink).then(() => {
                                toast.success('Public patient packet link copied to clipboard!');
                            }).catch(() => {
                                toast.error('Failed to copy link');
                            });
                        }}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy Public Link
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 px-4 pt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                                        Patient
                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                                        Contact
                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                                        Date of Birth
                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                                        Submitted
                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider relative">
                                        Status
                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-900 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                                                <p className="text-sm text-gray-500">Loading patient packets...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPackets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    {searchTerm ? 'No matching packets found' : 'No Unmapped Patient Packets'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {searchTerm
                                                        ? 'Try adjusting your search term.'
                                                        : 'All patient packets submitted via the public link have been mapped to consultations.'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackets.map((packet, index) => (
                                        <tr key={`${packet.id}-${index}`} className="hover:bg-gray-50">
                                            {/* Patient */}
                                            <td className="px-6 py-4 whitespace-nowrap relative">
                                                <div className="flex items-center">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-amber-100 text-amber-600 font-semibold">
                                                            {getInitials(packet.first_name, packet.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {packet.first_name} {packet.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 capitalize">
                                                            {packet.gender || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-6 py-4 whitespace-nowrap relative">
                                                <div className="space-y-1">
                                                    {packet.email && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate max-w-[200px]">{packet.email}</span>
                                                        </div>
                                                    )}
                                                    {packet.phone_cell && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <Phone className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                                            {packet.phone_cell}
                                                        </div>
                                                    )}
                                                    {!packet.email && !packet.phone_cell && (
                                                        <span className="text-sm text-gray-400">No contact info</span>
                                                    )}
                                                </div>
                                                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                            </td>

                                            {/* Date of Birth */}
                                            <td className="px-6 py-4 whitespace-nowrap relative text-center">
                                                <div className="flex items-center justify-center text-sm text-gray-700">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {formatDate(packet.date_of_birth)}
                                                </div>
                                                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                            </td>

                                            {/* Submitted */}
                                            <td className="px-6 py-4 whitespace-nowrap relative text-center">
                                                <div className="space-y-1 flex flex-col items-center">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                        {formatDateTime(packet.submitted_at || packet.created_at)}
                                                    </div>
                                                </div>
                                                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap relative text-center">
                                                <div className="flex justify-center">
                                                    <Badge
                                                        className={
                                                            packet.form_status === 'completed'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : packet.form_status === 'draft'
                                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }
                                                    >
                                                        {packet.form_status === 'completed' ? 'Completed' : packet.form_status === 'draft' ? 'Draft' : (packet.form_status || 'Unknown')}
                                                    </Badge>
                                                </div>
                                                <div className="absolute right-0 top-2 bottom-2 w-px bg-slate-300"></div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(packet)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleAssignClick(packet)}
                                                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                        Assign
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={(open) => { if (!open) { setIsDetailOpen(false); setSelectedPacket(null); } }}>
                <DialogContent hideCloseButton={true} className="max-w-[95vw] h-[95vh] overflow-y-auto w-full p-0 flex flex-col gap-0 border-0 md:max-w-4xl md:h-[90vh] md:border md:rounded-lg">
                    <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <span className="text-sm font-bold text-amber-600">
                                        {selectedPacket ? getInitials(selectedPacket.first_name, selectedPacket.last_name) : ''}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {selectedPacket?.first_name} {selectedPacket?.last_name}
                                    </div>
                                    <div className="text-sm font-normal text-gray-500">
                                        Patient Packet Details (Read Only)
                                    </div>
                                </div>
                            </DialogTitle>
                            <DialogClose className="opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {selectedPacket && (
                            <FilledPatientPacketViewer
                                formData={convertDatabaseToFormData(selectedPacket)}
                                submittedAt={selectedPacket.submitted_at || undefined}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Assign Dialog */}
            {packetToAssign && (
                <AssignPacketDialog
                    isOpen={isAssignOpen}
                    onClose={() => {
                        setIsAssignOpen(false);
                    }}
                    packet={packetToAssign}
                    onAssignSuccess={handleAssignSuccess}
                />
            )}
        </div>
    );
}
