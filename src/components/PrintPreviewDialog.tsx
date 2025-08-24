import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilledPatientPacketViewer } from "@/components/FilledPatientPacketViewer";
import { ConsentFullArchForm } from "@/components/ConsentFullArchForm";
import { FinancialAgreementForm } from "@/components/FinancialAgreementForm";
import { MedicalRecordsReleaseForm } from "@/components/MedicalRecordsReleaseForm";
import { InformedConsentSmokingForm } from "@/components/InformedConsentSmokingForm";
import { FinalDesignApprovalForm } from "@/components/FinalDesignApprovalForm";
import { ThankYouPreSurgeryForm } from "@/components/ThankYouPreSurgeryForm";
import { ThreeYearCarePackageForm } from "@/components/ThreeYearCarePackageForm";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  patientName: string;
  patientDateOfBirth?: string;
  formId?: string;
  formData: any;
  formType: string;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  isOpen,
  onClose,
  formTitle,
  patientName,
  patientDateOfBirth,
  formId,
  formData,
  formType
}) => {
  const handlePrint = () => {
    window.print();
  };



  // Helper function to format field names
  const formatFieldName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  // Helper function to format field values
  const formatFieldValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Render comprehensive form data display
  const renderFormComponent = () => {
    if (!formData) {
      return <div className="text-center text-gray-500 py-8">No form data available</div>;
    }

    // For New Patient Packet, use the existing viewer
    if (formType === 'New Patient Packet') {
      return (
        <div className="read-only-form">
          <FilledPatientPacketViewer
            packetData={formData}
            patientName={patientName}
          />
        </div>
      );
    }

    // For all other forms, create a comprehensive data display
    const systemFields = ['id', 'created_at', 'updated_at', 'patient_id'];
    const signatureFields = ['patient_signature', 'witness_signature', 'doctor_signature'];
    const dateFields = ['patient_signature_date', 'witness_signature_date', 'doctor_signature_date'];

    const regularFields = Object.entries(formData).filter(([key]) =>
      !systemFields.includes(key) &&
      !signatureFields.includes(key) &&
      !dateFields.includes(key)
    );

    const signatures = Object.entries(formData).filter(([key]) =>
      signatureFields.includes(key) && formData[key]
    );

    return (
      <div className="read-only-form space-y-6">
        {/* Form Header */}
        <div className="text-center border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{formType}</h1>
          <div className="text-sm text-gray-600">
            <p><strong>Patient:</strong> {patientName}</p>
            {patientDateOfBirth && <p><strong>Date of Birth:</strong> {patientDateOfBirth}</p>}
            <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
            {formId && <p><strong>Form ID:</strong> {formId}</p>}
          </div>
        </div>

        {/* Form Data Sections */}
        <div className="space-y-6">
          {/* Patient Information Section */}
          {regularFields.some(([key]) => key.toLowerCase().includes('patient') || key.toLowerCase().includes('name') || key.toLowerCase().includes('birth') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('email') || key.toLowerCase().includes('address')) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularFields
                  .filter(([key]) => key.toLowerCase().includes('patient') || key.toLowerCase().includes('name') || key.toLowerCase().includes('birth') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('email') || key.toLowerCase().includes('address'))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {formatFieldName(key)}
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                        {formatFieldValue(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Treatment/Financial Information Section */}
          {regularFields.some(([key]) => key.toLowerCase().includes('treatment') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('payment') || key.toLowerCase().includes('financial') || key.toLowerCase().includes('price')) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Treatment & Financial Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularFields
                  .filter(([key]) => key.toLowerCase().includes('treatment') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('fee') || key.toLowerCase().includes('payment') || key.toLowerCase().includes('financial') || key.toLowerCase().includes('price'))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {formatFieldName(key)}
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                        {formatFieldValue(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Medical Information Section */}
          {regularFields.some(([key]) => key.toLowerCase().includes('medical') || key.toLowerCase().includes('health') || key.toLowerCase().includes('condition') || key.toLowerCase().includes('allergy') || key.toLowerCase().includes('medication')) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {regularFields
                  .filter(([key]) => key.toLowerCase().includes('medical') || key.toLowerCase().includes('health') || key.toLowerCase().includes('condition') || key.toLowerCase().includes('allergy') || key.toLowerCase().includes('medication'))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {formatFieldName(key)}
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                        {formatFieldValue(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Other Information Section */}
          {regularFields.some(([key]) =>
            !key.toLowerCase().includes('patient') &&
            !key.toLowerCase().includes('name') &&
            !key.toLowerCase().includes('birth') &&
            !key.toLowerCase().includes('phone') &&
            !key.toLowerCase().includes('email') &&
            !key.toLowerCase().includes('address') &&
            !key.toLowerCase().includes('treatment') &&
            !key.toLowerCase().includes('cost') &&
            !key.toLowerCase().includes('fee') &&
            !key.toLowerCase().includes('payment') &&
            !key.toLowerCase().includes('financial') &&
            !key.toLowerCase().includes('price') &&
            !key.toLowerCase().includes('medical') &&
            !key.toLowerCase().includes('health') &&
            !key.toLowerCase().includes('condition') &&
            !key.toLowerCase().includes('allergy') &&
            !key.toLowerCase().includes('medication')
          ) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularFields
                  .filter(([key]) =>
                    !key.toLowerCase().includes('patient') &&
                    !key.toLowerCase().includes('name') &&
                    !key.toLowerCase().includes('birth') &&
                    !key.toLowerCase().includes('phone') &&
                    !key.toLowerCase().includes('email') &&
                    !key.toLowerCase().includes('address') &&
                    !key.toLowerCase().includes('treatment') &&
                    !key.toLowerCase().includes('cost') &&
                    !key.toLowerCase().includes('fee') &&
                    !key.toLowerCase().includes('payment') &&
                    !key.toLowerCase().includes('financial') &&
                    !key.toLowerCase().includes('price') &&
                    !key.toLowerCase().includes('medical') &&
                    !key.toLowerCase().includes('health') &&
                    !key.toLowerCase().includes('condition') &&
                    !key.toLowerCase().includes('allergy') &&
                    !key.toLowerCase().includes('medication')
                  )
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {formatFieldName(key)}
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                        {formatFieldValue(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Signatures Section */}
          {signatures.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 signature-area">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Signatures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {signatures.map(([key, value]) => {
                  const signatureType = key.replace('_signature', '').replace('_', ' ');
                  const dateKey = key.replace('signature', 'signature_date');
                  const signatureDate = formData[dateKey];

                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {formatFieldName(signatureType)} Signature
                      </label>
                      <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[100px] flex items-center justify-center">
                        {value ? (
                          <img src={value} alt={`${signatureType} Signature`} className="max-h-20 max-w-full" />
                        ) : (
                          <span className="text-gray-400 italic">No signature</span>
                        )}
                      </div>
                      {signatureDate && (
                        <p className="text-xs text-gray-500">
                          Date: {new Date(signatureDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-[210mm] max-h-[95vh] overflow-y-auto p-0">
        {/* A4 Print Styles - Enhanced for form components */}
        <style>{`
          @media print {
            /* Hide non-print elements */
            .no-print { display: none !important; }

            /* Force color printing */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* A4 Page Setup */
            @page {
              size: A4;
              margin: 15mm;
            }

            /* Remove dialog styling for print */
            .fixed.inset-0 {
              position: static !important;
              background: white !important;
            }

            [role="dialog"] {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              width: 100% !important;
              height: auto !important;
            }

            /* Print content container */
            .print-content {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 10pt !important;
              line-height: 1.3 !important;
            }

            /* Hide form navigation and action buttons */
            .no-print,
            button:not(.navigation-button),
            .form-navigation,
            .form-actions,
            .dialog-header,
            .dialog-footer {
              display: none !important;
            }

            /* Preserve all form styling */
            .read-only-form {
              background: white !important;
              width: 100% !important;
              max-width: none !important;
            }

            /* Ensure all content is visible */
            .space-y-6 > * {
              margin-bottom: 1.5rem !important;
            }

            /* Make sure sections don't break */
            .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-purple-50, .bg-gray-50 {
              page-break-inside: avoid !important;
              margin-bottom: 1rem !important;
            }

            /* Preserve card styling */
            .bg-blue-50 { background-color: #eff6ff !important; }
            .bg-blue-100 { background-color: #dbeafe !important; }
            .bg-green-50 { background-color: #f0fdf4 !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-red-50 { background-color: #fef2f2 !important; }
            .bg-red-100 { background-color: #fee2e2 !important; }
            .bg-yellow-50 { background-color: #fefce8 !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }
            .bg-purple-50 { background-color: #faf5ff !important; }
            .bg-purple-100 { background-color: #f3e8ff !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .bg-white { background-color: #ffffff !important; }

            /* Preserve border colors */
            .border-blue-100 { border-color: #dbeafe !important; }
            .border-blue-200 { border-color: #bfdbfe !important; }
            .border-green-100 { border-color: #dcfce7 !important; }
            .border-green-200 { border-color: #bbf7d0 !important; }
            .border-red-200 { border-color: #fecaca !important; }
            .border-yellow-200 { border-color: #fde68a !important; }
            .border-purple-100 { border-color: #f3e8ff !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-gray-300 { border-color: #d1d5db !important; }

            /* Preserve text colors */
            .text-blue-600 { color: #2563eb !important; }
            .text-blue-700 { color: #1d4ed8 !important; }
            .text-blue-800 { color: #1e40af !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-green-700 { color: #15803d !important; }
            .text-green-800 { color: #166534 !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-red-700 { color: #b91c1c !important; }
            .text-red-800 { color: #991b1b !important; }
            .text-yellow-600 { color: #ca8a04 !important; }
            .text-yellow-700 { color: #a16207 !important; }
            .text-purple-600 { color: #9333ea !important; }
            .text-purple-700 { color: #7c3aed !important; }
            .text-purple-800 { color: #6b21a8 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-900 { color: #111827 !important; }

            /* Page breaks */
            .page-break { page-break-before: always; }
            .no-page-break { page-break-inside: avoid; }

            /* Ensure cards and sections stay together when possible */
            .card, [class*="Card"] { page-break-inside: avoid; }

            /* Adjust spacing for print */
            .space-y-6 > * + * { margin-top: 0.75rem !important; }
            .space-y-4 > * + * { margin-top: 0.5rem !important; }
            .space-y-2 > * + * { margin-top: 0.25rem !important; }

            /* Ensure proper sizing */
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-4 { gap: 0.5rem !important; }
            .gap-6 { gap: 0.75rem !important; }

            /* Signature areas */
            .signature-area {
              min-height: 60px !important;
              page-break-inside: avoid !important;
            }

            /* Form inputs in read-only mode */
            .read-only-form input,
            .read-only-form textarea,
            .read-only-form select {
              border: 1px solid #d1d5db !important;
              background: #f9fafb !important;
              color: #374151 !important;
            }
          }
        `}</style>

        {/* Action Buttons - Only visible on screen */}
        <div className="no-print flex justify-between items-center p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Print Preview - {formTitle}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>

        {/* Form Content - Render the actual form component */}
        <div className="print-content p-6">
          {renderFormComponent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
