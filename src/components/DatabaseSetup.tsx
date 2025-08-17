import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createPartialPaymentAgreementTable } from '@/scripts/createPartialPaymentTable';
import { toast } from 'sonner';

export function DatabaseSetup() {
  const [isChecking, setIsChecking] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [sqlScript, setSqlScript] = useState<string>('');
  const [showScript, setShowScript] = useState(false);

  const handleCheckTable = async () => {
    setIsChecking(true);

    try {
      const result = await createPartialPaymentAgreementTable();

      if (result.success) {
        setTableExists(true);
        toast.success('Table already exists!');
      } else {
        setTableExists(false);
        setSqlScript(result.sqlScript || '');
        setShowScript(true);
        toast.info('Table needs to be created manually in Supabase');
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTableExists(false);
      toast.error('Failed to check table status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      toast.success('SQL script copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy script');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Partial Payment Agreement - Database Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Check if the database table exists for Partial Payment Agreement forms.
        </p>

        {tableExists === true ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">✅ Table exists! Partial Payment Agreement forms are ready to use.</span>
          </div>
        ) : tableExists === false ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">⚠️ Table does not exist. Please create it manually in Supabase.</span>
            </div>

            {showScript && sqlScript && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">SQL Script to Run:</h4>
                  <Button onClick={handleCopyScript} size="sm" variant="outline">
                    Copy Script
                  </Button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-60 overflow-y-auto">
                  <pre>{sqlScript}</pre>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy the SQL script above</li>
                    <li>Go to your Supabase Dashboard → SQL Editor</li>
                    <li>Paste and run the script</li>
                    <li>Come back and click "Check Table" again</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={handleCheckTable}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking Table...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Check Table Status
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>partial_payment_agreement_forms table</li>
            <li>Required indexes for performance</li>
            <li>Row Level Security policies</li>
            <li>Auto-update triggers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
