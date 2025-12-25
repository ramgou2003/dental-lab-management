import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Clock3, UserCheck } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  subtype?: string;
  status: '?????' | 'FIRM' | 'EFIRM' | 'EMER' | 'HERE' | 'READY' | 'LM1' | 'LM2' | 'MULTI' | '2wk' | 'NSHOW' | 'RESCH' | 'CANCL';
  date: string;
  notes?: string;
  assignedUserName?: string;
}

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
  canUpdateAppointments?: boolean;
  canDeleteAppointments?: boolean;
}

export function AppointmentDetailsDialog({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  canUpdateAppointments = true,
  canDeleteAppointments = true
}: AppointmentDetailsDialogProps) {
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
      'printed-try-in-delivery': 'Printed Try-in Delivery',
      '82-day-appliance-delivery': '82 Days PTI Delivery',
      '120-day-final-delivery': '120 Days Final Delivery',
      '75-day-data-collection': '75 Days Data Collection for PTI',
      'final-data-collection': 'Final Data Collection'
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-900">
            Appointment Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and manage appointment details for {appointment.patient}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Patient Information */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Patient</p>
              <p className="font-semibold text-gray-900">{appointment.patient}</p>
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
              {appointment.subtype && getSubtypeLabel(appointment.subtype) && (
                <p className="text-sm text-blue-600 mt-1">📋 {getSubtypeLabel(appointment.subtype)}</p>
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

          {/* Status */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(appointment.status).replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'bg-')}`}>
              {getStatusIcon(appointment.status)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                {getStatusIcon(appointment.status)}
                {getStatusLabel(appointment.status)}
              </Badge>
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

        {/* Actions */}
        {(canUpdateAppointments || canDeleteAppointments) && (
          <div className="flex justify-between pt-6 border-t">
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

            {canUpdateAppointments && (
              <Button
                onClick={handleEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
