import { Calendar, Clock, CheckCircle, AlertCircle, Users } from "lucide-react";
import type { Appointment } from "@/hooks/useAppointments";

interface CalendarStatsProps {
  appointments: Appointment[];
  currentDate: Date;
}

export function CalendarStats({ appointments, currentDate }: CalendarStatsProps) {
  const getDateRange = () => {
    const dayStr = currentDate.toISOString().split('T')[0];
    return { start: dayStr, end: dayStr };
  };

  const { start, end } = getDateRange();
  const periodAppointments = appointments.filter(apt => apt.date >= start && apt.date <= end);

  const stats = {
    total: periodAppointments.length,
    scheduled: periodAppointments.filter(apt => apt.status === 'scheduled').length,
    confirmed: periodAppointments.filter(apt => apt.status === 'confirmed').length,
    completed: periodAppointments.filter(apt => apt.status === 'completed').length,
    cancelled: periodAppointments.filter(apt => apt.status === 'cancelled').length,
    patients: new Set(periodAppointments.map(apt => apt.patient)).size
  };

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'text-gray-600 bg-gray-100'
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-gray-600 bg-gray-100'
    },
    {
      label: 'Patients',
      value: stats.patients,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-100'
    }
  ];

  const getPeriodLabel = () => {
    return 'Today';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          {getPeriodLabel()} Overview
        </h3>
        
        <div className="flex items-center space-x-6">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {item.value}
                </div>
                <div className="text-xs text-gray-600">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
