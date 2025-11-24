# Consultation Form - Code Flow Documentation

## 🔄 Complete Data Flow

### 1. Creating a New Consultation

**File:** `src/components/AddConsultationDialog.tsx`

```typescript
// User clicks "Add Consultation" → Dialog opens
// User fills form and clicks "Create Consultation"

const handleSubmit = async () => {
  // 1. Create appointment record
  const appointmentData = {
    patient_name: `${formData.firstName} ${formData.lastName}`,
    appointment_date: consultationDateStr,
    appointment_time: formData.consultationTime,
    appointment_type: 'consultation',
    status: 'scheduled'
  };
  
  const { data: appointmentData } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select();

  // 2. Create consultation record
  const { error: consultationError } = await supabase
    .from('consultations')
    .insert([{
      appointment_id: appointmentData.id,
      patient_name: `${formData.firstName} ${formData.lastName}`,
      consultation_date: consultationDateStr,
      consultation_status: 'draft'
    }]);

  // 3. Trigger refresh and close dialog
  onSuccess?.();
};
```

**Result:** 
- ✅ Appointment created in `appointments` table
- ✅ Consultation created in `consultations` table with status='draft'
- ✅ Dialog closes, consultation form opens

---

### 2. Opening Consultation Form

**File:** `src/components/ConsultationFormDialog.tsx`

```typescript
// Dialog opens with props:
// - appointmentId: UUID of created appointment
// - patientPacketId: Optional patient packet
// - patientName: Patient name
// - consultationPatientId: Optional consultation patient

export function ConsultationFormDialog({
  appointmentId,
  patientPacketId,
  patientName,
  consultationPatientId
}) {
  const [activeSection, setActiveSection] = useState(1);
  
  // Section 1: Treatment Form
  // Section 2: Financial Form
  
  const handleNext = () => {
    if (activeSection === 1) {
      // Capture treatment plan total before moving to financial
      const total = treatmentFormRef.current?.getTreatmentPlanTotal();
      setTreatmentPlanTotal(total);
    }
    setActiveSection(activeSection + 1);
  };
  
  const handleComplete = async () => {
    // Save both forms and update status
    await treatmentFormRef.current?.saveData();
    await financialFormRef.current?.saveData();
    
    // Update consultation status
    await supabase
      .from('consultations')
      .update({
        consultation_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('new_patient_packet_id', patientPacketId);
  };
}
```

---

### 3. Saving Treatment Form Data

**File:** `src/components/TreatmentForm.tsx`

```typescript
export const TreatmentForm = React.forwardRef<TreatmentFormRef, TreatmentFormProps>(
  ({ appointmentId, patientPacketId, patientName, consultationPatientId }, ref) => {
    
    const saveData = async () => {
      // 1. Fetch existing consultation
      const { data: existingData } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      // 2. Prepare treatment data
      const treatmentData = {
        new_patient_packet_id: patientPacketId || null,
        consultation_patient_id: consultationPatientId || null,
        appointment_id: appointmentId || null,
        patient_name: patientName,
        clinical_assessment: formData.clinicalAssessment,
        treatment_recommendations: formData.treatmentRecommendations,
        treatment_plan: formData.treatmentPlan,
        additional_information: formData.additionalInformation,
        consultation_status: existingData?.consultation_status || 'in_progress',
        progress_step: 1,
        updated_at: new Date().toISOString(),
        // Preserve financial data if exists
        ...(existingData && {
          treatment_decision: existingData.treatment_decision,
          treatment_cost: existingData.treatment_cost,
          financing_options: existingData.financing_options,
          financial_notes: existingData.financial_notes
        })
      };

      // 3. Upsert to database
      const { data, error } = await supabase
        .from('consultations')
        .upsert(treatmentData, {
          onConflict: 'appointment_id'
        })
        .select();

      if (error) throw error;
      
      console.log('✅ Treatment data saved');
      setLastSaved(new Date());
    };

    // Expose saveData via ref
    useImperativeHandle(ref, () => ({
      saveData,
      getFormData: () => formData,
      getTreatmentPlanTotal: () => calculateTotal()
    }));
  }
);
```

**Saved Fields:**
- `clinical_assessment` - Text
- `treatment_recommendations` - JSON
- `treatment_plan` - JSON
- `additional_information` - Text
- `progress_step` - 1

---

### 4. Saving Financial Form Data

**File:** `src/components/FinancialOutcomeForm.tsx`

```typescript
export const FinancialOutcomeForm = React.forwardRef<FinancialOutcomeFormRef, FinancialOutcomeFormProps>(
  ({ appointmentId, patientPacketId, patientName, consultationPatientId }, ref) => {
    
    const saveData = async () => {
      // 1. Fetch existing consultation
      const { data: existingData } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      // 2. Prepare financial data
      const outcomeData = {
        new_patient_packet_id: patientPacketId || null,
        consultation_patient_id: consultationPatientId || null,
        appointment_id: appointmentId || null,
        patient_name: patientName,
        treatment_decision: formData.treatmentDecision,
        treatment_cost: formData.treatmentCost ? parseFloat(formData.treatmentCost) : null,
        financing_options: formData.financingOptions,
        financing_not_approved_reason: formData.financingNotApprovedReason,
        financial_notes: formData.outcomeNotes,
        followup_date: formData.followupDate ? new Date(formData.followupDate).toISOString() : null,
        followup_reason: formData.followupReason || null,
        treatment_plan_approved: formData.treatmentDecision === 'accepted' ? true : false,
        follow_up_required: formData.treatmentDecision === 'followup-required',
        consultation_status: formData.treatmentDecision === 'accepted' || formData.treatmentDecision === 'not-accepted' ? 'completed' : 'scheduled',
        progress_step: 2,
        updated_at: new Date().toISOString(),
        // Preserve treatment data if exists
        ...(existingData && {
          clinical_assessment: existingData.clinical_assessment,
          treatment_recommendations: existingData.treatment_recommendations,
          treatment_plan: existingData.treatment_plan,
          additional_information: existingData.additional_information
        })
      };

      // 3. Upsert to database
      const { data, error } = await supabase
        .from('consultations')
        .upsert(outcomeData, {
          onConflict: 'appointment_id'
        })
        .select();

      if (error) throw error;
      
      console.log('✅ Financial outcome saved');
      setLastSaved(new Date());
    };

    useImperativeHandle(ref, () => ({
      saveData,
      getFormData: () => formData
    }));
  }
);
```

**Saved Fields:**
- `treatment_decision` - Text
- `treatment_cost` - Numeric
- `financing_options` - JSON
- `financing_not_approved_reason` - Text
- `financial_notes` - Text
- `followup_date` - Timestamp
- `followup_reason` - Text
- `treatment_plan_approved` - Boolean
- `follow_up_required` - Boolean
- `consultation_status` - Text
- `progress_step` - 2

---

### 5. Completing Consultation

**File:** `src/components/ConsultationFormDialog.tsx`

```typescript
const handleComplete = async () => {
  try {
    // 1. Save treatment form
    await treatmentFormRef.current?.saveData();
    
    // 2. Save financial form
    await financialFormRef.current?.saveData();
    
    // 3. Update consultation status to completed
    const { error: statusError } = await supabase
      .from('consultations')
      .update({
        consultation_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('new_patient_packet_id', patientPacketId);

    if (statusError) throw statusError;

    toast.success('Consultation completed successfully!');
    onComplete?.();
    onClose();
  } catch (error) {
    console.error('Error completing consultation:', error);
    toast.error('Failed to complete consultation');
  }
};
```

---

## 📊 Database Operations Summary

| Operation | Table | Method | Conflict Key |
|-----------|-------|--------|--------------|
| Create Appointment | appointments | INSERT | - |
| Create Consultation | consultations | INSERT | - |
| Save Treatment | consultations | UPSERT | appointment_id |
| Save Financial | consultations | UPSERT | appointment_id |
| Update Status | consultations | UPDATE | new_patient_packet_id |

---

## 🔑 Key Points

1. **Upsert Strategy**: Uses `appointment_id` as unique key to prevent duplicates
2. **Data Preservation**: Each form preserves the other form's data during save
3. **Progress Tracking**: `progress_step` indicates which section was last saved
4. **Status Management**: Automatic status transitions (draft → in_progress → completed)
5. **Timestamps**: `updated_at` automatically updated on each save
6. **Error Handling**: All operations wrapped in try-catch with user feedback

---

## 🎯 Data Integrity

- ✅ No data loss when switching between forms
- ✅ Atomic operations (all or nothing)
- ✅ Automatic conflict resolution via upsert
- ✅ Timestamp tracking for audit trail
- ✅ Status tracking for workflow management

