# Consultation Form Supabase Integration - Complete Setup Guide

## ✅ Status: FULLY CONFIGURED

Your consultation form system is **already fully integrated with Supabase**. All components are properly connected and ready to use.

---

## 📋 System Overview

### How It Works

1. **Add Consultation** → Creates appointment and consultation record
2. **Fill Treatment Form** → Saves clinical assessment and treatment plan
3. **Fill Financial Form** → Saves financial decisions and outcomes
4. **Complete** → All data persisted to Supabase

### Data Flow

```
AddConsultationDialog
    ↓
Creates Appointment + Consultation Record
    ↓
ConsultationFormDialog
    ├─ TreatmentForm (Section 1)
    │  └─ Saves: clinical_assessment, treatment_recommendations, treatment_plan
    │
    └─ FinancialOutcomeForm (Section 2)
       └─ Saves: treatment_decision, treatment_cost, financing_options
    ↓
Updates consultation_status to 'completed'
    ↓
Data Persisted in Supabase
```

---

## 🗄️ Database Schema

### Consultations Table

The `consultations` table stores all consultation data with the following key columns:

**References:**
- `appointment_id` - Links to appointments table
- `consultation_patient_id` - Links to consultation patients
- `new_patient_packet_id` - Links to patient packets
- `patient_id` - Links to main patients table

**Treatment Section (Form 1):**
- `clinical_assessment` - Clinical notes and diagnosis
- `treatment_recommendations` - JSON object with treatment options
- `treatment_plan` - JSON object with detailed treatment plan
- `additional_information` - Additional clinical notes

**Financial Section (Form 2):**
- `treatment_decision` - 'accepted', 'not-accepted', or 'followup-required'
- `treatment_cost` - Numeric cost value
- `financing_options` - JSON object with financing approval status
- `financing_not_approved_reason` - Reason if financing not approved
- `financial_notes` - Additional financial notes
- `followup_date` - Date for follow-up if required
- `followup_reason` - Reason for follow-up

**Status & Progress:**
- `consultation_status` - 'draft', 'in_progress', 'completed', 'cancelled'
- `progress_step` - 1 (Treatment) or 2 (Financial)
- `created_at`, `updated_at`, `completed_at` - Timestamps

---

## 🔄 How Data is Saved

### Treatment Form Save Process

```typescript
// File: src/components/TreatmentForm.tsx
// Method: saveData()

1. Fetch existing consultation by appointment_id
2. Prepare treatment data object
3. Upsert to consultations table using appointment_id as conflict key
4. Preserve existing financial data if present
5. Update progress_step to 1
```

### Financial Form Save Process

```typescript
// File: src/components/FinancialOutcomeForm.tsx
// Method: saveData()

1. Fetch existing consultation by appointment_id
2. Prepare financial data object
3. Upsert to consultations table using appointment_id as conflict key
4. Preserve existing treatment data if present
5. Update progress_step to 2
6. Set consultation_status to 'completed' if decision made
```

### Completion Process

```typescript
// File: src/components/ConsultationFormDialog.tsx
// Method: handleComplete()

1. Save treatment form data
2. Save financial form data
3. Update consultation_status to 'completed'
4. Trigger onComplete callback
5. Close dialog
```

---

## 🚀 Using the Consultation System

### Step 1: Add New Consultation

1. Go to **Consultation Page**
2. Click **"Add Consultation"** button
3. Fill in patient details:
   - First Name
   - Last Name
   - Date of Birth
   - Gender
   - Consultation Date & Time
4. Click **"Create Consultation"**

### Step 2: Fill Treatment Form

1. In the consultation form dialog, you're on **Section 1: Treatment**
2. Fill in:
   - Clinical Assessment
   - Treatment Recommendations (select arch type and treatments)
   - Treatment Plan (add treatments with procedures and costs)
   - Additional Information
3. Click **"Next"** to proceed to Financial section

### Step 3: Fill Financial Form

1. Now on **Section 2: Financial & Outcome**
2. Fill in:
   - Treatment Decision (Accepted/Not Accepted/Follow-up Required)
   - Treatment Cost (if accepted)
   - Financing Options
   - Additional Notes
   - Follow-up details (if required)
3. Click **"Complete Consultation"**

### Step 4: Verify Data Saved

- Check browser console for success messages
- Data is automatically saved to Supabase
- Consultation status changes to 'completed'

---

## 🔍 Verifying Data in Supabase

### View Saved Consultations

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run query:

```sql
SELECT 
  id,
  patient_name,
  consultation_status,
  treatment_decision,
  created_at,
  updated_at
FROM consultations
ORDER BY created_at DESC
LIMIT 10;
```

### View Specific Consultation

```sql
SELECT * FROM consultations
WHERE appointment_id = 'YOUR_APPOINTMENT_ID';
```

---

## 📝 Key Features

✅ **Auto-save** - Data saved when you click "Next" or "Complete"
✅ **Data Preservation** - Treatment data preserved when saving financial data
✅ **Progress Tracking** - System tracks which sections are completed
✅ **Status Management** - Automatic status updates (draft → in_progress → completed)
✅ **Timestamps** - Automatic created_at and updated_at tracking
✅ **Error Handling** - Toast notifications for success/failure

---

## 🐛 Troubleshooting

### Data Not Saving?

1. **Check Console**: Open browser DevTools (F12) → Console tab
2. **Look for errors**: Search for "❌" or "Error" messages
3. **Verify Supabase Connection**: Check if `supabase` client is initialized
4. **Check RLS Policies**: Ensure your user has permission to insert/update

### Missing Appointment ID?

- Appointment ID is required for saving
- Ensure consultation is created through "Add Consultation" dialog first
- Check that appointment_id is passed to ConsultationFormDialog

### Data Not Appearing in Supabase?

1. Refresh Supabase dashboard
2. Check the correct project (GP Mini - us-east-2)
3. Verify RLS policies allow your user to read data
4. Check created_at timestamp - data should be recent

---

## 📚 Related Files

- **Components**: 
  - `src/components/ConsultationFormDialog.tsx` - Main form container
  - `src/components/TreatmentForm.tsx` - Treatment section
  - `src/components/FinancialOutcomeForm.tsx` - Financial section
  - `src/components/AddConsultationDialog.tsx` - Create new consultation

- **Services**:
  - `src/services/consultationService.ts` - Consultation utilities

- **Database**:
  - `supabase/migrations/20241206000000_create_consultations_table.sql` - Table schema
  - `supabase/migrations/20250209000001_add_treatment_plan_to_consultations.sql` - Treatment plan column

---

## ✨ Everything is Ready!

Your consultation form system is fully configured and ready to use. Simply:

1. Go to Consultation Page
2. Click "Add Consultation"
3. Fill in the forms
4. Click "Complete"
5. Data is automatically saved to Supabase!

No additional setup needed. 🎉

