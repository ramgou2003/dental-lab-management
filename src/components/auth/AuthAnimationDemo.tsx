import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AuthLoadingAnimation, 
  AuthVerifyingAnimation, 
  AuthReconnectingAnimation,
  AuthLostAnimation,
  AuthLoadingProfileAnimation 
} from './AuthLoadingAnimation';
import { AppLoadingScreen } from '../AppLoadingScreen';

type AnimationType = 
  | 'loading'
  | 'verifying'
  | 'reconnecting'
  | 'lost'
  | 'profile'
  | 'app'
  | 'none';

export function AuthAnimationDemo() {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('none');

  const animations = [
    { type: 'loading' as const, label: 'General Loading', component: <AuthLoadingAnimation /> },
    { type: 'verifying' as const, label: 'Verifying Credentials', component: <AuthVerifyingAnimation /> },
    { type: 'reconnecting' as const, label: 'Reconnecting', component: <AuthReconnectingAnimation /> },
    { type: 'lost' as const, label: 'Session Expired', component: <AuthLostAnimation /> },
    { type: 'profile' as const, label: 'Loading Profile', component: <AuthLoadingProfileAnimation /> },
    { type: 'app' as const, label: 'App Loading', component: <AppLoadingScreen /> },
  ];

  if (currentAnimation !== 'none') {
    const animation = animations.find(a => a.type === currentAnimation);
    return (
      <div className="relative">
        {animation?.component}
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => setCurrentAnimation('none')}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
          >
            Close Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Authentication Animation Demo
          </h1>
          <p className="text-gray-600">
            Click any button below to preview the authentication loading animations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animations.map((animation) => (
            <Button
              key={animation.type}
              onClick={() => setCurrentAnimation(animation.type)}
              className="h-24 text-lg font-medium bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {animation.label}
            </Button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Animation Features
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Beautiful gradients</strong> and smooth animations</li>
            <li>• <strong>Floating elements</strong> and background patterns</li>
            <li>• <strong>Security-themed icons</strong> for trust and professionalism</li>
            <li>• <strong>Progress indicators</strong> and loading states</li>
            <li>• <strong>Responsive design</strong> that works on all devices</li>
            <li>• <strong>Contextual messaging</strong> for different auth states</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
