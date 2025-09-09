import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  DollarSign, 
  Shield, 
  AlertTriangle, 
  Scale, 
  FileText,
  X
} from "lucide-react";
import { FinancialAgreementData } from "@/services/financialAgreementService";

interface FinancialAgreementPreviewProps {
  onClose?: () => void;
  agreementData?: FinancialAgreementData; // Real data from Supabase
}

// Function to transform Supabase data to display format
function transformSupabaseToDisplayData(dbData: FinancialAgreementData): FinancialAgreementData {
  return {
    ...dbData,
    // Ensure dates are properly formatted
    date_of_birth: dbData.date_of_birth || '',
    date_of_execution: dbData.date_of_execution || new Date().toISOString().split('T')[0],
    time_of_execution: dbData.time_of_execution || new Date().toTimeString().slice(0, 5),
    
    // Ensure arrays are properly handled
    accepted_treatments: Array.isArray(dbData.accepted_treatments) ? dbData.accepted_treatments : [],
    
    // Ensure numeric fields are properly handled
    total_cost_of_treatment: dbData.total_cost_of_treatment || 0,
    patient_payment_today: dbData.patient_payment_today || 0,
    remaining_balance: dbData.remaining_balance || 0,
    care_package_fee: dbData.care_package_fee || 0,
    
    // Ensure boolean fields have defaults
    capacity_confirmed: dbData.capacity_confirmed || false,
    hipaa_acknowledged: dbData.hipaa_acknowledged || false,
    terms_agreed: dbData.terms_agreed || false,
    
    // Ensure string fields have defaults
    patient_name: dbData.patient_name || 'Unknown Patient',
    chart_number: dbData.chart_number || '',
    remaining_payment_plan: dbData.remaining_payment_plan || '',
    payment_terms_initials: dbData.payment_terms_initials || '',
    lab_fee_initials: dbData.lab_fee_initials || '',
    warranty_initials: dbData.warranty_initials || '',
    capacity_initials: dbData.capacity_initials || '',
    dispute_initials: dbData.dispute_initials || '',
    patient_signature: dbData.patient_signature || '',
    witness_name: dbData.witness_name || '',
    witness_role: dbData.witness_role || '',
    witness_signature: dbData.witness_signature || '',
    confirmed_by_staff_initials: dbData.confirmed_by_staff_initials || '',
    
    // Status
    status: dbData.status || 'draft'
  };
}

// Sample data for fallback
const sampleAgreementData: FinancialAgreementData = {
  patient_name: 'John Smith',
  chart_number: 'CH-12345',
  date_of_birth: '1985-06-15',
  date_of_execution: new Date().toISOString().split('T')[0],
  time_of_execution: new Date().toTimeString().slice(0, 5),
  
  accepted_treatments: [
    {
      service: 'Full Arch Implant Restoration - Upper',
      fee: '$25,000.00',
      cdtCode: 'D6114',
      cptCode: 'N/A',
      initials: 'JS'
    },
    {
      service: 'Full Arch Implant Restoration - Lower',
      fee: '$25,000.00',
      cdtCode: 'D6114',
      cptCode: 'N/A',
      initials: 'JS'
    }
  ],
  total_cost_of_treatment: 50000,
  
  patient_payment_today: 5000,
  remaining_balance: 45000,
  remaining_payment_plan: 'Monthly payments of $1,875 for 24 months',
  payment_terms_initials: 'JS',
  
  lab_fee_initials: 'JS',
  
  care_package_fee: 3450,
  care_package_election: 'enroll',
  warranty_initials: 'JS',
  
  capacity_confirmed: true,
  hipaa_acknowledged: true,
  capacity_initials: 'JS',
  
  dispute_initials: 'JS',
  
  terms_agreed: true,
  patient_signature: 'John Smith',
  patient_signature_date: new Date().toISOString().split('T')[0],
  patient_signature_time: new Date().toTimeString().slice(0, 5),
  witness_name: 'Dr. Sarah Johnson',
  witness_role: 'Treatment Coordinator',
  witness_signature: 'Dr. Sarah Johnson',
  witness_signature_date: new Date().toISOString().split('T')[0],
  witness_signature_time: new Date().toTimeString().slice(0, 5),
  
  confirmed_by_staff_initials: 'SJ',
  
  status: 'completed'
};

export function FinancialAgreementPreview({ onClose, agreementData }: FinancialAgreementPreviewProps) {
  // Use real agreement data if provided, otherwise use sample data
  const displayData = agreementData ? transformSupabaseToDisplayData(agreementData) : sampleAgreementData;

  // Debug: Log the data to see what we're working with
  console.log('Financial Agreement Preview - Original agreementData:', agreementData);
  console.log('Financial Agreement Preview - Display data:', displayData);

  // Handle signature image errors
  const handleSignatureError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load signature image:', e);
    // Hide the image and show fallback text
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'block';
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Agreement Preview</h1>
          <p className="text-gray-600 mt-1">Patient: {displayData.patient_name}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* 1. Patient & Treatment Identification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <User className="h-5 w-5" />
              1. Patient & Treatment Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm font-semibold text-gray-700">Patient Name</div>
                <div className="text-base mt-1">{displayData.patient_name}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Chart #</div>
                <div className="text-base mt-1">{displayData.chart_number || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-700">Date of Birth</div>
                <div className="text-base mt-1">{formatDate(displayData.date_of_birth) || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Date of Execution</div>
                <div className="text-base mt-1">{formatDate(displayData.date_of_execution)}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Time of Execution</div>
                <div className="text-base mt-1">{formatTime(displayData.time_of_execution)}</div>
              </div>
            </div>

            {/* Accepted Treatments */}
            {displayData.accepted_treatments && displayData.accepted_treatments.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-3">Accepted Treatments</div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
                      <div className="col-span-4">Service</div>
                      <div className="col-span-2">Fee (USD)</div>
                      <div className="col-span-3">Codes</div>
                      <div className="col-span-3">Initials</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {displayData.accepted_treatments.map((treatment, index) => (
                      <div key={index} className="px-4 py-3">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 text-sm font-medium">{treatment.service}</div>
                          <div className="col-span-2 text-sm">{treatment.fee}</div>
                          <div className="col-span-3 text-sm">
                            CDT: {treatment.cdtCode}<br />
                            CPT: {treatment.cptCode}
                          </div>
                          <div className="col-span-3 text-sm font-mono">{treatment.initials}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900">
                    Total Cost of Treatment: {formatCurrency(displayData.total_cost_of_treatment)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Payment & Balance Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <DollarSign className="h-5 w-5" />
              2. Payment & Balance Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-700">Patient Payment Today</div>
                <div className="text-lg font-semibold text-green-600 mt-1">
                  {formatCurrency(displayData.patient_payment_today)}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Remaining Balance</div>
                <div className="text-lg font-semibold text-orange-600 mt-1">
                  {formatCurrency(displayData.remaining_balance)}
                </div>
              </div>
            </div>
            
            {displayData.remaining_payment_plan && (
              <div>
                <div className="text-sm font-semibold text-gray-700">Payment Plan</div>
                <div className="text-base mt-1 p-3 bg-gray-50 rounded-lg">
                  {displayData.remaining_payment_plan}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Payment Terms Initials:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {displayData.payment_terms_initials || 'Not provided'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Non-Refundable & Lab Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              3. Non-Refundable & Lab Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800 mb-3">
                <strong>Important:</strong> All fees paid are non-refundable. Lab fees are due upon impression taking and are non-refundable regardless of treatment outcome.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Lab Fee Acknowledgment Initials:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {displayData.lab_fee_initials || 'Not provided'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Warranty & Care Package Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
              <Shield className="h-5 w-5" />
              4. Warranty & Care Package Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-700">Care Package Fee</div>
                <div className="text-lg font-semibold text-purple-600 mt-1">
                  {formatCurrency(displayData.care_package_fee)}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Care Package Election</div>
                <div className="text-base mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    displayData.care_package_election === 'enroll'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {displayData.care_package_election === 'enroll' ? 'Enrolled' : 'Deferred'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800 mb-3">
                The warranty is contingent upon enrollment in the care package and compliance with all recommended maintenance visits.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Warranty Terms Initials:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {displayData.warranty_initials || 'Not provided'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Capacity, Language & HIPAA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-indigo-700">
              <FileText className="h-5 w-5" />
              5. Capacity, Language & HIPAA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  displayData.capacity_confirmed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {displayData.capacity_confirmed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">Capacity Confirmed</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  displayData.hipaa_acknowledged ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {displayData.hipaa_acknowledged && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">HIPAA Acknowledged</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Capacity & HIPAA Initials:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {displayData.capacity_initials || 'Not provided'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-700">
              <Scale className="h-5 w-5" />
              6. Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                Any disputes arising from this agreement shall be resolved through binding arbitration in accordance with applicable state laws.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Dispute Resolution Initials:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {displayData.dispute_initials || 'Not provided'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Signatures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
              <FileText className="h-5 w-5" />
              7. Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                displayData.terms_agreed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {displayData.terms_agreed && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">I agree to the terms and conditions outlined in this financial agreement</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Signature */}
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Patient Signature</div>
                {displayData.patient_signature ? (
                  <div className="space-y-2">
                    <div className="h-16 border-b-2 border-gray-300 flex items-center justify-center bg-white">
                      {displayData.patient_signature.startsWith('data:image/') ? (
                        <>
                          <img
                            src={displayData.patient_signature}
                            alt="Patient Signature"
                            className="max-h-14 max-w-full object-contain"
                            onError={handleSignatureError}
                          />
                          <span className="font-signature text-xl text-blue-600" style={{ display: 'none' }}>
                            [Signature Image]
                          </span>
                        </>
                      ) : displayData.patient_signature.length > 50 ? (
                        // Assume it's base64 data without the data URL prefix
                        <>
                          <img
                            src={`data:image/png;base64,${displayData.patient_signature}`}
                            alt="Patient Signature"
                            className="max-h-14 max-w-full object-contain"
                            onError={handleSignatureError}
                          />
                          <span className="font-signature text-xl text-blue-600" style={{ display: 'none' }}>
                            [Signature Image]
                          </span>
                        </>
                      ) : (
                        // Short text, display as text signature
                        <span className="font-signature text-xl text-blue-600">
                          {displayData.patient_signature}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Signed on {formatDate(displayData.patient_signature_date)} at {formatTime(displayData.patient_signature_time)}
                    </div>
                  </div>
                ) : (
                  <div className="h-16 border-b-2 border-gray-300 flex items-center justify-center text-gray-400">
                    No signature provided
                  </div>
                )}
              </div>

              {/* Witness Signature */}
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Witness</div>
                {displayData.witness_signature ? (
                  <div className="space-y-2">
                    <div className="h-16 border-b-2 border-gray-300 flex items-center justify-center bg-white">
                      {displayData.witness_signature.startsWith('data:image/') ? (
                        <>
                          <img
                            src={displayData.witness_signature}
                            alt="Witness Signature"
                            className="max-h-14 max-w-full object-contain"
                            onError={handleSignatureError}
                          />
                          <span className="font-signature text-xl text-green-600" style={{ display: 'none' }}>
                            [Signature Image]
                          </span>
                        </>
                      ) : displayData.witness_signature.length > 50 ? (
                        // Assume it's base64 data without the data URL prefix
                        <>
                          <img
                            src={`data:image/png;base64,${displayData.witness_signature}`}
                            alt="Witness Signature"
                            className="max-h-14 max-w-full object-contain"
                            onError={handleSignatureError}
                          />
                          <span className="font-signature text-xl text-green-600" style={{ display: 'none' }}>
                            [Signature Image]
                          </span>
                        </>
                      ) : (
                        // Short text, display as text signature
                        <span className="font-signature text-xl text-green-600">
                          {displayData.witness_signature}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {displayData.witness_name} ({displayData.witness_role})<br />
                      Signed on {formatDate(displayData.witness_signature_date)} at {formatTime(displayData.witness_signature_time)}
                    </div>
                  </div>
                ) : (
                  <div className="h-16 border-b-2 border-gray-300 flex items-center justify-center text-gray-400">
                    No witness signature provided
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. Office Use Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-600">
              <FileText className="h-5 w-5" />
              8. Office Use Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Downloaded to Dental Management Software:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  displayData.downloaded_to_dental_management_software ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {displayData.downloaded_to_dental_management_software ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-semibold text-gray-700">Confirmed by Staff Initials:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {displayData.confirmed_by_staff_initials || 'Pending'}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-sm font-semibold text-gray-700">Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  displayData.status === 'completed' ? 'bg-green-100 text-green-800' :
                  displayData.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                  displayData.status === 'executed' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {displayData.status?.toUpperCase() || 'DRAFT'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
