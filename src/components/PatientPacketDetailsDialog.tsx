import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Calendar, Clock, CheckCircle, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PatientPacketDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    packetStatus: 'none' | 'sent' | 'opened' | 'submitted';
    publicLink?: string;
    linkOpenedAt?: string;
    submittedAt?: string;
    isDirectConsultation?: boolean;
}

export function PatientPacketDetailsDialog({
    isOpen,
    onClose,
    packetStatus,
    publicLink,
    linkOpenedAt,
    submittedAt,
    isDirectConsultation
}: PatientPacketDetailsDialogProps) {

    const copyLink = () => {
        if (publicLink) {
            navigator.clipboard.writeText(publicLink);
            toast.success("Link copied to clipboard");
        }
    };

    const getSourceDisplay = () => {
        if (isDirectConsultation && !publicLink) return "Direct Consultation (In-Clinic)";
        if (publicLink) return "Public Link";
        return "Unknown";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Patient Packet Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4 w-full">
                    {/* Status Overview */}
                    <div className="flex flex-col gap-4 w-full">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 w-full">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 shrink-0">Status</span>
                                <Badge variant={packetStatus === 'submitted' ? 'default' : 'secondary'} className={packetStatus === 'submitted' ? "bg-green-600 hover:bg-green-700" : ""}>
                                    {packetStatus === 'submitted' ? 'Completed' : packetStatus === 'opened' ? 'Opened' : 'Sent'}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 shrink-0">Source</span>
                                <span className="text-sm font-medium text-right truncate">{getSourceDisplay()}</span>
                            </div>
                        </div>

                        {/* Timeline Details */}
                        <div className="space-y-4 w-full">
                            <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Timeline</h4>

                            {/* Link Created - If public link exists */}
                            {publicLink && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">Link Generated</p>
                                        <p className="text-xs text-slate-500">
                                            Available via public link
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Link Opened */}
                            {linkOpenedAt && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-purple-100 p-2 rounded-full shrink-0">
                                        <ExternalLink className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">Link Opened</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(linkOpenedAt).toLocaleDateString()}
                                            <Clock className="h-3 w-3 ml-1" />
                                            {new Date(linkOpenedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submitted */}
                            {submittedAt && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-full shrink-0">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">Submission Completed</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(submittedAt).toLocaleDateString()}
                                            <Clock className="h-3 w-3 ml-1" />
                                            {new Date(submittedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fallback for direct without timestamps */}
                            {packetStatus === 'submitted' && !submittedAt && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-full shrink-0">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">Submission Completed</p>
                                        <p className="text-xs text-slate-500">Timestamp not available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Public Link Section */}
                        {publicLink && (
                            <div className="space-y-2 pt-2 border-t w-full">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Public Link</label>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 w-full">
                                    <div className="bg-slate-50 border rounded px-3 py-2 text-xs text-slate-600 truncate font-mono">
                                        {publicLink}
                                    </div>
                                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copyLink}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
