import React from 'react';
import { Loader2, FileText, Users, Calendar, Stethoscope, Database, Settings } from 'lucide-react';

interface PageLoadingAnimationProps {
  message?: string;
  pageType?: 'dashboard' | 'patients' | 'appointments' | 'lab' | 'users' | 'settings' | 'general';
}

const pageIcons = {
  dashboard: Stethoscope,
  patients: Users,
  appointments: Calendar,
  lab: FileText,
  users: Users,
  settings: Settings,
  general: Database,
};

const pageMessages = {
  dashboard: 'Loading dashboard...',
  patients: 'Loading patient data...',
  appointments: 'Loading appointments...',
  lab: 'Loading lab information...',
  users: 'Loading user management...',
  settings: 'Loading settings...',
  general: 'Loading...',
};

export function PageLoadingAnimation({ 
  message, 
  pageType = 'general' 
}: PageLoadingAnimationProps) {
  const IconComponent = pageIcons[pageType];
  const defaultMessage = message || pageMessages[pageType];

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-blue-50/30 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-indigo-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-8 h-8 bg-purple-500 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-400 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-sm mx-auto px-6">
        {/* Icon Animation */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0" />
            <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <IconComponent className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 animate-fade-in-up">
            {defaultMessage}
          </h2>
          <p className="text-gray-600 text-sm animate-fade-in-up delay-200">
            Please wait while we prepare your content...
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-20 delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20 delay-2000"></div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactPageLoadingAnimation({ 
  message = "Loading...",
  size = "md" 
}: { 
  message?: string; 
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className={`${sizeClasses[size]} mx-auto mb-4 relative`}>
          <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 absolute inset-0`} />
          <div className="absolute inset-1 bg-white rounded-full shadow-inner"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-600 text-sm animate-fade-in">{message}</p>
        
        {/* Mini progress dots */}
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}

// Full screen loading for major page transitions
export function FullScreenPageLoading({ 
  message = "Loading page...",
  pageType = 'general' 
}: PageLoadingAnimationProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 z-50 flex items-center justify-center">
      <PageLoadingAnimation message={message} pageType={pageType} />
    </div>
  );
}
