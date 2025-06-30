import React, { useEffect, useState } from 'react';
import { Shield, Heart, Stethoscope, Users, Calendar, FileText } from 'lucide-react';

export function AppLoadingScreen() {
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { icon: Shield, text: "Initializing security...", color: "text-blue-600" },
    { icon: Users, text: "Loading user data...", color: "text-green-600" },
    { icon: Stethoscope, text: "Connecting to services...", color: "text-purple-600" },
    { icon: Calendar, text: "Syncing appointments...", color: "text-indigo-600" },
    { icon: FileText, text: "Preparing workspace...", color: "text-orange-600" },
    { icon: Heart, text: "Almost ready...", color: "text-red-600" },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 2;
        }
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStep = loadingSteps[loadingStep];
  const IconComponent = currentStep?.icon || Shield;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-indigo-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-purple-500 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-blue-400 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo Section */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl animate-bounce-gentle">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Path Compass</h1>
          <p className="text-gray-600 text-lg">Dental Lab Management System</p>
        </div>

        {/* Current Step Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full shadow-lg flex items-center justify-center">
              <IconComponent className={`h-8 w-8 ${currentStep?.color || 'text-blue-600'} animate-bounce-gentle`} />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2 animate-fade-in-up">
            {currentStep?.text || "Loading..."}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{progress}% Complete</p>
        </div>

        {/* Loading Steps Indicator */}
        <div className="flex justify-center space-x-3 mb-8">
          {loadingSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= loadingStep
                    ? 'bg-blue-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <StepIcon className="h-4 w-4" />
              </div>
            );
          })}
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 animate-fade-in-up delay-1000">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure connection established</span>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-20 delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20 delay-2000"></div>
      </div>
    </div>
  );
}
