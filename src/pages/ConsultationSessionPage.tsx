import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import fixWebmDuration from "@/lib/fix-webm-duration";
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MapPin, Heart, DollarSign, FileText, AlertCircle, CheckCircle, XCircle, Info, BarChart3, Plus, RefreshCw, Mic, FileAudio, Edit, CloudUpload, Check, Loader2, Send, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { NewPatientPacketForm, NewPatientPacketFormRef } from "@/components/NewPatientPacketForm";
import { FilledPatientPacketViewer } from "@/components/FilledPatientPacketViewer";
import { PatientPacketDetailsDialog } from "@/components/PatientPacketDetailsDialog";
import { PatientSummaryAI } from "@/components/PatientSummaryAI";
import { TreatmentForm } from "@/components/TreatmentForm";
import { FinancialOutcomeForm } from "@/components/FinancialOutcomeForm";
import { ConsultationFormDialog } from "@/components/ConsultationFormDialog";
import { ConsultationPreviewDialog } from "@/components/ConsultationPreviewDialog";
import { RecordingConsentDialog } from "@/components/RecordingConsentDialog";
import { RecordingControlDialog } from "@/components/RecordingControlDialog";
import { RecordingsList } from "@/components/RecordingsList";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LeadAppointmentScheduler } from "@/components/LeadAppointmentScheduler";
import { NewPatientFormData } from "@/types/newPatientPacket";
import { getPatientPacketsByLeadId, getPatientPacketsByPatientId, getPatientPacketsByConsultationPatientId, getPatientPacket, updatePatientPacket } from "@/services/patientPacketService";
import { uploadAudioRecording, saveRecordingMetadata } from "@/lib/audioRecordingService";
import { convertFormDataToDatabase, convertDatabaseToFormData } from "@/utils/patientPacketConverter";
import { toast } from "sonner";

// Helper to parse dates without time zone shifts for simple date strings (YYYY-MM-DD)
const parseDateSafe = (dateStr: string | Date | null | undefined): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  // If it's a YYYY-MM-DD string, parse it using local time parts to avoid UTC shift
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const ConsultationSessionPage = () => {
  const { appointmentId } = useParams();
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientPacketData, setPatientPacketData] = useState<NewPatientFormData | null>(null);
  const [hasFilledPacket, setHasFilledPacket] = useState(false);
  const [loadingPacket, setLoadingPacket] = useState(false);
  const [isEditingPacket, setIsEditingPacket] = useState(false);
  const [packetId, setPacketId] = useState<string | null>(null);
  const [packetDbSubmittedAt, setPacketDbSubmittedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new-patient-packet");
  const [consultationSection, setConsultationSection] = useState(1);
  const [isCompletingConsultation, setIsCompletingConsultation] = useState(false);
  const [showRecordingConsentDialog, setShowRecordingConsentDialog] = useState(false);
  const [showRecordingControlDialog, setShowRecordingControlDialog] = useState(false);
  const [showRecordingsPreviewDialog, setShowRecordingsPreviewDialog] = useState(false);
  const [showPacketDetailsDialog, setShowPacketDetailsDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(-60);
  const [audioAnalyzer, setAudioAnalyzer] = useState<AnalyserNode | null>(null);
  const [audioCleanup, setAudioCleanup] = useState<(() => void) | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const [isDirectConsultation, setIsDirectConsultation] = useState(false);
  const [consultationPatientData, setConsultationPatientData] = useState<any>(null);
  const [consultationStatus, setConsultationStatus] = useState<string | null>(null);
  const [hasConsultationData, setHasConsultationData] = useState<boolean>(false);
  const [consultationCompleted, setConsultationCompleted] = useState<boolean>(false);
  const [checkingConsultation, setCheckingConsultation] = useState<boolean>(false);
  const [consultationDataLoaded, setConsultationDataLoaded] = useState<boolean>(false);
  const [showNewPatientPacketDialog, setShowNewPatientPacketDialog] = useState(false);
  const [showConsultationFormDialog, setShowConsultationFormDialog] = useState(false);
  const [showConsultationPreviewDialog, setShowConsultationPreviewDialog] = useState(false);

  const [showEditAppointmentDialog, setShowEditAppointmentDialog] = useState(false);
  const [patientPacketLink, setPatientPacketLink] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [packetLinkStatus, setPacketLinkStatus] = useState<'none' | 'sent' | 'opened' | 'submitted'>('none');
  const [packetSubmittedAt, setPacketSubmittedAt] = useState<string>('');
  const [linkOpenedAt, setLinkOpenedAt] = useState<string>('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [consultationRecordId, setConsultationRecordId] = useState<string | null>(null);

  // Fetch existing public_link and packet status from consultations table
  useEffect(() => {
    const fetchExistingLinkAndStatus = async () => {
      if (!consultationRecordId) return;
      const { data: consultationData } = await supabase
        .from('consultations')
        .select('public_link, link_opened_at, new_patient_packet_id')
        .eq('id', consultationRecordId)
        .single();

      if (consultationData?.public_link) {
        setPatientPacketLink(consultationData.public_link);
        setPacketLinkStatus('sent');

        if (consultationData.link_opened_at) {
          setPacketLinkStatus('opened');
          setLinkOpenedAt(consultationData.link_opened_at);
        }

        if (consultationData.new_patient_packet_id) {
          // Fetch submission time from the packet
          const { data: packetData } = await supabase
            .from('new_patient_packets')
            .select('created_at')
            .eq('id', consultationData.new_patient_packet_id)
            .single();
          setPacketLinkStatus('submitted');
          if (packetData) setPacketSubmittedAt(packetData.created_at);
        }
      }
    };
    fetchExistingLinkAndStatus();
  }, [consultationRecordId]);

  const checkPacketStatus = async () => {
    if (!consultationRecordId) return;
    setIsCheckingStatus(true);
    try {
      const { data: consultationData } = await supabase
        .from('consultations')
        .select('link_opened_at, new_patient_packet_id')
        .eq('id', consultationRecordId)
        .single();

      if (consultationData?.link_opened_at) {
        setLinkOpenedAt(consultationData.link_opened_at);
        if (packetLinkStatus === 'sent') {
          setPacketLinkStatus('opened');
        }
      }

      if (consultationData?.new_patient_packet_id) {
        const { data: packetData } = await supabase
          .from('new_patient_packets')
          .select('created_at')
          .eq('id', consultationData.new_patient_packet_id)
          .single();
        setPacketLinkStatus('submitted');
        if (packetData) setPacketSubmittedAt(packetData.created_at);
        toast.success('Patient has submitted their packet!');
      } else if (consultationData?.link_opened_at) {
        toast.info('Patient has opened the link but not submitted yet.');
      } else {
        toast.info('Patient has not opened the link yet.');
      }
    } catch (error) {
      console.error('Error checking packet status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const generatePatientPacketLink = async () => {
    if (!consultationRecordId) {
      toast.error('No consultation record found');
      return;
    }
    setIsGeneratingLink(true);
    try {
      const token = btoa(consultationRecordId);
      const newLink = `${window.location.origin}/patient-packet/${token}`;

      const { error: updateError } = await supabase
        .from('consultations')
        .update({ public_link: newLink })
        .eq('id', consultationRecordId);

      if (updateError) {
        console.error('Error storing public link:', updateError);
        toast.error('Failed to generate patient packet link');
        return;
      }

      setPatientPacketLink(newLink);
      setPacketLinkStatus('sent');
      toast.success('Patient packet link generated!');
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error('Failed to generate link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyPatientPacketLink = async () => {
    if (!patientPacketLink) return;
    try {
      await navigator.clipboard.writeText(patientPacketLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // New Status UI State
  const [showRecordingStatusDialog, setShowRecordingStatusDialog] = useState(false);
  const [recordingStatusState, setRecordingStatusState] = useState<'uploading' | 'success' | 'error'>('uploading');
  const [recordingStatusMessage, setRecordingStatusMessage] = useState("Saving recording...");

  const formRef = useRef<NewPatientPacketFormRef>(null);

  const tabs = [
    {
      id: "new-patient-packet",
      label: hasFilledPacket ? "View Patient Packet Details" : "New Patient Packet",
      icon: hasFilledPacket ? Info : FileText,
      color: "text-blue-600",
      activeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500"
    },
    {
      id: "summary",
      label: "Summary",
      icon: BarChart3,
      color: "text-blue-600",
      activeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500"
    }
  ];

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId) return;

      try {
        setLoading(true);

        // Fix old consultations with follow-up required status on page load
        const { fixOldFollowUpConsultations } = await import('@/services/consultationService');
        const fixedCount = await fixOldFollowUpConsultations();
        if (fixedCount > 0) {
          console.log(`✅ Fixed ${fixedCount} old follow-up consultations`);
        }

        // First try to get from appointments table
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            assigned_user:user_profiles!assigned_user_id(full_name, email)
          `)
          .eq('id', appointmentId)
          .single();

        if (appointmentData && !appointmentError) {
          // If this is an appointment, check if it has lead information
          let enrichedData = { ...appointmentData };

          // Try to get lead information if patient_id is null and notes contain lead ID
          if (!appointmentData.patient_id && appointmentData.notes) {
            const leadIdMatch = appointmentData.notes.match(/Lead ID: ([a-f0-9-]+)/);
            if (leadIdMatch) {
              const leadId = leadIdMatch[1];
              const { data: leadData, error: leadError } = await supabase
                .from('new_patient_leads')
                .select('*')
                .eq('id', leadId)
                .single();

              if (!leadError && leadData) {
                // Merge lead data with appointment data
                enrichedData = {
                  ...appointmentData,
                  ...leadData,
                  patient_name: appointmentData.patient_name || `${leadData.first_name || leadData.personal_first_name || ''} ${leadData.last_name || leadData.personal_last_name || ''}`.trim(),
                  phone: leadData.phone || leadData.personal_phone,
                  email: leadData.email || leadData.personal_email
                };
              }
            }
          } else if (appointmentData.patient_id) {
            // For existing patients, get their information
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('*')
              .eq('id', appointmentData.patient_id)
              .single();

            if (!patientError && patientData) {
              enrichedData = {
                ...appointmentData,
                ...patientData,
                patient_name: appointmentData.patient_name || `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim()
              };
            }
          }

          setAppointmentData(enrichedData);

          // Check if this is a direct consultation (created via Add Consultation button)
          const consultationPatient = await checkIfDirectConsultation(appointmentData.id);

          // Check for patient packet data
          await fetchPatientPacketData(enrichedData, consultationPatient);
        } else {
          // If not found in appointments, try leads table
          const { data: leadData, error: leadError } = await supabase
            .from('new_patient_leads')
            .select('*')
            .eq('id', appointmentId)
            .single();

          if (leadData && !leadError) {
            // Transform lead data to match appointment structure
            const transformedData = {
              ...leadData,
              patient_name: `${leadData.first_name || leadData.personal_first_name || ''} ${leadData.last_name || leadData.personal_last_name || ''}`.trim(),
              date: new Date().toISOString().split('T')[0], // Today's date for leads
              start_time: leadData.best_contact_time || '',
              end_time: '',
              appointment_type: 'consultation',
              phone: leadData.phone || leadData.personal_phone,
              email: leadData.email || leadData.personal_email
            };

            setAppointmentData(transformedData);

            // Check for patient packet data for this lead
            await fetchPatientPacketData(transformedData);
          }
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId]);

  // Check consultation data whenever packetId changes or when there's no packet but we have appointmentId
  useEffect(() => {
    console.log('🔄 useEffect triggered - packetId:', packetId, 'appointmentId:', appointmentId);

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      if (packetId && packetId !== 'undefined' && packetId !== 'null') {
        console.log('🔄 PacketId exists, checking consultation data:', packetId);
        checkConsultationData(packetId);
      } else if (appointmentId) {
        console.log('🔄 No packetId but appointmentId exists, checking consultation data by appointment:', appointmentId);
        checkConsultationDataByAppointment();
      } else {
        console.log('🔄 No packetId or appointmentId, setting consultation states');
        setHasConsultationData(false);
        setConsultationCompleted(false);
        setConsultationDataLoaded(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [packetId, appointmentId]);

  // Recording functions
  const startRecording = (recorder: MediaRecorder) => {
    console.log('Starting recording with MIME type:', recorder.mimeType);

    setMediaRecorder(recorder);
    setMediaStream(recorder.stream);
    setIsRecording(true);
    setIsPaused(false);
    setRecordingDuration(0);
    setRecordingChunks([]);
    setShowRecordingControlDialog(true);

    // Set up audio analysis for visualization
    const cleanup = setupAudioAnalysis(recorder.stream);
    setAudioCleanup(() => cleanup);

    // Handle recording data - set this BEFORE starting
    recorder.ondataavailable = (event) => {
      console.log('Recording data available:', event.data.size, 'bytes');
      if (event.data.size > 0) {
        setRecordingChunks(prev => {
          const newChunks = [...prev, event.data];
          console.log('Total chunks collected:', newChunks.length);
          return newChunks;
        });
      }
    };

    // Handle recording stop
    recorder.onstop = () => {
      console.log('Recording segment stopped');
    };

    // Start the recording with timeslice to ensure data collection
    recorder.start(1000); // Collect data every 1 second

    // Start the timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setRecordingTimer(timer);

    console.log('Recording started for consultation:', appointmentId);
  };

  // Audio analysis setup
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      console.log('Setting up audio analysis...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      microphone.connect(analyser);

      setAudioAnalyzer(analyser);
      console.log('Audio analyzer set up successfully');

      // Start monitoring audio levels
      let animationId: number;
      const monitorAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);

        // Calculate RMS (Root Mean Square) for volume level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = (dataArray[i] - 128) / 128; // Convert to -1 to 1 range
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Convert to dB
        const db = rms > 0 ? 20 * Math.log10(rms) : -60;
        const normalizedDb = Math.max(-60, Math.min(0, db));

        setAudioLevel(normalizedDb);
        console.log('Audio level:', normalizedDb, 'dB, RMS:', rms);

        // Continue monitoring
        animationId = requestAnimationFrame(monitorAudio);
      };

      // Start monitoring immediately
      monitorAudio();

      // Store animation ID for cleanup
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        audioContext.close();
      };
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
      return null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      try {
        // Set up the stop handler before stopping
        const originalOnStop = mediaRecorder.onstop;
        mediaRecorder.onstop = () => {
          // Call original handler if it exists
          if (originalOnStop) {
            originalOnStop.call(mediaRecorder, new Event('stop'));
          }

          setIsPaused(true);
          toast.info("Recording paused");
          console.log('Recording paused successfully');
        };

        // Check if MediaRecorder is in recording state
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          // If not recording, just set paused state
          setIsPaused(true);
          toast.info("Recording paused");
        }

        // Pause the timer
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }

        // Pause audio monitoring
        if (audioCleanup) {
          audioCleanup();
          setAudioCleanup(null);
        }
        setAudioLevel(-60);

      } catch (error) {
        console.error('Error pausing recording:', error);
        toast.error("Unable to pause recording");
      }
    }
  };

  const resumeRecording = async () => {
    if (isRecording && isPaused) {
      try {
        console.log('Attempting to resume recording...');

        // Check if the current stream is still active
        if (!mediaStream || !mediaStream.active) {
          console.log('Stream is not active, requesting new stream...');

          // Request a new media stream
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });

          setMediaStream(newStream);

          // Create recorder with new stream
          await createAndStartRecorder(newStream);
        } else {
          // Use existing stream
          console.log('Using existing stream...');
          await createAndStartRecorder(mediaStream);
        }

      } catch (error) {
        console.error('Error resuming recording:', error);
        toast.error("Unable to resume recording. Please try starting a new recording.");
      }
    }
  };

  const createAndStartRecorder = async (stream: MediaStream) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Determine the best supported MIME type
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }

        console.log('Using MIME type:', mimeType);

        // Create a new MediaRecorder
        const newRecorder = new MediaRecorder(stream, { mimeType });

        // Handle new recording data
        newRecorder.ondataavailable = (event) => {
          console.log('Resume recording data available:', event.data.size, 'bytes');
          if (event.data.size > 0) {
            setRecordingChunks(prev => {
              const newChunks = [...prev, event.data];
              console.log('Total chunks after resume:', newChunks.length);
              return newChunks;
            });
          }
        };

        newRecorder.onstop = () => {
          console.log('Recording segment stopped');
        };

        newRecorder.onstart = () => {
          console.log('Recording resumed successfully');
          setIsPaused(false);

          // Set up audio analysis for the new stream
          const cleanup = setupAudioAnalysis(stream);
          setAudioCleanup(() => cleanup);

          // Resume the timer
          const timer = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
          }, 1000);
          setRecordingTimer(timer);

          toast.info("Recording resumed");
          resolve();
        };

        newRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          reject(new Error('MediaRecorder error'));
        };

        // Start the new recording with timeslice
        newRecorder.start(1000);
        setMediaRecorder(newRecorder);

      } catch (error) {
        console.error('Error creating recorder:', error);
        reject(error);
      }
    });
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording && !isProcessingRecording) {
      console.log('Stopping recording...');

      // Prevent multiple calls to stopRecording
      setIsRecording(false);
      setIsProcessingRecording(true);
      setShowRecordingControlDialog(false); // Close control dialog immediately

      const processRecording = async () => {
        // Show status dialog
        setShowRecordingStatusDialog(true);
        setRecordingStatusState('uploading');
        setRecordingStatusMessage("Processing recording data...");

        await new Promise(resolve => setTimeout(resolve, 500));

        const rawBlob = new Blob(recordingChunks, { type: 'audio/webm' });

        if (rawBlob.size > 0 && appointmentId) {
          try {
            setRecordingStatusMessage("Optimizing audio file...");

            // Fix WebM duration
            const finalBlob = await new Promise<Blob>((resolveBlob) => {
              fixWebmDuration(rawBlob, recordingDuration * 1000, (fixedBlob) => {
                resolveBlob(fixedBlob);
              });
            });

            setRecordingStatusMessage("Uploading to secure storage...");

            const audioUrl = await uploadAudioRecording(
              finalBlob,
              appointmentId,
              appointmentData?.patient_name,
              'consultation'
            );

            if (audioUrl) {
              await saveRecordingMetadata(
                appointmentId,
                audioUrl,
                recordingDuration,
                appointmentData?.patient_name
              );

              setRecordingStatusState('success');
              setRecordingStatusMessage("Saved Successfully!");

              // Refresh triggering
              setRecordingChunks([]);

              // Auto close success
              setTimeout(() => {
                setShowRecordingStatusDialog(false);
              }, 2000);
            } else {
              throw new Error("Upload failed");
            }
          } catch (error) {
            console.error('Error saving recording:', error);
            setRecordingStatusState('error');
            setRecordingStatusMessage("Save Failed. Please try again.");
          }
        } else {
          setRecordingStatusState('error');
          setRecordingStatusMessage("No recording data captured.");
        }

        setIsProcessingRecording(false);
      };

      mediaRecorder.onstop = () => {
        // Trigger processing when stop completes
        setTimeout(processRecording, 300);
      };

      // Stop recorder and tracks
      mediaRecorder.stop();
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      // Cleanup
      if (audioCleanup) {
        audioCleanup();
        setAudioCleanup(null);
      }
      setIsPaused(false);
      setMediaRecorder(null);
      setMediaStream(null);
      setAudioAnalyzer(null);
      setAudioLevel(-60);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  // Format recording duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioCleanup) {
        audioCleanup();
      }
    };
  }, [recordingTimer, mediaRecorder, mediaStream, isRecording, audioCleanup]);

  const checkIfDirectConsultation = async (appointmentId: string) => {
    try {
      // Check if this appointment has a corresponding consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .select('id, consultation_patient_id, consultation_patients(*)')
        .eq('appointment_id', appointmentId)
        .single();

      if (!consultationError && consultation?.consultation_patients) {
        setIsDirectConsultation(true);
        setConsultationPatientData(consultation.consultation_patients);
        setConsultationRecordId(consultation.id);
        return consultation.consultation_patients;
      } else {
        setIsDirectConsultation(false);
        setConsultationPatientData(null);
        return null;
      }
    } catch (error) {
      console.error('Error checking consultation type:', error);
      setIsDirectConsultation(false);
      return null;
    }
  };

  const fetchPatientPacketData = async (appointmentData: any, consultationPatient?: any) => {
    try {
      setLoadingPacket(true);
      let packetData = null;

      console.log('🔍 fetchPatientPacketData called with:', {
        appointmentId: appointmentData?.id,
        consultationPatient: consultationPatient?.id,
        consultationPatientData: consultationPatientData?.id
      });

      // 1. First priority: Check if the consultation record explicitly links to a packet
      console.log('Fetching consultation data for appointment:', appointmentData.id);

      let consultationRecord = null;

      // Try by appointment_id first
      const { data: consultationByAppointment, error: appointmentError } = await supabase
        .from('consultations')
        .select('*, new_patient_packets(*)')
        .eq('appointment_id', appointmentData.id)
        .maybeSingle();

      if (!appointmentError && consultationByAppointment) {
        consultationRecord = consultationByAppointment;
      } else {
        // Fallback: try by consultation_patient_id
        const consultationData = consultationPatient || consultationPatientData;
        if (consultationData?.id) {
          console.log('No consultation found by appointment_id, trying by consultation_patient_id:', consultationData.id);
          // We order by consultation_date desc to get the most recent one relevant to this patient context
          const { data: consultationsByPatient, error: patientError } = await supabase
            .from('consultations')
            .select('*, new_patient_packets(*)')
            .eq('consultation_patient_id', consultationData.id)
            .order('consultation_date', { ascending: false })
            .limit(1);

          if (!patientError && consultationsByPatient && consultationsByPatient.length > 0) {
            consultationRecord = consultationsByPatient[0];
          }
        }
      }

      if (consultationRecord?.new_patient_packets) {
        console.log('Found explicitly linked patient packet via consultation:', consultationRecord.new_patient_packets.id);
        // Often the joined data is incomplete if fields are huge, but let's assume it's fine. 
        // If we need to be safe, we can re-fetch with getPatientPacket to ensure full data + conversion readiness.
        // Actually, getPatientPacket does NOT do conversion, it returns DB format which is then converted by convertDatabaseToFormData.
        // But let's use getPatientPacket to be consistent and ensure we have all fields.
        const { data: fullPacketData, error: packetError } = await getPatientPacket(consultationRecord.new_patient_packets.id);
        if (!packetError && fullPacketData) {
          packetData = fullPacketData;
          setPacketId(consultationRecord.new_patient_packets.id);
        }
      }

      // 2. Second priority: Search by consultation_patient_id if not found above
      const consultationData = consultationPatient || consultationPatientData;
      if (!packetData && consultationData?.id) {
        console.log('No explicit link found, trying lookup by consultation_patient_id:', consultationData.id);
        const { data: packets, error: packetError } = await getPatientPacketsByConsultationPatientId(consultationData.id);

        if (!packetError && packets && packets.length > 0) {
          console.log('Found patient packet via consultation_patient_id lookup:', packets[0].id);
          const { data: fullPacketData, error: packetError } = await getPatientPacket(packets[0].id);
          if (!packetError && fullPacketData) {
            packetData = fullPacketData;
            setPacketId(packets[0].id);
          }
        } else {
          console.log('No patient packet found by lookup, trying shared patient packet service...');
          try {
            const { getSharedPatientPacketForConsultation } = await import('@/services/sharedPatientPacketService');
            const { data: sharedPacket, error: sharedError } = await getSharedPatientPacketForConsultation(consultationData.id);

            if (!sharedError && sharedPacket) {
              console.log('Found shared patient packet via patient identity:', sharedPacket.id);
              const { data: fullPacketData, error: packetError } = await getPatientPacket(sharedPacket.id);
              if (!packetError && fullPacketData) {
                packetData = fullPacketData;
                setPacketId(sharedPacket.id);
              }
            }
          } catch (error) {
            console.warn('Error finding shared patient packet:', error);
          }
        }
      }

      if (!packetData) {
        console.log('No patient packet found via consultation methods, trying alternative methods...');

        // Fallback: check if this is a direct consultation and use consultation patient's lead_id
        if (consultationData?.lead_id) {
          console.log('Fetching patient packets for consultation patient with lead_id:', consultationData.lead_id);
          const { data: packets, error } = await getPatientPacketsByLeadId(consultationData.lead_id);

          if (!error && packets && packets.length > 0) {
            console.log('Found patient packets for consultation:', packets.length);
            // Get the most recent packet
            const latestPacket = packets[0];
            const { data: fullPacketData, error: packetError } = await getPatientPacket(latestPacket.id);

            if (!packetError && fullPacketData) {
              packetData = fullPacketData;
              setPacketId(latestPacket.id);
              console.log('Successfully loaded patient packet for consultation patient');
            }
          } else {
            console.log('No patient packets found for consultation patient lead_id:', consultationData.lead_id);
          }
        }
        // Check if this is a lead-based appointment
        else if (appointmentData.lead_id || (!appointmentData.patient_id && appointmentData.id)) {
          const leadId = appointmentData.lead_id || appointmentData.id;
          const { data: packets, error } = await getPatientPacketsByLeadId(leadId);

          if (!error && packets && packets.length > 0) {
            // Get the most recent packet
            const latestPacket = packets[0];
            const { data: fullPacketData, error: packetError } = await getPatientPacket(latestPacket.id);

            if (!packetError && fullPacketData) {
              packetData = fullPacketData;
              setPacketId(latestPacket.id);
            }
          }
        }
        // Check if this is a patient-based appointment
        else if (appointmentData.patient_id) {
          const { data: packets, error } = await getPatientPacketsByPatientId(appointmentData.patient_id);

          if (!error && packets && packets.length > 0) {
            // Get the most recent packet
            const latestPacket = packets[0];
            const { data: fullPacketData, error: packetError } = await getPatientPacket(latestPacket.id);

            if (!packetError && fullPacketData) {
              packetData = fullPacketData;
              setPacketId(latestPacket.id);
            }
          }
        }
      }

      if (packetData) {
        // Handle both raw DB data and already converted form data
        let convertedData: NewPatientFormData;

        // Check if data is already converted (has firstName property)
        if ('firstName' in packetData) {
          console.log('📦 Data is already in form format (camelCase)');
          convertedData = packetData as NewPatientFormData;
        } else {
          console.log('📦 Data is in DB format (snake_case), converting...');
          // Convert DB format (snake_case) to form format (camelCase nested)
          convertedData = convertDatabaseToFormData(packetData as any);
        }

        setPatientPacketData(convertedData);

        // packetData might be either type, so access created_at carefully
        const submittedAt = (packetData as any).created_at || (packetData as any).submitted_at || null;
        setPacketDbSubmittedAt(submittedAt);
        setHasFilledPacket(true);

        // Check consultation data
        console.log('📦 Found patient packet, checking consultation data for packet ID:', packetData.id);
        console.log('📦 Setting packetId state to:', packetData.id);
        if (packetData.id && packetData.id !== 'undefined' && packetData.id !== 'null') {
          await checkConsultationData(packetData.id);
        } else {
          console.log('❌ Invalid packetData.id, skipping consultation check');
        }
      } else {
        console.log('❌ No patient packet found');
        setHasFilledPacket(false);
        setPatientPacketData(null);
        setPacketId(null);
        // Don't set consultation status here - let checkConsultationStatus handle it
        // when packetId becomes null, the useEffect will handle the status appropriately
      }
    } catch (error) {
      console.error('Error fetching patient packet data:', error);
      setHasFilledPacket(false);
      setPatientPacketData(null);
    } finally {
      setLoadingPacket(false);
    }
  };

  const checkConsultationData = async (packetId: string) => {
    // Validate packetId first
    if (!packetId || packetId === 'undefined' || packetId === 'null') {
      console.log('❌ Invalid packetId provided:', packetId);
      setHasConsultationData(false);
      setConsultationCompleted(false);
      setConsultationDataLoaded(true);
      return;
    }

    // Prevent multiple simultaneous checks
    if (checkingConsultation) {
      console.log('⏳ Already checking consultation data, skipping...');
      return;
    }

    setCheckingConsultation(true);
    try {
      console.log('🔍 Checking consultation data and status for packet ID:', packetId);
      console.log('🔍 Appointment ID available:', appointmentId);

      // Check if consultation record exists and get its status
      // Prioritize appointment_id lookup for multiple consultations support
      let consultationQuery = supabase
        .from('consultations')
        .select('id, consultation_status');

      if (appointmentId) {
        console.log('🔍 Query: SELECT id, consultation_status FROM consultations WHERE appointment_id =', appointmentId);
        consultationQuery = consultationQuery.eq('appointment_id', appointmentId);
      } else {
        console.log('🔍 Query: SELECT id, consultation_status FROM consultations WHERE new_patient_packet_id =', packetId);
        consultationQuery = consultationQuery.eq('new_patient_packet_id', packetId);
      }

      const { data, error } = await consultationQuery.maybeSingle();

      console.log('🔍 Raw query result:', { data, error });

      if (error) {
        console.error('❌ Database error:', error);
        console.log('🔄 Database error, setting states to false');
        setHasConsultationData(false);
        setConsultationCompleted(false);
        setConsultationDataLoaded(true);
        return;
      }

      const exists = data !== null;
      const isCompleted = data?.consultation_status === 'completed';

      console.log('📊 Consultation exists:', exists, 'Status:', data?.consultation_status, 'Is completed:', isCompleted);

      setHasConsultationData(exists);
      setConsultationCompleted(isCompleted);
      setConsultationDataLoaded(true);
    } catch (error) {
      console.error('❌ Error checking consultation data:', error);
      console.log('🔄 Catch error, setting states to false');
      setHasConsultationData(false);
      setConsultationCompleted(false);
      setConsultationDataLoaded(true);
    } finally {
      setCheckingConsultation(false);
    }
  };

  // Check consultation data using appointment ID when there's no patient packet
  const checkConsultationDataByAppointment = async () => {
    if (!appointmentId) {
      console.log('❌ No appointment ID available');
      setHasConsultationData(false);
      setConsultationCompleted(false);
      setConsultationDataLoaded(true);
      return;
    }

    // Prevent multiple simultaneous checks
    if (checkingConsultation) {
      console.log('⏳ Already checking consultation data, skipping...');
      return;
    }

    setCheckingConsultation(true);
    try {
      console.log('🔍 Checking consultation data by appointment ID:', appointmentId);

      // Check if consultation record exists for this appointment
      const { data, error } = await supabase
        .from('consultations')
        .select('id, consultation_status')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error querying consultation:', error);
        setHasConsultationData(false);
        setConsultationCompleted(false);
      } else if (data) {
        console.log('✅ Found consultation data:', data);
        setHasConsultationData(true);
        setConsultationCompleted(data.consultation_status === 'completed');
      } else {
        console.log('❌ No consultation data found');
        setHasConsultationData(false);
        setConsultationCompleted(false);
      }
    } catch (error) {
      console.error('❌ Error checking consultation data by appointment:', error);
      setHasConsultationData(false);
      setConsultationCompleted(false);
    } finally {
      setCheckingConsultation(false);
      setConsultationDataLoaded(true);
    }
  };

  const handleUpdatePatientPacket = async (formData: NewPatientFormData) => {
    if (!packetId) {
      console.error('No packet ID available for update');
      return;
    }

    try {
      setLoadingPacket(true);

      // Update the patient packet using the service function
      const { data, error } = await updatePatientPacket(packetId, formData, 'internal');

      if (error) {
        console.error('Error updating patient packet:', error);
        toast.error('Failed to update patient packet. Please try again.');
        return;
      }

      // Update local state
      setPatientPacketData(formData);
      setIsEditingPacket(false);

      console.log('Patient packet updated successfully');
      toast.success('Patient packet updated successfully!');
    } catch (error) {
      console.error('Error updating patient packet:', error);
      toast.error('An unexpected error occurred while updating the patient packet.');
    } finally {
      setLoadingPacket(false);
    }
  };

  const handleCompletePatientInfo = () => {
    // Open the patient packet dialog (same as used in patient profile Forms tab)
    setShowNewPatientPacketDialog(true);
  };



  const handleCompleteConsultation = async () => {
    if (!packetId || !appointmentData) {
      toast.error('Missing required data to complete consultation');
      return;
    }

    try {
      setIsCompletingConsultation(true);

      // Get patient packet data
      const patientData = patientPacketData;

      // Get lead data for additional patient information
      let leadData = null;
      // Cast to any to access potential lead_id that might exist in runtime but not in type
      if ((patientData as any)?.lead_id) {
        const { data: lead, error: leadError } = await supabase
          .from('new_patient_leads')
          .select('*')
          .eq('id', (patientData as any).lead_id)
          .single();

        if (!leadError) {
          leadData = lead;
        }
      }

      // Get existing consultation data if it exists
      // Try to find by appointment_id first (most reliable), then by packet_id
      let existingConsultation = null;
      if (appointmentData?.id) {
        const { data } = await supabase
          .from('consultations')
          .select('*')
          .eq('appointment_id', appointmentData.id)
          .maybeSingle();
        existingConsultation = data;
      }

      // If not found by appointment_id, try by packet_id
      if (!existingConsultation && packetId) {
        const { data } = await supabase
          .from('consultations')
          .select('*')
          .eq('new_patient_packet_id', packetId)
          .maybeSingle();
        existingConsultation = data;
      }

      // Prepare comprehensive consultation data with ALL available information
      const consultationData = {
        // Core identifiers
        new_patient_lead_id: (patientData as any)?.lead_id || null,
        new_patient_packet_id: packetId,

        // Patient basic information - prioritize packet data, then lead data, then appointment data
        first_name: patientData?.firstName || leadData?.personal_first_name || appointmentData.patient_name?.split(' ')[0] || '',
        last_name: patientData?.lastName || leadData?.personal_last_name || appointmentData.patient_name?.split(' ').slice(1).join(' ') || '',
        patient_phone: patientData?.phone?.cell || leadData?.personal_phone || appointmentData.patient_phone || null,
        patient_email: patientData?.email || leadData?.personal_email || appointmentData.patient_email || null,
        patient_date_of_birth: patientData?.dateOfBirth || leadData?.date_of_birth || null,
        patient_gender: patientData?.gender || leadData?.gender || null,

        // Patient address - construct from packet data or use lead data
        patient_address: patientData?.address ?
          `${patientData.address.street}, ${patientData.address.city}, ${patientData.address.state} ${patientData.address.zip}`.trim() :
          leadData?.address || null,

        // Emergency contact information
        emergency_contact_name: patientData?.emergencyContact?.name || null,
        emergency_contact_phone: patientData?.emergencyContact?.phone || null,
        emergency_contact_relationship: patientData?.emergencyContact?.relationship || null,

        // Medical history from patient packet
        medical_conditions: {
          critical_conditions: patientData?.criticalConditions || {},
          system_specific: patientData?.systemSpecific || {},
          additional_conditions: patientData?.additionalConditions || [],
          recent_health_changes: patientData?.recentHealthChanges || {}
        },
        allergies: patientData?.allergies || {},
        current_medications: patientData?.currentMedications || {},
        dental_status: patientData?.dentalStatus || {},
        current_symptoms: patientData?.currentSymptoms || {},
        healing_issues: patientData?.healingIssues || {},
        tobacco_use: patientData?.tobaccoUse || {},

        // Patient preferences from packet
        patient_preferences: {
          anxiety_control: patientData?.anxietyControl || [],
          pain_injection: patientData?.painInjection || [],
          communication: patientData?.communication || [],
          sensory_sensitivities: patientData?.sensorySensitivities || [],
          physical_comfort: patientData?.physicalComfort || [],
          service_preferences: patientData?.servicePreferences || [],
          other_concerns: patientData?.otherConcerns || ''
        },

        // Lead information
        reason_for_visit: leadData?.reason_for_visit || null,
        dental_problems: leadData?.dental_problems || [],
        urgency_level: leadData?.urgency || null,

        // Insurance information
        insurance_info: {
          has_medical_insurance: (patientData as any)?.has_medical_insurance || null, // Not in type clearly
          pcp_name: patientData?.primaryCarePhysician?.name || null,
          pcp_practice: patientData?.primaryCarePhysician?.practice || null,
          pcp_phone: patientData?.primaryCarePhysician?.phone || null
        },

        // Treatment section details (get from existing consultation or defaults)
        clinical_assessment: existingConsultation?.clinical_assessment || null,
        treatment_recommendations: existingConsultation?.treatment_recommendations || {},
        additional_information: existingConsultation?.additional_information || null,

        // Financial & outcome section details
        treatment_decision: existingConsultation?.treatment_decision || null,
        treatment_cost: existingConsultation?.treatment_cost || null,
        global_treatment_value: existingConsultation?.global_treatment_value || null,
        financing_options: existingConsultation?.financing_options || {},
        financing_not_approved_reason: existingConsultation?.financing_not_approved_reason || null,
        financial_notes: existingConsultation?.financial_notes || null,
        followup_date: existingConsultation?.followup_date || null,
        followup_reason: existingConsultation?.followup_reason || null,
        treatment_plan_approved: existingConsultation?.treatment_plan_approved || false,
        follow_up_required: existingConsultation?.follow_up_required || false,

        // Status and completion
        consultation_status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Log the data being saved for debugging
      console.log('💾 Saving comprehensive consultation data:', {
        patientInfo: {
          name: `${consultationData.first_name} ${consultationData.last_name}`,
          phone: consultationData.patient_phone,
          email: consultationData.patient_email,
          dob: consultationData.patient_date_of_birth,
          gender: consultationData.patient_gender,
          address: consultationData.patient_address
        },
        medicalData: {
          conditions: Object.keys(consultationData.medical_conditions).length,
          allergies: Object.keys(consultationData.allergies).length,
          medications: Object.keys(consultationData.current_medications).length,
          dentalStatus: Object.keys(consultationData.dental_status).length
        },
        consultationData: {
          treatmentDecision: consultationData.treatment_decision,
          treatmentCost: consultationData.treatment_cost,
          clinicalAssessment: consultationData.clinical_assessment ? 'Present' : 'Empty'
        }
      });

      // Insert or update consultation record
      // If we found an existing consultation, update it by ID to avoid duplicates
      // Otherwise, insert a new one
      let upsertError = null;

      if (existingConsultation?.id) {
        console.log('📝 Updating existing consultation:', existingConsultation.id);
        const { error } = await supabase
          .from('consultations')
          .update({
            ...consultationData,
            appointment_id: appointmentData.id, // Ensure appointment_id is set
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConsultation.id);
        upsertError = error;
      } else {
        console.log('📝 Creating new consultation');
        const { error } = await supabase
          .from('consultations')
          .insert({
            ...consultationData,
            appointment_id: appointmentData.id // Ensure appointment_id is included
          });
        upsertError = error;
      }

      if (upsertError) {
        throw upsertError;
      }

      console.log('✅ Consultation completed and saved successfully');
      toast.success('Consultation completed successfully!');

      // If treatment is accepted, trigger patient move to main table
      if (existingConsultation?.treatment_decision === 'accepted') {
        console.log('🔄 Treatment accepted, patient should be moved to main table');
        // The FinancialOutcomeForm already handles this, so we just log it
      }

    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('Failed to complete consultation. Please try again.');
    } finally {
      setIsCompletingConsultation(false);
    }
  };

  const handleAppointmentUpdate = async () => {
    console.log('✅ Appointment updated successfully');
    toast.success('Appointment updated successfully!');
    setShowEditAppointmentDialog(false);

    // Refresh appointment data
    if (appointmentId) {
      const { data: updatedAppointment, error } = await supabase
        .from('appointments')
        .select(`
          *,
          assigned_user:user_profiles!assigned_user_id(full_name, email)
        `)
        .eq('id', appointmentId)
        .single();

      if (!error && updatedAppointment) {
        setAppointmentData(prev => ({ ...prev, ...updatedAppointment }));
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Merged Sidebar Data with robust fallback logic
  const sidebarDisplay = {
    phone: (hasFilledPacket && patientPacketData?.phone?.cell) ? patientPacketData.phone.cell : (hasFilledPacket && patientPacketData?.phone?.work) ? patientPacketData.phone.work : (appointmentData?.phone || appointmentData?.personal_phone),
    email: (hasFilledPacket && patientPacketData?.email && patientPacketData.email.trim() !== '') ? patientPacketData.email : (appointmentData?.email || appointmentData?.personal_email),
    addressLine1: (hasFilledPacket && patientPacketData?.address?.street && patientPacketData.address.street.trim() !== '') ? patientPacketData.address.street : (appointmentData?.address || appointmentData?.home_address || appointmentData?.street_address),
    addressLine2: (hasFilledPacket && patientPacketData?.address?.city && patientPacketData.address.city.trim() !== '')
      ? `${patientPacketData.address.city}, ${patientPacketData.address.state} ${patientPacketData.address.zip}`
      : [appointmentData?.city, appointmentData?.state, appointmentData?.zip_code].filter(Boolean).join(', '),
    dob: (hasFilledPacket && patientPacketData?.dateOfBirth) ? parseDateSafe(patientPacketData.dateOfBirth) : (appointmentData?.date_of_birth ? parseDateSafe(appointmentData.date_of_birth) : null),
    gender: (hasFilledPacket && patientPacketData?.gender && patientPacketData.gender !== 'prefer-not-to-answer') ? patientPacketData.gender : appointmentData?.gender,
    created: appointmentData?.created_at ? new Date(appointmentData.created_at) : null,
    medicalConditions: (() => {
      const list: string[] = [];
      if (hasFilledPacket && patientPacketData?.criticalConditions) {
        const cc = patientPacketData.criticalConditions;
        if (cc.acidReflux) list.push("Acid Reflux");
        if (cc.cancer?.has) list.push(`Cancer${cc.cancer.type ? ` (${cc.cancer.type})` : ''}`);
        if (cc.depressionAnxiety) list.push("Depression/Anxiety");
        if (cc.diabetes?.has) list.push(`Diabetes${cc.diabetes.type ? ` (Type ${cc.diabetes.type})` : ''}${cc.diabetes.a1cLevel ? ` (A1C: ${cc.diabetes.a1cLevel})` : ''}`);
        if (cc.heartDisease) list.push("Heart Disease");
        if (cc.highBloodPressure) list.push("High Blood Pressure");
        if (cc.periodontalDisease) list.push("Periodontal Disease");
        if (cc.substanceAbuse) list.push("Substance Abuse");
        if (cc.other) list.push(cc.other);
      }
      if (hasFilledPacket && patientPacketData?.systemSpecific) {
        const ss = patientPacketData.systemSpecific;
        list.push(...(ss.respiratory || []));
        list.push(...(ss.cardiovascular || []));
        list.push(...(ss.gastrointestinal || []));
        list.push(...(ss.neurological || []));
        list.push(...(ss.endocrineRenal || []));
      }
      if (hasFilledPacket && patientPacketData?.additionalConditions) {
        list.push(...patientPacketData.additionalConditions);
      }
      // Fallback
      if (list.length === 0 && appointmentData?.medical_conditions) {
        list.push(...appointmentData.medical_conditions);
      }
      return Array.from(new Set(list)); // Dedupe
    })(),
    allergies: (() => {
      const list: string[] = [];
      if (hasFilledPacket && patientPacketData?.allergies) {
        const a = patientPacketData.allergies;
        list.push(...(a.dentalRelated || []));
        list.push(...(a.medications || []));
        list.push(...(a.other || []));
        if (a.food) list.push(`Food: ${a.food}`);
      }
      return list;
    })(),
    medications: (() => {
      const list: string[] = [];
      if (hasFilledPacket && patientPacketData?.currentMedications) {
        const m = patientPacketData.currentMedications;
        list.push(...(m.emergency || []));
        list.push(...(m.boneOsteoporosis || []));
        list.push(...(m.specialized || []));
        // complete might be a long string, keep it as is
        if (m.complete) list.push(m.complete);
      }
      return list;
    })()
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[125vh] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {appointmentData?.patient_name || 'Unknown Patient'}
                </h1>
              </div>
            </div>

            {/* Section Buttons */}
            <div className="flex gap-2 items-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'new-patient-packet' && hasFilledPacket) {
                        setShowPacketDetailsDialog(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${isActive
                      ? `${tab.bgColor} ${tab.activeColor} shadow-sm border ${tab.borderColor}`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}

              {/* Recordings Preview Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecordingsPreviewDialog(true)}
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                title="View recordings"
              >
                <FileAudio className="h-4 w-4" />
              </Button>

              {/* Record Consultation Button */}
              {!isRecording ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecordingConsentDialog(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Mic className="h-4 w-4" />
                  <span className="whitespace-nowrap">Record Consultation</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecordingControlDialog(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <Mic className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    Recording {formatDuration(recordingDuration)}
                  </span>
                </Button>
              )}

              {/* Consultation Form Button */}
              <Button
                onClick={() => {
                  console.log('🔘 Consultation button clicked, completed:', consultationCompleted);
                  if (consultationCompleted) {
                    // Show preview dialog for completed consultations
                    setShowConsultationPreviewDialog(true);
                  } else {
                    // Show edit dialog for incomplete consultations
                    setShowConsultationFormDialog(true);
                  }
                }}
                disabled={!consultationDataLoaded}
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${!consultationDataLoaded
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : consultationCompleted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {(() => {
                  console.log('🎨 Rendering button - consultationDataLoaded:', consultationDataLoaded, 'consultationCompleted:', consultationCompleted, 'packetId:', packetId);

                  if (!consultationDataLoaded) {
                    return (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    );
                  } else if (consultationCompleted) {
                    return (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Preview Consultation Form
                      </>
                    );
                  } else {
                    return (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Consultation Form
                      </>
                    );
                  }
                })()}
              </Button>
            </div>


          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pb-8 overflow-hidden min-h-0">
        <div className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* Container 1: All Patient Information */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden lg:col-span-1">
              <CardContent className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-modern">
                <div className="space-y-4">
                  {/* Large Patient Avatar Section */}
                  <div className="flex flex-col items-center text-center py-4">
                    <Avatar className="h-20 w-20 mb-3 ring-4 ring-indigo-100">
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {appointmentData?.patient_name ?
                          appointmentData.patient_name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase() :
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {appointmentData?.patient_name || 'Unknown Patient'}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {isDirectConsultation && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs px-2 py-1">
                          Direct Consultation
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details Section */}
                  {appointmentData && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">Appointment Details</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEditAppointmentDialog(true)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {appointmentData.date && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(appointmentData.date)}
                            </p>
                            <p className="text-xs text-gray-500">Appointment Date</p>
                          </div>
                        </div>
                      )}

                      {appointmentData.start_time && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {formatTime(appointmentData.start_time)}
                              {appointmentData.end_time && ` - ${formatTime(appointmentData.end_time)}`}
                            </p>
                            <p className="text-xs text-gray-500">Appointment Time</p>
                          </div>
                        </div>
                      )}

                      {appointmentData.assigned_user_id && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {appointmentData.assigned_user?.full_name || 'Assigned'}
                            </p>
                            <p className="text-xs text-gray-500">Assigned To</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                    </div>

                    {sidebarDisplay.phone && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sidebarDisplay.phone}
                          </p>
                          <p className="text-xs text-gray-500">Phone Number</p>
                        </div>
                      </div>
                    )}

                    {sidebarDisplay.email && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sidebarDisplay.email}
                          </p>
                          <p className="text-xs text-gray-500">Email Address</p>
                        </div>
                      </div>
                    )}

                    {!sidebarDisplay.phone && !sidebarDisplay.email && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Phone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No contact information</p>
                          <p className="text-xs text-gray-400">Contact details will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Personal Details</h4>
                    </div>

                    {sidebarDisplay.dob && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {sidebarDisplay.dob.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                        </div>
                      </div>
                    )}

                    {sidebarDisplay.gender && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">{sidebarDisplay.gender}</p>
                          <p className="text-xs text-gray-500">Gender</p>
                        </div>
                      </div>
                    )}

                    {sidebarDisplay.created && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {sidebarDisplay.created.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Appointment Created</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Information */}
                  {sidebarDisplay.addressLine1 && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                      </div>
                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {sidebarDisplay.addressLine1}
                          </p>
                          {sidebarDisplay.addressLine2 && (
                            <p className="text-sm text-gray-700">
                              {sidebarDisplay.addressLine2}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Home Address</p>
                        </div>
                      </div>
                    </div>
                  )}


                </div>

                {/* Medical & Dental Information Section */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  {(sidebarDisplay.medicalConditions.length > 0 || sidebarDisplay.allergies.length > 0 || sidebarDisplay.medications.length > 0 || appointmentData?.has_medical_insurance) ? (
                    <>
                      {/* Medical Information Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-red-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Medical Information</h4>
                        </div>

                        {sidebarDisplay.medicalConditions.length > 0 && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="h-3 w-3 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-900 mb-2">Conditions & Medical Hx</p>
                                <div className="flex flex-wrap gap-1">
                                  {sidebarDisplay.medicalConditions.map((condition: string, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-red-100 border-red-300 text-red-800 text-xs text-wrap text-left break-words whitespace-normal h-auto py-1">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {sidebarDisplay.allergies.length > 0 && (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="h-3 w-3 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-orange-900 mb-2">Allergies</p>
                                <div className="flex flex-wrap gap-1">
                                  {sidebarDisplay.allergies.map((allergy: string, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-orange-100 border-orange-300 text-orange-800 text-xs text-wrap text-left break-words whitespace-normal h-auto py-1">
                                      {allergy}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {sidebarDisplay.medications.length > 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 mb-2">Current Medications</p>
                                <div className="flex flex-col gap-1">
                                  {sidebarDisplay.medications.map((med: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                      <p className="text-xs text-blue-800 break-words">{med}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointmentData?.has_medical_insurance && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-900 mb-1">Medical Insurance</p>
                                <p className="text-sm text-green-800 capitalize">{appointmentData.has_medical_insurance}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No medical information</p>
                        <p className="text-xs text-gray-400">Medical details will appear here</p>
                      </div>
                    </div>
                  )}
                </div>






              </CardContent>
            </Card>

            {/* Main Content Container */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden lg:col-span-4">
              <CardContent className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-modern">
                {/* New Patient Packet Tab */}
                {activeTab === "new-patient-packet" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">New Patient Packet</h3>
                          <p className="text-sm text-gray-500">
                            {hasFilledPacket
                              ? (isEditingPacket ? 'Editing patient packet information' : 'Filled patient packet information')
                              : 'Preview and review patient information'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasFilledPacket && !isEditingPacket && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingPacket(true)}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {isEditingPacket && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingPacket(false)}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                console.log('Update Form button clicked, calling submitForm...');
                                formRef.current?.submitForm();
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Update Form
                            </Button>
                          </>
                        )}
                        <Badge className={hasFilledPacket
                          ? (isEditingPacket ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-green-100 text-green-800 border-green-300")
                          : "bg-blue-100 text-blue-800 border-blue-300"
                        }>
                          {hasFilledPacket
                            ? (isEditingPacket ? 'Editing' : 'Filled')
                            : 'Preview Mode'
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Loading State */}
                    {loadingPacket && (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {/* Patient Packet Content */}
                    {!loadingPacket && (
                      <div className="w-full pb-8">
                        {/* Direct consultation without patient packet - show empty state */}
                        {isDirectConsultation && !hasFilledPacket && !isEditingPacket ? (
                          <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  No Patient Packet Available
                                </h3>
                                <p className="text-gray-600 mb-4 max-w-md">
                                  This is a direct consultation appointment. Complete the patient packet to collect comprehensive patient information for better consultation outcomes.
                                </p>
                                <div className="flex flex-col items-center gap-5">
                                  {/* Action Buttons Row */}
                                  <div className="flex justify-center items-center gap-3">
                                    <Button
                                      onClick={handleCompletePatientInfo}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Patient Packet
                                    </Button>
                                    {!patientPacketLink && (
                                      <Button
                                        onClick={generatePatientPacketLink}
                                        disabled={isGeneratingLink}
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                      >
                                        {isGeneratingLink ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}
                                        Generate Patient Packet Link
                                      </Button>
                                    )}
                                  </div>

                                  {/* Generated Link Display */}
                                  {patientPacketLink && (
                                    <div className="w-full max-w-lg space-y-3">
                                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <p className="text-sm font-mono break-all text-gray-700">{patientPacketLink}</p>
                                      </div>
                                      <div className="flex justify-center gap-2">
                                        <Button
                                          onClick={copyPatientPacketLink}
                                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                          size="sm"
                                        >
                                          {linkCopied ? (
                                            <><Check className="h-4 w-4" /> Copied!</>
                                          ) : (
                                            <><Copy className="h-4 w-4" /> Copy Link</>
                                          )}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(patientPacketLink, '_blank')}
                                          className="flex items-center gap-2"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                          Open
                                        </Button>
                                      </div>

                                      {/* Status Tracker */}
                                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                          <p className="text-sm font-semibold text-gray-700">Packet Status</p>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={checkPacketStatus}
                                            disabled={isCheckingStatus}
                                            className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                                          >
                                            <RefreshCw className={`h-3 w-3 mr-1 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                                            Refresh
                                          </Button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {/* Step 1: Link Sent */}
                                          <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                              <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-green-700">Sent</span>
                                          </div>

                                          {/* Connector 1 */}
                                          <div className={`flex-1 h-0.5 ${packetLinkStatus === 'opened' || packetLinkStatus === 'submitted' ? 'bg-green-400' : 'bg-gray-200'}`} />

                                          {/* Step 2: Link Opened */}
                                          <div className="flex items-center gap-1.5">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${packetLinkStatus === 'opened' || packetLinkStatus === 'submitted'
                                              ? 'bg-green-500'
                                              : 'bg-gray-200'
                                              }`}>
                                              {packetLinkStatus === 'opened' || packetLinkStatus === 'submitted' ? (
                                                <Check className="h-3.5 w-3.5 text-white" />
                                              ) : (
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                              )}
                                            </div>
                                            <div>
                                              <span className={`text-xs font-medium ${packetLinkStatus === 'opened' || packetLinkStatus === 'submitted' ? 'text-green-700' : 'text-gray-400'
                                                }`}>
                                                {packetLinkStatus === 'opened' || packetLinkStatus === 'submitted' ? 'Opened' : 'Not Opened'}
                                              </span>
                                              {linkOpenedAt && (
                                                <p className="text-[10px] text-gray-500">
                                                  {new Date(linkOpenedAt).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Connector 2 */}
                                          <div className={`flex-1 h-0.5 ${packetLinkStatus === 'submitted' ? 'bg-green-400' : 'bg-gray-200'}`} />

                                          {/* Step 3: Submitted */}
                                          <div className="flex items-center gap-1.5">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${packetLinkStatus === 'submitted'
                                              ? 'bg-green-500'
                                              : 'bg-gray-200'
                                              }`}>
                                              {packetLinkStatus === 'submitted' ? (
                                                <Check className="h-3.5 w-3.5 text-white" />
                                              ) : (
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                              )}
                                            </div>
                                            <div>
                                              <span className={`text-xs font-medium ${packetLinkStatus === 'submitted' ? 'text-green-700' : 'text-gray-400'
                                                }`}>
                                                {packetLinkStatus === 'submitted' ? 'Submitted' : 'Pending'}
                                              </span>
                                              {packetLinkStatus === 'submitted' && packetSubmittedAt && (
                                                <p className="text-[10px] text-gray-500">
                                                  {new Date(packetSubmittedAt).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : hasFilledPacket && patientPacketData && !isEditingPacket ? (
                          // Show filled packet viewer (read-only)
                          <FilledPatientPacketViewer
                            formData={patientPacketData}
                            submittedAt={packetDbSubmittedAt || undefined}
                            onClose={() => {
                              // Optional: Add functionality to close/minimize the viewer
                            }}
                          />
                        ) : (
                          // Show editable form (either for new packet or editing existing)
                          <NewPatientPacketForm
                            key={`consultation-form-${isEditingPacket ? 'edit' : 'new'}-${packetId || 'new'}`}
                            ref={formRef}
                            onSubmit={(formData: NewPatientFormData) => {
                              // This inline form is only used for editing existing packets
                              // New packets are created via the dialog
                              if (hasFilledPacket && isEditingPacket) {
                                handleUpdatePatientPacket(formData);
                              }
                            }}
                            onCancel={() => {
                              if (isEditingPacket) {
                                setIsEditingPacket(false);
                              } else {
                                console.log('Form cancelled');
                              }
                            }}
                            patientName={appointmentData?.patient_name || 'Unknown Patient'}
                            patientDateOfBirth={
                              isDirectConsultation && consultationPatientData?.date_of_birth
                                ? consultationPatientData.date_of_birth
                                : appointmentData?.date_of_birth || ''
                            }
                            patientGender={
                              isDirectConsultation && consultationPatientData?.gender
                                ? consultationPatientData.gender
                                : appointmentData?.gender || ''
                            }
                            showWelcomeHeader={false}
                            initialData={isEditingPacket ? patientPacketData : undefined}
                            submitButtonText={isEditingPacket ? 'Update Patient Packet' : 'Submit Patient Packet'}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (
                  <div className="pb-8">
                    <ErrorBoundary>
                      <PatientSummaryAI
                        patientData={patientPacketData}
                        patientName={appointmentData?.patient_name || 'Unknown Patient'}
                        patientPacketId={packetId || undefined}
                      />
                    </ErrorBoundary>
                  </div>
                )}


              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Patient Packet Form Dialog - Same as used in Patient Profile Forms tab */}
      <Dialog
        open={showNewPatientPacketDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewPatientPacketDialog(false);
          }
        }}
        modal={true}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden" onPointerDownOutside={(e) => {
          setShowNewPatientPacketDialog(false);
        }}>
          {/* Custom Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold">New Patient Packet</h2>
            <button
              onClick={() => {
                setShowNewPatientPacketDialog(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {appointmentData && (
              <NewPatientPacketForm
                patientName={appointmentData.patient_name || 'Unknown Patient'}
                patientDateOfBirth={
                  isDirectConsultation && consultationPatientData?.date_of_birth
                    ? consultationPatientData.date_of_birth
                    : appointmentData?.date_of_birth || ''
                }
                patientGender={
                  isDirectConsultation && consultationPatientData?.gender
                    ? consultationPatientData.gender
                    : appointmentData?.gender || ''
                }
                showWelcomeHeader={false}
                submitButtonText="Save Patient Packet"
                onCancel={() => setShowNewPatientPacketDialog(false)}
                onSubmit={async (formData) => {
                  console.log('Patient packet submitted from consultation:', formData);

                  try {
                    // Convert form data to database format
                    const dbData = convertFormDataToDatabase(
                      formData,
                      null, // No existing patient ID for direct consultations
                      consultationPatientData?.lead_id || null,
                      'internal', // Use 'internal' as submission source for consultation sessions
                      consultationPatientData?.id || null // Link to consultation patient
                    );

                    console.log('Attempting to save patient packet...');
                    // Save the patient packet data to the database
                    const { data: packetData, error: packetError } = await supabase
                      .from('new_patient_packets')
                      .insert([dbData])
                      .select()
                      .single();

                    if (packetError) {
                      console.error('Error saving patient packet:', packetError);
                      throw packetError;
                    }

                    console.log('Patient packet saved successfully:', packetData);

                    // Create or update consultation record to link with the patient packet
                    // Note: This is a secondary operation and won't affect the main save success
                    try {
                      if (packetData?.id && appointmentData?.id) {
                        console.log('Attempting to link consultation record...');
                        // First check if consultation already exists for this appointment
                        // Use maybeSingle() instead of single() to avoid errors when no record exists
                        const { data: existingConsultation, error: fetchError } = await supabase
                          .from('consultations')
                          .select('id, patient_id')
                          .eq('appointment_id', appointmentData.id)
                          .maybeSingle();

                        if (fetchError) {
                          console.warn('Error fetching existing consultation:', fetchError);
                        }

                        if (existingConsultation) {
                          // Update existing consultation with patient packet ID
                          // Preserve patient_id if it exists (for active patients)
                          const updateData: any = {
                            new_patient_packet_id: packetData.id,
                            patient_name: `${formData.firstName} ${formData.lastName}`,
                            updated_at: new Date().toISOString()
                          };

                          // Don't overwrite patient_id if it's already set (for active patients)
                          // Only set it if it's null
                          if (!existingConsultation.patient_id) {
                            // For new/consultation patients, patient_id will be set when treatment is accepted
                            console.log('Existing consultation found without patient_id - will be set when treatment is accepted');
                          }

                          const { error: updateError } = await supabase
                            .from('consultations')
                            .update(updateData)
                            .eq('id', existingConsultation.id);

                          if (updateError) {
                            console.warn('Failed to update consultation record (non-critical):', updateError);
                          } else {
                            console.log('Successfully updated consultation with patient packet');
                          }
                        } else {
                          // Create new consultation record only if one doesn't exist
                          // This should only happen for new patients without a pre-created consultation
                          console.log('No existing consultation found, creating new one...');
                          const consultationData = {
                            appointment_id: appointmentData.id,
                            new_patient_packet_id: packetData.id,
                            patient_name: `${formData.firstName} ${formData.lastName}`,
                            consultation_date: appointmentData.date || new Date().toISOString().split('T')[0],
                            lead_id: consultationPatientData?.lead_id || null,
                            consultation_status: 'draft'
                          };

                          const { error: insertError } = await supabase
                            .from('consultations')
                            .insert([consultationData]);

                          if (insertError) {
                            console.warn('Failed to create consultation record (non-critical):', insertError);
                          } else {
                            console.log('Successfully created consultation with patient packet');
                          }
                        }
                      }
                    } catch (consultationError) {
                      console.warn('Non-critical error with consultation record:', consultationError);
                      // Don't throw this error as it's not critical to the main save operation
                    }

                    // Update the consultation patient with the packet completion
                    try {
                      if (consultationPatientData?.id) {
                        console.log('Updating consultation patient status...');
                        await supabase
                          .from('consultation_patients')
                          .update({
                            status: 'packet_completed'
                          })
                          .eq('id', consultationPatientData.id);
                        console.log('Consultation patient status updated successfully');
                      }
                    } catch (statusError) {
                      console.warn('Non-critical error updating consultation patient status:', statusError);
                      // Don't throw this error as it's not critical to the main save operation
                    }

                    setPatientPacketData(formData);
                    setHasFilledPacket(true);
                    setIsEditingPacket(false);
                    setPacketId(packetData.id);
                    setShowNewPatientPacketDialog(false);

                    // Refresh patient packet data to ensure connection is established
                    await fetchPatientPacketData(appointmentData);

                    console.log('✅ Direct consultation patient packet saved successfully - ALL OPERATIONS COMPLETED');
                    toast.success('Patient packet saved successfully!');
                  } catch (error) {
                    console.error('Error saving direct consultation patient packet:', error);
                    toast.error('Failed to save patient packet. Please try again.');
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Form Dialog */}
      <ConsultationFormDialog
        isOpen={showConsultationFormDialog}
        onClose={() => setShowConsultationFormDialog(false)}
        onComplete={() => {
          setHasConsultationData(true);
          setConsultationCompleted(true);
          setShowConsultationFormDialog(false);
          // Refresh consultation data from database to ensure consistency
          if (packetId) {
            checkConsultationData(packetId);
          } else if (appointmentId) {
            checkConsultationDataByAppointment();
          }
        }}
        patientPacketId={packetId || undefined}
        patientName={appointmentData?.patient_name}
        consultationPatientId={consultationPatientData?.id}
        appointmentId={appointmentId}
      />

      {/* Recording Consent Dialog */}
      <RecordingConsentDialog
        isOpen={showRecordingConsentDialog}
        onClose={() => setShowRecordingConsentDialog(false)}
        onConsent={() => {
          console.log('Recording consent given');
        }}
        onRecordingStart={startRecording}
        patientName={appointmentData?.patient_name}
        mode="consultation"
      />

      {/* Recording Control Dialog (Active Recording Interface) */}
      <RecordingControlDialog
        isOpen={showRecordingControlDialog}
        onClose={() => setShowRecordingControlDialog(false)}
        onStop={stopRecording}
        duration={recordingDuration}
        audioLevel={audioLevel}
        patientName={appointmentData?.patient_name}
        isProcessing={isProcessingRecording}
      />

      {/* Recording Status Dialog (Saving/Success/Error) */}
      <Dialog open={showRecordingStatusDialog} onOpenChange={(open) => {
        // Prevent accidental closing during upload
        if (!open && recordingStatusState !== 'uploading') {
          setShowRecordingStatusDialog(false);
        }
      }}>
        <DialogContent
          className="max-w-[340px] p-6 rounded-3xl border-none shadow-2xl bg-white outline-none"
          hideCloseButton={true}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center text-center gap-4">
            {recordingStatusState === 'uploading' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-blue-50 p-4 rounded-full">
                    <CloudUpload className="h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Saving Recording...</h3>
                  <p className="text-sm text-gray-500">{recordingStatusMessage}</p>
                </div>
              </>
            )}

            {recordingStatusState === 'success' && (
              <>
                <div className="bg-green-50 p-4 rounded-full">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Saved Successfully!</h3>
                  <p className="text-sm text-gray-500">Audio note has been optimized and stored.</p>
                </div>
              </>
            )}

            {recordingStatusState === 'error' && (
              <>
                <div className="bg-red-50 p-4 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Save Failed</h3>
                  <p className="text-sm text-gray-500">{recordingStatusMessage}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowRecordingStatusDialog(false)}
                  className="mt-2"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recordings Preview Dialog */}
      <Dialog open={showRecordingsPreviewDialog} onOpenChange={setShowRecordingsPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              Consultation Recordings
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {appointmentId ? (
              <RecordingsList
                appointmentId={appointmentId}
                patientName={appointmentData?.patient_name}
                type="consultation"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No appointment ID available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Preview Dialog */}
      <ConsultationPreviewDialog
        isOpen={showConsultationPreviewDialog}
        onClose={() => setShowConsultationPreviewDialog(false)}
        appointmentId={appointmentId}
        patientName={appointmentData?.patient_name}
        onEdit={() => {
          // Close preview dialog and open edit dialog
          setShowConsultationPreviewDialog(false);
          setShowConsultationFormDialog(true);
        }}
      />

      {/* Edit Appointment Dialog */}
      {appointmentData && (
        <LeadAppointmentScheduler
          isOpen={showEditAppointmentDialog}
          onClose={() => setShowEditAppointmentDialog(false)}
          onAppointmentScheduled={handleAppointmentUpdate}
          leadId={appointmentData.lead_id || undefined}
          leadName={appointmentData.patient_name}
          existingAppointment={{
            id: appointmentData.id,
            date: appointmentData.date,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            notes: appointmentData.notes,
            assigned_user_id: appointmentData.assigned_user_id
          }}
        />
      )}

      {/* Patient Packet Details Dialog */}
      <PatientPacketDetailsDialog
        isOpen={showPacketDetailsDialog}
        onClose={() => setShowPacketDetailsDialog(false)}
        packetStatus={packetLinkStatus}
        publicLink={patientPacketLink}
        linkOpenedAt={linkOpenedAt}
        submittedAt={packetDbSubmittedAt || undefined}
        isDirectConsultation={!patientPacketLink}
      />
    </div>
  );
};

export default ConsultationSessionPage;
