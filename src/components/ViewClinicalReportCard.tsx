import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, User, Stethoscope, Calendar, CheckCircle, Clock, Eye } from "lucide-react";
import { useClinicalReportCards, type ClinicalReportCard } from "@/hooks/useClinicalReportCards";

interface ViewClinicalReportCardProps {
  reportCardId: string;
  onClose: () => void;
}

export function ViewClinicalReportCard({ reportCardId, onClose }: ViewClinicalReportCardProps) {
  const { getClinicalReportCardByReportCardId } = useClinicalReportCards();
  const [clinicalReport, setClinicalReport] = useState<ClinicalReportCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinicalReport = async () => {
      setLoading(true);
      try {
        const report = await getClinicalReportCardByReportCardId(reportCardId);
        setClinicalReport(report);
      } catch (error) {
        console.error('Error loading clinical report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClinicalReport();
  }, [reportCardId, getClinicalReportCardByReportCardId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading clinical report...</span>
        </div>
      </div>
    );
  }

  if (!clinicalReport) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Clinical Report Found
        </h3>
        <p className="text-gray-500 mb-4">
          This report card doesn't have a completed clinical report yet.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFieldValue = (value: string) => {
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Eye className="h-5 w-5 text-green-600" />
          Clinical Report Card - {clinicalReport.patient_name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Patient Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Patient:</span>
              <span className="ml-2 text-blue-700">{clinicalReport.patient_name}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Arch Type:</span>
              <span className="ml-2 text-blue-700">{formatFieldValue(clinicalReport.arch_type)}</span>
            </div>
            {clinicalReport.upper_appliance_type && (
              <div>
                <span className="font-medium text-blue-800">Upper Appliance:</span>
                <span className="ml-2 text-blue-700">{clinicalReport.upper_appliance_type}</span>
              </div>
            )}
            {clinicalReport.lower_appliance_type && (
              <div>
                <span className="font-medium text-blue-800">Lower Appliance:</span>
                <span className="ml-2 text-blue-700">{clinicalReport.lower_appliance_type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-green-600" />
            Clinical Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Insertion Date:</span>
                <span className="text-gray-900">{formatDate(clinicalReport.insertion_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Fit Assessment:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.fit_assessment)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Occlusion Check:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.occlusion_check)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Patient Comfort:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.patient_comfort)}</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Retention & Stability:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.retention_stability)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Aesthetic Satisfaction:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.aesthetic_satisfaction)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Functional Assessment:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.functional_assessment)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Overall Satisfaction:</span>
                <Badge variant="outline">{formatFieldValue(clinicalReport.overall_satisfaction)}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Observations */}
        {(clinicalReport.tissue_response || clinicalReport.speech_impact || clinicalReport.eating_comfort) && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Observations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clinicalReport.tissue_response && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Tissue Response:</span>
                    <Badge variant="outline">{formatFieldValue(clinicalReport.tissue_response)}</Badge>
                  </div>
                )}
                {clinicalReport.speech_impact && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Speech Impact:</span>
                    <Badge variant="outline">{formatFieldValue(clinicalReport.speech_impact)}</Badge>
                  </div>
                )}
                {clinicalReport.eating_comfort && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Eating Comfort:</span>
                    <Badge variant="outline">{formatFieldValue(clinicalReport.eating_comfort)}</Badge>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Follow-up and Notes */}
        {(clinicalReport.follow_up_required !== 'no' || clinicalReport.adjustments_made || clinicalReport.patient_instructions || clinicalReport.clinical_notes) && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Follow-up & Notes
              </h3>
              
              {clinicalReport.follow_up_required !== 'no' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-yellow-800">Follow-up Required:</span>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                      {formatFieldValue(clinicalReport.follow_up_required)}
                    </Badge>
                  </div>
                  {clinicalReport.follow_up_date && (
                    <div className="text-sm text-yellow-700">
                      <span className="font-medium">Follow-up Date:</span> {formatDate(clinicalReport.follow_up_date)}
                    </div>
                  )}
                </div>
              )}
              
              {clinicalReport.adjustments_made && (
                <div>
                  <span className="font-medium text-gray-700">Adjustments Made:</span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">{clinicalReport.adjustments_made}</p>
                </div>
              )}
              
              {clinicalReport.patient_instructions && (
                <div>
                  <span className="font-medium text-gray-700">Patient Instructions:</span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">{clinicalReport.patient_instructions}</p>
                </div>
              )}
              
              {clinicalReport.clinical_notes && (
                <div>
                  <span className="font-medium text-gray-700">Clinical Notes:</span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">{clinicalReport.clinical_notes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Report Status */}
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Submission & Timeline Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium text-gray-700">Report Status:</span>
              <div className="mt-1">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {formatFieldValue(clinicalReport.status)}
                </Badge>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Completed At (EST):</span>
              <div className="mt-1 text-sm text-gray-900">
                {clinicalReport.completed_at ? (
                  <>
                    <div>{new Date(clinicalReport.completed_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</div>
                    <div className="text-xs text-gray-500">{new Date(clinicalReport.completed_at).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}</div>
                  </>
                ) : (
                  'Not available'
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Completed By:</span>
              <div className="mt-1 text-sm text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
                {clinicalReport.completed_by_name || 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
