import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Calendar,
  User,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye
} from "lucide-react";

interface ConsultationViewerProps {
  consultation: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationViewer({ consultation, isOpen, onClose }: ConsultationViewerProps) {
  if (!consultation) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string, type: 'consultation' | 'treatment') => {
    if (type === 'consultation') {
      switch (status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
        case 'in-progress':
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      }
    } else {
      switch (status) {
        case 'accepted':
          return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Treatment Accepted</Badge>;
        case 'declined':
          return <Badge className="bg-red-100 text-red-800 border-red-200">Treatment Declined</Badge>;
        case 'followup-required':
          return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Follow-up Required</Badge>;
        default:
          return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{status}</Badge>;
      }
    }
  };

  const getFinancingStatus = () => {
    const options = consultation.financing_options;
    if (!options) return 'Not specified';
    
    if (options.yesApproved) return 'Approved';
    if (options.noNotApproved) return 'Not Approved';
    if (options.didNotApply) return 'Did Not Apply';
    return 'Not specified';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Consultation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient Name</label>
                  <p className="text-base font-semibold">{consultation.patient_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Consultation Date</label>
                  <p className="text-base">{formatDate(consultation.consultation_date)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {consultation.consultation_status && getStatusBadge(consultation.consultation_status, 'consultation')}
                {consultation.treatment_decision && getStatusBadge(consultation.treatment_decision, 'treatment')}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {consultation.clinical_assessment || 'No clinical assessment provided'}
              </p>
            </CardContent>
          </Card>

          {/* Treatment Recommendations */}
          {consultation.treatment_recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Treatment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consultation.treatment_recommendations.archType && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Arch Type</label>
                    <p className="text-base capitalize">{consultation.treatment_recommendations.archType}</p>
                  </div>
                )}
                
                {consultation.treatment_recommendations.upperTreatment && consultation.treatment_recommendations.upperTreatment.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Upper Treatment</label>
                    <ul className="list-disc list-inside space-y-1">
                      {consultation.treatment_recommendations.upperTreatment.map((treatment: string, index: number) => (
                        <li key={index} className="text-base">{treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {consultation.treatment_recommendations.lowerTreatment && consultation.treatment_recommendations.lowerTreatment.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lower Treatment</label>
                    <ul className="list-disc list-inside space-y-1">
                      {consultation.treatment_recommendations.lowerTreatment.map((treatment: string, index: number) => (
                        <li key={index} className="text-base">{treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Treatment Cost</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(consultation.treatment_cost)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Financing Status</label>
                  <p className="text-base">{getFinancingStatus()}</p>
                </div>
              </div>

              {consultation.financing_not_approved_reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Financing Not Approved Reason</label>
                  <p className="text-base">{consultation.financing_not_approved_reason}</p>
                </div>
              )}

              {consultation.financial_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Financial Notes</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.financial_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {consultation.additional_information && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.additional_information}</p>
              </CardContent>
            </Card>
          )}

          {/* Consultation Notes */}
          {consultation.consultation_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.consultation_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Information */}
          {(consultation.follow_up_required || consultation.followup_date || consultation.followup_reason) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Follow-up Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consultation.follow_up_required && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-700 font-medium">Follow-up Required</span>
                  </div>
                )}

                {consultation.followup_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                    <p className="text-base">{formatDate(consultation.followup_date)}</p>
                  </div>
                )}

                {consultation.followup_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Follow-up Reason</label>
                    <p className="text-gray-700">{consultation.followup_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Treatment Plan Status */}
          {consultation.treatment_plan_approved !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {consultation.treatment_plan_approved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  Treatment Plan Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {consultation.treatment_plan_approved ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Treatment Plan Approved</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Treatment Plan Not Approved</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Consultation Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-base">{formatDate(consultation.created_at)}</p>
                </div>
                {consultation.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-base">{formatDate(consultation.updated_at)}</p>
                  </div>
                )}
              </div>

              {consultation.completed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Completed At</label>
                  <p className="text-base">{formatDate(consultation.completed_at)}</p>
                </div>
              )}

              {consultation.progress_step && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Progress Step</label>
                  <p className="text-base">Step {consultation.progress_step}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
