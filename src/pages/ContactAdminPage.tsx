import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, ArrowLeft, Users } from 'lucide-react';

export function ContactAdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Need an Account?</CardTitle>
          <CardDescription className="text-center">
            Contact your system administrator to get access to the dental lab management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Only authorized personnel can create new user accounts. Please reach out to your administrator using the contact information below.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">admin@dentallab.com</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">(555) 123-4567</span>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                When contacting the administrator, please provide:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Your full name</li>
                <li>• Your email address</li>
                <li>• Your role in the organization</li>
                <li>• The access level you need</li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
