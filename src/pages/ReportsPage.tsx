
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter } from "lucide-react";

export function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeReport, setActiveReport] = useState("overview");

  const handleExportReport = () => {
    console.log("Exporting report...");
  };

  const metrics = [
    { title: "Total Patients", value: "486", change: "+15", period: "this month", icon: Users, color: "text-blue-600" },
    { title: "Appointments", value: "124", change: "+8", period: "this month", icon: Calendar, color: "text-green-600" },
    { title: "Revenue", value: "$24,580", change: "+12%", period: "this month", icon: TrendingUp, color: "text-purple-600" },
    { title: "Avg. per Patient", value: "$425", change: "+5%", period: "this month", icon: BarChart3, color: "text-orange-600" },
  ];

  const treatmentStats = [
    { treatment: "Dental Cleaning", count: 45, revenue: "$15,750", percentage: 35 },
    { treatment: "Fillings", count: 28, revenue: "$8,400", percentage: 22 },
    { treatment: "Root Canal", count: 12, revenue: "$14,400", percentage: 18 },
    { treatment: "Extractions", count: 18, revenue: "$5,400", percentage: 15 },
    { treatment: "Consultations", count: 21, revenue: "$3,150", percentage: 10 },
  ];

  return (
    <div className="flex flex-col max-w-full flex-1">
      <PageHeader 
        title="Reports" 
        description="Analytics and insights for your practice"
        action={{
          label: "Export Report",
          onClick: handleExportReport
        }}
      />

      {/* Controls */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === "week" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === "month" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod("year")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === "year" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              This Year
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{metric.title}</p>
                  <p className="text-slate-900 text-2xl font-bold mt-1">{metric.value}</p>
                  <p className="text-green-600 text-sm mt-1">
                    {metric.change} {metric.period}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-full">
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Treatment Analysis */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-slate-900 text-lg font-semibold">Treatment Analysis</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {treatmentStats.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-900 font-medium">{item.treatment}</span>
                          <span className="text-slate-600 text-sm">{item.count} procedures</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-slate-900 font-semibold">{item.revenue}</p>
                        <p className="text-slate-600 text-sm">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-slate-900 text-lg font-semibold">Patient Demographics</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Age 18-30</span>
                  <span className="text-slate-900 font-medium">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Age 31-50</span>
                  <span className="text-slate-900 font-medium">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Age 51+</span>
                  <span className="text-slate-900 font-medium">30%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-slate-900 text-lg font-semibold">Appointment Trends</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Peak Hours</span>
                  <span className="text-slate-900 font-medium">2-4 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Busiest Day</span>
                  <span className="text-slate-900 font-medium">Tuesday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">No-Show Rate</span>
                  <span className="text-slate-900 font-medium">5.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
