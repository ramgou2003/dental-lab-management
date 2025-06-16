import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/particle-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LabReportCardForm } from "@/components/LabReportCardForm";
import { useReportCards } from "@/hooks/useReportCards";
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Eye, Play, Square, RotateCcw, Edit, Search, FlaskConical, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import type { ReportCard } from "@/hooks/useReportCards";

export function ReportCardsPage() {
  const [activeFilter, setActiveFilter] = useState("all-report-cards");
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [showLabReportForm, setShowLabReportForm] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { reportCards, loading, updateLabReportStatus, updateClinicalReportStatus } = useReportCards();

  const handleNewReport = () => {
    setShowNewReportForm(true);
  };

  const handleFillLabReport = (reportCard: ReportCard) => {
    setSelectedReportCard(reportCard);
    setShowLabReportForm(true);
  };

  const handleLabReportSubmit = async (formData: any) => {
    if (!selectedReportCard) return;

    try {
      await updateLabReportStatus(selectedReportCard.id, 'completed', formData);
      toast.success('Lab report card completed successfully!');
      setShowLabReportForm(false);
      setSelectedReportCard(null);
    } catch (error) {
      toast.error('Failed to complete lab report card');
    }
  };

  const handleLabReportCancel = () => {
    setShowLabReportForm(false);
    setSelectedReportCard(null);
  };

  const handleClinicalReportComplete = async (reportCardId: string) => {
    try {
      await updateClinicalReportStatus(reportCardId, 'completed');
      toast.success('Clinical report card completed successfully!');
    } catch (error) {
      toast.error('Failed to complete clinical report card');
    }
  };

  // Calculate dynamic counts - updated for 5 filters
  const getReportCount = (status: string) => {
    if (status === "all-report-cards") return reportCards.length;
    if (status === "pending-lab") {
      // Count report cards that need lab report cards (lab not completed yet)
      return reportCards.filter(card => card.lab_report_status === 'pending').length;
    }
    if (status === "pending-clinic") {
      // Count report cards that need clinic report cards (lab completed, but clinic not completed)
      return reportCards.filter(card =>
        card.lab_report_status === 'completed' && card.clinical_report_status === 'pending'
      ).length;
    }
    if (status === "all-pending") {
      // Count all pending report cards (lab pending OR clinic pending after lab completed)
      return reportCards.filter(card =>
        card.lab_report_status === 'pending' ||
        (card.lab_report_status === 'completed' && card.clinical_report_status === 'pending')
      ).length;
    }
    if (status === "all-completed") {
      // Count all completed report cards (both lab and clinical completed)
      return reportCards.filter(card =>
        card.lab_report_status === 'completed' && card.clinical_report_status === 'completed'
      ).length;
    }
    return reportCards.length;
  };

  // Stats configuration - 5 filters
  const stats = [
    {
      title: "Pending by Lab",
      value: getReportCount("pending-lab"),
      filter: "pending-lab",
      icon: Clock,
      color: "bg-amber-500"
    },
    {
      title: "Pending by Clinic",
      value: getReportCount("pending-clinic"),
      filter: "pending-clinic",
      icon: AlertCircle,
      color: "bg-orange-500"
    },
    {
      title: "All Pending",
      value: getReportCount("all-pending"),
      filter: "all-pending",
      icon: Clock,
      color: "bg-red-500"
    },
    {
      title: "All Completed",
      value: getReportCount("all-completed"),
      filter: "all-completed",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "All Report Cards",
      value: getReportCount("all-report-cards"),
      filter: "all-report-cards",
      icon: FileText,
      color: "bg-indigo-500"
    }
  ];

  // Filter report cards - updated for 5 filters
  const filteredReportCards = reportCards.filter(card => {
    const searchMatch = searchQuery.trim() === ""
      ? true
      : card.patient_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter based on active filter
    let statusMatch = true;
    if (activeFilter === "pending-lab") {
      // Show only cards where lab report is pending
      statusMatch = card.lab_report_status === 'pending';
    } else if (activeFilter === "pending-clinic") {
      // Show only cards where lab is completed but clinic is pending
      statusMatch = card.lab_report_status === 'completed' && card.clinical_report_status === 'pending';
    } else if (activeFilter === "all-pending") {
      // Show cards where lab is pending OR (lab completed but clinic pending)
      statusMatch = card.lab_report_status === 'pending' ||
                   (card.lab_report_status === 'completed' && card.clinical_report_status === 'pending');
    } else if (activeFilter === "all-completed") {
      // Show only cards where both lab and clinical are completed
      statusMatch = card.lab_report_status === 'completed' && card.clinical_report_status === 'completed';
    }
    // "all-report-cards" shows everything

    return searchMatch && statusMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader
          title="Report Cards"
          search={{
            placeholder: "Search by patient name...",
            value: searchQuery,
            onChange: setSearchQuery
          }}
          action={{
            label: "New Report Card",
            onClick: handleNewReport
          }}
        />
      </div>
      <div className="flex-1 p-6">
        {/* Stats Cards - 5 filters */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6">
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

        {/* Report Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          {loading ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading report cards...</h3>
              <p className="text-gray-500">Please wait while we fetch report cards.</p>
            </div>
          ) : filteredReportCards.length > 0 ? (
            <div className="flex-1 overflow-hidden">
              {/* Cards List - Single Column with Scroll */}
              <div className="flex-1 overflow-y-auto p-6 max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div className="space-y-4">
                  {filteredReportCards.map((card) => {
                    // Format appliance types for display
                    const formatApplianceType = (type: string | undefined) => {
                      if (!type) return 'N/A';
                      return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    const upperAppliance = formatApplianceType(card.lab_script?.upper_appliance_type);
                    const lowerAppliance = formatApplianceType(card.lab_script?.lower_appliance_type);

                    return (
                      <div key={card.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4">
                        <div className="flex items-center justify-between">
                          {/* Left side - Patient info and appliance types */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Report Avatar */}
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-white" />
                            </div>

                            {/* Patient Name */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{card.patient_name}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                {/* Upper Appliance */}
                                {card.lab_script?.upper_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Upper:</span> {upperAppliance}
                                  </span>
                                )}
                                {/* Lower Appliance */}
                                {card.lab_script?.lower_appliance_type && (
                                  <span className="text-xs text-gray-600">
                                    <span className="font-medium">Lower:</span> {lowerAppliance}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Fill Lab Report Button */}
                          <div className="ml-4">
                            {card.lab_report_status === 'completed' ? (
                              <Button
                                className="border-2 border-green-600 text-green-600 hover:border-green-700 hover:text-green-700 hover:bg-green-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  // TODO: Implement view lab report functionality
                                  toast.info('View lab report functionality coming soon!');
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Lab Report
                              </Button>
                            ) : (
                              <ParticleButton
                                className="border-2 border-indigo-600 text-indigo-600 hover:border-indigo-700 hover:text-indigo-700 hover:bg-indigo-50 bg-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => handleFillLabReport(card)}
                                onSuccess={() => {}}
                                successDuration={1000}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Fill Lab Report
                              </ParticleButton>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Report Cards Found
              </h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === "pending-lab" ? "No lab reports pending." :
                 activeFilter === "pending-clinic" ? "No clinical reports pending." :
                 activeFilter === "all-pending" ? "No pending reports found." :
                 activeFilter === "all-completed" ? "No completed reports found." :
                 "Complete some lab scripts first to generate report cards from them."}
              </p>
              <Button
                onClick={() => window.location.href = '/lab'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Go to Lab Scripts
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Report Card Dialog */}
      <Dialog open={showNewReportForm} onOpenChange={setShowNewReportForm}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Report Card</h2>
                <p className="text-gray-600">Generate a new patient report card</p>
              </div>
            </div>

            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Report card form will be implemented here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lab Report Card Form Dialog */}
      {selectedReportCard && (
        <Dialog open={showLabReportForm} onOpenChange={setShowLabReportForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <LabReportCardForm
              reportCard={selectedReportCard}
              onSubmit={handleLabReportSubmit}
              onCancel={handleLabReportCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
