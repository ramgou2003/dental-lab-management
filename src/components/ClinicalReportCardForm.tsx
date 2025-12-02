import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, User, Stethoscope, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportCard } from "@/hooks/useReportCards";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Selectable button group component
interface SelectableButtonGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

function SelectableButtonGroup({ options, value, onChange, columns = 4 }: SelectableButtonGroupProps) {
  return (
    <div className={cn(
      "grid gap-2 mt-2",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-4",
      columns === 5 && "grid-cols-5",
      columns === 6 && "grid-cols-6"
    )}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "outline"}
          className={cn(
            "h-auto py-2 px-3 text-xs whitespace-normal text-center border-blue-300",
            value === option.value
              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              : "hover:bg-blue-50 hover:border-blue-400"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

interface ClinicalReportCardFormProps {
  reportCard: ReportCard;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  insertionStatus?: {
    canSubmit: boolean;
    reason: string;
    message: string;
  };
}

export function ClinicalReportCardForm({ reportCard, onSubmit, onCancel, insertionStatus }: ClinicalReportCardFormProps) {
  const { userProfile } = useAuth();
  const [labReportData, setLabReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current date and time in EST
  const getCurrentESTDateTime = () => {
    const now = new Date();
    const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const date = estDate.toISOString().split('T')[0];
    const hours = estDate.getHours().toString().padStart(2, '0');
    const minutes = estDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentESTDateTime();

  const [formData, setFormData] = useState({
    // Patient Information (read-only)
    patient_name: reportCard.patient_name,
    arch_type: reportCard.lab_script?.arch_type || '',
    upper_appliance_type: reportCard.lab_script?.upper_appliance_type || '',
    lower_appliance_type: reportCard.lab_script?.lower_appliance_type || '',

    // Clinical Assessment Fields
    insertion_date: new Date().toISOString().split('T')[0],
    fit_assessment: '',
    occlusion_check: '',
    patient_comfort: '',
    retention_stability: '',
    aesthetic_satisfaction: '',
    functional_assessment: '',

    // Follow-up and Recommendations
    follow_up_required: 'no',
    follow_up_date: '',
    adjustments_made: '',
    patient_instructions: '',
    clinical_notes: '',

    // Final Assessment
    overall_satisfaction: '',
    treatment_success: 'successful',

    // Completion date and time
    completion_date: currentDate,
    completion_time: currentTime
  });

  // Load lab report data to show context
  useEffect(() => {
    const loadLabReportData = async () => {
      if (reportCard.lab_script_id) {
        setLoading(true);
        try {
          const { data: labData, error: labError } = await supabase
            .from('lab_report_cards')
            .select('*')
            .eq('lab_script_id', reportCard.lab_script_id)
            .single();

          if (labError) {
            console.error('Error fetching lab report data:', labError);
            setLabReportData(null);
          } else {
            setLabReportData(labData);
          }
        } catch (error) {
          console.error('Error loading lab report data:', error);
          setLabReportData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadLabReportData();
  }, [reportCard.lab_script_id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'insertion_date', 'fit_assessment', 'occlusion_check',
      'patient_comfort', 'retention_stability', 'aesthetic_satisfaction',
      'functional_assessment', 'overall_satisfaction', 'completion_date', 'completion_time'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Combine completion_date and completion_time to create timestamp
    // The user enters date/time in EST, so we treat it as EST
    const dateTimeString = `${formData.completion_date}T${formData.completion_time}:00`;

    // Add EST offset (-05:00 for EST, -04:00 for EDT)
    // For simplicity, we'll use -05:00 (standard EST)
    const [datePart, timePart] = dateTimeString.split('T');
    const completedAtTimestamp = `${datePart}T${timePart}-05:00`;

    // Add completed_by, completed_by_name, and completed_at to form data
    const formDataWithUser = {
      ...formData,
      completed_by: userProfile?.id || null,
      completed_by_name: userProfile?.full_name || null,
      completed_at_timestamp: completedAtTimestamp
    };

    // Submit the form data to parent component
    // The parent will handle saving to both clinical_report_cards and report_cards tables
    onSubmit(formDataWithUser);
  };

  if (loading) {
    return (
      <div className="p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-blue-600" />
            Clinical Report Card - {reportCard.patient_name}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading clinical report form...</h3>
          <p className="text-gray-500">Please wait while we prepare the form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-blue-700">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span>Clinical Report Card</span>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Complete the clinical assessment for {reportCard.patient_name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Insertion Status Warning */}
        {insertionStatus && !insertionStatus.canSubmit && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Appliance Not Ready for Clinical Assessment
                </h3>
                <p className="text-sm text-amber-800">
                  {insertionStatus.message}
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  You can preview the form below, but submission will be disabled until the appliance is inserted.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Lab Report Context */}
        {labReportData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lab Report Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Appliance:</span>
                <span className="ml-2 text-blue-700">
                  {labReportData.upper_appliance_type && `Upper: ${labReportData.upper_appliance_type}`}
                  {labReportData.upper_appliance_type && labReportData.lower_appliance_type && ', '}
                  {labReportData.lower_appliance_type && `Lower: ${labReportData.lower_appliance_type}`}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Shade:</span>
                <span className="ml-2 text-blue-700">{labReportData.shade}</span>
              </div>
            </div>
          </div>
        )}

        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_name">Patient Name</Label>
              <Input
                id="patient_name"
                value={formData.patient_name}
                disabled
                className="bg-gray-50 border-blue-300 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="insertion_date">Insertion Date *</Label>
              <Input
                id="insertion_date"
                type="date"
                value={formData.insertion_date}
                onChange={(e) => handleInputChange('insertion_date', e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Clinical Assessment
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Fit Assessment *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' },
                  { value: 'requires_adjustment', label: 'Requires Adjustment' },
                ]}
                value={formData.fit_assessment}
                onChange={(value) => handleInputChange('fit_assessment', value)}
                columns={5}
              />
            </div>
            <div>
              <Label>Occlusion Check *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'optimal', label: 'Optimal' },
                  { value: 'acceptable', label: 'Acceptable' },
                  { value: 'minor_adjustment', label: 'Minor Adjustment Needed' },
                  { value: 'major_adjustment', label: 'Major Adjustment Needed' },
                ]}
                value={formData.occlusion_check}
                onChange={(value) => handleInputChange('occlusion_check', value)}
                columns={4}
              />
            </div>
            <div>
              <Label>Patient Comfort *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'very_comfortable', label: 'Very Comfortable' },
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'mild_discomfort', label: 'Mild Discomfort' },
                  { value: 'uncomfortable', label: 'Uncomfortable' },
                ]}
                value={formData.patient_comfort}
                onChange={(value) => handleInputChange('patient_comfort', value)}
                columns={4}
              />
            </div>
            <div>
              <Label>Retention & Stability *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'adequate', label: 'Adequate' },
                  { value: 'poor', label: 'Poor' },
                ]}
                value={formData.retention_stability}
                onChange={(value) => handleInputChange('retention_stability', value)}
                columns={4}
              />
            </div>
            <div>
              <Label>Aesthetic Satisfaction *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'acceptable', label: 'Acceptable' },
                  { value: 'needs_improvement', label: 'Needs Improvement' },
                ]}
                value={formData.aesthetic_satisfaction}
                onChange={(value) => handleInputChange('aesthetic_satisfaction', value)}
                columns={4}
              />
            </div>
            <div>
              <Label>Functional Assessment *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'fully_functional', label: 'Fully Functional' },
                  { value: 'mostly_functional', label: 'Mostly Functional' },
                  { value: 'limited_function', label: 'Limited Function' },
                  { value: 'non_functional', label: 'Non-Functional' },
                ]}
                value={formData.functional_assessment}
                onChange={(value) => handleInputChange('functional_assessment', value)}
                columns={4}
              />
            </div>
          </div>
        </div>

        {/* Follow-up and Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Follow-up & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="follow_up_required">Follow-up Required</Label>
              <Select value={formData.follow_up_required} onValueChange={(value) => handleInputChange('follow_up_required', value)}>
                <SelectTrigger className="border-blue-300 focus:border-blue-500">
                  <SelectValue placeholder="Select follow-up requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.follow_up_required === 'yes' || formData.follow_up_required === 'urgent' ? (
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>
            ) : null}
          </div>
          <div>
            <Label htmlFor="adjustments_made">Adjustments Made</Label>
            <Textarea
              id="adjustments_made"
              value={formData.adjustments_made}
              onChange={(e) => handleInputChange('adjustments_made', e.target.value)}
              placeholder="Describe any adjustments made during the appointment..."
              rows={3}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="patient_instructions">Patient Instructions</Label>
            <Textarea
              id="patient_instructions"
              value={formData.patient_instructions}
              onChange={(e) => handleInputChange('patient_instructions', e.target.value)}
              placeholder="Instructions given to the patient for care and maintenance..."
              rows={3}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Final Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Final Assessment
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Overall Satisfaction *</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'very_satisfied', label: 'Very Satisfied' },
                  { value: 'satisfied', label: 'Satisfied' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'dissatisfied', label: 'Dissatisfied' },
                ]}
                value={formData.overall_satisfaction}
                onChange={(value) => handleInputChange('overall_satisfaction', value)}
                columns={4}
              />
            </div>
            <div>
              <Label>Treatment Success</Label>
              <SelectableButtonGroup
                options={[
                  { value: 'successful', label: 'Successful' },
                  { value: 'partially_successful', label: 'Partially Successful' },
                  { value: 'needs_revision', label: 'Needs Revision' },
                  { value: 'unsuccessful', label: 'Unsuccessful' },
                ]}
                value={formData.treatment_success}
                onChange={(value) => handleInputChange('treatment_success', value)}
                columns={4}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="clinical_notes">Clinical Notes</Label>
            <Textarea
              id="clinical_notes"
              value={formData.clinical_notes}
              onChange={(e) => handleInputChange('clinical_notes', e.target.value)}
              placeholder="Additional clinical observations and notes..."
              rows={4}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Completion Date and Time */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Completion Date & Time (EST)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completion_date">
                Completion Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completion_date"
                type="date"
                value={formData.completion_date}
                onChange={(e) => handleInputChange('completion_date', e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="completion_time">
                Completion Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completion_time"
                type="time"
                value={formData.completion_time}
                onChange={(e) => handleInputChange('completion_time', e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const { date, time } = getCurrentESTDateTime();
                handleInputChange('completion_date', date);
                handleInputChange('completion_time', time);
              }}
              className="text-xs border-blue-300 hover:bg-blue-50"
            >
              Use Current Date & Time (EST)
            </Button>
          </div>
        </div>

      </form>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white z-10 px-6 py-4 border-t flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-blue-300 hover:bg-blue-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="clinical-report-form"
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={insertionStatus && !insertionStatus.canSubmit}
          onClick={(e) => {
            e.preventDefault();
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          {insertionStatus && !insertionStatus.canSubmit ? 'Awaiting Appliance Insertion' : 'Complete Clinical Report'}
        </Button>
      </div>
    </div>
  );
}
