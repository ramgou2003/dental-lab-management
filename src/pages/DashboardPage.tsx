
import { useState, useEffect } from "react";
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
  AreaChart,
  RadialBarChart,
  RadialBar
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
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Timer,
  Stethoscope
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
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Main Dashboard Content */}
      <div className="h-full p-6">
        <div className="h-full max-h-full grid grid-cols-12 gap-6">

          {/* Left Column - Main Analytics */}
          <div className="col-span-8 flex flex-col gap-6 min-h-0">

            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4 h-28">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <metric.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      ) : (
                        <Minus className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={`text-xs font-medium ${
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">

              {/* Manufacturing Pipeline Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manufacturing Pipeline</h3>
                    <p className="text-sm text-gray-500">Production workflow status</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={manufacturingPipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
                    <p className="text-sm text-gray-500">7-day appointment patterns</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="appointments"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b981"
                        fillOpacity={0.1}
                        name="Total Appointments"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="#6366f1"
                        fillOpacity={0.1}
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Insights */}
          <div className="col-span-4 flex flex-col gap-6 min-h-0">

            {/* Appointment Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Status</h3>
                  <p className="text-sm text-gray-500">Current distribution</p>
                </div>
                <PieChartIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {appointmentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Types Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Treatment Types</h3>
                  <p className="text-sm text-gray-500">Procedure breakdown</p>
                </div>
                <Stethoscope className="h-5 w-5 text-gray-400" />
              </div>

              {/* Simple Progress List */}
              <div className="space-y-3">
                {treatmentTypes.map((item, index) => {
                  const total = treatmentTypes.reduce((sum, t) => sum + t.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Metrics</h3>
                  <p className="text-sm text-gray-500">Real-time insights</p>
                </div>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">Pending Lab Scripts</span>
                      <p className="text-xs text-gray-500">Awaiting processing</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{pendingLabScripts}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">Completed Today</span>
                      <p className="text-xs text-gray-500">Finished appointments</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {appointments.filter(a =>
                      a.date === new Date().toISOString().split('T')[0] &&
                      a.status === 'completed'
                    ).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">Overdue Items</span>
                      <p className="text-xs text-gray-500">Require attention</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {labScripts.filter(script => {
                      if (!script.due_date) return false;
                      return new Date(script.due_date) < new Date() && script.status !== 'completed';
                    }).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Factory className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">In Manufacturing</span>
                      <p className="text-xs text-gray-500">Active production</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{activeManufacturing}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
