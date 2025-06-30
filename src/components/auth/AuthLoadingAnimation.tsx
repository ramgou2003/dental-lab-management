import React from 'react';
import { Loader2, Shield, Lock, User, CheckCircle } from 'lucide-react';

interface AuthLoadingAnimationProps {
  message?: string;
  showLogo?: boolean;
}

export function AuthLoadingAnimation({ 
  message = "Authenticating...", 
  showLogo = true 
}: AuthLoadingAnimationProps) {
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
        {showLogo && (
          <div className="mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Patient Path Compass</h1>
            <p className="text-gray-600 text-sm">Dental Lab Management System</p>
          </div>
        )}

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Main Spinner */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0" />
              <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
            </div>

            {/* Security Icons Animation */}
            <div className="flex justify-center space-x-8 mb-6">
              <div className="animate-float delay-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="animate-float delay-300">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="animate-float delay-600">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 animate-fade-in-up">
            {message}
          </h2>
          <p className="text-gray-600 animate-fade-in-up delay-200">
            Please wait while we verify your credentials and load your profile...
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 animate-fade-in-up delay-500">
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

// Enhanced loading animation for specific auth states
export function AuthReconnectingAnimation() {
  return (
    <AuthLoadingAnimation
      message="Reconnecting..."
      showLogo={false}
    />
  );
}

export function AuthVerifyingAnimation() {
  return (
    <AuthLoadingAnimation
      message="Verifying credentials..."
      showLogo={true}
    />
  );
}

export function AuthLoadingProfileAnimation() {
  return (
    <AuthLoadingAnimation
      message="Loading your profile..."
      showLogo={false}
    />
  );
}

// Authentication Lost Animation
export function AuthLostAnimation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-orange-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-yellow-500 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-red-400 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo Section */}
        <div className="mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
          <p className="text-gray-600 text-sm">Please sign in to continue</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Main Spinner */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Loader2 className="h-16 w-16 animate-spin text-red-500 absolute inset-0" />
              <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-red-100 to-orange-100 rounded-full animate-pulse"></div>
            </div>

            {/* Security Icons Animation */}
            <div className="flex justify-center space-x-8 mb-6">
              <div className="animate-float delay-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="animate-float delay-300">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="animate-float delay-600">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 animate-fade-in-up">
            Session Expired
          </h2>
          <p className="text-gray-600 animate-fade-in-up delay-200">
            Your session has expired. Redirecting to login page...
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 animate-fade-in-up delay-500">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-orange-600" />
            <span>Secure authentication required</span>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping opacity-20 delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-20 delay-2000"></div>
      </div>
    </div>
  );
}
