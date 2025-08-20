import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  DollarSign,
  FileText,
  CheckSquare,
  Calendar,
  User,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface ConsultationPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
  patientName?: string;
  onEdit?: () => void;
}

interface ConsultationData {
  id: string;
  patient_name: string;
  clinical_assessment: string;
  treatment_recommendations: any;
  additional_information: string;
  treatment_decision: string;
  treatment_cost: number;
  global_treatment_value: number;
  financing_options: any;
  financing_not_approved_reason: string;
  financial_notes: string;
  followup_date: string;
  followup_reason: string;
  consultation_status: string;
  created_at: string;
  updated_at: string;
}

export function ConsultationPreviewDialog({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  onEdit
}: ConsultationPreviewDialogProps) {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadConsultationData();
    }
  }, [isOpen, appointmentId]);

  const loadConsultationData = async () => {
    if (!appointmentId) {
      console.warn('❌ ConsultationPreview: No appointment ID provided');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 ConsultationPreview: Loading data for appointmentId:', appointmentId);
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (error) {
        console.error('❌ ConsultationPreview: Error loading data:', error);
        toast.error('Failed to load consultation data');
        return;
      }

      if (data) {
        console.log('✅ ConsultationPreview: Data loaded successfully:', data);
        setConsultationData(data);
      } else {
        console.warn('⚠️ ConsultationPreview: No consultation data found');
        toast.error('No consultation data found for this appointment');
      }
    } catch (error) {
      console.error('❌ ConsultationPreview: Error:', error);
      toast.error('Failed to load consultation data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const formatTreatmentRecommendations = (recommendations: any) => {
    if (!recommendations) return 'No treatment recommendations';

    // Handle new arch-based format
    if (recommendations.archType) {
      const parts = [];
      if (recommendations.archType) {
        parts.push(`Arch Type: ${recommendations.archType.charAt(0).toUpperCase() + recommendations.archType.slice(1)}`);
      }
      if (recommendations.upperTreatment) {
        parts.push(`Upper: ${recommendations.upperTreatment}`);
      }
      if (recommendations.lowerTreatment) {
        parts.push(`Lower: ${recommendations.lowerTreatment}`);
      }
      return parts.length > 0 ? parts.join(' | ') : 'No specific treatments selected';
    }

    // Handle old boolean-based format
    const selectedTreatments = Object.entries(recommendations)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
    
    return selectedTreatments.length > 0 ? selectedTreatments.join(', ') : 'No treatments selected';
  };

  const formatFinancingOptions = (options: any) => {
    if (!options) return 'Not specified';
    
    const selected = [];
    if (options.yesApproved) selected.push('Approved');
    if (options.noNotApproved) selected.push('Not Approved');
    if (options.didNotApply) selected.push('Did Not Apply');
    
    return selected.length > 0 ? selected.join(', ') : 'Not specified';
  };

  const getDecisionBadgeColor = (decision: string) => {
    switch (decision) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'not-accepted': return 'bg-red-100 text-red-800';
      case 'followup-required': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDecisionText = (decision: string) => {
    switch (decision) {
      case 'accepted': return 'Treatment Accepted';
      case 'not-accepted': return 'Treatment Not Accepted';
      case 'followup-required': return 'Follow-up Required';
      default: return 'No Decision';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading consultation data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!consultationData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-gray-600">No consultation data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="w-full space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Consultation Summary
                </DialogTitle>
                <p className="text-gray-600">Patient: {consultationData.patient_name}</p>
              </div>
            </div>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Consultation
            </Button>
          </div>

          {/* Status and Date Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Created: {new Date(consultationData.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Status: {consultationData.consultation_status}
              </span>
            </div>
            <Badge className={getDecisionBadgeColor(consultationData.treatment_decision)}>
              {formatDecisionText(consultationData.treatment_decision)}
            </Badge>
          </div>

          {/* Clinical Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-blue-500" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {consultationData.clinical_assessment || 'No clinical assessment provided'}
              </p>
            </CardContent>
          </Card>

          {/* Treatment Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckSquare className="h-4 w-4 text-green-500" />
                Treatment Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {formatTreatmentRecommendations(consultationData.treatment_recommendations)}
              </p>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {consultationData.additional_information && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-purple-500" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {consultationData.additional_information}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Financial Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-green-500" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Treatment Cost</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${consultationData.treatment_cost ? Number(consultationData.treatment_cost).toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Global Treatment Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${consultationData.global_treatment_value ? Number(consultationData.global_treatment_value).toLocaleString() : '0'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Financing Options</p>
                <p className="text-gray-700">
                  {formatFinancingOptions(consultationData.financing_options)}
                </p>
              </div>

              {consultationData.financing_not_approved_reason && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Financing Not Approved Reason</p>
                  <p className="text-gray-700">{consultationData.financing_not_approved_reason}</p>
                </div>
              )}

              {consultationData.financial_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Financial Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{consultationData.financial_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Information */}
          {(consultationData.followup_date || consultationData.followup_reason) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Follow-up Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {consultationData.followup_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Follow-up Date</p>
                    <p className="text-gray-700">
                      {new Date(consultationData.followup_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {consultationData.followup_reason && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Follow-up Reason</p>
                    <p className="text-gray-700">{consultationData.followup_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
