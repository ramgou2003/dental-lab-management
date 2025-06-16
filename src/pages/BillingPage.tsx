
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DollarSign, FileText, CreditCard, TrendingUp, Search } from "lucide-react";

export function BillingPage() {
  const [activeTab, setActiveTab] = useState("invoices");

  const handleNewInvoice = () => {
    console.log("Creating new invoice...");
  };

  const invoices = [
    { id: "INV-001", patient: "Emily Johnson", amount: "$350.00", date: "2024-01-15", status: "paid", treatment: "Dental Cleaning" },
    { id: "INV-002", patient: "Michael Chen", amount: "$1,200.00", date: "2024-01-14", status: "pending", treatment: "Root Canal" },
    { id: "INV-003", patient: "Sarah Williams", amount: "$150.00", date: "2024-01-13", status: "paid", treatment: "Consultation" },
    { id: "INV-004", patient: "David Brown", amount: "$275.00", date: "2024-01-12", status: "overdue", treatment: "Dental Filling" },
  ];

  const revenueStats = [
    { title: "Monthly Revenue", value: "$24,580", change: "+12%", icon: DollarSign },
    { title: "Outstanding", value: "$3,420", change: "-5%", icon: FileText },
    { title: "Collected", value: "$21,160", change: "+8%", icon: CreditCard },
    { title: "Average Invoice", value: "$425", change: "+3%", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col max-w-full flex-1">
      <PageHeader 
        title="Billing" 
        description="Manage invoices and financial records"
        action={{
          label: "New Invoice",
          onClick: handleNewInvoice
        }}
      />

      {/* Revenue Stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {revenueStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-slate-900 text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Billing Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "invoices"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "payments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Reports
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-4 py-2">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search invoices, patients, or amounts..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Invoices Content */}
          {activeTab === "invoices" && (
            <div className="p-6">
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">{invoice.id}</h4>
                        <p className="text-slate-600 text-sm">{invoice.patient}</p>
                        <p className="text-slate-500 text-xs">{invoice.treatment}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold">{invoice.amount}</p>
                      <p className="text-slate-600 text-sm">{invoice.date}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Content */}
          {activeTab === "payments" && (
            <div className="p-6">
              <p className="text-slate-600 text-center py-8">Payment history and processing coming soon...</p>
            </div>
          )}

          {/* Reports Content */}
          {activeTab === "reports" && (
            <div className="p-6">
              <p className="text-slate-600 text-center py-8">Financial reports and analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
