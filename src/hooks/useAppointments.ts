import { useState, useEffect } from 'react';

export interface Appointment {
  id: string;
  title: string;
  patient: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date: string; // YYYY-MM-DD format
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for demonstration
const mockAppointments: Appointment[] = [
  {
    id: 'apt_1',
    title: 'Dental Cleaning',
    patient: 'Emily Johnson',
    startTime: '09:00',
    endTime: '09:30',
    type: 'cleaning',
    status: 'confirmed',
    date: '2025-01-20',
    notes: 'Regular cleaning appointment. Patient has no allergies.',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'apt_2',
    title: 'Root Canal Consultation',
    patient: 'Michael Chen',
    startTime: '10:30',
    endTime: '11:30',
    type: 'consultation',
    status: 'scheduled',
    date: '2025-01-20',
    notes: 'Patient experiencing pain in upper left molar. X-rays needed.',
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z'
  },
  {
    id: 'apt_3',
    title: 'Crown Fitting',
    patient: 'Sarah Williams',
    startTime: '14:00',
    endTime: '15:00',
    type: 'crown',
    status: 'confirmed',
    date: '2025-01-20',
    notes: 'Final crown fitting for tooth #14. Crown ready for placement.',
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z'
  },
  {
    id: 'apt_4',
    title: 'Orthodontic Check-up',
    patient: 'David Brown',
    startTime: '15:30',
    endTime: '16:00',
    type: 'orthodontics',
    status: 'scheduled',
    date: '2025-01-21',
    notes: 'Monthly braces adjustment. Patient reports no issues.',
    createdAt: '2025-01-15T13:00:00Z',
    updatedAt: '2025-01-15T13:00:00Z'
  },
  {
    id: 'apt_5',
    title: 'Emergency Visit',
    patient: 'Lisa Anderson',
    startTime: '11:00',
    endTime: '11:30',
    type: 'emergency',
    status: 'completed',
    date: '2025-01-19',
    notes: 'Emergency visit for broken tooth. Temporary filling applied.',
    createdAt: '2025-01-19T09:00:00Z',
    updatedAt: '2025-01-19T11:30:00Z'
  },
  {
    id: 'apt_6',
    title: 'Implant Consultation',
    patient: 'Robert Taylor',
    startTime: '09:30',
    endTime: '10:30',
    type: 'consultation',
    status: 'scheduled',
    date: '2025-01-22',
    notes: 'Consultation for dental implant. Patient missing tooth #19.',
    createdAt: '2025-01-16T14:00:00Z',
    updatedAt: '2025-01-16T14:00:00Z'
  },
  {
    id: 'apt_7',
    title: 'Filling Replacement',
    patient: 'Jennifer Davis',
    startTime: '13:00',
    endTime: '13:30',
    type: 'filling',
    status: 'confirmed',
    date: '2025-01-22',
    notes: 'Replace old amalgam filling with composite. Tooth #12.',
    createdAt: '2025-01-16T15:00:00Z',
    updatedAt: '2025-01-16T15:00:00Z'
  },
  {
    id: 'apt_8',
    title: 'Follow-up Exam',
    patient: 'Mark Wilson',
    startTime: '16:00',
    endTime: '16:30',
    type: 'follow-up',
    status: 'scheduled',
    date: '2025-01-23',
    notes: 'Post-surgery follow-up. Check healing progress.',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z'
  }
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading appointments from an API
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load from localStorage or start with empty array
        const stored = localStorage.getItem('appointments');
        if (stored) {
          setAppointments(JSON.parse(stored));
        } else {
          setAppointments([]);
          localStorage.setItem('appointments', JSON.stringify([]));
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load appointments');
        console.error('Error loading appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAppointments = [...appointments, newAppointment];
    saveAppointments(updatedAppointments);
    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id
        ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
        : apt
    );
    saveAppointments(updatedAppointments);
  };

  const deleteAppointment = (id: string) => {
    const updatedAppointments = appointments.filter(apt => apt.id !== id);
    saveAppointments(updatedAppointments);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const getAppointmentsByDateRange = (startDate: string, endDate: string) => {
    return appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
  };

  const getAppointmentsByStatus = (status: Appointment['status']) => {
    return appointments.filter(apt => apt.status === status);
  };

  const searchAppointments = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return appointments.filter(apt =>
      apt.title.toLowerCase().includes(lowercaseQuery) ||
      apt.patient.toLowerCase().includes(lowercaseQuery) ||
      apt.type.toLowerCase().includes(lowercaseQuery) ||
      apt.notes?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getUpcomingAppointments = (limit?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments
      .filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed')
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.date.localeCompare(b.date);
      });
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  };

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsByDate(today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByDateRange,
    getAppointmentsByStatus,
    searchAppointments,
    getUpcomingAppointments,
    getTodaysAppointments
  };
}
