import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredRole?: string;
  showBackButton?: boolean;
}

export function AccessDenied({ 
  title = "Access Restricted",
  message = "You don't have permission to access this page.",
  requiredRole = "Administrator",
  showBackButton = true 
}: AccessDeniedProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Lock className="h-6 w-6 text-red-600" />
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Access Denied</span>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Required Access Level:</strong> {requiredRole} or higher
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              If you believe you should have access to this page, please contact your system administrator.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              )}
              
              <Button 
                onClick={handleGoHome}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specific component for User Management access denial
export function UserManagementAccessDenied() {
  return (
    <AccessDenied
      title="User Management Access Restricted"
      message="This page is restricted to administrators only. You need administrator or super administrator privileges to manage users."
      requiredRole="Administrator"
      showBackButton={true}
    />
  );
}
