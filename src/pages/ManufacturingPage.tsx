import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/particle-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Factory, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search, FileText, User, Settings, Truck, Download, FlaskConical, ClipboardCheck, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useManufacturingItems } from "@/hooks/useManufacturingItems";
import { useMillingForms } from "@/hooks/useMillingForms";
import { generateManufacturingScriptPDF } from "@/utils/pdfGenerator";
import { PrintingCompletionDialog } from "@/components/PrintingCompletionDialog";
import { InspectionDialog } from "@/components/InspectionDialog";
import { ManufacturingFilterDialog, ManufacturingFilters } from "@/components/ManufacturingFilterDialog";

export function ManufacturingPage() {
  const [activeFilter, setActiveFilter] = useState("new-script");
  const [showNewManufacturingForm, setShowNewManufacturingForm] = useState(false);
  const [showMillingDialog, setShowMillingDialog] = useState(false);
  const [selectedMillingItem, setSelectedMillingItem] = useState<any>(null);
  const [millingLocation, setMillingLocation] = useState("");
  const [gingivaColor, setGingivaColor] = useState("");
  const [stainedAndGlazed, setStainedAndGlazed] = useState("");
  const [cementation, setCementation] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedViewItem, setSelectedViewItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShippingDialog, setShowShippingDialog] = useState(false);
  const [selectedShippingItem, setSelectedShippingItem] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [showPrintingCompletionDialog, setShowPrintingCompletionDialog] = useState(false);
  const [selectedPrintingItem, setSelectedPrintingItem] = useState<any>(null);
  const [showInspectionDialog, setShowInspectionDialog] = useState(false);
  const [selectedInspectionItem, setSelectedInspectionItem] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState<any>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [sortField, setSortField] = useState<'patient' | 'createdDate' | null>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<ManufacturingFilters>({
    status: [],
    archType: [],
    applianceType: [],
    material: [],
    shade: [],
    manufacturingMethod: [],
    millingLocation: [],
    inspectionStatus: [],
  });
  const { manufacturingItems, loading, updateManufacturingItemStatus, updateManufacturingItemWithMillingDetails, completePrinting, completeInspection } = useManufacturingItems();
  const { createMillingForm } = useMillingForms();

  const handleNewManufacturing = () => {
    setShowNewManufacturingForm(true);
  };

  const handleStartMilling = (item: any) => {
    setSelectedMillingItem(item);
    setMillingLocation(""); // Reset selection
    setGingivaColor("");
    setStainedAndGlazed("");
    setCementation("");
    setAdditionalNotes("");
    setShowMillingDialog(true);
  };

  // Check if the case is tie bar and superstructure
  const isTieBarSuperstructure = (item: any) => {
    return item?.upper_appliance_type === 'ti-bar-superstructure' ||
           item?.lower_appliance_type === 'ti-bar-superstructure';
  };

  const handleViewManufacturingScript = (item: any) => {
    setSelectedViewItem(item);
    setShowViewDialog(true);
  };

  const handleDownloadPDF = async (item: any) => {
    try {
      console.log('PDF generation data:', {
        patient_name: item.patient_name,
        material: item.material,
        shade: item.shade,
        screw: item.screw,
        arch_type: item.arch_type,
        upper_appliance_type: item.upper_appliance_type,
        lower_appliance_type: item.lower_appliance_type,
        milling_location: item.milling_location,
        status: item.status
      });

      await generateManufacturingScriptPDF({
        patient_name: item.patient_name,
        shade: item.shade,
        screw: item.screw,
        material: item.material,
        arch_type: item.arch_type,
        upper_appliance_type: item.upper_appliance_type,
        lower_appliance_type: item.lower_appliance_type,
        upper_appliance_number: item.upper_appliance_number,
        lower_appliance_number: item.lower_appliance_number,
        milling_location: item.milling_location,
        gingiva_color: item.gingiva_color,
        stained_and_glazed: item.stained_and_glazed,
        cementation: item.cementation,
        additional_notes: item.additional_notes,
        status: item.status,
        manufacturing_method: item.manufacturing_method,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: 'pending-printing' | 'pending-milling' | 'printing' | 'milling' | 'in-transit' | 'inspection' | 'completed') => {
    try {
      await updateManufacturingItemStatus(itemId, newStatus);
      toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleShippedByLab = (item: any) => {
    setSelectedShippingItem(item);
    setTrackingNumber("");
    setTrackingLink("");
    setShowShippingDialog(true);
  };

  const handleSubmitShipping = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      // Update the item with tracking information and change status to in-transit
      await updateManufacturingItemWithMillingDetails(
        selectedShippingItem.id,
        'in-transit',
        {
          tracking_number: trackingNumber,
          tracking_link: trackingLink || null
        }
      );
      toast.success('Item marked as shipped with tracking information');
      setShowShippingDialog(false);
      setSelectedShippingItem(null);
      setTrackingNumber("");
      setTrackingLink("");
    } catch (error) {
      toast.error('Failed to update shipping status');
    }
  };

  const handleCompletePrinting = (item: any) => {
    setSelectedPrintingItem(item);
    setShowPrintingCompletionDialog(true);
  };

  const handlePrintingCompletionSubmit = async (completionData: {
    completion_date: string;
    completion_time: string;
    completed_by: string;
    completed_by_name: string;
  }) => {
    try {
      await completePrinting(selectedPrintingItem.id, completionData);
      toast.success('Printing completed successfully');
      setShowPrintingCompletionDialog(false);
      setSelectedPrintingItem(null);
    } catch (error) {
      toast.error('Failed to complete printing');
    }
  };

  const handleCompleteInspection = (item: any) => {
    setSelectedInspectionItem(item);
    setShowInspectionDialog(true);
  };

  const handleViewReport = (item: any) => {
    setSelectedReportItem(item);
    setShowReportDialog(true);
  };

  const handleInspectionSubmit = async (inspectionData: {
    print_quality: 'pass' | 'fail';
    physical_defects: 'pass' | 'fail';
    screw_access_channel: 'pass' | 'fail';
    mua_platform: 'pass' | 'fail';
    inspection_status: 'approved' | 'rejected';
    completion_date: string;
    completion_time: string;
    completed_by: string;
    completed_by_name: string;
  }) => {
    try {
      await completeInspection(selectedInspectionItem.id, inspectionData);
      setShowInspectionDialog(false);
      setSelectedInspectionItem(null);
    } catch (error) {
      toast.error('Failed to complete inspection');
    }
  };

  const handleSort = (field: 'patient' | 'createdDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterClick = () => {
    setShowFilterDialog(true);
  };

  const handleApplyFilters = (newFilters: ManufacturingFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      archType: [],
      applianceType: [],
      material: [],
      shade: [],
      manufacturingMethod: [],
      millingLocation: [],
      inspectionStatus: [],
    });
  };

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  // Calculate dynamic counts for manufacturing items
  const getManufacturingCount = (status: string) => {
    if (status === "all-cam-scripts") return manufacturingItems.length;
    if (status === "new-script") {
      return manufacturingItems.filter(item =>
        item.status === 'pending-printing' || item.status === 'pending-milling'
      ).length;
    }
    if (status === "printing") {
      return manufacturingItems.filter(item => item.status === 'printing').length;
    }
    if (status === "milling") {
      return manufacturingItems.filter(item => item.status === 'milling').length;
    }
    if (status === "in-transit") {
      return manufacturingItems.filter(item => item.status === 'in-transit').length;
    }
    if (status === "inspection") {
      return manufacturingItems.filter(item => item.status === 'inspection').length;
    }
    if (status === "incomplete") {
      return manufacturingItems.filter(item =>
        item.status === 'pending-printing' ||
        item.status === 'pending-milling' ||
        item.status === 'printing' ||
        item.status === 'milling' ||
        item.status === 'in-transit' ||
        item.status === 'inspection'
      ).length;
    }
    if (status === "completed") {
      return manufacturingItems.filter(item => item.status === 'completed').length;
    }
    return manufacturingItems.length;
  };

  // Stats configuration - 8 filters with new milling and in-transit phases
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
      title: "Milling",
      value: getManufacturingCount("milling"),
      filter: "milling",
      icon: Settings,
      color: "bg-cyan-500"
    },
    {
      title: "In Transit",
      value: getManufacturingCount("in-transit"),
      filter: "in-transit",
      icon: Truck,
      color: "bg-yellow-500"
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
      statusMatch = item.status === 'pending-printing' || item.status === 'pending-milling';
    } else if (activeFilter === "printing") {
      statusMatch = item.status === 'printing';
    } else if (activeFilter === "milling") {
      statusMatch = item.status === 'milling';
    } else if (activeFilter === "in-transit") {
      statusMatch = item.status === 'in-transit';
    } else if (activeFilter === "inspection") {
      statusMatch = item.status === 'inspection';
    } else if (activeFilter === "incomplete") {
      statusMatch = item.status === 'pending-printing' ||
                   item.status === 'pending-milling' ||
                   item.status === 'printing' ||
                   item.status === 'milling' ||
                   item.status === 'in-transit' ||
                   item.status === 'inspection';
    } else if (activeFilter === "completed") {
      statusMatch = item.status === 'completed';
    }
    // "all-cam-scripts" shows everything

    if (!searchMatch || !statusMatch) return false;

    // Apply advanced filters
    if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
    if (filters.archType.length > 0 && !filters.archType.includes(item.arch_type)) return false;
    if (filters.applianceType.length > 0) {
      const hasMatchingAppliance =
        (item.upper_appliance_type && filters.applianceType.includes(item.upper_appliance_type)) ||
        (item.lower_appliance_type && filters.applianceType.includes(item.lower_appliance_type));
      if (!hasMatchingAppliance) return false;
    }
    if (filters.material.length > 0 && (!item.material || !filters.material.includes(item.material))) return false;
    if (filters.shade.length > 0 && (!item.shade || !filters.shade.includes(item.shade))) return false;
    if (filters.manufacturingMethod.length > 0 && (!item.manufacturing_method || !filters.manufacturingMethod.includes(item.manufacturing_method))) return false;
    if (filters.millingLocation.length > 0 && (!item.milling_location || !filters.millingLocation.includes(item.milling_location))) return false;
    if (filters.inspectionStatus.length > 0 && (!item.inspection_status || !filters.inspectionStatus.includes(item.inspection_status))) return false;

    return true;
  });

  // Sort filtered items
  const sortedManufacturingItems = sortField ? [...filteredManufacturingItems].sort((a, b) => {
    let compareResult = 0;
    if (sortField === 'patient') {
      compareResult = (a.patient_name || '').localeCompare(b.patient_name || '');
    } else if (sortField === 'createdDate') {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      compareResult = dateA.getTime() - dateB.getTime();
    }
    return sortOrder === 'asc' ? compareResult : -compareResult;
  }) : filteredManufacturingItems;

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
          secondaryAction={{
            label: activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter",
            icon: Filter,
            onClick: handleFilterClick
          }}
          action={{
            label: "New Manufacturing",
            onClick: handleNewManufacturing
          }}
        />
      </div>
      <div className="flex-1 px-6 pt-6 pb-2">
        {/* Stats Cards - 8 filters */}
        <div className="grid grid-cols-8 gap-1 sm:gap-2 lg:gap-3 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col table-container-rounded" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {loading ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading manufacturing items...</h3>
              <p className="text-gray-500">Please wait while we fetch manufacturing data.</p>
            </div>
          ) : sortedManufacturingItems.length > 0 ? (
            <div className="flex-1 overflow-y-scroll p-6 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-enhanced table-body">
                {/* Sort Controls */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        {sortField === 'patient' ? 'Patient Name' : sortField === 'createdDate' ? 'Created Date' : 'Select'}
                        {sortField && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleSort('patient')}>
                        Patient Name {sortField === 'patient' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('createdDate')}>
                        Created Date {sortField === 'createdDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-sm text-gray-500 ml-2">
                    ({sortedManufacturingItems.length} items)
                  </span>
                </div>

                <div className="space-y-4">
                  {sortedManufacturingItems.map((item) => {
                    // Format appliance types for display
                    const formatApplianceType = (type: string | null | undefined) => {
                      if (!type) return 'N/A';
                      return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    const upperAppliance = formatApplianceType(item.upper_appliance_type);
                    const lowerAppliance = formatApplianceType(item.lower_appliance_type);

                    // Render action buttons based on status and manufacturing method
                    const renderActionButtons = () => {
                      switch (item.status) {
                        case 'pending-printing':
                          return (
                            <ParticleButton
                              className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              onClick={() => handleStatusChange(item.id, 'printing')}
                              onSuccess={() => {}}
                              successDuration={1000}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Printing
                            </ParticleButton>
                          );
                        case 'pending-milling':
                          return (
                            <ParticleButton
                              className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              onClick={() => handleStartMilling(item)}
                              onSuccess={() => {}}
                              successDuration={1000}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Milling
                            </ParticleButton>
                          );
                        case 'printing':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompletePrinting(item)}
                                className="border-2 border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50 px-4 py-2 text-sm font-semibold"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Printing
                              </Button>
                            </div>
                          );
                        case 'milling':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewManufacturingScript(item)}
                                className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm font-semibold"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Script
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShippedByLab(item)}
                                className="border-2 border-yellow-600 text-yellow-600 hover:border-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 px-4 py-2 text-sm font-semibold"
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Shipped by Lab
                              </Button>
                            </div>
                          );
                        case 'in-transit':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'inspection')}
                                className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm font-semibold"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Start Inspection
                              </Button>
                            </div>
                          );
                        case 'inspection':
                          return (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteInspection(item)}
                                className="border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 text-sm font-semibold"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete Inspection
                              </Button>
                            </div>
                          );
                        case 'completed':
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(item)}
                              className="border-2 border-indigo-600 text-indigo-600 hover:border-indigo-700 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 text-sm font-semibold"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Report
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
                                {/* Appliance Types */}
                                {item.upper_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Upper:</span> {upperAppliance}
                                  </span>
                                )}
                                {item.lower_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Lower:</span> {lowerAppliance}
                                  </span>
                                )}
                                {/* Shade */}
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Shade:</span> {item.shade}
                                </span>
                              </div>
                              {/* Appliance Numbers */}
                              {(item.upper_appliance_number || item.lower_appliance_number) && (
                                <div className="flex items-center space-x-4 mt-1">
                                  {item.upper_appliance_number && (
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Upper #:</span>
                                      <span className="ml-1 font-mono text-purple-600">{item.upper_appliance_number}</span>
                                    </span>
                                  )}
                                  {item.lower_appliance_number && (
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Lower #:</span>
                                      <span className="ml-1 font-mono text-purple-600">{item.lower_appliance_number}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Nightguard Information */}
                              {item.is_nightguard_needed === 'yes' && (
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Nightguard Needed:</span>
                                    <span className="ml-1 text-green-600 font-semibold">Yes</span>
                                  </span>
                                  {item.upper_nightguard_number && (
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Upper NG #:</span>
                                      <span className="ml-1 font-mono text-green-600">{item.upper_nightguard_number}</span>
                                    </span>
                                  )}
                                  {item.lower_nightguard_number && (
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium">Lower NG #:</span>
                                      <span className="ml-1 font-mono text-green-600">{item.lower_nightguard_number}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Status Badge */}
                              <div className="mt-2">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  item.status === 'in-production' ? 'bg-blue-100 text-blue-700' :
                                  item.status === 'milling' ? 'bg-cyan-100 text-cyan-700' :
                                  item.status === 'in-transit' ? 'bg-yellow-100 text-yellow-700' :
                                  item.status === 'quality-check' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.status === 'pending-printing' ? 'New Script' :
                                   item.status === 'pending-milling' ? 'New Script' :
                                   item.status === 'in-production' ? 'Printing' :
                                   item.status === 'milling' ? 'Milling' :
                                   item.status === 'in-transit' ? 'In Transit' :
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

                        {/* Additional info for completed items */}
                        {item.status === 'completed' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Left column - Printing info */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Printing Details</h4>
                                {item.printing_completed_by_name && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <User className="h-3 w-3 mr-2 text-gray-400" />
                                    <span className="font-medium">Printed by:</span>
                                    <span className="ml-1">{item.printing_completed_by_name}</span>
                                  </div>
                                )}
                                {item.printing_completed_at && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Clock className="h-3 w-3 mr-2 text-gray-400" />
                                    <span className="font-medium">Completed:</span>
                                    <span className="ml-1">
                                      {new Date(item.printing_completed_at).toLocaleString('en-US', {
                                        timeZone: 'America/New_York',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Right column - Inspection info */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Inspection Details</h4>
                                {item.inspection_status && (
                                  <div className="flex items-center text-xs">
                                    <CheckCircle className={`h-3 w-3 mr-2 ${item.inspection_status === 'approved' ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className="font-medium">Status:</span>
                                    <span className={`ml-1 font-semibold ${item.inspection_status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                      {item.inspection_status === 'approved' ? 'Approved' : 'Rejected'}
                                    </span>
                                  </div>
                                )}
                                {item.inspection_completed_by_name && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <User className="h-3 w-3 mr-2 text-gray-400" />
                                    <span className="font-medium">Inspected by:</span>
                                    <span className="ml-1">{item.inspection_completed_by_name}</span>
                                  </div>
                                )}
                                {item.inspection_completed_at && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Clock className="h-3 w-3 mr-2 text-gray-400" />
                                    <span className="font-medium">Completed:</span>
                                    <span className="ml-1">
                                      {new Date(item.inspection_completed_at).toLocaleString('en-US', {
                                        timeZone: 'America/New_York',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                 activeFilter === "milling" ? "No items currently in milling." :
                 activeFilter === "in-transit" ? "No items currently in transit." :
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

      {/* Start Milling Dialog */}
      <Dialog open={showMillingDialog} onOpenChange={setShowMillingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Start Milling Process</h2>
                <p className="text-gray-600">
                  {selectedMillingItem?.patient_name && `Patient: ${selectedMillingItem.patient_name}`}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-4">
              {/* Appliance Summary */}
              {selectedMillingItem && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Appliance Summary</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Patient Information</span>
                      </div>
                      <div className="pl-6 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedMillingItem.patient_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Arch Type:</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">{selectedMillingItem.arch_type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appliance Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Appliance Details</span>
                      </div>
                      <div className="pl-6 space-y-2 text-sm">
                        {selectedMillingItem.upper_appliance_type && (
                          <div>
                            <span className="text-gray-600">Upper Appliance:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedMillingItem.upper_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                        )}
                        {selectedMillingItem.lower_appliance_type && (
                          <div>
                            <span className="text-gray-600">Lower Appliance:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedMillingItem.lower_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                        )}
                        {selectedMillingItem.upper_appliance_number && (
                          <div>
                            <span className="text-gray-600">Upper Number:</span>
                            <span className="ml-2 font-mono font-medium text-gray-900">{selectedMillingItem.upper_appliance_number}</span>
                          </div>
                        )}
                        {selectedMillingItem.lower_appliance_number && (
                          <div>
                            <span className="text-gray-600">Lower Number:</span>
                            <span className="ml-2 font-mono font-medium text-gray-900">{selectedMillingItem.lower_appliance_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Material Specifications */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Material Specifications</span>
                      </div>
                      <div className="pl-6 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Shade:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedMillingItem.shade}</span>
                        </div>
                        {selectedMillingItem.material && (
                          <div>
                            <span className="text-gray-600">Material:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedMillingItem.material}</span>
                          </div>
                        )}
                        {selectedMillingItem.screw && (
                          <div>
                            <span className="text-gray-600">Screw Type:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedMillingItem.screw}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manufacturing Method */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Manufacturing</span>
                      </div>
                      <div className="pl-6 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">{selectedMillingItem.manufacturing_method}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">{selectedMillingItem.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Milling Location Selection */}
              <div>
                <Label htmlFor="milling-location" className="text-sm font-medium text-gray-700">
                  Milling Location <span className="text-red-500">*</span>
                </Label>
                <Select value={millingLocation} onValueChange={setMillingLocation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select milling location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-house">Inhouse</SelectItem>
                    <SelectItem value="micro-dental-lab">Micro Dental Lab</SelectItem>
                    <SelectItem value="evolution-dental-lab">Evolution Dental Lab</SelectItem>
                    <SelectItem value="haus-milling">Haus Milling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gingiva Color - Always visible for milling cases */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Gingiva Color
                </Label>
                <Select value={gingivaColor} onValueChange={setGingivaColor}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gingiva color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stained and Glazed - Always visible for milling cases */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Stained and Glazed
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setStainedAndGlazed(stainedAndGlazed === "yes" ? "" : "yes")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                      stainedAndGlazed === "yes"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      stainedAndGlazed === "yes" ? "border-white" : "border-gray-400"
                    }`}>
                      {stainedAndGlazed === "yes" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setStainedAndGlazed(stainedAndGlazed === "no" ? "" : "no")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                      stainedAndGlazed === "no"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      stainedAndGlazed === "no" ? "border-white" : "border-gray-400"
                    }`}>
                      {stainedAndGlazed === "no" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    No
                  </button>
                </div>
              </div>

              {/* Cementation - Only for Tie Bar and Superstructure */}
              {selectedMillingItem && isTieBarSuperstructure(selectedMillingItem) && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Cementation to be done
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setCementation(cementation === "yes" ? "" : "yes")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                        cementation === "yes"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        cementation === "yes" ? "border-white" : "border-gray-400"
                      }`}>
                        {cementation === "yes" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCementation(cementation === "no" ? "" : "no")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                        cementation === "no"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        cementation === "no" ? "border-white" : "border-gray-400"
                      }`}>
                        {cementation === "no" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <Label htmlFor="additional-notes" className="text-sm font-medium text-gray-700">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional-notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Enter any additional notes or special instructions..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={async () => {
                    if (millingLocation && selectedMillingItem) {
                      try {
                        // Update manufacturing item with milling details
                        await updateManufacturingItemWithMillingDetails(
                          selectedMillingItem.id,
                          'milling',
                          {
                            milling_location: millingLocation,
                            gingiva_color: gingivaColor,
                            stained_and_glazed: stainedAndGlazed,
                            cementation: cementation,
                            additional_notes: additionalNotes
                          }
                        );

                        // Create milling form record
                        await createMillingForm({
                          manufacturing_item_id: selectedMillingItem.id,
                          patient_name: selectedMillingItem.patient_name,
                          milling_location: millingLocation as 'in-house' | 'micro-dental-lab' | 'haus-milling' | 'evolution-dental-lab',
                          gingiva_color: gingivaColor as 'light' | 'medium' | 'custom' | undefined,
                          stained_and_glazed: stainedAndGlazed as 'yes' | 'no' | undefined,
                          cementation: cementation as 'yes' | 'no' | undefined,
                          additional_notes: additionalNotes || undefined,
                          upper_appliance_type: selectedMillingItem.upper_appliance_type,
                          lower_appliance_type: selectedMillingItem.lower_appliance_type,
                          upper_appliance_number: selectedMillingItem.upper_appliance_number,
                          lower_appliance_number: selectedMillingItem.lower_appliance_number,
                          shade: selectedMillingItem.shade,
                          screw: selectedMillingItem.screw,
                          material: selectedMillingItem.material,
                          arch_type: selectedMillingItem.arch_type
                        });

                        setShowMillingDialog(false);
                      } catch (error) {
                        // Error is handled by the hooks
                      }
                    }
                  }}
                  disabled={!millingLocation}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Milling
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Manufacturing Script Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manufacturing Script</h2>
                  <p className="text-gray-600">
                    {selectedViewItem?.patient_name && `Patient: ${selectedViewItem.patient_name}`}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => selectedViewItem && handleDownloadPDF(selectedViewItem)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            {selectedViewItem && (
              <div className="space-y-6">
                {/* Case Information */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-3">Case Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Patient:</span>
                      <span className="ml-2 font-medium">{selectedViewItem.patient_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Shade:</span>
                      <span className="ml-2 font-medium">{selectedViewItem.shade}</span>
                    </div>
                    {selectedViewItem.screw && (
                      <div>
                        <span className="text-gray-600">Screw Type:</span>
                        <span className="ml-2 font-medium">{selectedViewItem.screw}</span>
                      </div>
                    )}
                    {selectedViewItem.material && (
                      <div>
                        <span className="text-gray-600">Material:</span>
                        <span className="ml-2 font-medium">{selectedViewItem.material}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Arch Type:</span>
                      <span className="ml-2 font-medium">{selectedViewItem.arch_type}</span>
                    </div>
                    {selectedViewItem.upper_appliance_type && (
                      <div>
                        <span className="text-gray-600">Upper Appliance:</span>
                        <span className="ml-2 font-medium">
                          {selectedViewItem.upper_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          {selectedViewItem.upper_appliance_number && (
                            <span className="ml-1 text-purple-600">({selectedViewItem.upper_appliance_number})</span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedViewItem.lower_appliance_type && (
                      <div>
                        <span className="text-gray-600">Lower Appliance:</span>
                        <span className="ml-2 font-medium">
                          {selectedViewItem.lower_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          {selectedViewItem.lower_appliance_number && (
                            <span className="ml-1 text-purple-600">({selectedViewItem.lower_appliance_number})</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milling Details */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Milling Instructions</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Milling Location:</span>
                      <span className="ml-2 font-medium text-blue-900">
                        {selectedViewItem.milling_location ?
                          selectedViewItem.milling_location.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                          'Not specified'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Gingiva Color:</span>
                      <span className="ml-2 font-medium text-blue-900">
                        {selectedViewItem.gingiva_color ?
                          selectedViewItem.gingiva_color.replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                          'Not specified'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Stained and Glazed:</span>
                      <span className="ml-2 font-medium text-blue-900">
                        {selectedViewItem.stained_and_glazed ?
                          selectedViewItem.stained_and_glazed.replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                          'Not specified'
                        }
                      </span>
                    </div>
                    {selectedViewItem.cementation && (
                      <div>
                        <span className="text-blue-700">Cementation:</span>
                        <span className="ml-2 font-medium text-blue-900">
                          {selectedViewItem.cementation.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedViewItem.additional_notes && (
                    <div className="mt-4">
                      <span className="text-blue-700 text-sm">Additional Notes:</span>
                      <div className="mt-1 p-3 bg-white rounded border border-blue-200">
                        <p className="text-blue-900 text-sm">{selectedViewItem.additional_notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Information */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">Status Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Current Status:</span>
                      <span className="ml-2 font-medium text-green-900">
                        {selectedViewItem.status === 'milling' ? 'In Milling' :
                         selectedViewItem.status === 'in-transit' ? 'In Transit' :
                         selectedViewItem.status === 'quality-check' ? 'Quality Check' :
                         selectedViewItem.status === 'completed' ? 'Completed' :
                         selectedViewItem.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Manufacturing Method:</span>
                      <span className="ml-2 font-medium text-green-900">
                        {selectedViewItem.manufacturing_method?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Created:</span>
                      <span className="ml-2 font-medium text-green-900">
                        {new Date(selectedViewItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Last Updated:</span>
                      <span className="ml-2 font-medium text-green-900">
                        {new Date(selectedViewItem.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Dialog */}
      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-yellow-600" />
              Shipping Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-name">Patient</Label>
              <div className="text-sm text-gray-600 mt-1">
                {selectedShippingItem?.patient_name}
              </div>
            </div>

            <div>
              <Label htmlFor="tracking-number">Tracking Number *</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tracking-link">Tracking Link (Optional)</Label>
              <Input
                id="tracking-link"
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                placeholder="Enter tracking URL"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowShippingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitShipping}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Truck className="h-4 w-4 mr-2" />
                Submit Shipping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printing Completion Dialog */}
      <PrintingCompletionDialog
        open={showPrintingCompletionDialog}
        onClose={() => {
          setShowPrintingCompletionDialog(false);
          setSelectedPrintingItem(null);
        }}
        onComplete={handlePrintingCompletionSubmit}
        manufacturingItem={selectedPrintingItem}
      />

      {/* Inspection Dialog */}
      <InspectionDialog
        open={showInspectionDialog}
        onClose={() => {
          setShowInspectionDialog(false);
          setSelectedInspectionItem(null);
        }}
        onComplete={handleInspectionSubmit}
        manufacturingItem={selectedInspectionItem}
      />

      {/* Manufacturing & Inspection Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Manufacturing & Inspection Report
            </DialogTitle>
          </DialogHeader>

          {selectedReportItem && (
            <div className="space-y-6">
              {/* Patient & Appliance Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient & Appliance Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="text-base font-semibold text-gray-900">{selectedReportItem.patient_name}</p>
                  </div>
                  {selectedReportItem.upper_appliance_type && (
                    <div>
                      <p className="text-sm text-gray-600">Upper Appliance</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedReportItem.upper_appliance_type}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.lower_appliance_type && (
                    <div>
                      <p className="text-sm text-gray-600">Lower Appliance</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedReportItem.lower_appliance_type}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.upper_appliance_number && (
                    <div>
                      <p className="text-sm text-gray-600">Upper Appliance Number</p>
                      <p className="text-base font-semibold text-purple-600 font-mono">
                        {selectedReportItem.upper_appliance_number}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.lower_appliance_number && (
                    <div>
                      <p className="text-sm text-gray-600">Lower Appliance Number</p>
                      <p className="text-base font-semibold text-purple-600 font-mono">
                        {selectedReportItem.lower_appliance_number}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.is_nightguard_needed && (
                    <div>
                      <p className="text-sm text-gray-600">Nightguard Needed</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedReportItem.is_nightguard_needed === 'yes' ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.upper_nightguard_number && (
                    <div>
                      <p className="text-sm text-gray-600">Upper Nightguard Number</p>
                      <p className="text-base font-semibold text-green-600 font-mono">
                        {selectedReportItem.upper_nightguard_number}
                      </p>
                    </div>
                  )}
                  {selectedReportItem.lower_nightguard_number && (
                    <div>
                      <p className="text-sm text-gray-600">Lower Nightguard Number</p>
                      <p className="text-base font-semibold text-green-600 font-mono">
                        {selectedReportItem.lower_nightguard_number}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Shade</p>
                    <p className="text-base font-semibold text-gray-900">{selectedReportItem.shade}</p>
                  </div>
                  {selectedReportItem.screw && (
                    <div>
                      <p className="text-sm text-gray-600">Screw</p>
                      <p className="text-base font-semibold text-gray-900">{selectedReportItem.screw}</p>
                    </div>
                  )}
                  {selectedReportItem.material && (
                    <div>
                      <p className="text-sm text-gray-600">Material</p>
                      <p className="text-base font-semibold text-gray-900">{selectedReportItem.material}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Arch Type</p>
                    <p className="text-base font-semibold text-gray-900">{selectedReportItem.arch_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Manufacturing Method</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedReportItem.manufacturing_method === 'printing' ? 'Printing' : 'Milling'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Printing Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <Factory className="h-5 w-5 mr-2" />
                  Printing Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedReportItem.printing_completed_by_name ? (
                    <>
                      <div>
                        <p className="text-sm text-blue-700">Printed By</p>
                        <p className="text-base font-semibold text-blue-900">{selectedReportItem.printing_completed_by_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Completed At</p>
                        <p className="text-base font-semibold text-blue-900">
                          {new Date(selectedReportItem.printing_completed_at).toLocaleString('en-US', {
                            timeZone: 'America/New_York',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })} EST
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-sm text-blue-700 italic">Printing details not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Details */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Quality Inspection
                </h3>

                {selectedReportItem.inspection_status ? (
                  <>
                    {/* Inspection Status */}
                    <div className="mb-4 p-3 bg-white rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">Inspection Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedReportItem.inspection_status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {selectedReportItem.inspection_status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                        </span>
                      </div>
                    </div>

                    {/* Checklist Results */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2">Checklist Results</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <span className="text-sm text-purple-700">Print Quality</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            selectedReportItem.inspection_print_quality === 'pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {selectedReportItem.inspection_print_quality === 'pass' ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <span className="text-sm text-purple-700">Physical Defects</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            selectedReportItem.inspection_physical_defects === 'pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {selectedReportItem.inspection_physical_defects === 'pass' ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <span className="text-sm text-purple-700">Screw Access Channel</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            selectedReportItem.inspection_screw_access_channel === 'pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {selectedReportItem.inspection_screw_access_channel === 'pass' ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <span className="text-sm text-purple-700">MUA Platform</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            selectedReportItem.inspection_mua_platform === 'pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {selectedReportItem.inspection_mua_platform === 'pass' ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inspector Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-purple-700">Inspected By</p>
                        <p className="text-base font-semibold text-purple-900">{selectedReportItem.inspection_completed_by_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-700">Inspection Completed At</p>
                        <p className="text-base font-semibold text-purple-900">
                          {new Date(selectedReportItem.inspection_completed_at).toLocaleString('en-US', {
                            timeZone: 'America/New_York',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })} EST
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-purple-700 italic">Inspection details not available</p>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              {selectedReportItem.additional_notes && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-amber-800">{selectedReportItem.additional_notes}</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <ManufacturingFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
