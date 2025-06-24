
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { useAppointments } from "@/hooks/useAppointments";
import { useLabScripts } from "@/hooks/useLabScripts";
import { useManufacturingItems } from "@/hooks/useManufacturingItems";
import { useDeliveryItems } from "@/hooks/useDeliveryItems";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import {
  Users,
  Calendar,
  Factory,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  Award
} from "lucide-react";

export function DashboardPage() {
  const { appointments } = useAppointments();
  const { labScripts } = useLabScripts();
  const { manufacturingItems } = useManufacturingItems();
  const { deliveryItems } = useDeliveryItems();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*');

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Calculate metrics
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(apt =>
    apt.date === new Date().toISOString().split('T')[0]
  ).length;
  const pendingLabScripts = labScripts.filter(script => script.status === 'pending').length;
  const activeManufacturing = manufacturingItems.filter(item =>
    ['printing', 'milling', 'inspection'].includes(item.status)
  ).length;
  const readyForDelivery = deliveryItems.filter(item =>
    item.delivery_status === 'ready-for-delivery'
  ).length;

  // Appointment status distribution
  const appointmentStatusData = [
    { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#10B981' },
    { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#F59E0B' },
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#6366F1' },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#EF4444' }
  ];

  // Manufacturing pipeline data
  const manufacturingPipelineData = [
    { name: 'New Scripts', value: labScripts.filter(s => s.status === 'pending').length },
    { name: 'Printing', value: manufacturingItems.filter(m => m.status === 'printing').length },
    { name: 'Milling', value: manufacturingItems.filter(m => m.status === 'milling').length },
    { name: 'Inspection', value: manufacturingItems.filter(m => m.status === 'inspection').length },
    { name: 'Ready', value: deliveryItems.filter(d => d.delivery_status === 'ready-for-delivery').length },
    { name: 'Delivered', value: deliveryItems.filter(d => d.delivery_status === 'delivered').length }
  ];

  // Weekly appointment trends (last 7 days)
  const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      day: dayName,
      appointments: appointments.filter(apt => apt.date === dateStr).length,
      completed: appointments.filter(apt => apt.date === dateStr && apt.status === 'completed').length
    };
  });

  // Treatment type distribution
  const treatmentTypes = [
    { name: 'Consultation', value: appointments.filter(a => a.type === 'consultation').length, color: '#8B5CF6' },
    { name: 'Surgery', value: appointments.filter(a => a.type === 'surgery').length, color: '#EF4444' },
    { name: 'Follow-up', value: appointments.filter(a => a.type === 'follow-up').length, color: '#10B981' },
    { name: 'Data Collection', value: appointments.filter(a => a.type === 'data-collection').length, color: '#F59E0B' },
    { name: 'Try-in', value: appointments.filter(a => a.type === 'printed-try-in').length, color: '#06B6D4' }
  ];

  // Key metrics cards data
  const keyMetrics = [
    {
      title: "Total Patients",
      value: totalPatients,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      change: "+5",
      trend: "up",
      icon: Calendar,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Active Manufacturing",
      value: activeManufacturing,
      change: "-2",
      trend: "down",
      icon: Factory,
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "Ready for Delivery",
      value: readyForDelivery,
      change: "+8",
      trend: "up",
      icon: Package,
      color: "bg-orange-500",
      textColor: "text-orange-600"
    }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <PageHeader
        title="Dashboard"
        description="Real-time insights into your dental lab operations"
      />

      {/* Main Dashboard Content - Perfect Viewport Fit */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-12 gap-6">

          {/* Left Column - Key Metrics & Charts */}
          <div className="col-span-8 flex flex-col gap-6">

            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4 h-32">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <div className="flex items-center">
                      <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`${metric.color} p-3 rounded-lg`}>
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="flex-1 grid grid-cols-2 gap-6">

              {/* Manufacturing Pipeline Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manufacturing Pipeline</h3>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={manufacturingPipelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Trends Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Appointment Trends</h3>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="appointments"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Total Appointments"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.3}
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Overview & Activity */}
          <div className="col-span-4 flex flex-col gap-6">

            {/* Appointment Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Status</h3>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {appointmentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Types Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Treatment Types</h3>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={treatmentTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {treatmentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-1 mt-4">
                {treatmentTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                <Zap className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Pending Lab Scripts</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{pendingLabScripts}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Completed Today</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {appointments.filter(a =>
                      a.date === new Date().toISOString().split('T')[0] &&
                      a.status === 'completed'
                    ).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Overdue Items</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {labScripts.filter(script => {
                      if (!script.due_date) return false;
                      return new Date(script.due_date) < new Date() && script.status !== 'completed';
                    }).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Factory className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">In Manufacturing</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{activeManufacturing}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
