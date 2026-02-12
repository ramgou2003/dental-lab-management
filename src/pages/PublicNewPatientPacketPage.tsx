import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { NewPatientPacketForm } from "@/components/NewPatientPacketForm";
import { toast } from "sonner";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { saveStandalonePublicPacket } from "@/services/publicPatientPacketService";

const PublicNewPatientPacketPage = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedPatient, setSubmittedPatient] = useState<{ first_name: string; last_name: string } | null>(null);

    const handleFormSubmit = async (formData: NewPatientFormData) => {
        try {
            console.log('Starting standalone patient packet submission...');
            console.log('Form data summary:', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email
            });

            const { success, data, error } = await saveStandalonePublicPacket(formData);

            if (!success || error) {
                console.error('Error saving patient packet:', error);
                toast.error('Failed to submit patient packet. Please try again.');
                return;
            }

            console.log('Patient packet saved successfully:', data);
            setIsSubmitted(true);
            setSubmittedPatient({
                first_name: formData.firstName,
                last_name: formData.lastName
            });
            toast.success('Patient packet submitted successfully!');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const handleCancel = () => {
        toast.info('Form cancelled. You can close this page.');
    };

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
                                Thank You{submittedPatient?.first_name ? `, ${submittedPatient.first_name}` : ''}!
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
                                    {submittedPatient && (
                                        <p className="text-sm text-gray-600">
                                            <strong>Patient:</strong> {submittedPatient.first_name} {submittedPatient.last_name}
                                        </p>
                                    )}
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
                    patientName=""
                    patientDateOfBirth=""
                    patientGender=""
                    showWelcomeHeader={true}
                />
            </div>
        </div>
    );
};

export default PublicNewPatientPacketPage;
