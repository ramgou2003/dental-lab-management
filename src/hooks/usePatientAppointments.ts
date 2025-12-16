import { useState, useEffect } from 'react';
import { useAppointments, type Appointment } from './useAppointments';

export function usePatientAppointments(patientId?: string) {
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (patientId && appointments.length > 0) {
      // Filter appointments for this specific patient by patient_id
      const filtered = appointments.filter(appointment =>
        appointment.patientId === patientId
      );
      setPatientAppointments(filtered);
    } else {
      setPatientAppointments([]);
    }
  }, [patientId, appointments]);

  return {
    appointments: patientAppointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
}
