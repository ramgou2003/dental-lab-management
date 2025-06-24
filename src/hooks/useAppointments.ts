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

  // Load appointments from Supabase
  useEffect(() => {
    const loadAppointments = async () => {
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

        setAppointments(transformedAppointments);
        setError(null);
      } catch (err) {
        setError('Failed to load appointments');
        console.error('Error loading appointments:', err);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
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

      // Transform the returned data to match our interface
      const newAppointment: Appointment = {
        id: data.id,
        title: data.title,
        patient: data.patient_name,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.appointment_type,
        status: data.status as Appointment['status'],
        date: data.date,
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Update local state
      setAppointments(prev => [...prev, newAppointment]);

      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      return newAppointment;
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

      // Transform the returned data
      const updatedAppointment: Appointment = {
        id: data.id,
        title: data.title,
        patient: data.patient_name,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.appointment_type,
        status: data.status as Appointment['status'],
        date: data.date,
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Update local state
      setAppointments(prev => prev.map(apt => apt.id === id ? updatedAppointment : apt));

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

      // Update local state
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
