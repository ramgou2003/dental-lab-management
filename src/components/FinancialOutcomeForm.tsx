import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { movePatientToMainTable } from '@/services/consultationService';

interface FinancialOutcomeData {
  // Treatment Decision
  treatmentDecision: 'accepted' | 'not-accepted' | 'followup-required' | '';
  
  // Financial Information (only if accepted)
  treatmentCost: number;
  globalTreatmentValue: number;
  
  // Financing Options
  financingOptions: {
    yesApproved: boolean;
    noNotApproved: boolean;
    didNotApply: boolean;
  };
  
  // Financing Not Approved Details
  financingNotApprovedReason: string;
  
  // Additional Notes
  outcomeNotes: string;
  followupDate?: string;
  followupReason?: string;
}

interface FinancialOutcomeFormProps {
  patientPacketId: string;
  patientName: string;
}

export const FinancialOutcomeForm: React.FC<FinancialOutcomeFormProps> = ({
  patientPacketId,
  patientName
}) => {
  const [formData, setFormData] = useState<FinancialOutcomeData>({
    treatmentDecision: '',
    treatmentCost: 0,
    globalTreatmentValue: 0,
    financingOptions: {
      yesApproved: false,
      noNotApproved: false,
      didNotApply: false,
    },
    financingNotApprovedReason: '',
    outcomeNotes: '',
    followupDate: '',
    followupReason: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMovingPatient, setIsMovingPatient] = useState(false);
  const [patientMoved, setPatientMoved] = useState(false);

  // Load existing outcome data
  useEffect(() => {
    const loadOutcomeData = async () => {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('new_patient_packet_id', patientPacketId)
          .single();

        if (data && !error) {
          setFormData({
            treatmentDecision: data.treatment_decision || '',
            treatmentCost: data.treatment_cost || 0,
            globalTreatmentValue: data.global_treatment_value || 0,
            financingOptions: data.financing_options || formData.financingOptions,
            financingNotApprovedReason: data.financing_not_approved_reason || '',
            outcomeNotes: data.financial_notes || '',
            followupDate: data.followup_date ? data.followup_date.split('T')[0] : '',
            followupReason: data.followup_reason || ''
          });
          setLastSaved(new Date(data.updated_at));
        }
      } catch (error) {
        console.error('Error loading outcome data:', error);
      }
    };

    if (patientPacketId) {
      loadOutcomeData();
    }
  }, [patientPacketId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const outcomeData = {
        new_patient_packet_id: patientPacketId,
        treatment_decision: formData.treatmentDecision,
        treatment_cost: formData.treatmentCost,
        global_treatment_value: formData.globalTreatmentValue,
        financing_options: formData.financingOptions,
        financing_not_approved_reason: formData.financingNotApprovedReason,
        financial_notes: formData.outcomeNotes,
        followup_date: formData.followupDate ? new Date(formData.followupDate).toISOString() : null,
        followup_reason: formData.followupReason || null,
        treatment_plan_approved: formData.treatmentDecision === 'accepted' ? true :
                               formData.treatmentDecision === 'not-accepted' ? false : null,
        follow_up_required: formData.treatmentDecision === 'followup-required',
        consultation_status: formData.treatmentDecision === 'accepted' || formData.treatmentDecision === 'not-accepted' ? 'completed' : 'scheduled',
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving financial outcome data:', outcomeData);

      const { error } = await supabase
        .from('consultations')
        .upsert(outcomeData, {
          onConflict: 'new_patient_packet_id'
        });

      if (error) throw error;

      setLastSaved(new Date());
      console.log('✅ Financial outcome saved successfully');

      // If treatment is accepted, move patient to main patients table
      if (formData.treatmentDecision === 'accepted') {
        console.log('🔄 Treatment accepted, starting patient move process...');
        console.log('📋 Patient Packet ID:', patientPacketId);

        setIsMovingPatient(true);
        try {
          const patientId = await movePatientToMainTable(patientPacketId);
          if (patientId) {
            setPatientMoved(true);
            console.log('✅ Patient moved to main patients table:', patientId);

            // Show success alert
            alert(`✅ Success! Patient has been moved to the main Patients table. Patient ID: ${patientId}`);
          } else {
            console.error('❌ Failed to move patient - no patient ID returned');
            alert('❌ Failed to move patient to main table. Please check console for details.');
          }
        } catch (moveError) {
          console.error('❌ Error moving patient to main table:', moveError);
          alert(`❌ Error moving patient: ${moveError}`);
        } finally {
          setIsMovingPatient(false);
        }
      }
    } catch (error) {
      console.error('❌ Error saving financial outcome:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinancingOptionChange = (option: keyof FinancialOutcomeData['financingOptions']) => {
    setFormData(prev => ({
      ...prev,
      financingOptions: {
        yesApproved: false,
        noNotApproved: false,
        didNotApply: false,
        [option]: true
      }
    }));
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'not-accepted': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'followup-required': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'not-accepted': return 'bg-red-100 text-red-800';
      case 'followup-required': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial & Outcome</h2>
          <p className="text-sm text-gray-500">Treatment decision and financial planning for {patientName}</p>
        </div>
        <div className="flex items-center gap-3">
          {formData.treatmentDecision && (
            <Badge className={getDecisionColor(formData.treatmentDecision)}>
              {getDecisionIcon(formData.treatmentDecision)}
              <span className="ml-1 capitalize">{formData.treatmentDecision.replace('-', ' ')}</span>
            </Badge>
          )}
          {patientMoved && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
              <UserCheck className="h-4 w-4" />
              <span>Patient moved to main table</span>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Decision */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Treatment Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.treatmentDecision}
            onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentDecision: value as any }))}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="accepted" id="accepted" />
              <Label htmlFor="accepted" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Treatment Accepted
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-accepted" id="not-accepted" />
              <Label htmlFor="not-accepted" className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Treatment Not Accepted
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="followup-required" id="followup-required" />
              <Label htmlFor="followup-required" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Follow-up Required
              </Label>
            </div>
          </RadioGroup>

          {formData.treatmentDecision === 'accepted' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                When saved, this patient will be moved to the main Patients table for ongoing treatment management.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information - Only show if treatment is accepted */}
      {formData.treatmentDecision === 'accepted' && (
        <>
          {/* Treatment Cost */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-green-500" />
                Treatment Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatmentCost">Treatment Cost ($)</Label>
                  <Input
                    id="treatmentCost"
                    type="number"
                    step="0.01"
                    value={formData.treatmentCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="globalTreatmentValue">Global Treatment Value ($)</Label>
                  <Input
                    id="globalTreatmentValue"
                    type="number"
                    step="0.01"
                    value={formData.globalTreatmentValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, globalTreatmentValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total value including all treatment phases
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financing Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-blue-500" />
                Financing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Was the patient approved for financing?
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="yesApproved"
                      checked={formData.financingOptions.yesApproved}
                      onCheckedChange={() => handleFinancingOptionChange('yesApproved')}
                    />
                    <Label htmlFor="yesApproved" className="text-sm text-green-700">
                      Yes, Approved
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noNotApproved"
                      checked={formData.financingOptions.noNotApproved}
                      onCheckedChange={() => handleFinancingOptionChange('noNotApproved')}
                    />
                    <Label htmlFor="noNotApproved" className="text-sm text-red-700">
                      No, Not Approved
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="didNotApply"
                      checked={formData.financingOptions.didNotApply}
                      onCheckedChange={() => handleFinancingOptionChange('didNotApply')}
                    />
                    <Label htmlFor="didNotApply" className="text-sm text-gray-700">
                      Did Not Apply
                    </Label>
                  </div>
                </div>
              </div>

              {/* Financing Not Approved Reason */}
              {formData.financingOptions.noNotApproved && (
                <div>
                  <Label htmlFor="financingNotApprovedReason">
                    Financing Not Approved
                  </Label>
                  <Textarea
                    id="financingNotApprovedReason"
                    placeholder="Please specify the reason for financing denial or alternative payment options discussed..."
                    value={formData.financingNotApprovedReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, financingNotApprovedReason: e.target.value }))}
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Document the reason for financing denial and any alternative payment plans discussed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Follow-up Information - Show if follow-up is required */}
      {formData.treatmentDecision === 'followup-required' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-yellow-500" />
              Follow-up Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="followupDate">Follow-up Date</Label>
                <Input
                  id="followupDate"
                  type="date"
                  value={formData.followupDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followupDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="followupReason">Follow-up Reason</Label>
                <Input
                  id="followupReason"
                  placeholder="Reason for follow-up..."
                  value={formData.followupReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, followupReason: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-purple-500" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any additional notes about the consultation outcome, patient concerns, or next steps..."
            value={formData.outcomeNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, outcomeNotes: e.target.value }))}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
