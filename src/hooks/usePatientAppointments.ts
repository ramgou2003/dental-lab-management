import { useState, useEffect } from 'react';
import { useAppointments, type Appointment } from './useAppointments';

export function usePatientAppointments(patientName?: string) {
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (patientName && appointments.length > 0) {
      // Filter appointments for this specific patient by exact name match
      const filtered = appointments.filter(appointment =>
        appointment.patient && appointment.patient.toLowerCase() === patientName.toLowerCase()
      );
      setPatientAppointments(filtered);
    } else {
      setPatientAppointments([]);
    }
  }, [patientName, appointments]);

  return {
    appointments: patientAppointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
}
