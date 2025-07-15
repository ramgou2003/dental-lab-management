import React, { useState, useEffect } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';

interface OrientationGuardProps {
  children: React.ReactNode;
}

const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if the device is in portrait mode
      // Use both window dimensions and screen orientation API for better detection
      const isCurrentlyPortrait = window.innerHeight > window.innerWidth;

      // Additional check using screen orientation API if available
      let screenOrientationPortrait = false;
      if (screen.orientation) {
        screenOrientationPortrait = screen.orientation.angle === 0 || screen.orientation.angle === 180;
      }

      // Use window dimensions as primary check, screen orientation as secondary
      setIsPortrait(isCurrentlyPortrait);
    };

    // Check orientation on mount
    checkOrientation();

    // Listen for orientation changes with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkOrientation, 100);
    };

    window.addEventListener('resize', debouncedCheck);
    window.addEventListener('orientationchange', debouncedCheck);

    // Also listen to screen orientation change if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', debouncedCheck);
    }

    // Cleanup event listeners
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
      window.removeEventListener('orientationchange', debouncedCheck);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', debouncedCheck);
      }
    };
  }, []);

  if (isPortrait) {
    return (
      <div className="orientation-guard fixed inset-0 bg-white z-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          {/* Animated Phone Icon */}
          <div className="relative mb-8">
            <div className="inline-block animate-gentle-bounce">
              <Smartphone className="h-24 w-24 text-gray-400 mx-auto" />
            </div>

            {/* Rotation Arrow Animation */}
            <div className="absolute -top-2 -right-2">
              <RotateCcw className="h-8 w-8 text-blue-600 animate-rotate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Rotate Your Device
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            This application is optimized for landscape mode. 
            Please rotate your tablet to landscape orientation for the best experience.
          </p>

          {/* Visual Rotation Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {/* Portrait Device (Current) */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-16 border-2 border-gray-300 rounded-lg bg-gray-100 relative">
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-500 mt-2">Current</span>
            </div>

            {/* Arrow */}
            <RotateCcw className="h-6 w-6 text-blue-600 animate-pulse" />

            {/* Landscape Device (Target) */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-12 border-2 border-blue-600 rounded-lg bg-blue-50 relative">
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span className="text-xs text-blue-600 mt-2 font-medium">Rotate to this</span>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <img
                src="/logo-icon.png"
                alt="NYDI Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback to SVG if PNG doesn't exist
                  e.currentTarget.src = "/logo-icon.svg";
                  e.currentTarget.onerror = () => {
                    // Final fallback to placeholder icon
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback && fallback.classList.contains('fallback-icon')) {
                      fallback.style.display = 'flex';
                    }
                  };
                }}
              />
              <div className="w-10 h-10 bg-blue-600 rounded-lg items-center justify-center fallback-icon" style={{ display: 'none' }}>
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">NYDI</span>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Professional dental laboratory workflow management system
            </p>
          </div>

          {/* Instruction Text */}
          <div className="mt-6 text-sm text-gray-500">
            <p>💡 Tip: Lock your screen rotation after rotating to landscape mode</p>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OrientationGuard;
