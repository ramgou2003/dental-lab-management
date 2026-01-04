import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, MoreHorizontal, MoreVertical, CheckCircle, XCircle, AlertCircle, Clock3, UserCheck, UserCircle, Heart, Smile, FileText, Edit, Trash2, ClipboardList, Calendar, FileEdit, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HealthHistoryDialog } from "@/components/HealthHistoryDialog";
import { ComfortPreferenceDialog } from "@/components/ComfortPreferenceDialog";
import { EncounterFormDialog } from "@/components/calendar/EncounterFormDialog";
import { AppointmentSchedulerDialog } from "@/components/calendar/AppointmentSchedulerDialog";
import { NewLabScriptForm } from "@/components/NewLabScriptForm";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface Appointment {
  id: string;
  title: string;
  patient: string;
  patientId?: string;
  startTime: string;
  endTime: string;
  type: string;
  subtype?: string; // Appointment subtype
  assignedUserId?: string;
  assignedUserName?: string;
  status: string; // Full status name
  statusCode: '?????' | 'FIRM' | 'EFIRM' | 'EMER' | 'HERE' | 'READY' | 'LM1' | 'LM2' | 'MULTI' | '2wk' | 'NSHOW' | 'RESCH' | 'CANCL' | 'CMPLT'; // Status code
  notes?: string;
  encounterCompleted?: boolean;
  nextAppointmentScheduled?: boolean;
  nextAppointmentStatus?: 'scheduled' | 'not_scheduled' | 'not_required';
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
  nextAppointmentType?: string;
  nextAppointmentSubtype?: string;
  created_at?: string; // Added for sorting stability
  isEmergency?: boolean;
  archType?: string;
  upperArchSubtype?: string;
  lowerArchSubtype?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (startTime: string, endTime: string, appointmentType?: string) => void;
  isDialogOpen?: boolean;
  onClearSelection?: () => void;
  clearSelectionTrigger?: number;
  onStatusChange?: (appointmentId: string, newStatusCode: Appointment['statusCode']) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  isSchedulerMode?: boolean; // When true, only shows calendar grid without navigation/toolbar
  allowedAppointmentTypes?: string[]; // Optional: restrict which columns are enabled
}

export interface DayViewHandle {
  openHealthHistory: (patientId: string, patientName: string) => void;
  openComfortPreference: (patientId: string, patientName: string) => void;
  openEncounterForm: (appointment: Appointment) => void;
}

export const DayView = forwardRef<DayViewHandle, DayViewProps>(({ date, appointments, onAppointmentClick, onTimeSlotClick, isDialogOpen, onClearSelection, clearSelectionTrigger, onStatusChange, onEdit, onDelete, isSchedulerMode = false, allowedAppointmentTypes }, ref) => {
  const navigate = useNavigate();

  // State for current EST time
  const [currentEstDate, setCurrentEstDate] = useState<Date | null>(null);

  useEffect(() => {
    // Function to get current time in EST
    const updateEstTime = () => {
      const now = new Date();
      const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
      setCurrentEstDate(new Date(estString));
    };

    // Initial update
    updateEstTime();

    // Update every minute (or 30 seconds for smoother updates if needed)
    const interval = setInterval(updateEstTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenHealthHistory = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setHealthHistoryDialogOpen(true);
  };

  const handleOpenComfortPreference = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setComfortPreferenceDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openHealthHistory: handleOpenHealthHistory,
    openComfortPreference: handleOpenComfortPreference,
    openEncounterForm: (appointment: Appointment) => {
      setEncounterAppointmentId(appointment.id);
      setEncounterPatientName(appointment.patient);
      setEncounterFormDialogOpen(true);
    }
  }));

  // State for long-press handling (appointment cards)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // State for controlling context menu open/close
  const [openContextMenuId, setOpenContextMenuId] = useState<string | null>(null);

  // State for status change confirmation
  const [statusChangeConfirmation, setStatusChangeConfirmation] = useState<{
    appointmentId: string;
    newStatus: Appointment['statusCode'];
    appointmentDetails: string;
  } | null>(null);

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    appointmentId: string;
    appointmentDetails: string;
  } | null>(null);

  // State for No Show dialog
  const [showNoShowDialog, setShowNoShowDialog] = useState<{
    appointmentId: string;
    appointmentDetails: string;
  } | null>(null);

  // State for time slot long-press handling
  const [timeSlotLongPressTimer, setTimeSlotLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Assigned user state for next appointment
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [nextAppointmentAssignedUserId, setNextAppointmentAssignedUserId] = useState<string>('');

  const [isTimeSlotLongPress, setIsTimeSlotLongPress] = useState(false);

  // State for health history and comfort preference dialogs
  const [healthHistoryDialogOpen, setHealthHistoryDialogOpen] = useState(false);
  const [comfortPreferenceDialogOpen, setComfortPreferenceDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");

  // State for encounter form dialog
  const [encounterFormDialogOpen, setEncounterFormDialogOpen] = useState(false);
  const [encounterAppointmentId, setEncounterAppointmentId] = useState<string>("");
  const [encounterPatientName, setEncounterPatientName] = useState<string>("");
  const [appointmentEncounterStatus, setAppointmentEncounterStatus] = useState<Record<string, boolean>>({});

  // State for lab script form dialog
  const [labScriptFormOpen, setLabScriptFormOpen] = useState(false);
  const [labScriptPatientName, setLabScriptPatientName] = useState<string>("");

  // State for encounter form missing dialog
  const [encounterFormMissingDialog, setEncounterFormMissingDialog] = useState<{
    appointmentId: string;
    patientName: string;
  } | null>(null);

  // State for next appointment scheduling dialog
  const [nextAppointmentDialog, setNextAppointmentDialog] = useState<{
    appointmentId: string;
    patientId: string;
    patientName: string;
  } | null>(null);
  const [showNextAppointmentForm, setShowNextAppointmentForm] = useState(false);
  const [nextAppointmentType, setNextAppointmentType] = useState<string>('');
  const [nextAppointmentSubtype, setNextAppointmentSubtype] = useState<string>('');
  const [nextAppointmentDate, setNextAppointmentDate] = useState<string>('');
  const [nextAppointmentStartTime, setNextAppointmentStartTime] = useState<string>('');
  const [nextAppointmentEndTime, setNextAppointmentEndTime] = useState<string>('');
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  const [schedulingNextAppointment, setSchedulingNextAppointment] = useState(false);

  // State for reschedule dialog
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    appointment: Appointment;
    open: boolean;
  } | null>(null);

  // Use a REF to store patient info - refs are NOT affected by React state updates or dialog handlers
  // This guarantees the patient info persists throughout the entire scheduling flow
  const nextAppointmentPatientRef = useRef<{
    patientId: string;
    patientName: string;
    currentApptId: string;
  }>({ patientId: '', patientName: '', currentApptId: '' });

  // Next appointment type options
  const nextAppointmentTypes = [
    { value: 'consultation', label: 'Consult' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'data-collection', label: 'Data Collection' },
    { value: 'printed-try-in', label: 'Appliance Delivery' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'surgical-revision', label: 'Surgical Revision' },
    { value: 'emergency', label: 'Emergency' }
  ];

  // Next appointment subtype options based on type
  const nextAppointmentSubtypes: Record<string, { value: string; label: string }[]> = {
    'follow-up': [
      { value: '7-day-followup', label: '7 Day Follow-up' },
      { value: '30-day-followup', label: '30 Days Follow-up' },
      { value: 'observation-followup', label: 'Follow-up for Observation' },
      { value: '3-month-followup', label: '3 Months Follow Up' },
      { value: '6-month-followup', label: '6 Months Follow Up' },
      { value: '12-month-followup', label: '12 Months Follow Up' }
    ],
    'data-collection': [
      { value: '75-day-data-collection', label: '75 Days Data Collection for PTI' },
      { value: 'final-data-collection', label: 'Final Data Collection' },
      { value: 'data-collection-printed-try-in', label: 'Data collection for Printed-try-in' }
    ],
    'printed-try-in': [
      { value: 'printed-try-in-delivery', label: 'Printed Try-in Delivery' },
      { value: '82-day-appliance-delivery', label: '82 Days PTI Delivery' },
      { value: '120-day-final-delivery', label: '120 Days Final Delivery' }
    ],
    'surgery': [
      { value: 'full-arch-fixed', label: 'Full Arch Fixed' },
      { value: 'denture', label: 'Denture' },
      { value: 'implant-removable-denture', label: 'Implant Removable Denture' },
      { value: 'single-implant', label: 'Single Implant' },
      { value: 'multiple-implants', label: 'Multiple Implants' },
      { value: 'extraction', label: 'Extraction' },
      { value: 'extraction-and-graft', label: 'Extraction and Graft' }
    ],
    'surgical-revision': [
      { value: 'full-arch-fixed', label: 'Full Arch Fixed' },
      { value: 'denture', label: 'Denture' },
      { value: 'implant-removable-denture', label: 'Implant Removable Denture' },
      { value: 'single-implant', label: 'Single Implant' },
      { value: 'multiple-implants', label: 'Multiple Implants' },
      { value: 'extraction', label: 'Extraction' },
      { value: 'extraction-and-graft', label: 'Extraction and Graft' }
    ]
  };

  // Function to get status capsule color
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case '?????':  // ????? Not Confirmed
        return 'bg-gray-400';
      case 'FIRM':  // FIRM Appointment Confirmed
        return 'bg-green-500';
      case 'EFIRM':  // EFIRM Electronically Confirmed
        return 'bg-emerald-500';
      case 'EMER':  // EMER Emergency Patient
        return 'bg-red-600';
      case 'HERE':  // HERE Patient has Arrived
        return 'bg-blue-500';
      case 'READY':  // READY Ready for Operatory
        return 'bg-purple-500';
      case 'LM1':  // LM1 Left 1st Message
        return 'bg-yellow-500';
      case 'LM2':  // LM2 Left 2nd Message
        return 'bg-orange-500';
      case 'MULTI':  // MULTI Multi-Appointment
        return 'bg-indigo-500';
      case '2wk':  // 2wk 2 Week Calls
        return 'bg-pink-500';
      case 'NSHOW':  // No Show
        return 'bg-red-700';
      case 'RESCH':  // Appointment Rescheduled
        return 'bg-amber-500';
      case 'CANCL':  // Appointment Cancelled
        return 'bg-slate-600';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to get subtype label from subtype value
  const getSubtypeLabel = (subtype: string | undefined): string | null => {
    if (!subtype) return null;

    // Handle Emergency composite subtype (e.g. "follow-up:7-day-followup" or "consultation")
    let actualSubtype = subtype;
    let labelPrefix = '';

    if (subtype.includes(':')) {
      const parts = subtype.split(':');
      // parts[0] is the procedure type (e.g. follow-up), parts[1] is the subtype
      actualSubtype = parts[1];
      // optional: we could add a prefix like "Follow-up - " but usually the subtype label is unique enough
    }

    const subtypeLabels: Record<string, string> = {
      '7-day-followup': '7 Day',
      '30-day-followup': '30 Day',
      'observation-followup': 'Observation',
      '3-month-followup': '3 Month',
      '6-month-followup': '6 Month',
      '12-month-followup': '12 Month',
      'printed-try-in-delivery': 'PTI',
      '82-day-appliance-delivery': '82 Day PTI',
      '120-day-final-delivery': '120 Day Final',
      '75-day-data-collection': '75 Day PTI',
      'final-data-collection': 'Final',
      'data-collection-printed-try-in': 'DC PTI',
      // Surgery subtypes
      'full-arch-fixed': 'Full Arch Fixed',
      'denture': 'Denture',
      'implant-removable-denture': 'Implant Removable Denture',
      'single-implant': 'Single Implant',
      'multiple-implants': 'Multiple Implants',
      'extraction': 'Extraction',
      'extraction-and-graft': 'Extraction and Graft'
    };

    // If it's in the standard map, return it
    if (subtypeLabels[actualSubtype]) {
      return subtypeLabels[actualSubtype];
    }

    // Fallback: Check if it's a main type ID (e.g. "consultation" stored as subtype)
    const typeLabels: Record<string, string> = {
      'consultation': 'Consult',
      'follow-up': 'Follow Up',
      'data-collection': 'Data Collection',
      'printed-try-in': 'Appliance Delivery',
      'surgery': 'Surgery',
      'surgical-revision': 'Revision',
      'emergency': 'Emergency'
    };

    if (typeLabels[actualSubtype]) {
      return typeLabels[actualSubtype];
    }

    // If we split it but didn't find a map, maybe the suffix is just a raw string?
    // Or return null if no match found (standard behavior)
    return null;
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
  const handleStatusChangeFromMenu = (appointmentId: string, newStatus: Appointment['statusCode']) => {
    // Find the appointment details
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    // Check if new status is No Show
    if (newStatus === 'NSHOW') {
      setShowNoShowDialog({
        appointmentId,
        appointmentDetails: `${appointment.patient} - ${appointment.type} at ${appointment.startTime}`
      });
      return;
    }

    // Show confirmation dialog
    setStatusChangeConfirmation({
      appointmentId,
      newStatus,
      appointmentDetails: `${appointment.patient} - ${appointment.type} at ${appointment.startTime}`
    });
  };

  // Handler for No Show dialog options
  const handleNoShowOption = async (option: 'unscheduled' | 'not_required') => {
    if (!showNoShowDialog) return;
    const { appointmentId } = showNoShowDialog;

    if (option === 'unscheduled') {
      // Option 1: Add to Unscheduled List (just set status to NSHOW)
      if (onStatusChange) {
        onStatusChange(appointmentId, 'NSHOW');
      }
    } else {
      // Option 2: No Next Appointment Required
      // Set status to NSHOW AND next_appointment_status to 'not_required'
      try {
        const { error } = await supabaseClient
          .from('appointments')
          .update({
            status_code: 'NSHOW',
            status: 'No Show',
            next_appointment_status: 'not_required'
          })
          .eq('id', appointmentId);

        if (error) throw error;
        toast.success("Appointment marked as No Show (No next appointment required)");
      } catch (err) {
        console.error("Error updating appointment to No Show/Not Required:", err);
        toast.error("Failed to update appointment");
      }
    }

    setShowNoShowDialog(null);
  };

  const confirmStatusChange = () => {
    if (statusChangeConfirmation && onStatusChange) {
      onStatusChange(statusChangeConfirmation.appointmentId, statusChangeConfirmation.newStatus);
    }
    setStatusChangeConfirmation(null);
  };

  const cancelStatusChange = () => {
    setStatusChangeConfirmation(null);
  };

  // Helper function to get status name from status code
  const getStatusNameFromCode = (statusCode: string): string => {
    const statusMap: Record<string, string> = {
      '?????': 'Not Confirmed',
      'FIRM': 'Appointment Confirmed',
      'EFIRM': 'Electronically Confirmed',
      'EMER': 'Emergency Patient',
      'HERE': 'Patient has Arrived',
      'READY': 'Ready for Operatory',
      'LM1': 'Left 1st Message',
      'LM2': 'Left 2nd Message',
      'MULTI': 'Multi-Appointment',
      '2wk': '2 Week Calls',
      'NSHOW': 'No Show',
      'RESCH': 'Appointment Rescheduled',
      'CANCL': 'Appointment Cancelled'
    };
    return statusMap[statusCode] || statusCode;
  };

  // Handler for delete appointment from context menu
  const handleDeleteFromMenu = (appointmentId: string) => {
    // Close menu immediately
    setOpenContextMenuId(null);

    // Find the appointment details
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    // Show confirmation dialog with a small delay to ensure menu is closed first
    setTimeout(() => {
      setDeleteConfirmation({
        appointmentId,
        appointmentDetails: `${appointment.patient} - ${appointment.type} at ${appointment.startTime}`
      });
    }, 100);
  };

  const confirmDelete = () => {
    if (deleteConfirmation && onDelete) {
      onDelete(deleteConfirmation.appointmentId);
    }
    setDeleteConfirmation(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handler for viewing patient profile
  const handleViewPatientProfile = async (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

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
    // Close menu immediately
    setOpenContextMenuId(null);

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
        setSelectedPatientId(patients[0].id);
        setSelectedPatientName(patients[0].full_name);
        setHealthHistoryDialogOpen(true);
      } else {
        alert(`Patient "${appointment.patient}" not found in database.`);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
    }
  };

  // Handler for viewing comfort preference
  const handleViewComfortPreference = async (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

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
        setSelectedPatientId(patients[0].id);
        setSelectedPatientName(patients[0].full_name);
        setComfortPreferenceDialogOpen(true);
      } else {
        alert(`Patient "${appointment.patient}" not found in database.`);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
    }
  };

  // Long-press handlers for appointment cards on touch devices
  const handleAppointmentTouchStart = (e: React.TouchEvent, appointment: Appointment) => {
    setIsLongPress(false);
    const element = e.currentTarget as HTMLElement;

    // Prevent default touch behavior to avoid white strip/overscroll
    e.preventDefault();

    // Add visual feedback for long press
    element.style.transform = 'scale(0.98)';
    element.style.opacity = '0.9';

    const timer = setTimeout(() => {
      setIsLongPress(true);

      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Prevent body scroll during context menu
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      // Trigger context menu programmatically
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
      element.dispatchEvent(contextMenuEvent);

      // Reset visual feedback
      element.style.transform = '';
      element.style.opacity = '';

      // Restore body scroll after a short delay
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }, 100);
    }, 500); // 500ms long press duration
    setLongPressTimer(timer);
  };

  const handleAppointmentTouchEnd = (e: React.TouchEvent, appointment: Appointment) => {
    const element = e.currentTarget as HTMLElement;

    // Reset visual feedback
    element.style.transform = '';
    element.style.opacity = '';

    // Restore body scroll in case it was locked
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

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

  const handleAppointmentTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);

      // Reset visual feedback
      const element = e.currentTarget as HTMLElement;
      element.style.transform = '';
      element.style.opacity = '';
    }
    setIsLongPress(false);
  };

  // Helper function to handle both click and touch events for menu items
  const handleMenuItemAction = (action: () => void) => {
    return {
      onSelect: () => {
        // Don't prevent default - let the menu close naturally
        action();
      },
      onClick: (e: React.MouseEvent) => {
        action();
      },
      onTouchStart: (e: React.TouchEvent) => {
        // Mark that we're handling a touch event
        const target = e.currentTarget as HTMLElement;
        target.setAttribute('data-touch-active', 'true');
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.currentTarget as HTMLElement;

        // Execute the action
        action();

        // Force close menu on touch devices by simulating escape key
        setTimeout(() => {
          // Dispatch escape key event to close menu
          const escapeEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(escapeEvent);

          // Also set state to null as backup
          setOpenContextMenuId(null);

          // Clean up
          target.removeAttribute('data-touch-active');
        }, 100);
      }
    };
  };

  // Helper function for submenu triggers (needs different handling)
  const handleSubMenuTrigger = () => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.stopPropagation();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Trigger click to open submenu
        const target = e.currentTarget as HTMLElement;
        target.click();
      }
    };
  };

  // Wrapper for edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

    // Open edit form with a small delay to ensure menu is closed first
    setTimeout(() => {
      onEdit?.(appointment);
    }, 100);
  };

  // Check if encounter exists for appointments
  const checkEncounterStatus = async (appointmentIds: string[]) => {
    if (appointmentIds.length === 0) return;

    try {
      const { data, error } = await (supabaseClient as any)
        .from('encounters')
        .select('appointment_id')
        .in('appointment_id', appointmentIds);

      if (error) {
        console.error('Error checking encounter status:', error);
        return;
      }

      const statusMap: Record<string, boolean> = {};
      appointmentIds.forEach(id => {
        statusMap[id] = data?.some(encounter => encounter.appointment_id === id) || false;
      });

      setAppointmentEncounterStatus(statusMap);
    } catch (error) {
      console.error('Error checking encounter status:', error);
    }
  };

  // Check encounter status when appointments change
  useEffect(() => {
    const appointmentIds = appointments.map(apt => apt.id);
    if (appointmentIds.length > 0) {
      checkEncounterStatus(appointmentIds);
    }
  }, [appointments]);

  // Handler for encounter form
  const handleEncounterForm = (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

    // Open encounter form with a small delay to ensure menu is closed first
    setTimeout(() => {
      setEncounterAppointmentId(appointment.id);
      setEncounterPatientName(appointment.patient);
      setEncounterFormDialogOpen(true);
    }, 100);
  };

  // Handler for completing appointment
  const handleCompleteAppointment = async (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

    try {
      // First, check if encounter form exists and is complete
      const { data: encounterData, error: encounterError } = await (supabaseClient as any)
        .from('encounters')
        .select('id, form_status')
        .eq('appointment_id', appointment.id)
        .maybeSingle();

      if (encounterError) {
        console.error('Error checking encounter form:', encounterError);
        toast.error('Failed to check encounter form status');
        return;
      }

      // If no encounter form exists or it's not complete, show dialog
      if (!encounterData || encounterData.form_status !== 'complete') {
        setTimeout(() => {
          setEncounterFormMissingDialog({
            appointmentId: appointment.id,
            patientName: appointment.patient
          });
        }, 100);
        return;
      }

      // If encounter form is complete, show next appointment dialog
      setTimeout(() => {
        setNextAppointmentDialog({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: appointment.patient
        });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check encounter form');
    }
  };

  // Handler for completing appointment without scheduling next appointment
  const handleCompleteWithoutNextAppointment = async () => {
    if (!nextAppointmentDialog) return;

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();


      // 1. Mark appointment as complete
      const { error } = await (supabaseClient as any)
        .from('appointments')
        .update({
          encounter_completed: true,
          encounter_completed_at: new Date().toISOString(),
          encounter_completed_by: user?.id || null,
          status: 'Appointment Completed',
          status_code: 'CMPLT',
          next_appointment_scheduled: false,
          next_appointment_status: 'not_scheduled'
        })
        .eq('id', nextAppointmentDialog.appointmentId);

      if (error) {
        console.error('Error completing appointment:', error);
        toast.error('Failed to complete appointment');
        return;
      }

      // 2. Update existing encounter to ensure it shows in "Unscheduled" list (NextAppointmentsPage)
      //    We need to ensure it has a type and date, otherwise it won't appear.
      const { data: existingEncounter } = await (supabaseClient as any)
        .from('encounters')
        .select('next_appointment_type, next_appointment_date')
        .eq('appointment_id', nextAppointmentDialog.appointmentId)
        .maybeSingle();

      if (existingEncounter) {
        const updates: any = {
          next_appointment_scheduled: false,
          next_appointment_status: 'not_scheduled'
        };

        // Default to 'follow-up' and Today if not specified in form
        if (!existingEncounter.next_appointment_type) {
          updates.next_appointment_type = 'follow-up';
        }
        if (!existingEncounter.next_appointment_date) {
          updates.next_appointment_date = new Date().toISOString();
        }

        const { error: encounterError } = await (supabaseClient as any)
          .from('encounters')
          .update(updates)
          .eq('appointment_id', nextAppointmentDialog.appointmentId);

        if (encounterError) {
          console.error('Error updating encounter for unscheduled list:', encounterError);
          // Non-blocking error, user still completed appointment
        }
      }

      toast.success('Appointment marked as complete');

      // Close dialog
      setNextAppointmentDialog(null);

      // Verify immediate local state update via parent callback
      if (onStatusChange) {
        onStatusChange(nextAppointmentDialog.appointmentId, 'CMPLT');
      }

      // Refresh encounter status
      checkEncounterStatus([nextAppointmentDialog.appointmentId]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete appointment');
    }
  };

  // Handler for completing appointment with NO next appointment required
  const handleCompleteNoNextAppointmentRequired = async () => {
    if (!nextAppointmentDialog) return;

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();

      // 1. Mark appointment as complete, AND scheduled=true (so it doesn't show in unscheduled)
      const { error } = await (supabaseClient as any)
        .from('appointments')
        .update({
          encounter_completed: true,
          encounter_completed_at: new Date().toISOString(),
          encounter_completed_by: user?.id || null,
          status: 'Appointment Completed',
          status_code: 'CMPLT',
          next_appointment_scheduled: true, // Mark as scheduled/handled (legacy)
          next_appointment_status: 'not_required' // New status
        })
        .eq('id', nextAppointmentDialog.appointmentId);

      if (error) {
        console.error('Error completing appointment:', error);
        toast.error('Failed to complete appointment');
        return;
      }

      // 2. Update existing encounter
      const { error: encounterError } = await (supabaseClient as any)
        .from('encounters')
        .update({
          next_appointment_scheduled: true,
          next_appointment_status: 'not_required'
        })
        .eq('appointment_id', nextAppointmentDialog.appointmentId);

      if (encounterError) {
        console.error('Error updating encounter:', encounterError);
      }

      toast.success('Appointment completed (No next appointment)');

      // Close dialog
      setNextAppointmentDialog(null);

      // Verify immediate local state update via parent callback
      if (onStatusChange) {
        onStatusChange(nextAppointmentDialog.appointmentId, 'CMPLT');
      }

      // Refresh encounter status
      checkEncounterStatus([nextAppointmentDialog.appointmentId]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete appointment');
    }
  };

  // Handler for scheduling next appointment from the scheduler dialog
  // Handler for when user selects a time in the scheduler - returns to form with time
  const handleTimeSelected = (appointmentData: {
    type: string;
    subtype: string | null;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    console.log('handleTimeSelected called with:', appointmentData);

    // Update the date and time state
    setNextAppointmentDate(appointmentData.date);
    setNextAppointmentStartTime(appointmentData.startTime);
    setNextAppointmentEndTime(appointmentData.endTime);

    // Close scheduler and return to the form
    setShowSchedulerDialog(false);
  };

  // Handler for creating the appointment from the form
  const handleCreateNextAppointment = async () => {
    // Get patient info from the ref (guaranteed to persist throughout the flow)
    const { patientId, patientName, currentApptId } = nextAppointmentPatientRef.current;

    console.log('Creating appointment with ref values:', { patientId, patientName, currentApptId });

    if (!patientId || !patientName || !currentApptId) {
      console.log('Patient info is missing from ref:', nextAppointmentPatientRef.current);
      toast.error('Patient information is missing. Please try again.');
      return;
    }

    if (!nextAppointmentStartTime || !nextAppointmentEndTime) {
      toast.error('Please select a time slot first');
      return;
    }

    if (!nextAppointmentType || !nextAppointmentDate) {
      toast.error('Please select appointment type and date');
      return;
    }

    setSchedulingNextAppointment(true);

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();

      // First, mark current appointment as complete
      const { error: completeError } = await (supabaseClient as any)
        .from('appointments')
        .update({
          encounter_completed: true,
          encounter_completed_at: new Date().toISOString(),
          encounter_completed_by: user?.id || null,
          status: 'Appointment Completed',
          status_code: 'CMPLT',
          next_appointment_scheduled: true,
          next_appointment_status: 'scheduled',
          next_appointment_date: nextAppointmentDate,
          next_appointment_time: nextAppointmentStartTime,
          next_appointment_type: nextAppointmentType,
          next_appointment_subtype: nextAppointmentSubtype || null
        })
        .eq('id', currentApptId);

      if (completeError) {
        console.error('Error completing appointment:', completeError);
        toast.error('Failed to complete appointment');
        setSchedulingNextAppointment(false);
        return;
      }

      // Determine appointment title
      const appointmentTitle = nextAppointmentSubtype
        ? nextAppointmentSubtypes[nextAppointmentType]?.find(s => s.value === nextAppointmentSubtype)?.label || nextAppointmentType
        : nextAppointmentTypes.find(t => t.value === nextAppointmentType)?.label || nextAppointmentType;

      // Create the next appointment using ref values
      const { data: newAppointment, error: createError } = await (supabaseClient as any)
        .from('appointments')
        .insert({
          patient_id: patientId,
          patient_name: patientName,
          title: appointmentTitle,
          date: nextAppointmentDate,
          start_time: nextAppointmentStartTime,
          end_time: nextAppointmentEndTime,
          appointment_type: nextAppointmentType,
          subtype: nextAppointmentSubtype || null,
          status: 'Not Confirmed',
          status_code: '?????',
          assigned_user_id: nextAppointmentAssignedUserId || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating next appointment:', createError);
        toast.error('Appointment completed but failed to schedule next appointment');
        setSchedulingNextAppointment(false);
        checkEncounterStatus([currentApptId]);
        return;
      }

      // If next appointment type is 'consultation', create a consultation record
      if (nextAppointmentType === 'consultation') {
        console.log('Creating linked consultation record for:', newAppointment.id);
        const { error: consultationError } = await (supabaseClient as any)
          .from('consultations')
          .insert({
            appointment_id: newAppointment.id,
            patient_id: patientId,
            patient_name: patientName,
            consultation_status: 'scheduled',
            consultation_date: nextAppointmentDate
          });

        if (consultationError) {
          console.error('Error creating consultation record:', consultationError);
          // Don't fail the whole operation, just log/toast
          toast.error('Appointment created but failed to initialize consultation record');
        }
      }

      toast.success('Appointment completed and next appointment scheduled');

      // Update local state for the completed appointment
      // Verify immediate local state update via parent callback
      if (onStatusChange) {
        onStatusChange(currentApptId, 'CMPLT');
      }

      // Close dialogs and reset ALL state
      setShowNextAppointmentForm(false);
      setNextAppointmentDialog(null);
      setSchedulingNextAppointment(false);
      setNextAppointmentType('');
      setNextAppointmentSubtype('');
      setNextAppointmentDate('');
      setNextAppointmentStartTime('');
      setNextAppointmentEndTime('');
      setNextAppointmentAssignedUserId('');
      // Reset the ref
      nextAppointmentPatientRef.current = { patientId: '', patientName: '', currentApptId: '' };

      // Refresh encounter status
      checkEncounterStatus([currentApptId]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete appointment');
      setSchedulingNextAppointment(false);
    }
  };

  // Wrapper for navigate to consultation
  const handleNavigateToConsultation = (appointmentId: string) => {
    setOpenContextMenuId(null);
    navigate(`/consultation/${appointmentId}`);
  };

  // Handler for creating a new lab script
  const handleAddNewLabScript = (appointment: Appointment) => {
    // Close menu immediately
    setOpenContextMenuId(null);

    // Open lab script form with patient name
    setTimeout(() => {
      setLabScriptPatientName(appointment.patient);
      setLabScriptFormOpen(true);
    }, 100);
  };

  // Handler for lab script form submission
  const handleLabScriptSubmit = async (formData: any) => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();

      const { data: userProfile } = await (supabaseClient as any)
        .from('user_profiles')
        .select('id, full_name')
        .eq('user_id', user?.id)
        .single();

      const { data: newLabScript, error } = await supabaseClient
        .from('lab_scripts')
        .insert({
          patient_id: formData.patientId,
          patient_name: formData.patientName,
          arch_type: formData.archType,
          upper_treatment_type: formData.upperTreatmentType || null,
          lower_treatment_type: formData.lowerTreatmentType || null,
          upper_appliance_type: formData.upperApplianceType || null,
          lower_appliance_type: formData.lowerApplianceType || null,
          screw_type: formData.screwType || null,
          custom_screw_type: formData.customScrewType || null,
          material: formData.material || null,
          shade: formData.shade || null,
          vdo_details: formData.vdoDetails || null,
          is_nightguard_needed: formData.isNightguardNeeded || null,
          requested_date: formData.requestedDate,
          due_date: formData.dueDate || null,
          instructions: formData.instructions,
          notes: formData.notes || null,
          status: 'pending',
          created_by: userProfile?.id || null,
          created_by_name: userProfile?.full_name || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lab script:', error);
        toast.error('Failed to create lab script');
        return;
      }

      toast.success('Lab script created successfully');
      setLabScriptFormOpen(false);
    } catch (error) {
      console.error('Error in handleLabScriptSubmit:', error);
      toast.error('An error occurred');
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    setOpenContextMenuId(null);
    if (!appointment.patientId) {
      toast.error("Cannot reschedule: Patient ID missing");
      return;
    }
    setRescheduleDialog({
      appointment,
      open: true
    });
  };

  const handleRescheduleConfirm = async (appointmentData: {
    type: string;
    subtype: string | null;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!rescheduleDialog) return;

    try {
      // 1. Update old appointment status
      const { error: updateError } = await (supabaseClient as any)
        .from('appointments')
        .update({ status_code: 'RESCH' })
        .eq('id', rescheduleDialog.appointment.id);

      if (updateError) {
        console.error('Error rescheduling:', updateError);
        toast.error('Failed to update status');
        return;
      }

      // 2. Create new appointment
      const { error: createError } = await (supabaseClient as any)
        .from('appointments')
        .insert({
          patient_id: rescheduleDialog.appointment.patientId,
          patient_name: rescheduleDialog.appointment.patient,
          title: rescheduleDialog.appointment.title,
          appointment_type: appointmentData.type,
          subtype: appointmentData.subtype,
          date: appointmentData.date,
          start_time: appointmentData.startTime,
          end_time: appointmentData.endTime,
          notes: rescheduleDialog.appointment.notes,
          status: 'Not Confirmed',
          status_code: '?????',
          assigned_user_id: rescheduleDialog.appointment.assignedUserId
        });

      if (createError) {
        console.error('Error creating new appointment:', createError);
        toast.error('Failed to create new appointment');
      } else {
        toast.success('Appointment rescheduled successfully');
        setRescheduleDialog(null);
        window.location.reload(); // Force refresh to show changes
      }
    } catch (error) {
      console.error('Error in handleRescheduleConfirm:', error);
      toast.error('An error occurred during rescheduling');
    }
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
      key: 'follow-up',
      label: 'Follow Up',
      shortLabel: 'Follow Up',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      key: 'data-collection',
      label: 'Data Collection',
      shortLabel: 'Data Collection',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      key: 'printed-try-in',
      label: 'Appliance Delivery',
      shortLabel: 'Delivery',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      key: 'surgery',
      label: 'Surgery',
      shortLabel: 'Surgery',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      key: 'emergency',
      label: 'Emergency',
      shortLabel: 'Emergency',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-25',
      selectedColor: 'bg-blue-100 border-blue-400',
      dragColor: 'bg-blue-200 border-blue-500',
      badgeColor: 'bg-blue-500 text-white'
    }
  ];
  // Fetch users from Supabase for assignment
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await (supabaseClient as any)
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        const usersList = data as unknown as User[];
        setUsers(usersList);

        // Auto-assign DC if it's a consultation
        if (nextAppointmentType === 'consultation' && !nextAppointmentAssignedUserId) {
          const dcUser = usersList.find(user => user.full_name.trim().toLowerCase() === 'dc');
          if (dcUser) {
            setNextAppointmentAssignedUserId(dcUser.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users when next appointment dialog opens
  useEffect(() => {
    if (showNextAppointmentForm) {
      fetchUsers();
    }
  }, [showNextAppointmentForm, nextAppointmentType]);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minute: number; column: string } | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

  // Ref for persistent drag selection across re-renders
  const persistentSelectionRef = useRef<{
    start: { hour: number; minute: number; column: string } | null;
    end: { hour: number; minute: number; column: string } | null;
    column: string | null;
    isVisible: boolean;
  }>({ start: null, end: null, column: null, isVisible: false });

  // Ref to track drag hold timeout
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref for long-press timer (1 second hold to drag)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);


  // State to track if the device is a touch device (pointer: coarse)
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Effect to detect touch device capability for UI adaptation
  useEffect(() => {
    // Check if the primary pointer is coarse (touch)
    const mediaQuery = window.matchMedia('(pointer: coarse)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTouchDevice(e.matches);
    };

    // Initial check
    handleChange(mediaQuery);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Ref to track if we are in a touch interaction
  // This prevents ghost mouse events (mouseup/mouseleave) from firing during touch drag
  const isTouchRef = useRef(false);

  // Ref to track if a click originated on an appointment card
  // This helps distinguish between creating a new appointment (drag) vs opening details (click)
  const ignoreSingleClickRef = useRef(false);

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

  const getTypeColors = (typeKey: string, encounterCompleted = false, statusCode?: string, status: string = '') => {
    // If appointment is Rescheduled, OVERRIDE all colors to Gray
    if (status === 'RESCH') {
      return {
        key: typeKey,
        label: 'Rescheduled',
        shortLabel: 'Rescheduled',
        color: 'bg-gray-100 border-gray-300 text-gray-500',
        hoverColor: 'hover:bg-gray-200',
        selectedColor: 'bg-gray-200 border-gray-400',
        dragColor: 'bg-gray-200 border-gray-400',
        badgeColor: 'bg-gray-500 text-white'
      };
    }

    // If status is completed (gray), it takes precedence over everything
    if (statusCode === 'CMPLT') {
      return {
        key: typeKey,
        label: appointmentTypes.find(type => type.key === typeKey)?.label || typeKey,
        shortLabel: appointmentTypes.find(type => type.key === typeKey)?.shortLabel || typeKey,
        color: 'bg-gray-100 border-gray-300 text-gray-800',
        hoverColor: 'hover:bg-gray-200',
        selectedColor: 'bg-gray-200 border-gray-400',
        dragColor: 'bg-gray-300 border-gray-500',
        badgeColor: 'bg-gray-500 text-white'
      };
    }

    // If status is No Show or Cancelled (red)
    if (statusCode === 'NSHOW' || statusCode === 'CANCL') {
      return {
        key: typeKey,
        label: appointmentTypes.find(type => type.key === typeKey)?.label || typeKey,
        shortLabel: appointmentTypes.find(type => type.key === typeKey)?.shortLabel || typeKey,
        color: 'bg-red-100 border-red-300 text-red-800',
        hoverColor: 'hover:bg-red-200',
        selectedColor: 'bg-red-200 border-red-400',
        dragColor: 'bg-red-300 border-red-500',
        badgeColor: 'bg-red-500 text-white'
      };
    }

    // If encounter is completed, use green theme
    if (encounterCompleted) {
      return {
        key: typeKey,
        label: appointmentTypes.find(type => type.key === typeKey)?.label || typeKey,
        shortLabel: appointmentTypes.find(type => type.key === typeKey)?.shortLabel || typeKey,
        color: 'bg-green-100 border-green-300 text-green-800',
        hoverColor: 'hover:bg-green-50',
        selectedColor: 'bg-green-100 border-green-400',
        dragColor: 'bg-green-200 border-green-500',
        badgeColor: appointmentTypes.find(type => type.key === typeKey)?.badgeColor || 'bg-green-500 text-white'
      };
    }

    // Special handling for surgical-revision - it should have its own colors but appear in surgery column
    if (typeKey === 'surgical-revision') {
      return {
        key: 'surgical-revision',
        label: 'Surgical Revision',
        shortLabel: 'Revision',
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        hoverColor: 'hover:bg-blue-25',
        selectedColor: 'bg-blue-100 border-blue-400',
        dragColor: 'bg-blue-200 border-blue-500',
        badgeColor: 'bg-purple-500 text-white'
      };
    }

    // Special handling for Appliance-delivery/appliance-insertion - match printed-try-in styling
    if (typeKey === 'Appliance-delivery' || typeKey === 'appliance-insertion') {
      return {
        key: typeKey,
        label: 'Appliance Delivery',
        shortLabel: 'Delivery',
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        hoverColor: 'hover:bg-blue-25',
        selectedColor: 'bg-blue-100 border-blue-400',
        dragColor: 'bg-blue-200 border-blue-500',
        badgeColor: 'bg-blue-500 text-white'
      };
    }

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
    // Only allow left click (button 0) to start drag
    if (e.button !== 0) return;

    e.preventDefault();

    // Since we support overlapping appointments, we allow creating new ones even in occupied slots
    // if (hasAppointmentInSlot(hour, minute, column)) {
    //   return; 
    // }

    // Set initial drag data immediately so it's ready
    setDragStart({ hour, minute, column });
    setDragEnd({ hour, minute, column });
    setDragColumn(column);

    // Start dragging immediately (no hold delay)
    setIsDragging(true);
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
      // const rangeStart = Math.min(startTime, currentTime);
      // const rangeEnd = Math.max(startTime, currentTime) + 15; // Add 15 minutes for the slot duration

      // Since we support overlapping appointments, we don't block dragging over existing ones
      /*
      const hasConflict = appointments.some(appointment => {
        if (appointment.type !== column) return false;

        const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
        const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

        const appointmentStart = startHour * 60 + startMinute;
        const appointmentEnd = endHour * 60 + endMinute;

        // Check if ranges overlap
        return !(rangeEnd <= appointmentStart || rangeStart >= appointmentEnd);
      });
      */

      // Always update drag end
      setDragEnd({ hour, minute, column });
    }
  }, [isDragging, dragColumn, dragStart, appointments]);

  const handleMouseUp = useCallback(() => {
    // Clear any pending drag start timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

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
        // If it's a single click on an existing appointment, we should IGNORE creation
        // and let the appointment click handler open the details dialog.
        // But if it was a dragged selection (even starting on an appointment), we should create.
        if (isSingleClick && ignoreSingleClickRef.current) {
          console.log('Ignoring single click on appointment card (opening details)');
          ignoreSingleClickRef.current = false; // Reset
          // Do NOT create new appointment
        } else {
          // Proceed with creation logic
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

      // Reset ignore flag if we got here and didn't consume it
      ignoreSingleClickRef.current = false;
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

    // Clear any existing timer
    if (timeSlotLongPressTimer) {
      clearTimeout(timeSlotLongPressTimer);
    }

    // Set a 1-second timer before enabling drag
    const timer = setTimeout(() => {
      console.log('1-second hold completed, enabling drag'); // Debug log
      setIsTimeSlotLongPress(true);
      setIsDragging(true);
      setDragStart({ hour, minute, column });
      setDragEnd({ hour, minute, column });
      setDragColumn(column);
    }, 1000); // 1000ms = 1 second

    setTimeSlotLongPressTimer(timer);
  }, [timeSlotLongPressTimer]);

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

    // Use elementsFromPoint to "see through" overlay elements like appointment cards
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);

    // Find the closest time slot element from the stack of elements at this point
    const slotElement = elements.find(el => el.hasAttribute('data-hour') && el.hasAttribute('data-minute')) as HTMLElement | undefined;

    if (slotElement) {
      const hour = parseInt(slotElement.getAttribute('data-hour') || '0');
      const minute = parseInt(slotElement.getAttribute('data-minute') || '0');
      const column = slotElement.getAttribute('data-column') || '';

      if (column === dragColumn) {
        handleMouseEnter(hour, minute, column);
      }
    }
  }, [isDragging, dragColumn, handleMouseEnter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();

    // Clear the long-press timer if touch ends before 2 seconds
    if (timeSlotLongPressTimer) {
      clearTimeout(timeSlotLongPressTimer);
      setTimeSlotLongPressTimer(null);
    }

    // Reset long-press state
    setIsTimeSlotLongPress(false);

    // CSS will handle scroll restoration when .dragging class is removed
    handleMouseUp();
  }, [handleMouseUp, timeSlotLongPressTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeSlotLongPressTimer) {
        clearTimeout(timeSlotLongPressTimer);
      }
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [timeSlotLongPressTimer, longPressTimer]);

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
      onMouseUp={(e) => {
        // Ignore mouse up if we are in a touch interaction (prevents premature end)
        if (isTouchRef.current) return;
        handleMouseUp();
      }}
      onMouseLeave={(e) => {
        if (isTouchRef.current) return;
        handleMouseUp();
      }}
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
              <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">{type.label}</span>
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


          {/* Continuous appointment rectangles - positioned absolutely over the entire grid */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {appointmentTypes.map((type, typeIndex) => {
              // Get all appointments for this type
              // Map both 'surgery' and 'surgical-revision' to the surgery column
              const typeAppointments = appointments.filter(apt => {
                // If this is the emergency column, capture all emergency appointments
                // If appointment is Rescheduled, OVERRIDE all colors to Gray
                if (apt.statusCode === 'RESCH') {
                  // This is a placeholder for where the color/style override would happen
                  // The actual styling logic for individual appointments is further down
                  // This filter is only for determining which appointments belong to which column
                  // and does not directly apply styles here.
                  // The instruction's provided code snippet for `return { label: 'Rescheduled', ... }`
                  // seems to be intended for a `getTypeColors` or similar function, not directly here.
                  // For now, we'll just ensure rescheduled appointments are included in their original type column
                  // but their styling will be handled by `getStatusColor` or a similar mechanism later.
                }

                if (type.key === 'emergency') {
                  return apt.isEmergency === true;
                }

                // If appointment is marked as emergency, it belongs ONLY in the emergency column
                if (apt.isEmergency === true) {
                  return false;
                }

                if (type.key === 'surgery') {
                  return apt.type === 'surgery' || apt.type === 'surgical-revision';
                }
                if (type.key === 'printed-try-in') {
                  return apt.type === 'printed-try-in' || apt.type === 'Appliance-delivery' || apt.type === 'appliance-insertion';
                }
                return apt.type === type.key;
              });

              // --- INJECT GHOST APPOINTMENT FOR DRAG SELECTION ---
              // This allows the lane layout algorithm to treat the drag selection as a real appointment
              // causing overlapping existing appointments to shrink automatically.
              const persistentSelection = persistentSelectionRef.current;
              const activeColumn = (isDialogOpen && persistentSelection.column) ? persistentSelection.column : dragColumn;
              const activeStart = (isDialogOpen && persistentSelection.start) ? persistentSelection.start : dragStart;
              const activeEnd = (isDialogOpen && persistentSelection.end) ? persistentSelection.end : dragEnd;

              const shouldShowSelection = (isDragging || (isDialogOpen && persistentSelection.isVisible)) && activeStart && activeEnd && activeColumn === type.key;

              if (shouldShowSelection && activeStart && activeEnd) {
                const startMinutes = activeStart.hour * 60 + activeStart.minute;
                const endMinutes = activeEnd.hour * 60 + activeEnd.minute;
                const startTotalMinutes = Math.min(startMinutes, endMinutes);
                const endTotalMinutes = Math.max(startMinutes, endMinutes) + 15;

                const startH = Math.floor(startTotalMinutes / 60);
                const startM = startTotalMinutes % 60;
                const endH = Math.floor(endTotalMinutes / 60);
                const endM = endTotalMinutes % 60;

                const startTime = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
                const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                // Create a mock appointment object compatible with the type
                // Use 'any' cast to avoid strict type checks for missing optional props on this temporary object
                const mockAppointment: any = {
                  id: 'ghost-selection',
                  type: type.key,
                  patient: 'New Selection',
                  startTime,
                  endTime,
                  statusCode: 'NEW', // Placeholder
                  encounterCompleted: false
                };

                typeAppointments.push(mockAppointment);
              }
              // ---------------------------------------------------

              // Helper to get minutes
              const getMinutes = (time: string) => {
                const [h, m] = time.split(':').map(Number);
                return h * 60 + m;
              };

              // Debug: Log the sorting process
              if (shouldShowSelection) {
                const ghost = typeAppointments.find(a => a.id === 'ghost-selection');
                if (ghost) {
                  console.log('Ghost appointment found before sort:', {
                    id: ghost.id,
                    startTime: ghost.startTime,
                    minutes: getMinutes(ghost.startTime)
                  });
                }
              }

              // Sort logic with tolerance
              typeAppointments.sort((a, b) => {
                // Get raw minute values
                const timeA = getMinutes(a.startTime);
                const timeB = getMinutes(b.startTime);

                // Check if they are effectively the same start time (within 1 minute)
                // This handles cases where one might be 08:00 and other 08:00:00 or 08:00:30
                const diff = timeA - timeB;

                if (Math.abs(diff) < 1) {
                  // Start times are effectively equal
                  // Force 'ghost-selection' to be LAST (Right side)
                  if (a.id === 'ghost-selection') return 1;
                  if (b.id === 'ghost-selection') return -1;

                  // Safe CreatedAt Sort
                  // Treat missing created_at as "Max/Newest" so it goes to the end
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : Number.MAX_SAFE_INTEGER;
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : Number.MAX_SAFE_INTEGER;

                  const dateDiff = dateA - dateB;
                  if (dateDiff !== 0) {
                    return dateDiff; // Oldest (Smallest) first -> Lane 0
                  }

                  // Fallback to title or ID for deterministic stability if created_at is identical
                  return a.id.localeCompare(b.id);
                }

                // Otherwise normal time sort
                return diff;
              });

              if (shouldShowSelection) {
                console.log('Sorted appointments for layout:', typeAppointments.map(a => `${a.id} (${a.startTime})`));
              }

              // Group overlapping appointments
              const groups: typeof typeAppointments[] = [];
              if (typeAppointments.length > 0) {
                let currentGroup = [typeAppointments[0]];
                let groupEnd = getMinutes(typeAppointments[0].endTime);

                for (let i = 1; i < typeAppointments.length; i++) {
                  const apt = typeAppointments[i];
                  const start = getMinutes(apt.startTime);

                  // Simple overlap check with the whole group duration
                  if (start < groupEnd) {
                    currentGroup.push(apt);
                    groupEnd = Math.max(groupEnd, getMinutes(apt.endTime));
                  } else {
                    groups.push(currentGroup);
                    currentGroup = [apt];
                    groupEnd = getMinutes(apt.endTime);
                  }
                }
                groups.push(currentGroup);
              }

              // Calculate distinct "lanes" for each group to determine horizontal offset
              const layoutMap = new Map<string, { laneIndex: number, totalLanes: number }>();

              groups.forEach(group => {
                // Determine lanes
                const lanes: typeof typeAppointments[] = [];

                group.forEach(apt => {
                  let placed = false;

                  // Try to find a lane where this appointment doesn't overlap with the last item
                  for (let i = 0; i < lanes.length; i++) {
                    const lane = lanes[i];
                    const lastInLane = lane[lane.length - 1];

                    // Check overlap with last item in lane
                    // Overlap if: Start < End (of last)
                    if (getMinutes(apt.startTime) >= getMinutes(lastInLane.endTime)) {
                      lane.push(apt);
                      layoutMap.set(apt.id, { laneIndex: i, totalLanes: 0 }); // totalLanes set later
                      placed = true;
                      break;
                    }
                  }

                  if (!placed) {
                    // Start new lane
                    lanes.push([apt]);
                    layoutMap.set(apt.id, { laneIndex: lanes.length - 1, totalLanes: 0 });
                  }
                });

                // Update total lanes for all in group
                const totalLanes = lanes.length;
                group.forEach(apt => {
                  const layout = layoutMap.get(apt.id)!;
                  layoutMap.set(apt.id, { ...layout, totalLanes });
                });
              });

              return typeAppointments.map((appointment) => {
                // RENDER GHOST SELECTION
                if (appointment.id === 'ghost-selection') {
                  const typeColors = getTypeColors(type.key);
                  const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                  const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
                  const startTotalMinutes = startHour * 60 + startMinute;
                  const endTotalMinutes = endHour * 60 + endMinute;

                  // Calculate position within the grid
                  const firstHour = hours[0];
                  const hourHeight = 200;
                  const startMinutesFromFirst = startTotalMinutes - (firstHour * 60);
                  const endMinutesFromFirst = endTotalMinutes - (firstHour * 60);
                  const topPosition = (startMinutesFromFirst / 60) * hourHeight;
                  const bottomPosition = (endMinutesFromFirst / 60) * hourHeight;
                  const height = bottomPosition - topPosition;

                  const columnWidthVal = `((100% - 60px) / ${appointmentTypes.length})`;

                  // Use lane layout
                  const layout = layoutMap.get(appointment.id) || { laneIndex: 0, totalLanes: 1 };
                  const { laneIndex, totalLanes } = layout;
                  const laneWidthVal = `(${columnWidthVal} / ${totalLanes})`;
                  const laneOffsetVal = `(${laneWidthVal} * ${laneIndex})`;

                  // Match the reduced padding style
                  const paddingLeft = totalLanes > 1 ? 4 : 8;
                  const paddingRight = totalLanes > 1 ? 4 : 8;

                  return (
                    <div
                      key="ghost-selection"
                      className={`absolute ${typeColors.dragColor} rounded-lg border-2 shadow-lg z-30 pointer-events-none`}
                      style={{
                        left: `calc(60px + ${typeIndex} * ${columnWidthVal} + ${laneOffsetVal} + ${paddingLeft}px)`,
                        width: `calc(${laneWidthVal} - ${paddingLeft + paddingRight}px)`,
                        top: `${topPosition}px`,
                        height: `${height}px`,
                      }}
                    >
                      <div className="h-full flex items-end justify-end p-2">
                        <div className="text-xs font-medium text-gray-700">
                          {formatAppointmentTime(appointment.startTime)} - {formatAppointmentTime(appointment.endTime)}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Get type colors based on appointment type and encounter completion status
                const typeColors = getTypeColors(appointment.type, appointment.encounterCompleted, appointment.statusCode, appointment.statusCode);
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
                const columnWidthVal = `((100% - 60px) / ${appointmentTypes.length})`;

                // Get layout info
                const layout = layoutMap.get(appointment.id) || { laneIndex: 0, totalLanes: 1 };
                const { laneIndex, totalLanes } = layout;

                // Calculate exact left position and width based on lane
                // Base Left + (Lane Index * Lane Width)
                const laneWidthVal = `(${columnWidthVal} / ${totalLanes})`;
                const laneOffsetVal = `(${laneWidthVal} * ${laneIndex})`;

                // Use smaller padding when lanes are split to maximize space
                const paddingLeft = totalLanes > 1 ? 4 : 8;
                // Standard padding on the right (reverted from 24px)
                const paddingRight = totalLanes > 1 ? 4 : 8;

                return (
                  <React.Fragment key={appointment.id}>

                    <ContextMenu
                      key={appointment.id}
                      modal={true}
                    >
                      <ContextMenuTrigger asChild>
                        <div
                          className={`absolute ${typeColors.color} rounded-lg border-2 ${appointment.isEmergency ? '!border-red-600' : ''} shadow-sm cursor-pointer hover:shadow-lg transition-all z-10 select-none ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                          style={{
                            // Formula: HeaderWidth + (TypeIndex * ColWidth) + LaneOffset + PaddingLeft
                            left: `calc(60px + ${typeIndex} * ${columnWidthVal} + ${laneOffsetVal} + ${paddingLeft}px)`,
                            // Width: LaneWidth - (LeftPadding + RightPadding)
                            width: `calc(${laneWidthVal} - ${paddingLeft + paddingRight}px)`,
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            touchAction: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            WebkitTouchCallout: 'none', // Critical for iOS to prevent magnifier/menu
                          }}
                          onMouseDown={(e) => {
                            // Allow right-click to propagate for ContextMenu
                            if (e.button === 2) {
                              return; // Let ContextMenuTrigger handle this
                            }

                            e.preventDefault();
                            e.stopPropagation(); // Stop propagation to container generally

                            // Store event data for use in timer
                            const clientX = e.clientX;
                            const clientY = e.clientY;
                            const currentTarget = e.currentTarget; // Not strict needed but good for refs

                            // Start a timer to delay drag initiation
                            // This allows short clicks to register as 'Open Details' without starting a drag
                            holdTimerRef.current = setTimeout(() => {
                              console.log('Mouse Drag Timer Fired - Starting Selection');

                              // Mark this as starting on an appointment so single clicks don't create new ones
                              ignoreSingleClickRef.current = true;
                              setIsDragging(true); // Explicitly set dragging

                              // Manually find the underlying time slot to trigger drag start
                              // We need to look through the layers to find the data-hour/minute slot
                              const elements = document.elementsFromPoint(clientX, clientY);
                              const slotElement = elements.find(el => el.hasAttribute('data-hour') && el.hasAttribute('data-minute'));

                              if (slotElement) {
                                const hour = parseInt(slotElement.getAttribute('data-hour') || '0');
                                const minute = parseInt(slotElement.getAttribute('data-minute') || '0');
                                const column = slotElement.getAttribute('data-column') || '';

                                console.log('Manual drag start on appointment (delayed):', { hour, minute, column });

                                // We need to mock the event or ensure handleMouseDown can handle the disconnect?
                                // handleMouseDown mainly uses it for e.buttons check (which isn't async-safe usually, but we assume left button)
                                // and preventDefault.
                                // We'll reconstruct a minimal object if needed, or pass the original 'e' if React event persists (it doesn't async).
                                // But handleMouseDown lines 2700+ mainly uses args.

                                handleMouseDown(hour, minute, column, {
                                  preventDefault: () => { },
                                  stopPropagation: () => { },
                                  button: 0,
                                  buttons: 1 // Simulate held button
                                } as any);
                              }

                              holdTimerRef.current = null; // Clear ref so MouseUp knows it fired
                            }, 200); // 200ms delay
                          }}
                          onMouseMove={(e) => {
                            e.stopPropagation();
                            // Optional: If moved significantly before timer, maybe cancel timer?
                            // But 'Hold to drag' usually implies keeping still-ish.
                            // For now, let's keep it simple: Time based.
                          }}
                          onMouseUp={(e) => {
                            // If timer is still running, it means it was a CLICK
                            if (holdTimerRef.current) {
                              clearTimeout(holdTimerRef.current);
                              holdTimerRef.current = null;

                              // Trigger Click Logic
                              e.stopPropagation();
                              // e.preventDefault(); // Might not need this if we handled MouseDown
                              console.log('Quick Click detected - Opening Appointment');
                              onAppointmentClick(appointment);
                            } else {
                              // Timer fired, so we were dragging.
                              // Drag end logic is handled by global Window MouseUp usually, 
                              // but we should ensure we don't trigger click.
                            }
                          }}
                          onClick={(e) => {
                            // Clean up just in case, though MouseUp should handle it
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onTouchStart={(e) => {
                            isTouchRef.current = true;

                            // Prevent default if necessary, but we want to allow scrolling if they move immediately
                            // e.preventDefault(); 

                            const touch = e.touches[0];
                            const clientX = touch.clientX;
                            const clientY = touch.clientY;

                            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

                            holdTimerRef.current = setTimeout(() => {
                              console.log('Appointment Card Hold Timer FIRED');
                              setIsDragging(true);
                              ignoreSingleClickRef.current = true; // Prevent opening details

                              // Find underlying slot
                              const elements = document.elementsFromPoint(clientX, clientY);
                              const slotElement = elements.find(el => el.hasAttribute('data-hour') && el.hasAttribute('data-minute'));

                              if (slotElement) {
                                const h = parseInt(slotElement.getAttribute('data-hour') || '0');
                                const m = parseInt(slotElement.getAttribute('data-minute') || '0');
                                const c = slotElement.getAttribute('data-column') || '';

                                console.log('Hold Drag Start on Slot:', { h, m, c });

                                setDragStart({ hour: h, minute: m, column: c });
                                setDragEnd({ hour: h, minute: m, column: c });
                                setDragColumn(c);

                                // Mock Mouse Down to initialize any other state logic
                                handleMouseDown(h, m, c, {
                                  button: 0,
                                  preventDefault: () => { },
                                  stopPropagation: () => { }
                                } as unknown as React.MouseEvent);

                                if (navigator.vibrate) navigator.vibrate(50);
                              }
                            }, 500);
                          }}
                          onTouchEnd={(e) => {
                            if (holdTimerRef.current) {
                              // Timer still running? Means Hold time (<500ms) was short. This is a TAP.
                              clearTimeout(holdTimerRef.current);
                              holdTimerRef.current = null;

                              // Explicitly trigger click logic for Tap
                              if (!isDragging) {
                                e.preventDefault(); // Prevent ghost click
                                onAppointmentClick(appointment);
                              }
                            }

                            // Reset touch ref after delay
                            setTimeout(() => {
                              isTouchRef.current = false;
                            }, 500);
                          }}
                          onTouchMove={(e) => {
                            // If moved significantly, cancel timer
                            if (holdTimerRef.current) {
                              // We could calculate distance, but for now any move cancels "Hold" (allows scroll)
                              // UNLESS isDragging is true (handled by global logic)
                              if (!isDragging) {
                                clearTimeout(holdTimerRef.current);
                                holdTimerRef.current = null;
                              }
                            }
                          }}
                          // Use Capture phase to intercept the event before Radix ContextMenu sees it
                          onContextMenuCapture={(e) => {
                            // If we are in a touch interaction, prevent the native context menu
                            // because we have a dedicated 3-dots button and we want hold-to-drag
                            if (isTouchRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}

                        >
                          {/* Vertical status capsule on the left edge */}
                          <div className={`absolute left-0.5 top-0.5 bottom-0.5 w-4 rounded-full ${getStatusDotColor(appointment.statusCode)} flex flex-col items-center justify-center overflow-hidden z-20`}>
                            {/* Text centered in the badge - full height flex to center */}
                            <div className="flex items-center justify-center w-full h-full">
                              <span
                                className="text-[8px] font-bold text-white whitespace-nowrap select-none tracking-widest"
                                style={{
                                  writingMode: 'vertical-rl',
                                  textOrientation: 'mixed',
                                  transform: 'rotate(180deg)', // Bottom-to-top reading
                                }}
                              >
                                {appointment.statusCode}
                              </span>
                            </div>

                            {/* Bottom: 3-Dots Menu Button - ABSOLUTE POSITIONED */}
                            <div
                              className="absolute bottom-1 flex items-center justify-center w-full"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onTouchEnd={(e) => e.stopPropagation()}
                            >
                              {isTouchDevice && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 p-0 hover:bg-black/20 text-white rounded-full"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-56 touch-manipulation select-none" align="start" side="right">
                                    {appointment.statusCode !== 'RESCH' && (
                                      <>
                                        <DropdownMenuItem {...handleMenuItemAction(() => handleEncounterForm(appointment))}>
                                          <ClipboardList className="mr-2 h-4 w-4" />
                                          {appointmentEncounterStatus[appointment.id] ? 'View Encounter Form' : 'Encounter Form'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem {...handleMenuItemAction(() => handleAddNewLabScript(appointment))}>
                                          <FileEdit className="mr-2 h-4 w-4" />
                                          Add New Lab Script
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {appointment.statusCode !== 'CMPLT' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger className="touch-manipulation select-none">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Change Status
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent className="touch-manipulation select-none">
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleCompleteAppointment(appointment))}>
                                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                              Complete Appointment
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, '?????'))}>
                                              <AlertCircle className="mr-2 h-4 w-4 text-gray-400" />
                                              Not Confirmed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'FIRM'))}>
                                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                              Appointment Confirmed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'EFIRM'))}>
                                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                              Electronically Confirmed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'EMER'))}>
                                              <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                                              Emergency Patient
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'HERE'))}>
                                              <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                                              Patient has Arrived
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'READY'))}>
                                              <UserCheck className="mr-2 h-4 w-4 text-indigo-600" />
                                              Seated & Ready
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'LM1'))}>
                                              <Clock3 className="mr-2 h-4 w-4 text-orange-500" />
                                              Left Message 1
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'LM2'))}>
                                              <Clock3 className="mr-2 h-4 w-4 text-orange-600" />
                                              Left Message 2
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'MULTI'))}>
                                              <UserCircle className="mr-2 h-4 w-4 text-purple-600" />
                                              Multiple Appointments
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, '2wk'))}>
                                              <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                                              2 Week Check
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'NSHOW'))}>
                                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                              No Show
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleReschedule(appointment))}>
                                              <Clock className="mr-2 h-4 w-4 text-amber-600" />
                                              Reschedule Appointment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'CANCL'))}>
                                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                              Cancelled
                                            </DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem {...handleMenuItemAction(() => {
                                      // Health History
                                      if (appointment.patientId) {
                                        handleOpenHealthHistory(appointment.patientId, appointment.patient);
                                      } else {
                                        toast("No patient ID associated with this appointment");
                                      }
                                    })}>
                                      <Heart className="mr-2 h-4 w-4 text-red-500" />
                                      Health History
                                    </DropdownMenuItem>
                                    <DropdownMenuItem {...handleMenuItemAction(() => {
                                      // Comfort Preference
                                      if (appointment.patientId) {
                                        handleOpenComfortPreference(appointment.patientId, appointment.patient);
                                      } else {
                                        toast("No patient ID associated with this appointment");
                                      }
                                    })}>
                                      <Smile className="mr-2 h-4 w-4 text-orange-500" />
                                      Comfort Preference
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {appointment.statusCode !== 'CMPLT' && (
                                      <DropdownMenuItem {...handleMenuItemAction(() => onEdit && onEdit(appointment))}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Appointment
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      {...handleMenuItemAction(() => onDelete && onDelete(appointment.id))}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Appointment
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          <div className="p-1 pl-5 pr-1 h-full flex flex-col justify-between">
                            {(() => {
                              // Calculate appointment duration in minutes
                              const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
                              const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
                              const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

                              // Different layouts for 15 and 30 minute appointments
                              if (durationMinutes === 15) {
                                // Single line layout for 15-minute appointments
                                // Get the actual appointment type colors for the badge
                                const actualTypeColors = getTypeColors(appointment.type);
                                const firstLetter = actualTypeColors.shortLabel?.charAt(0) || actualTypeColors.label?.charAt(0) || 'A';
                                const columnWidth = getColumnWidth() / totalLanes;

                                // Determine time font size based on column width
                                let timeFontSize = 'text-[10px]';
                                if (columnWidth < 100) {
                                  timeFontSize = 'text-[8px]';
                                } else if (columnWidth < 120) {
                                  timeFontSize = 'text-[9px]';
                                }

                                return (
                                  <div className="flex flex-col h-full w-full overflow-hidden">
                                    {/* Top row - Patient name and status code */}
                                    <div className="flex items-start justify-between gap-1 mb-0 border-b border-black/5 pb-[1px]">
                                      <h4
                                        className="font-medium text-[10px] text-gray-800 whitespace-normal break-words line-clamp-2 flex-1 min-w-0 underline cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                                        onClick={(e) => {
                                          console.log('15-minute appointment patient name clicked');
                                          e.stopPropagation();
                                          handlePatientNameClick(appointment);
                                        }}
                                      >
                                        {appointment.patient}
                                      </h4>
                                      {/* Removed Status Code Badge */}
                                    </div>
                                    {/* Middle - Assigned user and subtype */}
                                    {/* Middle - Assigned user and subtype vertically stacked */}
                                    <div className="flex flex-col gap-0 min-w-0">
                                      {appointment.assignedUserName && (
                                        <div className="text-[8px] text-gray-500 truncate leading-tight">
                                          👤 {appointment.assignedUserName}
                                        </div>
                                      )}
                                      {appointment.archType ? (
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                          {appointment.archType === 'Dual' ? (
                                            <>
                                              <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1 text-[7px] font-medium leading-none w-fit max-w-full truncate">
                                                U: {getSubtypeLabel(appointment.upperArchSubtype || '')}
                                              </span>
                                              <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1 text-[7px] font-medium leading-none w-fit max-w-full truncate mt-0.5">
                                                L: {getSubtypeLabel(appointment.lowerArchSubtype || '')}
                                              </span>
                                            </>
                                          ) : (
                                            <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1 text-[7px] font-medium leading-none w-fit max-w-full truncate">
                                              {appointment.archType === 'Upper' ? 'U' : 'L'}: {getSubtypeLabel(appointment.archType === 'Upper' ? appointment.upperArchSubtype || '' : appointment.lowerArchSubtype || '')}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        appointment.subtype && getSubtypeLabel(appointment.subtype) && (
                                          <div className="mt-0.5">
                                            <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1 text-[7px] font-medium leading-none w-fit max-w-full truncate">
                                              {getSubtypeLabel(appointment.subtype)}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                    {/* Bottom row - Time and badge */}
                                    <div className="flex items-end justify-between gap-0.5 mt-auto">
                                      <div className="flex flex-col items-start leading-[0.8]">
                                        <span className={`${timeFontSize} text-gray-600 whitespace-nowrap`}>
                                          {formatAppointmentTime(appointment.startTime)}
                                        </span>
                                        <span className={`${timeFontSize} text-gray-600 whitespace-nowrap`}>
                                          {formatAppointmentTime(appointment.endTime)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {appointment.isEmergency && (
                                          <span className="inline-flex items-center justify-center w-3 h-3 text-[8px] font-bold text-white bg-red-600 rounded-full" title="Emergency">
                                            E
                                          </span>
                                        )}
                                        <span className={`inline-flex items-center justify-center w-3 h-3 text-[8px] font-bold text-white rounded-full uppercase ${actualTypeColors.badgeColor || 'bg-gray-500'}`}>
                                          {firstLetter}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                // Layout for 30-minute and longer appointments
                                return (
                                  <div className="flex flex-col h-full justify-between">
                                    {/* Top section - Name and status code */}
                                    <div className="flex flex-col gap-0">
                                      <div className="flex items-start justify-between gap-1 border-b border-black/5 pb-[1px] mb-[1px]">
                                        <h4
                                          className="font-semibold text-[11px] text-gray-800 whitespace-normal break-words line-clamp-2 flex-1 underline cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                                          onClick={(e) => {
                                            console.log('30+ minute appointment patient name clicked');
                                            e.stopPropagation();
                                            handlePatientNameClick(appointment);
                                          }}
                                        >
                                          {appointment.patient}
                                        </h4>
                                        {/* Removed Status Code Badge */}
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        {appointment.assignedUserName && (
                                          <div className="text-[9px] text-gray-500 truncate leading-tight">
                                            👤 {appointment.assignedUserName}
                                          </div>
                                        )}
                                        {appointment.archType ? (
                                          <div className="flex flex-col gap-1 mt-1">
                                            {appointment.archType === 'Dual' ? (
                                              <>
                                                <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5 text-[8px] font-semibold leading-none w-fit max-w-full truncate">
                                                  Upper: {getSubtypeLabel(appointment.upperArchSubtype || '')}
                                                </span>
                                                <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5 text-[8px] font-semibold leading-none w-fit max-w-full truncate">
                                                  Lower: {getSubtypeLabel(appointment.lowerArchSubtype || '')}
                                                </span>
                                              </>
                                            ) : (
                                              <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5 text-[8px] font-semibold leading-none w-fit max-w-full truncate">
                                                {appointment.archType}: {getSubtypeLabel(appointment.archType === 'Upper' ? appointment.upperArchSubtype || '' : appointment.lowerArchSubtype || '')}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          appointment.subtype && getSubtypeLabel(appointment.subtype) && (
                                            <div className="mt-1">
                                              <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5 text-[8px] font-semibold leading-none w-fit max-w-full truncate">
                                                📋 {getSubtypeLabel(appointment.subtype)}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    {/* Bottom row - Badge left (adaptive), Time right (always visible) */}
                                    <div className="flex justify-between items-end gap-1 min-w-0 w-full overflow-hidden">
                                      {(() => {
                                        const columnWidth = getColumnWidth() / totalLanes;
                                        // Get the actual appointment type colors for the badge
                                        const actualTypeColors = getTypeColors(
                                          appointment.type,
                                          appointmentEncounterStatus[appointment.id] || appointment.encounterCompleted,
                                          appointment.statusCode,
                                          appointment.statusCode
                                        );
                                        const label = actualTypeColors.shortLabel || actualTypeColors.label;

                                        // Determine display text, badge size, and time size based on column width
                                        let displayText, badgeSize, badgePadding, timeFontSize;

                                        if (columnWidth >= 140) {
                                          // Wide columns - show full text
                                          displayText = label;
                                          badgeSize = 'text-[9px]';
                                          badgePadding = 'px-1 py-0';
                                          timeFontSize = 'text-[10px]';
                                        } else if (columnWidth >= 120) {
                                          // Medium columns - show full text but smaller
                                          displayText = label;
                                          badgeSize = 'text-[8px]';
                                          badgePadding = 'px-1 py-0';
                                          timeFontSize = 'text-[9px]';
                                        } else if (columnWidth >= 100) {
                                          // Narrow columns - start abbreviating "Data Collection"
                                          displayText = (label === 'Data Collection') ? 'Data' : label;
                                          badgeSize = 'text-[8px]';
                                          badgePadding = 'px-1 py-0';
                                          timeFontSize = 'text-[9px]';
                                        } else if (columnWidth >= 80) {
                                          // Very narrow - abbreviate and smaller size
                                          displayText = (label === 'Data Collection') ? 'Data' : label;
                                          badgeSize = 'text-[7px]';
                                          badgePadding = 'px-0.5 py-0';
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
                                            <div className="flex gap-1 items-center overflow-hidden">
                                              {appointment.isEmergency && (
                                                <span className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 text-center flex-shrink-0 whitespace-nowrap uppercase bg-red-600 text-white ${badgeSize} ${badgePadding}`}>
                                                  Emergency
                                                </span>
                                              )}
                                              <span className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 text-center flex-shrink-0 whitespace-nowrap uppercase ${actualTypeColors.badgeColor || 'bg-gray-100 text-gray-800'} ${badgeSize} ${badgePadding}`}>
                                                {label === 'Data Collection' ? 'Data' : displayText}
                                              </span>
                                            </div>
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
                      <ContextMenuContent className="w-56 touch-manipulation select-none">
                        {appointment.statusCode !== 'RESCH' && (
                          <>
                            <ContextMenuItem {...handleMenuItemAction(() => handleEncounterForm(appointment))}>
                              <ClipboardList className="mr-2 h-4 w-4" />
                              {appointmentEncounterStatus[appointment.id] ? 'View Encounter Form' : 'Encounter Form'}
                            </ContextMenuItem>
                            <ContextMenuItem {...handleMenuItemAction(() => handleAddNewLabScript(appointment))}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Add New Lab Script
                            </ContextMenuItem>
                          </>
                        )}
                        {appointment.statusCode !== 'CMPLT' && (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuSub>
                              <ContextMenuSubTrigger className="touch-manipulation select-none" {...handleSubMenuTrigger()}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Change Status
                              </ContextMenuSubTrigger>
                              <ContextMenuSubContent className="touch-manipulation select-none">
                                <ContextMenuItem {...handleMenuItemAction(() => handleCompleteAppointment(appointment))}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Complete Appointment
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, '?????'))}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-gray-400" />
                                  Not Confirmed
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'FIRM'))}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Appointment Confirmed
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'EFIRM'))}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                  Electronically Confirmed
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'EMER'))}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Emergency Patient
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'HERE'))}>
                                  <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                                  Patient has Arrived
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'READY'))}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                                  Ready for Operatory
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'LM1'))}>
                                  <Clock3 className="mr-2 h-4 w-4 text-yellow-600" />
                                  Left 1st Message
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'LM2'))}>
                                  <Clock3 className="mr-2 h-4 w-4 text-orange-600" />
                                  Left 2nd Message
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'MULTI'))}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-indigo-600" />
                                  Multi-Appointment
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, '2wk'))}>
                                  <Clock3 className="mr-2 h-4 w-4 text-pink-600" />
                                  2 Week Calls
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'NSHOW'))}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-700" />
                                  No Show
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleReschedule(appointment))}>
                                  <Clock className="mr-2 h-4 w-4 text-amber-600" />
                                  Reschedule Appointment
                                </ContextMenuItem>
                                <ContextMenuItem {...handleMenuItemAction(() => handleStatusChangeFromMenu(appointment.id, 'CANCL'))}>
                                  <XCircle className="mr-2 h-4 w-4 text-slate-600" />
                                  Cancel Appointment
                                </ContextMenuItem>

                              </ContextMenuSubContent>
                            </ContextMenuSub>
                          </>
                        )}
                        <ContextMenuSeparator />
                        {appointment.type === 'consultation' ? (
                          <ContextMenuItem {...handleMenuItemAction(() => handleNavigateToConsultation(appointment.id))}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Consultation
                          </ContextMenuItem>
                        ) : (
                          <ContextMenuItem {...handleMenuItemAction(() => handleViewPatientProfile(appointment))}>
                            <UserCircle className="mr-2 h-4 w-4" />
                            View Patient Profile
                          </ContextMenuItem>
                        )}
                        <ContextMenuItem {...handleMenuItemAction(() => handleViewHealthHistory(appointment))}>
                          <Heart className="mr-2 h-4 w-4" />
                          View Health History
                        </ContextMenuItem>
                        <ContextMenuItem {...handleMenuItemAction(() => handleViewComfortPreference(appointment))}>
                          <Smile className="mr-2 h-4 w-4" />
                          View Comfort Preference
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        {appointment.statusCode !== 'CMPLT' && (
                          <ContextMenuItem {...handleMenuItemAction(() => handleEditAppointment(appointment))}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Appointment
                          </ContextMenuItem>
                        )}
                        <ContextMenuItem {...handleMenuItemAction(() => handleDeleteFromMenu(appointment.id))} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Appointment
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </React.Fragment>
                );
              });
            })}
          </div>

          {/* Hour grid */}
          <div className="grid grid-cols-1 relative">
            {/* Current Time Line (EST) */}
            {(() => {
              if (!currentEstDate) return null;

              // Only show if the view date matches current EST date
              if (!isSameDay(date, currentEstDate)) return null;

              const currentHour = currentEstDate.getHours();
              const currentMinute = currentEstDate.getMinutes();

              // Check if current time is within view range (7 AM - 7 PM)
              if (currentHour >= 7 && currentHour < 19) { // 19 is 7PM, so up to 18:59 is inside the 7-7 range block roughly?
                // Wait, if grid goes TO 7 PM, usually it means 7PM is the start of the last slot?
                // If hours include 19 (7 PM), does the last block go from 7 PM to 8 PM?
                // Users usually say "7 to 7", implying 12 hours view.
                // Array [7...19] has 13 items. 7AM start -> 8PM end (19:00 start).
                // If user meant 7AM to 7PM *Visual Range*, maybe just [7...18]?
                // Detailed verification: If user says "Starts at 7 AM and till 7 PM", usually means the last hour shown is 6 PM - 7 PM, or sometimes 7 PM line is the bottom.
                // Given the array I defined [7...19], let's stick to it.
                // 19:00 is displayed as a row.

                const startHour = 7;
                const hourHeight = 200;

                const minutesFromStart = ((currentHour - startHour) * 60) + currentMinute;
                const topPosition = (minutesFromStart / 60) * hourHeight;

                return (
                  <div
                    className="absolute left-[60px] right-0 z-40 flex items-center pointer-events-none"
                    style={{ top: `${topPosition}px` }}
                  >
                    <div className="w-full border-b-2 border-blue-500 border-dashed opacity-50 shadow-sm"></div>
                    <div className="absolute right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-l-md transform -translate-y-1/2">
                      {currentHour.toString().padStart(2, '0')}:{currentMinute.toString().padStart(2, '0')}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
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


                      const isColumnDisabled = allowedAppointmentTypes && !allowedAppointmentTypes.includes(type.key);

                      return (
                        <div
                          key={type.key}
                          className={`p-2 transition-all relative ${typeIndex < appointmentTypes.length - 1 ? 'border-r border-gray-200' : ''
                            } ${hasActiveSelection
                              ? ``
                              : `cursor-pointer`
                            } ${isColumnDisabled ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''}`}
                          onMouseDown={(e) => {
                            if (isColumnDisabled) return; // Block interaction if disabled
                            // Calculate which 15-minute slot was clicked based on position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const relativeY = e.clientY - rect.top;
                            const slotHeight = rect.height / 4;
                            const slotIndex = Math.floor(relativeY / slotHeight);
                            const minute = Math.min(slotIndex * 15, 45);

                            // Allow drag start even if there's an appointment (for overlaps)
                            handleMouseDown(hour, minute, type.key, e);
                          }}
                          onTouchStart={(e) => {
                            if (isColumnDisabled) return; // Block interaction if disabled
                            // DO NOT Prevent Default here. Allow scrolling to start.

                            // Mark touch active to block ghost mouse events
                            isTouchRef.current = true;

                            const touch = e.touches[0];
                            const rect = e.currentTarget.getBoundingClientRect();
                            const relativeY = touch.clientY - rect.top;
                            // Store data for the timer callback
                            const startData = {
                              hour, minute: Math.min(Math.floor(relativeY / (rect.height / 4)) * 15, 45), typeKey: type.key,
                              clientX: touch.clientX,
                              clientY: touch.clientY,
                              target: e.currentTarget
                            };

                            // Start 1-second timer
                            holdTimerRef.current = setTimeout(() => {
                              // Timer fired! Start dragging.
                              // Now subsequent moves will need to be blocked.

                              // Execute the mouse down logic
                              // We need to reconstruct the synthetic event logic or call handleMouseDown directly
                              // Note: handleMouseDown expects a generic event mostly for stopPropagation
                              // We can pass a mock.

                              const syntheticEvent = {
                                button: 0,
                                clientX: startData.clientX,
                                clientY: startData.clientY,
                                preventDefault: () => { },
                                stopPropagation: () => { }
                              } as unknown as React.MouseEvent;

                              handleMouseDown(startData.hour, startData.minute, startData.typeKey, syntheticEvent);
                            }, 500);
                          }}
                          onTouchMove={(e) => {
                            if (isDragging) {
                              // Drag is active! Block scroll.
                              e.preventDefault();

                              const touch = e.touches[0];
                              const element = document.elementFromPoint(touch.clientX, touch.clientY);

                              if (element) {
                                const slotDiv = element.closest('[data-hour]');
                                if (slotDiv) {
                                  const h = parseInt(slotDiv.getAttribute('data-hour') || '0');
                                  const m = parseInt(slotDiv.getAttribute('data-minute') || '0');
                                  const c = slotDiv.getAttribute('data-column') || '';
                                  handleMouseEnter(h, m, c, touch.clientY);
                                }
                              }
                            } else {
                              // Not dragging yet.
                              // If user moves significantly, it's a scroll. Cancel the hold timer.
                              if (holdTimerRef.current) {
                                clearTimeout(holdTimerRef.current);
                                holdTimerRef.current = null;
                              }
                              // Allow default (scroll)
                            }
                          }}
                          onTouchEnd={(e) => {
                            // Prevent Default to stop mouse emulation (ghost clicks)
                            if (e && e.cancelable) e.preventDefault();

                            // Clear timer if it exists (user tapped or let go early)
                            if (holdTimerRef.current) {
                              clearTimeout(holdTimerRef.current);
                              holdTimerRef.current = null;
                            }

                            // Check if we were dragging
                            handleMouseUp();

                            // Reset touch ref after a short delay to ensure we block trailing mouse events
                            setTimeout(() => {
                              isTouchRef.current = false;
                            }, 500);
                          }}
                          onMouseMove={(e) => {
                            if (isDragging && dragColumn === type.key) {
                              // Check if we're hovering over an appointment area
                              const rect = e.currentTarget.getBoundingClientRect();
                              const relativeY = e.clientY - rect.top;
                              const slotHeight = rect.height / 4;
                              const slotIndex = Math.floor(relativeY / slotHeight);
                              const minute = Math.min(slotIndex * 15, 45);

                              // Allow drag update even if over an existing appointment
                              handleMouseEnter(hour, minute, type.key, e.clientY);
                            }
                          }}
                          onContextMenu={(e) => e.preventDefault()} // Block native context menu on long press
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none' // Disable iOS magnifier/callout
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
                                // Always show pointer cursor to indicate drag-to-create is possible
                                // even if the slot has an appointment (for overlaps)
                                className="absolute inset-x-0 transition-all cursor-pointer hover:bg-gray-50"
                                style={{
                                  top: `${(minute / 60) * 100}%`,
                                  height: '25%',
                                }}
                                data-hour={hour}
                                data-minute={minute}
                                data-column={type.key}
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

      {/* Only render dialogs when not in scheduler mode */}
      {
        !isSchedulerMode && (
          <>
            {/* Health History Dialog */}
            <HealthHistoryDialog
              open={healthHistoryDialogOpen}
              onOpenChange={setHealthHistoryDialogOpen}
              patientId={selectedPatientId}
              patientName={selectedPatientName}
            />

            {/* Comfort Preference Dialog */}
            <ComfortPreferenceDialog
              open={comfortPreferenceDialogOpen}
              onOpenChange={setComfortPreferenceDialogOpen}
              patientId={selectedPatientId}
              patientName={selectedPatientName}
            />

            {/* No Show Options Dialog */}
            <Dialog open={!!showNoShowDialog} onOpenChange={(open) => {
              if (!open) setShowNoShowDialog(null);
            }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>No Show Options</DialogTitle>
                  <DialogDescription>
                    How would you like to handle this no-show?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-start h-auto p-4 border-blue-200 bg-blue-50 hover:bg-blue-100"
                    onClick={() => handleNoShowOption('unscheduled')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-blue-900">
                      <ClipboardList className="h-4 w-4" />
                      Add to Unscheduled List
                    </div>
                    <span className="text-sm text-blue-700 mt-1">
                      Schedule later via Next Appointments
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col items-start h-auto p-4 border-red-200 bg-red-50 hover:bg-red-100"
                    onClick={() => handleNoShowOption('not_required')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-red-900">
                      <XCircle className="h-4 w-4" />
                      No Next Appointment Required
                    </div>
                    <span className="text-sm text-red-700 mt-1">
                      Mark as complete and finish
                    </span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog open={!!statusChangeConfirmation} onOpenChange={(open) => {
              if (!open) {
                cancelStatusChange();
              }
            }}>
              <AlertDialogContent className="touch-manipulation">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to change the status to <strong>{statusChangeConfirmation ? getStatusNameFromCode(statusChangeConfirmation.newStatus) : ''}</strong>?
                    <br /><br />
                    <span className="text-sm text-gray-600">
                      Appointment: {statusChangeConfirmation?.appointmentDetails}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelStatusChange} className="touch-manipulation">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmStatusChange} className="touch-manipulation">Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => {
              if (!open) {
                cancelDelete();
              }
            }}>
              <AlertDialogContent className="touch-manipulation">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this appointment? This action cannot be undone.
                    <br /><br />
                    <span className="text-sm text-gray-600">
                      Appointment: {deleteConfirmation?.appointmentDetails}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelDelete} className="touch-manipulation">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 touch-manipulation">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Encounter Form Missing Dialog */}
            <AlertDialog open={!!encounterFormMissingDialog} onOpenChange={(open) => {
              if (!open) {
                setEncounterFormMissingDialog(null);
              }
            }}>
              <AlertDialogContent className="touch-manipulation">
                <AlertDialogHeader>
                  <AlertDialogTitle>Encounter Form Required</AlertDialogTitle>
                  <AlertDialogDescription>
                    The encounter form must be completed before marking this appointment as complete.
                    <br /><br />
                    <span className="text-sm text-gray-600">
                      Patient: {encounterFormMissingDialog?.patientName}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEncounterFormMissingDialog(null)} className="touch-manipulation">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (encounterFormMissingDialog) {
                        // Close the dialog
                        setEncounterFormMissingDialog(null);

                        // Open encounter form
                        setTimeout(() => {
                          setEncounterAppointmentId(encounterFormMissingDialog.appointmentId);
                          setEncounterPatientName(encounterFormMissingDialog.patientName);
                          setEncounterFormDialogOpen(true);
                        }, 100);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 touch-manipulation"
                  >
                    Go to Encounter Form
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Complete Appointment Confirmation Dialog */}
            <AlertDialog open={!!nextAppointmentDialog && !showNextAppointmentForm && !showSchedulerDialog} onOpenChange={(open) => {
              console.log('First dialog onOpenChange:', { open, schedulingNextAppointment, showNextAppointmentForm, showSchedulerDialog });
              // Only reset if this dialog is actually closing (not form or scheduler open)
              if (!open && !schedulingNextAppointment && !showNextAppointmentForm && !showSchedulerDialog) {
                console.log('First dialog: RESETTING nextAppointmentDialog to null');
                setNextAppointmentDialog(null);
              }
            }}>
              <AlertDialogContent className="touch-manipulation max-w-md gap-6">
                <AlertDialogHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <AlertDialogTitle className="text-xl">Appointment Completed</AlertDialogTitle>
                      <AlertDialogDescription className="mt-1">
                        What would you like to do next?
                      </AlertDialogDescription>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full border border-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Patient</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {nextAppointmentDialog?.patientName}
                      </p>
                    </div>
                  </div>
                </AlertDialogHeader>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      if (nextAppointmentDialog) {
                        nextAppointmentPatientRef.current = {
                          patientId: nextAppointmentDialog.patientId,
                          patientName: nextAppointmentDialog.patientName,
                          currentApptId: nextAppointmentDialog.appointmentId
                        };
                      }
                      setNextAppointmentType('');
                      setNextAppointmentSubtype('');
                      setNextAppointmentDate('');
                      setNextAppointmentStartTime('');
                      setNextAppointmentEndTime('');
                      setShowNextAppointmentForm(true);
                    }}
                    disabled={schedulingNextAppointment}
                    variant="ghost"
                    className="w-full justify-between items-center h-auto py-4 px-4 bg-blue-50/80 hover:bg-blue-100 text-blue-900 border border-blue-200 shadow-sm group transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-200">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base">Schedule Next Appointment</p>
                        <p className="text-xs text-blue-600/80 font-medium">Book a follow-up visit now</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleCompleteWithoutNextAppointment}
                    disabled={schedulingNextAppointment}
                    variant="ghost"
                    className="w-full justify-between items-center h-auto py-4 px-4 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-sm group transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform duration-200">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base">Add to Unscheduled List</p>
                        <p className="text-xs text-indigo-600/80 font-medium">Schedule later via Next Appointments</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleCompleteNoNextAppointmentRequired}
                    disabled={schedulingNextAppointment}
                    variant="ghost"
                    className="w-full justify-between items-center h-auto py-4 px-4 bg-red-50/80 hover:bg-red-100 text-red-900 border border-red-200 shadow-sm group transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100 group-hover:scale-110 transition-transform duration-200">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base">No Next Appointment Required</p>
                        <p className="text-xs text-red-600/80 font-medium">Mark as complete and finish</p>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Hidden empty footer to satisfy accessibility if needed, or remove if not strictly required by component */}
                <AlertDialogFooter className="hidden" />
              </AlertDialogContent>
            </AlertDialog>

            {/* Next Appointment Details Form Dialog */}
            <AlertDialog open={showNextAppointmentForm && !showSchedulerDialog} onOpenChange={(open) => {
              console.log('Second dialog onOpenChange:', { open, showSchedulerDialog, schedulingNextAppointment });
              // Only reset if user is actually canceling, not when opening the scheduler or scheduling
              if (!open && !showSchedulerDialog && !schedulingNextAppointment) {
                console.log('Second dialog: RESETTING nextAppointmentDialog to null');
                setShowNextAppointmentForm(false);
                setNextAppointmentDialog(null);
                setNextAppointmentStartTime('');
                setNextAppointmentEndTime('');
              }
            }}>
              <AlertDialogContent className="touch-manipulation max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Next Appointment Details</AlertDialogTitle>
                  <AlertDialogDescription>
                    {nextAppointmentStartTime
                      ? 'Review the appointment details and click Schedule to confirm.'
                      : 'Select the appointment type and date, then open the calendar to schedule the time.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  {/* Patient Name - Prominently displayed */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-sm text-blue-600 font-medium">Patient</span>
                        <p className="text-lg font-semibold text-blue-900">
                          {nextAppointmentPatientRef.current.patientName || 'Unknown Patient'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Appointment Type */}
                    <div className="space-y-2">
                      <Label htmlFor="next-appointment-type">Appointment Type *</Label>
                      <Select
                        value={nextAppointmentType}
                        onValueChange={(value) => {
                          setNextAppointmentType(value);
                          setNextAppointmentSubtype(''); // Reset subtype when type changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {nextAppointmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Appointment Subtype - Conditional */}
                    {nextAppointmentType && nextAppointmentSubtypes[nextAppointmentType] && (
                      <div className="space-y-2">
                        <Label htmlFor="next-appointment-subtype">Appointment Subtype *</Label>
                        <Select
                          value={nextAppointmentSubtype}
                          onValueChange={setNextAppointmentSubtype}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subtype" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextAppointmentSubtypes[nextAppointmentType].map((subtype) => (
                              <SelectItem key={subtype.value} value={subtype.value}>
                                {subtype.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Appointment Date */}
                    <div className="space-y-2">
                      <Label htmlFor="next-appointment-date">Appointment Date *</Label>
                      <Input
                        id="next-appointment-date"
                        type="date"
                        value={nextAppointmentDate}
                        onChange={(e) => setNextAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Action Column: Time Display OR Open Calendar Button */}
                    <div className="space-y-2">
                      {/* Label - Visible for Time, Invisible spacer for Button to align layout */}
                      <Label className={!nextAppointmentStartTime && !nextAppointmentEndTime ? "invisible" : ""}>
                        {nextAppointmentStartTime && nextAppointmentEndTime ? "Selected Time" : "Action"}
                      </Label>

                      {nextAppointmentStartTime && nextAppointmentEndTime ? (
                        /* Selected Time Display */
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md h-10 w-full">
                          <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-green-800 text-sm truncate flex-1 leading-none">
                            {(() => {
                              const formatTime = (time: string) => {
                                const [hours, minutes] = time.split(':');
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                return `${displayHour}:${minutes} ${ampm}`;
                              };
                              return `${formatTime(nextAppointmentStartTime)} - ${formatTime(nextAppointmentEndTime)}`;
                            })()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                            onClick={() => {
                              setNextAppointmentStartTime('');
                              setNextAppointmentEndTime('');
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        /* Open Calendar Button */
                        <Button
                          onClick={() => {
                            if (!nextAppointmentType || !nextAppointmentDate) {
                              toast.error('Please select appointment type and date');
                              return;
                            }
                            if (nextAppointmentSubtypes[nextAppointmentType] && !nextAppointmentSubtype) {
                              toast.error('Please select appointment subtype');
                              return;
                            }
                            // Create the date object correctly with noon time to avoid timezone shifts
                            const [year, month, day] = nextAppointmentDate.split('-').map(Number);
                            const dateObj = new Date(year, month - 1, day, 12, 0, 0);

                            // It seems we rely on nextAppointmentDate string in the dialog logic?
                            // No, the dialog uses initialDate prop.
                            // But we also need to ensure the dialog opens.

                            setShowSchedulerDialog(true);
                          }}
                          disabled={!nextAppointmentType || !nextAppointmentDate || (nextAppointmentSubtypes[nextAppointmentType] && !nextAppointmentSubtype)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white touch-manipulation whitespace-nowrap"
                        >
                          Open Calendar
                        </Button>
                      )}
                    </div>


                  </div>

                  {/* Assigned User Selection */}
                  <div className="space-y-2 mt-4 border-t pt-4">
                    <Label className="text-sm font-medium text-blue-700">
                      Assign To
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Unassigned button */}
                      <Button
                        type="button"
                        variant={!nextAppointmentAssignedUserId ? "default" : "outline"}
                        className={`${!nextAppointmentAssignedUserId
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-blue-300 text-blue-700 hover:bg-blue-50"
                          }`}
                        onClick={() => setNextAppointmentAssignedUserId("")}
                        disabled={loadingUsers}
                      >
                        Unassigned
                      </Button>

                      {/* User buttons */}
                      {users.map((user) => (
                        <Button
                          key={user.id}
                          type="button"
                          variant={nextAppointmentAssignedUserId === user.id ? "default" : "outline"}
                          className={`${nextAppointmentAssignedUserId === user.id
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border-blue-300 text-blue-700 hover:bg-blue-50"
                            }`}
                          onClick={() => setNextAppointmentAssignedUserId(user.id)}
                          disabled={loadingUsers}
                        >
                          {user.full_name}
                        </Button>
                      ))}

                      {users.length === 0 && !loadingUsers && (
                        <p className="text-sm text-gray-500 col-span-4">No users found</p>
                      )}

                      {loadingUsers && (
                        <p className="text-sm text-gray-500 col-span-4">Loading users...</p>
                      )}
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNextAppointmentForm(false);
                      setNextAppointmentDialog(null);
                      setNextAppointmentStartTime('');
                      setNextAppointmentEndTime('');
                    }}
                    className="touch-manipulation"
                  >
                    Cancel
                  </Button>

                  {/* Show Schedule button only when time is selected */}
                  {nextAppointmentStartTime && nextAppointmentEndTime && (
                    <Button
                      onClick={() => handleCreateNextAppointment()}
                      disabled={schedulingNextAppointment}
                      className="bg-green-600 hover:bg-green-700 text-white touch-manipulation"
                    >
                      {schedulingNextAppointment ? 'Scheduling...' : 'Schedule Appointment'}
                    </Button>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Appointment Scheduler Dialog */}
            <AppointmentSchedulerDialog
              open={showSchedulerDialog}
              onOpenChange={(open) => {
                setShowSchedulerDialog(open);
                // When closing scheduler, just go back to form (don't reset everything)
                // The form will handle final cleanup when user cancels there
              }}
              patientName={nextAppointmentDialog?.patientName || ''}
              patientId={nextAppointmentDialog?.patientId || ''}
              initialDate={nextAppointmentDate ? (() => {
                const [year, month, day] = nextAppointmentDate.split('-').map(Number);
                const date = new Date(year, month - 1, day, 12, 0, 0); // Noon to avoid timezone shifts
                return date;
              })() : undefined}
              appointmentType={nextAppointmentType}
              appointmentSubtype={nextAppointmentSubtype}
              onSchedule={handleTimeSelected}
            />

            {/* Reschedule Dialog */}
            {rescheduleDialog && (
              <AppointmentSchedulerDialog
                open={rescheduleDialog.open}
                onOpenChange={(open) => {
                  if (!open) setRescheduleDialog(null);
                }}
                patientName={rescheduleDialog.appointment.patient}
                patientId={rescheduleDialog.appointment.patientId || ''}
                initialDate={new Date(date)} // Default to current view date
                appointmentType={rescheduleDialog.appointment.type}
                appointmentSubtype={rescheduleDialog.appointment.subtype}
                onSchedule={handleRescheduleConfirm}
              />
            )}

            {/* Encounter Form Dialog */}
            <EncounterFormDialog
              open={encounterFormDialogOpen}
              onOpenChange={setEncounterFormDialogOpen}
              patientName={encounterPatientName}
              appointmentId={encounterAppointmentId}
              isViewMode={appointmentEncounterStatus[encounterAppointmentId]}
              onEncounterSaved={() => {
                // Refresh encounter status after saving
                const appointmentIds = appointments.map(apt => apt.id);
                if (appointmentIds.length > 0) {
                  checkEncounterStatus(appointmentIds);
                }
              }}
            />

            {/* Lab Script Form Dialog */}
            <NewLabScriptForm
              open={labScriptFormOpen}
              onClose={() => setLabScriptFormOpen(false)}
              onSubmit={handleLabScriptSubmit}
              initialPatientName={labScriptPatientName}
            />
          </>
        )
      }
    </div >
  );
}
);
DayView.displayName = 'DayView';
