import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, User, FlaskConical, Eye, X, Calendar, Stethoscope } from "lucide-react";
import type { ReportCard } from "@/hooks/useReportCards";
import { supabase } from "@/integrations/supabase/client";

// Helper function to format date-only fields without timezone conversion
const formatDateFromDB = (dateString: string): string => {
  if (!dateString) return 'Not specified';
  // Parse the date string directly without timezone conversion
  // Expected format: "2025-01-15" or "2025-01-15T00:00:00"
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');

  // Format as "Month Day, Year"
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
};

// Helper function to format date as MM/DD/YYYY for timeline
const formatDateShort = (dateString: string): string => {
  if (!dateString) return 'Not specified';
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
};

interface ViewLabReportCardProps {
  reportCard: ReportCard;
  onClose: () => void;
}

interface CompleteLabReportData {
  // Lab Report Card data
  id: string;
  lab_script_id: string;
  patient_name: string;
  arch_type: string;
  upper_appliance_type: string | null;
  lower_appliance_type: string | null;
  screw: string;
  shade: string;
  manufacturing_method: string | null;
  implant_on_upper: string | null;
  implant_on_lower: string | null;
  tooth_library_upper: string | null;
  tooth_library_lower: string | null;
  upper_appliance_number: string | null;
  lower_appliance_number: string | null;
  upper_nightguard_number: string | null;
  lower_nightguard_number: string | null;
  notes_and_remarks: string;
  status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Lab Script data
  lab_script_requested_date: string;
  lab_script_due_date: string | null;
  lab_script_instructions: string | null;
  lab_script_notes: string | null;
  lab_script_vdo_details: string | null;
  lab_script_screw_type: string | null;
}

export function ViewLabReportCard({ reportCard, onClose }: ViewLabReportCardProps) {
  const [labReportData, setLabReportData] = useState<CompleteLabReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the complete lab report card data with lab script information
  useEffect(() => {
    const loadCompleteLabReportData = async () => {
      if (reportCard.lab_script_id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('lab_report_cards')
            .select(`
              *,
              lab_scripts!inner(
                requested_date,
                due_date,
                instructions,
                notes,
                vdo_details,
                screw_type
              )
            `)
            .eq('lab_script_id', reportCard.lab_script_id)
            .single();

          if (error) {
            console.error('Error fetching lab report data:', error);
            setLabReportData(null);
            return;
          }

          // Flatten the data structure
          const completeData: CompleteLabReportData = {
            ...data,
            lab_script_requested_date: data.lab_scripts.requested_date,
            lab_script_due_date: data.lab_scripts.due_date,
            lab_script_instructions: data.lab_scripts.instructions,
            lab_script_notes: data.lab_scripts.notes,
            lab_script_vdo_details: data.lab_scripts.vdo_details,
            lab_script_screw_type: data.lab_scripts.screw_type,
          };

          setLabReportData(completeData);
        } catch (error) {
          console.error('Error loading lab report data:', error);
          setLabReportData(null);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCompleteLabReportData();
  }, [reportCard.lab_script_id]);

  // Format appliance type for display
  const formatApplianceType = (type: string | null | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const showUpperFields = labReportData?.arch_type === 'upper' || labReportData?.arch_type === 'dual';
  const showLowerFields = labReportData?.arch_type === 'lower' || labReportData?.arch_type === 'dual';

  if (loading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Eye className="h-6 w-6 text-indigo-600" />
            Lab Report Card Preview
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading lab report card...</p>
        </div>
      </>
    );
  }

  if (!labReportData) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Eye className="h-6 w-6 text-indigo-600" />
            Lab Report Card Preview
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No lab report card data found.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 tablet:gap-1.5 text-xl tablet:text-lg font-bold text-gray-900">
          <Eye className="h-6 w-6 tablet:h-5 tablet:w-5 text-indigo-600" />
          Lab Report Card Preview
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 tablet:space-y-4 max-h-[70vh] tablet:max-h-[75vh] overflow-y-auto">
        {/* Patient Information */}
        <div className="space-y-4 tablet:space-y-3">
          <h3 className="text-lg tablet:text-base font-semibold text-gray-900 flex items-center gap-2 tablet:gap-1.5">
            <User className="h-5 w-5 tablet:h-4 tablet:w-4 text-indigo-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tablet:gap-3">
            <div>
              <Label className="tablet:text-sm">Patient Name</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border font-medium tablet:text-sm">
                {labReportData.patient_name}
              </div>
            </div>
            <div>
              <Label className="tablet:text-sm">Arch Type</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border">
                <span className={`inline-flex px-2 py-1 tablet:px-1.5 tablet:py-0.5 rounded-md tablet:rounded text-sm tablet:text-xs font-medium ${
                  labReportData.arch_type === 'upper' ? 'bg-blue-100 text-blue-700' :
                  labReportData.arch_type === 'lower' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {labReportData.arch_type === 'upper' ? 'Upper Arch' :
                   labReportData.arch_type === 'lower' ? 'Lower Arch' :
                   labReportData.arch_type === 'dual' ? 'Dual Arch' :
                   labReportData.arch_type?.charAt(0).toUpperCase() + labReportData.arch_type?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Lab Script Information */}
        <div className="space-y-4 tablet:space-y-3">
          <h3 className="text-lg tablet:text-base font-semibold text-gray-900 flex items-center gap-2 tablet:gap-1.5">
            <Calendar className="h-5 w-5 tablet:h-4 tablet:w-4 text-indigo-600" />
            Original Lab Script Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tablet:gap-3">
            <div>
              <Label className="tablet:text-sm">Requested Date</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border tablet:text-sm">
                {formatDateFromDB(labReportData.lab_script_requested_date)}
              </div>
            </div>
            <div>
              <Label className="tablet:text-sm">Due Date</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border tablet:text-sm">
                {formatDateFromDB(labReportData.lab_script_due_date || '')}
              </div>
            </div>
          </div>
          {labReportData.lab_script_instructions && (
            <div>
              <Label className="tablet:text-sm">Original Instructions</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border whitespace-pre-wrap tablet:text-sm">
                {labReportData.lab_script_instructions}
              </div>
            </div>
          )}
          {labReportData.lab_script_notes && (
            <div>
              <Label className="tablet:text-sm">Original Notes</Label>
              <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border whitespace-pre-wrap tablet:text-sm">
                {labReportData.lab_script_notes}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tablet:gap-3">
            {labReportData.lab_script_screw_type && (
              <div>
                <Label className="tablet:text-sm">Original Screw Type</Label>
                <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border tablet:text-sm">
                  {labReportData.lab_script_screw_type}
                </div>
              </div>
            )}
            {labReportData.lab_script_vdo_details && (
              <div>
                <Label className="tablet:text-sm">VDO Details</Label>
                <div className="p-3 tablet:p-2 bg-gray-50 rounded-md tablet:rounded border tablet:text-sm">
                  {labReportData.lab_script_vdo_details}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appliance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-600" />
            Appliance Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label>Upper Appliance Type</Label>
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <span className="font-medium text-blue-900">
                    {formatApplianceType(labReportData.upper_appliance_type)}
                  </span>
                </div>
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label>Lower Appliance Type</Label>
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <span className="font-medium text-green-900">
                    {formatApplianceType(labReportData.lower_appliance_type)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lab Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-indigo-600" />
            Lab Specifications (Completed Report)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Screw Type Used</Label>
              <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200">
                <span className="font-medium text-indigo-900">{labReportData.screw}</span>
                {labReportData.lab_script_screw_type && labReportData.screw !== labReportData.lab_script_screw_type && (
                  <div className="text-xs text-gray-500 mt-1">
                    Original: {labReportData.lab_script_screw_type}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Shade Used</Label>
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <span className="font-medium text-yellow-900">{labReportData.shade}</span>
              </div>
            </div>
            {labReportData.manufacturing_method && (
              <div>
                <Label>Manufacturing Method</Label>
                <div className={`p-3 rounded-md border ${
                  labReportData.manufacturing_method === 'milling'
                    ? 'bg-cyan-50 border-cyan-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <span className={`font-medium ${
                    labReportData.manufacturing_method === 'milling'
                      ? 'text-cyan-900'
                      : 'text-blue-900'
                  }`}>
                    {labReportData.manufacturing_method.charAt(0).toUpperCase() + labReportData.manufacturing_method.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Implant & Library Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-600" />
            Implant & Library Information
          </h3>

          {/* Implants Row */}
          <div className="space-y-2">
            <h4 className="text-md font-medium text-gray-700">Implant Libraries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showUpperFields && (
                <div>
                  <Label>Upper Implant Library</Label>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <span className="font-medium text-blue-900">
                      {labReportData.implant_on_upper || 'Not specified'}
                    </span>
                  </div>
                </div>
              )}
              {showLowerFields && (
                <div>
                  <Label>Lower Implant Library</Label>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <span className="font-medium text-green-900">
                      {labReportData.implant_on_lower || 'Not specified'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tooth Library Row */}
          <div className="space-y-2">
            <h4 className="text-md font-medium text-gray-700">Tooth Libraries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showUpperFields && (
                <div>
                  <Label>Upper Tooth Library</Label>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <span className="font-medium text-blue-900">
                      {labReportData.tooth_library_upper || 'Not specified'}
                    </span>
                  </div>
                </div>
              )}
              {showLowerFields && (
                <div>
                  <Label>Lower Tooth Library</Label>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <span className="font-medium text-green-900">
                      {labReportData.tooth_library_lower || 'Not specified'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appliance Numbers Row */}
          <div className="space-y-2">
            <h4 className="text-md font-medium text-gray-700">Appliance Numbers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showUpperFields && (
                <div>
                  <Label>Upper Appliance Number</Label>
                  <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                    <span className="font-mono font-medium text-purple-900">
                      {labReportData.upper_appliance_number || 'Not assigned'}
                    </span>
                  </div>
                </div>
              )}
              {showLowerFields && (
                <div>
                  <Label>Lower Appliance Number</Label>
                  <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                    <span className="font-mono font-medium text-purple-900">
                      {labReportData.lower_appliance_number || 'Not assigned'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nightguard Numbers Row - Only show if nightguard numbers exist */}
          {(labReportData.upper_nightguard_number || labReportData.lower_nightguard_number) && (
            <div className="space-y-2">
              <h4 className="text-md font-medium text-gray-700">Nightguard Numbers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showUpperFields && labReportData.upper_nightguard_number && (
                  <div>
                    <Label>Upper Nightguard Number</Label>
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <span className="font-mono font-medium text-green-900">
                        {labReportData.upper_nightguard_number}
                      </span>
                    </div>
                  </div>
                )}
                {showLowerFields && labReportData.lower_nightguard_number && (
                  <div>
                    <Label>Lower Nightguard Number</Label>
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <span className="font-mono font-medium text-green-900">
                        {labReportData.lower_nightguard_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes & Remarks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Lab Report Notes & Remarks
          </h3>
          <div>
            <Label>Notes and Remarks by Designer</Label>
            <div className="p-4 bg-amber-50 rounded-md border border-amber-200 min-h-[120px] whitespace-pre-wrap">
              <span className="text-amber-900 leading-relaxed">
                {labReportData.notes_and_remarks}
              </span>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Submission & Timeline Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Lab Report Status</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  labReportData.status === 'completed' ? 'bg-green-100 text-green-700' :
                  labReportData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {labReportData.status.charAt(0).toUpperCase() + labReportData.status.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <Label>Completed At (EST)</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <div className="text-sm font-medium">
                  {labReportData.completed_at ? new Date(labReportData.completed_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) : 'Not available'}
                </div>
                <div className="text-xs text-gray-500">
                  {labReportData.completed_at ? new Date(labReportData.completed_at).toLocaleTimeString('en-US', { timeZone: 'America/New_York' }) : ''}
                </div>
              </div>
            </div>
            <div>
              <Label>Completed By</Label>
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-sm font-medium text-blue-900">
                  {labReportData.completed_by_name || 'Not available'}
                </div>
              </div>
            </div>
            <div>
              <Label>Lab Report ID</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="font-mono text-sm text-gray-700">
                  {labReportData.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lab Script Requested:</span>
                <span className="font-medium">{formatDateShort(labReportData.lab_script_requested_date)}</span>
              </div>
              {labReportData.lab_script_due_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Due Date:</span>
                  <span className="font-medium">{formatDateShort(labReportData.lab_script_due_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Lab Report Completed:</span>
                <span className="font-medium">{new Date(labReportData.submitted_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Total Processing Time:</span>
                <span className="font-medium text-indigo-600">
                  {(() => {
                    // Parse requested date directly without timezone conversion
                    const requestedParts = labReportData.lab_script_requested_date.split('T')[0].split('-');
                    const requestedDate = new Date(parseInt(requestedParts[0]), parseInt(requestedParts[1]) - 1, parseInt(requestedParts[2]));
                    // Parse submitted date and extract just the date part in EST
                    const submittedDateObj = new Date(labReportData.submitted_at);
                    const submittedInEST = new Date(submittedDateObj.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                    const submittedDate = new Date(submittedInEST.getFullYear(), submittedInEST.getMonth(), submittedInEST.getDate());
                    // Calculate difference in days (comparing dates only, not times)
                    const diffTime = submittedDate.getTime() - requestedDate.getTime();
                    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    return days === 0 ? '0 days (Same day)' : days === 1 ? '1 day' : `${days} days`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Report Card Info */}
        <div className="pt-6 tablet:pt-4 border-t">
          <div className="text-sm tablet:text-xs text-gray-500 text-center">
            Lab Report Card #{labReportData.id.slice(0, 8)}... • {labReportData.patient_name}
          </div>
        </div>
      </div>
    </>
  );
}
