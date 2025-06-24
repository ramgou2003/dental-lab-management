
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Dashboard Content */}
      <div className="h-full p-8">
        <div className="h-full grid grid-cols-12 gap-8">

          {/* Left Column - Main Analytics */}
          <div className="col-span-8 flex flex-col gap-8">

            {/* Hero Metrics Row */}
            <div className="grid grid-cols-4 gap-6">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500/10 to-cyan-500/10' :
                    index === 1 ? 'from-emerald-500/10 to-teal-500/10' :
                    index === 2 ? 'from-purple-500/10 to-pink-500/10' :
                    'from-orange-500/10 to-red-500/10'
                  } rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        index === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        index === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-gradient-to-r from-orange-500 to-red-500'
                      } shadow-lg`}>
                        <metric.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : metric.trend === 'down' ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm font-semibold ${
                          metric.trend === 'up' ? 'text-emerald-600' :
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                      <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500 mt-1">vs last month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modern Charts Section */}
            <div className="flex-1 grid grid-cols-2 gap-8">

              {/* Manufacturing Pipeline Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Manufacturing Pipeline</h3>
                      <p className="text-sm text-gray-500">Production workflow status</p>
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={manufacturingPipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
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
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#barGradient)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Trends Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Weekly Trends</h3>
                      <p className="text-sm text-gray-500">7-day appointment patterns</p>
                    </div>
                  </div>
                  <Timer className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
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
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="appointments"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#appointmentsGradient)"
                        name="Total Appointments"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#completedGradient)"
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Insights */}
          <div className="col-span-4 flex flex-col gap-8">

            {/* Appointment Status Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                    <PieChartIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Appointment Status</h3>
                    <p className="text-sm text-gray-500">Current distribution</p>
                  </div>
                </div>
                <Target className="h-5 w-5 text-pink-400" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {appointmentStatusData.map((entry, index) => (
                        <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {appointmentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Types Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Treatment Types</h3>
                    <p className="text-sm text-gray-500">Procedure breakdown</p>
                  </div>
                </div>
                <Award className="h-5 w-5 text-indigo-400" />
              </div>

              {/* Radial Progress Bars */}
              <div className="space-y-4">
                {treatmentTypes.map((item, index) => {
                  const total = treatmentTypes.reduce((sum, t) => sum + t.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{item.value}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 flex-1 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Metrics</h3>
                    <p className="text-sm text-gray-500">Real-time insights</p>
                  </div>
                </div>
                <Activity className="h-5 w-5 text-yellow-400" />
              </div>

              <div className="space-y-5">
                <div className="group relative p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">Pending Lab Scripts</span>
                        <p className="text-xs text-gray-500">Awaiting processing</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{pendingLabScripts}</span>
                  </div>
                </div>

                <div className="group relative p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">Completed Today</span>
                        <p className="text-xs text-gray-500">Finished appointments</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">
                      {appointments.filter(a =>
                        a.date === new Date().toISOString().split('T')[0] &&
                        a.status === 'completed'
                      ).length}
                    </span>
                  </div>
                </div>

                <div className="group relative p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500 rounded-lg shadow-sm">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">Overdue Items</span>
                        <p className="text-xs text-gray-500">Require attention</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {labScripts.filter(script => {
                        if (!script.due_date) return false;
                        return new Date(script.due_date) < new Date() && script.status !== 'completed';
                      }).length}
                    </span>
                  </div>
                </div>

                <div className="group relative p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                        <Factory className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">In Manufacturing</span>
                        <p className="text-xs text-gray-500">Active production</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{activeManufacturing}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
