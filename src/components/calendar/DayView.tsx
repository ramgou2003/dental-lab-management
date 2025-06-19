import React, { useState, useRef, useCallback, useEffect } from "react";
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
      shortLabel: 'Consult',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      key: 'printed-try-in',
      label: 'Printed Try In',
      shortLabel: 'Try In',
      color: 'bg-green-100 border-green-300 text-green-800',
      hoverColor: 'hover:bg-green-25',
      selectedColor: 'bg-green-100 border-green-400',
      dragColor: 'bg-green-200 border-green-500',
      badgeColor: 'bg-green-500 text-white'
    },
    {
      key: 'follow-up',
      label: 'Follow Up',
      shortLabel: 'Follow Up',
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      hoverColor: 'hover:bg-orange-25',
      selectedColor: 'bg-orange-100 border-orange-400',
      dragColor: 'bg-orange-200 border-orange-500',
      badgeColor: 'bg-orange-500 text-white'
    },
    {
      key: 'surgery',
      label: 'Surgery',
      shortLabel: 'Surgery',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      hoverColor: 'hover:bg-purple-25',
      selectedColor: 'bg-purple-100 border-purple-400',
      dragColor: 'bg-purple-200 border-purple-500',
      badgeColor: 'bg-purple-500 text-white'
    }
  ];

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getTypeColors = (typeKey: string) => {
    return appointmentTypes.find(type => type.key === typeKey) || {
      key: typeKey,
      label: typeKey,
      shortLabel: typeKey,
      color: 'bg-gray-100 border-gray-300 text-gray-800',
      hoverColor: 'hover:bg-gray-25',
      selectedColor: 'bg-gray-100 border-gray-400',
      dragColor: 'bg-gray-200 border-gray-500',
      badgeColor: 'bg-gray-500 text-white'
    };
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
  // Check if a time slot has an existing appointment
  const hasAppointmentInSlot = (hour: number, minute: number, column: string): boolean => {
    const slotTime = hour * 60 + minute;

    return appointments.some(appointment => {
      if (appointment.type !== column) return false;

      const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
      const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

      const appointmentStart = startHour * 60 + startMinute;
      const appointmentEnd = endHour * 60 + endMinute;

      // Check if the slot is within the appointment time range
      return slotTime >= appointmentStart && slotTime < appointmentEnd;
    });
  };

  // Check if an entire hour has appointments (for visual feedback)
  const hasAppointmentInHour = (hour: number, column: string): boolean => {
    return appointments.some(appointment => {
      if (appointment.type !== column) return false;

      const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
      const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

      const appointmentStart = startHour * 60 + startMinute;
      const appointmentEnd = endHour * 60 + endMinute;
      const hourStart = hour * 60;
      const hourEnd = (hour + 1) * 60;

      // Check if appointment overlaps with this hour
      return !(appointmentEnd <= hourStart || appointmentStart >= hourEnd);
    });
  };

  const handleMouseDown = useCallback((hour: number, minute: number, column: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Check if there's already an appointment in this slot
    if (hasAppointmentInSlot(hour, minute, column)) {
      return; // Don't start dragging if slot is occupied
    }

    setIsDragging(true);
    setDragStart({ hour, minute, column });
    setDragEnd({ hour, minute, column });
    setDragColumn(column);
  }, []);

  const handleMouseEnter = useCallback((hour: number, minute: number, column: string, mouseY?: number) => {
    if (isDragging && dragColumn === column) {
      // Auto-scroll functionality for mouse drag
      if (mouseY && scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 5; // pixels per scroll

        // Check if mouse is near top edge - scroll up
        if (mouseY < containerRect.top + scrollThreshold) {
          scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop - scrollSpeed);
        }
        // Check if mouse is near bottom edge - scroll down
        else if (mouseY > containerRect.bottom - scrollThreshold) {
          scrollContainer.scrollTop = scrollContainer.scrollTop + scrollSpeed;
        }
      }

      // Check if we're trying to drag into an occupied slot
      const currentTime = hour * 60 + minute;
      const startTime = dragStart!.hour * 60 + dragStart!.minute;

      // Determine the range we're trying to select
      const rangeStart = Math.min(startTime, currentTime);
      const rangeEnd = Math.max(startTime, currentTime) + 15; // Add 15 minutes for the slot duration

      // Check if any part of this range conflicts with existing appointments
      const hasConflict = appointments.some(appointment => {
        if (appointment.type !== column) return false;

        const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
        const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

        const appointmentStart = startHour * 60 + startMinute;
        const appointmentEnd = endHour * 60 + endMinute;

        // Check if ranges overlap
        return !(rangeEnd <= appointmentStart || rangeStart >= appointmentEnd);
      });

      // Only update drag end if there's no conflict
      if (!hasConflict) {
        setDragEnd({ hour, minute, column });
      }
    }
  }, [isDragging, dragColumn, dragStart, appointments]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragColumn) {
      // Only create appointment if we actually dragged (moved to a different slot)
      const startTotalMinutes = dragStart.hour * 60 + dragStart.minute;
      const endTotalMinutes = dragEnd.hour * 60 + dragEnd.minute + 15; // +15 for end of slot

      // Check if this is a meaningful drag (not just a click)
      const isDraggedSelection = Math.abs(endTotalMinutes - startTotalMinutes) > 15 ||
                                dragStart.hour !== dragEnd.hour ||
                                dragStart.minute !== dragEnd.minute;

      if (isDraggedSelection) {
        const startHour = Math.floor(Math.min(startTotalMinutes, endTotalMinutes) / 60);
        const startMinute = Math.min(startTotalMinutes, endTotalMinutes) % 60;
        const endHour = Math.floor(Math.max(startTotalMinutes, endTotalMinutes) / 60);
        const endMinute = Math.max(startTotalMinutes, endTotalMinutes) % 60;

        const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

        onTimeSlotClick(startTime, endTime, dragColumn);
      }
    }

    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragColumn(null);
  }, [isDragging, dragStart, dragEnd, dragColumn, onTimeSlotClick]);

  // Touch event handlers for tablet support
  const handleTouchStart = useCallback((hour: number, minute: number, column: string, e: React.TouchEvent) => {
    // Prevent all default touch behaviors
    e.preventDefault();
    e.stopPropagation();

    // Check if there's already an appointment in this slot
    if (hasAppointmentInSlot(hour, minute, column)) {
      return; // Don't start dragging if slot is occupied
    }

    setIsDragging(true);
    setDragStart({ hour, minute, column });
    setDragEnd({ hour, minute, column });
    setDragColumn(column);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragColumn) return;

    // Prevent all default touch behaviors during drag
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const scrollContainer = scrollContainerRef.current;

    // Auto-scroll functionality
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const touchY = touch.clientY;
      const scrollThreshold = 50; // pixels from edge to trigger scroll
      const scrollSpeed = 5; // pixels per scroll

      // Check if touch is near top edge - scroll up
      if (touchY < containerRect.top + scrollThreshold) {
        scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop - scrollSpeed);
      }
      // Check if touch is near bottom edge - scroll down
      else if (touchY > containerRect.bottom - scrollThreshold) {
        scrollContainer.scrollTop = scrollContainer.scrollTop + scrollSpeed;
      }
    }

    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      // Find the closest time slot element
      const slotElement = element.closest('[data-hour][data-minute][data-column]');
      if (slotElement) {
        const hour = parseInt(slotElement.getAttribute('data-hour') || '0');
        const minute = parseInt(slotElement.getAttribute('data-minute') || '0');
        const column = slotElement.getAttribute('data-column') || '';

        if (column === dragColumn) {
          handleMouseEnter(hour, minute, column);
        }
      }
    }
  }, [isDragging, dragColumn, handleMouseEnter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();
    handleMouseUp();
  }, [handleMouseUp]);



  // Add global touch event prevention during drag and auto-scroll functionality
  useEffect(() => {
    const preventDefaultTouch = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const preventScroll = (e: Event) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isDragging) {
      // Completely disable all scrolling during drag
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });

      // Prevent all scroll behaviors
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';

      // Disable scroll on the container too
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('touchmove', preventDefaultTouch);
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('scroll', preventScroll);

      // Restore normal scroll behavior
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';

      // Restore container scroll
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.overflow = 'auto';
      }
    };
  }, [isDragging]);

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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: isDragging ? 'none' : 'auto',
        overscrollBehavior: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Time Grid - Scrollable */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        style={{
          overscrollBehavior: isDragging ? 'none' : 'auto',
          touchAction: isDragging ? 'none' : 'pan-y'
        }}
      >
        {/* Column Headers - Inside scrollable container */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-50">
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
            <div className="absolute inset-0 pointer-events-none z-10">
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

                // Calculate exact position based on total minutes from first hour
                const startMinutesFromFirst = startTotalMinutes - (firstHour * 60);
                const endMinutesFromFirst = endTotalMinutes - (firstHour * 60);

                const topPosition = (startMinutesFromFirst / 60) * hourHeight;
                const bottomPosition = (endMinutesFromFirst / 60) * hourHeight;
                const height = bottomPosition - topPosition;

                // Calculate column position to match the grid exactly
                // Grid uses: '80px 1fr 1fr 1fr 1fr' - so each column gets equal 1fr
                const columnWidth = `calc((100% - 80px) / ${appointmentTypes.length})`;
                const leftPosition = `calc(80px + ${typeIndex} * ${columnWidth})`;

                return (
                  <div
                    key={type.key}
                    className={`absolute ${typeColors.dragColor} rounded-lg border-2 shadow-lg`}
                    style={{
                      left: `calc(${leftPosition} + 8px)`, // Add left padding
                      width: `calc(${columnWidth} - 16px)`, // Subtract left and right padding
                      top: `${topPosition}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="text-sm font-medium text-gray-700">
                        {Math.floor(startTotalMinutes / 60)}:
                        {String(startTotalMinutes % 60).padStart(2, '0')} -
                        {Math.floor(endTotalMinutes / 60)}:
                        {String(endTotalMinutes % 60).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Continuous appointment rectangles - positioned absolutely over the entire grid */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {appointmentTypes.map((type, typeIndex) => {
              const typeColors = getTypeColors(type.key);

              // Get all appointments for this type
              const typeAppointments = appointments.filter(apt => apt.type === type.key);

              return typeAppointments.map((appointment) => {
                const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

                const startTotalMinutes = startHour * 60 + startMinute;
                const endTotalMinutes = endHour * 60 + endMinute;

                // Calculate position within the grid
                const firstHour = hours[0];
                const hourHeight = 80;

                // Calculate exact position based on total minutes from first hour
                const startMinutesFromFirst = startTotalMinutes - (firstHour * 60);
                const endMinutesFromFirst = endTotalMinutes - (firstHour * 60);

                const topPosition = (startMinutesFromFirst / 60) * hourHeight;
                const bottomPosition = (endMinutesFromFirst / 60) * hourHeight;
                const height = bottomPosition - topPosition;

                // Calculate column position to match the grid exactly
                // Grid uses: '80px 1fr 1fr 1fr 1fr' - so each column gets equal 1fr
                const columnWidth = `calc((100% - 80px) / ${appointmentTypes.length})`;
                const leftPosition = `calc(80px + ${typeIndex} * ${columnWidth})`;

                return (
                  <div
                    key={appointment.id}
                    className={`absolute ${typeColors.color} rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-lg transition-all pointer-events-auto z-10`}
                    style={{
                      left: `calc(${leftPosition} + 8px)`, // Add left padding
                      width: `calc(${columnWidth} - 16px)`, // Subtract left and right padding
                      top: `${topPosition}px`,
                      height: `${height}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onAppointmentClick(appointment);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseMove={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onAppointmentClick(appointment);
                    }}
                  >
                    <div className="p-2 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">
                          {appointment.patient}
                        </h4>
                        <div className="text-xs text-gray-600 ml-2 flex-shrink-0">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                          {typeColors.shortLabel || typeColors.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })}
          </div>

          {/* Hour grid */}
          <div className="grid grid-cols-1">
            {hours.map((hour) => {
              return (
                <div key={hour} className="border-b border-gray-200 h-[80px]">
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

                      const hasActiveSelection = isDragging && dragColumn === type.key;

                      // Check if this hour has appointments for subtle visual feedback
                      const hourHasAppointment = hasAppointmentInHour(hour, type.key);

                      return (
                        <div
                          key={type.key}
                          className={`p-2 transition-all relative ${
                            typeIndex < appointmentTypes.length - 1 ? 'border-r border-gray-200' : ''
                          } ${
                            hasActiveSelection
                              ? ``
                              : `cursor-pointer`
                          }`}
                          onMouseDown={(e) => {
                            // Calculate which 15-minute slot was clicked based on position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const relativeY = e.clientY - rect.top;
                            const slotHeight = rect.height / 4;
                            const slotIndex = Math.floor(relativeY / slotHeight);
                            const minute = Math.min(slotIndex * 15, 45);

                            // Don't start drag if there's an appointment in this slot
                            if (!hasAppointmentInSlot(hour, minute, type.key)) {
                              handleMouseDown(hour, minute, type.key, e);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (isDragging && dragColumn === type.key) {
                              // Check if we're hovering over an appointment area
                              const rect = e.currentTarget.getBoundingClientRect();
                              const relativeY = e.clientY - rect.top;
                              const slotHeight = rect.height / 4;
                              const slotIndex = Math.floor(relativeY / slotHeight);
                              const minute = Math.min(slotIndex * 15, 45);

                              // Don't update drag if we're over an existing appointment
                              if (!hasAppointmentInSlot(hour, minute, type.key)) {
                                handleMouseEnter(hour, minute, type.key, e.clientY);
                              }
                            }
                          }}
                        >
                          {/* 15-minute separator lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* 15-minute line */}
                            <div
                              className="absolute left-2 right-2 border-t border-dashed border-gray-300 opacity-30"
                              style={{ top: '25%' }}
                            />
                            {/* 30-minute line */}
                            <div
                              className="absolute left-2 right-2 border-t border-dashed border-gray-300 opacity-30"
                              style={{ top: '50%' }}
                            />
                            {/* 45-minute line */}
                            <div
                              className="absolute left-2 right-2 border-t border-dashed border-gray-300 opacity-30"
                              style={{ top: '75%' }}
                            />
                          </div>

                          {/* 15-minute hover slots */}
                          {[0, 15, 30, 45].map((minute) => {
                            const hasAppointment = hasAppointmentInSlot(hour, minute, type.key);
                            return (
                              <div
                                key={minute}
                                className={`absolute inset-x-0 transition-all ${
                                  hasAppointment
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:bg-gray-50'
                                }`}
                                style={{
                                  top: `${(minute / 60) * 100}%`,
                                  height: '25%',
                                }}
                                data-hour={hour}
                                data-minute={minute}
                                data-column={type.key}
                                onMouseDown={(e) => {
                                  if (!hasAppointment) {
                                    handleMouseDown(hour, minute, type.key, e);
                                  }
                                }}
                                onTouchStart={(e) => {
                                  if (!hasAppointment) {
                                    handleTouchStart(hour, minute, type.key, e);
                                  }
                                }}
                              />
                            );
                          })}

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
