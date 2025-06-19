import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, MoreHorizontal } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (startTime: string, endTime: string, appointmentType?: string) => void;
}

export function DayView({ date, appointments, onAppointmentClick, onTimeSlotClick }: DayViewProps) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

  const appointmentTypes = [
    {
      key: 'consultation',
      label: 'Consult',
      color: 'bg-blue-50 border-blue-300',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500'
    },
    {
      key: 'printed-try-in',
      label: 'Printed Try In',
      color: 'bg-green-50 border-green-300',
      hoverColor: 'hover:bg-green-25',
      selectedColor: 'bg-green-100 border-green-400',
      dragColor: 'bg-green-200 border-green-500'
    },
    {
      key: 'follow-up',
      label: 'Follow Up',
      color: 'bg-orange-50 border-orange-300',
      hoverColor: 'hover:bg-orange-25',
      selectedColor: 'bg-orange-100 border-orange-400',
      dragColor: 'bg-orange-200 border-orange-500'
    },
    {
      key: 'surgery',
      label: 'Surgery',
      color: 'bg-purple-50 border-purple-300',
      hoverColor: 'hover:bg-purple-25',
      selectedColor: 'bg-purple-100 border-purple-400',
      dragColor: 'bg-purple-200 border-purple-500'
    }
  ];

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getAppointmentsForTimeSlotAndType = (hour: number, minute: number, appointmentType: string) => {
    return appointments.filter(apt => {
      const [startHour, startMinute] = apt.startTime.split(':').map(Number);
      const [endHour, endMinute] = apt.endTime.split(':').map(Number);

      const slotStart = hour * 60 + minute;
      const slotEnd = hour * 60 + minute + 15;
      const aptStart = startHour * 60 + startMinute;
      const aptEnd = endHour * 60 + endMinute;

      const typeMatch = apt.type === appointmentType;

      return aptStart < slotEnd && aptEnd > slotStart && typeMatch;
    });
  };

  // Drag handlers
  const handleMouseDown = useCallback((hour: number, minute: number, column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ hour, minute, column });
    setDragEnd({ hour, minute, column });
    setDragColumn(column);
  }, []);

  const handleMouseEnter = useCallback((hour: number, minute: number, column: string) => {
    if (isDragging && dragColumn === column) {
      setDragEnd({ hour, minute, column });
    }
  }, [isDragging, dragColumn]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragColumn) {
      const startTotalMinutes = dragStart.hour * 60 + dragStart.minute;
      const endTotalMinutes = dragEnd.hour * 60 + dragEnd.minute + 15; // +15 for end of slot

      const startHour = Math.floor(Math.min(startTotalMinutes, endTotalMinutes) / 60);
      const startMinute = Math.min(startTotalMinutes, endTotalMinutes) % 60;
      const endHour = Math.floor(Math.max(startTotalMinutes, endTotalMinutes) / 60);
      const endMinute = Math.max(startTotalMinutes, endTotalMinutes) % 60;

      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      onTimeSlotClick(startTime, endTime, dragColumn);
    }

    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragColumn(null);
  }, [isDragging, dragStart, dragEnd, dragColumn, onTimeSlotClick]);

  // Check if this hour contains any part of the drag selection
  const isHourInDragSelection = (hour: number, column: string) => {
    if (!isDragging || !dragStart || !dragEnd || dragColumn !== column) return false;

    const startTotalMinutes = Math.min(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute);
    const endTotalMinutes = Math.max(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute + 15);

    const hourStart = hour * 60;
    const hourEnd = hour * 60 + 60;

    return startTotalMinutes < hourEnd && endTotalMinutes > hourStart;
  };

  // Get the drag selection rectangle dimensions for this hour
  const getDragSelectionForHour = (hour: number, column: string) => {
    if (!isDragging || !dragStart || !dragEnd || dragColumn !== column) return null;

    const startTotalMinutes = Math.min(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute);
    const endTotalMinutes = Math.max(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute + 15);

    const hourStart = hour * 60;
    const hourEnd = hour * 60 + 60;

    // Check if this hour intersects with the selection
    if (startTotalMinutes >= hourEnd || endTotalMinutes <= hourStart) return null;

    // Calculate the portion of this hour that's selected
    const selectionStart = Math.max(startTotalMinutes, hourStart);
    const selectionEnd = Math.min(endTotalMinutes, hourEnd);

    const topPercent = ((selectionStart - hourStart) / 60) * 100;
    const heightPercent = ((selectionEnd - selectionStart) / 60) * 100;

    return { topPercent, heightPercent };
  };

  // Get the color scheme for an appointment type
  const getTypeColors = (typeKey: string) => {
    return appointmentTypes.find(type => type.key === typeKey) || appointmentTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'completed':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-white select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Time Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        {/* Column Headers - Inside scrollable container */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="grid" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }}>
            {/* Time Column Header */}
            <div className="p-3 border-r border-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">Time</span>
            </div>

            {/* Appointment Type Column Headers */}
            {appointmentTypes.map((type, index) => (
              <div key={type.key} className={`p-3 flex items-center justify-center ${index < appointmentTypes.length - 1 ? 'border-r border-gray-200' : ''}`}>
                <span className="text-xs font-medium text-gray-700">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Continuous drag selection overlay - positioned absolutely over the entire grid */}
          {isDragging && dragStart && dragEnd && dragColumn && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {appointmentTypes.map((type, typeIndex) => {
                if (type.key !== dragColumn) return null;

                const typeColors = getTypeColors(type.key);
                const startTotalMinutes = Math.min(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute);
                const endTotalMinutes = Math.max(dragStart.hour * 60 + dragStart.minute, dragEnd.hour * 60 + dragEnd.minute + 15);

                // Calculate position within the grid
                const totalHours = hours.length;
                const firstHour = hours[0];
                const hourHeight = 80; // min-h-[80px]

                const startHour = Math.floor(startTotalMinutes / 60);
                const endHour = Math.floor((endTotalMinutes - 1) / 60);

                const topPosition = (startHour - firstHour) * hourHeight + ((startTotalMinutes % 60) / 60) * hourHeight;
                const bottomPosition = (endHour - firstHour) * hourHeight + (((endTotalMinutes % 60) || 60) / 60) * hourHeight;
                const height = bottomPosition - topPosition;

                // Calculate column position
                const columnWidth = `calc((100% - 80px) / ${appointmentTypes.length})`;
                const leftPosition = `calc(80px + ${typeIndex} * ${columnWidth})`;

                return (
                  <div
                    key={type.key}
                    className={`absolute ${typeColors.dragColor} rounded-lg border-2 ${typeColors.dragColor.split(' ')[1]} shadow-lg`}
                    style={{
                      left: leftPosition,
                      width: columnWidth,
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      marginLeft: '4px',
                      marginRight: '4px',
                    }}
                  >
                    <div className="p-3 h-full flex flex-col justify-center">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Creating {type.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.floor(startTotalMinutes / 60)}:
                          {String(startTotalMinutes % 60).padStart(2, '0')} -
                          {Math.floor(endTotalMinutes / 60)}:
                          {String(endTotalMinutes % 60).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hour grid */}
          <div className="grid grid-cols-1">
            {hours.map((hour) => {
              return (
                <div key={hour} className="border-b border-gray-200 min-h-[80px]">
                  <div className="grid h-full" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }}>
                    {/* Time Column */}
                    <div className="border-r border-gray-200 flex items-center justify-end p-4">
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        {formatTime(hour)}
                      </span>
                    </div>

                    {/* Appointment Type Columns */}
                    {appointmentTypes.map((type, typeIndex) => {
                      const typeColors = getTypeColors(type.key);

                      // Get appointments for this hour and type
                      const hourAppointments = appointments.filter(apt => {
                        const startHour = parseInt(apt.startTime.split(':')[0]);
                        const typeMatch = apt.type === type.key;
                        return startHour === hour && typeMatch;
                      });

                      const hasActiveSelection = isDragging && dragColumn === type.key;

                      return (
                        <div
                          key={type.key}
                          className={`p-2 cursor-pointer transition-all relative ${
                            typeIndex < appointmentTypes.length - 1 ? 'border-r border-gray-200' : ''
                          } ${
                            hasActiveSelection
                              ? ``
                              : `hover:bg-gray-50`
                          }`}
                          onMouseDown={(e) => {
                            // Calculate which 15-minute slot was clicked based on position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const relativeY = e.clientY - rect.top;
                            const slotHeight = rect.height / 4;
                            const slotIndex = Math.floor(relativeY / slotHeight);
                            const minute = Math.min(slotIndex * 15, 45);
                            handleMouseDown(hour, minute, type.key, e);
                          }}
                          onMouseMove={(e) => {
                            if (isDragging && dragColumn === type.key) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const relativeY = e.clientY - rect.top;
                              const slotHeight = rect.height / 4;
                              const slotIndex = Math.floor(relativeY / slotHeight);
                              const minute = Math.min(slotIndex * 15, 45);
                              handleMouseEnter(hour, minute, type.key);
                            }
                          }}
                        >
                          {!hasActiveSelection && hourAppointments.length > 0 ? (
                            <div className="space-y-2 relative z-10 p-1">
                              {hourAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${typeColors.color} ${typeColors.selectedColor.split(' ')[1]} shadow-sm`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAppointmentClick(appointment);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors.selectedColor} text-gray-700`}>
                                          {type.label}
                                        </span>
                                      </div>
                                      <h4 className="font-semibold text-sm mb-1 text-gray-800">
                                        {appointment.title}
                                      </h4>
                                      <div className="flex items-center text-xs text-gray-600 mb-1">
                                        <User className="h-3 w-3 mr-1" />
                                        <span className="truncate">{appointment.patient}</span>
                                      </div>
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {appointment.startTime} - {appointment.endTime}
                                      </div>
                                      {appointment.notes && (
                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                          {appointment.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : !hasActiveSelection ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity relative z-10">
                              Drag to schedule
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
