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
  subtype?: string; // Appointment subtype (e.g., '7-day-followup', '82-day-appliance-delivery')
  status: string; // Full status name (e.g., "Ready for Operatory")
  statusCode: '?????' | 'FIRM' | 'EFIRM' | 'EMER' | 'HERE' | 'READY' | 'LM1' | 'LM2' | 'MULTI' | '2wk' | 'NSHOW' | 'RESCH' | 'CANCL' | 'CMPLT'; // Status code
  date: string; // YYYY-MM-DD format
  notes?: string;
  encounterCompleted?: boolean; // Whether encounter form has been completed
  encounterCompletedAt?: string; // When encounter was completed
  encounterCompletedBy?: string; // User who completed the encounter
  createdAt: string;
  updatedAt: string;
  nextAppointmentScheduled?: boolean;
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
  nextAppointmentType?: string;
  nextAppointmentSubtype?: string;
  isEmergency?: boolean;
}

// Helper function to map status code to full status name
export function getStatusNameFromCode(statusCode: Appointment['statusCode']): string {
  switch (statusCode) {
    case '?????':
      return 'Not Confirmed';
    case 'FIRM':
      return 'Appointment Confirmed';
    case 'EFIRM':
      return 'Electronically Confirmed';
    case 'EMER':
      return 'Emergency Patient';
    case 'HERE':
      return 'Patient has Arrived';
    case 'READY':
      return 'Ready for Operatory';
    case 'LM1':
      return 'Left 1st Message';
    case 'LM2':
      return 'Left 2nd Message';
    case 'MULTI':
      return 'Multi-Appointment';
    case '2wk':
      return '2 Week Calls';
    case 'NSHOW':
      return 'No Show';
    case 'RESCH':
      return 'Appointment Rescheduled';
    case 'CANCL':
      return 'Appointment Cancelled';
    case 'CMPLT':
      return 'Appointment Completed';
    default:
      return 'Not Confirmed';
  }
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
      const transformedAppointments: Appointment[] = ((data || []) as any[]).map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        patient: appointment.patient_name,
        patientId: appointment.patient_id || undefined,
        assignedUserId: appointment.assigned_user_id || undefined,
        assignedUserName: appointment.assigned_user?.full_name || undefined,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        type: appointment.appointment_type,
        subtype: appointment.subtype || undefined,
        status: appointment.status || 'Not Confirmed',
        statusCode: appointment.status_code as Appointment['statusCode'],
        date: appointment.date,
        notes: appointment.notes || undefined,
        encounterCompleted: appointment.encounter_completed || false,
        encounterCompletedAt: appointment.encounter_completed_at || undefined,
        encounterCompletedBy: appointment.encounter_completed_by || undefined,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        nextAppointmentScheduled: appointment.next_appointment_scheduled || false,
        nextAppointmentDate: appointment.next_appointment_date || undefined,
        nextAppointmentTime: appointment.next_appointment_time || undefined,
        nextAppointmentType: appointment.next_appointment_type || undefined,
        nextAppointmentSubtype: appointment.next_appointment_subtype || undefined,
        isEmergency: appointment.is_emergency || false
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
          async (payload) => {
            console.log('🔄 Real-time appointment change received:', payload.eventType, payload);

            // Handle different types of changes efficiently
            if (payload.eventType === 'INSERT' && payload.new) {
              // Fetch assigned user name if assigned_user_id exists
              let assignedUserName: string | undefined = undefined;
              if (payload.new.assigned_user_id) {
                try {
                  const { data: userData } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', payload.new.assigned_user_id)
                    .single();
                  assignedUserName = userData?.full_name || undefined;
                } catch (err) {
                  console.error('Error fetching user name:', err);
                }
              }

              // Transform new appointment data to match our interface
              const newAppointment: Appointment = {
                id: payload.new.id,
                title: payload.new.title,
                patient: payload.new.patient_name,
                patientId: payload.new.patient_id || undefined,
                assignedUserId: payload.new.assigned_user_id || undefined,
                assignedUserName: assignedUserName,
                startTime: payload.new.start_time,
                endTime: payload.new.end_time,
                type: payload.new.appointment_type,
                subtype: payload.new.subtype || undefined,
                status: payload.new.status || 'Not Confirmed',
                statusCode: payload.new.status_code as Appointment['statusCode'],
                date: payload.new.date,
                notes: payload.new.notes || undefined,
                encounterCompleted: payload.new.encounter_completed || false,
                encounterCompletedAt: payload.new.encounter_completed_at || undefined,
                encounterCompletedBy: payload.new.encounter_completed_by || undefined,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at,
                isEmergency: payload.new.is_emergency || false
              };

              // Add new appointment to existing list
              console.log('🔔 Real-time INSERT - New appointment:', newAppointment);
              setAppointments(prev => {
                // Check if appointment already exists to avoid duplicates
                if (prev.some(apt => apt.id === newAppointment.id)) {
                  console.log('⚠️ Appointment already exists, skipping duplicate');
                  return prev;
                }
                // Insert in correct position based on date and time
                const newList = [...prev, newAppointment];
                console.log('📋 Appointments after real-time INSERT:', newList.length, 'appointments');
                return newList.sort((a, b) => {
                  if (a.date === b.date) {
                    return a.startTime.localeCompare(b.startTime);
                  }
                  return a.date.localeCompare(b.date);
                });
              });

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              // Fetch assigned user name if assigned_user_id exists
              let assignedUserName: string | undefined = undefined;
              if (payload.new.assigned_user_id) {
                try {
                  const { data: userData } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', payload.new.assigned_user_id)
                    .single();
                  assignedUserName = userData?.full_name || undefined;
                } catch (err) {
                  console.error('Error fetching user name:', err);
                }
              }

              // Transform updated appointment data
              const updatedAppointment: Appointment = {
                id: payload.new.id,
                title: payload.new.title,
                patient: payload.new.patient_name,
                patientId: payload.new.patient_id || undefined,
                assignedUserId: payload.new.assigned_user_id || undefined,
                assignedUserName: assignedUserName,
                startTime: payload.new.start_time,
                endTime: payload.new.end_time,
                type: payload.new.appointment_type,
                subtype: payload.new.subtype || undefined,
                status: payload.new.status || 'Not Confirmed',
                statusCode: payload.new.status_code as Appointment['statusCode'],
                date: payload.new.date,
                notes: payload.new.notes || undefined,
                encounterCompleted: payload.new.encounter_completed || false,
                encounterCompletedAt: payload.new.encounter_completed_at || undefined,
                encounterCompletedBy: payload.new.encounter_completed_by || undefined,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at,
                isEmergency: payload.new.is_emergency || false
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
      assignedUserId: appointmentData.assignedUserId,
      assignedUserName: appointmentData.assignedUserName,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      type: appointmentData.type,
      subtype: appointmentData.subtype,
      status: appointmentData.status,
      statusCode: appointmentData.statusCode,
      date: appointmentData.date,
      notes: appointmentData.notes || undefined,
      isEmergency: appointmentData.isEmergency || false,
      createdAt: now,
      updatedAt: now
    };

    console.log('🚀 Creating optimistic appointment:', optimisticAppointment);

    // Immediately add to local state for instant UI update
    setAppointments(prev => {
      const newList = [...prev, optimisticAppointment];
      console.log('📋 Appointments after optimistic add:', newList.length, 'appointments');
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
          subtype: appointmentData.subtype || null,
          status: appointmentData.status,
          status_code: appointmentData.statusCode,
          date: appointmentData.date,
          notes: appointmentData.notes || null,
          is_emergency: appointmentData.isEmergency || false
        }])
        .select()
        .single();

      const responseData = data as any; // Cast to any to handle Supabase type mismatches

      if (error) {
        throw error;
      }

      // Fetch assigned user name if assigned_user_id exists
      let assignedUserName: string | undefined = undefined;
      if (responseData.assigned_user_id) {
        try {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', responseData.assigned_user_id)
            .single();
          assignedUserName = userData?.full_name || undefined;
        } catch (err) {
          console.error('Error fetching user name:', err);
        }
      }

      // Transform the returned data to match our interface
      const newAppointment: Appointment = {
        id: responseData.id,
        title: responseData.title,
        patient: responseData.patient_name,
        patientId: responseData.patient_id || undefined,
        assignedUserId: responseData.assigned_user_id || undefined,
        assignedUserName: assignedUserName,
        startTime: responseData.start_time,
        endTime: responseData.end_time,
        type: responseData.appointment_type,
        subtype: responseData.subtype || undefined,
        status: responseData.status || 'Not Confirmed',
        statusCode: responseData.status_code as Appointment['statusCode'],
        date: responseData.date,
        notes: responseData.notes || undefined,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at,
        isEmergency: responseData.is_emergency || false
      };

      // Replace the optimistic appointment with the real one
      console.log('✅ Replacing optimistic appointment', tempId, 'with real appointment', newAppointment.id);
      setAppointments(prev => {
        const updated = prev.map(apt =>
          apt.id === tempId ? newAppointment : apt
        ).sort((a, b) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });
        console.log('📋 Appointments after replacement:', updated.length, 'appointments');
        console.log('📋 Appointment types:', updated.map(a => `${a.type} (${a.id})`));
        return updated;
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
      if (updates.subtype !== undefined) updateData.subtype = updates.subtype || null;
      if (updates.status) updateData.status = updates.status;
      if (updates.statusCode) {
        updateData.status_code = updates.statusCode;
        updateData.status = getStatusNameFromCode(updates.statusCode);
      }
      if (updates.date) updateData.date = updates.date;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.isEmergency !== undefined) updateData.is_emergency = updates.isEmergency;

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


      const responseData = data as any;

      // Fetch assigned user name if assigned_user_id exists
      let assignedUserName: string | undefined = undefined;
      if (responseData.assigned_user_id) {
        try {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', responseData.assigned_user_id)
            .single();
          assignedUserName = userData?.full_name || undefined;
        } catch (err) {
          console.error('Error fetching user name:', err);
        }
      }

      // Transform the returned data to match our interface
      const updatedAppointment: Appointment = {
        id: responseData.id,
        title: responseData.title,
        patient: responseData.patient_name,
        patientId: responseData.patient_id || undefined,
        assignedUserId: responseData.assigned_user_id || undefined,
        assignedUserName: assignedUserName,
        startTime: responseData.start_time,
        endTime: responseData.end_time,
        type: responseData.appointment_type,
        subtype: responseData.subtype || undefined,
        status: responseData.status || 'Not Confirmed',
        statusCode: responseData.status_code as Appointment['statusCode'],
        date: responseData.date,
        notes: responseData.notes || undefined,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at,
        isEmergency: responseData.is_emergency || false
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
