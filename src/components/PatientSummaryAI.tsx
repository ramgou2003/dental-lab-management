import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Heart, 
  AlertTriangle, 
  Shield, 
  FileText, 
  Sparkles,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { generatePatientSummary } from "@/services/patientSummaryAI";
import { testGeminiConnection } from "@/services/geminiAI";
import { savePatientSummary, getPatientSummary } from "@/services/patientSummaryService";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { toast } from "sonner";

interface PatientSummaryAIProps {
  patientData: NewPatientFormData | null;
  patientName: string;
  patientPacketId?: string;
}

interface SummaryData {
  medicalHistorySummary: string;
  allergiesSummary: string;
  dentalHistorySummary: string;
  attentionItems: string[];
  potentialComplications: string[];
  overallAssessment: string;
}

export const PatientSummaryAI: React.FC<PatientSummaryAIProps> = ({
  patientData,
  patientName,
  patientPacketId
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to safely convert any value to string
  const safeToString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  // Helper function to safely convert to array
  const safeToArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.map(item => safeToString(item));
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(item => safeToString(item));
        }
      } catch (e) {
        // If parsing fails, return as single item array
        return [value];
      }
    }
    return [safeToString(value)];
  };

  // Helper function to render bullet points properly
  const renderBulletPoints = (text: string): JSX.Element => {
    const lines = text.split('\n').filter(line => line.trim());

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('•')) {
            // Bullet point line
            const content = trimmedLine.substring(1).trim();
            const [label, ...rest] = content.split(':');

            if (rest.length > 0) {
              // Has a label (e.g., "Diabetes: Type 1, well controlled")
              return (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">{label}:</span>
                    <span className="text-gray-700 ml-1">{rest.join(':').trim()}</span>
                  </div>
                </div>
              );
            } else {
              // No label, just bullet point
              return (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 flex-1">{content}</span>
                </div>
              );
            }
          } else {
            // Regular line (might be a header or paragraph)
            return (
              <p key={index} className="text-gray-700 leading-relaxed font-medium">
                {trimmedLine}
              </p>
            );
          }
        })}
      </div>
    );
  };

  // Load existing summary on component mount
  useEffect(() => {
    const loadExistingSummary = async () => {
      if (patientPacketId) {
        try {
          const existingSummary = await getPatientSummary(patientPacketId);
          if (existingSummary) {
            console.log('📋 Loaded existing summary:', existingSummary);
            setSummaryData({
              medicalHistorySummary: safeToString(existingSummary.medical_history_summary),
              allergiesSummary: safeToString(existingSummary.allergies_summary),
              dentalHistorySummary: safeToString(existingSummary.dental_history_summary),
              attentionItems: safeToArray(existingSummary.attention_items),
              potentialComplications: safeToArray(existingSummary.potential_complications),
              overallAssessment: safeToString(existingSummary.overall_assessment)
            });
          }
        } catch (error) {
          console.error('Error loading existing summary:', error);
        }
      }
    };

    loadExistingSummary();
  }, [patientPacketId]);

  // Debug component lifecycle
  useEffect(() => {
    console.log('🔄 PatientSummaryAI component mounted');
    return () => {
      console.log('🔄 PatientSummaryAI component unmounted');
    };
  }, []);

  const generateSummary = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    console.log('🤖 Starting summary generation...');

    if (!patientData) {
      setError("No patient data available for analysis");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🤖 Calling AI service...');
      const rawSummary = await generatePatientSummary(patientData);
      console.log('✅ Raw summary generated:', rawSummary);

      // Safely convert the summary data
      const safeSummary: SummaryData = {
        medicalHistorySummary: safeToString(rawSummary.medicalHistorySummary),
        allergiesSummary: safeToString(rawSummary.allergiesSummary),
        dentalHistorySummary: safeToString(rawSummary.dentalHistorySummary),
        attentionItems: safeToArray(rawSummary.attentionItems),
        potentialComplications: safeToArray(rawSummary.potentialComplications),
        overallAssessment: safeToString(rawSummary.overallAssessment)
      };

      console.log('✅ Safe summary processed:', safeSummary);
      setSummaryData(safeSummary);

      // Save to database if patientPacketId is available
      if (patientPacketId) {
        setIsSaving(true);
        try {
          await savePatientSummary(patientPacketId, safeSummary);
          console.log('💾 Summary saved to database');
          toast.success("AI summary generated and saved successfully!");
        } catch (saveError) {
          console.error('❌ Failed to save summary:', saveError);
          toast.success("AI summary generated successfully!");
          toast.error("Warning: Could not save summary to database");
        } finally {
          setIsSaving(false);
        }
      } else {
        toast.success("AI summary generated successfully!");
      }
    } catch (err) {
      console.error('❌ Summary generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate summary";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🤖 Summary generation completed');
    }
  };

  const testAPI = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setIsTestingAPI(true);
    try {
      console.log('🧪 Testing Gemini API...');
      const isWorking = await testGeminiConnection();
      if (isWorking) {
        toast.success("✅ Gemini API is working correctly!");
      } else {
        toast.error("❌ Gemini API test failed");
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error("❌ API test failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTestingAPI(false);
    }
  };

  // Auto-generate summary when patient data is available (only if no existing summary)
  useEffect(() => {
    if (patientData && !summaryData && !isLoading && !error && !patientPacketId) {
      console.log('🤖 Auto-generating summary for patient data...');
      generateSummary();
    }
  }, [patientData, summaryData, isLoading, error, patientPacketId]);

  if (!patientData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Data Available</h3>
        <p className="text-gray-600">Patient packet data is required to generate AI summary.</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSummary}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || isSaving) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isLoading ? "Analyzing Patient Data" : "Saving Summary"}
        </h3>
        <p className="text-gray-600">
          {isLoading ? "AI is generating comprehensive summary..." : "Saving summary to database..."}
        </p>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Generate AI Summary</h3>
        <p className="text-gray-600 mb-4">Get AI-powered insights and risk assessment for {patientName}</p>
        <div className="flex gap-3">
          <Button
            onClick={(e) => testAPI(e)}
            variant="outline"
            disabled={isTestingAPI}
            type="button"
          >
            {isTestingAPI ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Test API
          </Button>
          <Button
            onClick={(e) => generateSummary(e)}
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Brain className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Generated Summary</h3>
            <p className="text-sm text-gray-500">Comprehensive analysis for {patientName}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => generateSummary(e)}
          disabled={isLoading || isSaving}
          type="button"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isSaving) ? 'animate-spin' : ''}`} />
          {isSaving ? 'Saving...' : 'Regenerate'}
        </Button>
      </div>

      {/* Medical History Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-red-500" />
            Medical History Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBulletPoints(safeToString(summaryData.medicalHistorySummary))}
        </CardContent>
      </Card>

      {/* Allergies Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-orange-500" />
            Allergies & Sensitivities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBulletPoints(safeToString(summaryData.allergiesSummary))}
        </CardContent>
      </Card>

      {/* Dental History Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-blue-500" />
            Dental History Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBulletPoints(safeToString(summaryData.dentalHistorySummary))}
        </CardContent>
      </Card>

      {/* Attention Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Critical Attention Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summaryData.attentionItems && summaryData.attentionItems.length > 0 ? (
              summaryData.attentionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-gray-700 flex-1">{safeToString(item)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No critical attention items identified.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Potential Complications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <XCircle className="h-4 w-4 text-red-500" />
            Potential Complications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summaryData.potentialComplications && summaryData.potentialComplications.length > 0 ? (
              summaryData.potentialComplications.map((complication, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300 mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-gray-700 flex-1">{safeToString(complication)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No potential complications identified.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Overall Clinical Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBulletPoints(safeToString(summaryData.overallAssessment))}
        </CardContent>
      </Card>
    </div>
  );
};
