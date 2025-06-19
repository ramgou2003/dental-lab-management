import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, User, FileText, X } from "lucide-react";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  initialDate?: Date;
  initialTime?: string;
  editingAppointment?: any;
}

export function AppointmentForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialDate, 
  initialTime,
  editingAppointment 
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    patient: '',
    date: initialDate || new Date(),
    startTime: initialTime || '09:00',
    endTime: '09:30',
    type: 'consultation',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    notes: ''
  });

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        title: editingAppointment.title || '',
        patient: editingAppointment.patient || '',
        date: editingAppointment.date ? new Date(editingAppointment.date) : new Date(),
        startTime: editingAppointment.startTime || '09:00',
        endTime: editingAppointment.endTime || '09:30',
        type: editingAppointment.type || 'consultation',
        status: editingAppointment.status || 'scheduled',
        notes: editingAppointment.notes || ''
      });
    } else {
      setFormData({
        title: '',
        patient: '',
        date: initialDate || new Date(),
        startTime: initialTime || '09:00',
        endTime: '09:30',
        type: 'consultation',
        status: 'scheduled',
        notes: ''
      });
    }
  }, [editingAppointment, initialDate, initialTime, isOpen]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    return { value: time24, label: time12 };
  }).filter(slot => {
    const hour = parseInt(slot.value.split(':')[0]);
    return hour >= 8 && hour <= 18; // 8 AM to 6 PM
  });

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'filling', label: 'Filling' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'root-canal', label: 'Root Canal' },
    { value: 'crown', label: 'Crown' },
    { value: 'implant', label: 'Implant' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'follow-up', label: 'Follow-up' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.patient || !formData.date) {
      return;
    }

    const appointmentData = {
      id: editingAppointment?.id || `apt_${Date.now()}`,
      title: formData.title,
      patient: formData.patient,
      date: formData.date.toISOString().split('T')[0],
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      status: formData.status,
      notes: formData.notes
    };

    onSave(appointmentData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      patient: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '09:30',
      type: 'consultation',
      status: 'scheduled',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                </DialogTitle>
                <p className="text-gray-600 mt-1">
                  {editingAppointment ? 'Update appointment details' : 'Schedule a new appointment'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Appointment Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Dental Cleaning"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient" className="text-sm font-medium">
                Patient Name *
              </Label>
              <Input
                id="patient"
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date *</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  disabled={(date) => date < new Date()}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">
                Start Time *
              </Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">
                End Time *
              </Label>
              <Select
                value={formData.endTime}
                onValueChange={(value) => setFormData({ ...formData, endTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Appointment Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'scheduled' | 'confirmed' | 'completed' | 'cancelled') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or special instructions..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
