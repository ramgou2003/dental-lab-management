import React from 'react';
import '../styles/print.css';

interface LetterheadTemplateProps {
  formTitle: string;
  patientName: string;
  patientDateOfBirth?: string;
  formId?: string;
  children: React.ReactNode;
  showPrintButton?: boolean;
  onPrint?: () => void;
  onClose?: () => void;
}

export const LetterheadTemplate: React.FC<LetterheadTemplateProps> = ({
  formTitle,
  patientName,
  patientDateOfBirth,
  formId,
  children,
  showPrintButton = true,
  onPrint,
  onClose
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="letterhead-container bg-white min-h-screen">

      {/* Action Buttons - Only show on screen */}
      {showPrintButton && (
        <div className="no-print flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900">Print Preview</h2>
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
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Letterhead Header */}
      <div className="letterhead-header border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <img
              src="/logo-wide.png"
              alt="NYDI Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback to text logo if image fails to load
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'text-2xl font-bold text-blue-600 border-2 border-blue-600 px-4 py-2 rounded';
                fallback.textContent = 'NYDI';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>

          {/* Clinic Information */}
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-900 mb-1">NYDI - Dental Clinic</h1>
            <div className="text-sm text-gray-700 space-y-0.5">
              <div>123 Main Street</div>
              <div>New York, NY 10001</div>
              <div>Phone: (555) 123-4567</div>
              <div>Email: info@nydi.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Title and Patient Information */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
          {formTitle}
        </h2>
        
        <div className="flex justify-between items-center text-sm text-gray-700 border-b border-gray-300 pb-3">
          <div className="flex gap-8">
            <div>
              <span className="font-semibold">Patient:</span> {patientName}
            </div>
            {patientDateOfBirth && (
              <div>
                <span className="font-semibold">DOB:</span> {new Date(patientDateOfBirth).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex gap-8">
            <div>
              <span className="font-semibold">Date:</span> {currentDate}
            </div>
            {formId && (
              <div>
                <span className="font-semibold">Form ID:</span> {formId}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="letterhead-content mb-8">
        {children}
      </div>

      {/* Footer */}
      <div className="letterhead-footer text-xs text-gray-500 text-center border-t border-gray-300 pt-3 mt-8">
        <div className="flex justify-between items-center">
          <div>Generated on {currentDate} at {currentTime}</div>
          <div>Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};
