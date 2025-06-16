
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Factory, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search } from "lucide-react";

export function ManufacturingPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showNewManufacturingForm, setShowNewManufacturingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewManufacturingScript = () => {
    setShowNewManufacturingForm(true);
  };

  // Mock manufacturing data - exact replica structure
  const manufacturingOrders = [
    {
      id: "MFG-001",
      patient: "Emily Johnson",
      itemType: "Ceramic Crown",
      material: "Zirconia",
      requestedDate: "1/14/2024",
      dueDate: "1/19/2024",
      status: "completed"
    },
    {
      id: "MFG-002",
      patient: "Michael Chen",
      itemType: "Bridge Framework",
      material: "Titanium",
      requestedDate: "1/13/2024",
      dueDate: "1/17/2024",
      status: "printing"
    },
    {
      id: "MFG-003",
      patient: "Sarah Williams",
      itemType: "Surgical Guide",
      material: "Biocompatible Resin",
      requestedDate: "1/19/2024",
      dueDate: "1/24/2024",
      status: "printed"
    },
    {
      id: "MFG-004",
      patient: "David Brown",
      itemType: "Implant Abutment",
      material: "Titanium",
      requestedDate: "1/17/2024",
      dueDate: "1/21/2024",
      status: "printing"
    }
  ];

  // Calculate dynamic counts - exact replica logic
  const getOrderCount = (status: string) => {
    if (status === "all") return manufacturingOrders.length;
    if (status === "incomplete") {
      return manufacturingOrders.filter(order =>
        order.status === "printing" || order.status === "printed" || order.status === "hold"
      ).length;
    }
    return manufacturingOrders.filter(order => order.status === status).length;
  };

  // Stats configuration - exact replica of lab page structure
  const stats = [
    {
      title: "New Scripts",
      value: getOrderCount("new"),
      filter: "new",
      icon: Clock,
      color: "bg-amber-500"
    },
    {
      title: "In-Process",
      value: getOrderCount("in-progress"),
      filter: "in-progress",
      icon: AlertCircle,
      color: "bg-blue-500"
    },
    {
      title: "Hold",
      value: getOrderCount("hold"),
      filter: "hold",
      icon: Clock,
      color: "bg-purple-500"
    },
    {
      title: "Incomplete",
      value: getOrderCount("incomplete"),
      filter: "incomplete",
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Completed",
      value: getOrderCount("completed"),
      filter: "completed",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "All Manufacturing Scripts",
      value: getOrderCount("all"),
      filter: "all",
      icon: Factory,
      color: "bg-indigo-500"
    }
  ];

  // Filter orders - exact replica logic
  const filteredOrders = manufacturingOrders.filter(order => {
    const statusMatch = activeFilter === "all"
      ? true
      : activeFilter === "incomplete"
      ? order.status === "printing" ||
        order.status === "printed" ||
        order.status === "hold"
      : order.status === activeFilter;

    const searchMatch = searchQuery.trim() === ""
      ? true
      : order.patient?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Manufacturing Scripts"
          search={{
            placeholder: "Search by patient name...",
            value: searchQuery,
            onChange: setSearchQuery
          }}
          action={{
            label: "New Manufacturing Script",
            onClick: handleNewManufacturingScript
          }}
        />
      </div>
      <div className="flex-1 p-6">
        {/* Stats Cards - Exact replica */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(stat.filter)}
              className={`h-20 sm:h-22 lg:h-24 p-2 sm:p-3 lg:p-3 rounded-xl border transition-all duration-200 hover:shadow-md relative ${
                activeFilter === stat.filter
                  ? 'border-indigo-300 bg-indigo-50 shadow-md border-b-4 border-b-indigo-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col h-full justify-between">
                {/* Icon and Number at the top */}
                <div className="flex items-center justify-between">
                  <p className={`text-base sm:text-lg lg:text-xl font-bold leading-none ${
                    activeFilter === stat.filter ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  <div className={`p-1 sm:p-1 lg:p-2 rounded-lg flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                </div>

                {/* Title at the bottom */}
                <div className="w-full text-center">
                  <p className={`text-xs sm:text-sm lg:text-sm font-semibold leading-tight ${
                    activeFilter === stat.filter
                      ? 'text-indigo-700'
                      : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Manufacturing Scripts Table - Exact replica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          {filteredOrders.length > 0 ? (
            <div className="flex-1 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-11 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="col-span-2">Patient Name</div>
                  <div className="col-span-1 text-center">Item Type</div>
                  <div className="col-span-3 text-center">Material</div>
                  <div className="col-span-1 text-center">Requested Date</div>
                  <div className="col-span-1 text-center">Due Date</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-center">Actions</div>
                  <div className="col-span-1 text-center">Preview</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {filteredOrders.map((order) => {
                  return (
                    <div key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <div className="grid grid-cols-11 gap-4 px-6 py-4 text-sm items-center">
                        {/* Patient */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Factory className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium truncate">{order.patient}</p>
                            </div>
                          </div>
                        </div>

                        {/* Item Type */}
                        <div className="col-span-1 flex justify-center">
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                            {order.itemType}
                          </span>
                        </div>

                        {/* Material */}
                        <div className="col-span-3 text-center">
                          <p className="text-gray-900 font-medium text-xs leading-tight">{order.material}</p>
                        </div>

                        {/* Requested Date */}
                        <div className="col-span-1 text-center">
                          <p className="text-gray-600 text-xs">{order.requestedDate}</p>
                        </div>

                        {/* Due Date */}
                        <div className="col-span-1 text-center">
                          <p className="text-gray-600 text-xs">{order.dueDate}</p>
                        </div>

                        {/* Status */}
                        <div className="col-span-1 flex justify-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'printing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'printed' ? 'bg-orange-100 text-orange-700' :
                            order.status === 'hold' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-center">
                          <div className="flex gap-1">
                            {order.status === 'completed' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Edit Status"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            ) : order.status === 'printing' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Hold"
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Complete"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Start Production"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeFilter === "all" ? "" : activeFilter} manufacturing scripts found
              </h3>
              <p className="text-gray-500">
                {activeFilter === "all"
                  ? "No manufacturing scripts available at the moment."
                  : `No manufacturing scripts with ${activeFilter} status found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Manufacturing Script Dialog */}
      <Dialog open={showNewManufacturingForm} onOpenChange={setShowNewManufacturingForm}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Factory className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Manufacturing Script</h2>
                <p className="text-gray-600">Set up a new production order for manufacturing</p>
              </div>
            </div>

            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Manufacturing script form will be implemented here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
