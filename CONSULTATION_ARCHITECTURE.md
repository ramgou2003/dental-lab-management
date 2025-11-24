# Consultation Form Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSULTATION PAGE                         │
│  (src/pages/ConsultationPage.tsx)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ "Add Consultation" Button
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            ADD CONSULTATION DIALOG                           │
│  (src/components/AddConsultationDialog.tsx)                 │
│                                                              │
│  - Patient Type Selection (New/Consultation/Active)         │
│  - Patient Details Form                                     │
│  - Appointment Creation                                     │
│  - Consultation Record Creation                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Supabase Database     │
        │  - appointments        │
        │  - consultations       │
        └────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         CONSULTATION FORM DIALOG                             │
│  (src/components/ConsultationFormDialog.tsx)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Section 1: Treatment Form                            │  │
│  │ (src/components/TreatmentForm.tsx)                   │  │
│  │                                                       │  │
│  │ - Clinical Assessment                                │  │
│  │ - Treatment Recommendations                          │  │
│  │ - Treatment Plan (with procedures & costs)           │  │
│  │ - Additional Information                             │  │
│  │                                                       │  │
│  │ [Save Data] → Upsert to consultations table          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Section 2: Financial & Outcome Form                  │  │
│  │ (src/components/FinancialOutcomeForm.tsx)            │  │
│  │                                                       │  │
│  │ - Treatment Decision                                 │  │
│  │ - Treatment Cost                                     │  │
│  │ - Financing Options                                  │  │
│  │ - Follow-up Details                                  │  │
│  │                                                       │  │
│  │ [Save Data] → Upsert to consultations table          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Previous] [Next] [Complete]                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Supabase Database     │
        │  - consultations       │
        │  (all data saved)       │
        └────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
START
  │
  ├─ User navigates to Consultation Page
  │
  ├─ Clicks "Add Consultation"
  │
  ├─ AddConsultationDialog opens
  │  ├─ Select patient type
  │  ├─ Fill patient details
  │  └─ Click "Create Consultation"
  │
  ├─ Creates appointment record
  │  └─ INSERT into appointments table
  │
  ├─ Creates consultation record
  │  └─ INSERT into consultations table
  │     └─ consultation_status = 'draft'
  │
  ├─ ConsultationFormDialog opens
  │  └─ Section 1: Treatment Form
  │
  ├─ User fills Treatment Form
  │  ├─ Clinical Assessment
  │  ├─ Treatment Recommendations
  │  ├─ Treatment Plan
  │  └─ Additional Information
  │
  ├─ Clicks "Next"
  │  └─ TreatmentForm.saveData()
  │     ├─ Fetch existing consultation
  │     ├─ Prepare treatment data
  │     ├─ UPSERT to consultations table
  │     │  └─ onConflict: 'appointment_id'
  │     ├─ Preserve financial data
  │     └─ progress_step = 1
  │
  ├─ Section 2: Financial Form
  │
  ├─ User fills Financial Form
  │  ├─ Treatment Decision
  │  ├─ Treatment Cost
  │  ├─ Financing Options
  │  └─ Follow-up Details
  │
  ├─ Clicks "Complete Consultation"
  │  ├─ TreatmentForm.saveData() (if not saved)
  │  ├─ FinancialOutcomeForm.saveData()
  │  │  ├─ Fetch existing consultation
  │  │  ├─ Prepare financial data
  │  │  ├─ UPSERT to consultations table
  │  │  │  └─ onConflict: 'appointment_id'
  │  │  ├─ Preserve treatment data
  │  │  └─ progress_step = 2
  │  │
  │  └─ UPDATE consultation_status = 'completed'
  │
  ├─ Toast: "Consultation completed successfully!"
  │
  ├─ Dialog closes
  │
  └─ END
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSULTATIONS TABLE                       │
├─────────────────────────────────────────────────────────────┤
│ IDENTIFIERS                                                  │
│ ├─ id (UUID) PRIMARY KEY                                    │
│ ├─ appointment_id (UUID) UNIQUE                             │
│ ├─ consultation_patient_id (UUID)                           │
│ ├─ new_patient_packet_id (UUID)                             │
│ └─ patient_id (UUID)                                        │
├─────────────────────────────────────────────────────────────┤
│ PATIENT INFO                                                 │
│ ├─ patient_name (TEXT)                                      │
│ └─ consultation_date (TIMESTAMP)                            │
├─────────────────────────────────────────────────────────────┤
│ TREATMENT SECTION (Form 1)                                  │
│ ├─ clinical_assessment (TEXT)                               │
│ ├─ treatment_recommendations (JSONB)                        │
│ ├─ treatment_plan (JSONB)                                   │
│ └─ additional_information (TEXT)                            │
├─────────────────────────────────────────────────────────────┤
│ FINANCIAL SECTION (Form 2)                                  │
│ ├─ treatment_decision (TEXT)                                │
│ ├─ treatment_cost (NUMERIC)                                 │
│ ├─ financing_options (JSONB)                                │
│ ├─ financing_not_approved_reason (TEXT)                     │
│ ├─ financial_notes (TEXT)                                   │
│ ├─ followup_date (TIMESTAMP)                                │
│ ├─ followup_reason (TEXT)                                   │
│ ├─ treatment_plan_approved (BOOLEAN)                        │
│ └─ follow_up_required (BOOLEAN)                             │
├─────────────────────────────────────────────────────────────┤
│ STATUS & TRACKING                                            │
│ ├─ consultation_status (TEXT)                               │
│ │  └─ Values: 'draft', 'in_progress', 'completed'          │
│ ├─ progress_step (INTEGER)                                  │
│ │  └─ Values: 1 (Treatment), 2 (Financial)                 │
│ ├─ created_at (TIMESTAMP)                                   │
│ ├─ updated_at (TIMESTAMP)                                   │
│ └─ completed_at (TIMESTAMP)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Hierarchy

```
ConsultationPage
├─ PageHeader
│  └─ "Add Consultation" Button
│
├─ AddConsultationDialog
│  ├─ Patient Type Selector
│  ├─ Patient Search (for existing patients)
│  └─ Patient Details Form
│
└─ ConsultationTable
   └─ Consultation List

ConsultationFormDialog (Modal)
├─ Section Navigation
│  ├─ Section 1: Treatment
│  └─ Section 2: Financial
│
├─ TreatmentForm (Ref)
│  ├─ Clinical Assessment Input
│  ├─ Treatment Recommendations
│  ├─ Treatment Plan Builder
│  │  └─ Add/Edit/Delete Treatments
│  └─ Additional Information
│
├─ FinancialOutcomeForm (Ref)
│  ├─ Treatment Decision Selector
│  ├─ Treatment Cost Input
│  ├─ Financing Options
│  ├─ Follow-up Details
│  └─ Outcome Notes
│
└─ Action Buttons
   ├─ Previous
   ├─ Next
   └─ Complete
```

---

## 🔑 Key Operations

### Operation 1: Upsert Treatment Data
```
UPSERT consultations
SET clinical_assessment = '...',
    treatment_recommendations = {...},
    treatment_plan = {...},
    additional_information = '...',
    progress_step = 1,
    updated_at = NOW()
WHERE appointment_id = 'xxx'
```

### Operation 2: Upsert Financial Data
```
UPSERT consultations
SET treatment_decision = '...',
    treatment_cost = 5000,
    financing_options = {...},
    financial_notes = '...',
    progress_step = 2,
    consultation_status = 'completed',
    updated_at = NOW()
WHERE appointment_id = 'xxx'
```

### Operation 3: Update Status
```
UPDATE consultations
SET consultation_status = 'completed',
    updated_at = NOW()
WHERE new_patient_packet_id = 'xxx'
```

---

## 🎯 Data Integrity Strategy

```
┌─────────────────────────────────────────┐
│  Upsert with Conflict Resolution        │
├─────────────────────────────────────────┤
│                                         │
│  Key: appointment_id (UNIQUE)           │
│                                         │
│  If record exists:                      │
│  └─ UPDATE existing record              │
│     └─ Preserve other form's data       │
│                                         │
│  If record doesn't exist:               │
│  └─ INSERT new record                   │
│                                         │
│  Result: No duplicates, no data loss    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📱 User Journey

```
1. CONSULTATION PAGE
   └─ View list of consultations
   └─ Click "Add Consultation"

2. ADD CONSULTATION DIALOG
   └─ Select patient type
   └─ Fill patient details
   └─ Click "Create Consultation"

3. CONSULTATION FORM - SECTION 1
   └─ Fill Treatment Form
   └─ Click "Next"

4. CONSULTATION FORM - SECTION 2
   └─ Fill Financial Form
   └─ Click "Complete Consultation"

5. SUCCESS
   └─ Toast notification
   └─ Dialog closes
   └─ Data saved to Supabase
   └─ Return to Consultation Page
```

---

## ✅ Validation Points

```
AddConsultationDialog
├─ First Name: Required
├─ Last Name: Required
├─ Date of Birth: Required
├─ Gender: Required
├─ Consultation Date: Required
└─ Consultation Time: Required

TreatmentForm
├─ Clinical Assessment: Optional
├─ Arch Type: Required if treatments selected
├─ Treatment Plan: Optional
└─ Additional Information: Optional

FinancialOutcomeForm
├─ Treatment Decision: Required
├─ Treatment Cost: Required if accepted
├─ Financing Options: Required if accepted
└─ Follow-up Details: Required if follow-up
```

---

## 🚀 Performance Optimizations

- ✅ Indexed columns: appointment_id, consultation_date, status
- ✅ JSONB columns for complex data
- ✅ Upsert operations (single query)
- ✅ Lazy loading of consultation data
- ✅ Ref-based form control (no re-renders)
- ✅ Automatic timestamp management

---

## 🔐 Security

- ✅ RLS policies on consultations table
- ✅ User authentication required
- ✅ Data validation on client and server
- ✅ Secure Supabase client configuration
- ✅ No sensitive data in logs

