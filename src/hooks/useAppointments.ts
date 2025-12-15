import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  title: string;
  patient: string;
  patientId?: string; // Add patient ID field
  assignedUserId?: string; // Add assigned user ID field
  assignedUserName?: string; // Add assigned user name field
  startTime: string;
  endTime: string;
  type: string;
  status: 'pending' | 'confirmed' | 'not-confirmed' | 'completed' | 'cancelled';
  date: string; // YYYY-MM-DD format
  notes?: string;
  createdAt: string;
  updatedAt: string;
}



export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for faster UI
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch appointments from Supabase
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          assigned_user:user_profiles!assigned_user_id(full_name)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform Supabase data to match our Appointment interface
      const transformedAppointments: Appointment[] = (data || []).map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        patient: appointment.patient_name,
        patientId: appointment.patient_id || undefined,
        assignedUserId: appointment.assigned_user_id || undefined,
        assignedUserName: appointment.assigned_user?.full_name || undefined,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        type: appointment.appointment_type,
        status: appointment.status as Appointment['status'],
        date: appointment.date,
        notes: appointment.notes || undefined,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }));

      console.log(`📅 Fetched ${transformedAppointments.length} appointments from database`);
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('❌ Error loading appointments:', err);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load appointments and set up real-time subscription
  useEffect(() => {
    fetchAppointments();

    // Subscribe to real-time changes only if supabase.channel is available
    let subscription: any = null;

    if (typeof supabase.channel === 'function') {
      // Create a unique channel name to avoid conflicts
      const channelName = `appointments_changes_${Math.random().toString(36).substr(2, 9)}`;
      subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            console.log('🔄 Real-time appointment change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Transform new appointment data to match our interface
              const newAppointment: Appointment = {
                id: payload.new.id,
                title: payload.new.title,
                patient: payload.new.patient_name,
                patientId: payload.new.patient_id || undefined,
                assignedUserId: payload.new.assigned_user_id || undefined,
                assignedUserName: undefined, // Will be fetched on next refresh
                startTime: payload.new.start_time,
                endTime: payload.new.end_time,
                type: payload.new.appointment_type,
                status: payload.new.status as Appointment['status'],
                date: payload.new.date,
                notes: payload.new.notes || undefined,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at
              };

              // Add new appointment to existing list
              setAppointments(prev => {
                // Check if appointment already exists to avoid duplicates
                if (prev.some(apt => apt.id === newAppointment.id)) {
                  return prev;
                }
                // Insert in correct position based on date and time
                const newList = [...prev, newAppointment];
                return newList.sort((a, b) => {
                  if (a.date === b.date) {
                    return a.startTime.localeCompare(b.startTime);
                  }
                  return a.date.localeCompare(b.date);
                });
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Transform updated appointment data
              const updatedAppointment: Appointment = {
                id: payload.new.id,
                title: payload.new.title,
                patient: payload.new.patient_name,
                patientId: payload.new.patient_id || undefined,
                assignedUserId: payload.new.assigned_user_id || undefined,
                assignedUserName: undefined, // Will be fetched on next refresh
                startTime: payload.new.start_time,
                endTime: payload.new.end_time,
                type: payload.new.appointment_type,
                status: payload.new.status as Appointment['status'],
                date: payload.new.date,
                notes: payload.new.notes || undefined,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at
              };

              // Update specific appointment in the list
              setAppointments(prev => {
                const newList = prev.map(apt =>
                  apt.id === updatedAppointment.id ? updatedAppointment : apt
                );
                // Re-sort in case date/time changed
                return newList.sort((a, b) => {
                  if (a.date === b.date) {
                    return a.startTime.localeCompare(b.startTime);
                  }
                  return a.date.localeCompare(b.date);
                });
              });

            } else if (payload.eventType === 'DELETE' && payload.old) {
              // Remove deleted appointment from the list
              setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Appointments real-time subscription status:', status);
        });
    } else {
      console.warn('⚠️ Supabase real-time not available - appointments will not update in real-time');
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [toast]);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Generate a temporary ID for optimistic update
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create optimistic appointment object
    const optimisticAppointment: Appointment = {
      id: tempId,
      title: appointmentData.title,
      patient: appointmentData.patient,
      patientId: appointmentData.patientId,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      type: appointmentData.type,
      status: appointmentData.status,
      date: appointmentData.date,
      notes: appointmentData.notes || undefined,
      createdAt: now,
      updatedAt: now
    };

    // Immediately add to local state for instant UI update
    setAppointments(prev => {
      const newList = [...prev, optimisticAppointment];
      return newList.sort((a, b) => {
        if (a.date === b.date) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.date.localeCompare(b.date);
      });
    });

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_name: appointmentData.patient,
          patient_id: appointmentData.patientId || null,
          assigned_user_id: appointmentData.assignedUserId || null,
          title: appointmentData.title,
          start_time: appointmentData.startTime,
          end_time: appointmentData.endTime,
          appointment_type: appointmentData.type,
          status: appointmentData.status,
          date: appointmentData.date,
          notes: appointmentData.notes || null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform the returned data to match our interface
      const newAppointment: Appointment = {
        id: data.id,
        title: data.title,
        patient: data.patient_name,
        patientId: data.patient_id || undefined,
        assignedUserId: data.assigned_user_id || undefined,
        assignedUserName: undefined, // Will be fetched on next refresh
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.appointment_type,
        status: data.status as Appointment['status'],
        date: data.date,
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Replace the optimistic appointment with the real one
      setAppointments(prev => {
        return prev.map(apt =>
          apt.id === tempId ? newAppointment : apt
        ).sort((a, b) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });
      });

      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      return newAppointment;
    } catch (err) {
      console.error('Error adding appointment:', err);

      // Remove the optimistic appointment on error
      setAppointments(prev => prev.filter(apt => apt.id !== tempId));

      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      console.log('🔄 updateAppointment called with:', { id, updates });

      // Prepare the update data for Supabase
      const updateData: any = {};
      if (updates.patient) updateData.patient_name = updates.patient;
      if (updates.patientId !== undefined) updateData.patient_id = updates.patientId || null;
      if (updates.assignedUserId !== undefined) updateData.assigned_user_id = updates.assignedUserId || null;
      if (updates.title) updateData.title = updates.title;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.type) updateData.appointment_type = updates.type;
      if (updates.status) updateData.status = updates.status;
      if (updates.date) updateData.date = updates.date;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      console.log('📤 Sending update to database:', updateData);

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform the returned data to match our interface
      const updatedAppointment: Appointment = {
        id: data.id,
        title: data.title,
        patient: data.patient_name,
        patientId: data.patient_id || undefined,
        assignedUserId: data.assigned_user_id || undefined,
        assignedUserName: undefined, // Will be fetched on next refresh
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.appointment_type,
        status: data.status as Appointment['status'],
        date: data.date,
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Immediately update local state for the user who updated it
      setAppointments(prev => {
        const newList = prev.map(apt =>
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        );
        // Re-sort in case date/time changed
        return newList.sort((a, b) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });
      });

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Immediately update local state for the user who deleted it
      setAppointments(prev => prev.filter(apt => apt.id !== id));

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
      throw err;
    }
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
