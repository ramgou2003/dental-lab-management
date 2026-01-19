import { useState, useEffect } from "react";
import { format, isBefore, isAfter, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, FileText, Mic, User, Edit } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";
import { RecordingsList } from "@/components/RecordingsList";
import { cn } from "@/lib/utils";

interface PatientAppointmentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId?: string;
    patientName: string;
    onFillEncounter?: (appointment: Appointment) => void;
    onViewDetails?: (appointment: Appointment) => void;
}

export function PatientAppointmentHistoryDialog({
    open,
    onOpenChange,
    patientId,
    patientName,
    onFillEncounter,
    onViewDetails
}: PatientAppointmentHistoryDialogProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewingRecordingsFor, setViewingRecordingsFor] = useState<string | null>(null);

    useEffect(() => {
        if (open && (patientId || patientName)) {
            fetchHistory();
        }
    }, [open, patientId, patientName]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    assigned_user:user_profiles!assigned_user_id(full_name)
                `)
                .order('date', { ascending: false })
                .order('start_time', { ascending: false });

            if (patientId) {
                query = query.eq('patient_id', patientId);
            } else {
                query = query.eq('patient_name', patientName);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mappedAppointments: Appointment[] = ((data || []) as any[]).map(apt => ({
                    id: apt.id,
                    title: apt.title || '',
                    patient: apt.patient_name,
                    patientId: apt.patient_id,
                    assignedUserId: apt.assigned_user_id,
                    assignedUserName: apt.assigned_user?.full_name,
                    date: apt.date,
                    startTime: apt.start_time,
                    endTime: apt.end_time,
                    type: apt.appointment_type,
                    subtype: apt.subtype,
                    status: apt.status || '',
                    statusCode: apt.status_code as any,
                    notes: apt.notes,
                    encounterCompleted: apt.encounter_completed,
                    encounterCompletedAt: apt.encounter_completed_at,
                    encounterCompletedBy: apt.encounter_completed_by,
                    isEmergency: apt.is_emergency,
                    archType: apt.arch_type,
                    upperArchSubtype: apt.upper_arch_subtype,
                    lowerArchSubtype: apt.lower_arch_subtype,
                    createdAt: apt.created_at || '',
                    updatedAt: apt.updated_at || '',
                    nextAppointmentScheduled: apt.next_appointment_scheduled,
                    nextAppointmentDate: apt.next_appointment_date,
                    nextAppointmentTime: apt.next_appointment_time,
                    nextAppointmentType: apt.next_appointment_type,
                    nextAppointmentSubtype: apt.next_appointment_subtype,
                }));
                setAppointments(mappedAppointments);
            }
        } catch (error) {
            console.error("Error fetching appointment history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions (copied from PatientProfilePage to ensure consistent UI)
    const getAppointmentStatusDetails = (statusCode: string | undefined) => {
        const code = statusCode || '?????';
        switch (code) {
            case 'FIRM': return { label: 'FIRM', color: 'bg-green-500' };
            case 'EFIRM': return { label: 'EFIRM', color: 'bg-emerald-500' };
            case 'HERE': return { label: 'HERE', color: 'bg-blue-500' };
            case 'READY': return { label: 'READY', color: 'bg-purple-500' };
            case 'LM1': return { label: 'LM1', color: 'bg-yellow-500' };
            case 'LM2': return { label: 'LM2', color: 'bg-orange-500' };
            case 'EMER': return { label: 'EMER', color: 'bg-red-600' };
            case 'MULTI': return { label: 'MULTI', color: 'bg-indigo-500' };
            case '2wk': return { label: '2wk', color: 'bg-pink-500' };
            case 'NSHOW': return { label: 'NSHOW', color: 'bg-red-700' };
            case 'RESCH': return { label: 'RESCH', color: 'bg-amber-500' };
            case 'CANCL': return { label: 'CANCL', color: 'bg-slate-600' };
            case 'CMPLT': return { label: 'CMPLT', color: 'bg-green-600' };
            default: return { label: '?????', color: 'bg-gray-400' };
        }
    };

    const formatAppointmentType = (type: string) => {
        return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatSubtype = (subtype: string | undefined) => {
        if (!subtype) return '';
        const actualSubtype = subtype.includes(':') ? subtype.split(':')[1] : subtype;
        const mappings: Record<string, string> = {
            'pre-surgery-data-collection': 'Pre-Surgery Data Collection',
            'surgical-day-appliance': 'Surgical Day Appliance',
            'nightguard': 'Nightguard',
            '7-day-followup': '7 Day Follow-up',
            '14-day-followup': '14 Day Follow-up',
            '30-day-followup': '30 Day Follow-up',
            'final-records': 'Final Records',
            'try-in': 'Try-in',
            'delivery': 'Delivery',
            'adjustment': 'Adjustment',
            'administrative-documents': 'Administrative Documents'
        };
        return mappings[actualSubtype] || actualSubtype.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const splitAppointments = () => {
        const now = new Date();
        const upcoming: Appointment[] = [];
        const previous: Appointment[] = [];

        appointments.forEach(apt => {
            const aptDateTime = parseISO(`${apt.date}T${apt.startTime}`);
            if (isAfter(aptDateTime, now)) {
                upcoming.push(apt);
            } else {
                previous.push(apt);
            }
        });

        // Sort upcoming ascending (nearest first)
        upcoming.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA.getTime() - dateB.getTime();
        });

        return { upcoming, previous };
    };

    const { upcoming, previous } = splitAppointments();

    const renderAppointmentCard = (apt: Appointment) => {
        const statusDetails = getAppointmentStatusDetails(apt.statusCode);

        // Extract base color from the background class
        const baseColorClass = statusDetails.color.replace('bg-', '');
        const bgClass = `bg-${baseColorClass}/10`;
        const borderClass = `border-${baseColorClass}/20`;
        const textClass = `text-${baseColorClass}`;
        const groupHoverBorderClass = `group-hover:border-${baseColorClass}/50`;
        const groupHoverBgClass = `group-hover:bg-${baseColorClass}/20`;

        const dateObj = new Date(apt.date);
        const [yearStr, monthStr, dayStr] = apt.date.split('-');
        const dateForDisplay = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

        const day = dayStr;
        const month = dateForDisplay.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const year = yearStr;

        return (
            <div key={apt.id} className="relative flex bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group pl-5 min-h-[70px]">
                {/* Vertical Status Capsule */}
                <div className={cn(
                    "absolute left-1 top-1 bottom-1 w-3 rounded-full flex flex-col items-center justify-center overflow-hidden z-10",
                    statusDetails.color
                )}>
                    <span
                        className="text-[8px] font-bold text-white whitespace-nowrap select-none tracking-widest"
                        style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            transform: 'rotate(180deg)',
                        }}
                    >
                        {statusDetails.label}
                    </span>
                </div>

                <div className="flex-1 p-2 flex gap-2.5 items-center">
                    {/* Date Box & Time */}
                    <div className="flex flex-col gap-1 shrink-0">
                        <div className={cn(
                            "flex flex-col items-center justify-center min-w-[50px] h-[50px] rounded border transition-colors shrink-0",
                            bgClass, borderClass, groupHoverBorderClass, groupHoverBgClass
                        )}>
                            <span className={cn("text-[9px] font-bold uppercase leading-none mb-0.5 opacity-80", textClass)}>{month}</span>
                            <span className={cn("text-lg font-bold leading-none mb-0.5", textClass)}>{day}</span>
                            <span className={cn("text-[8px] font-medium leading-none opacity-60", textClass)}>{year}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 w-full min-w-[50px]">
                            <Clock className="h-2.5 w-2.5 text-gray-400" />
                            <span className="font-medium text-gray-700 text-[9px] whitespace-nowrap">
                                {apt.startTime.slice(0, 5)} - {apt.endTime.slice(0, 5)}
                            </span>
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-1">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col justify-center">
                                <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">
                                    {formatAppointmentType(apt.type)}
                                </h3>
                                {apt.subtype && (
                                    <p className="text-[10px] text-gray-500 truncate font-medium leading-tight">
                                        {formatSubtype(apt.subtype)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {onFillEncounter && (
                                    <Button
                                        size="sm"
                                        variant={apt.encounterCompleted ? "outline" : "default"}
                                        className={cn(
                                            "h-6 px-2 text-[10px] font-medium",
                                            apt.encounterCompleted
                                                ? "border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFillEncounter(apt);
                                        }}
                                    >
                                        {apt.encounterCompleted ? (
                                            <>
                                                <FileText className="h-2.5 w-2.5 mr-1" />
                                                View
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-2.5 w-2.5 mr-1" />
                                                Fill
                                            </>
                                        )}
                                    </Button>
                                )}

                                {onViewDetails && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-medium text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(apt);
                                        }}
                                    >
                                        <FileText className="h-2.5 w-2.5 mr-1" />
                                        Details
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full mt-auto pt-0.5">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 text-[9px] gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-1.5 border border-blue-100"
                                onClick={() => setViewingRecordingsFor(apt.id)}
                            >
                                <Mic className="h-2.5 w-2.5" />
                                Recordings
                            </Button>

                            {apt.assignedUserName && (
                                <div className="flex items-center gap-1 ml-auto text-gray-400">
                                    <User className="h-2.5 w-2.5" />
                                    <span className="text-[9px]">{apt.assignedUserName.split(' ')[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-gray-100">
                    <DialogHeader className="p-4 pb-2 bg-white border-b">
                        <DialogTitle className="text-lg">Appointment History</DialogTitle>
                        <DialogDescription className="text-xs">
                            Showing history for <span className="font-medium text-gray-900">{patientName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-4">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                                {/* Upcoming Column */}
                                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            Upcoming
                                        </h3>
                                        <Badge variant="secondary" className="h-5 text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5">
                                            {upcoming.length}
                                        </Badge>
                                    </div>
                                    <ScrollArea className="flex-1 bg-gray-50/50">
                                        <div className="flex flex-col gap-2 p-2">
                                            {upcoming.length > 0 ? (
                                                upcoming.map(renderAppointmentCard)
                                            ) : (
                                                <div className="h-[120px] flex flex-col items-center justify-center text-gray-400">
                                                    <Calendar className="h-6 w-6 text-gray-300 mb-1.5" />
                                                    <p className="text-[10px] font-medium">No upcoming appointments</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* Previous Column */}
                                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                            Previous
                                        </h3>
                                        <Badge variant="secondary" className="h-5 text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5">
                                            {previous.length}
                                        </Badge>
                                    </div>
                                    <ScrollArea className="flex-1 bg-gray-50/50">
                                        <div className="flex flex-col gap-2 p-2">
                                            {previous.length > 0 ? (
                                                previous.map(renderAppointmentCard)
                                            ) : (
                                                <div className="h-[120px] flex flex-col items-center justify-center text-gray-400">
                                                    <Clock className="h-6 w-6 text-gray-300 mb-1.5" />
                                                    <p className="text-[10px] font-medium">No previous appointments</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Recordings Dialog */}
            <Dialog open={!!viewingRecordingsFor} onOpenChange={(open) => !open && setViewingRecordingsFor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Encounter Recordings</DialogTitle>
                    </DialogHeader>
                    {viewingRecordingsFor && (
                        <RecordingsList appointmentId={viewingRecordingsFor} patientName={patientName} type="encounter" />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
