import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, User, Edit, Trash2 } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  notes?: string;
}

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

export function AppointmentDetailsDialog({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consult';
      case 'printed-try-in':
        return 'Printed Try In';
      case 'follow-up':
        return 'Follow Up';
      case 'data-collection':
        return 'Data Collection';
      case 'surgery':
        return 'Surgery';
      case 'emergency':
        return 'Emergency';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
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
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-semibold text-gray-900">{appointment.patient}</p>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Appointment Type</p>
              <p className="font-semibold text-gray-900">{getAppointmentTypeLabel(appointment.type)}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-900">{formatDate(appointment.date)}</p>
              <p className="text-sm text-gray-700">{appointment.startTime} - {appointment.endTime}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
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
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <Button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

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
