import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Edit, Trash2, CheckCircle, X } from "lucide-react";

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

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onStatusChange: (appointmentId: string, status: Appointment['status']) => void;
}

export function AppointmentDetails({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange
}: AppointmentDetailsProps) {
  if (!appointment) return null;

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

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'consultation': 'Consultation',
      'cleaning': 'Cleaning',
      'filling': 'Filling',
      'extraction': 'Extraction',
      'root-canal': 'Root Canal',
      'crown': 'Crown',
      'implant': 'Implant',
      'orthodontics': 'Orthodontics',
      'emergency': 'Emergency',
      'follow-up': 'Follow-up'
    };
    return types[type] || type;
  };

  const formatDate = (dateStr: string) => {
    // Parse date string and create date in EST timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleStatusChange = (newStatus: Appointment['status']) => {
    onStatusChange(appointment.id, newStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      onDelete(appointment.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Appointment Details
                </DialogTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Title and Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.title}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              {getTypeLabel(appointment.type)}
            </div>
          </div>

          {/* Patient Information */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">{appointment.patient}</div>
              <div className="text-sm text-gray-600">Patient</div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {formatDate(appointment.date)}
                </div>
                <div className="text-sm text-gray-600">Date</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Notes</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {appointment.notes}
              </div>
            </div>
          )}

          {/* Quick Status Actions */}
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900">Quick Actions</div>
              <div className="flex gap-2">
                {appointment.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('confirmed')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('completed')}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(appointment)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
