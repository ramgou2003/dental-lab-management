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
  const [isPatientSmoker, setIsPatientSmoker] = useState<string>('');
  const [smokerDisclaimerAcknowledged, setSmokerDisclaimerAcknowledged] = useState<boolean>(false);
  const [smokerConsentDeclined, setSmokerConsentDeclined] = useState<boolean>(false);
  const [smokerSignatureDate, setSmokerSignatureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [smokerSignature, setSmokerSignature] = useState<string>('');
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

  // Staff checklist for 75-day data collection and final data collection
  const [extraIntraOralPictures, setExtraIntraOralPictures] = useState<string>('');
  const [facialScan, setFacialScan] = useState<string>('');
  const [postSurgeryJawRecords, setPostSurgeryJawRecords] = useState<string>('');
  const [tissueScan, setTissueScan] = useState<string>('');
  const [icamRequired, setIcamRequired] = useState<string>('');

  // Clinical notes
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Form status
  const [formStatus, setFormStatus] = useState<'draft' | 'complete'>('draft');

  // Fetch patient details and encounter data when dialog opens
  useEffect(() => {
    if (open && patientName) {
      fetchPatientDetails();
      fetchAppointmentDetails();
      fetchEncounterData();
    }
  }, [open, patientName, appointmentId]);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('full_name, date_of_birth, phone, email')
        .eq('full_name', patientName)
        .single();

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
        .from('appointments')
        .select('id, title, date, start_time, end_time, appointment_type, subtype, status, notes, assigned_user_id')
        .eq('id', appointmentId)
        .single();

      if (error) {
        console.error('Error fetching appointment details:', error);
        return;
      }

      if (data) {
        setAppointmentDetails(data);

        // Fetch assigned user name if assigned_user_id exists
        if (data.assigned_user_id) {
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', data.assigned_user_id)
            .single();

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
        .from('encounters')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

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
        setIsPatientSmoker(data.is_patient_smoker || '');
        setSmokerDisclaimerAcknowledged(data.smoker_disclaimer_acknowledged || false);
        setSmokerConsentDeclined(data.smoker_consent_declined || false);
        setSmokerSignatureDate(data.smoker_signature_date || new Date().toISOString().split('T')[0]);
        setSmokerSignature(data.smoker_signature || '');
        // 7-day-followup specific fields
        setHowIsTheBite(data.how_is_the_bite || '');
        setSpeechIssue(data.speech_issue || '');
        setIntaglioGap(data.intaglio_gap || '');
        setFunctionalIssue(data.functional_issue || '');
        // Surgery document checklist fields
        setSurgeryDataCollectionSheet(data.surgery_data_collection_sheet || '');
        setSurgeryIvSedationFlowChart(data.surgery_iv_sedation_flow_chart || '');
        setSurgerySurgicalRecallSheet(data.surgery_surgical_recall_sheet || '');
        // 75-day-followup staff checklist fields
        setExtraIntraOralPictures(data.extra_intra_oral_pictures || '');
        setFacialScan(data.facial_scan || '');
        setPostSurgeryJawRecords(data.post_surgery_jaw_records || '');
        setTissueScan(data.tissue_scan || '');
        setIcamRequired(data.icam_required || '');
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
        setIsPatientSmoker('');
        setSmokerDisclaimerAcknowledged(false);
        setSmokerConsentDeclined(false);
        setSmokerSignatureDate(new Date().toISOString().split('T')[0]);
        setSmokerSignature('');
        // 7-day-followup specific fields
        setHowIsTheBite('');
        setSpeechIssue('');
        setIntaglioGap('');
        setFunctionalIssue('');
        // Surgery document checklist fields
        setSurgeryDataCollectionSheet('');
        setSurgeryIvSedationFlowChart('');
        setSurgerySurgicalRecallSheet('');
        // 75-day-followup staff checklist fields
        setExtraIntraOralPictures('');
        setFacialScan('');
        setPostSurgeryJawRecords('');
        setTissueScan('');
        setIcamRequired('');
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
        bite_adjustment: biteAdjustment,
        follow_up_pictures_taken: followUpPictures,
        data_collection: dataCollection,
        new_design_required: newDesignRequired,
        is_patient_smoker: isPatientSmoker,
        smoker_disclaimer_acknowledged: smokerDisclaimerAcknowledged,
        smoker_consent_declined: smokerConsentDeclined,
        smoker_signature_date: smokerSignatureDate,
        smoker_signature: smokerSignature,
        clinical_notes: clinicalNotes,
        form_status: 'complete', // Automatically set to complete when saving
        updated_at: new Date().toISOString()
      };

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
        // Add assessment questions for surgery
        encounterData.how_is_the_bite = howIsTheBite;
        encounterData.speech_issue = speechIssue;
        encounterData.intaglio_gap = intaglioGap;
        encounterData.functional_issue = functionalIssue;
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
          .from('encounters')
          .update(encounterData)
          .eq('id', encounterId)
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Encounter updated successfully:', data);

        // Mark appointment as encounter completed
        const { data: { user } } = await supabase.auth.getUser();
        const { error: appointmentError } = await supabase
          .from('appointments')
          .update({
            encounter_completed: true,
            encounter_completed_at: new Date().toISOString(),
            encounter_completed_by: user?.id || null
          })
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
          .from('encounters')
          .insert([encounterData])
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Encounter created successfully:', data);

        setEncounterId(data.id);

        // Mark appointment as encounter completed
        const { data: { user } } = await supabase.auth.getUser();
        const { error: appointmentError } = await supabase
          .from('appointments')
          .update({
            encounter_completed: true,
            encounter_completed_at: new Date().toISOString(),
            encounter_completed_by: user?.id || null
          })
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
                  {/* Encounter Form Fields - Left Column - Hide for surgery appointments */}
                  {appointmentDetails?.appointment_type !== 'surgery' &&
                    appointmentDetails?.appointment_type !== 'surgical-revision' && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold mb-6 text-blue-900">Encounter Details</h3>

                        <div className="space-y-3">
                          {/* Bite Adjustment */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-blue-900">
                              Is bite adjustment made?
                            </Label>
                            <RadioGroup value={biteAdjustment} onValueChange={setBiteAdjustment}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="bite-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="bite-yes"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="bite-no"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="bite-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${biteAdjustment === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="bite-na"
                                    className={`h-3.5 w-3.5 ${biteAdjustment === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${biteAdjustment === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Follow-up Pictures */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-blue-900">
                              Are follow-up pictures taken?
                            </Label>
                            <RadioGroup value={followUpPictures} onValueChange={setFollowUpPictures}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="pictures-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${followUpPictures === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="pictures-yes"
                                    className={`h-3.5 w-3.5 ${followUpPictures === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${followUpPictures === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="pictures-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${followUpPictures === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="pictures-no"
                                    className={`h-3.5 w-3.5 ${followUpPictures === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${followUpPictures === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="pictures-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${followUpPictures === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="pictures-na"
                                    className={`h-3.5 w-3.5 ${followUpPictures === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${followUpPictures === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Data Collection */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-blue-900">
                              Data collection
                            </Label>
                            <RadioGroup value={dataCollection} onValueChange={setDataCollection}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="data-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="data-yes"
                                    className={`h-3.5 w-3.5 ${dataCollection === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${dataCollection === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="data-no"
                                    className={`h-3.5 w-3.5 ${dataCollection === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${dataCollection === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="data-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${dataCollection === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="data-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-blue-900">
                              Is New Design Required?
                            </Label>
                            <RadioGroup value={newDesignRequired} onValueChange={setNewDesignRequired}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="design-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${newDesignRequired === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="design-yes"
                                    className={`h-3.5 w-3.5 ${newDesignRequired === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${newDesignRequired === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="design-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${newDesignRequired === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="design-no"
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
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-blue-900">
                            How is the Bite?
                          </Label>
                          <RadioGroup value={howIsTheBite} onValueChange={setHowIsTheBite}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="bite-good"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Good'
                                    ? 'bg-green-50 border-green-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-green-300'
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
                                    : 'bg-white border-gray-200 hover:border-yellow-300'
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
                                    : 'bg-white border-gray-200 hover:border-red-300'
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
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-blue-900">
                            Does the patient have any speech issue?
                          </Label>
                          <RadioGroup value={speechIssue} onValueChange={setSpeechIssue}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="speech-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${speechIssue === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
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
                                    ? 'bg-green-50 border-green-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-green-300'
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
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-blue-900">
                            Is there an intaglio gap?
                          </Label>
                          <RadioGroup value={intaglioGap} onValueChange={setIntaglioGap}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="gap-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="Yes"
                                  id="gap-yes"
                                  className={`h-3.5 w-3.5 ${intaglioGap === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                />
                                <span className={`text-xs font-medium ${intaglioGap === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                  Yes
                                </span>
                              </Label>
                              <Label
                                htmlFor="gap-no"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'No'
                                    ? 'bg-green-50 border-green-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-green-300'
                                  }`}
                              >
                                <RadioGroupItem
                                  value="No"
                                  id="gap-no"
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
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-blue-900">
                            Does the patient have any functional issue?
                          </Label>
                          <RadioGroup value={functionalIssue} onValueChange={setFunctionalIssue}>
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <Label
                                htmlFor="functional-yes"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${functionalIssue === 'Yes'
                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-red-300'
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
                                    ? 'bg-green-50 border-green-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-green-300'
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
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold mb-6 text-green-900">Document Checklist</h3>

                        <div className="space-y-3">
                          <div className="mb-4">
                            <p className="text-xs text-green-700 mb-4">Are the following forms completed?</p>
                          </div>

                          {/* Data Collection Sheet */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              1. Data Collection sheet
                            </Label>
                            <RadioGroup value={surgeryDataCollectionSheet} onValueChange={setSurgeryDataCollectionSheet}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-data-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-data-yes"
                                    className={`h-3.5 w-3.5 ${surgeryDataCollectionSheet === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryDataCollectionSheet === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-data-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-data-no"
                                    className={`h-3.5 w-3.5 ${surgeryDataCollectionSheet === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryDataCollectionSheet === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-data-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryDataCollectionSheet === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="surgery-data-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              2. IV Sedation flow chart
                            </Label>
                            <RadioGroup value={surgeryIvSedationFlowChart} onValueChange={setSurgeryIvSedationFlowChart}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-iv-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-iv-yes"
                                    className={`h-3.5 w-3.5 ${surgeryIvSedationFlowChart === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryIvSedationFlowChart === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-iv-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-iv-no"
                                    className={`h-3.5 w-3.5 ${surgeryIvSedationFlowChart === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgeryIvSedationFlowChart === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-iv-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgeryIvSedationFlowChart === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="surgery-iv-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              3. Surgical recall Sheet
                            </Label>
                            <RadioGroup value={surgerySurgicalRecallSheet} onValueChange={setSurgerySurgicalRecallSheet}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-recall-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-recall-yes"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-recall-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-recall-no"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-recall-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${surgerySurgicalRecallSheet === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="surgery-recall-na"
                                    className={`h-3.5 w-3.5 ${surgerySurgicalRecallSheet === 'N/A' ? 'text-gray-600 border-gray-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${surgerySurgicalRecallSheet === 'N/A' ? 'text-gray-700' : 'text-gray-700'}`}>
                                    N/A
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Post Surgery Assessment Questions - Show only for surgery and surgical-revision */}
                  {(appointmentDetails?.appointment_type === 'surgery' ||
                    appointmentDetails?.appointment_type === 'surgical-revision') && (
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold mb-6 text-green-900">Post Surgery Assessment</h3>

                        <div className="space-y-3">
                          {/* How is the Bite */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              How is the Bite?
                            </Label>
                            <RadioGroup value={howIsTheBite} onValueChange={setHowIsTheBite}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-bite-good"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Good'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Good"
                                    id="surgery-bite-good"
                                    className={`h-3.5 w-3.5 ${howIsTheBite === 'Good' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${howIsTheBite === 'Good' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Good
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-bite-bad"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${howIsTheBite === 'Bad'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Bad"
                                    id="surgery-bite-bad"
                                    className={`h-3.5 w-3.5 ${howIsTheBite === 'Bad' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${howIsTheBite === 'Bad' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Bad
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Speech Issue */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              Speech Issue?
                            </Label>
                            <RadioGroup value={speechIssue} onValueChange={setSpeechIssue}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-speech-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${speechIssue === 'Yes'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-speech-yes"
                                    className={`h-3.5 w-3.5 ${speechIssue === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${speechIssue === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-speech-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${speechIssue === 'No'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-speech-no"
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
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              Intaglio Gap?
                            </Label>
                            <RadioGroup value={intaglioGap} onValueChange={setIntaglioGap}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-gap-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'Yes'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-gap-yes"
                                    className={`h-3.5 w-3.5 ${intaglioGap === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${intaglioGap === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-gap-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${intaglioGap === 'No'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-gap-no"
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
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-green-900">
                              Functional Issue?
                            </Label>
                            <RadioGroup value={functionalIssue} onValueChange={setFunctionalIssue}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="surgery-functional-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${functionalIssue === 'Yes'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="surgery-functional-yes"
                                    className={`h-3.5 w-3.5 ${functionalIssue === 'Yes' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${functionalIssue === 'Yes' ? 'text-red-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="surgery-functional-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${functionalIssue === 'No'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="surgery-functional-no"
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

                  {/* Staff Checklist - Show only for 75-day-data-collection, final-data-collection, and data-collection-printed-try-in */}
                  {(appointmentDetails?.subtype === '75-day-data-collection' ||
                    appointmentDetails?.subtype === 'final-data-collection' ||
                    appointmentDetails?.subtype === 'data-collection-printed-try-in') && (
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-300">
                        <h3 className="text-lg font-semibold mb-6 text-amber-900">Staff Checklist</h3>

                        <div className="space-y-3">
                          {/* Extra Intra Oral Pictures */}
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-amber-900">
                              Extra Intra Oral Pictures
                            </Label>
                            <RadioGroup value={extraIntraOralPictures} onValueChange={setExtraIntraOralPictures}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="extra-pictures-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="extra-pictures-yes"
                                    className={`h-3.5 w-3.5 ${extraIntraOralPictures === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${extraIntraOralPictures === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="extra-pictures-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="extra-pictures-no"
                                    className={`h-3.5 w-3.5 ${extraIntraOralPictures === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${extraIntraOralPictures === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="extra-pictures-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${extraIntraOralPictures === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="extra-pictures-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-amber-900">
                              Facial Scan
                            </Label>
                            <RadioGroup value={facialScan} onValueChange={setFacialScan}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="facial-scan-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="facial-scan-yes"
                                    className={`h-3.5 w-3.5 ${facialScan === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="facial-scan-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="facial-scan-no"
                                    className={`h-3.5 w-3.5 ${facialScan === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${facialScan === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="facial-scan-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${facialScan === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="facial-scan-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-amber-900">
                              Post Surgery Jaw Records
                            </Label>
                            <RadioGroup value={postSurgeryJawRecords} onValueChange={setPostSurgeryJawRecords}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="jaw-records-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="jaw-records-yes"
                                    className={`h-3.5 w-3.5 ${postSurgeryJawRecords === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${postSurgeryJawRecords === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="jaw-records-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="jaw-records-no"
                                    className={`h-3.5 w-3.5 ${postSurgeryJawRecords === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${postSurgeryJawRecords === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="jaw-records-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${postSurgeryJawRecords === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="jaw-records-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-amber-900">
                              Tissue Scan
                            </Label>
                            <RadioGroup value={tissueScan} onValueChange={setTissueScan}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="tissue-scan-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="tissue-scan-yes"
                                    className={`h-3.5 w-3.5 ${tissueScan === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${tissueScan === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="tissue-scan-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="tissue-scan-no"
                                    className={`h-3.5 w-3.5 ${tissueScan === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${tissueScan === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="tissue-scan-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${tissueScan === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="tissue-scan-na"
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
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-amber-900">
                              ICAM Required
                            </Label>
                            <RadioGroup value={icamRequired} onValueChange={setIcamRequired}>
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <Label
                                  htmlFor="icam-yes"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'Yes'
                                      ? 'bg-green-50 border-green-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="Yes"
                                    id="icam-yes"
                                    className={`h-3.5 w-3.5 ${icamRequired === 'Yes' ? 'text-green-600 border-green-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${icamRequired === 'Yes' ? 'text-green-700' : 'text-gray-700'}`}>
                                    Yes
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="icam-no"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'No'
                                      ? 'bg-red-50 border-red-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-red-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="No"
                                    id="icam-no"
                                    className={`h-3.5 w-3.5 ${icamRequired === 'No' ? 'text-red-600 border-red-600' : ''}`}
                                  />
                                  <span className={`text-xs font-medium ${icamRequired === 'No' ? 'text-red-700' : 'text-gray-700'}`}>
                                    No
                                  </span>
                                </Label>
                                <Label
                                  htmlFor="icam-na"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 cursor-pointer transition-all ${icamRequired === 'N/A'
                                      ? 'bg-gray-50 border-gray-500 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  <RadioGroupItem
                                    value="N/A"
                                    id="icam-na"
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

                {/* Second Row: Smoking Status */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-6 text-purple-900">Smoking Status</h3>

                  <div className="space-y-4">
                    {/* Is the Patient a Smoker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-purple-900">
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

                    {/* Show Nicotine Risks Information if Patient is a Smoker */}
                    {isPatientSmoker === 'Yes' && (
                      <div className="mt-4 space-y-4">
                        {/* Critical Information Alert */}
                        <div className="border-2 border-red-300 bg-red-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="text-red-600 text-xl flex-shrink-0">⚠️</span>
                            <div>
                              <h4 className="text-sm font-bold text-red-800 mb-1">Critical Information</h4>
                              <p className="text-xs text-red-700 font-medium">
                                All nicotine use must stop at least 3 weeks before surgery to prevent serious complications and implant failure.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Title */}
                        <div className="text-center py-2">
                          <h4 className="text-base font-bold text-gray-800">Understanding Nicotine Risks for Your Surgery</h4>
                        </div>

                        {/* Why This Matters */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">❤️</span>
                            <div>
                              <h5 className="text-sm font-semibold text-blue-900 mb-1">Why This Matters - We Want Your Surgery to Succeed</h5>
                              <p className="text-xs text-blue-800">
                                Your health and the success of your surgery are our top priorities. We're sharing this information because we want the best possible outcome for you.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* How Nicotine Affects Healing */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">🔬</span>
                            <div>
                              <h5 className="text-sm font-semibold text-blue-900 mb-1">How Nicotine Affects Your Healing</h5>
                              <p className="text-xs text-blue-800">
                                Nicotine narrows your blood vessels, reducing oxygen and nutrients to the surgical site. This makes it much harder for your body to heal properly.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Specific Risks */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">⚠️</span>
                            <div>
                              <h5 className="text-sm font-semibold text-red-900 mb-2">Specific Risks You Face</h5>
                              <ul className="text-xs text-red-800 space-y-1">
                                <li>• Complete implant failure requiring removal and replacement</li>
                                <li>• Wound healing problems, including wounds that won't close</li>
                                <li>• Loss of skin grafts or flaps</li>
                                <li>• Infection at the surgical site</li>
                                <li>• Need for additional surgeries</li>
                                <li>• Significant financial costs not covered by insurance</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Requirements */}
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-300">
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">📅</span>
                            <div>
                              <h5 className="text-sm font-semibold text-orange-900 mb-2">Required Timeline for Nicotine Cessation</h5>
                              <ul className="text-xs text-orange-800 space-y-1">
                                <li>• <strong>Before Surgery:</strong> Stop ALL nicotine use at least 3 weeks prior</li>
                                <li>• <strong>After Surgery:</strong> Continue nicotine-free until cleared by doctor</li>
                                <li>• <strong>Secondhand Smoke:</strong> Also avoid exposure throughout recovery</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Support Resources */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">🤝</span>
                            <div>
                              <h5 className="text-sm font-semibold text-green-900 mb-2">Free Support Available - You Don't Have to Do This Alone</h5>
                              <div className="text-xs text-green-800 space-y-1">
                                <p><strong>Program:</strong> Commit to Quit! by University of Rochester</p>
                                <p><strong>Phone:</strong> (585) 602-0720</p>
                                <p><strong>Email:</strong> healthyliving@urmc.rochester.edu</p>
                                <p><strong>Format:</strong> 6 virtual sessions</p>
                                <p><strong>Cost:</strong> FREE - No referral needed</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Encouragement Message */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium">
                            <strong>You Can Do This!</strong> Many of our patients have successfully quit nicotine before surgery. Taking this step not only improves your surgical outcome but also benefits your overall health. We're here to support you through this process.
                          </p>
                        </div>

                        {/* Disclaimer Acknowledgment */}
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="smoker-disclaimer"
                              checked={smokerDisclaimerAcknowledged}
                              onCheckedChange={(checked) => {
                                setSmokerDisclaimerAcknowledged(checked as boolean);
                                if (checked) setSmokerConsentDeclined(false);
                              }}
                              className="mt-1 border-blue-400 data-[state=checked]:bg-blue-600"
                            />
                            <Label
                              htmlFor="smoker-disclaimer"
                              className="text-xs text-blue-900 leading-relaxed cursor-pointer"
                            >
                              I understand that continuing nicotine use before or after surgery significantly increases my risk of complications, including complete implant failure, poor wound healing, infection, and the need for additional surgeries. I acknowledge that insurance may not cover costs related to complications caused by nicotine use. I have been informed of free cessation resources and understand that Dr. Charles STRONGLY recommends I stop all nicotine use at least 3 weeks before surgery and remain nicotine-free throughout my recovery period.
                            </Label>
                          </div>

                          {/* Decline Option */}
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="smoker-consent-declined"
                              checked={smokerConsentDeclined}
                              onCheckedChange={(checked) => {
                                setSmokerConsentDeclined(checked as boolean);
                                if (checked) setSmokerDisclaimerAcknowledged(false);
                              }}
                              className="mt-1 border-blue-400 data-[state=checked]:bg-blue-600"
                            />
                            <Label
                              htmlFor="smoker-consent-declined"
                              className="text-xs text-blue-900 leading-relaxed cursor-pointer font-medium"
                            >
                              No, I decline to sign the consent
                            </Label>
                          </div>

                          {/* Date and Signature Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                            {/* Date Field */}
                            <div className="space-y-2">
                              <Label htmlFor="smoker-signature-date" className="text-xs font-semibold text-blue-800">
                                Date
                              </Label>
                              <Input
                                id="smoker-signature-date"
                                type="date"
                                value={smokerSignatureDate}
                                onChange={(e) => setSmokerSignatureDate(e.target.value)}
                                className="text-xs h-8 border-blue-200 focus:border-blue-500"
                              />
                            </div>

                            {/* Signature Field */}
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-blue-800">
                                Patient Signature
                              </Label>
                              <SignaturePad
                                value={smokerSignature}
                                onSignatureChange={setSmokerSignature}
                                width={400}
                                height={150}
                                placeholder="Sign here"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}

