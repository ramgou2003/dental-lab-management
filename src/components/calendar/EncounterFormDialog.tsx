import { useEffect, useState, useRef } from "react";
import fixWebmDuration from "fix-webm-duration";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/SignaturePad";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Edit, Mic, FileAudio, RefreshCw, Play, Square, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecordingConsentDialog } from "@/components/RecordingConsentDialog";
import { RecordingControlDialog } from "@/components/RecordingControlDialog";
import { RecordingsList } from "@/components/RecordingsList";
import { uploadAudioRecording, saveRecordingMetadata } from "@/lib/audioRecordingService";
import { toast } from "sonner"; // Using sonner toast as used in recording service
import { CheckCircle2, XCircle, AlertCircle, CloudUpload, Check } from "lucide-react"; // Icons for status dialog

interface PatientDetails {
  full_name: string;
  date_of_birth: string;
  phone: string | null;
  email: string | null;
}

interface AppointmentDetails {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  subtype: string | null;
  status: string;
  notes: string | null;
  assigned_user_id: string | null;
}

interface EncounterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  appointmentId: string;
  onEncounterSaved?: () => void;
  isViewMode?: boolean;
}

export function EncounterFormDialog({
  open,
  onOpenChange,
  patientName,
  appointmentId,
  onEncounterSaved,
  isViewMode = false
}: EncounterFormDialogProps) {
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [assignedUserName, setAssignedUserName] = useState<string>('N/A');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // const { toast } = useToast(); // Use sonner toast instead to match recording service, or alias it. 
  // Accessing toast from use-toast hook for general form stuff, and sonner for recording stuff. 
  // Ideally should unify, but for minimal friction I'll keep both if namespaces don't collide.
  // The import 'toast' from "sonner" collides with 'useToast'.
  // I will rename the hook usage.
  const { toast: formToast } = useToast();

  // Encounter form fields - General
  const [biteAdjustment, setBiteAdjustment] = useState<string>('');
  const [followUpPictures, setFollowUpPictures] = useState<string>('');
  const [dataCollection, setDataCollection] = useState<string>('');
  const [newDesignRequired, setNewDesignRequired] = useState<string>('');
  const [patientAcceptedTreatment, setPatientAcceptedTreatment] = useState<string>('');
  const [treatmentRejectionReason, setTreatmentRejectionReason] = useState<string>('');
  const [ivSedationConsult, setIvSedationConsult] = useState<string>('');
  const [headAndNeckExam, setHeadAndNeckExam] = useState<string>('');
  const [recordCollection, setRecordCollection] = useState<string>('');
  const [administrativeForms, setAdministrativeForms] = useState<string>('');
  const [encounterId, setEncounterId] = useState<string | null>(null);

  // Encounter form fields - 7-day-followup specific
  const [howIsTheBite, setHowIsTheBite] = useState<string>('');
  const [speechIssue, setSpeechIssue] = useState<string>('');
  const [intaglioGap, setIntaglioGap] = useState<string>('');
  const [functionalIssue, setFunctionalIssue] = useState<string>('');

  // Surgery document checklist
  const [surgeryDataCollectionSheet, setSurgeryDataCollectionSheet] = useState<string>('');
  const [surgeryIvSedationFlowChart, setSurgeryIvSedationFlowChart] = useState<string>('');
  const [surgerySurgicalRecallSheet, setSurgerySurgicalRecallSheet] = useState<string>('');
  const [surgeryLabScript, setSurgeryLabScript] = useState<string>('');

  // Staff checklist for 75-day data collection and final data collection
  const [extraIntraOralPictures, setExtraIntraOralPictures] = useState<string>('');
  const [facialScan, setFacialScan] = useState<string>('');
  const [postSurgeryJawRecords, setPostSurgeryJawRecords] = useState<string>('');
  const [tissueScan, setTissueScan] = useState<string>('');
  const [icamRequired, setIcamRequired] = useState<string>('');

  // Smoking Status
  const [isPatientSmoker, setIsPatientSmoker] = useState<string>('');
  const [smokerDisclaimerAcknowledged, setSmokerDisclaimerAcknowledged] = useState<boolean>(false);
  const [smokerConsentDeclined, setSmokerConsentDeclined] = useState<boolean>(false);
  const [smokerSignature, setSmokerSignature] = useState<string>('');
  const [smokerSignatureDate, setSmokerSignatureDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Clinical notes
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // New section: Pictures/data collected
  const [picturesDataCollected, setPicturesDataCollected] = useState<string>('');
  // Consultation specific Pictures/data collected
  const [preSurgicalPictures, setPreSurgicalPictures] = useState<string>('');
  const [preSurgicalJawRecords, setPreSurgicalJawRecords] = useState<string>('');
  const [cbctData, setCbctData] = useState<string>('');

  // Surgery specific Pictures/data collected
  const [surgicalPictures, setSurgicalPictures] = useState<string>('');
  const [preSurgeryMarkerScan, setPreSurgeryMarkerScan] = useState<string>('');
  const [postSurgeryTissueScan, setPostSurgeryTissueScan] = useState<string>('');
  const [icamData, setIcamData] = useState<string>('');
  // Follow-up, Data Collection, Appliance Delivery specific Pictures/data collected
  const [postHealingJawRecords, setPostHealingJawRecords] = useState<string>('');
  const [postHealingTissueScan, setPostHealingTissueScan] = useState<string>('');
  const [modjawData, setModjawData] = useState<string>('');

  // Form status
  const [formStatus, setFormStatus] = useState<'draft' | 'complete'>('draft');
  const [consultationData, setConsultationData] = useState<any>(null);

  // Recording State
  const [showRecordingConsentDialog, setShowRecordingConsentDialog] = useState(false);
  const [showRecordingControlDialog, setShowRecordingControlDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Recording Status Dialog State
  const [showRecordingStatusDialog, setShowRecordingStatusDialog] = useState(false);
  const [recordingStatusState, setRecordingStatusState] = useState<'uploading' | 'success' | 'error'>('uploading');
  const [recordingStatusMessage, setRecordingStatusMessage] = useState('');
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  const recordingChunksRef = useRef<Blob[]>([]); // Use Ref for chunks to ensure latest data is accessed
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(-60);
  const [audioAnalyzer, setAudioAnalyzer] = useState<AnalyserNode | null>(null);
  const [audioCleanup, setAudioCleanup] = useState<(() => void) | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  // Used to force refresh of recordings list
  const [refreshRecordingsTrigger, setRefreshRecordingsTrigger] = useState(0);

  // Fetch patient details and encounter data when dialog opens
  useEffect(() => {
    if (open) {
      // Clear previous state immediately to prevent showing stale data
      setConsultationData(null);
      setAppointmentDetails(null);
      setPatientDetails(null);
      setAssignedUserName('N/A');

      if (patientName && appointmentId) {
        fetchPatientDetails();
        fetchAppointmentDetails();
        fetchEncounterData();
        fetchConsultationData();
      }
    }
  }, [open, appointmentId]); // Removed patientName dependency to avoid double firing if it changes slightly, though strictly it should be there. 
  // Ideally just open/appointmentId triggers the reset/reload.

  // Recording Implementation
  const startRecording = (recorder: MediaRecorder) => {
    console.log('Starting recording with MIME type:', recorder.mimeType);

    setMediaRecorder(recorder);
    setMediaStream(recorder.stream);
    setIsRecording(true);
    setIsPaused(false);
    setRecordingDuration(0);
    recordingChunksRef.current = []; // Reset chunks

    // Set up audio analysis
    const cleanup = setupAudioAnalysis(recorder.stream);
    setAudioCleanup(() => cleanup);

    // Handle recording data
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };

    recorder.start(1000); // Collect data every 1 second

    // Start timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setRecordingTimer(timer);
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      microphone.connect(analyser);

      setAudioAnalyzer(analyser);

      let animationId: number;
      const monitorAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = (dataArray[i] - 128) / 128;
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = rms > 0 ? 20 * Math.log10(rms) : -60;
        const normalizedDb = Math.max(-60, Math.min(0, db));

        setAudioLevel(normalizedDb);
        animationId = requestAnimationFrame(monitorAudio);
      };

      monitorAudio();

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
      return null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      try {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
        }
        setIsPaused(true);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
        toast.info("Recording paused");
      } catch (error) {
        console.error('Error pausing recording:', error);
      }
    }
  };

  const resumeRecording = async () => {
    if (isRecording && isPaused && mediaRecorder) {
      if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        setIsPaused(false);
        const timer = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        setRecordingTimer(timer);
        toast.info("Recording resumed");
      }
    }
  };

  const stopRecording = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (mediaRecorder && isRecording && !isProcessingRecording) {
        setIsRecording(false);
        setIsProcessingRecording(true);

        const handleProcessing = async () => {
          // Open status dialog
          setShowRecordingStatusDialog(true);
          setRecordingStatusState('uploading');
          setRecordingStatusMessage("Processing and uploading audio...");

          // Allow a small buffer for any pending writes
          await new Promise(r => setTimeout(r, 500));

          const rawBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });

          if (rawBlob.size > 0 && appointmentId) {
            try {
              setRecordingStatusMessage("Optimizing audio file...");

              // Fix WebM duration metadata
              // recordingDuration is in seconds, library expects milliseconds
              const finalBlob = await new Promise<Blob>((resolveBlob) => {
                fixWebmDuration(rawBlob, recordingDuration * 1000, (fixedBlob) => {
                  resolveBlob(fixedBlob);
                });
              });

              setRecordingStatusMessage("Uploading to secure storage...");

              const publicUrl = await uploadAudioRecording(finalBlob, appointmentId, patientName || "Patient");

              if (publicUrl) {
                await saveRecordingMetadata(appointmentId, publicUrl, recordingDuration, patientName);
                // toast.success("Recording saved"); // Replaced by Dialog
                setRecordingStatusState('success');
                setRecordingStatusMessage("Recording saved successfully!");
                setRefreshRecordingsTrigger(prev => prev + 1);

                // Close after a short delay
                setTimeout(() => {
                  setShowRecordingStatusDialog(false);
                }, 2000);
              } else {
                throw new Error("Upload returned no URL");
              }
            } catch (error) {
              console.error('Error saving recording:', error);
              // toast.error("Failed to save recording");
              setRecordingStatusState('error');
              setRecordingStatusMessage("Failed to save recording. Please try again.");
            }
          } else {
            console.warn("No chunks captured:", recordingChunksRef.current.length);
            setRecordingStatusState('error');
            if (recordingChunksRef.current.length === 0) {
              setRecordingStatusMessage("Recording too short or no audio detected.");
            } else {
              setRecordingStatusMessage("No recording data was captured.");
            }
          }

          setIsProcessingRecording(false);
          recordingChunksRef.current = [];
          resolve();
        };

        mediaRecorder.onstop = () => {
          handleProcessing();
        };

        mediaRecorder.stop();

        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }

        // Just clear the cleanup function reference. 
        // We rely on the Safe Cleanup check in setupAudioAnalysis or simple garbage collection.
        // If we want to force close instantly we can call it, but safely.
        if (audioCleanup) {
          audioCleanup();
          setAudioCleanup(null);
        }

        setIsPaused(false);
        setMediaRecorder(null);
        setMediaStream(null);
        setAudioAnalyzer(null);
        setShowRecordingControlDialog(false);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
      } else {
        resolve();
      }
    });
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingTimer) clearInterval(recordingTimer);
      if (mediaRecorder && isRecording) mediaRecorder.stop();
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (audioCleanup) audioCleanup();
    };
  }, [recordingTimer, mediaRecorder, mediaStream, isRecording, audioCleanup]);

  const fetchConsultationData = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations' as any)
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle(); // Use maybeSingle to avoid error on no rows

      if (data) {
        setConsultationData(data);
        // Sync patientAcceptedTreatment state for existing logic compatibility
        if ((data as any).treatment_decision === 'accepted') {
          setPatientAcceptedTreatment('Yes');
        } else {
          setPatientAcceptedTreatment('No');
        }
      } else {
        setConsultationData(null);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setConsultationData(null);
    }
  };

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients' as any)
        .select('full_name, date_of_birth, phone, email')
        .eq('full_name', patientName)
        .single() as any;

      if (error) {
        console.error('Error fetching patient details:', error);
        return;
      }

      if (data) {
        setPatientDetails(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .select('id, title, date, start_time, end_time, appointment_type, subtype, status, notes, assigned_user_id')
        .eq('id', appointmentId)
        .single() as any;

      if (error) {
        console.error('Error fetching appointment details:', error);
        return;
      }

      if (data) {
        setAppointmentDetails(data);

        // Fetch assigned user name if assigned_user_id exists
        if (data.assigned_user_id) {
          const { data: userData, error: userError } = await supabase
            .from('user_profiles' as any)
            .select('full_name')
            .eq('id', data.assigned_user_id)
            .single() as any;

          if (!userError && userData) {
            setAssignedUserName(userData.full_name);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch existing encounter data
  const fetchEncounterData = async () => {
    try {
      const { data, error } = await supabase
        .from('encounters' as any)
        .select('*')
        .eq('appointment_id', appointmentId)
        .single() as any;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching encounter data:', error);
        return;
      }

      if (data) {
        console.log('📥 Loading encounter data');

        setEncounterId(data.id);
        setBiteAdjustment(data.bite_adjustment || '');
        setFollowUpPictures(data.follow_up_pictures_taken || '');
        setDataCollection(data.data_collection || '');
        setNewDesignRequired(data.new_design_required || '');
        setPatientAcceptedTreatment(data.patient_accepted_treatment || '');
        setTreatmentRejectionReason(data.treatment_rejection_reason || '');
        setIvSedationConsult(data.iv_sedation_consult_done || '');
        setHeadAndNeckExam(data.head_and_neck_exam_done || '');
        setRecordCollection(data.record_collection_done || '');
        setAdministrativeForms(data.administrative_forms_done || '');
        // 7-day-followup specific fields
        setHowIsTheBite(data.how_is_the_bite || '');
        setSpeechIssue(data.speech_issue || '');
        setIntaglioGap(data.intaglio_gap || '');
        setFunctionalIssue(data.functional_issue || '');
        // Surgery document checklist fields
        setSurgeryDataCollectionSheet(data.surgery_data_collection_sheet || '');
        setSurgeryIvSedationFlowChart(data.surgery_iv_sedation_flow_chart || '');
        setSurgerySurgicalRecallSheet(data.surgery_surgical_recall_sheet || '');
        setSurgeryLabScript(data.surgery_lab_script || '');
        // 75-day-followup staff checklist fields
        setExtraIntraOralPictures(data.extra_intra_oral_pictures || '');
        setFacialScan(data.facial_scan || '');
        setPostSurgeryJawRecords(data.post_surgery_jaw_records || '');
        setTissueScan(data.tissue_scan || '');
        setIcamRequired(data.icam_required || '');
        // Smoking Status
        setIsPatientSmoker(data.is_patient_smoker || '');
        setSmokerDisclaimerAcknowledged(data.smoker_disclaimer_acknowledged || false);
        setSmokerConsentDeclined(data.smoker_consent_declined || false);
        setSmokerSignature(data.smoker_signature || '');
        setSmokerSignatureDate(data.smoker_signature_date || new Date().toISOString().split('T')[0]);
        // Pictures/data collected
        setPicturesDataCollected(data.pictures_data_collected || '');
        setPreSurgicalPictures(data.pre_surgical_pictures || '');
        setPreSurgicalJawRecords(data.pre_surgical_jaw_records || '');
        setCbctData(data.cbct_data || '');
        setSurgicalPictures(data.surgical_pictures || '');
        setPreSurgeryMarkerScan(data.pre_surgery_marker_scan || '');
        setPostSurgeryTissueScan(data.post_surgery_tissue_scan || '');
        setIcamData(data.icam_data || '');
        setPostHealingJawRecords(data.post_healing_jaw_records || '');
        setPostHealingTissueScan(data.post_healing_tissue_scan || '');
        setModjawData(data.modjaw_data || '');
        // Note: facial_scan is already handled in the 75-day block below, but we can rely on it being loaded there
        // or ensure it's loaded here if it wasn't already. It's safe to set it here if the logic below doesn't overwrite it with empty string unnecessarily 
        // if the type matches. The logic below sets it for 75-day/final.
        // Let's ensure it's set if it exists, regardless of subtype logic, since we share the field.
        // Actually, looking at the code below: 
        // setFacialScan(data.facial_scan || ''); is inside the fetch block, so it's already loading whatever is in there. 
        // Wait, the existing code:
        // setFacialScan(data.facial_scan || '');
        // is ALREADY in the fetch block (lines 247 in original file). I don't need to add it again, just need to make sure I don't accidentally clear it differently.
        // The existing fetch block loads ALL fields from `data` regardless of type.
        // So I just need to add my new fields.

        // Clinical notes
        setClinicalNotes(data.clinical_notes || '');
        // Form status
        setFormStatus(data.form_status || 'draft');
      } else {
        // Reset to defaults if no encounter exists
        setEncounterId(null);
        setBiteAdjustment('');
        setFollowUpPictures('');
        setDataCollection('');
        setNewDesignRequired('');
        setPatientAcceptedTreatment('');
        setTreatmentRejectionReason('');
        setIvSedationConsult('');
        setHeadAndNeckExam('');
        setRecordCollection('');
        setAdministrativeForms('');
        // 7-day-followup specific fields
        setHowIsTheBite('');
        setSpeechIssue('');
        setIntaglioGap('');
        setFunctionalIssue('');
        // Surgery document checklist fields
        setSurgeryDataCollectionSheet('');
        setSurgeryIvSedationFlowChart('');
        setSurgerySurgicalRecallSheet('');
        setSurgeryLabScript('');
        // 75-day-followup staff checklist fields
        setExtraIntraOralPictures('');
        setFacialScan('');
        setPostSurgeryJawRecords('');
        setTissueScan('');
        setIcamRequired('');
        // Smoking Status
        setIsPatientSmoker('');
        setSmokerDisclaimerAcknowledged(false);
        setSmokerConsentDeclined(false);
        setSmokerSignature('');
        setSmokerSignatureDate(new Date().toISOString().split('T')[0]);
        // Pictures/data collected
        setPicturesDataCollected('');
        setPreSurgicalPictures('');
        setPreSurgicalJawRecords('');
        setCbctData('');
        setSurgicalPictures('');
        setPreSurgeryMarkerScan('');
        setPostSurgeryTissueScan('');
        setIcamData('');
        setPostHealingJawRecords('');
        setPostHealingTissueScan('');
        setModjawData('');
        // Clinical notes
        setClinicalNotes('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display (convert 24-hour to 12-hour format)
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format appointment type for display
  const formatAppointmentType = (type: string | null) => {
    if (!type) return 'N/A';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Format appointment subtype for display
  const formatAppointmentSubtype = (subtype: string | null) => {
    if (!subtype) return 'N/A';
    return subtype.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Save encounter data
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isRecording) {
        // Stop recording and wait for it to save. The stopRecording function handles the UI feedback.
        await stopRecording();
      }

      console.log('🔍 Saving encounter data');

      const encounterData: any = {
        appointment_id: appointmentId,
        patient_name: patientName,
        clinical_notes: clinicalNotes,
        form_status: 'complete', // Automatically set to complete when saving
        updated_at: new Date().toISOString(),
        is_patient_smoker: isPatientSmoker,
        smoker_disclaimer_acknowledged: smokerDisclaimerAcknowledged,
        smoker_consent_declined: smokerConsentDeclined,
        smoker_signature: smokerSignature,
        smoker_signature_date: smokerSignatureDate,
        pictures_data_collected: picturesDataCollected
      };

      // Add assessment/encounter details if NOT surgery and NOT consultation (where they aren't visible or needed)
      if (appointmentDetails?.appointment_type !== 'surgery' &&
        appointmentDetails?.appointment_type !== 'surgical-revision' &&
        appointmentDetails?.appointment_type !== 'consultation') {
        encounterData.bite_adjustment = biteAdjustment;

        // Ensure follow_up_pictures_taken is 'No' if picturesDataCollected is 'No', to satisfy DB constraint
        if (picturesDataCollected === 'No') {
          encounterData.follow_up_pictures_taken = 'No';
        } else {
          encounterData.follow_up_pictures_taken = followUpPictures;
        }

        encounterData.data_collection = dataCollection;
        encounterData.new_design_required = newDesignRequired;
      }

      // Add consultation specific fields
      if (appointmentDetails?.appointment_type === 'consultation') {
        encounterData.patient_accepted_treatment = patientAcceptedTreatment;
        encounterData.treatment_rejection_reason = patientAcceptedTreatment === 'No' ? treatmentRejectionReason : null;

        // Add checklist items if treatment accepted
        if (patientAcceptedTreatment === 'Yes') {
          encounterData.iv_sedation_consult_done = ivSedationConsult;
          encounterData.head_and_neck_exam_done = headAndNeckExam;
          encounterData.record_collection_done = recordCollection;
          encounterData.administrative_forms_done = administrativeForms;
        } else {
          encounterData.iv_sedation_consult_done = null;
          encounterData.head_and_neck_exam_done = null;
          encounterData.record_collection_done = null;
          encounterData.administrative_forms_done = null;
        }

        // Add Consultation Pictures/Data Collected fields
        if (picturesDataCollected === 'Yes') {
          encounterData.pre_surgical_pictures = preSurgicalPictures;
          encounterData.pre_surgical_jaw_records = preSurgicalJawRecords;
          encounterData.cbct_data = cbctData;
          encounterData.facial_scan = facialScan; // Reusing existing field
        } else {
          encounterData.pre_surgical_pictures = null;
          encounterData.pre_surgical_jaw_records = null;
          encounterData.cbct_data = null;
          // Be careful not to wipe facial_scan if it's used by other logic, but usually only one form type is active at a time.
          // Since this block is exclusively `if (appointmentDetails?.appointment_type === 'consultation')`, it is safe to nullify it for this encounter.
          encounterData.facial_scan = null;
        }
      }

      console.log('📝 Encounter data to save:', encounterData);

      // Add Follow-up Assessment fields for relevant appointment types
      if (appointmentDetails?.appointment_type === 'follow-up' ||
        appointmentDetails?.appointment_type === 'data-collection' ||
        appointmentDetails?.appointment_type === 'printed-try-in' ||
        appointmentDetails?.appointment_type === 'Appliance-delivery') {
        encounterData.how_is_the_bite = howIsTheBite;
        encounterData.speech_issue = speechIssue;
        encounterData.intaglio_gap = intaglioGap;
        encounterData.functional_issue = functionalIssue;
      }

      // Add surgery document checklist fields and assessment questions if applicable
      if (appointmentDetails?.appointment_type === 'surgery' ||
        appointmentDetails?.appointment_type === 'surgical-revision') {
        encounterData.surgery_data_collection_sheet = surgeryDataCollectionSheet;
        encounterData.surgery_iv_sedation_flow_chart = surgeryIvSedationFlowChart;
        encounterData.surgery_surgical_recall_sheet = surgerySurgicalRecallSheet;
        encounterData.surgery_lab_script = surgeryLabScript;

        // Add Surgery Pictures/Data Collected fields
        if (picturesDataCollected === 'Yes') {
          encounterData.surgical_pictures = surgicalPictures;
          encounterData.pre_surgery_marker_scan = preSurgeryMarkerScan;
          encounterData.post_surgery_tissue_scan = postSurgeryTissueScan;
          encounterData.icam_data = icamData;
          encounterData.cbct_data = cbctData;
          encounterData.facial_scan = facialScan;
        } else {
          encounterData.surgical_pictures = null;
          encounterData.pre_surgery_marker_scan = null;
          encounterData.post_surgery_tissue_scan = null;
          encounterData.icam_data = null;
          encounterData.cbct_data = null;
          encounterData.facial_scan = null;
        }
      }

      // Add Staff Checklist fields for specific subtype
      if (appointmentDetails?.subtype === 'data-collection-printed-try-in') {
        encounterData.extra_intra_oral_pictures = extraIntraOralPictures;
        encounterData.facial_scan = facialScan;
        encounterData.post_surgery_jaw_records = postSurgeryJawRecords;
        encounterData.tissue_scan = tissueScan;
        encounterData.icam_required = icamRequired;
      }

      // Add Pictures/Data Collected fields for Follow-up, Data Collection, and Appliance Delivery
      if (picturesDataCollected === 'Yes' &&
        (appointmentDetails?.appointment_type === 'follow-up' ||
          appointmentDetails?.appointment_type === 'data-collection' ||
          appointmentDetails?.appointment_type === 'printed-try-in' ||
          appointmentDetails?.appointment_type === 'Appliance-delivery')) {
        encounterData.post_healing_jaw_records = postHealingJawRecords;
        encounterData.post_healing_tissue_scan = postHealingTissueScan;
        encounterData.modjaw_data = modjawData;
        encounterData.icam_data = icamData;
        encounterData.cbct_data = cbctData;
        encounterData.facial_scan = facialScan;
        // follow_up_pictures_taken is already saved in the generic block logic
      } else if (appointmentDetails?.appointment_type === 'follow-up' ||
        appointmentDetails?.appointment_type === 'data-collection' ||
        appointmentDetails?.appointment_type === 'printed-try-in' ||
        appointmentDetails?.appointment_type === 'Appliance-delivery') {
        encounterData.post_healing_jaw_records = null;
        encounterData.post_healing_tissue_scan = null;
        encounterData.modjaw_data = null;
        encounterData.icam_data = null;
        encounterData.cbct_data = null;
        // Don't null facial_scan or follow_up_pictures aggressively if used elsewhere, 
        // but here they are part of this conditional set.
      }

      if (encounterId) {
        // Update existing encounter
        const { data, error } = await supabase
          .from('encounters' as any)
          .update(encounterData)
          .eq('id', encounterId)
          .select()
          .single() as any;

        if (error) throw error;

        console.log('✅ Encounter updated successfully:', data);

        // Mark appointment as encounter completed
        const { data: { user } } = await supabase.auth.getUser();
        const { error: appointmentError } = await supabase
          .from('appointments' as any)
          .update({
            encounter_completed: true,
            encounter_completed_at: new Date().toISOString(),
            encounter_completed_by: user?.id || null
          } as any)
          .eq('id', appointmentId);

        if (appointmentError) {
          console.error('Error updating appointment:', appointmentError);
        }

        formToast({
          title: "Success",
          description: "Encounter form updated successfully",
        });

        // If we were in edit mode, go back to view mode instead of closing
        if (isEditMode) {
          setIsEditMode(false);
        } else {
          onOpenChange(false);
        }
      } else {
        // Create new encounter
        const { data, error } = await supabase
          .from('encounters' as any)
          .insert([encounterData])
          .select()
          .single() as any;

        if (error) throw error;

        console.log('✅ Encounter created successfully:', data);

        setEncounterId(data.id);

        // Mark appointment as encounter completed
        const { data: { user } } = await supabase.auth.getUser();
        const { error: appointmentError } = await supabase
          .from('appointments' as any)
          .update({
            encounter_completed: true,
            encounter_completed_at: new Date().toISOString(),
            encounter_completed_by: user?.id || null
          } as any)
          .eq('id', appointmentId);

        if (appointmentError) {
          console.error('Error updating appointment:', appointmentError);
        }

        formToast({
          title: "Success",
          description: "Encounter form saved successfully",
        });

        // Close dialog after creating new encounter
        onOpenChange(false);
      }

      // Call the callback to refresh encounter status
      if (onEncounterSaved) {
        onEncounterSaved();
      }
    } catch (error) {
      console.error('Error saving encounter:', error);
      formToast({
        title: "Error",
        description: "Failed to save encounter form",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Determine if we're in view mode (encounter exists and not editing)
  const showViewMode = isViewMode && !isEditMode && encounterId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] flex flex-col touch-manipulation p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-900">
                {showViewMode ? 'Encounter Form - View' : 'Encounter Form'}
              </DialogTitle>
              {showViewMode && (
                <p className="text-sm text-blue-600 mt-1">Read-only view • Click Edit to make changes</p>
              )}
            </div>
            <div className="flex items-center gap-2 mr-8">
              {(isRecording || isProcessingRecording) ? (
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  <div className="flex items-center gap-2 mr-2 border-r border-red-200 pr-3">
                    <span className={`relative flex h-3 w-3 ${isPaused ? '' : 'animate-pulse'}`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${isPaused ? 'hidden' : ''}`}></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-mono font-medium text-red-900 text-sm">
                      {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {isProcessingRecording ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-red-700">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-full"
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        title={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-full"
                        onClick={() => stopRecording()}
                        title="Stop & Save"
                      >
                        <Square className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                !showViewMode && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRecordingConsentDialog(true)}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 flex items-center gap-2 rounded-full px-4 shadow-sm transition-all"
                  >
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <Mic className="h-3.5 w-3.5" />
                    <span className="font-medium text-sm">Record Audio</span>
                  </Button>
                )
              )}

              {showViewMode && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {showViewMode && (
              <div className="bg-blue-100 border-b border-blue-200 px-6 py-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">Viewing saved encounter form in read-only mode</span>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className={`space-y-4 ${showViewMode ? 'pointer-events-none select-none' : ''}`}>
                {/* View Mode Summary Card */}
                {showViewMode && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-500 text-white rounded-full p-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-green-900">Encounter Completed</h4>
                        <p className="text-xs text-green-700">This encounter form has been saved</p>
                      </div>
                    </div>

                    {appointmentDetails?.appointment_type === 'consultation' ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white/60 rounded p-2">
                            <p className="text-gray-600 font-medium">Treatment Accepted</p>
                            <p className={`font-semibold ${patientAcceptedTreatment === 'Yes' ? 'text-green-700' : patientAcceptedTreatment === 'No' ? 'text-red-700' : 'text-gray-900'}`}>
                              {patientAcceptedTreatment || 'N/A'}
                            </p>
                          </div>
                          {patientAcceptedTreatment === 'No' && treatmentRejectionReason && (
                            <div className="bg-white/60 rounded p-2">
                              <p className="text-gray-600 font-medium">Reason for No</p>
                              <p className="font-semibold text-red-700">
                                {treatmentRejectionReason}
                              </p>
                            </div>
                          )}
                        </div>

                        {patientAcceptedTreatment === 'Yes' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-white/40 rounded p-1.5 border border-white/20">
                              <p className="text-gray-500 text-[10px]">IV Sedation</p>
                              <p className="font-bold text-gray-800">{ivSedationConsult || '-'}</p>
                            </div>
                            <div className="bg-white/40 rounded p-1.5 border border-white/20">
                              <p className="text-gray-500 text-[10px]">H&N Exam</p>
                              <p className="font-bold text-gray-800">{headAndNeckExam || '-'}</p>
                            </div>
                            <div className="bg-white/40 rounded p-1.5 border border-white/20">
                              <p className="text-gray-500 text-[10px]">Records</p>
                              <p className="font-bold text-gray-800">{recordCollection || '-'}</p>
                            </div>
                            <div className="bg-white/40 rounded p-1.5 border border-white/20">
                              <p className="text-gray-500 text-[10px]">Admin Forms</p>
                              <p className="font-bold text-gray-800">{administrativeForms || '-'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-gray-600 font-medium">Bite Adjustment</p>
                          <p className="font-semibold text-gray-900">{biteAdjustment || 'N/A'}</p>
                        </div>
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-gray-600 font-medium">Pictures Taken</p>
                          <p className="font-semibold text-gray-900">{followUpPictures || 'N/A'}</p>
                        </div>
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-gray-600 font-medium">Data Collection</p>
                          <p className="font-semibold text-gray-900">{dataCollection || 'N/A'}</p>
                        </div>
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-gray-600 font-medium">New Design</p>
                          <p className="font-semibold text-gray-900">{newDesignRequired || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Two-Column Layout: Patient Info (Left) and Appointment Info (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Patient Information - Left Column (1/3 width) */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold mb-2 text-blue-900">Patient Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-20 flex-shrink-0">Name:</Label>
                        <Input
                          value={patientDetails?.full_name || patientName || 'N/A'}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-20 flex-shrink-0">DOB:</Label>
                        <Input
                          value={formatDate(patientDetails?.date_of_birth || (consultationData as any)?.dob || null)}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-20 flex-shrink-0">Phone:</Label>
                        <Input
                          value={patientDetails?.phone || 'N/A'}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-20 flex-shrink-0">Email:</Label>
                        <Input
                          value={patientDetails?.email || 'N/A'}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Information - Right Column (2/3 width) */}
                  <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold mb-2 text-blue-900">Appointment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Type:</Label>
                        <Input
                          value={formatAppointmentType(appointmentDetails?.appointment_type || null)}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Subtype:</Label>
                        <Input
                          value={formatAppointmentSubtype(appointmentDetails?.subtype || null)}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Status:</Label>
                        <Input
                          value={appointmentDetails?.status || 'N/A'}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Date:</Label>
                        <Input
                          value={formatDate(appointmentDetails?.date || null)}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Time:</Label>
                        <Input
                          value={`${formatTime(appointmentDetails?.start_time || null)} - ${formatTime(appointmentDetails?.end_time || null)}`}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Assigned To:</Label>
                        <Input
                          value={assignedUserName}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      {appointmentDetails?.notes && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-medium text-blue-700 w-24 flex-shrink-0">Notes:</Label>
                          <Input
                            value={appointmentDetails.notes}
                            disabled
                            className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pictures/Data Collected Section */}
                {/* Pictures/Data Collected Section */}
                {appointmentDetails?.appointment_type !== 'consultation' && (
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 mb-6 transition-all animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-bold mb-4 text-indigo-900">Pictures/Data Collected</h3>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-indigo-900">
                          Pictures/data collected?
                        </Label>
                        <RadioGroup value={picturesDataCollected} onValueChange={setPicturesDataCollected}>
                          <div className="flex items-center gap-1.5 max-w-xs">
                            <Label
                              htmlFor="pictures-yes"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${picturesDataCollected === 'Yes'
                                ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-indigo-300'
                                }`}
                            >
                              <RadioGroupItem
                                value="Yes"
                                id="pictures-yes"
                                className={`h-3.5 w-3.5 ${picturesDataCollected === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                              />
                              <span className={`text-xs font-medium ${picturesDataCollected === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                Yes
                              </span>
                            </Label>
                            <Label
                              htmlFor="pictures-no"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${picturesDataCollected === 'No'
                                ? 'bg-gray-100 border-gray-500 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <RadioGroupItem
                                value="No"
                                id="pictures-no"
                                className={`h-3.5 w-3.5 ${picturesDataCollected === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                              />
                              <span className={`text-xs font-medium ${picturesDataCollected === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                No
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Consultation Specific Questions */}
                      {picturesDataCollected === 'Yes' && appointmentDetails?.appointment_type === 'consultation' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in pt-2">
                          {/* 1. Pre surgical Pictures */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">1. Pre surgical Pictures</Label>
                            <RadioGroup value={preSurgicalPictures} onValueChange={setPreSurgicalPictures}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="pre-pics-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalPictures === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="pre-pics-yes"
                                    className={`h-3.5 w-3.5 ${preSurgicalPictures === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgicalPictures === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="pre-pics-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalPictures === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="pre-pics-no"
                                    className={`h-3.5 w-3.5 ${preSurgicalPictures === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgicalPictures === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 2. Pre surgical jaw records */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">2. Pre surgical jaw records</Label>
                            <RadioGroup value={preSurgicalJawRecords} onValueChange={setPreSurgicalJawRecords}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="pre-jaw-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalJawRecords === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="pre-jaw-yes"
                                    className={`h-3.5 w-3.5 ${preSurgicalJawRecords === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgicalJawRecords === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="pre-jaw-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalJawRecords === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="pre-jaw-no"
                                    className={`h-3.5 w-3.5 ${preSurgicalJawRecords === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgicalJawRecords === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 3. Facial scan */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">3. Facial scan</Label>
                            <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="consult-facial-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="consult-facial-yes"
                                    className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="consult-facial-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="consult-facial-no"
                                    className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 4. CBCT data */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">4. CBCT data</Label>
                            <RadioGroup value={cbctData} onValueChange={setCbctData}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="cbct-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="cbct-yes"
                                    className={`h-3.5 w-3.5 ${cbctData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${cbctData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="cbct-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="cbct-no"
                                    className={`h-3.5 w-3.5 ${cbctData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${cbctData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      )}

                      {/* Surgery Specific Questions */}
                      {picturesDataCollected === 'Yes' && (appointmentDetails?.appointment_type === 'surgery' || appointmentDetails?.appointment_type === 'surgical-revision') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in pt-2">
                          {/* 1. Surgical Pictures */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">1. Surgical Pictures</Label>
                            <RadioGroup value={surgicalPictures} onValueChange={setSurgicalPictures}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="surgical-pics-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgicalPictures === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgical-pics-yes"
                                    className={`h-3.5 w-3.5 ${surgicalPictures === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgicalPictures === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgical-pics-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgicalPictures === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgical-pics-no"
                                    className={`h-3.5 w-3.5 ${surgicalPictures === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgicalPictures === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 2. Pre surgery marker scan */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">2. Pre surgery marker scan</Label>
                            <RadioGroup value={preSurgeryMarkerScan} onValueChange={setPreSurgeryMarkerScan}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="marker-scan-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgeryMarkerScan === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="marker-scan-yes"
                                    className={`h-3.5 w-3.5 ${preSurgeryMarkerScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgeryMarkerScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="marker-scan-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgeryMarkerScan === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="marker-scan-no"
                                    className={`h-3.5 w-3.5 ${preSurgeryMarkerScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${preSurgeryMarkerScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 3. Post surgery tissue scan */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">3. Post surgery tissue scan</Label>
                            <RadioGroup value={postSurgeryTissueScan} onValueChange={setPostSurgeryTissueScan}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="tissue-scan-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryTissueScan === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="tissue-scan-yes"
                                    className={`h-3.5 w-3.5 ${postSurgeryTissueScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${postSurgeryTissueScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="tissue-scan-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryTissueScan === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="tissue-scan-no"
                                    className={`h-3.5 w-3.5 ${postSurgeryTissueScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${postSurgeryTissueScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 4. ICAM */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">4. ICAM</Label>
                            <RadioGroup value={icamData} onValueChange={setIcamData}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="icam-data-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamData === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="icam-data-yes"
                                    className={`h-3.5 w-3.5 ${icamData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${icamData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="icam-data-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamData === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="icam-data-no"
                                    className={`h-3.5 w-3.5 ${icamData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${icamData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 5. CBCT */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">5. CBCT</Label>
                            <RadioGroup value={cbctData} onValueChange={setCbctData}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="surgery-cbct-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-cbct-yes"
                                    className={`h-3.5 w-3.5 ${cbctData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${cbctData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-cbct-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-cbct-no"
                                    className={`h-3.5 w-3.5 ${cbctData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${cbctData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* 6. Facial scan */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                            <Label className="text-sm font-medium text-indigo-900">6. Facial scan</Label>
                            <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="surgery-facial-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                    ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-facial-yes"
                                    className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-facial-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-facial-no"
                                    className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      )}

                      {picturesDataCollected === 'Yes' &&
                        (appointmentDetails?.appointment_type === 'follow-up' ||
                          appointmentDetails?.appointment_type === 'data-collection' ||
                          appointmentDetails?.appointment_type === 'printed-try-in' ||
                          appointmentDetails?.appointment_type === 'Appliance-delivery') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">

                            {/* 1. Follow-up pictures */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">1. Follow-up pictures</Label>
                              <RadioGroup value={followUpPictures} onValueChange={setFollowUpPictures}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="fu-pics-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${followUpPictures === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="fu-pics-yes"
                                      className={`h-3.5 w-3.5 ${followUpPictures === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${followUpPictures === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="fu-pics-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${followUpPictures === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="fu-pics-no"
                                      className={`h-3.5 w-3.5 ${followUpPictures === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${followUpPictures === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 2. Post healing jaw records */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">2. Post healing jaw records</Label>
                              <RadioGroup value={postHealingJawRecords} onValueChange={setPostHealingJawRecords}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="ph-jaw-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postHealingJawRecords === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="ph-jaw-yes"
                                      className={`h-3.5 w-3.5 ${postHealingJawRecords === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${postHealingJawRecords === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="ph-jaw-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postHealingJawRecords === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="ph-jaw-no"
                                      className={`h-3.5 w-3.5 ${postHealingJawRecords === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${postHealingJawRecords === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 3. Post healing Tissue scan */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">3. Post healing Tissue scan</Label>
                              <RadioGroup value={postHealingTissueScan} onValueChange={setPostHealingTissueScan}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="ph-tissue-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postHealingTissueScan === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="ph-tissue-yes"
                                      className={`h-3.5 w-3.5 ${postHealingTissueScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${postHealingTissueScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="ph-tissue-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postHealingTissueScan === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="ph-tissue-no"
                                      className={`h-3.5 w-3.5 ${postHealingTissueScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${postHealingTissueScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 4. ICAM data */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">4. ICAM data</Label>
                              <RadioGroup value={icamData} onValueChange={setIcamData}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="fu-icam-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamData === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="fu-icam-yes"
                                      className={`h-3.5 w-3.5 ${icamData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${icamData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="fu-icam-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamData === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="fu-icam-no"
                                      className={`h-3.5 w-3.5 ${icamData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${icamData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 5. CBCT */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">5. CBCT</Label>
                              <RadioGroup value={cbctData} onValueChange={setCbctData}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="fu-cbct-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="fu-cbct-yes"
                                      className={`h-3.5 w-3.5 ${cbctData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${cbctData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="fu-cbct-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="fu-cbct-no"
                                      className={`h-3.5 w-3.5 ${cbctData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${cbctData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 6. Facial Scan */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">6. Facial scan</Label>
                              <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="fu-facial-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="fu-facial-yes"
                                      className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="fu-facial-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="fu-facial-no"
                                      className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 7. Modjaw */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">7. Modjaw</Label>
                              <RadioGroup value={modjawData} onValueChange={setModjawData}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="modjaw-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${modjawData === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="modjaw-yes"
                                      className={`h-3.5 w-3.5 ${modjawData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${modjawData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="modjaw-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${modjawData === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="modjaw-no"
                                      className={`h-3.5 w-3.5 ${modjawData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${modjawData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                          </div>
                        )}

                      {/* Placeholder for future Yes logic for OTHER types */}
                      {picturesDataCollected === 'Yes' &&
                        appointmentDetails?.appointment_type !== 'consultation' &&
                        appointmentDetails?.appointment_type !== 'surgery' &&
                        appointmentDetails?.appointment_type !== 'surgical-revision' &&
                        appointmentDetails?.appointment_type !== 'follow-up' &&
                        appointmentDetails?.appointment_type !== 'data-collection' &&
                        appointmentDetails?.appointment_type !== 'printed-try-in' &&
                        appointmentDetails?.appointment_type !== 'Appliance-delivery' && (
                          <div className="text-sm text-indigo-600 italic animate-in fade-in">
                            Additional questions for this encounter type will appear here...
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Smoking Status Section - Show for ALL encounters EXCEPT surgery and consultation */}
                {appointmentDetails?.appointment_type !== 'surgery' &&
                  appointmentDetails?.appointment_type !== 'surgical-revision' &&
                  appointmentDetails?.appointment_type !== 'consultation' && (
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6 transition-all animate-in fade-in slide-in-from-top-2">
                      <h3 className="text-lg font-bold mb-4 text-purple-900">Smoking Status</h3>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-purple-900">
                            Is the Patient a Smoker?
                          </Label>
                          <RadioGroup value={isPatientSmoker} onValueChange={setIsPatientSmoker}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="smoker-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${isPatientSmoker === 'Yes'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="smoker-yes"
                                  className={`h-3.5 w-3.5 ${isPatientSmoker === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${isPatientSmoker === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="smoker-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${isPatientSmoker === 'No'
                                  ? 'bg-green-50 border-green-500 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="smoker-no"
                                  className={`h-3.5 w-3.5 ${isPatientSmoker === 'No' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${isPatientSmoker === 'No' ? 'text-green-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Warning Content - Only shown if Smoker is Yes */}
                        {isPatientSmoker === 'Yes' && (
                          <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Critical Information Alert */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                              <div className="bg-red-100 p-2 rounded-full h-fit flex-shrink-0">
                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-red-900 text-sm">Critical Information</h4>
                                <p className="text-sm text-red-800 font-medium">
                                  All nicotine use must stop at least 3 weeks before surgery to prevent serious complications and implant failure.
                                </p>
                              </div>
                            </div>

                            <div className="text-center py-2">
                              <h4 className="font-bold text-gray-800 text-base">Understanding Nicotine Risks for Your Surgery</h4>
                            </div>

                            {/* Why This Matters */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                              <div className="p-1 h-fit flex-shrink-0">
                                <span className="text-xl">❤️</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-blue-900 text-sm">Why This Matters - We Want Your Surgery to Succeed</h4>
                                <p className="text-xs text-blue-800">
                                  Your health and the success of your surgery are our top priorities. We're sharing this information because we want the best possible outcome for you.
                                </p>
                              </div>
                            </div>

                            {/* How Nicotine Affects */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                              <div className="p-1 h-fit flex-shrink-0">
                                <span className="text-xl">🚬</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-blue-900 text-sm">How Nicotine Affects Your Healing</h4>
                                <p className="text-xs text-blue-800">
                                  Nicotine narrows your blood vessels, reducing oxygen and nutrients to the surgical site. This makes it much harder for your body to heal properly.
                                </p>
                              </div>
                            </div>

                            {/* Specific Risks */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                              <div className="bg-red-100 p-2 rounded-full h-fit flex-shrink-0">
                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-red-900 text-sm">Specific Risks You Face</h4>
                                <ul className="list-disc list-inside text-xs text-red-800 space-y-1 mt-1 font-medium">
                                  <li>Complete implant failure requiring removal and replacement</li>
                                  <li>Wound healing problems, including wounds that won't close</li>
                                  <li>Loss of skin grafts or flaps</li>
                                  <li>Infection at the surgical site</li>
                                  <li>Need for additional surgeries</li>
                                  <li>Significant financial costs not covered by insurance</li>
                                </ul>
                              </div>
                            </div>

                            {/* Required Timeline */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                              <div className="p-1 h-fit flex-shrink-0">
                                <span className="text-xl">📅</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-orange-900 text-sm">Required Timeline for Nicotine Cessation</h4>
                                <ul className="text-xs text-orange-800 space-y-1 mt-1 font-medium">
                                  <li><span className="font-bold">• Before Surgery:</span> Stop ALL nicotine use at least 3 weeks prior</li>
                                  <li><span className="font-bold">• After Surgery:</span> Continue nicotine-free until cleared by doctor</li>
                                  <li><span className="font-bold">• Secondhand Smoke:</span> Also avoid exposure throughout recovery</li>
                                </ul>
                              </div>
                            </div>

                            {/* Free Support */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                              <div className="p-1 h-fit flex-shrink-0">
                                <span className="text-xl">🤝</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-green-900 text-sm">Free Support Available - You Don't Have to Do This Alone</h4>
                                <div className="text-xs text-green-800 mt-2 space-y-1">
                                  <p><span className="font-bold">Program:</span> Commit to Quit! by University of Rochester</p>
                                  <p><span className="font-bold">Phone:</span> (585) 602-0720</p>
                                  <p><span className="font-bold">Email:</span> healthyliving@urmc.rochester.edu</p>
                                  <p><span className="font-bold">Format:</span> 6 virtual sessions</p>
                                  <p><span className="font-bold">Cost:</span> FREE - No referral needed</p>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                        {isPatientSmoker === 'Yes' && (
                          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
                            {/* Encouragement Banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                                <span className="font-bold text-blue-800">You Can Do This!</span> Many of our patients have successfully quit nicotine before surgery. Taking this step not only improves your surgical outcome but also benefits your overall health. We're here to support you through this process.
                              </p>
                            </div>

                            {/* Unified Consent & Signature Container - Matches provided image */}
                            <div className="bg-blue-50/50 rounded-lg border border-blue-200 overflow-hidden">

                              {/* Consent Checkboxes */}
                              <div className="p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="smoker-consent"
                                    checked={smokerDisclaimerAcknowledged}
                                    onCheckedChange={(checked) => {
                                      setSmokerDisclaimerAcknowledged(checked as boolean);
                                      if (checked) setSmokerConsentDeclined(false);
                                    }}
                                    className="mt-0.5 border-blue-400 text-blue-600 focus:ring-blue-500"
                                  />
                                  <Label
                                    htmlFor="smoker-consent"
                                    className="text-xs leading-relaxed text-blue-900 font-medium cursor-pointer"
                                  >
                                    I understand that continuing nicotine use before or after surgery significantly increases my risk of complications, including complete implant failure, poor wound healing, infection, and the need for additional surgeries. I acknowledge that insurance may not cover costs related to complications caused by nicotine use. I have been informed of free cessation resources and understand that Dr. Charles STRONGLY recommends I stop all nicotine use at least 3 weeks before surgery and remain nicotine-free after surgery.
                                  </Label>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="smoker-decline"
                                    checked={smokerConsentDeclined}
                                    onCheckedChange={(checked) => {
                                      setSmokerConsentDeclined(checked as boolean);
                                      if (checked) {
                                        setSmokerDisclaimerAcknowledged(false);
                                        setSmokerSignature('');
                                      }
                                    }}
                                    className="mt-0.5 border-blue-400 text-blue-600 focus:ring-blue-500"
                                  />
                                  <Label
                                    htmlFor="smoker-decline"
                                    className="text-xs leading-relaxed text-red-600 font-medium cursor-pointer"
                                  >
                                    No, I decline to sign the consent and I take full responsibility to cover any additional costs related to smoking complications.
                                  </Label>
                                </div>
                              </div>

                              {/* Separator Line */}
                              <div className="border-t border-blue-200 mx-4"></div>

                              {/* Signature Section - Only show if acknowledged and not declined */}
                              <div className={`p-4 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${smokerDisclaimerAcknowledged ? (isViewMode ? 'opacity-100 pointer-events-none' : 'opacity-100') : 'opacity-50 pointer-events-none'}`}>
                                {/* Date Field */}
                                <div className="space-y-2">
                                  <Label className="text-xs font-semibold text-blue-900">Date</Label>
                                  <Input
                                    type="date"
                                    value={smokerSignatureDate}
                                    onChange={(e) => setSmokerSignatureDate(e.target.value)}
                                    className="bg-white border-blue-200 h-9 text-xs"
                                  />
                                </div>

                                {/* Signature Pad */}
                                <div className="space-y-2">
                                  <Label className="text-xs font-semibold text-blue-900">Patient Signature</Label>
                                  {smokerConsentDeclined ? (
                                    <div className="h-[150px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-xs italic">
                                      Signature not required (Declined)
                                    </div>
                                  ) : (
                                    <SignaturePad
                                      value={smokerSignature}
                                      onSignatureChange={setSmokerSignature}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* First Row: Encounter Details and Follow-up Questions */}
                <div className={`grid grid-cols-1 gap-4 ${(appointmentDetails?.appointment_type === 'follow-up' ||
                  appointmentDetails?.subtype === '75-day-data-collection' ||
                  appointmentDetails?.subtype === 'final-data-collection' ||
                  appointmentDetails?.subtype === 'data-collection-printed-try-in' ||
                  appointmentDetails?.appointment_type === 'surgery' ||
                  appointmentDetails?.appointment_type === 'surgical-revision')
                  ? 'md:grid-cols-2'
                  : ''
                  }`}>
                  {/* Consultation Specific Questions */}
                  {appointmentDetails?.appointment_type === 'consultation' && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold mb-6 text-blue-900">Encounter Details</h3>

                      <div className="space-y-3">
                        {/* Consultation Outcome - Read-only from Consultation Form */}
                        <div className="space-y-4 mb-4">
                          <Label className="text-sm font-bold text-blue-900 block border-b border-blue-200 pb-2">
                            Treatment Decision <span className="text-xs font-normal text-blue-600 ml-2">(from Consultation Form)</span>
                          </Label>

                          {!consultationData ? (
                            <div className="p-4 bg-white rounded-lg border border-gray-200 text-center text-sm text-gray-500 italic">
                              No connected consultation form data found.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Decision Status */}
                              <div>
                                {consultationData.treatment_decision === 'accepted' && (
                                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="bg-green-100 p-2 rounded-full">
                                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-green-900 text-base">Treatment Accepted</h4>
                                      <p className="text-xs text-green-700">Patient has agreed to the treatment plan</p>
                                    </div>
                                  </div>
                                )}

                                {consultationData.treatment_decision === 'not-accepted' && (
                                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="bg-red-100 p-2 rounded-full">
                                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-red-900 text-base">Treatment Not Accepted</h4>
                                      <p className="text-xs text-red-700">Patient declined the treatment plan</p>
                                    </div>
                                  </div>
                                )}

                                {consultationData.treatment_decision === 'followup-required' && (
                                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="bg-yellow-100 p-2 rounded-full">
                                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-yellow-900 text-base">Follow-up Required</h4>
                                      <p className="text-xs text-yellow-700">Patient needs more time or information</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Details / Reasons */}
                              {consultationData.treatment_decision !== 'accepted' && (
                                <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3">
                                  {consultationData.treatment_decision === 'not-accepted' && (
                                    <>
                                      <div>
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason for Decline</Label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                          {consultationData.financing_not_approved_reason || consultationData.financial_notes || "No specific reason recorded."}
                                        </p>
                                      </div>
                                    </>
                                  )}

                                  {consultationData.treatment_decision === 'followup-required' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow-up Date</Label>
                                        <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                          <span className="text-lg">📅</span>
                                          {formatDate(consultationData.followup_date) || 'Not scheduled'}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</Label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                          {consultationData.followup_reason || 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Pictures/Data Collected Section - Shown for Consultation after Treatment Acceptance */}
                  {appointmentDetails?.appointment_type === 'consultation' && consultationData?.treatment_decision === 'accepted' && (
                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 mb-6 transition-all animate-in fade-in slide-in-from-top-2">
                      <h3 className="text-lg font-bold mb-4 text-indigo-900">Pictures/Data Collected</h3>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-indigo-900">
                            Pictures/data collected?
                          </Label>
                          <RadioGroup value={picturesDataCollected} onValueChange={setPicturesDataCollected}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="consult-pictures-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${picturesDataCollected === 'Yes'
                                  ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-indigo-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="consult-pictures-yes"
                                  className={`h-3.5 w-3.5 ${picturesDataCollected === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${picturesDataCollected === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="consult-pictures-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${picturesDataCollected === 'No'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="consult-pictures-no"
                                  className={`h-3.5 w-3.5 ${picturesDataCollected === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${picturesDataCollected === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Consultation Specific Questions */}
                        {picturesDataCollected === 'Yes' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in pt-2">
                            {/* 1. Pre surgical Pictures */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">1. Pre surgical Pictures</Label>
                              <RadioGroup value={preSurgicalPictures} onValueChange={setPreSurgicalPictures}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="pre-pics-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalPictures === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="pre-pics-yes"
                                      className={`h-3.5 w-3.5 ${preSurgicalPictures === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${preSurgicalPictures === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="pre-pics-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalPictures === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="pre-pics-no"
                                      className={`h-3.5 w-3.5 ${preSurgicalPictures === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${preSurgicalPictures === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 2. Pre surgical jaw records */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">2. Pre surgical jaw records</Label>
                              <RadioGroup value={preSurgicalJawRecords} onValueChange={setPreSurgicalJawRecords}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="pre-jaw-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalJawRecords === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="pre-jaw-yes"
                                      className={`h-3.5 w-3.5 ${preSurgicalJawRecords === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${preSurgicalJawRecords === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="pre-jaw-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${preSurgicalJawRecords === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="pre-jaw-no"
                                      className={`h-3.5 w-3.5 ${preSurgicalJawRecords === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${preSurgicalJawRecords === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 3. Facial scan */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">3. Facial scan</Label>
                              <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="consult-facial-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="consult-facial-yes"
                                      className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="consult-facial-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="consult-facial-no"
                                      className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* 4. CBCT data */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-indigo-100">
                              <Label className="text-sm font-medium text-indigo-900">4. CBCT data</Label>
                              <RadioGroup value={cbctData} onValueChange={setCbctData}>
                                <div className="flex items-center gap-1.5">
                                  <Label
                                    htmlFor="cbct-yes"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'Yes'
                                      ? 'bg-indigo-100 border-indigo-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-indigo-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="Yes"
                                      id="cbct-yes"
                                      className={`h-3.5 w-3.5 ${cbctData === 'Yes' ? 'text-indigo-600 border-indigo-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${cbctData === 'Yes' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                      Yes
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="cbct-no"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${cbctData === 'No'
                                      ? 'bg-gray-100 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <RadioGroupItem
                                      value="No"
                                      id="cbct-no"
                                      className={`h-3.5 w-3.5 ${cbctData === 'No' ? 'text-gray-600 border-gray-600' : ''}`}
                                    />
                                    <span className={`text-xs font-medium ${cbctData === 'No' ? 'text-gray-700' : 'text-gray-700'}`}>
                                      No
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Treatment Accepted Checklist - New Section */}
                  {appointmentDetails?.appointment_type === 'consultation' && (consultationData?.treatment_decision === 'accepted' || patientAcceptedTreatment === 'Yes') && (
                    <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h3 className="text-lg font-bold text-blue-900 border-l-4 border-blue-500 pl-3 py-1 mb-6">
                        Treatment Accepted Checklist
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'IV sedation consult', value: ivSedationConsult, setter: setIvSedationConsult, id: 'iv-sedation' },
                          { label: 'Head and neck examination', value: headAndNeckExam, setter: setHeadAndNeckExam, id: 'hn-exam' },
                          { label: 'Record collection (Data collection sheet)', value: recordCollection, setter: setRecordCollection, id: 'rec-col' },
                          { label: 'Administrative forms', value: administrativeForms, setter: setAdministrativeForms, id: 'admin-forms' },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">{item.label}</Label>
                            <RadioGroup value={item.value} onValueChange={item.setter}>
                              <div className="flex items-center gap-1.5">
                                {/* Yes Option */}
                                <Label
                                  htmlFor={`${item.id}-yes`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${item.value === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id={`${item.id}-yes`}
                                    className={`h-3.5 w-3.5 ${item.value === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${item.value === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>

                                {/* No Option */}
                                <Label
                                  htmlFor={`${item.id}-no`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${item.value === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id={`${item.id}-no`}
                                    className={`h-3.5 w-3.5 ${item.value === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${item.value === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>

                                {/* N/A Option */}
                                <Label
                                  htmlFor={`${item.id}-na`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${item.value === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id={`${item.id}-na`}
                                    className={`h-3.5 w-3.5 ${item.value === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${item.value === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Encounter Form Fields - Left Column - Hide for surgery and consultation appointments */}
                  {appointmentDetails?.appointment_type !== 'surgery' &&
                    appointmentDetails?.appointment_type !== 'surgical-revision' &&
                    appointmentDetails?.appointment_type !== 'consultation' && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-blue-900">Encounter Details</h3>

                        <div className="space-y-3">
                          {/* Bite Adjustment */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Is bite adjustment made?</Label>
                            <RadioGroup value={biteAdjustment} onValueChange={setBiteAdjustment}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="bite-adj-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="bite-adj-yes"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-adj-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="bite-adj-no"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-adj-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="bite-adj-na"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Data Collection */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Data collection sheet</Label>
                            <RadioGroup value={dataCollection} onValueChange={setDataCollection}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="data-col-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="data-col-yes"
                                    className={`h-3.5 w-3.5 ${dataCollection === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${dataCollection === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-col-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="data-col-no"
                                    className={`h-3.5 w-3.5 ${dataCollection === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${dataCollection === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-col-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="data-col-na"
                                    className={`h-3.5 w-3.5 ${dataCollection === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${dataCollection === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Is New Design Required */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Is New Design Required?</Label>
                            <RadioGroup value={newDesignRequired} onValueChange={setNewDesignRequired}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="new-design-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${newDesignRequired === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="new-design-yes"
                                    className={`h-3.5 w-3.5 ${newDesignRequired === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${newDesignRequired === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="new-design-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${newDesignRequired === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="new-design-no"
                                    className={`h-3.5 w-3.5 ${newDesignRequired === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${newDesignRequired === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Follow-up Specific Questions - Right Column */}
                  {(appointmentDetails?.appointment_type === 'follow-up' ||
                    appointmentDetails?.appointment_type === 'data-collection' ||
                    appointmentDetails?.appointment_type === 'printed-try-in' ||
                    appointmentDetails?.appointment_type === 'Appliance-delivery') && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-blue-900">
                          {appointmentDetails?.subtype === '7-day-followup'
                            ? '7-Day Follow-up Assessment'
                            : appointmentDetails?.subtype === '30-day-followup'
                              ? '30-Day Follow-up Assessment'
                              : 'Follow-up Assessment'}
                        </h3>

                        <div className="space-y-3">
                          {/* How is the Bite */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">How is the Bite?</Label>
                            <RadioGroup value={howIsTheBite} onValueChange={setHowIsTheBite}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="bite-good"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Good'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Good"
                                    id="bite-good"
                                    className={`h-3.5 w-3.5 ${howIsTheBite === 'Good' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${howIsTheBite === 'Good' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Good
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-fair"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Fair'
                                    ? 'bg-yellow-50 border-yellow-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-yellow-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Fair"
                                    id="bite-fair"
                                    className={`h-3.5 w-3.5 ${howIsTheBite === 'Fair' ? 'text-yellow-600 border-yellow-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${howIsTheBite === 'Fair' ? 'text-yellow-700' : 'text-gray-700'}`}>
                                    Fair
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-poor"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Poor'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Poor"
                                    id="bite-poor"
                                    className={`h-3.5 w-3.5 ${howIsTheBite === 'Poor' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${howIsTheBite === 'Poor' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Poor
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Speech Issue */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Does the patient have any speech issue?</Label>
                            <RadioGroup value={speechIssue} onValueChange={setSpeechIssue}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="speech-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${speechIssue === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="speech-yes"
                                    className={`h-3.5 w-3.5 ${speechIssue === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${speechIssue === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="speech-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${speechIssue === 'No'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="speech-no"
                                    className={`h-3.5 w-3.5 ${speechIssue === 'No' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${speechIssue === 'No' ? 'text-green-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Intaglio Gap */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Is there an intaglio gap?</Label>
                            <RadioGroup value={intaglioGap} onValueChange={setIntaglioGap}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="intaglio-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="intaglio-yes"
                                    className={`h-3.5 w-3.5 ${intaglioGap === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${intaglioGap === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="intaglio-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'No'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="intaglio-no"
                                    className={`h-3.5 w-3.5 ${intaglioGap === 'No' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${intaglioGap === 'No' ? 'text-green-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Functional Issue */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-blue-100">
                            <Label className="text-sm font-medium text-blue-900">Does the patient have any functional issue?</Label>
                            <RadioGroup value={functionalIssue} onValueChange={setFunctionalIssue}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="functional-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${functionalIssue === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="functional-yes"
                                    className={`h-3.5 w-3.5 ${functionalIssue === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${functionalIssue === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="functional-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${functionalIssue === 'No'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-blue-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="functional-no"
                                    className={`h-3.5 w-3.5 ${functionalIssue === 'No' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${functionalIssue === 'No' ? 'text-green-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Surgery Document Checklist - Show only for surgery and surgical-revision */}
                  {(appointmentDetails?.appointment_type === 'surgery' ||
                    appointmentDetails?.appointment_type === 'surgical-revision') && (
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200 col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-green-900">Document Checklist</h3>

                        <div className="mb-4">
                          <p className="text-xs text-green-700 mb-4">Are the following forms completed?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Data Collection Sheet */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-green-100">
                            <Label className="text-sm font-medium text-green-900">1. Data Collection sheet</Label>
                            <RadioGroup value={surgeryDataCollectionSheet} onValueChange={setSurgeryDataCollectionSheet}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="data-sheet-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-green-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="data-sheet-yes"
                                    className={`h-3.5 w-3.5 ${surgeryDataCollectionSheet === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryDataCollectionSheet === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-sheet-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="data-sheet-no"
                                    className={`h-3.5 w-3.5 ${surgeryDataCollectionSheet === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryDataCollectionSheet === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-sheet-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="data-sheet-na"
                                    className={`h-3.5 w-3.5 ${surgeryDataCollectionSheet === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryDataCollectionSheet === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* IV Sedation Flow Chart */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-green-100">
                            <Label className="text-sm font-medium text-green-900">2. IV Sedation flow chart</Label>
                            <RadioGroup value={surgeryIvSedationFlowChart} onValueChange={setSurgeryIvSedationFlowChart}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="iv-flow-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-green-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="iv-flow-yes"
                                    className={`h-3.5 w-3.5 ${surgeryIvSedationFlowChart === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryIvSedationFlowChart === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="iv-flow-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="iv-flow-no"
                                    className={`h-3.5 w-3.5 ${surgeryIvSedationFlowChart === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryIvSedationFlowChart === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="iv-flow-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="iv-flow-na"
                                    className={`h-3.5 w-3.5 ${surgeryIvSedationFlowChart === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryIvSedationFlowChart === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Surgical Recall Sheet */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-green-100">
                            <Label className="text-sm font-medium text-green-900">3. Surgical recall Sheet</Label>
                            <RadioGroup value={surgerySurgicalRecallSheet} onValueChange={setSurgerySurgicalRecallSheet}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="recall-sheet-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-green-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="recall-sheet-yes"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="recall-sheet-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="recall-sheet-no"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="recall-sheet-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="recall-sheet-na"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Lab Script */}
                          <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-green-100">
                            <Label className="text-sm font-medium text-green-900">4. Lab script</Label>
                            <RadioGroup value={surgeryLabScript} onValueChange={setSurgeryLabScript}>
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="lab-script-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryLabScript === 'Yes'
                                    ? 'bg-green-100 border-green-500 shadow-sm'
                                    : 'bg-white border-green-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="lab-script-yes"
                                    className={`h-3.5 w-3.5 ${surgeryLabScript === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryLabScript === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="lab-script-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryLabScript === 'No'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="lab-script-no"
                                    className={`h-3.5 w-3.5 ${surgeryLabScript === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryLabScript === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="lab-script-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryLabScript === 'N/A'
                                    ? 'bg-gray-100 border-gray-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="lab-script-na"
                                    className={`h-3.5 w-3.5 ${surgeryLabScript === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryLabScript === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Staff Checklist - Show only for printed-try-in (removed for data-collection per user request) */}
                  {(appointmentDetails?.subtype === 'data-collection-printed-try-in') && (
                    <div className="bg-orange-50 p-6 rounded-lg border border-orange-300">
                      <h3 className="text-lg font-semibold mb-6 text-amber-900">Staff Checklist</h3>

                      <div className="space-y-3">
                        {/* Extra Intra Oral Pictures */}
                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-orange-100">
                          <Label className="text-sm font-medium text-amber-900">Extra Intra Oral Pictures</Label>
                          <RadioGroup value={extraIntraOralPictures} onValueChange={setExtraIntraOralPictures}>
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor="extra-pics-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'Yes'
                                  ? 'bg-green-100 border-green-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="extra-pics-yes"
                                  className={`h-3.5 w-3.5 ${extraIntraOralPictures === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${extraIntraOralPictures === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="extra-pics-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'No'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="extra-pics-no"
                                  className={`h-3.5 w-3.5 ${extraIntraOralPictures === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${extraIntraOralPictures === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                              <Label
                                htmlFor="extra-pics-na"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'N/A'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="N/A"
                                  id="extra-pics-na"
                                  className={`h-3.5 w-3.5 ${extraIntraOralPictures === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${extraIntraOralPictures === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  N/A
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Facial Scan */}
                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-orange-100">
                          <Label className="text-sm font-medium text-amber-900">Facial Scan</Label>
                          <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor="facial-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                  ? 'bg-green-100 border-green-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="facial-yes"
                                  className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="facial-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="facial-no"
                                  className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                              <Label
                                htmlFor="facial-na"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'N/A'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="N/A"
                                  id="facial-na"
                                  className={`h-3.5 w-3.5 ${facialScan === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${facialScan === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  N/A
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Post Surgery Jaw Records */}
                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-orange-100">
                          <Label className="text-sm font-medium text-amber-900">Post Surgery Jaw Records</Label>
                          <RadioGroup value={postSurgeryJawRecords} onValueChange={setPostSurgeryJawRecords}>
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor="jaw-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'Yes'
                                  ? 'bg-green-100 border-green-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="jaw-yes"
                                  className={`h-3.5 w-3.5 ${postSurgeryJawRecords === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${postSurgeryJawRecords === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="jaw-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'No'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="jaw-no"
                                  className={`h-3.5 w-3.5 ${postSurgeryJawRecords === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${postSurgeryJawRecords === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                              <Label
                                htmlFor="jaw-na"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'N/A'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="N/A"
                                  id="jaw-na"
                                  className={`h-3.5 w-3.5 ${postSurgeryJawRecords === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${postSurgeryJawRecords === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  N/A
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Tissue Scan */}
                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-orange-100">
                          <Label className="text-sm font-medium text-amber-900">Tissue Scan</Label>
                          <RadioGroup value={tissueScan} onValueChange={setTissueScan}>
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor="tissue-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'Yes'
                                  ? 'bg-green-100 border-green-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="tissue-yes"
                                  className={`h-3.5 w-3.5 ${tissueScan === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${tissueScan === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="tissue-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'No'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="tissue-no"
                                  className={`h-3.5 w-3.5 ${tissueScan === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${tissueScan === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                              <Label
                                htmlFor="tissue-na"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'N/A'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="N/A"
                                  id="tissue-na"
                                  className={`h-3.5 w-3.5 ${tissueScan === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${tissueScan === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  N/A
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* ICAM Required */}
                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-md border border-orange-100">
                          <Label className="text-sm font-medium text-amber-900">ICAM Required</Label>
                          <RadioGroup value={icamRequired} onValueChange={setIcamRequired}>
                            <div className="flex items-center gap-1.5">
                              <Label
                                htmlFor="icam-req-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'Yes'
                                  ? 'bg-green-100 border-green-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="icam-req-yes"
                                  className={`h-3.5 w-3.5 ${icamRequired === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${icamRequired === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="icam-req-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'No'
                                  ? 'bg-red-50 border-red-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="icam-req-no"
                                  className={`h-3.5 w-3.5 ${icamRequired === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${icamRequired === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                  No
                                </span>
                              </Label>
                              <Label
                                htmlFor="icam-req-na"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'N/A'
                                  ? 'bg-gray-100 border-gray-500 shadow-sm'
                                  : 'bg-white border-orange-200 hover:border-gray-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="N/A"
                                  id="icam-req-na"
                                  className={`h-3.5 w-3.5 ${icamRequired === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${icamRequired === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                  N/A
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* Third Row: Clinical Notes */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-900">Clinical Notes</h3>
                  <div className="space-y-2">
                    <Label htmlFor="clinical-notes" className="text-xs font-medium text-blue-700">
                      Additional notes or observations from this encounter
                    </Label>
                    <textarea
                      id="clinical-notes"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Enter any clinical notes, observations, or additional information about this encounter..."
                      className={`w-full min-h-[120px] px-3 py-2 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y ${showViewMode ? 'bg-gray-50' : 'bg-white'}`}
                      rows={5}
                    />
                  </div>
                </div>

                {/* Recordings Section */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 pointer-events-auto">
                  <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Recordings
                  </h3>
                  {appointmentId && (
                    <RecordingsList
                      key={refreshRecordingsTrigger}
                      appointmentId={appointmentId}
                      patientName={patientName || "Patient"}
                      isReadOnly={!!showViewMode}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-between gap-3">
              <div>
                {showViewMode && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isEditMode) {
                      // Reload encounter data to discard unsaved changes
                      fetchEncounterData();
                      setIsEditMode(false);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                  disabled={saving}
                >
                  {showViewMode ? 'Close' : isEditMode ? 'Cancel Edit' : 'Cancel'}
                </Button>
                {!showViewMode && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Encounter'
                    )}
                  </Button>
                )}
              </div>
            </div>

            <RecordingConsentDialog
              isOpen={showRecordingConsentDialog}
              onClose={() => setShowRecordingConsentDialog(false)}
              onConsent={() => { }}
              onRecordingStart={startRecording}
              patientName={patientName || "Patient"}
              mode="encounter"
            />
          </>
        )}

        <Dialog open={showRecordingStatusDialog} onOpenChange={setShowRecordingStatusDialog}>
          <DialogContent className="max-w-[340px] p-6 rounded-3xl border-none shadow-2xl bg-white outline-none" hideCloseButton={true}>
            <div className="flex flex-col items-center justify-center text-center">

              {/* Uploading State */}
              {recordingStatusState === 'uploading' && (
                <div className="py-4 space-y-6 w-full">
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
                    <div className="relative bg-white rounded-full p-3.5 shadow-lg ring-1 ring-black/5">
                      <CloudUpload className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900">Saving Recording...</h3>
                    <p className="text-sm font-medium text-gray-500">Syncing audio to secure storage</p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {recordingStatusState === 'success' && (
                <div className="py-4 space-y-6 w-full">
                  <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center shadow-sm border border-green-100">
                    <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900">Saved Successfully!</h3>
                    <p className="text-sm font-medium text-green-600">{recordingStatusMessage}</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {recordingStatusState === 'error' && (
                <div className="py-4 space-y-4 w-full">
                  <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900">Save Failed</h3>
                    <p className="text-sm font-medium text-red-500">{recordingStatusMessage}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowRecordingStatusDialog(false)}
                    className="mt-2 rounded-full w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold h-11"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
