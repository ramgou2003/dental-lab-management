
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccessRestricted() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto space-y-6">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-12 w-12 text-red-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Access Restricted</h1>
                    <p className="text-gray-500">
                        You don't have the required permissions to view this page. If you believe this is an error, please contact your administrator.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>

                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
