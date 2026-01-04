import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/SignaturePad";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  // Form status
  const [formStatus, setFormStatus] = useState<'draft' | 'complete'>('draft');
  const [consultationData, setConsultationData] = useState<any>(null);

  // Fetch patient details and encounter data when dialog opens
  useEffect(() => {
    if (open && patientName) {
      fetchPatientDetails();
      fetchAppointmentDetails();
      fetchPatientDetails();
      fetchAppointmentDetails();
      fetchEncounterData();
      fetchConsultationData();
    }
  }, [open, patientName, appointmentId]);

  const fetchConsultationData = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (data) {
        setConsultationData(data);
        // Sync patientAcceptedTreatment state for existing logic compatibility
        if (data.treatment_decision === 'accepted') {
          setPatientAcceptedTreatment('Yes');
        } else {
          setPatientAcceptedTreatment('No');
        }
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
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
        smoker_signature_date: smokerSignatureDate
      };

      // Add assessment/encounter details if NOT surgery and NOT consultation (where they aren't visible or needed)
      if (appointmentDetails?.appointment_type !== 'surgery' &&
        appointmentDetails?.appointment_type !== 'surgical-revision' &&
        appointmentDetails?.appointment_type !== 'consultation') {
        encounterData.bite_adjustment = biteAdjustment;
        encounterData.follow_up_pictures_taken = followUpPictures;
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
      }

      console.log('📝 Encounter data to save:', encounterData);

      // Add 7-day-followup and 30-day-followup specific fields if applicable
      if (appointmentDetails?.appointment_type === 'follow-up') {
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
      }

      // Add 75-day-data-collection, final-data-collection, and data-collection-printed-try-in staff checklist fields if applicable
      if (appointmentDetails?.subtype === '75-day-data-collection' ||
        appointmentDetails?.subtype === 'final-data-collection' ||
        appointmentDetails?.subtype === 'data-collection-printed-try-in') {
        encounterData.extra_intra_oral_pictures = extraIntraOralPictures;
        encounterData.facial_scan = facialScan;
        encounterData.post_surgery_jaw_records = postSurgeryJawRecords;
        encounterData.tissue_scan = tissueScan;
        encounterData.icam_required = icamRequired;
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

        toast({
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

        toast({
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
      toast({
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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col touch-manipulation p-0">
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
                          value={patientDetails?.full_name || 'N/A'}
                          disabled
                          className="bg-white cursor-not-allowed h-7 text-xs border-blue-200 flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-blue-700 w-20 flex-shrink-0">DOB:</Label>
                        <Input
                          value={formatDate(patientDetails?.date_of_birth || null)}
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

                  {/* Treatment Accepted Checklist - New Section */}
                  {appointmentDetails?.appointment_type === 'consultation' && (consultationData?.treatment_decision === 'accepted' || patientAcceptedTreatment === 'Yes') && (
                    <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h3 className="text-lg font-bold text-blue-900 border-l-4 border-blue-500 pl-3 py-1 mb-6">
                        Treatment Accepted Checklist
                      </h3>

                      <div className="space-y-6">
                        {[
                          { label: 'IV sedation consult', value: ivSedationConsult, setter: setIvSedationConsult },
                          { label: 'Head and neck examination', value: headAndNeckExam, setter: setHeadAndNeckExam },
                          { label: 'Record collection (Data collection sheet)', value: recordCollection, setter: setRecordCollection },
                          { label: 'Administrative forms', value: administrativeForms, setter: setAdministrativeForms },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between pb-4 border-b border-blue-100 last:border-0 last:pb-0">
                            <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                              {item.label}
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={item.value === option ? 'default' : 'outline'}
                                  onClick={() => {
                                    if (item.value === option) {
                                      // Unselect if already selected
                                      item.setter('');
                                    } else {
                                      // Select
                                      item.setter(option);
                                    }
                                  }}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${item.value === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Encounter Form Fields - Left Column - Hide for surgery and consultation appointments */}
                  {appointmentDetails?.appointment_type !== 'surgery' &&
                    appointmentDetails?.appointment_type !== 'surgical-revision' &&
                    appointmentDetails?.appointment_type !== 'consultation' && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold mb-6 text-blue-900">Encounter Details</h3>

                        <div className="space-y-3">
                          {/* Bite Adjustment */}
                          <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                            <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                              Is bite adjustment made?
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={biteAdjustment === option ? 'default' : 'outline'}
                                  onClick={() => biteAdjustment === option ? setBiteAdjustment('') : setBiteAdjustment(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${biteAdjustment === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Follow-up Pictures */}
                          <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                            <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                              Are follow-up pictures taken?
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={followUpPictures === option ? 'default' : 'outline'}
                                  onClick={() => followUpPictures === option ? setFollowUpPictures('') : setFollowUpPictures(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${followUpPictures === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Data Collection */}
                          <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                            <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                              Data collection
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={dataCollection === option ? 'default' : 'outline'}
                                  onClick={() => dataCollection === option ? setDataCollection('') : setDataCollection(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${dataCollection === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Is New Design Required */}
                          <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                            <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                              Is New Design Required?
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={newDesignRequired === option ? 'default' : 'outline'}
                                  onClick={() => newDesignRequired === option ? setNewDesignRequired('') : setNewDesignRequired(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${newDesignRequired === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      'bg-red-600 border-red-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Follow-up Specific Questions - Right Column */}
                  {(appointmentDetails?.appointment_type === 'follow-up') && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold mb-6 text-blue-900">
                        {appointmentDetails?.subtype === '7-day-followup'
                          ? '7-Day Follow-up Assessment'
                          : appointmentDetails?.subtype === '30-day-followup'
                            ? '30-Day Follow-up Assessment'
                            : 'Follow-up Assessment'}
                      </h3>

                      <div className="space-y-3">
                        {/* How is the Bite */}
                        <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                          <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                            How is the Bite?
                          </Label>
                          <div className="flex gap-2 shrink-0">
                            {['Good', 'Fair', 'Poor'].map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant={howIsTheBite === option ? 'default' : 'outline'}
                                onClick={() => howIsTheBite === option ? setHowIsTheBite('') : setHowIsTheBite(option)}
                                className={`w-16 h-10 text-sm font-medium transition-all border-2 ${howIsTheBite === option
                                  ? option === 'Good' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                    option === 'Fair' ? 'bg-yellow-600 border-yellow-600 text-white shadow-md' :
                                      'bg-red-600 border-red-600 text-white shadow-md'
                                  : option === 'Good' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                    option === 'Fair' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300' :
                                      'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300'
                                  }`}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Speech Issue */}
                        <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                          <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                            Does the patient have any speech issue?
                          </Label>
                          <div className="flex gap-2 shrink-0">
                            {['Yes', 'No'].map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant={speechIssue === option ? 'default' : 'outline'}
                                onClick={() => speechIssue === option ? setSpeechIssue('') : setSpeechIssue(option)}
                                className={`w-16 h-10 text-sm font-medium transition-all border-2 ${speechIssue === option
                                  ? option === 'Yes' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                    'bg-green-600 border-green-600 text-white shadow-md'
                                  : option === 'Yes' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                    'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                  }`}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Intaglio Gap */}
                        <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                          <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                            Is there an intaglio gap?
                          </Label>
                          <div className="flex gap-2 shrink-0">
                            {['Yes', 'No'].map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant={intaglioGap === option ? 'default' : 'outline'}
                                onClick={() => intaglioGap === option ? setIntaglioGap('') : setIntaglioGap(option)}
                                className={`w-16 h-10 text-sm font-medium transition-all border-2 ${intaglioGap === option
                                  ? option === 'Yes' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                    'bg-green-600 border-green-600 text-white shadow-md'
                                  : option === 'Yes' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                    'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                  }`}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Functional Issue */}
                        <div className="flex items-center justify-between py-2 border-b border-blue-100/50">
                          <Label className="text-base font-medium text-blue-900 leading-tight pr-4">
                            Does the patient have any functional issue?
                          </Label>
                          <div className="flex gap-2 shrink-0">
                            {['Yes', 'No'].map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant={functionalIssue === option ? 'default' : 'outline'}
                                onClick={() => functionalIssue === option ? setFunctionalIssue('') : setFunctionalIssue(option)}
                                className={`w-16 h-10 text-sm font-medium transition-all border-2 ${functionalIssue === option
                                  ? option === 'Yes' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                    'bg-green-600 border-green-600 text-white shadow-md'
                                  : option === 'Yes' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                    'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                  }`}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          {/* Data Collection Sheet */}
                          <div className="flex items-center justify-between py-2 border-b border-green-100/50">
                            <Label className="text-xs font-semibold text-green-900 pr-4">
                              1. Data Collection sheet
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={surgeryDataCollectionSheet === option ? 'default' : 'outline'}
                                  onClick={() => surgeryDataCollectionSheet === option ? setSurgeryDataCollectionSheet('') : setSurgeryDataCollectionSheet(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${surgeryDataCollectionSheet === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* IV Sedation Flow Chart */}
                          <div className="flex items-center justify-between py-2 border-b border-green-100/50">
                            <Label className="text-xs font-semibold text-green-900 pr-4">
                              2. IV Sedation flow chart
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={surgeryIvSedationFlowChart === option ? 'default' : 'outline'}
                                  onClick={() => surgeryIvSedationFlowChart === option ? setSurgeryIvSedationFlowChart('') : setSurgeryIvSedationFlowChart(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${surgeryIvSedationFlowChart === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Surgical Recall Sheet */}
                          <div className="flex items-center justify-between py-2 border-b border-green-100/50">
                            <Label className="text-xs font-semibold text-green-900 pr-4">
                              3. Surgical recall Sheet
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={surgerySurgicalRecallSheet === option ? 'default' : 'outline'}
                                  onClick={() => surgerySurgicalRecallSheet === option ? setSurgerySurgicalRecallSheet('') : setSurgerySurgicalRecallSheet(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${surgerySurgicalRecallSheet === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Lab Script */}
                          <div className="flex items-center justify-between py-2 border-b border-green-100/50">
                            <Label className="text-xs font-semibold text-green-900 pr-4">
                              4. Lab script
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={surgeryLabScript === option ? 'default' : 'outline'}
                                  onClick={() => surgeryLabScript === option ? setSurgeryLabScript('') : setSurgeryLabScript(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${surgeryLabScript === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Staff Checklist - Show only for 75-day-data-collection, final-data-collection, and data-collection-printed-try-in */}
                  {(appointmentDetails?.subtype === '75-day-data-collection' ||
                    appointmentDetails?.subtype === 'final-data-collection' ||
                    appointmentDetails?.subtype === 'data-collection-printed-try-in') && (
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-300">
                        <h3 className="text-lg font-semibold mb-6 text-amber-900">Staff Checklist</h3>

                        <div className="space-y-3">
                          {/* Extra Intra Oral Pictures */}
                          <div className="flex items-center justify-between py-2 border-b border-orange-200">
                            <Label className="text-sm font-medium text-amber-900 pr-4">
                              Extra Intra Oral Pictures
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={extraIntraOralPictures === option ? 'default' : 'outline'}
                                  onClick={() => extraIntraOralPictures === option ? setExtraIntraOralPictures('') : setExtraIntraOralPictures(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${extraIntraOralPictures === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Facial Scan */}
                          <div className="flex items-center justify-between py-2 border-b border-orange-200">
                            <Label className="text-sm font-medium text-amber-900 pr-4">
                              Facial Scan
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={facialScan === option ? 'default' : 'outline'}
                                  onClick={() => facialScan === option ? setFacialScan('') : setFacialScan(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${facialScan === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Post Surgery Jaw Records */}
                          <div className="flex items-center justify-between py-2 border-b border-orange-200">
                            <Label className="text-sm font-medium text-amber-900 pr-4">
                              Post Surgery Jaw Records
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={postSurgeryJawRecords === option ? 'default' : 'outline'}
                                  onClick={() => postSurgeryJawRecords === option ? setPostSurgeryJawRecords('') : setPostSurgeryJawRecords(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${postSurgeryJawRecords === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Tissue Scan */}
                          <div className="flex items-center justify-between py-2 border-b border-orange-200">
                            <Label className="text-sm font-medium text-amber-900 pr-4">
                              Tissue Scan
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={tissueScan === option ? 'default' : 'outline'}
                                  onClick={() => tissueScan === option ? setTissueScan('') : setTissueScan(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${tissueScan === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* ICAM Required */}
                          <div className="flex items-center justify-between py-2 border-b border-orange-200">
                            <Label className="text-sm font-medium text-amber-900 pr-4">
                              ICAM Required
                            </Label>
                            <div className="flex gap-2 shrink-0">
                              {['Yes', 'No', 'N/A'].map((option) => (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={icamRequired === option ? 'default' : 'outline'}
                                  onClick={() => icamRequired === option ? setIcamRequired('') : setIcamRequired(option)}
                                  className={`w-16 h-10 text-sm font-medium transition-all border-2 ${icamRequired === option
                                    ? option === 'Yes' ? 'bg-green-600 border-green-600 text-white shadow-md' :
                                      option === 'No' ? 'bg-red-600 border-red-600 text-white shadow-md' :
                                        'bg-gray-600 border-gray-600 text-white shadow-md'
                                    : option === 'Yes' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' :
                                      option === 'No' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' :
                                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
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
          </>
        )
        }
      </DialogContent >
    </Dialog >
  );
}

