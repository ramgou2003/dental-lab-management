import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  FileText, 
  Stethoscope, 
  DollarSign, 
  Calendar,
  Save,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  ConsultationData, 
  getConsultationByPacketId, 
  saveConsultation,
  createConsultationFromPacket 
} from '@/services/consultationService';

interface ConsultationManagerProps {
  patientPacketId: string;
}

export const ConsultationManager: React.FC<ConsultationManagerProps> = ({
  patientPacketId
}) => {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load consultation data
  useEffect(() => {
    const loadConsultation = async () => {
      setIsLoading(true);
      try {
        let consultation = await getConsultationByPacketId(patientPacketId);
        
        // If no consultation exists, create one from patient packet data
        if (!consultation) {
          console.log('📋 No consultation found, creating from patient packet...');
          consultation = await createConsultationFromPacket(patientPacketId);
        }
        
        setConsultationData(consultation);
        if (consultation?.updated_at) {
          setLastSaved(new Date(consultation.updated_at));
        }
      } catch (error) {
        console.error('❌ Error loading consultation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientPacketId) {
      loadConsultation();
    }
  }, [patientPacketId]);

  const handleSave = async () => {
    if (!consultationData) return;
    
    setIsSaving(true);
    try {
      const savedData = await saveConsultation(consultationData);
      if (savedData) {
        setConsultationData(savedData);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('❌ Error saving consultation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading consultation data...</span>
      </div>
    );
  }

  if (!consultationData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No consultation data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Consultation Overview</h2>
          <p className="text-sm text-gray-500">
            Comprehensive consultation record for {consultationData.patient_name || `${consultationData.patient_first_name || ''} ${consultationData.patient_last_name || ''}`.trim() || 'Unknown Patient'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(consultationData.consultation_status)}>
            {consultationData.consultation_status || 'scheduled'}
          </Badge>
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient">Patient Details</TabsTrigger>
          <TabsTrigger value="medical">Medical Summary</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Patient</p>
                    <p className="text-xs text-gray-500">
                      {consultationData.patient_first_name} {consultationData.patient_last_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Consultation Date</p>
                    <p className="text-xs text-gray-500">
                      {consultationData.consultation_date 
                        ? new Date(consultationData.consultation_date).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Treatment Status</p>
                    <p className="text-xs text-gray-500">
                      {consultationData.treatment_plan_approved ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Cost</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(consultationData.treatment_cost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Medical Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-4">
                  {consultationData.ai_medical_summary || 'No medical summary available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clinical Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-4">
                  {consultationData.clinical_assessment || 'No clinical assessment available'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Details Tab */}
        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">
                    {consultationData.patient_first_name} {consultationData.patient_last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{consultationData.patient_email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{consultationData.patient_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {consultationData.patient_date_of_birth 
                      ? new Date(consultationData.patient_date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <p className="text-sm text-gray-900">{consultationData.patient_gender || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Summary Tab */}
        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Medical Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultationData.ai_medical_summary || 'No medical summary available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Allergies Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultationData.ai_allergies_summary || 'No allergies summary available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Dental Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultationData.ai_dental_summary || 'No dental summary available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultationData.ai_overall_assessment || 'No overall assessment available'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treatment Plan Tab */}
        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment & Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Clinical Assessment</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                  {consultationData.clinical_assessment || 'No clinical assessment available'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Treatment Recommendations</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  {consultationData.treatment_recommendations ? (
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(consultationData.treatment_recommendations, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No treatment recommendations available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Treatment Notes</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                  {consultationData.treatment_notes || 'No treatment notes available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Treatment Cost</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(consultationData.treatment_cost)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Insurance Coverage</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(consultationData.insurance_coverage)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Patient Payment</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(consultationData.patient_payment)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Financial Notes</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                  {consultationData.financial_notes || 'No financial notes available'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Payment Plan</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  {consultationData.payment_plan ? (
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(consultationData.payment_plan, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No payment plan configured</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
