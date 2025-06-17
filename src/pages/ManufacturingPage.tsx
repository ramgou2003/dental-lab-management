
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/particle-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Factory, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search, FileText, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useManufacturingItems } from "@/hooks/useManufacturingItems";

export function ManufacturingPage() {
  const [activeFilter, setActiveFilter] = useState("all-cam-scripts");
  const [showNewManufacturingForm, setShowNewManufacturingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { manufacturingItems, loading, updateManufacturingItemStatus } = useManufacturingItems();

  const handleNewManufacturing = () => {
    setShowNewManufacturingForm(true);
  };

  const handleStatusChange = async (itemId: string, newStatus: 'pending-printing' | 'in-production' | 'quality-check' | 'completed') => {
    try {
      await updateManufacturingItemStatus(itemId, newStatus);
      toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Calculate dynamic counts for manufacturing items
  const getManufacturingCount = (status: string) => {
    if (status === "all-cam-scripts") return manufacturingItems.length;
    if (status === "new-script") {
      return manufacturingItems.filter(item => item.status === 'pending-printing').length;
    }
    if (status === "printing") {
      return manufacturingItems.filter(item => item.status === 'in-production').length;
    }
    if (status === "inspection") {
      return manufacturingItems.filter(item => item.status === 'quality-check').length;
    }
    if (status === "incomplete") {
      return manufacturingItems.filter(item =>
        item.status === 'pending-printing' ||
        item.status === 'in-production' ||
        item.status === 'quality-check'
      ).length;
    }
    if (status === "completed") {
      return manufacturingItems.filter(item => item.status === 'completed').length;
    }
    return manufacturingItems.length;
  };

  // Stats configuration - 6 filters matching your requirements
  const stats = [
    {
      title: "New Script",
      value: getManufacturingCount("new-script"),
      filter: "new-script",
      icon: Clock,
      color: "bg-amber-500"
    },
    {
      title: "Printing",
      value: getManufacturingCount("printing"),
      filter: "printing",
      icon: Factory,
      color: "bg-blue-500"
    },
    {
      title: "Inspection",
      value: getManufacturingCount("inspection"),
      filter: "inspection",
      icon: AlertCircle,
      color: "bg-purple-500"
    },
    {
      title: "Incomplete",
      value: getManufacturingCount("incomplete"),
      filter: "incomplete",
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Completed",
      value: getManufacturingCount("completed"),
      filter: "completed",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "All CAM Scripts",
      value: getManufacturingCount("all-cam-scripts"),
      filter: "all-cam-scripts",
      icon: Factory,
      color: "bg-indigo-500"
    }
  ];

  // Filter manufacturing items
  const filteredManufacturingItems = manufacturingItems.filter(item => {
    const searchMatch = searchQuery.trim() === ""
      ? true
      : item.patient_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter based on active filter
    let statusMatch = true;
    if (activeFilter === "new-script") {
      statusMatch = item.status === 'pending-printing';
    } else if (activeFilter === "printing") {
      statusMatch = item.status === 'in-production';
    } else if (activeFilter === "inspection") {
      statusMatch = item.status === 'quality-check';
    } else if (activeFilter === "incomplete") {
      statusMatch = item.status === 'pending-printing' ||
                   item.status === 'in-production' ||
                   item.status === 'quality-check';
    } else if (activeFilter === "completed") {
      statusMatch = item.status === 'completed';
    }
    // "all-cam-scripts" shows everything

    return searchMatch && statusMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Manufacturing"
          search={{
            placeholder: "Search by patient name...",
            value: searchQuery,
            onChange: setSearchQuery
          }}
          action={{
            label: "New Manufacturing",
            onClick: handleNewManufacturing
          }}
        />
      </div>
      <div className="flex-1 p-6">
        {/* Stats Cards - 6 filters */}
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

        {/* Manufacturing Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading manufacturing items...</h3>
              <p className="text-gray-500">Please wait while we fetch manufacturing data.</p>
            </div>
          ) : filteredManufacturingItems.length > 0 ? (
            <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                <div className="space-y-4">
                  {filteredManufacturingItems.map((item) => {
                    // Format appliance types for display
                    const formatApplianceType = (type: string | null | undefined) => {
                      if (!type) return 'N/A';
                      return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    const upperAppliance = formatApplianceType(item.upper_appliance_type);
                    const lowerAppliance = formatApplianceType(item.lower_appliance_type);

                    // Render action buttons based on status
                    const renderActionButtons = () => {
                      switch (item.status) {
                        case 'pending-printing':
                          return (
                            <ParticleButton
                              className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              onClick={() => handleStatusChange(item.id, 'in-production')}
                              onSuccess={() => {}}
                              successDuration={1000}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Printing
                            </ParticleButton>
                          );
                        case 'in-production':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'quality-check')}
                                className="border-2 border-purple-600 text-purple-600 hover:border-purple-700 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 text-sm font-semibold"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Inspection
                              </Button>
                            </div>
                          );
                        case 'quality-check':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'in-production')}
                                className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm font-semibold"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Back to Printing
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'completed')}
                                className="border-2 border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50 px-4 py-2 text-sm font-semibold"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                              </Button>
                            </div>
                          );
                        case 'completed':
                          return (
                            <Button
                              variant="outline"
                              className="border-2 border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              disabled
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </Button>
                          );
                        default:
                          return null;
                      }
                    };

                    return (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                        <div className="flex items-center justify-between">
                          {/* Left side - Patient info and appliance details */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Manufacturing Avatar */}
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Factory className="h-4 w-4 text-white" />
                            </div>

                            {/* Patient Details */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.patient_name}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                {/* Appliance Types with Numbers */}
                                {item.upper_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Upper:</span> {upperAppliance}
                                    {item.upper_appliance_number && (
                                      <span className="ml-1 font-mono text-purple-600">({item.upper_appliance_number})</span>
                                    )}
                                  </span>
                                )}
                                {item.lower_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Lower:</span> {lowerAppliance}
                                    {item.lower_appliance_number && (
                                      <span className="ml-1 font-mono text-purple-600">({item.lower_appliance_number})</span>
                                    )}
                                  </span>
                                )}
                                {/* Shade */}
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Shade:</span> {item.shade}
                                </span>
                              </div>
                              {/* Status Badge */}
                              <div className="mt-2">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  item.status === 'in-production' ? 'bg-blue-100 text-blue-700' :
                                  item.status === 'quality-check' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.status === 'pending-printing' ? 'New Script' :
                                   item.status === 'in-production' ? 'Printing' :
                                   item.status === 'quality-check' ? 'Inspection' :
                                   item.status === 'completed' ? 'Completed' :
                                   item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right side - Action Buttons */}
                          <div className="ml-4">
                            {renderActionButtons()}
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
                No Manufacturing Items Found
              </h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === "new-script" ? "No new manufacturing scripts found." :
                 activeFilter === "printing" ? "No items currently printing." :
                 activeFilter === "inspection" ? "No items currently in inspection." :
                 activeFilter === "incomplete" ? "No incomplete manufacturing items found." :
                 activeFilter === "completed" ? "No completed manufacturing items found." :
                 "No manufacturing items available at the moment."}
              </p>
              <Button
                onClick={() => window.location.href = '/report-cards'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Go to Report Cards
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Manufacturing Dialog */}
      <Dialog open={showNewManufacturingForm} onOpenChange={setShowNewManufacturingForm}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Factory className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Manufacturing Order</h2>
                <p className="text-gray-600">Set up a new manufacturing order</p>
              </div>
            </div>

            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Manufacturing form will be implemented here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
