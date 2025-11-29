import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NewLabScriptForm } from "@/components/NewLabScriptForm";
import { LabScriptDetail } from "@/components/LabScriptDetail";
import { EditLabScriptForm } from "@/components/EditLabScriptForm";
import { LabScriptFilterDialog } from "@/components/LabScriptFilterDialog";
import { LabScriptCompletionDialog } from "@/components/LabScriptCompletionDialog";
import { DeleteLabScriptDialog } from "@/components/DeleteLabScriptDialog";
import { StartLabScriptDialog } from "@/components/StartLabScriptDialog";
import { useLabScripts } from "@/hooks/useLabScripts";
import { LabScript } from "@/hooks/useLabScripts";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { FlaskConical, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search, MoreHorizontal, Trash2, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface LabScriptFilters {
  status: string[];
  archType: string[];
  treatmentType: string[];
  applianceType: string[];
  screwType: string[];
  material: string[];
}

export function LabPage() {
  const { canCreateLabScripts, canUpdateLabScripts, canDeleteLabScripts } = usePermissions();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [activeFilter, setActiveFilter] = useState("pending");
  const [showNewScriptForm, setShowNewScriptForm] = useState(false);
  const [showLabScriptDetail, setShowLabScriptDetail] = useState(false);
  const [showEditLabScriptForm, setShowEditLabScriptForm] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [completingLabScriptId, setCompletingLabScriptId] = useState<string | null>(null);
  const [labScriptToDelete, setLabScriptToDelete] = useState<LabScript | null>(null);
  const [labScriptToStart, setLabScriptToStart] = useState<{ id: string; patientName: string } | null>(null);
  const [selectedLabScript, setSelectedLabScript] = useState<LabScript | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [designStates, setDesignStates] = useState<Record<string, 'not-started' | 'in-progress' | 'hold' | 'completed'>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStatus, setEditingStatus] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<'patient' | 'requestedDate' | 'dueDate' | null>('requestedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<LabScriptFilters>({
    status: [],
    archType: [],
    treatmentType: [],
    applianceType: [],
    screwType: [],
    material: []
  });
  const { labScripts, loading, addLabScript, updateLabScript, deleteLabScript } = useLabScripts();

  const handleNewOrder = () => {
    setShowNewScriptForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const newLabScript = await addLabScript({
        patient_id: formData.patientId,
        patient_name: formData.patientName,
        arch_type: formData.archType,
        upper_treatment_type: formData.upperTreatmentType || null,
        lower_treatment_type: formData.lowerTreatmentType || null,
        upper_appliance_type: formData.upperApplianceType || null,
        lower_appliance_type: formData.lowerApplianceType || null,
        screw_type: formData.screwType || null,
        custom_screw_type: formData.customScrewType || null,
        material: formData.material || null,
        shade: formData.shade || null,
        vdo_details: formData.vdoDetails || null,
        is_nightguard_needed: formData.isNightguardNeeded || null,
        requested_date: formData.requestedDate,
        due_date: formData.dueDate || null,
        instructions: formData.instructions,
        notes: formData.notes || null,
        status: 'pending',
        created_by: userProfile?.id || null,
        created_by_name: userProfile?.full_name || null
      });

      toast.success("Lab script created successfully!");
      setShowNewScriptForm(false);
      return newLabScript; // Return the created lab script so the form can access the ID
    } catch (error) {
      console.error("Error creating lab script:", error);
      toast.error("Failed to create lab script. Please try again.");
      throw error; // Re-throw so the form can handle the error
    }
  };

  const handleFormClose = () => {
    setShowNewScriptForm(false);
  };

  const handleViewLabScript = (labScript: LabScript) => {
    setSelectedLabScript(labScript);
    setIsEditMode(false);
    setShowLabScriptDetail(true);
  };

  const handleEditLabScript = (labScript: LabScript) => {
    setSelectedLabScript(labScript);
    setShowEditLabScriptForm(true);
  };

  const handleDeleteLabScript = (labScript: LabScript) => {
    setLabScriptToDelete(labScript);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLabScript = async () => {
    if (!labScriptToDelete) return;
    try {
      await deleteLabScript(labScriptToDelete.id);
      toast.success("Lab script deleted successfully!");
    } catch (error) {
      console.error('Error deleting lab script:', error);
      toast.error("Failed to delete lab script");
      throw error;
    }
  };

  const handleLabScriptDetailClose = () => {
    setShowLabScriptDetail(false);
    setSelectedLabScript(null);
    setIsEditMode(false);
  };

  const handleEditFormClose = () => {
    setShowEditLabScriptForm(false);
    setSelectedLabScript(null);
  };

  const handleSort = (field: 'patient' | 'requestedDate' | 'dueDate') => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterClick = () => {
    setShowFilterDialog(true);
  };

  const handleApplyFilters = (newFilters: LabScriptFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      archType: [],
      treatmentType: [],
      applianceType: [],
      screwType: [],
      material: []
    });
  };

  const handleEditFormSubmit = async (id: string, formData: any) => {
    try {
      // Convert form data to lab script format
      const updateData = {
        patient_id: formData.patientId,
        patient_name: formData.patientName,
        arch_type: formData.archType,
        upper_treatment_type: formData.upperTreatmentType || null,
        lower_treatment_type: formData.lowerTreatmentType || null,
        upper_appliance_type: formData.upperApplianceType || null,
        lower_appliance_type: formData.lowerApplianceType || null,
        screw_type: formData.screwType || null,
        custom_screw_type: formData.customScrewType || null,
        material: formData.material || null,
        shade: formData.shade || null,
        vdo_details: formData.vdoDetails || null,
        is_nightguard_needed: formData.isNightguardNeeded || null,
        requested_date: formData.requestedDate,
        due_date: formData.dueDate || null,
        instructions: formData.instructions,
        notes: formData.notes || null
      };

      await updateLabScript(id, updateData);
      setShowEditLabScriptForm(false);
      setSelectedLabScript(null);
      return updateData;
    } catch (error) {
      console.error('Error updating lab script:', error);
      throw error;
    }
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

  const handleDesignStateChange = async (orderId: string, newState: 'not-started' | 'in-progress' | 'hold' | 'completed', patientName?: string) => {
    // If completing, show the completion dialog
    if (newState === 'completed') {
      setCompletingLabScriptId(orderId);
      setShowCompletionDialog(true);
      return;
    }

    // If starting (from pending to in-progress), show the start dialog
    if (newState === 'in-progress' && patientName) {
      const script = labScripts.find(s => s.id === orderId);
      if (script?.status === 'pending') {
        setLabScriptToStart({ id: orderId, patientName });
        setShowStartDialog(true);
        return;
      }
    }

    // For other state changes, proceed directly
    await performDesignStateChange(orderId, newState);
  };

  const performDesignStateChange = async (orderId: string, newState: 'not-started' | 'in-progress' | 'hold' | 'completed') => {
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
        'not-started': 'Status reset to pending!'
      };

      toast.success(messages[newState] || 'Status updated!');
    } catch (error) {
      console.error('Error updating lab script status:', error);
      toast.error("Failed to update status");
      throw error;
    }
  };

  const confirmStartLabScript = async () => {
    if (!labScriptToStart) return;
    await performDesignStateChange(labScriptToStart.id, 'in-progress');
  };

  const handleConfirmCompletion = async (completionDate: string) => {
    if (!completingLabScriptId) return;

    try {
      await updateLabScript(completingLabScriptId, {
        status: 'completed',
        completion_date: completionDate,
        completed_by: userProfile?.id || null,
        completed_by_name: userProfile?.full_name || null
      });

      // Update local design state
      setDesignStates(prev => ({ ...prev, [completingLabScriptId]: 'completed' }));

      // Exit edit mode when updating status
      setEditingStatus(prev => ({
        ...prev,
        [completingLabScriptId]: false
      }));

      toast.success('Design completed and status updated!');

      // Reset completion dialog state
      setCompletingLabScriptId(null);
    } catch (error) {
      console.error('Error completing lab script:', error);
      toast.error("Failed to complete lab script");
    }
  };

  const handleEditStatus = (orderId: string) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Function to get status-based icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, bgColor: 'bg-emerald-600', textColor: 'text-white' };
      case 'in-progress':
        return { icon: Play, bgColor: 'bg-blue-600', textColor: 'text-white' };
      case 'hold':
        return { icon: AlertCircle, bgColor: 'bg-purple-600', textColor: 'text-white' };
      case 'delayed':
        return { icon: Clock, bgColor: 'bg-red-600', textColor: 'text-white' };
      case 'pending':
      default:
        return { icon: Clock, bgColor: 'bg-amber-600', textColor: 'text-white' };
    }
  };

  const renderActionButtons = (orderId: string, originalScript: LabScript | undefined) => {
    const currentStatus = originalScript?.status;
    const patientName = originalScript?.patient_name || '';
    const isEditingStatus = editingStatus[orderId] || false;

    // If lab script is completed, show edit button or hold/complete when editing
    if (currentStatus === 'completed' && !isEditingStatus) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditStatus(orderId)}
          className="h-8 w-8 p-0"
          title="Edit Status"
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    }

    if (currentStatus === 'completed' && isEditingStatus) {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDesignStateChange(orderId, 'hold', patientName)}
            className="h-8 w-8 p-0"
            title="Hold"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDesignStateChange(orderId, 'completed', patientName)}
            className="h-8 w-8 p-0"
            title="Complete"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </>
      );
    }

    // Use actual lab script status instead of local designState
    switch (currentStatus) {
      case 'pending':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDesignStateChange(orderId, 'in-progress', patientName)}
            className="h-8 w-8 p-0"
            title="Start Design"
          >
            <Play className="h-4 w-4" />
          </Button>
        );

      case 'in-progress':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'hold', patientName)}
              className="h-8 w-8 p-0"
              title="Hold"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'completed', patientName)}
              className="h-8 w-8 p-0"
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </>
        );

      case 'hold':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'in-progress', patientName)}
              className="h-8 w-8 p-0"
              title="Resume Design"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDesignStateChange(orderId, 'completed', patientName)}
              className="h-8 w-8 p-0"
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </>
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
      material: script.material,
      shade: script.shade,
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

  // Calculate delayed count (due date has passed and not completed)
  const getDelayedCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    return labScripts.filter(script => {
      if (script.status === "completed") return false; // Completed scripts are not delayed
      if (!script.due_date) return false; // No due date means not delayed

      const dueDate = new Date(script.due_date);
      dueDate.setHours(0, 0, 0, 0); // Set to start of due date

      return dueDate < today; // Due date is before today
    }).length;
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
    { title: "In-Process", value: getOrderCount("in-progress").toString(), icon: Play, color: "bg-blue-500", bgColor: "bg-blue-50", filter: "in-progress" },
    { title: "Hold", value: getOrderCount("hold").toString(), icon: AlertCircle, color: "bg-purple-500", bgColor: "bg-purple-50", filter: "hold" },
    { title: "Delayed", value: getDelayedCount().toString(), icon: AlertCircle, color: "bg-red-500", bgColor: "bg-red-50", filter: "delayed" },
    { title: "Incomplete", value: getIncompleteCount().toString(), icon: Clock, color: "bg-orange-500", bgColor: "bg-orange-50", filter: "incomplete" },
    { title: "Completed", value: getOrderCount("completed").toString(), icon: CheckCircle, color: "bg-emerald-500", bgColor: "bg-emerald-50", filter: "completed" },
    { title: "All Lab Scripts", value: labOrders.length.toString(), icon: FlaskConical, color: "bg-indigo-500", bgColor: "bg-indigo-50", filter: "all" },
  ];

  // Filter lab orders based on active filter, search query, and advanced filters
  const filteredOrders = labOrders.filter(order => {
    // First apply status filter
    let statusMatch = false;

    if (activeFilter === "all") {
      statusMatch = true;
    } else if (activeFilter === "incomplete") {
      statusMatch = order.status === "in-progress" ||
        order.status === "pending" ||
        order.status === "hold" ||
        order.status === "delayed";
    } else if (activeFilter === "delayed") {
      // Check if due date has passed
      const script = labScripts.find(s => s.id === order.id);
      if (!script || script.status === "completed" || !script.due_date) {
        statusMatch = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(script.due_date);
        dueDate.setHours(0, 0, 0, 0);
        statusMatch = dueDate < today;
      }
    } else {
      statusMatch = order.status === activeFilter;
    }

    // Then apply search filter
    const searchMatch = searchQuery.trim() === ""
      ? true
      : order.patient?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!statusMatch || !searchMatch) return false;

    // Apply advanced filters
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(order.status)) {
      return false;
    }

    // Arch type filter
    if (filters.archType.length > 0 && !filters.archType.includes(order.archType)) {
      return false;
    }

    // Treatment type filter - check both upper and lower treatment types
    if (filters.treatmentType.length > 0) {
      const script = labScripts.find(s => s.id === order.id);
      if (!script) return false;

      const hasMatchingTreatmentType =
        (script.upper_treatment_type && filters.treatmentType.includes(script.upper_treatment_type)) ||
        (script.lower_treatment_type && filters.treatmentType.includes(script.lower_treatment_type));

      if (!hasMatchingTreatmentType) return false;
    }

    // Appliance type filter - check both upper and lower appliance types
    if (filters.applianceType.length > 0) {
      const hasMatchingApplianceType =
        (order.upperApplianceType && filters.applianceType.includes(order.upperApplianceType)) ||
        (order.lowerApplianceType && filters.applianceType.includes(order.lowerApplianceType));

      if (!hasMatchingApplianceType) return false;
    }

    // Screw type filter
    if (filters.screwType.length > 0 && (!order.screwType || !filters.screwType.includes(order.screwType))) {
      return false;
    }

    // Material filter
    if (filters.material.length > 0 && (!order.material || !filters.material.includes(order.material))) {
      return false;
    }

    return true;
  });

  // Apply sorting if a sort field is selected
  const sortedOrders = sortField ? [...filteredOrders].sort((a, b) => {
    let compareResult = 0;

    if (sortField === 'patient') {
      const nameA = a.patient?.toLowerCase() || '';
      const nameB = b.patient?.toLowerCase() || '';
      compareResult = nameA.localeCompare(nameB);
    } else if (sortField === 'requestedDate') {
      const dateA = a.requestedDate === 'No date' ? new Date(0) : new Date(labScripts.find(s => s.id === a.id)?.requested_date || 0);
      const dateB = b.requestedDate === 'No date' ? new Date(0) : new Date(labScripts.find(s => s.id === b.id)?.requested_date || 0);
      compareResult = dateA.getTime() - dateB.getTime();
    } else if (sortField === 'dueDate') {
      const dateA = a.dueDate === 'No due date' ? new Date(0) : new Date(labScripts.find(s => s.id === a.id)?.due_date || 0);
      const dateB = b.dueDate === 'No due date' ? new Date(0) : new Date(labScripts.find(s => s.id === b.id)?.due_date || 0);
      compareResult = dateA.getTime() - dateB.getTime();
    }

    return sortOrder === 'asc' ? compareResult : -compareResult;
  }) : filteredOrders;

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
          secondaryAction={{
            label: "Filter",
            icon: Filter,
            onClick: handleFilterClick
          }}
          action={canCreateLabScripts() ? {
            label: "New Lab Script",
            onClick: handleNewOrder
          } : undefined}
        />
      </div>
      <div className="flex-1 px-6 pt-6 pb-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading lab scripts...</h3>
              <p className="text-gray-500">Please wait while we fetch your lab scripts.</p>
            </div>
          ) : sortedOrders.length > 0 ? (
            <>
              {/* Table Header - Fixed with responsive columns */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex-shrink-0 table-header">
                <div className="grid text-sm font-bold text-blue-600 h-6 gap-2 lg:gap-3"
                     style={{
                       gridTemplateColumns: 'minmax(180px, 2fr) minmax(80px, 0.8fr) minmax(130px, 1.5fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(140px, 1.4fr)'
                     }}>
                  <div className="text-center flex items-center justify-center px-2 border-r border-slate-300 relative">
                    <span className="truncate uppercase">Patient Name</span>
                    <button
                      onClick={() => handleSort('patient')}
                      className="absolute right-2 flex-shrink-0 hover:bg-blue-50 rounded p-1.5 transition-colors border border-transparent hover:border-blue-200"
                      title={sortField === 'patient' && sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
                    >
                      {sortField === 'patient' && sortOrder === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {sortField === 'patient' && sortOrder === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {sortField !== 'patient' && <ArrowUp className="h-4 w-4 text-blue-400" />}
                    </button>
                  </div>
                  <div className="border-r border-slate-300 text-center flex items-center justify-center px-2">
                    <span className="truncate uppercase">Arch Type</span>
                  </div>
                  <div className="border-r border-slate-300 text-center flex items-center justify-center px-2">
                    <span className="truncate uppercase">Appliance Type</span>
                  </div>
                  <div className="border-r border-slate-300 text-center flex items-center justify-center px-2 relative">
                    <span className="truncate pr-6 uppercase">Requested Date</span>
                    <button
                      onClick={() => handleSort('requestedDate')}
                      className="absolute right-1 flex-shrink-0 hover:bg-blue-50 rounded p-1.5 transition-colors border border-transparent hover:border-blue-200"
                      title={sortField === 'requestedDate' && sortOrder === 'asc' ? 'Sort Newest First' : 'Sort Oldest First'}
                    >
                      {sortField === 'requestedDate' && sortOrder === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {sortField === 'requestedDate' && sortOrder === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {sortField !== 'requestedDate' && <ArrowUp className="h-4 w-4 text-blue-400" />}
                    </button>
                  </div>
                  <div className="border-r border-slate-300 text-center flex items-center justify-center px-2 relative">
                    <span className="truncate pr-6 uppercase">Due Date</span>
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="absolute right-1 flex-shrink-0 hover:bg-blue-50 rounded p-1.5 transition-colors border border-transparent hover:border-blue-200"
                      title={sortField === 'dueDate' && sortOrder === 'asc' ? 'Sort Newest First' : 'Sort Oldest First'}
                    >
                      {sortField === 'dueDate' && sortOrder === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                      {sortField === 'dueDate' && sortOrder === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
                      {sortField !== 'dueDate' && <ArrowUp className="h-4 w-4 text-blue-400" />}
                    </button>
                  </div>
                  <div className="border-r border-slate-300 text-center flex items-center justify-center px-2">
                    <span className="truncate uppercase">Status</span>
                  </div>
                  <div className="text-center flex items-center justify-center px-2">
                    <span className="truncate uppercase">Actions</span>
                  </div>
                </div>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-enhanced table-body">
                {sortedOrders.map((order) => {
                  const originalScript = labScripts.find(script => script.id === order.id);

                  // Format appliance type display based on arch type
                  const getApplianceDisplay = () => {
                    const upper = order.upperApplianceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const lower = order.lowerApplianceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    if (order.archType === 'dual') {
                      // Show both upper and lower for dual arch
                      return {
                        upper: upper || 'N/A',
                        lower: lower || 'N/A',
                        showBoth: true
                      };
                    } else if (order.archType === 'upper') {
                      // Show only upper for upper arch
                      return {
                        upper: upper || 'N/A',
                        lower: null,
                        showBoth: false
                      };
                    } else if (order.archType === 'lower') {
                      // Show only lower for lower arch
                      return {
                        upper: null,
                        lower: lower || 'N/A',
                        showBoth: false
                      };
                    } else {
                      // Fallback for unknown arch types
                      return {
                        upper: upper || 'N/A',
                        lower: lower || 'N/A',
                        showBoth: true
                      };
                    }
                  };

                  return (
                    <div key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 min-h-[64px]">
                      <div className="grid gap-2 lg:gap-3 px-4 py-3 text-sm items-center min-h-[64px]"
                           style={{
                             gridTemplateColumns: 'minmax(180px, 2fr) minmax(80px, 0.8fr) minmax(130px, 1.5fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(140px, 1.4fr)'
                           }}>

                        {/* Patient */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center min-w-0">
                          <div
                            className="flex items-center space-x-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => originalScript && handleViewLabScript(originalScript)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                originalScript && handleViewLabScript(originalScript);
                              }
                            }}
                          >
                            {(() => {
                              const statusConfig = getStatusIcon(order.status);
                              const StatusIcon = statusConfig.icon;
                              return (
                                <div className={`w-6 h-6 ${statusConfig.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <StatusIcon className={`h-3 w-3 ${statusConfig.textColor}`} />
                                </div>
                              );
                            })()}
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium truncate text-sm">{order.patient}</p>
                            </div>
                          </div>
                        </div>

                        {/* Arch */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center justify-center min-w-0">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium min-w-0 max-w-full ${
                            order.archType === 'upper' ? 'bg-blue-100 text-blue-700' :
                            order.archType === 'lower' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            <span className="truncate">
                              {order.archType === 'upper' ? 'Upper' :
                               order.archType === 'lower' ? 'Lower' :
                               order.archType === 'dual' ? 'Dual' :
                               order.archType?.charAt(0).toUpperCase() + order.archType?.slice(1)}
                            </span>
                          </span>
                        </div>

                        {/* Appliance Type */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center justify-center min-w-0">
                          <div className="text-center min-w-0 max-w-full">
                            {getApplianceDisplay().upper && (
                              <div className="text-gray-900 font-medium text-xs leading-tight truncate">
                                {getApplianceDisplay().upper}
                              </div>
                            )}
                            {getApplianceDisplay().lower && (
                              <div className="text-gray-900 font-medium text-xs leading-tight truncate">
                                {getApplianceDisplay().lower}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Requested Date */}
                        <div className="text-center border-r border-gray-200 px-2 h-full flex items-center justify-center min-w-0">
                          <p className="text-gray-600 text-xs truncate">{order.requestedDate}</p>
                        </div>

                        {/* Due Date */}
                        <div className="text-center border-r border-gray-200 px-2 h-full flex items-center justify-center min-w-0">
                          <p className="text-gray-600 text-xs truncate">{order.dueDate}</p>
                        </div>

                        {/* Status */}
                        <div className="border-r border-gray-200 px-2 h-full flex items-center justify-center min-w-0">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium min-w-0 max-w-full ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delayed' ? 'bg-red-100 text-red-700' :
                            order.status === 'hold' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            <span className="truncate">{order.status}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="px-2 h-full flex items-center justify-end min-w-0">
                          <div className="flex gap-1">
                            {renderActionButtons(order.id, originalScript)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => originalScript && handleViewLabScript(originalScript)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 flex-shrink-0"
                                  title="More Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <PermissionGuard permission="lab_scripts.update">
                                  <DropdownMenuItem
                                    onClick={() => originalScript && handleEditLabScript(originalScript)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </PermissionGuard>
                                <PermissionGuard permission="lab_scripts.delete">
                                  <DropdownMenuItem
                                    onClick={() => originalScript && handleDeleteLabScript(originalScript)}
                                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </PermissionGuard>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
        initialEditMode={isEditMode}
      />

      {/* Edit Lab Script Form */}
      <EditLabScriptForm
        open={showEditLabScriptForm}
        onClose={handleEditFormClose}
        onSubmit={handleEditFormSubmit}
        labScript={selectedLabScript}
      />

      {/* Filter Dialog */}
      <LabScriptFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Completion Confirmation Dialog */}
      <LabScriptCompletionDialog
        isOpen={showCompletionDialog}
        onClose={() => {
          setShowCompletionDialog(false);
          setCompletingLabScriptId(null);
        }}
        onConfirm={handleConfirmCompletion}
        patientName={
          completingLabScriptId
            ? labScripts.find(s => s.id === completingLabScriptId)?.patient_name || ''
            : ''
        }
      />

      {/* Delete Lab Script Confirmation Dialog */}
      <DeleteLabScriptDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setLabScriptToDelete(null);
        }}
        onConfirm={confirmDeleteLabScript}
        patientName={labScriptToDelete?.patient_name || ''}
      />

      {/* Start Lab Script Confirmation Dialog */}
      <StartLabScriptDialog
        isOpen={showStartDialog}
        onClose={() => {
          setShowStartDialog(false);
          setLabScriptToStart(null);
        }}
        onConfirm={confirmStartLabScript}
        patientName={labScriptToStart?.patientName || ''}
      />
    </div>
  );
}
