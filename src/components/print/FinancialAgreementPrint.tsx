import React from 'react';

interface FinancialAgreementPrintProps {
  agreementData: any;
}

export const FinancialAgreementPrint: React.FC<FinancialAgreementPrintProps> = ({ agreementData }) => {
  return (
    <div className="space-y-6">
      {/* Patient and Treatment Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Patient and Treatment Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Patient Name:</span> {agreementData.patient_name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Date of Birth:</span> {agreementData.date_of_birth ? new Date(agreementData.date_of_birth).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Treatment Type:</span> {agreementData.treatment_type || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Provider:</span> {agreementData.provider_name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Financial Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Cost of Treatment:</span> ${agreementData.total_cost_of_treatment?.toLocaleString() || '0.00'}
          </div>
          <div>
            <span className="font-medium">Insurance Coverage:</span> ${agreementData.insurance_coverage?.toLocaleString() || '0.00'}
          </div>
          <div>
            <span className="font-medium">Patient Responsibility:</span> ${agreementData.patient_responsibility?.toLocaleString() || '0.00'}
          </div>
          <div>
            <span className="font-medium">Down Payment:</span> ${agreementData.down_payment?.toLocaleString() || '0.00'}
          </div>
          <div>
            <span className="font-medium">Remaining Balance:</span> ${agreementData.remaining_balance?.toLocaleString() || '0.00'}
          </div>
          <div>
            <span className="font-medium">Monthly Payment:</span> ${agreementData.monthly_payment?.toLocaleString() || '0.00'}
          </div>
        </div>
      </div>

      {/* Payment Plan Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Payment Plan Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Payment Plan Type:</span> {agreementData.payment_plan_type || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Number of Payments:</span> {agreementData.number_of_payments || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Interest Rate:</span> {agreementData.interest_rate ? `${agreementData.interest_rate}%` : 'N/A'}
          </div>
          <div>
            <span className="font-medium">First Payment Due:</span> {agreementData.first_payment_due ? new Date(agreementData.first_payment_due).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Terms and Conditions
        </h3>
        <div className="text-sm space-y-3">
          <div>
            <span className="font-medium">Payment Terms:</span>
            <div className="mt-1 whitespace-pre-wrap">{agreementData.payment_terms || 'Standard payment terms apply.'}</div>
          </div>
          
          <div>
            <span className="font-medium">Late Payment Policy:</span>
            <div className="mt-1 whitespace-pre-wrap">{agreementData.late_payment_policy || 'Late fees may apply for overdue payments.'}</div>
          </div>
          
          <div>
            <span className="font-medium">Cancellation Policy:</span>
            <div className="mt-1 whitespace-pre-wrap">{agreementData.cancellation_policy || 'Cancellation terms as per practice policy.'}</div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {agreementData.additional_notes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Additional Notes
          </h3>
          <div className="text-sm">
            <div className="whitespace-pre-wrap">{agreementData.additional_notes}</div>
          </div>
        </div>
      )}

      {/* Agreement Acknowledgments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Agreement Acknowledgments
        </h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${agreementData.terms_accepted ? 'bg-green-100' : 'bg-gray-50'}`}>
              {agreementData.terms_accepted && '✓'}
            </span>
            <span>I have read and agree to the terms and conditions of this financial agreement.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${agreementData.payment_responsibility_acknowledged ? 'bg-green-100' : 'bg-gray-50'}`}>
              {agreementData.payment_responsibility_acknowledged && '✓'}
            </span>
            <span>I understand my financial responsibility for the treatment.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${agreementData.insurance_understanding ? 'bg-green-100' : 'bg-gray-50'}`}>
              {agreementData.insurance_understanding && '✓'}
            </span>
            <span>I understand that insurance coverage is an estimate and not a guarantee.</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          Signatures
        </h3>
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <div className="text-sm font-medium mb-2">Patient Signature:</div>
            {agreementData.patient_signature ? (
              <img src={agreementData.patient_signature} alt="Patient Signature" className="max-h-16 border border-gray-300" />
            ) : (
              <div className="h-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                No signature provided
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              Date: {agreementData.patient_signature_date ? new Date(agreementData.patient_signature_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Witness/Staff Signature:</div>
            {agreementData.witness_signature ? (
              <img src={agreementData.witness_signature} alt="Witness Signature" className="max-h-16 border border-gray-300" />
            ) : (
              <div className="h-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                No signature provided
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              Date: {agreementData.witness_signature_date ? new Date(agreementData.witness_signature_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Form Metadata */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-500 grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Agreement Status:</span> {agreementData.status || 'Active'}
          </div>
          <div>
            <span className="font-medium">Created:</span> {agreementData.created_at ? new Date(agreementData.created_at).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
