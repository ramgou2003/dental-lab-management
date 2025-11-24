import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, User, Stethoscope, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import type { ReportCard } from "@/hooks/useReportCards";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

    // Clinical Observations
    tissue_response: '',
    speech_impact: '',
    eating_comfort: '',

    // Follow-up and Recommendations
    follow_up_required: 'no',
    follow_up_date: '',
    adjustments_made: '',
    patient_instructions: '',
    clinical_notes: '',

    // Final Assessment
    overall_satisfaction: '',
    treatment_success: 'successful'
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
      'functional_assessment', 'overall_satisfaction'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Add completed_by and completed_by_name to form data
    const formDataWithUser = {
      ...formData,
      completed_by: userProfile?.id || null,
      completed_by_name: userProfile?.full_name || null
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
            <FileText className="h-5 w-5 text-green-600" />
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
    <div className="p-6">
      <DialogHeader className="mb-6">
        <DialogTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-green-100 rounded-lg">
            <Stethoscope className="h-6 w-6 text-green-600" />
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
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_name">Patient Name</Label>
              <Input
                id="patient_name"
                value={formData.patient_name}
                disabled
                className="bg-gray-50"
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
              />
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Clinical Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fit_assessment">Fit Assessment *</Label>
              <Select value={formData.fit_assessment} onValueChange={(value) => handleInputChange('fit_assessment', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fit assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="requires_adjustment">Requires Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="occlusion_check">Occlusion Check *</Label>
              <Select value={formData.occlusion_check} onValueChange={(value) => handleInputChange('occlusion_check', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occlusion status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimal">Optimal</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="minor_adjustment">Minor Adjustment Needed</SelectItem>
                  <SelectItem value="major_adjustment">Major Adjustment Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="patient_comfort">Patient Comfort *</Label>
              <Select value={formData.patient_comfort} onValueChange={(value) => handleInputChange('patient_comfort', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select comfort level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_comfortable">Very Comfortable</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="mild_discomfort">Mild Discomfort</SelectItem>
                  <SelectItem value="uncomfortable">Uncomfortable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retention_stability">Retention & Stability *</Label>
              <Select value={formData.retention_stability} onValueChange={(value) => handleInputChange('retention_stability', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select retention status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="adequate">Adequate</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Aesthetic and Functional Assessment */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aesthetic_satisfaction">Aesthetic Satisfaction *</Label>
              <Select value={formData.aesthetic_satisfaction} onValueChange={(value) => handleInputChange('aesthetic_satisfaction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aesthetic rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="functional_assessment">Functional Assessment *</Label>
              <Select value={formData.functional_assessment} onValueChange={(value) => handleInputChange('functional_assessment', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select functional status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_functional">Fully Functional</SelectItem>
                  <SelectItem value="mostly_functional">Mostly Functional</SelectItem>
                  <SelectItem value="limited_function">Limited Function</SelectItem>
                  <SelectItem value="non_functional">Non-Functional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clinical Observations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-green-600" />
            Clinical Observations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tissue_response">Tissue Response</Label>
              <Select value={formData.tissue_response} onValueChange={(value) => handleInputChange('tissue_response', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tissue response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="mild_irritation">Mild Irritation</SelectItem>
                  <SelectItem value="moderate_irritation">Moderate Irritation</SelectItem>
                  <SelectItem value="severe_irritation">Severe Irritation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="speech_impact">Speech Impact</Label>
              <Select value={formData.speech_impact} onValueChange={(value) => handleInputChange('speech_impact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speech impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_impact">No Impact</SelectItem>
                  <SelectItem value="minimal_impact">Minimal Impact</SelectItem>
                  <SelectItem value="moderate_impact">Moderate Impact</SelectItem>
                  <SelectItem value="significant_impact">Significant Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eating_comfort">Eating Comfort</Label>
              <Select value={formData.eating_comfort} onValueChange={(value) => handleInputChange('eating_comfort', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select eating comfort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="mild_difficulty">Mild Difficulty</SelectItem>
                  <SelectItem value="moderate_difficulty">Moderate Difficulty</SelectItem>
                  <SelectItem value="significant_difficulty">Significant Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Follow-up and Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Follow-up & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="follow_up_required">Follow-up Required</Label>
              <Select value={formData.follow_up_required} onValueChange={(value) => handleInputChange('follow_up_required', value)}>
                <SelectTrigger>
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
            />
          </div>
        </div>

        {/* Final Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Final Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overall_satisfaction">Overall Satisfaction *</Label>
              <Select value={formData.overall_satisfaction} onValueChange={(value) => handleInputChange('overall_satisfaction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select overall satisfaction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                  <SelectItem value="satisfied">Satisfied</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treatment_success">Treatment Success</Label>
              <Select value={formData.treatment_success} onValueChange={(value) => handleInputChange('treatment_success', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="partially_successful">Partially Successful</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
                </SelectContent>
              </Select>
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
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={insertionStatus && !insertionStatus.canSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            {insertionStatus && !insertionStatus.canSubmit ? 'Awaiting Appliance Insertion' : 'Complete Clinical Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
