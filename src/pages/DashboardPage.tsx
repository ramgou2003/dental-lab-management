
import { PageHeader } from "@/components/PageHeader";
import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";

export function DashboardPage() {
  const todayStats = [
    { title: "Today's Appointments", value: "12", icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { title: "Total Patients", value: "486", icon: Users, color: "bg-green-50 text-green-600" },
    { title: "Pending Appointments", value: "8", icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { title: "Monthly Revenue", value: "$24,580", icon: DollarSign, color: "bg-purple-50 text-purple-600" },
  ];

  const recentAppointments = [
    { patient: "Emily Johnson", time: "9:00 AM", treatment: "Cleaning", status: "confirmed" },
    { patient: "Michael Chen", time: "10:30 AM", treatment: "Root Canal", status: "in-progress" },
    { patient: "Sarah Williams", time: "2:00 PM", treatment: "Consultation", status: "pending" },
    { patient: "David Brown", time: "3:30 PM", treatment: "Filling", status: "confirmed" },
  ];

  const alerts = [
    { message: "Equipment maintenance due for Chair #2", type: "warning" },
    { message: "Insurance verification needed for 3 patients", type: "info" },
    { message: "Low inventory: Dental floss", type: "alert" },
  ];

  return (
    <div className="flex flex-col max-w-full flex-1">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your clinic's daily operations" 
      />
      
      {/* Stats Grid */}
      <div className="px-4 tablet:px-3 py-3 tablet:py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 tablet:gap-3 mb-6 tablet:mb-4">
          {todayStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 tablet:p-4 rounded-xl tablet:rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm tablet:text-xs font-medium">{stat.title}</p>
                  <p className="text-slate-900 text-3xl tablet:text-2xl font-bold mt-2 tablet:mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 tablet:p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 tablet:h-5 tablet:w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 tablet:gap-4 h-[600px] tablet:h-[500px]">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl tablet:rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="p-6 tablet:p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="text-slate-900 text-lg tablet:text-base font-semibold">Today's Appointments</h3>
              </div>
              <div className="p-6 tablet:p-4 flex-1 overflow-y-auto">
                <div className="space-y-4 tablet:space-y-3">
                  {recentAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 tablet:p-3 bg-slate-50 rounded-lg tablet:rounded">
                      <div className="flex items-center space-x-3 tablet:space-x-2">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 tablet:w-8 tablet:h-8 bg-slate-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 tablet:h-4 tablet:w-4 text-slate-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium tablet:text-sm">{appointment.patient}</p>
                          <p className="text-slate-600 text-sm tablet:text-xs">{appointment.treatment}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-900 font-medium tablet:text-sm">{appointment.time}</p>
                        <span className={`px-2 py-1 tablet:px-1.5 tablet:py-0.5 rounded-full text-xs tablet:text-[10px] font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Fixed notifications, scrollable quick actions */}
          <div className="space-y-6 tablet:space-y-4 h-full flex flex-col">
            {/* Alerts & Notifications - Fixed */}
            <div className="bg-white rounded-xl tablet:rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
              <div className="p-6 tablet:p-4 border-b border-slate-200">
                <h3 className="text-slate-900 text-lg tablet:text-base font-semibold">Alerts & Notifications</h3>
              </div>
              <div className="p-6 tablet:p-4">
                <div className="space-y-3 tablet:space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 tablet:space-x-2 p-3 tablet:p-2 bg-slate-50 rounded-lg tablet:rounded">
                      <AlertCircle className={`h-5 w-5 tablet:h-4 tablet:w-4 mt-0.5 flex-shrink-0 ${
                        alert.type === 'warning' ? 'text-yellow-500' :
                        alert.type === 'alert' ? 'text-red-500' : 'text-blue-500'
                      }`} />
                      <p className="text-slate-700 text-sm tablet:text-xs">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions - Scrollable */}
            <div className="bg-white rounded-xl tablet:rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
              <div className="p-6 tablet:p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="text-slate-900 text-lg tablet:text-base font-semibold">Quick Actions</h3>
              </div>
              <div className="p-6 tablet:p-4 flex-1 overflow-y-auto">
                <div className="space-y-3 tablet:space-y-2">
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Schedule New Appointment</p>
                  </button>
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Add New Patient</p>
                  </button>
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Generate Report</p>
                  </button>
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Check Inventory</p>
                  </button>
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Lab Orders</p>
                  </button>
                  <button className="w-full text-left p-3 tablet:p-2 bg-slate-50 hover:bg-slate-100 rounded-lg tablet:rounded transition-colors">
                    <p className="text-slate-900 font-medium tablet:text-sm">Manufacturing Queue</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
