
import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { useAppointments } from "@/hooks/useAppointments";
import { useLabScripts } from "@/hooks/useLabScripts";
import { useManufacturingItems } from "@/hooks/useManufacturingItems";
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
  Stethoscope,
  FileText,
  PlayCircle,
  PauseCircle,
  XCircle,
  HourglassIcon,
  Printer,
  Cog,
  Truck,
  Search,
  Settings,
  MapPin
} from "lucide-react";

export function DashboardPage() {
  const { appointments } = useAppointments();
  const { labScripts } = useLabScripts();
  const { manufacturingItems } = useManufacturingItems();
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
  const readyForDelivery = manufacturingItems.filter(item =>
    item.status === 'completed'
  ).length;

  // Lab Scripts status distribution
  const labScriptsPending = labScripts.filter(script => script.status === 'pending').length;
  const labScriptsInProgress = labScripts.filter(script => script.status === 'in-progress').length;
  const labScriptsOnHold = labScripts.filter(script => script.status === 'hold').length;
  const labScriptsDelayed = labScripts.filter(script => script.status === 'delayed').length;
  const labScriptsCompleted = labScripts.filter(script => script.status === 'completed').length;

  // Manufacturing status distribution
  const manufacturingPendingPrinting = manufacturingItems.filter(item => item.status === 'pending-printing').length;
  const manufacturingPendingMilling = manufacturingItems.filter(item => item.status === 'pending-milling').length;
  const manufacturingInProduction = manufacturingItems.filter(item => item.status === 'in-production').length;
  const manufacturingMilling = manufacturingItems.filter(item => item.status === 'milling').length;
  const manufacturingInTransit = manufacturingItems.filter(item => item.status === 'in-transit').length;
  const manufacturingQualityCheck = manufacturingItems.filter(item => item.status === 'quality-check').length;
  const manufacturingCompleted = manufacturingItems.filter(item => item.status === 'completed').length;









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
    }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Main Dashboard Content - Full height with padding all around */}
      <div className="h-screen p-4 overflow-hidden">
        {/* Top Row with Greeting and New Container */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Greeting Container - 8 columns */}
          <div className="col-span-8 group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-300/70">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center justify-start min-h-[5.5rem] pl-4">
              {/* Greeting Text */}
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return "Good Morning";
                    if (hour < 17) return "Good Afternoon";
                    return "Good Evening";
                  })()}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-slate-600 font-medium">Welcome back,</p>
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200/50 shadow-sm">
                    Dr. Sarah Chen
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Date Container - 4 columns */}
          <div className="col-span-4 group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-300/70">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Live Data - Top Right Corner */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-300/60 backdrop-blur-sm">
                <span className="text-xs font-medium text-blue-700">Live Data</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse border border-blue-200/30 shadow-sm"></div>
            </div>

            <div className="relative flex flex-col justify-center h-full min-h-[5.5rem] pt-2">
              <div className="text-center">
                {/* Current Time */}
                <div className="mb-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    {new Date().toLocaleTimeString('en-US', {
                      timeZone: 'America/New_York',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">EST</p>
                </div>

                {/* Current Date */}
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date().toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                      weekday: 'long'
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {new Date().toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-6rem)] grid grid-cols-12 gap-4 max-h-full">

          {/* Left Column - Main Analytics */}
          <div className="col-span-8 flex flex-col gap-3 min-h-0">

            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-3">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-100"></div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                        <metric.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {metric.trend === 'up' ? (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded-full border border-blue-200/30">
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-600">{metric.change}</span>
                          </div>
                        ) : metric.trend === 'down' ? (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 rounded-full border border-blue-200/30">
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                            <span className="text-xs font-semibold text-red-600">{metric.change}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-slate-50 rounded-full border border-blue-200/30">
                            <Minus className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500">{metric.change}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-1">{metric.title}</h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Search Container */}
              <div className="col-span-2 relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 rounded-2xl opacity-100"></div>

                <div className="relative h-full flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-full border border-blue-200/30">
                      <Search className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">Quick</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-3">Search Patient</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter patient name or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-white/80 border border-blue-200/50 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/60 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Scripts Statistics Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200/40 p-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Lab Scripts Overview
                  </h2>
                  <p className="text-xs text-slate-600">Real-time status distribution</p>
                </div>
                <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-300/50">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
              {/* Pending Lab Scripts */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300/70">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-full border border-blue-200/30">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">Pending</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Pending Scripts</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {labScriptsPending}
                    </p>
                  </div>
                </div>
              </div>

              {/* In Progress Lab Scripts */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-blue-300/70">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-blue-300/50">
                      <PlayCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded-full border border-blue-200/30">
                      <Activity className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600">Active</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1">In Progress</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {labScriptsInProgress}
                    </p>
                  </div>
                </div>
              </div>

              {/* On Hold Lab Scripts */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 hover:border-blue-300/70">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-blue-300/50">
                      <PauseCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-amber-50 rounded-full border border-blue-200/30">
                      <PauseCircle className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-600">Hold</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1">On Hold</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {labScriptsOnHold}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delayed Lab Scripts */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-red-500/10 hover:border-blue-300/70">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl border border-blue-300/50">
                      <HourglassIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 rounded-full border border-blue-200/30">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-semibold text-red-600">Delayed</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Delayed</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {labScriptsDelayed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Lab Scripts */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-4 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 hover:border-blue-300/70">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-blue-300/50">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-blue-200/30">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">Done</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Completed</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {labScriptsCompleted}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Manufacturing Overview Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/40 p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Manufacturing Overview
                  </h2>
                  <p className="text-sm text-slate-600">Production pipeline status</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                  <Factory className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {/* Pending Printing */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-300/50">
                        <Printer className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 rounded-full border border-blue-200/30">
                        <Clock className="h-2.5 w-2.5 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">Print</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">Pending Printing</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingPendingPrinting}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Milling */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg border border-blue-300/50">
                        <Settings className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-purple-50 rounded-full border border-blue-200/30">
                        <Clock className="h-2.5 w-2.5 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-600">Mill</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">Pending Milling</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingPendingMilling}
                      </p>
                    </div>
                  </div>
                </div>

                {/* In Production */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-blue-300/50">
                        <Cog className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-50 rounded-full border border-blue-200/30">
                        <Activity className="h-2.5 w-2.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600">Prod</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">In Production</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingInProduction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milling */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-blue-300/50">
                        <Cog className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-50 rounded-full border border-blue-200/30">
                        <Settings className="h-2.5 w-2.5 text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-600">Mill</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">Milling</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingMilling}
                      </p>
                    </div>
                  </div>
                </div>

                {/* In Transit */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-blue-300/50">
                        <Truck className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-orange-50 rounded-full border border-blue-200/30">
                        <Truck className="h-2.5 w-2.5 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-600">Ship</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">In Transit</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingInTransit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quality Check */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-lg border border-blue-300/50">
                        <Search className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-50 rounded-full border border-blue-200/30">
                        <Search className="h-2.5 w-2.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-600">QC</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">Quality Check</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingQualityCheck}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completed */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 hover:border-blue-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-blue-300/50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-50 rounded-full border border-blue-200/30">
                        <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Done</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-600 mb-1">Completed</h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {manufacturingCompleted}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Status & Insights */}
          <div className="col-span-4 flex flex-col gap-3 min-h-0 max-h-full overflow-hidden">



            {/* Treatment Types Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Treatment Types
                  </h3>
                  <p className="text-slate-600 text-xs">Procedure breakdown</p>
                </div>
                <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                </div>
              </div>

              {/* Enhanced Progress List */}
              <div className="space-y-1.5">
                {treatmentTypes.map((item, index) => {
                  const total = treatmentTypes.reduce((sum, t) => sum + t.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;

                  return (
                    <div key={index} className="relative p-1.5 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-lg border border-blue-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full shadow-sm border border-blue-200/30"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.value}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-blue-100/50 rounded-full h-0.5 mt-1 border border-blue-200/30">
                        <div
                          className="h-0.5 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: item.color,
                            width: `${percentage}%`,
                            opacity: 0.8
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{percentage.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Live Metrics
                  </h3>
                  <p className="text-slate-600 text-xs">Real-time insights</p>
                </div>
                <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-300/50">
                  <Activity className="h-3 w-3 text-blue-600" />
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <div className="relative p-2.5 bg-gradient-to-r from-blue-50/80 to-blue-100/50 rounded-lg border border-blue-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0 border border-blue-400/30">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">Pending Lab Scripts</span>
                        <p className="text-xs text-slate-600 truncate">Awaiting processing</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600 flex-shrink-0 ml-2">{pendingLabScripts}</span>
                  </div>
                </div>

                <div className="relative p-2.5 bg-gradient-to-r from-emerald-50/80 to-emerald-100/50 rounded-lg border border-blue-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm flex-shrink-0 border border-blue-400/30">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">Completed Today</span>
                        <p className="text-xs text-slate-600 truncate">Finished appointments</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 flex-shrink-0 ml-2">
                      {appointments.filter(a =>
                        a.date === new Date().toISOString().split('T')[0] &&
                        a.status === 'completed'
                      ).length}
                    </span>
                  </div>
                </div>

                <div className="relative p-2.5 bg-gradient-to-r from-amber-50/80 to-amber-100/50 rounded-lg border border-blue-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm flex-shrink-0 border border-blue-400/30">
                        <AlertTriangle className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">Overdue Items</span>
                        <p className="text-xs text-slate-600 truncate">Require attention</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-amber-600 flex-shrink-0 ml-2">
                      {labScripts.filter(script => {
                        if (!script.due_date) return false;
                        return new Date(script.due_date) < new Date() && script.status !== 'completed';
                      }).length}
                    </span>
                  </div>
                </div>

                <div className="relative p-2.5 bg-gradient-to-r from-purple-50/80 to-purple-100/50 rounded-lg border border-blue-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0 border border-blue-400/30">
                        <Factory className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">In Manufacturing</span>
                        <p className="text-xs text-slate-600 truncate">Active production</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-600 flex-shrink-0 ml-2">{activeManufacturing}</span>
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
