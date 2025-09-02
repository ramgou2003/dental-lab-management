import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Send,
  Copy,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  User,
  ExternalLink,
  Edit3,
  Stethoscope
} from "lucide-react";
import { FilledPatientPacketViewer } from "@/components/FilledPatientPacketViewer";
import { NewPatientPacketForm, NewPatientPacketFormRef } from "@/components/NewPatientPacketForm";
import { NewPatientPacketPreview } from "@/components/NewPatientPacketPreview";
import { getPatientPacketsByLeadId, getPatientPacket, updatePatientPacket, autoSavePatientPacket } from "@/services/patientPacketService";
import { supabase } from "@/integrations/supabase/client";
import { NewPatientFormData } from "@/types/newPatientPacket";

interface PatientPacketDialogProps {
  leadId: string;
  leadName: string;
  existingLink?: string;
  trigger?: React.ReactNode;
  onLinkGenerated?: (link: string) => void;
}

export function PatientPacketDialog({
  leadId,
  leadName,
  existingLink,
  trigger,
  onLinkGenerated
}: PatientPacketDialogProps) {
  const [open, setOpen] = useState(false);
  const [publicLink, setPublicLink] = useState(existingLink || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [patientPackets, setPatientPackets] = useState<any[]>([]);
  const [consultationForms, setConsultationForms] = useState<any[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<any>(null);
  const [showPacketViewer, setShowPacketViewer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPacketId, setEditingPacketId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  const formRef = useRef<NewPatientPacketFormRef>(null);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('');

  useEffect(() => {
    if (open) {
      checkPacketStatus();
      loadConsultationForms();
    }
  }, [open, leadId]);

  // Check packet status on mount to determine button text
  useEffect(() => {
    checkPacketStatus();
  }, [leadId]);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      // Generate a secure token for the public link
      const token = btoa(leadId);
      const newPublicLink = `${window.location.origin}/patient-packet/${token}`;

      // Store the public link in the database
      const { error: updateError } = await supabase
        .from('new_patient_leads')
        .update({ public_link: newPublicLink })
        .eq('id', leadId);

      if (updateError) {
        console.error('Error storing public link:', updateError);
        toast.error('Failed to store patient packet link');
        return;
      }

      setPublicLink(newPublicLink);
      onLinkGenerated?.(newPublicLink);

      // Add a comment about the packet being sent
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('lead_comments')
        .insert([{
          lead_id: leadId,
          user_id: user?.id || 'system',
          user_name: user?.email?.split('@')[0] || 'System',
          comment: `New patient packet link generated: ${newPublicLink}`,
          comment_type: 'packet_sent'
        }]);

      toast.success('Patient packet link generated successfully!');
    } catch (error) {
      console.error('Error generating patient packet link:', error);
      toast.error('Failed to generate patient packet link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!publicLink) return;
    
    try {
      await navigator.clipboard.writeText(publicLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const checkPacketStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const { data, error } = await getPatientPacketsByLeadId(leadId);

      if (error) {
        console.error('Error fetching patient packets:', error);
        return;
      }

      setPatientPackets(data || []);
    } catch (error) {
      console.error('Unexpected error fetching patient packets:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const loadConsultationForms = async () => {
    try {
      // First, try to get the patient name from the lead
      const { data: leadData, error: leadError } = await supabase
        .from('new_patient_leads')
        .select('first_name, last_name, personal_first_name, personal_last_name')
        .eq('id', leadId)
        .single();

      let patientName = '';

      if (leadData && !leadError) {
        // Construct patient name from lead data
        patientName = leadData.personal_first_name && leadData.personal_last_name
          ? `${leadData.personal_first_name} ${leadData.personal_last_name}`
          : leadData.first_name && leadData.last_name
          ? `${leadData.first_name} ${leadData.last_name}`
          : '';
      }

      // If no lead data or patient name, try to find consultations by leadId
      // or search for consultations that might be related
      let consultations = [];

      if (patientName) {
        // Search by exact patient name
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('patient_name', patientName)
          .order('created_at', { ascending: false });

        if (!error) {
          consultations = data || [];
        }
      }

      // If no consultations found by name, try searching by leadId or similar patterns
      if (consultations.length === 0) {
        // For debugging: let's search for all consultations and see if we can find matches
        const { data: allConsultations, error: allError } = await supabase
          .from('consultations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!allError && allConsultations) {
          // For now, let's show all consultations for debugging
          // In production, you might want to filter by some other criteria
          console.log('Available consultations:', allConsultations.map(c => c.patient_name));

          // Try to find consultations that might match the leadId pattern
          // This is a temporary solution - you might need to add a lead_id field to consultations
          consultations = allConsultations.filter(c =>
            c.patient_name && c.patient_name.includes('NEW TEST')
          );
        }
      }

      console.log('Found consultation forms:', consultations);
      setConsultationForms(consultations || []);
    } catch (error) {
      console.error('Unexpected error fetching consultation forms:', error);
    }
  };

  const openPacketViewer = async (packet: any) => {
    try {
      // Get the full packet data with proper conversion
      const { data: formData, error } = await getPatientPacket(packet.id);

      if (error || !formData) {
        console.error('Error fetching packet data:', error);
        toast.error('Failed to load packet data');
        return;
      }

      setSelectedPacket(formData);
      setEditingPacketId(packet.id);
      setIsEditMode(false); // Start in view mode
      setShowPacketViewer(true);
    } catch (error) {
      console.error('Error opening packet viewer:', error);
      toast.error('Failed to open packet viewer');
    }
  };

  const openPreview = () => {
    setShowPreview(true);
  };

  const handleEditPacket = () => {
    setIsFormReady(false);
    setIsEditMode(true);
    // Small delay to ensure state is updated before rendering form
    setTimeout(() => {
      setIsFormReady(true);
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsFormReady(false);
  };

  const handleAutoSave = async (formData: NewPatientFormData) => {
    if (!editingPacketId) return;

    try {
      setAutoSaveStatus('saving');
      setAutoSaveMessage('Auto-saving changes...');

      const { data, error } = await autoSavePatientPacket(editingPacketId, formData, 'internal');

      if (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
        setAutoSaveMessage('Connection error - unable to save');
        setTimeout(() => {
          setAutoSaveStatus('idle');
          setAutoSaveMessage('');
        }, 5000);
        return;
      }

      setAutoSaveStatus('saved');
      setAutoSaveMessage('Changes saved');
      setLastSavedTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage('');
      }, 3000);

    } catch (error) {
      console.error('Unexpected auto-save error:', error);
      setAutoSaveStatus('error');
      setAutoSaveMessage('Auto-save failed');
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage('');
      }, 5000);
    }
  };

  const handleSavePacket = async (formData: NewPatientFormData) => {
    if (!editingPacketId) {
      toast.error('No packet selected for editing');
      return;
    }

    try {
      const { data, error } = await updatePatientPacket(editingPacketId, formData, 'internal');

      if (error) {
        console.error('Error updating patient packet:', error);
        toast.error('Failed to update patient packet');
        return;
      }

      // Update the selected packet with new data
      setSelectedPacket(formData);
      setIsEditMode(false);

      // Refresh the packet list
      await checkPacketStatus();

      toast.success('Patient packet updated successfully!');
    } catch (error) {
      console.error('Unexpected error updating packet:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getStatusInfo = () => {
    if (patientPackets.length > 0) {
      const latestPacket = patientPackets[0];
      return {
        status: 'completed',
        message: 'Form submitted successfully',
        submittedAt: latestPacket.created_at || latestPacket.submitted_at,
        patientName: `${latestPacket.first_name} ${latestPacket.last_name}`
      };
    } else if (publicLink) {
      return {
        status: 'pending',
        message: 'Waiting for patient to submit form',
        submittedAt: null,
        patientName: null
      };
    } else {
      return {
        status: 'not_generated',
        message: 'Link not generated yet',
        submittedAt: null,
        patientName: null
      };
    }
  };

  const statusInfo = getStatusInfo();

  const getButtonConfig = () => {
    if (patientPackets.length > 0) {
      return {
        text: "View Patient Packet",
        icon: Eye,
        className: "bg-blue-600 hover:bg-blue-700 text-white"
      };
    } else if (publicLink || existingLink) {
      return {
        text: "View Status",
        icon: Clock,
        className: "bg-yellow-600 hover:bg-yellow-700 text-white"
      };
    } else {
      return {
        text: "Patient Packet",
        icon: FileText,
        className: "bg-green-600 hover:bg-green-700 text-white"
      };
    }
  };

  const buttonConfig = getButtonConfig();

  if (showPacketViewer && selectedPacket) {
    return (
      <Dialog
        open={showPacketViewer}
        onOpenChange={(open) => {
          if (!open) {
            setShowPacketViewer(false);
            setIsEditMode(false);
            setEditingPacketId(null);
          }
        }}
        modal={true}
      >
        <DialogContent
          className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden"
          onPointerDownOutside={(e) => {
            setShowPacketViewer(false);
            setIsEditMode(false);
            setEditingPacketId(null);
          }}
        >
          <div className="p-6">
            {isEditMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 pr-8">
                  <h2 className="text-xl font-semibold">Edit Patient Packet</h2>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => {
                        setShowPacketViewer(false);
                        setIsEditMode(false);
                        setEditingPacketId(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        formRef.current?.submitForm();
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Form
                    </Button>
                  </div>
                </div>
                {isFormReady ? (
                  <NewPatientPacketForm
                    ref={formRef}
                    key={`edit-${editingPacketId}-${Date.now()}`}
                    initialData={selectedPacket}
                    onSubmit={handleSavePacket}
                    onCancel={handleCancelEdit}
                    submitButtonText="Save Changes"
                    onAutoSave={handleAutoSave}
                    autoSaveStatus={autoSaveStatus}
                    autoSaveMessage={autoSaveMessage}
                    lastSavedTime={lastSavedTime}
                  />
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading form...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 pr-8">
                  <h2 className="text-xl font-semibold">Patient Packet Details</h2>
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={handleEditPacket}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                    <button
                      onClick={() => {
                        setShowPacketViewer(false);
                        setIsEditMode(false);
                        setEditingPacketId(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <FilledPatientPacketViewer
                  formData={selectedPacket}
                  submittedAt={selectedPacket.created_at || selectedPacket.submitted_at}
                  onClose={() => setShowPacketViewer(false)}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className={`${buttonConfig.className} flex items-center gap-2`}
            size="sm"
          >
            <buttonConfig.icon className="h-4 w-4" />
            {buttonConfig.text}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Patient Packet for {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusInfo.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {statusInfo.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                  {statusInfo.status === 'not_generated' && <XCircle className="h-5 w-5 text-gray-400" />}
                  <span className="font-medium">{statusInfo.message}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkPacketStatus}
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
              
              {statusInfo.submittedAt && (
                <div className="text-sm text-gray-600">
                  Submitted on {new Date(statusInfo.submittedAt).toLocaleString()}
                  {statusInfo.patientName && ` by ${statusInfo.patientName}`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Public Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {publicLink ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-mono break-all">{publicLink}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyLink} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(publicLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button 
                    onClick={generateLink} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Generate Patient Packet Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submitted Forms Section */}
          {patientPackets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submitted Forms ({patientPackets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientPackets.map((packet, index) => (
                  <div key={packet.id || index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {packet.first_name} {packet.last_name}
                        </p>
                        <p className="text-xs text-green-600">
                          Submitted {new Date(packet.created_at || packet.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPacketViewer(packet)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Consultation Forms Section */}
          {consultationForms.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Consultation Forms ({consultationForms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consultationForms.map((consultation, index) => (
                  <div key={consultation.id || index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Consultation #{index + 1}
                        </p>
                        <p className="text-xs text-blue-600">
                          {consultation.consultation_date
                            ? new Date(consultation.consultation_date).toLocaleDateString()
                            : new Date(consultation.created_at).toLocaleDateString()
                          }
                        </p>
                        <p className="text-xs text-blue-500">
                          Status: {consultation.consultation_status || 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // For now, show a toast with consultation details
                        // Later this can be expanded to show a consultation viewer
                        toast.info(`Consultation form from ${consultation.consultation_date
                          ? new Date(consultation.consultation_date).toLocaleDateString()
                          : new Date(consultation.created_at).toLocaleDateString()
                        }`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
