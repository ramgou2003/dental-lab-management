import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, MapPin, Calendar, User, Stethoscope, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewPatientLeadPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    reasonForVisit: "",
    dentalProblems: [] as string[],
    immediateNeeds: [] as string[],
    needLovedOneHelp: "",
    useFinancing: "",
    creditScore: "",
    barriers: [] as string[],
    // Step 8: Personal Information
    personalFirstName: "",
    personalLastName: "",
    personalPhone: "",
    personalEmail: "",
    personalCountryCode: "+1", // Default to US
    // Step 9: Address
    homeAddress: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    // Step 10: Medical History
    medicalConditions: [] as string[],
    // Step 11: Medical Insurance
    hasMedicalInsurance: "",
    // Step 12: Best Contact Time
    bestContactTime: "",
    // Step 13: Phone Call Preference
    phoneCallPreference: "",
    implantType: "",
    urgency: "",
    preferredContact: "",
    bestTimeToCall: "",
    hearAboutUs: "",
    additionalNotes: "",
    agreeToTerms: false
  });

  const totalSteps = 13;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // Phone number formatting function
  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    switch (countryCode) {
      case '+1': // US/Canada: (XXX) XXX-XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;

      case '+44': // UK: XXXX XXX XXXX
        if (digits.length <= 4) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;

      case '+91': // India: XXXXX XXXXX
        if (digits.length <= 5) return digits;
        return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;

      case '+33': // France: XX XX XX XX XX
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
        if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
        if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
        return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;

      case '+49': // Germany: XXX XXXXXXX
        if (digits.length <= 3) return digits;
        return `${digits.slice(0, 3)} ${digits.slice(3, 10)}`;

      case '+81': // Japan: XXX-XXXX-XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;

      default: // Generic formatting: XXX XXX XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  };

  // Get placeholder based on country code
  const getPhonePlaceholder = (countryCode: string) => {
    switch (countryCode) {
      case '+1': return '(555) 123-4567';
      case '+44': return '7700 900123';
      case '+91': return '98765 43210';
      case '+33': return '06 12 34 56 78';
      case '+49': return '030 12345678';
      case '+81': return '090-1234-5678';
      default: return '123 456 7890';
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // US States list
  const usStates = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
    { value: "DC", label: "District of Columbia" }
  ];

  // ZIP code formatting function
  const formatZipCode = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as XXXXX or XXXXX-XXXX
    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
  };

  const steps = [
    {
      id: 1,
      title: "Personal Info",
      description: "Tell us about yourself",
      icon: "👤"
    },
    {
      id: 2,
      title: "Treatment Goals",
      description: "What brings you here?",
      icon: "🦷"
    },
    {
      id: 3,
      title: "Contact Details",
      description: "How to reach you",
      icon: "📞"
    },
    {
      id: 4,
      title: "Confirmation",
      description: "Review and submit",
      icon: "✅"
    }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const isSelected = currentArray.includes(value);

      if (isSelected) {
        // Remove the value if it's already selected
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      } else {
        // Add the value if it's not selected
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Prevent double submission with multiple checks
      const now = Date.now();
      if (isSubmitting) {
        console.log('Already submitting, ignoring duplicate request');
        return;
      }

      // Prevent rapid successive submissions (within 2 seconds)
      if (now - lastSubmissionTime < 2000) {
        console.log('Too soon since last submission attempt, ignoring');
        return;
      }

      setLastSubmissionTime(now);

      // Final step - submit to Supabase
      setIsSubmitting(true);
      try {
        console.log('Submitting form data:', formData);

        const leadData = {
          // Step 1: Primary reason
          reason_for_visit: formData.reasonForVisit || null,

          // Step 2: Dental problems (ensure it's an array)
          dental_problems: Array.isArray(formData.dentalProblems) ? formData.dentalProblems : [],

          // Step 3: Immediate needs (ensure it's an array)
          immediate_needs: Array.isArray(formData.immediateNeeds) ? formData.immediateNeeds : [],

          // Step 4: Loved one help
          need_loved_one_help: formData.needLovedOneHelp || null,

          // Step 5: Financing
          use_financing: formData.useFinancing || null,

          // Step 6: Credit score
          credit_score: formData.creditScore || null,

          // Step 7: Barriers (ensure it's an array)
          barriers: Array.isArray(formData.barriers) ? formData.barriers : [],

          // Step 8: Personal information
          personal_first_name: formData.personalFirstName || null,
          personal_last_name: formData.personalLastName || null,
          personal_phone: formData.personalPhone ? `${formData.personalCountryCode} ${formData.personalPhone}` : null,
          personal_email: formData.personalEmail || null,

          // Step 9: Address
          home_address: formData.homeAddress || `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
          street_address: formData.streetAddress || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,

          // Step 10: Medical history (ensure it's an array)
          medical_conditions: Array.isArray(formData.medicalConditions) ? formData.medicalConditions : [],

          // Step 11: Medical insurance
          has_medical_insurance: formData.hasMedicalInsurance || null,

          // Step 12: Best contact time
          best_contact_time: formData.bestContactTime || null,

          // Step 13: Phone call preference
          phone_call_preference: formData.phoneCallPreference || null,

          // Additional fields
          implant_type: formData.implantType || null,
          urgency: formData.urgency || null,
          preferred_contact: formData.preferredContact || null,
          best_time_to_call: formData.bestTimeToCall || null,
          hear_about_us: formData.hearAboutUs || null,
          additional_notes: formData.additionalNotes || null,
          agree_to_terms: formData.agreeToTerms || false,

          // Original personal info fields
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          email: formData.email || null,
          phone: formData.phone || null,
          date_of_birth: formData.dateOfBirth || null,
          address: formData.address || null,
          gender: formData.gender || null,

          // Set status for kanban board
          status: 'new'
        };

        console.log('Lead data to be inserted:', leadData);

        const { data, error } = await supabase
          .from('new_patient_leads')
          .insert([leadData])
          .select();

        if (error) {
          console.error('Error submitting lead:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          toast.error(`Failed to submit form: ${error.message}. Please try again.`);
          setIsSubmitting(false);
          return;
        }

        console.log('Lead submitted successfully:', data);
        toast.success('Thank you! Your information has been submitted successfully. We will contact you soon.');
        setIsSubmitted(true);

      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.reasonForVisit;
      case 2:
        return formData.dentalProblems && formData.dentalProblems.length > 0;
      case 3:
        return formData.immediateNeeds && formData.immediateNeeds.length > 0;
      case 4:
        return formData.needLovedOneHelp;
      case 5:
        return formData.useFinancing;
      case 6:
        return formData.creditScore;
      case 7:
        return formData.barriers && formData.barriers.length > 0;
      case 8:
        return formData.personalFirstName && formData.personalLastName && formData.personalPhone && formData.personalEmail && isValidEmail(formData.personalEmail);
      case 9:
        return formData.streetAddress && formData.city && formData.state && formData.zipCode;
      case 10:
        return formData.medicalConditions && formData.medicalConditions.length > 0;
      case 11:
        return formData.hasMedicalInsurance;
      case 12:
        return formData.bestContactTime;
      case 13:
        return formData.phoneCallPreference;
      default:
        return false;
    }
  };

  const progressPercentage = useMemo(() => {
    // Progress based only on current step number, not form completion
    // Step 1 = 0%, Step 2 = ~7.7%, Step 3 = ~15.4%, etc.
    const percentage = ((currentStep - 1) / totalSteps) * 100;
    console.log('Progress calculation:', { currentStep, totalSteps, percentage });
    return percentage;
  }, [currentStep, totalSteps]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl"></div>
                <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                🎉 Thank You!
              </h2>
              <div className="space-y-3">
                <p className="text-lg text-gray-700 font-medium">
                  Your consultation request has been submitted successfully!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-semibold">
                    ✅ Our team will contact you within 24 hours
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    We'll help you schedule your free consultation at a time that works for you
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Questions? Call us at <span className="font-semibold text-indigo-600">(555) 123-4567</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            ✨ Free Consultation Available
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Transform Your Smile
            <span className="block text-indigo-600">Start Today</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Take the first step towards your perfect smile. Just a few quick steps to get started.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-indigo-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>



        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Content */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm min-h-[500px]">
            {currentStep === 1 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">1→</span>
                    What is the primary reason you're seeking for dental implants?*
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("reasonForVisit", "ready-to-fix-smile")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.reasonForVisit === "ready-to-fix-smile"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">I'm Ready To Fix My Smile and Want To Know About Pricing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("reasonForVisit", "pain-discomfort")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.reasonForVisit === "pain-discomfort"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">I have pain and discomfort</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("reasonForVisit", "second-consultation")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.reasonForVisit === "second-consultation"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">C</span>
                      <span className="text-base font-medium">I'm coming for a second consultation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("reasonForVisit", "heard-about-dr-charles")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.reasonForVisit === "heard-about-dr-charles"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">D</span>
                      <span className="text-base font-medium">I've heard a lot about Dr. Charles and I'd like to move forward with working him.</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    What seems to be the problem?*
                  </CardTitle>
                  <p className="text-indigo-100 text-base mt-1">Choose as many as you like</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("pain-discomfort")
                          ? problems.filter(p => p !== "pain-discomfort")
                          : [...problems, "pain-discomfort"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("pain-discomfort")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">I have pain and discomfort</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("infection")
                          ? problems.filter(p => p !== "infection")
                          : [...problems, "infection"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("infection")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">Infection</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("bone-loss")
                          ? problems.filter(p => p !== "bone-loss")
                          : [...problems, "bone-loss"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("bone-loss")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">C</span>
                      <span className="text-base font-medium">Bone Loss</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("teeth-missing-bad-shape")
                          ? problems.filter(p => p !== "teeth-missing-bad-shape")
                          : [...problems, "teeth-missing-bad-shape"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("teeth-missing-bad-shape")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">D</span>
                      <span className="text-base font-medium">Most of My Teeth Are Missing and In Bad Shape</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("struggling-dentures")
                          ? problems.filter(p => p !== "struggling-dentures")
                          : [...problems, "struggling-dentures"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("struggling-dentures")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">E</span>
                      <span className="text-base font-medium">Struggling With Traditional Dentures</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("multiple-missing-teeth")
                          ? problems.filter(p => p !== "multiple-missing-teeth")
                          : [...problems, "multiple-missing-teeth"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("multiple-missing-teeth")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">F</span>
                      <span className="text-base font-medium">Multiple Missing Teeth</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("one-tooth-problem")
                          ? problems.filter(p => p !== "one-tooth-problem")
                          : [...problems, "one-tooth-problem"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("one-tooth-problem")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">G</span>
                      <span className="text-base font-medium">I only have a one tooth problem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const problems = formData.dentalProblems || [];
                        const newProblems = problems.includes("general-dental-health")
                          ? problems.filter(p => p !== "general-dental-health")
                          : [...problems, "general-dental-health"];
                        handleInputChange("dentalProblems", newProblems);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.dentalProblems || []).includes("general-dental-health")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">H</span>
                      <span className="text-base font-medium">I Still have my teeth and looking for general dental health</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    Which of the following best describes your need right now? *
                  </CardTitle>
                  <p className="text-indigo-100 text-base mt-1">Choose as many as you like</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        const needs = formData.immediateNeeds || [];
                        const newNeeds = needs.includes("immediate-pain-relief")
                          ? needs.filter(n => n !== "immediate-pain-relief")
                          : [...needs, "immediate-pain-relief"];
                        handleInputChange("immediateNeeds", newNeeds);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.immediateNeeds || []).includes("immediate-pain-relief")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">Immediate Pain Relief</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const needs = formData.immediateNeeds || [];
                        const newNeeds = needs.includes("replacement-denture")
                          ? needs.filter(n => n !== "replacement-denture")
                          : [...needs, "replacement-denture"];
                        handleInputChange("immediateNeeds", newNeeds);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.immediateNeeds || []).includes("replacement-denture")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">Replacement of denture with teeth that I don't have to take out.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const needs = formData.immediateNeeds || [];
                        const newNeeds = needs.includes("smile-confident")
                          ? needs.filter(n => n !== "smile-confident")
                          : [...needs, "smile-confident"];
                        handleInputChange("immediateNeeds", newNeeds);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.immediateNeeds || []).includes("smile-confident")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">C</span>
                      <span className="text-base font-medium">I want to smile again and be confident.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const needs = formData.immediateNeeds || [];
                        const newNeeds = needs.includes("look-great-special-occasion")
                          ? needs.filter(n => n !== "look-great-special-occasion")
                          : [...needs, "look-great-special-occasion"];
                        handleInputChange("immediateNeeds", newNeeds);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.immediateNeeds || []).includes("look-great-special-occasion")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">D</span>
                      <span className="text-base font-medium">I Want To Look Great For A Special Occasion (E.g. Wedding)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const needs = formData.immediateNeeds || [];
                        const newNeeds = needs.includes("eat-everything")
                          ? needs.filter(n => n !== "eat-everything")
                          : [...needs, "eat-everything"];
                        handleInputChange("immediateNeeds", newNeeds);
                      }}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        (formData.immediateNeeds || []).includes("eat-everything")
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">E</span>
                      <span className="text-base font-medium">Being able to eat everything I want.</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 4 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    Do you need to speak to a loved one to help you with this decision?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("needLovedOneHelp", "yes")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.needLovedOneHelp === "yes"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">Yes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("needLovedOneHelp", "no")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.needLovedOneHelp === "no"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">No</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 5 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">5→</span>
                    Most of our patients pay cash for the treatment. However, some do use our special financing program.
                  </CardTitle>
                  <p className="text-indigo-100 text-base mt-4">Will you be using our special financing program for the treatment?*</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("useFinancing", "yes")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.useFinancing === "yes"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">Yes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("useFinancing", "no")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.useFinancing === "no"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">No</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 6 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">6→</span>
                    Which Best Describes Your Credit?*
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("creditScore", "excellent")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.creditScore === "excellent"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">A</span>
                      <span className="text-base font-medium">Excellent (720+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("creditScore", "good")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.creditScore === "good"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">B</span>
                      <span className="text-base font-medium">Good (680-720)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("creditScore", "fair")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.creditScore === "fair"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">C</span>
                      <span className="text-base font-medium">Fair (620-680)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("creditScore", "below-fair")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.creditScore === "below-fair"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">D</span>
                      <span className="text-base font-medium">Below Fair (600-620)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("creditScore", "poor")}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.creditScore === "poor"
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">E</span>
                      <span className="text-base font-medium">Poor (Below 599)</span>
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 7 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">7→</span>
                    We understand that going through a process like this can be quite taxing on a patient.
                  </CardTitle>
                  <p className="text-indigo-100 text-base mt-4">Please allow us to understand what would potentially stand in the way of fixing your smile?*</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    {[
                      { value: "anxiety", label: "Anxiety" },
                      { value: "time-length", label: "Time or Length of Treatment" },
                      { value: "financial", label: "Financial Concerns" },
                      { value: "distance", label: "Distance to Office" },
                      { value: "understanding", label: "Not Understanding Treatment Process" },
                      { value: "embarrassment", label: "Embarrassment" },
                      { value: "trust", label: "Trusting The Provider" }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleMultiSelectChange("barriers", option.value)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.barriers.includes(option.value)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base font-medium">{option.label}</span>
                        {formData.barriers.includes(option.value) && (
                          <span className="float-right text-indigo-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 8 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">8→</span>
                    Alright, almost done. Let's get some information about you*
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First name *
                        </label>
                        <input
                          type="text"
                          value={formData.personalFirstName}
                          onChange={(e) => handleInputChange("personalFirstName", e.target.value)}
                          placeholder="Jane"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last name *
                        </label>
                        <input
                          type="text"
                          value={formData.personalLastName}
                          onChange={(e) => handleInputChange("personalLastName", e.target.value)}
                          placeholder="Smith"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone number *
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.personalCountryCode}
                          onValueChange={(value) => {
                            handleInputChange("personalCountryCode", value);
                            // Reformat existing phone number for new country
                            if (formData.personalPhone) {
                              const formatted = formatPhoneNumber(formData.personalPhone, value);
                              handleInputChange("personalPhone", formatted);
                            }
                          }}
                        >
                          <SelectTrigger className="w-32 h-12 border-2 border-gray-200 rounded-lg focus:border-indigo-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+33">+33</SelectItem>
                            <SelectItem value="+49">+49</SelectItem>
                            <SelectItem value="+39">+39</SelectItem>
                            <SelectItem value="+34">+34</SelectItem>
                            <SelectItem value="+31">+31</SelectItem>
                            <SelectItem value="+32">+32</SelectItem>
                            <SelectItem value="+41">+41</SelectItem>
                            <SelectItem value="+43">+43</SelectItem>
                            <SelectItem value="+45">+45</SelectItem>
                            <SelectItem value="+46">+46</SelectItem>
                            <SelectItem value="+47">+47</SelectItem>
                            <SelectItem value="+358">+358</SelectItem>
                            <SelectItem value="+61">+61</SelectItem>
                            <SelectItem value="+64">+64</SelectItem>
                            <SelectItem value="+81">+81</SelectItem>
                            <SelectItem value="+82">+82</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+55">+55</SelectItem>
                            <SelectItem value="+52">+52</SelectItem>
                            <SelectItem value="+27">+27</SelectItem>
                          </SelectContent>
                        </Select>
                        <input
                          type="tel"
                          value={formData.personalPhone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value, formData.personalCountryCode);
                            handleInputChange("personalPhone", formatted);
                          }}
                          placeholder={getPhonePlaceholder(formData.personalCountryCode)}
                          className="flex-1 h-12 px-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.personalEmail}
                        onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full p-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          formData.personalEmail && !isValidEmail(formData.personalEmail)
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      />
                      {formData.personalEmail && !isValidEmail(formData.personalEmail) && (
                        <p className="text-red-500 text-sm mt-1">
                          Please enter a valid email address (e.g., name@example.com)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 9 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">9→</span>
                    Nearly there! Please enter your home address*
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                        placeholder="123 Main Street"
                        className="w-full h-12 px-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* City and State Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="New York"
                          className="w-full h-12 px-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => handleInputChange("state", value)}
                        >
                          <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-lg focus:border-indigo-500">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {usStates.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* ZIP Code */}
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => {
                          const formatted = formatZipCode(e.target.value);
                          handleInputChange("zipCode", formatted);
                        }}
                        placeholder="12345 or 12345-6789"
                        maxLength={10}
                        className="w-full h-12 px-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 10 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">10→</span>
                    Do you have a current personal history of one or more of the conditions below?
                  </CardTitle>
                  <p className="text-indigo-100 text-sm mt-2">
                    Disclaimer: Often times medical insurance, NOT DENTAL, may assist patients with any of the conditions below.
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    {[
                      { value: "diabetes", label: "Diabetes" },
                      { value: "cancer", label: "Cancer" },
                      { value: "cardiovascular", label: "Cardiovascular Disease" },
                      { value: "acid-reflux", label: "Acid Reflux or GERD" },
                      { value: "none", label: "None" }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleMultiSelectChange("medicalConditions", option.value)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.medicalConditions.includes(option.value)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base font-medium">{option.label}</span>
                        {formData.medicalConditions.includes(option.value) && (
                          <span className="float-right text-indigo-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 11 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">11→</span>
                    Do you have MEDICAL insurance coverage? *
                  </CardTitle>
                  <p className="text-indigo-100 text-sm mt-2">Including Medicare</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("hasMedicalInsurance", option.value)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.hasMedicalInsurance === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 12 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">12→</span>
                    When is the best time to contact you?*
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "7-8am", label: "7:00 AM - 8:00 AM" },
                      { value: "8-9am", label: "8:00 AM - 9:00 AM" },
                      { value: "9-10am", label: "9:00 AM - 10:00 AM" },
                      { value: "10-11am", label: "10:00 AM - 11:00 AM" },
                      { value: "11am-12pm", label: "11:00 AM - 12:00 PM" },
                      { value: "12-1pm", label: "12:00 PM - 1:00 PM" },
                      { value: "1-2pm", label: "1:00 PM - 2:00 PM" },
                      { value: "2-3pm", label: "2:00 PM - 3:00 PM" },
                      { value: "3-4pm", label: "3:00 PM - 4:00 PM" },
                      { value: "4-5pm", label: "4:00 PM - 5:00 PM" },
                      { value: "5-6pm", label: "5:00 PM - 6:00 PM" },
                      { value: "6-7pm", label: "6:00 PM - 7:00 PM" },
                      { value: "7-8pm", label: "7:00 PM - 8:00 PM" },
                      { value: "evening", label: "Evening (After 8:00 PM)" }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("bestContactTime", option.value)}
                        className={`text-center p-4 border-2 rounded-lg transition-all duration-200 min-h-[60px] flex items-center justify-center ${
                          formData.bestContactTime === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="text-base font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 13 && (
              <>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white text-xl">
                    <span className="text-2xl mr-3">13→</span>
                    Providing excellent patient care is one of our utmost priorities. We will attempt to call you within 10 minutes of submitting your smile assessment.
                  </CardTitle>
                  <p className="text-indigo-100 text-base mt-4">Would you be opposed to answering the phone?*</p>
                </CardHeader>
                <CardContent className="p-8 space-y-3">
                  <div className="space-y-3">
                    {[
                      { value: "yes-call", label: "Yes- Call Me At The Time I Have Asked To Be Contacted" },
                      { value: "no", label: "No" }
                    ].map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("phoneCallPreference", option.value)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.phoneCallPreference === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded text-center leading-6 font-semibold mr-3 text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="h-12 px-8 border-2 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
            >
              ← Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {currentStep === totalSteps ? (
                isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>🦷</span>
                    <span>Complete Survey</span>
                    <span>✨</span>
                  </span>
                )
              ) : (
                'Next →'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientLeadPage;
