import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  title: string;
  patient: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch appointments from Supabase
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
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
      subscription = supabase
        .channel('appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            console.log('🔄 Real-time appointment change received:', payload.eventType, payload);
            // Refetch data when changes occur to ensure all devices stay in sync
            fetchAppointments();
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
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_name: appointmentData.patient,
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

      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      // Real-time subscription will handle state updates automatically
      return data;
    } catch (err) {
      console.error('Error adding appointment:', err);
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
      // Prepare the update data for Supabase
      const updateData: any = {};
      if (updates.patient) updateData.patient_name = updates.patient;
      if (updates.title) updateData.title = updates.title;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.type) updateData.appointment_type = updates.type;
      if (updates.status) updateData.status = updates.status;
      if (updates.date) updateData.date = updates.date;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      // Real-time subscription will handle state updates automatically
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

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });

      // Real-time subscription will handle state updates automatically
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
