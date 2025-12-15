import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, MoreHorizontal, CheckCircle, XCircle, AlertCircle, Clock3, UserCheck, UserCircle, Heart, Smile, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'pending' | 'confirmed' | 'not-confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (startTime: string, endTime: string, appointmentType?: string) => void;
  isDialogOpen?: boolean;
  onClearSelection?: () => void;
  clearSelectionTrigger?: number;
  onStatusChange?: (appointmentId: string, newStatus: Appointment['status']) => void;
}

export function DayView({ date, appointments, onAppointmentClick, onTimeSlotClick, isDialogOpen, onClearSelection, clearSelectionTrigger, onStatusChange }: DayViewProps) {
  const navigate = useNavigate();

  // State for long-press handling
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Function to get status dot color
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'not-confirmed':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to find patient ID by name and navigate to profile or consultation page
  const handlePatientNameClick = async (appointment: Appointment) => {
    console.log('Patient name clicked:', appointment.patient, 'Type:', appointment.type);

    try {
      // For consultation appointments, navigate to consultation session page
      if (appointment.type === 'consultation') {
        console.log('Consultation appointment, navigating to consultation session:', appointment.id);
        navigate(`/consultation/${appointment.id}`);
        return;
      }

      // For other appointment types, navigate to patient profile
      console.log('Searching for patient in database...');

      // Search for patient by full name
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('full_name', appointment.patient)
        .limit(1);

      console.log('Database query result:', { patients, error });

      if (error) {
        console.error('Error finding patient:', error);
        alert(`Error finding patient: ${error.message}`);
        return;
      }

      if (patients && patients.length > 0) {
        console.log('Patient found, navigating to:', `/patients/${patients[0].id}`);
        // Navigate to patient profile
        navigate(`/patients/${patients[0].id}`);
      } else {
        console.warn('Patient not found:', appointment.patient);
        alert(`Patient "${appointment.patient}" not found in database. This might be mock data.`);

        // For development: try to navigate to a mock patient profile
        console.log('Trying to navigate to mock patient profile...');
        navigate('/patients/mock-patient');
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      alert(`Error: ${error}`);
    }
  };

  // Handler for status change from context menu
  const handleStatusChangeFromMenu = (appointmentId: string, newStatus: Appointment['status']) => {
    if (onStatusChange) {
      onStatusChange(appointmentId, newStatus);
    }
  };

  // Handler for viewing patient profile
  const handleViewPatientProfile = async (appointment: Appointment) => {
    try {
      // Search for patient by full name
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('full_name', appointment.patient)
        .limit(1);

      if (error) {
        console.error('Error finding patient:', error);
        return;
      }

      if (patients && patients.length > 0) {
        navigate(`/patients/${patients[0].id}`);
      } else {
        alert(`Patient "${appointment.patient}" not found in database.`);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
    }
  };

  // Handler for viewing health history
  const handleViewHealthHistory = async (appointment: Appointment) => {
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('full_name', appointment.patient)
        .limit(1);

      if (error) {
        console.error('Error finding patient:', error);
        return;
      }

      if (patients && patients.length > 0) {
        navigate(`/patients/${patients[0].id}?tab=health-history`);
      } else {
        alert(`Patient "${appointment.patient}" not found in database.`);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
    }
  };

  // Handler for viewing comfort preference
  const handleViewComfortPreference = async (appointment: Appointment) => {
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('full_name', appointment.patient)
        .limit(1);

      if (error) {
        console.error('Error finding patient:', error);
        return;
      }

      if (patients && patients.length > 0) {
        navigate(`/patients/${patients[0].id}?tab=comfort-preference`);
      } else {
        alert(`Patient "${appointment.patient}" not found in database.`);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
    }
  };

  // Long-press handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent, appointment: Appointment) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      // Trigger context menu programmatically
      // We'll use a custom event to open the context menu
      const element = e.currentTarget as HTMLElement;
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
      element.dispatchEvent(contextMenuEvent);
    }, 500); // 500ms long press duration
    setLongPressTimer(timer);
  };

  const handleTouchEnd = (e: React.TouchEvent, appointment: Appointment) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // If it wasn't a long press, treat it as a normal click
    if (!isLongPress) {
      e.preventDefault();
      onAppointmentClick(appointment);
    }
    setIsLongPress(false);
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPress(false);
  };

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
      key: 'data-collection',
      label: 'Data Collection',
      shortLabel: 'Data Collection',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      hoverColor: 'hover:bg-yellow-25',
      selectedColor: 'bg-yellow-100 border-yellow-400',
      dragColor: 'bg-yellow-200 border-yellow-500',
      badgeColor: 'bg-yellow-500 text-white'
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
    },
    {
      key: 'emergency',
      label: 'Emergency',
      shortLabel: 'Emergency',
      color: 'bg-red-100 border-red-300 text-red-800',
      hoverColor: 'hover:bg-red-25',
      selectedColor: 'bg-red-100 border-red-400',
      dragColor: 'bg-red-200 border-red-500',
      badgeColor: 'bg-red-500 text-white'
    }
  ];

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

  // Use ref to persist selection across re-renders
  const persistentSelectionRef = useRef<{
    start: { hour: number; minute: number; column: string } | null;
    end: { hour: number; minute: number; column: string } | null;
    column: string | null;
    isVisible: boolean;
  }>({ start: null, end: null, column: null, isVisible: false });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic sizing state for column width tracking
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column width for dynamic text switching
  const getColumnWidth = () => {
    return containerWidth / 6; // 6 appointment columns (excluding time column)
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatAppointmentTime = (timeString: string) => {
    // Remove seconds from time string (HH:MM:SS -> HH:MM)
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Function to clear selection
  const clearSelection = useCallback(() => {
    console.log('Clearing selection in DayView');
    setDragStart(null);
    setDragEnd(null);
    setDragColumn(null);
    persistentSelectionRef.current = { start: null, end: null, column: null, isVisible: false };
  }, []);

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
      const startTotalMinutes = dragStart.hour * 60 + dragStart.minute;
      const endTotalMinutes = dragEnd.hour * 60 + dragEnd.minute;

      // Check if this is a single click (same slot) or a drag selection
      const isSingleClick = dragStart.hour === dragEnd.hour && dragStart.minute === dragEnd.minute;
      const isDraggedSelection = Math.abs(endTotalMinutes - startTotalMinutes) > 0 ||
                                dragStart.hour !== dragEnd.hour ||
                                dragStart.minute !== dragEnd.minute;

      // Create appointment for both single clicks (15 minutes) and drag selections
      if (isSingleClick || isDraggedSelection) {
        let startHour, startMinute, endHour, endMinute;

        if (isSingleClick) {
          // For single click, create a 15-minute appointment
          startHour = dragStart.hour;
          startMinute = dragStart.minute;
          endHour = Math.floor((startTotalMinutes + 15) / 60);
          endMinute = (startTotalMinutes + 15) % 60;
        } else {
          // For drag selection, determine the actual start and end times
          // The selection should include the full time slots from start to end
          const actualStartMinutes = Math.min(startTotalMinutes, endTotalMinutes);
          const actualEndMinutes = Math.max(startTotalMinutes, endTotalMinutes) + 15; // Add 15 to include the end slot

          startHour = Math.floor(actualStartMinutes / 60);
          startMinute = actualStartMinutes % 60;
          endHour = Math.floor(actualEndMinutes / 60);
          endMinute = actualEndMinutes % 60;
        }

        const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

        // Save selection to persistent ref (survives re-renders)
        persistentSelectionRef.current = {
          start: dragStart,
          end: dragEnd,
          column: dragColumn,
          isVisible: true
        };

        // Call onTimeSlotClick immediately - this will open the dialog
        onTimeSlotClick(startTime, endTime, dragColumn);
      }
    }

    // Only reset drag state, keep selection visible for dialog
    setIsDragging(false);
  }, [isDragging, dragStart, dragEnd, dragColumn, onTimeSlotClick]);

  // Touch event handlers for tablet support
  const handleTouchStart = useCallback((hour: number, minute: number, column: string, e: React.TouchEvent) => {
    // Prevent default touch behaviors
    e.preventDefault();
    e.stopPropagation();

    // Check if there's already an appointment in this slot
    if (hasAppointmentInSlot(hour, minute, column)) {
      return; // Don't start dragging if slot is occupied
    }

    console.log('Touch start detected:', { hour, minute, column }); // Debug log

    // Set dragging state - CSS will handle scroll prevention via .dragging class
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

    console.log('Touch move during drag'); // Debug log
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

    // CSS will handle scroll restoration when .dragging class is removed
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

  // Handle external clear selection requests
  useEffect(() => {
    if (clearSelectionTrigger && clearSelectionTrigger > 0) {
      console.log('Clearing selection due to trigger:', clearSelectionTrigger);
      clearSelection();
    }
  }, [clearSelectionTrigger, clearSelection]);

  // Never automatically clear selection - let it persist until explicitly cleared
  useEffect(() => {
    console.log('Dialog state useEffect:', { isDialogOpen, persistentVisible: persistentSelectionRef.current.isVisible });
    // Don't clear selection automatically - it will be handled by explicit clearing
  }, [isDialogOpen, onClearSelection]);

  // Measure container width for dynamic sizing
  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    // Initial measurement
    measureWidth();

    // Set up resize observer for dynamic updates
    const resizeObserver = new ResizeObserver(measureWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', measureWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureWidth);
    };
  }, []);

  // Check if this hour contains any part of the drag selection
  const isHourInDragSelection = (hour: number, column: string) => {
    // Use persistent selection from ref when dialog is open, otherwise use current drag state
    const persistentSelection = persistentSelectionRef.current;
    const activeStart = (isDialogOpen && persistentSelection.start) ? persistentSelection.start : dragStart;
    const activeEnd = (isDialogOpen && persistentSelection.end) ? persistentSelection.end : dragEnd;
    const activeColumn = (isDialogOpen && persistentSelection.column) ? persistentSelection.column : dragColumn;

    if (!(isDragging || (isDialogOpen && persistentSelection.isVisible)) || !activeStart || !activeEnd || activeColumn !== column) return false;

    const startTotalMinutes = Math.min(activeStart.hour * 60 + activeStart.minute, activeEnd.hour * 60 + activeEnd.minute);
    const endTotalMinutes = Math.max(activeStart.hour * 60 + activeStart.minute, activeEnd.hour * 60 + activeEnd.minute + 15);

    const hourStart = hour * 60;
    const hourEnd = hour * 60 + 60;

    return startTotalMinutes < hourEnd && endTotalMinutes > hourStart;
  };

  // Get the drag selection rectangle dimensions for this hour
  const getDragSelectionForHour = (hour: number, column: string) => {
    // Use persistent selection from ref when dialog is open, otherwise use current drag state
    const persistentSelection = persistentSelectionRef.current;
    const activeStart = (isDialogOpen && persistentSelection.start) ? persistentSelection.start : dragStart;
    const activeEnd = (isDialogOpen && persistentSelection.end) ? persistentSelection.end : dragEnd;
    const activeColumn = (isDialogOpen && persistentSelection.column) ? persistentSelection.column : dragColumn;

    if (!(isDragging || (isDialogOpen && persistentSelection.isVisible)) || !activeStart || !activeEnd || activeColumn !== column) return null;

    // Calculate the actual start and end times properly, accounting for drag direction
    const startMinutes = activeStart.hour * 60 + activeStart.minute;
    const endMinutes = activeEnd.hour * 60 + activeEnd.minute;

    const startTotalMinutes = Math.min(startMinutes, endMinutes);
    const endTotalMinutes = Math.max(startMinutes, endMinutes) + 15; // Add 15 to include the end slot

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
      ref={containerRef}
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
      {/* Column Headers - Fixed outside scrollable container */}
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="grid" style={{ gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 1fr 1fr' }}>
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

      {/* Time Grid - Scrollable content only */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 calendar-scroll ${isDragging ? 'dragging' : ''}`}
        style={{
          overscrollBehavior: isDragging ? 'none' : 'auto',
          touchAction: isDragging ? 'none' : 'pan-y'
        }}
        onTouchStart={(e) => {
          // Allow touch events to bubble to slots for drag detection
          console.log('Container touch start');
        }}
        onTouchMove={(e) => {
          if (isDragging) {
            handleTouchMove(e);
          }
        }}
        onTouchEnd={(e) => {
          if (isDragging) {
            handleTouchEnd(e);
          }
        }}
      >

        <div className="relative">
          {/* Continuous drag selection overlay - positioned absolutely over the entire grid */}
          {(() => {
            // Use persistent selection from ref when dialog is open, otherwise use current drag state
            const persistentSelection = persistentSelectionRef.current;
            const activeStart = (isDialogOpen && persistentSelection.start) ? persistentSelection.start : dragStart;
            const activeEnd = (isDialogOpen && persistentSelection.end) ? persistentSelection.end : dragEnd;
            const activeColumn = (isDialogOpen && persistentSelection.column) ? persistentSelection.column : dragColumn;

            const shouldShowSelection = (isDragging || (isDialogOpen && persistentSelection.isVisible)) && activeStart && activeEnd && activeColumn;
            console.log('Selection overlay render:', {
              isDragging,
              isDialogOpen,
              dragStart,
              dragEnd,
              dragColumn,
              persistentSelection,
              activeStart,
              activeEnd,
              activeColumn,
              shouldShowSelection
            });

            if (!shouldShowSelection) return null;

            return (
              <div className="absolute inset-0 pointer-events-none z-10">
                {appointmentTypes.map((type, typeIndex) => {
                  if (type.key !== activeColumn) return null;

                  const typeColors = getTypeColors(type.key);

                  // Calculate the actual start and end times properly, accounting for drag direction
                  const startMinutes = activeStart.hour * 60 + activeStart.minute;
                  const endMinutes = activeEnd.hour * 60 + activeEnd.minute;

                  const startTotalMinutes = Math.min(startMinutes, endMinutes);
                  const endTotalMinutes = Math.max(startMinutes, endMinutes) + 15; // Add 15 to include the end slot

                  // Check if there's an appointment in this exact location - if so, don't show selection
                  const hasAppointmentInSelection = appointments.some(appointment => {
                    if (appointment.type !== type.key) return false;

                    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                    const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

                    const appointmentStart = startHour * 60 + startMinute;
                    const appointmentEnd = endHour * 60 + endMinute;

                    // Check if appointment overlaps with selection
                    return !(endTotalMinutes <= appointmentStart || startTotalMinutes >= appointmentEnd);
                  });

                  // Don't show selection rectangle if there's an appointment in the same location
                  if (hasAppointmentInSelection) return null;

                  // Calculate position within the grid
                  const totalHours = hours.length;
                  const firstHour = hours[0];
                  const hourHeight = 200; // Increased from 120px to 200px for better visibility

                  const startHour = Math.floor(startTotalMinutes / 60);
                  const endHour = Math.floor((endTotalMinutes - 1) / 60);

                  // Calculate exact position based on total minutes from first hour
                  const startMinutesFromFirst = startTotalMinutes - (firstHour * 60);
                  const endMinutesFromFirst = endTotalMinutes - (firstHour * 60);

                  const topPosition = (startMinutesFromFirst / 60) * hourHeight;
                  const bottomPosition = (endMinutesFromFirst / 60) * hourHeight;
                  const height = bottomPosition - topPosition;

                  // Calculate column position to match the grid exactly
                  // Grid uses: '60px 1fr 1fr 1fr 1fr 1fr 1fr' - so each column gets equal 1fr
                  const columnWidth = `calc((100% - 60px) / ${appointmentTypes.length})`;
                  const leftPosition = `calc(60px + ${typeIndex} * ${columnWidth})`;

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
                      <div className="h-full flex items-end justify-end p-2">
                        <div className="text-xs font-medium text-gray-700">
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
            );
          })()}

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
                const hourHeight = 200; // Increased from 120px to 200px for better visibility

                // Calculate exact position based on total minutes from first hour
                const startMinutesFromFirst = startTotalMinutes - (firstHour * 60);
                const endMinutesFromFirst = endTotalMinutes - (firstHour * 60);

                const topPosition = (startMinutesFromFirst / 60) * hourHeight;
                const bottomPosition = (endMinutesFromFirst / 60) * hourHeight;
                const height = bottomPosition - topPosition;

                // Calculate column position to match the grid exactly
                // Grid uses: '60px 1fr 1fr 1fr 1fr 1fr 1fr' - so each column gets equal 1fr
                const columnWidth = `calc((100% - 60px) / ${appointmentTypes.length})`;
                const leftPosition = `calc(60px + ${typeIndex} * ${columnWidth})`;

                return (
                  <ContextMenu key={appointment.id}>
                    <ContextMenuTrigger asChild>
                      <div
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
                          handleTouchStart(e, appointment);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handleTouchEnd(e, appointment);
                        }}
                        onTouchMove={(e) => {
                          e.stopPropagation();
                          handleTouchMove();
                        }}
                      >
                    <div className="p-1 h-full flex flex-col justify-between">
                      {(() => {
                        // Calculate appointment duration in minutes
                        const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                        const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
                        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

                        // Different layouts for 15 and 30 minute appointments
                        if (durationMinutes === 15) {
                          // Single line layout for 15-minute appointments
                          const firstLetter = typeColors.shortLabel?.charAt(0) || typeColors.label?.charAt(0) || 'A';
                          const columnWidth = getColumnWidth();

                          // Determine time font size based on column width
                          let timeFontSize = 'text-xs';
                          if (columnWidth < 100) {
                            timeFontSize = 'text-[9px]';
                          } else if (columnWidth < 120) {
                            timeFontSize = 'text-[10px]';
                          }

                          return (
                            <div className="flex items-center justify-between h-full w-full overflow-hidden">
                              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                                <div className="flex items-center gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusDotColor(appointment.status)}`}></div>
                                  <h4
                                    className="font-medium text-xs text-gray-800 truncate flex-1 min-w-0 underline cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      console.log('15-minute appointment patient name clicked');
                                      e.stopPropagation();
                                      handlePatientNameClick(appointment);
                                    }}
                                  >
                                    {appointment.patient}
                                  </h4>
                                </div>
                                {appointment.assignedUserName && (
                                  <div className="text-[9px] text-gray-500 truncate pl-2.5">
                                    👤 {appointment.assignedUserName}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <div className="flex flex-col items-end">
                                  <span className={`${timeFontSize} text-gray-600 whitespace-nowrap leading-tight`}>
                                    {formatAppointmentTime(appointment.startTime)}
                                  </span>
                                  <span className={`${timeFontSize} text-gray-600 whitespace-nowrap leading-tight`}>
                                    {formatAppointmentTime(appointment.endTime)}
                                  </span>
                                </div>
                                <span className={`inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white rounded-full uppercase ${typeColors.badgeColor || 'bg-gray-500'}`}>
                                  {firstLetter}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          // Layout for 30-minute and longer appointments
                          return (
                            <div className="flex flex-col h-full justify-between">
                              {/* Top section - Name and assigned user */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(appointment.status)}`}></div>
                                  <h4
                                    className="font-semibold text-sm text-gray-800 truncate underline cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      console.log('30+ minute appointment patient name clicked');
                                      e.stopPropagation();
                                      handlePatientNameClick(appointment);
                                    }}
                                  >
                                    {appointment.patient}
                                  </h4>
                                </div>
                                {appointment.assignedUserName && (
                                  <div className="text-[10px] text-gray-500 truncate pl-3.5">
                                    👤 {appointment.assignedUserName}
                                  </div>
                                )}
                              </div>
                              {/* Bottom row - Badge left (adaptive), Time right (always visible) */}
                              <div className="flex justify-between items-end gap-1 min-w-0 w-full overflow-hidden">
                                {(() => {
                                  const columnWidth = getColumnWidth();
                                  const label = typeColors.shortLabel || typeColors.label;

                                  // Determine display text, badge size, and time size based on column width
                                  let displayText, badgeSize, badgePadding, timeFontSize;

                                  if (columnWidth >= 140) {
                                    // Wide columns - show full text
                                    displayText = label;
                                    badgeSize = 'text-[11px]';
                                    badgePadding = 'px-1.5 py-0.5';
                                    timeFontSize = 'text-xs';
                                  } else if (columnWidth >= 120) {
                                    // Medium columns - show full text but smaller
                                    displayText = label;
                                    badgeSize = 'text-[10px]';
                                    badgePadding = 'px-1 py-0.5';
                                    timeFontSize = 'text-[10px]';
                                  } else if (columnWidth >= 100) {
                                    // Narrow columns - start abbreviating "Data Collection"
                                    displayText = (label === 'Data Collection') ? 'Data' : label;
                                    badgeSize = 'text-[9px]';
                                    badgePadding = 'px-1 py-0.5';
                                    timeFontSize = 'text-[10px]';
                                  } else if (columnWidth >= 80) {
                                    // Very narrow - abbreviate and smaller size
                                    displayText = (label === 'Data Collection') ? 'Data' : label;
                                    badgeSize = 'text-[8px]';
                                    badgePadding = 'px-0.5 py-0.5';
                                    timeFontSize = 'text-[9px]';
                                  } else {
                                    // Ultra narrow - minimal badge and time
                                    displayText = (label === 'Data Collection') ? 'Data' : label;
                                    badgeSize = 'text-[7px]';
                                    badgePadding = 'px-0.5 py-0';
                                    timeFontSize = 'text-[8px]';
                                  }

                                  return (
                                    <>
                                      <span className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 text-center flex-shrink-0 whitespace-nowrap uppercase ${typeColors.badgeColor || 'bg-gray-100 text-gray-800'} ${badgeSize} ${badgePadding}`}>
                                        {label === 'Data Collection' ? 'Data' : displayText}
                                      </span>
                                      <div className="flex flex-col items-end flex-shrink-0">
                                        <span className={`${timeFontSize} text-gray-600 whitespace-nowrap leading-tight`}>
                                          {formatAppointmentTime(appointment.startTime)}
                                        </span>
                                        <span className={`${timeFontSize} text-gray-600 whitespace-nowrap leading-tight`}>
                                          {formatAppointmentTime(appointment.endTime)}
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        }
                      })()}
                      {(() => {
                        // Calculate appointment duration in minutes
                        const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                        const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
                        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

                        // No additional badge needed since it's now inline for 30+ minute appointments
                        return null;
                      })()}
                    </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Change Status
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                          <ContextMenuItem onClick={() => handleStatusChangeFromMenu(appointment.id, 'pending')}>
                            <Clock3 className="mr-2 h-4 w-4 text-yellow-600" />
                            Pending
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleStatusChangeFromMenu(appointment.id, 'confirmed')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Confirmed
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleStatusChangeFromMenu(appointment.id, 'not-confirmed')}>
                            <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                            Not Confirmed
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleStatusChangeFromMenu(appointment.id, 'completed')}>
                            <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                            Completed
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleStatusChangeFromMenu(appointment.id, 'cancelled')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancelled
                          </ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSeparator />
                      {appointment.type === 'consultation' ? (
                        <ContextMenuItem onClick={() => navigate(`/consultation/${appointment.id}`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Consultation
                        </ContextMenuItem>
                      ) : (
                        <ContextMenuItem onClick={() => handleViewPatientProfile(appointment)}>
                          <UserCircle className="mr-2 h-4 w-4" />
                          View Patient Profile
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem onClick={() => handleViewHealthHistory(appointment)}>
                        <Heart className="mr-2 h-4 w-4" />
                        View Health History
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleViewComfortPreference(appointment)}>
                        <Smile className="mr-2 h-4 w-4" />
                        View Comfort Preference
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              });
            })}
          </div>

          {/* Hour grid */}
          <div className="grid grid-cols-1">
            {hours.map((hour) => {
              return (
                <div key={hour} className="border-b border-gray-200 h-[200px]">
                  <div className="grid h-full" style={{ gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 1fr 1fr' }}>
                    {/* Time Column */}
                    <div className="border-r border-gray-200 flex items-start justify-end pl-2 pr-1 pt-1 pb-2">
                      <span className="text-xs font-medium text-gray-600 whitespace-nowrap text-right">
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
