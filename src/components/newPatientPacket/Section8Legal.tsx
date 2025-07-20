import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Camera, FileText, Info, CheckCircle } from "lucide-react";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface Section8LegalProps {
  formData: NewPatientFormData;
  onInputChange: (field: string, value: any) => void;
  onNestedInputChange: (section: string, field: string, value: any) => void;
}

export function Section8Legal({ formData, onInputChange, onNestedInputChange }: Section8LegalProps) {
  
  const handleHipaaAcknowledgmentChange = (field: string, checked: boolean) => {
    onNestedInputChange('hipaaAcknowledgment', field, checked);
  };

  // Check completion status
  const isPhotoVideoComplete = formData.photoVideoAuth !== 'disagree' && formData.photoVideoAuth !== 'agree' ? false : true;
  const isHipaaComplete = formData.hipaaAcknowledgment.receivedNotice && formData.hipaaAcknowledgment.understandsRights;
  const isLegalSectionComplete = isPhotoVideoComplete && isHipaaComplete;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-gray-200 bg-gray-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            Legal Documentation & Privacy
            <Badge variant="secondary" className="ml-auto">3 minutes</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-13">
            Please review and complete the required legal documentation and privacy acknowledgments.
          </p>
        </CardHeader>
      </Card>

      {/* Photo/Video Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-blue-600" />
            Photo & Video Authorization
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please indicate your preference regarding the use of photos and videos for documentation and educational purposes.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Detailed Information */}
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Photo & Video Usage Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Clinical Documentation:</strong> Photos may be taken for your treatment records, progress tracking, and case documentation.</p>
                <p><strong>Educational Purposes:</strong> With your permission, de-identified images may be used for staff training, professional education, or case presentations.</p>
                <p><strong>Marketing Materials:</strong> With explicit consent, images may be used in practice marketing materials, website, or social media.</p>
                <p><strong>Your Rights:</strong> You may withdraw consent at any time. Refusal will not affect your treatment quality.</p>
              </div>
            </CardContent>
          </Card>

          {/* Authorization Choice */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Photo & Video Authorization Decision
            </Label>
            <RadioGroup 
              value={formData.photoVideoAuth} 
              onValueChange={(value) => onInputChange('photoVideoAuth', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="agree" id="photo-agree" />
                <Label htmlFor="photo-agree" className="text-sm">
                  <strong>I AGREE</strong> to allow photos and videos to be taken for clinical documentation, 
                  educational purposes, and potential marketing use (with additional consent for marketing).
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disagree" id="photo-disagree" />
                <Label htmlFor="photo-disagree" className="text-sm">
                  <strong>I DO NOT AGREE</strong> to photos and videos beyond what is absolutely necessary 
                  for my clinical treatment and documentation.
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* HIPAA Acknowledgment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-600" />
            HIPAA Privacy Acknowledgment
          </CardTitle>
          <p className="text-sm text-gray-600">
            Federal law requires that we provide you with information about our privacy practices and obtain your acknowledgment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* HIPAA Information */}
          <Card className="border-green-100 bg-green-50/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-900 mb-2">Your Privacy Rights Under HIPAA</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>Protected Information:</strong> Your health information is protected by federal privacy laws (HIPAA).</p>
                <p><strong>How We Use Information:</strong> We use your health information for treatment, payment, and healthcare operations.</p>
                <p><strong>Your Rights:</strong> You have the right to access, amend, and request restrictions on your health information.</p>
                <p><strong>Our Responsibilities:</strong> We are required to maintain privacy of your health information and notify you of breaches.</p>
                <p><strong>Full Notice:</strong> You will receive our complete Notice of Privacy Practices, which details all your rights and our obligations.</p>
              </div>
            </CardContent>
          </Card>

          {/* HIPAA Acknowledgments */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="receivedNotice"
                checked={formData.hipaaAcknowledgment.receivedNotice}
                onCheckedChange={(checked) => handleHipaaAcknowledgmentChange('receivedNotice', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="receivedNotice" className="text-sm">
                <strong>I acknowledge that I have received</strong> or will receive a copy of this practice's 
                Notice of Privacy Practices, which describes how my health information may be used and disclosed.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="understandsRights"
                checked={formData.hipaaAcknowledgment.understandsRights}
                onCheckedChange={(checked) => handleHipaaAcknowledgmentChange('understandsRights', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="understandsRights" className="text-sm">
                <strong>I understand my rights</strong> regarding my protected health information, including 
                my right to request restrictions, access my records, and file complaints.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Compliance Information */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-indigo-800">
            <FileText className="h-5 w-5 text-indigo-600" />
            Legal Compliance & Patient Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-indigo-800">
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Privacy Protection</p>
              <p>Your personal and health information is protected by state and federal privacy laws. We maintain strict confidentiality protocols.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Informed Consent</p>
              <p>You have the right to be fully informed about your treatment options, risks, and alternatives before consenting to any procedure.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Right to Refuse</p>
              <p>You have the right to refuse any treatment or procedure. We will discuss alternative options if you decline recommended treatment.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status Alerts */}
      {!isPhotoVideoComplete && (
        <Alert className="border-orange-200 bg-orange-50">
          <Camera className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Photo/Video Authorization Required:</strong> Please select your preference regarding 
            photo and video authorization to continue.
          </AlertDescription>
        </Alert>
      )}

      {!isHipaaComplete && (
        <Alert className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>HIPAA Acknowledgment Required:</strong> Federal law requires acknowledgment of our 
            privacy practices. Please check both HIPAA acknowledgment boxes to continue.
          </AlertDescription>
        </Alert>
      )}

      {isLegalSectionComplete && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Legal Documentation Complete:</strong> Thank you for completing all required legal 
            documentation and privacy acknowledgments.
          </AlertDescription>
        </Alert>
      )}

      {/* Photo Authorization Confirmation */}
      {formData.photoVideoAuth === 'agree' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Camera className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Photo/Video Authorization Granted:</strong> You have authorized the use of photos and videos 
            for clinical and educational purposes. Additional consent will be obtained for any marketing use.
          </AlertDescription>
        </Alert>
      )}

      {formData.photoVideoAuth === 'disagree' && (
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Limited Photo/Video Use:</strong> Photos and videos will only be taken when absolutely 
            necessary for your clinical treatment and documentation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
