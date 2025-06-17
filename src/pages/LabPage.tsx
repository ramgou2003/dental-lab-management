import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NewLabScriptForm } from "@/components/NewLabScriptForm";
import { LabScriptDetail } from "@/components/LabScriptDetail";
import { useLabScripts } from "@/hooks/useLabScripts";
import { LabScript } from "@/hooks/useLabScripts";
import { FlaskConical, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

export function LabPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showNewScriptForm, setShowNewScriptForm] = useState(false);
  const [showLabScriptDetail, setShowLabScriptDetail] = useState(false);
  const [selectedLabScript, setSelectedLabScript] = useState<LabScript | null>(null);
  const [designStates, setDesignStates] = useState<Record<string, 'not-started' | 'in-progress' | 'hold' | 'completed'>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStatus, setEditingStatus] = useState<Record<string, boolean>>({});
  const { labScripts, loading, addLabScript, updateLabScript } = useLabScripts();

  const handleNewOrder = () => {
    setShowNewScriptForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      await addLabScript({
        patient_id: formData.patientId,
        patient_name: formData.patientName,
        arch_type: formData.archType,
        upper_appliance_type: formData.upperApplianceType,
        lower_appliance_type: formData.lowerApplianceType,
        screw_type: formData.screwType,
        custom_screw_type: formData.customScrewType,
        vdo_details: formData.vdoDetails,
        is_nightguard_needed: formData.isNightguardNeeded,
        requested_date: formData.requestedDate,
        due_date: formData.dueDate,
        instructions: formData.instructions,
        notes: formData.notes,
        status: 'pending'
      });
      toast.success("Lab script created successfully!");
      setShowNewScriptForm(false);
    } catch (error) {
      console.error("Error creating lab script:", error);
      toast.error("Failed to create lab script. Please try again.");
    }
  };

  const handleFormClose = () => {
    setShowNewScriptForm(false);
  };

  const handleViewLabScript = (labScript: LabScript) => {
    setSelectedLabScript(labScript);
    setShowLabScriptDetail(true);
  };

  const handleLabScriptDetailClose = () => {
    setShowLabScriptDetail(false);
    setSelectedLabScript(null);
  };

  const handleLabScriptUpdate = async (id: string, updates: Partial<LabScript>) => {
    try {
      await updateLabScript(id, updates);
      toast.success("Lab script updated successfully!");
    } catch (error) {
      toast.error("Failed to update lab script");
      throw error;
    }
  };

  const handleDesignStateChange = async (orderId: string, newState: 'not-started' | 'in-progress' | 'hold' | 'completed') => {
    // Map the design state to lab script status
    const statusMap = {
      'not-started': 'pending',
      'in-progress': 'in-progress',
      'hold': 'hold',
      'completed': 'completed'
    };

    const newStatus = statusMap[newState];

    try {
      await updateLabScript(orderId, { status: newStatus });

      // Update local design state
      setDesignStates(prev => ({ ...prev, [orderId]: newState }));

      // Exit edit mode when updating status
      setEditingStatus(prev => ({
        ...prev,
        [orderId]: false
      }));

      // Show appropriate success message
      const messages = {
        'in-progress': 'Design started!',
        'hold': 'Status updated to hold!',
        'completed': 'Design completed and status updated!',
        'not-started': 'Status reset to pending!'
      };

      toast.success(messages[newState] || 'Status updated!');
    } catch (error) {
      console.error('Error updating lab script status:', error);
      toast.error("Failed to update status");
    }
  };

  const handleEditStatus = (orderId: string) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const renderActionButtons = (orderId: string, originalScript: LabScript | undefined) => {
    const currentStatus = originalScript?.status;
    const isEditingStatus = editingStatus[orderId] || false;

    // If lab script is completed, show edit button or hold/complete when editing
    if (currentStatus === 'completed' && !isEditingStatus) {
      return (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditStatus(orderId)}
            className="h-8 w-8 p-0"
            title="Edit Status"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (currentStatus === 'completed' && isEditingStatus) {
      return (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDesignStateChange(orderId, 'hold')}
            className="h-8 w-8 p-0"
            title="Hold"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDesignStateChange(orderId, 'completed')}
            className="h-8 w-8 p-0"
            title="Complete"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Use actual lab script status instead of local designState
    switch (currentStatus) {
      case 'pending':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'in-progress')}
              className="h-8 w-8 p-0"
              title="Start Design"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        );

      case 'in-progress':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'hold')}
              className="h-8 w-8 p-0"
              title="Hold"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'completed')}
              className="h-8 w-8 p-0"
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        );

      case 'hold':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'in-progress')}
              className="h-8 w-8 p-0"
              title="Resume Design"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'completed')}
              className="h-8 w-8 p-0"
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Transform lab scripts to match the expected format
  const labOrders = labScripts.map(script => {
    // Generate display appliance type from upper/lower appliance types
    let displayApplianceType = '';
    if (script.arch_type === 'upper' && script.upper_appliance_type) {
      displayApplianceType = script.upper_appliance_type;
    } else if (script.arch_type === 'lower' && script.lower_appliance_type) {
      displayApplianceType = script.lower_appliance_type;
    } else if (script.arch_type === 'dual') {
      const upper = script.upper_appliance_type || '';
      const lower = script.lower_appliance_type || '';
      displayApplianceType = `${upper} + ${lower}`;
    }

    return {
      id: script.id,
      patient: script.patient_name,
      archType: script.arch_type,
      applianceType: displayApplianceType,
      upperApplianceType: script.upper_appliance_type,
      lowerApplianceType: script.lower_appliance_type,
      screwType: script.screw_type,
      vdoDetails: script.vdo_details,
      isNightguardNeeded: script.is_nightguard_needed,
      status: script.status,
      requestedDate: script.requested_date ? new Date(script.requested_date).toLocaleDateString() : 'No date',
      dueDate: script.due_date ? new Date(script.due_date).toLocaleDateString() : 'No due date',
      instructions: script.instructions,
      notes: script.notes
    };
  });

  // Calculate dynamic counts for each status
  const getOrderCount = (status: string) => {
    return labOrders.filter(order => order.status === status).length;
  };

  // Calculate incomplete count (pending + in-progress + hold + delayed)
  const getIncompleteCount = () => {
    return labOrders.filter(order => 
      order.status === "in-progress" || 
      order.status === "pending" || 
      order.status === "hold" || 
      order.status === "delayed"
    ).length;
  };

  const stats = [
    { title: "New Scripts", value: getOrderCount("pending").toString(), icon: Clock, color: "bg-amber-500", bgColor: "bg-amber-50", filter: "pending" },
    { title: "In-Process", value: getOrderCount("in-progress").toString(), icon: FlaskConical, color: "bg-blue-500", bgColor: "bg-blue-50", filter: "in-progress" },
    { title: "Hold", value: getOrderCount("hold").toString(), icon: AlertCircle, color: "bg-purple-500", bgColor: "bg-purple-50", filter: "hold" },
    { title: "Incomplete", value: getIncompleteCount().toString(), icon: Clock, color: "bg-orange-500", bgColor: "bg-orange-50", filter: "incomplete" },
    { title: "Completed", value: getOrderCount("completed").toString(), icon: CheckCircle, color: "bg-emerald-500", bgColor: "bg-emerald-50", filter: "completed" },
    { title: "All Lab Scripts", value: labOrders.length.toString(), icon: FlaskConical, color: "bg-indigo-500", bgColor: "bg-indigo-50", filter: "all" },
  ];

  // Filter lab orders based on active filter and search query
  const filteredOrders = labOrders.filter(order => {
    // First apply status filter
    const statusMatch = activeFilter === "all"
      ? true
      : activeFilter === "incomplete"
      ? order.status === "in-progress" ||
        order.status === "pending" ||
        order.status === "hold" ||
        order.status === "delayed"
      : order.status === activeFilter;

    // Then apply search filter
    const searchMatch = searchQuery.trim() === ""
      ? true
      : order.patient?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Lab Scripts"
          search={{
            placeholder: "Search by patient name...",
            value: searchQuery,
            onChange: setSearchQuery
          }}
          action={{
            label: "New Lab Script",
            onClick: handleNewOrder
          }}
        />
      </div>
      <div className="flex-1 p-6">
        {/* Stats Cards */}
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

        {/* Lab Scripts Table - Extended to viewport height */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading lab scripts...</h3>
              <p className="text-gray-500">Please wait while we fetch your lab scripts.</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <>
              {/* Table Header - Fixed */}
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-3 flex-shrink-0 pr-6">
                <div className="grid grid-cols-11 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider h-6">
                  <div className="col-span-2 border-r border-gray-300 pr-4 flex items-center">Patient Name</div>
                  <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Arch Type</div>
                  <div className="col-span-3 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Appliance Type</div>
                  <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Requested Date</div>
                  <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Due Date</div>
                  <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Status</div>
                  <div className="col-span-1 text-center border-r border-gray-300 pr-4 flex items-center justify-center">Actions</div>
                  <div className="col-span-1 text-center flex items-center justify-center">Preview</div>
                </div>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced">
                {filteredOrders.map((order) => {
                  const originalScript = labScripts.find(script => script.id === order.id);

                  // Format appliance type display
                  const getApplianceDisplay = () => {
                    const upper = order.upperApplianceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                    const lower = order.lowerApplianceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
                    return `${upper} | ${lower}`;
                  };

                  return (
                    <div key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 h-16">
                      <div className="grid grid-cols-11 gap-4 px-3 py-4 text-sm items-center h-full">
                        {/* Patient */}
                        <div className="col-span-2 border-r border-gray-300 pr-4 h-full flex items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FlaskConical className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium truncate">{order.patient}</p>
                            </div>
                          </div>
                        </div>

                        {/* Arch */}
                        <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                            order.archType === 'upper' ? 'bg-blue-100 text-blue-700' :
                            order.archType === 'lower' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {order.archType === 'upper' ? 'Upper Arch' :
                             order.archType === 'lower' ? 'Lower Arch' :
                             order.archType === 'dual' ? 'Dual Arch' :
                             order.archType?.charAt(0).toUpperCase() + order.archType?.slice(1)}
                          </span>
                        </div>

                        {/* Appliance Type */}
                        <div className="col-span-3 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          <p className="text-gray-900 font-medium text-xs leading-tight">{getApplianceDisplay()}</p>
                        </div>

                        {/* Requested Date */}
                        <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          <p className="text-gray-600 text-xs">{order.requestedDate}</p>
                        </div>

                        {/* Due Date */}
                        <div className="col-span-1 text-center border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          <p className="text-gray-600 text-xs">{order.dueDate}</p>
                        </div>

                        {/* Status */}
                        <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delayed' ? 'bg-red-100 text-red-700' :
                            order.status === 'hold' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 border-r border-gray-300 pr-4 h-full flex items-center justify-center">
                          {renderActionButtons(order.id, originalScript)}
                        </div>

                        {/* Preview */}
                        <div className="col-span-1 h-full flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => originalScript && handleViewLabScript(originalScript)}
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
            </>
          ) : (
            <div className="text-center py-12">
              <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeFilter === "all" ? "" : activeFilter} lab scripts found
              </h3>
              <p className="text-gray-500">
                {activeFilter === "all"
                  ? "No lab scripts available at the moment."
                  : `No lab scripts with ${activeFilter} status found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Lab Script Form */}
      <NewLabScriptForm
        open={showNewScriptForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* Lab Script Detail */}
      <LabScriptDetail
        open={showLabScriptDetail}
        onClose={handleLabScriptDetailClose}
        labScript={selectedLabScript}
        onUpdate={handleLabScriptUpdate}
      />
    </div>
  );
}
