import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { NewPatientPacketForm } from "@/components/NewPatientPacketForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { completePublicSubmission } from "@/services/publicPatientPacketService";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  personal_first_name?: string;
  personal_last_name?: string;
  personal_email?: string;
  personal_phone?: string;
  status: string;
}

const PublicPatientPacketPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPatient, setSubmittedPatient] = useState<{first_name: string, last_name: string} | null>(null);

  useEffect(() => {
    if (token) {
      fetchLeadByToken();
    } else {
      setError("Invalid or missing token");
      setLoading(false);
    }
  }, [token]);

  const fetchLeadByToken = async () => {
    try {
      // First, try to find the lead by the token in a packet_tokens table
      // For now, we'll decode the token to get the lead ID (simple base64 encoding)
      const leadId = atob(token || '');

      const { data, error } = await supabase
        .from('new_patient_leads')
        .select('*')
        .eq('id', leadId)
        .eq('status', 'scheduled') // Only allow scheduled leads
        .single();

      if (error || !data) {
        console.error('Error fetching lead:', error);
        setError("Lead not found or not eligible for packet submission");
        setLoading(false);
        return;
      }

      // Check if there's already a submitted patient packet for this lead
      try {
        const { data: existingPackets, error: packetsError } = await supabase
          .from('new_patient_packets')
          .select('id, first_name, last_name, created_at')
          .eq('lead_id', leadId);

        if (packetsError) {
          console.error('Error checking existing packets:', packetsError);
          // Continue anyway, don't block the form
        } else if (existingPackets && existingPackets.length > 0) {
          console.log('Found existing patient packet, showing thank you page');
          setIsSubmitted(true);
          // Store the submitted patient info for the thank you page
          const latestPacket = existingPackets[0];
          setSubmittedPatient({
            first_name: latestPacket.first_name,
            last_name: latestPacket.last_name
          });
        }
      } catch (error) {
        console.error('Error checking for existing packets:', error);
        // Continue anyway, don't block the form
      }

      setLead(data);
      setLoading(false);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError("Invalid token format");
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: NewPatientFormData) => {
    if (!lead) return;

    try {
      console.log('Starting form submission for lead:', lead.id);
      console.log('Form data summary:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });

      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('new_patient_leads')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        toast.error('Database connection failed. Please try again.');
        return;
      }
      console.log('Supabase connection test successful');

      // Save the patient packet data using our public service
      console.log('Calling completePublicSubmission service...');
      const { success, data, error } = await completePublicSubmission(formData, lead.id);

      if (!success || error) {
        console.error('Error saving patient packet:', error);
        toast.error('Failed to submit patient packet. Please try again.');
        return;
      }

      console.log('Patient packet saved successfully:', data);
      setIsSubmitted(true);
      toast.success('Patient packet submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    // For public form, we can't really cancel, so just show a message
    toast.info('Form cancelled. You can close this page.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Patient Packet</h3>
          <p className="text-gray-600">Please wait while we prepare your form...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-full blur-2xl"></div>
                <AlertCircle className="relative h-20 w-20 text-red-500 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">
                Access Error
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {error || "Unable to access the patient packet form."}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please contact the dental office if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl text-center shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo-wide.png"
                alt="Practice Logo"
                className="h-16 mx-auto mb-6"
              />
            </div>

            {/* Success Icon */}
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl"></div>
                <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto animate-pulse" />
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Thank You{submittedPatient?.first_name ? `, ${submittedPatient.first_name}` : lead.personal_first_name ? `, ${lead.personal_first_name}` : ''}!
              </h1>
              <h2 className="text-xl font-semibold text-green-600 mb-6">
                Your Patient Packet Has Been Successfully Submitted
              </h2>
            </div>

            {/* Details */}
            <div className="space-y-6 text-left bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Submission Details:</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Patient:</strong> {lead.personal_first_name && lead.personal_last_name
                      ? `${lead.personal_first_name} ${lead.personal_last_name}`
                      : lead.name}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Next Steps:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your information is being reviewed</li>
                    <li>• We'll contact you if needed</li>
                    <li>• Prepare for your appointment</li>
                    <li>• Bring a valid ID and insurance card</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Professional Message */}
            <div className="space-y-4 mb-8">
              <p className="text-lg text-gray-700 font-medium">
                We appreciate you taking the time to complete your patient packet.
              </p>
              <p className="text-gray-600">
                Your comprehensive health information helps us provide you with the highest quality,
                personalized dental care. Our team will review your responses and be fully prepared
                for your upcoming appointment.
              </p>
              <p className="text-gray-600">
                If you have any questions or need to make changes to your appointment,
                please don't hesitate to contact our office.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">Contact Our Office</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Email:</strong> info@dentaloffice.com</p>
                <p><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Closing */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                We look forward to seeing you soon!
              </p>
              <p className="text-sm text-gray-500">
                You may now safely close this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <NewPatientPacketForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          patientName={lead.personal_first_name && lead.personal_last_name
            ? `${lead.personal_first_name} ${lead.personal_last_name}`
            : lead.name}
          patientDateOfBirth=""
          patientGender=""
          showWelcomeHeader={true}
        />
      </div>
    </div>
  );
};

export default PublicPatientPacketPage;
