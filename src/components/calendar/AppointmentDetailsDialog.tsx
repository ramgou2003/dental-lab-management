import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Clock3, UserCheck, ClipboardList, CalendarCheck, Heart, Smile, UserCircle, FlaskConical } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  subtype?: string;
  status: string; // Display label
  statusCode: string; // Code for logic/colors
  encounterCompleted?: boolean;
  patientId?: string;
  date: string;
  notes?: string;
  assignedUserName?: string;
  nextAppointmentScheduled?: boolean;
  nextAppointmentStatus?: 'scheduled' | 'not_scheduled' | 'not_required';
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
  nextAppointmentType?: string;
  nextAppointmentSubtype?: string;
  archType?: string;
  upperArchSubtype?: string;
  lowerArchSubtype?: string;
}

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  canUpdateAppointments?: boolean;
  canDeleteAppointments?: boolean;
  onOpenHealthHistory?: (patientId: string, patientName: string) => void;
  onOpenComfortPreference?: (patientId: string, patientName: string) => void;
  onOpenEncounter?: (appointment: Appointment) => void;
  onViewProfile?: (patientId: string) => void;
  onAddLabScript?: (appointment: Appointment) => void;
}

export function AppointmentDetailsDialog({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  canUpdateAppointments = true,
  canDeleteAppointments = true,
  onOpenHealthHistory,
  onOpenComfortPreference,
  onOpenEncounter,
  onViewProfile,
  onAddLabScript
}: AppointmentDetailsDialogProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  if (!appointment) return null;

  const handleEdit = () => {
    onEdit(appointment);
    onClose();
  };

  const handleDelete = () => {
    onDelete(appointment.id);
    onClose();
    setShowDeleteConfirm(false);
  };

  const handleStatusChange = (newStatus: Appointment['status']) => {
    if (appointment) {
      onStatusChange(appointment.id, newStatus);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '?????':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FIRM':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EFIRM':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EMER':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HERE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LM1':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LM2':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MULTI':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case '2wk':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'NSHOW':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RESCH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCL':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'CMPLT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '?????':
        return <AlertCircle className="h-4 w-4" />;
      case 'FIRM':
        return <CheckCircle className="h-4 w-4" />;
      case 'EFIRM':
        return <CheckCircle className="h-4 w-4" />;
      case 'EMER':
        return <AlertCircle className="h-4 w-4" />;
      case 'HERE':
        return <UserCheck className="h-4 w-4" />;
      case 'READY':
        return <CheckCircle className="h-4 w-4" />;
      case 'LM1':
        return <Clock3 className="h-4 w-4" />;
      case 'LM2':
        return <Clock3 className="h-4 w-4" />;
      case 'MULTI':
        return <CheckCircle className="h-4 w-4" />;
      case '2wk':
        return <Clock3 className="h-4 w-4" />;
      case 'NSHOW':
        return <XCircle className="h-4 w-4" />;
      case 'RESCH':
        return <Calendar className="h-4 w-4" />;
      case 'CANCL':
        return <XCircle className="h-4 w-4" />;
      case 'CMPLT':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock3 className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case '?????':
        return '????? Not Confirmed';
      case 'FIRM':
        return 'FIRM Appointment Confirmed';
      case 'EFIRM':
        return 'EFIRM Electronically Confirmed';
      case 'EMER':
        return 'EMER Emergency Patient';
      case 'HERE':
        return 'HERE Patient has Arrived';
      case 'READY':
        return 'READY Ready for Operatory';
      case 'LM1':
        return 'LM1 Left 1st Message';
      case 'LM2':
        return 'LM2 Left 2nd Message';
      case 'MULTI':
        return 'MULTI Multi-Appointment';
      case '2wk':
        return '2wk 2 Week Calls';
      case 'NSHOW':
        return 'NSHOW No Show';
      case 'RESCH':
        return 'RESCH Appointment Rescheduled';
      case 'CANCL':
        return 'CANCL Appointment Cancelled';
      case 'CMPLT':
        return 'CMPLT Appointment Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consult';
      case 'printed-try-in':
        return 'Appliance Delivery';
      case 'follow-up':
        return 'Follow Up';
      case 'data-collection':
        return 'Data Collection';
      case 'surgery':
        return 'Surgery';
      case 'surgical-revision':
        return 'Surgical Revision';
      case 'emergency':
        return 'Emergency';
      default:
        return type;
    }
  };

  const getSubtypeLabel = (subtype: string | undefined): string | null => {
    if (!subtype) return null;

    const subtypeLabels: Record<string, string> = {
      '7-day-followup': '7 Day Follow-up',
      '30-day-followup': '30 Days Follow-up',
      'observation-followup': 'Follow-up for Observation',
      '3-month-followup': '3 Months Follow Up',
      '6-month-followup': '6 Months Follow Up',
      '12-month-followup': '12 Months Follow Up',
      'printed-try-in-delivery': 'Printed Try-in Delivery',
      '82-day-appliance-delivery': '82 Days PTI Delivery',
      '120-day-final-delivery': '120 Days Final Delivery',
      '75-day-data-collection': '75 Days Data Collection for PTI',
      'final-data-collection': 'Final Data Collection',
      'data-collection-printed-try-in': 'Data collection for Printed-try-in',
      'pre-surgery-data-collection': 'Pre-Surgery data collection',
      'surgical-day-appliance': 'Surgical day appliance',
      'nightguard': 'Nightguard',
      'administrative-documents': 'Administrative documents',
      // Surgery subtypes
      'full-arch-fixed': 'Full Arch Fixed',
      'denture': 'Denture',
      'implant-removable-denture': 'Implant Removable Denture',
      'single-implant': 'Single Implant',
      'multiple-implants': 'Multiple Implants',
      'extraction': 'Extraction',
      'extraction-and-graft': 'Extraction and Graft'
    };

    return subtypeLabels[subtype] || null;
  };

  const formatDate = (dateString: string) => {
    // Parse date string and create date in EST timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  const formatTime = (timeString: string) => {
    // Remove seconds from time string (HH:MM:SS -> HH:MM)
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">
            Appointment Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and manage appointment details for {appointment.patient}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            {/* Patient Information */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Patient</p>
                {appointment.patientId ? (
                  <button
                    onClick={() => {
                      navigate(`/patients/${appointment.patientId}`);
                      onClose();
                    }}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-left transition-colors"
                  >
                    {appointment.patient}
                  </button>
                ) : (
                  <p className="font-semibold text-gray-900">{appointment.patient}</p>
                )}
              </div>
            </div>

            {/* Appointment Type */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Appointment Type</p>
                <p className="font-semibold text-gray-900">{getAppointmentTypeLabel(appointment.type)}</p>
                {appointment.archType ? (
                  <div className="mt-2 space-y-1 bg-blue-50/50 p-2 rounded-md border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">{appointment.archType} Arch</p>
                    {appointment.archType === 'Dual' ? (
                      <div className="grid grid-cols-1 gap-1 ml-1">
                        <div className="text-sm text-blue-700 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-[10px] flex items-center justify-center font-bold text-blue-600">U</span>
                          {getSubtypeLabel(appointment.upperArchSubtype) || appointment.upperArchSubtype || 'Not selected'}
                        </div>
                        <div className="text-sm text-blue-700 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-[10px] flex items-center justify-center font-bold text-blue-600">L</span>
                          {getSubtypeLabel(appointment.lowerArchSubtype) || appointment.lowerArchSubtype || 'Not selected'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700 flex items-center gap-2 ml-1">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-[10px] flex items-center justify-center font-bold text-blue-600">
                          {appointment.archType === 'Upper' ? 'U' : 'L'}
                        </span>
                        {getSubtypeLabel(appointment.archType === 'Upper' ? appointment.upperArchSubtype : appointment.lowerArchSubtype) ||
                          (appointment.archType === 'Upper' ? appointment.upperArchSubtype : appointment.lowerArchSubtype) ||
                          'Not selected'}
                      </div>
                    )}
                  </div>
                ) : (
                  appointment.subtype && getSubtypeLabel(appointment.subtype) && (
                    <p className="text-sm text-blue-600 mt-1 italic">📋 {getSubtypeLabel(appointment.subtype)}</p>
                  )
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Date & Time</p>
                <p className="font-semibold text-gray-900">{formatDate(appointment.date)}</p>
                <p className="text-sm text-gray-700">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
              </div>
            </div>

            {/* Assigned User */}
            {appointment.assignedUserName && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">Assigned To</p>
                  <p className="font-semibold text-gray-900">{appointment.assignedUserName}</p>
                </div>
              </div>
            )}

            {/* Action Buttons - Below Assigned To */}
            {(onViewProfile || onOpenHealthHistory || onOpenComfortPreference || onOpenEncounter || onAddLabScript) && (
              <div className="flex gap-2 pt-3 justify-start">
                {onViewProfile && appointment.patientId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col h-auto py-2 gap-1 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => {
                      onViewProfile(appointment.patientId!);
                      onClose();
                    }}
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Button>
                )}
                {onOpenHealthHistory && appointment.patientId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col h-auto py-2 gap-1 text-xs hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                    onClick={() => {
                      onOpenHealthHistory(appointment.patientId!, appointment.patient);
                      onClose();
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    History
                  </Button>
                )}
                {onOpenComfortPreference && appointment.patientId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col h-auto py-2 gap-1 text-xs hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                    onClick={() => {
                      onOpenComfortPreference(appointment.patientId!, appointment.patient);
                      onClose();
                    }}
                  >
                    <Smile className="h-4 w-4" />
                    Comfort
                  </Button>
                )}
                {onOpenEncounter && (
                  <Button
                    variant={appointment.encounterCompleted ? "outline" : "default"}
                    size="sm"
                    className={`flex flex-col h-auto py-2 gap-1 text-xs ${appointment.encounterCompleted
                      ? "hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      : "bg-green-600 hover:bg-green-700 text-white border-transparent shadow-sm"
                      }`}
                    onClick={() => {
                      onOpenEncounter(appointment);
                      onClose();
                    }}
                  >
                    {appointment.encounterCompleted ? <ClipboardList className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    Encounter
                  </Button>
                )}
                {onAddLabScript && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col h-auto py-2 gap-1 text-xs hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                    onClick={() => {
                      onAddLabScript(appointment);
                      onClose();
                    }}
                  >
                    <FlaskConical className="h-4 w-4" />
                    Lab Script
                  </Button>
                )}
              </div>
            )}

          </div>
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStatusColor(appointment.statusCode).replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'bg-')}`}>
                {getStatusIcon(appointment.statusCode)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={`${getStatusColor(appointment.statusCode)} flex items-center gap-1`}>
                  {getStatusIcon(appointment.statusCode)}
                  {getStatusLabel(appointment.statusCode)}
                </Badge>
              </div>
            </div>

            {/* Encounter Status */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${appointment.encounterCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                <ClipboardList className={`h-5 w-5 ${appointment.encounterCompleted ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${appointment.encounterCompleted ? 'text-green-600' : 'text-orange-600'}`}>Encounter Form</p>
                <p className="font-semibold text-gray-900">
                  {appointment.encounterCompleted ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${(appointment.nextAppointmentStatus === 'scheduled' || appointment.nextAppointmentScheduled) ? 'bg-purple-100' :
                appointment.nextAppointmentStatus === 'not_required' ? 'bg-slate-100' : 'bg-gray-100'
                }`}>
                {appointment.nextAppointmentStatus === 'not_required' ? (
                  <XCircle className="h-5 w-5 text-slate-500" />
                ) : (appointment.nextAppointmentStatus === 'scheduled' || appointment.nextAppointmentScheduled) ? (
                  <CalendarCheck className="h-5 w-5 text-purple-600" />
                ) : (
                  <CalendarCheck className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className={`text-sm ${(appointment.nextAppointmentStatus === 'scheduled' || appointment.nextAppointmentScheduled) ? 'text-purple-600' :
                  appointment.nextAppointmentStatus === 'not_required' ? 'text-slate-600' : 'text-gray-600'
                  }`}>Next Appointment</p>

                {(appointment.nextAppointmentStatus === 'scheduled' || appointment.nextAppointmentScheduled) && appointment.nextAppointmentDate ? (
                  <div>
                    <p className="font-semibold text-gray-900">{formatDate(appointment.nextAppointmentDate)}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(appointment.nextAppointmentTime || '')} - {getAppointmentTypeLabel(appointment.nextAppointmentType || '')}
                      {appointment.nextAppointmentSubtype && ` (${getSubtypeLabel(appointment.nextAppointmentSubtype)})`}
                    </p>
                  </div>
                ) : appointment.nextAppointmentStatus === 'not_required' ? (
                  <p className="font-semibold text-slate-500">Not Required</p>
                ) : (
                  <p className="font-semibold text-gray-500">Not Scheduled</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {appointment.notes}
                </p>
              </div>
            )}


          </div>
        </div>

        {/* Actions */}
        {(canUpdateAppointments || canDeleteAppointments) && (
          <div className="flex items-center pt-6 border-t">
            {canDeleteAppointments && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            {canUpdateAppointments && appointment.statusCode !== 'CMPLT' && (
              <Button
                onClick={handleEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white ml-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white rounded-lg p-6 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Appointment</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to delete this appointment with {appointment.patient}?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
