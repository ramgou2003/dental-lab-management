import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, DollarSign, Clock, AlertTriangle, Info } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section7PoliciesProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section7Policies({ formData, onInputChange, onNestedInputChange }: Section7PoliciesProps) {
  
  // Office policy acknowledgments with detailed descriptions
  const policyAcknowledgments = [
    {
      key: 'treatmentBasedOnHealth',
      title: 'Treatment Based on Health History',
      description: 'I understand that treatment recommendations are based on my complete health history and current condition. I agree to provide accurate and complete information.'
    },
    {
      key: 'financialResponsibility',
      title: 'Financial Responsibility',
      description: 'I understand that I am financially responsible for all treatment provided, regardless of insurance coverage. Payment is due at the time of service unless other arrangements have been made.'
    },
    {
      key: 'insuranceCourtesy',
      title: 'Insurance as a Courtesy',
      description: 'I understand that insurance filing is a courtesy service. I am responsible for knowing my benefits and any limitations. I will pay any deductibles, co-pays, or non-covered services.'
    },
    {
      key: 'punctualityImportance',
      title: 'Punctuality and Scheduling',
      description: 'I understand the importance of keeping scheduled appointments. I will arrive on time and provide at least 24 hours notice for cancellations to avoid charges.'
    },
    {
      key: 'lateFeePolicy',
      title: 'Late Fee Policy',
      description: 'I understand that appointments cancelled with less than 24 hours notice or missed appointments may result in a fee. Emergency situations will be considered on a case-by-case basis.'
    },
    {
      key: 'depositRequirement',
      title: 'Deposit Requirements',
      description: 'I understand that certain treatments may require a deposit before scheduling. This deposit will be applied to the final treatment cost.'
    },
    {
      key: 'emergencyDefinition',
      title: 'Emergency Definition',
      description: 'I understand what constitutes a dental emergency (severe pain, trauma, swelling, bleeding) and the appropriate procedures for seeking emergency care.'
    },
    {
      key: 'emergencyProcedure',
      title: 'Emergency Contact Procedures',
      description: 'I understand the office emergency contact procedures and after-hours care instructions. I have received information about emergency care protocols.'
    }
  ];

  const handleAcknowledgmentChange = (key: string, checked: boolean) => {
    onNestedInputChange('acknowledgments', key, checked);
  };

  // Check completion status
  const totalAcknowledgments = policyAcknowledgments.length;
  const completedAcknowledgments = Object.values(formData.acknowledgments).filter(Boolean).length;
  const allAcknowledged = completedAcknowledgments === totalAcknowledgments;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            Office Policies & Procedures
            <Badge variant="secondary" className="ml-auto">3 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please review and acknowledge our office policies to ensure a smooth treatment experience.
          </p>
        </CardHeader>
      </Card>

      {/* Policy Acknowledgments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
            Policy Acknowledgments
            <Badge variant={allAcknowledged ? "default" : "secondary"} className="ml-auto">
              {completedAcknowledgments}/{totalAcknowledgments} Complete
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please read each policy carefully and check the box to acknowledge your understanding and agreement.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {policyAcknowledgments.map((policy) => (
            <Card key={policy.key} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={policy.key}
                    checked={formData.acknowledgments[policy.key as keyof typeof formData.acknowledgments] || false}
                    onCheckedChange={(checked) => handleAcknowledgmentChange(policy.key, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={policy.key} className="text-sm font-semibold text-gray-900 cursor-pointer">
                      {policy.title}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {policy.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Financial Information Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wantsFinancialInfo"
              checked={formData.wantsFinancialInfo}
              onCheckedChange={(checked) => onInputChange('wantsFinancialInfo', checked)}
            />
            <Label htmlFor="wantsFinancialInfo" className="text-sm">
              I would like to receive detailed information about treatment costs, payment options, 
              and financing plans before beginning treatment.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Important Policy Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Info className="h-5 w-5 text-blue-600" />
            Important Policy Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Appointment Scheduling</p>
              <p>We reserve appointment times specifically for you. Please arrive 15 minutes early for your first visit to complete any remaining paperwork.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Payment Options</p>
              <p>We accept cash, checks, and major credit cards. We also offer financing options through CareCredit and other approved providers.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Emergency Care</p>
              <p>For after-hours emergencies, please call our main number. You will receive instructions on how to reach the on-call doctor.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status Alert */}
      {!allAcknowledged && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Incomplete Acknowledgments:</strong> Please review and acknowledge all office policies 
            before proceeding. You have completed {completedAcknowledgments} of {totalAcknowledgments} required acknowledgments.
          </AlertDescription>
        </Alert>
      )}

      {allAcknowledged && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>All Policies Acknowledged:</strong> Thank you for reviewing and acknowledging our office policies. 
            This helps ensure a smooth and efficient treatment experience.
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Information Request Confirmation */}
      {formData.wantsFinancialInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Financial Information Requested:</strong> Our financial coordinator will provide detailed 
            cost estimates and discuss payment options during your consultation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
