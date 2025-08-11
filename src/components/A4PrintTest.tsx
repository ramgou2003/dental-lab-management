import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintPreviewDialog } from "@/components/PrintPreviewDialog";

export const A4PrintTest: React.FC = () => {
  const [showPrint, setShowPrint] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const sampleFormData = {
    // Patient Information
    patient_name: "John Doe",
    date_of_birth: "1985-06-15",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    address: "123 Main Street, New York, NY 10001",
    emergency_contact: "Jane Doe - (555) 987-6543",
    insurance_provider: "Blue Cross Blue Shield",

    // Medical Information
    medical_history: "Hypertension controlled with medication, Previous dental work in 2020",
    allergies: "Penicillin, Latex",
    current_medications: "Lisinopril 10mg daily, Metformin 500mg twice daily",
    medical_conditions: "Type 2 Diabetes, High Blood Pressure",

    // Treatment & Financial Information
    treatment_plan: "Full arch dental implants - Upper and Lower",
    treatment_description: "Complete removal of remaining teeth, placement of 6 implants per arch, immediate temporary prosthetics, final prosthetics after 3-6 months healing",
    treatment_cost: "$45,000",
    payment_plan: "12 months at $3,750/month",
    financial_agreement: "Patient agrees to payment plan with 0% interest for 12 months. Late fees apply after 30 days.",
    consultation_notes: "Patient is a good candidate for full arch treatment. Discussed timeline, expectations, and post-operative care. Patient understands the process and risks involved.",

    // Additional Information
    consent_given: true,
    risks_explained: true,
    post_op_instructions_provided: true,
    follow_up_scheduled: true,
    signature_date: "2024-01-15",

    // Signatures (base64 encoded sample)
    patient_signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiPkpvaG4gRG9lPC90ZXh0Pjwvc3ZnPg==",
    patient_signature_date: "2024-01-15",
    witness_signature: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiPkphbmUgRG9lPC90ZXh0Pjwvc3ZnPg==",
    witness_signature_date: "2024-01-15"
  };

  const handlePrint = () => {
    window.print();
  };

  if (!showPrint) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">A4 Print System Test</h2>
        <p className="mb-4">Test the enhanced A4 print functionality with comprehensive form data:</p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowPrint(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Basic A4 Layout
          </button>
          <button
            onClick={() => setShowPrintPreview(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test Enhanced Print System
          </button>
        </div>

        {/* Enhanced Print Preview Dialog */}
        <PrintPreviewDialog
          isOpen={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          formTitle="Financial Agreement & Payment Terms"
          patientName="John Doe"
          patientDateOfBirth="1985-06-15"
          formId="FIN-000123"
          formData={sampleFormData}
          formType="Financial Agreement"
        />
      </div>
    );
  }

  return (
    <div className="max-w-[210mm] mx-auto bg-white">
      {/* A4 Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          
          /* A4 Page Setup */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Force color printing */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Remove page styling for print */
          body { margin: 0; padding: 0; font-size: 10pt; line-height: 1.3; }
          .print-container { width: 100%; max-width: none; margin: 0; padding: 0; }
          
          /* Preserve colors */
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .border-blue-200 { border-color: #bfdbfe !important; }
          .border-green-200 { border-color: #bbf7d0 !important; }
          .border-yellow-200 { border-color: #fde68a !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
          .text-blue-800 { color: #1e40af !important; }
          .text-green-800 { color: #166534 !important; }
          .text-yellow-800 { color: #92400e !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-900 { color: #111827 !important; }
          
          /* Page breaks */
          .page-break { page-break-before: always; }
          .no-page-break { page-break-inside: avoid; }
          .card { page-break-inside: avoid; margin-bottom: 1rem; }
          
          /* Adjust spacing */
          .space-y-6 > * + * { margin-top: 0.75rem !important; }
          .space-y-4 > * + * { margin-top: 0.5rem !important; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .gap-4 { gap: 0.5rem !important; }
        }
      `}</style>

      {/* Action Buttons - Only visible on screen */}
      <div className="no-print flex justify-between items-center p-4 bg-gray-50 border-b mb-6">
        <h2 className="text-lg font-semibold text-gray-900">A4 Print Preview - Sample Form</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print A4
          </button>
          <button
            onClick={() => setShowPrint(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print Content - Fits A4 width */}
      <div className="print-container p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Form - A4 Print Test</h1>
          <p className="text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Patient Information */}
        <Card className="border-2 border-blue-200 no-page-break">
          <CardHeader className="bg-blue-50 pb-4">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Patient Name</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.patient_name}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.date_of_birth}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.phone}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.email}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.address}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="border-2 border-green-200 no-page-break">
          <CardHeader className="bg-green-50 pb-4">
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Medical History</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.medical_history}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Allergies</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.allergies}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Current Medications</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.current_medications}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Information */}
        <Card className="border-2 border-yellow-200 no-page-break">
          <CardHeader className="bg-yellow-50 pb-4">
            <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Treatment & Financial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Treatment Plan</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.treatment_plan}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Consultation Notes</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.consultation_notes}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Financial Agreement</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.financial_agreement}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent & Signatures */}
        <Card className="border-2 border-gray-200 no-page-break">
          <CardHeader className="bg-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Consent & Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Consent Given</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.consent_given ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Signature Date</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {sampleFormData.signature_date}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">Patient Signature</label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[80px] flex items-center justify-center">
                  <span className="text-gray-500 italic">Signature would appear here</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
