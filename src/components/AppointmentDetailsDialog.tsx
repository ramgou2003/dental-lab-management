import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit3
} from "lucide-react";
import { LeadAppointmentScheduler } from "./LeadAppointmentScheduler";

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  onAppointmentUpdated?: () => void;
}

export function AppointmentDetailsDialog({
  isOpen,
  onClose,
  appointment,
  leadId,
  leadName,
  leadEmail,
  leadPhone,
  onAppointmentUpdated
}: AppointmentDetailsDialogProps) {
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  if (!appointment) return null;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Handle reschedule success
  const handleRescheduleSuccess = () => {
    setShowRescheduleDialog(false);
    if (onAppointmentUpdated) {
      onAppointmentUpdated();
    }
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Appointment Details
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                Consultation appointment for {leadName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Appointment Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            <Badge className={`${getStatusColor(appointment.status)} border px-3 py-1`}>
              {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
              {appointment.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>

          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Date</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {formatDate(appointment.date)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Time</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Type</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {appointment.appointment_type || appointment.type} (30 minutes)
                </p>
              </div>

              {appointment.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Notes</span>
                  </div>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{leadName}</p>
                  <p className="text-sm text-gray-600">Lead</p>
                </div>
                {leadEmail && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {leadEmail}
                  </div>
                )}
                {leadPhone && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {leadPhone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div></div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => setShowRescheduleDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Reschedule
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Reschedule Dialog */}
    <LeadAppointmentScheduler
      isOpen={showRescheduleDialog}
      onClose={() => setShowRescheduleDialog(false)}
      onAppointmentScheduled={handleRescheduleSuccess}
      leadId={leadId}
      leadName={leadName}
      leadEmail={leadEmail}
      leadPhone={leadPhone}
      existingAppointment={appointment}
    />
    </>
  );
}
