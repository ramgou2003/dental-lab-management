# Consultation Form Testing Guide

## 🧪 Quick Test Checklist

### Test 1: Create New Consultation

- [ ] Navigate to Consultation Page
- [ ] Click "Add Consultation" button
- [ ] Select "New Patient" tab
- [ ] Fill in patient details:
  - [ ] First Name: "John"
  - [ ] Last Name: "Doe"
  - [ ] Date of Birth: Select a date
  - [ ] Gender: Select an option
  - [ ] Consultation Date: Today
  - [ ] Consultation Time: 09:00
- [ ] Click "Create Consultation"
- [ ] Verify success toast appears

### Test 2: Fill Treatment Form

- [ ] Consultation form dialog opens
- [ ] You're on "Section 1: Treatment"
- [ ] Fill in Clinical Assessment: "Patient presents with..."
- [ ] Select Arch Type: "dual"
- [ ] Select Upper Treatment: Check "FULL ARCH FIXED"
- [ ] Select Lower Treatment: Check "DENTURE"
- [ ] Add Treatment Plan:
  - [ ] Click "Add Treatment"
  - [ ] Enter treatment name: "Full Arch Implant"
  - [ ] Enter description: "Upper arch implant restoration"
  - [ ] Enter cost: "5000"
  - [ ] Add procedures
  - [ ] Click "Add"
- [ ] Fill Additional Information: "Patient is ready to proceed"
- [ ] Click "Next" button
- [ ] Verify data is saved (check console for "✅ Treatment data saved")

### Test 3: Fill Financial Form

- [ ] Now on "Section 2: Financial & Outcome"
- [ ] Select Treatment Decision: "accepted"
- [ ] Enter Treatment Cost: "5000"
- [ ] Select Financing Option: "Yes - Approved"
- [ ] Fill Outcome Notes: "Patient approved for treatment"
- [ ] Click "Complete Consultation"
- [ ] Verify success toast: "Consultation completed successfully!"

### Test 4: Verify Data in Supabase

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query:

```sql
SELECT 
  id,
  patient_name,
  consultation_status,
  treatment_decision,
  clinical_assessment,
  treatment_plan,
  treatment_cost,
  created_at
FROM consultations
WHERE patient_name LIKE '%Doe%'
ORDER BY created_at DESC
LIMIT 1;
```

4. Verify:
   - [ ] patient_name = "John Doe"
   - [ ] consultation_status = "completed"
   - [ ] treatment_decision = "accepted"
   - [ ] clinical_assessment contains your text
   - [ ] treatment_plan is not empty (JSON)
   - [ ] treatment_cost = 5000

### Test 5: Edit Existing Consultation

- [ ] Go back to Consultation Page
- [ ] Find the consultation you just created
- [ ] Click on it to open
- [ ] Click "Edit Consultation" or similar button
- [ ] Modify Treatment Form data
- [ ] Click "Next"
- [ ] Verify data is updated (not duplicated)
- [ ] Check Supabase - should have same ID, updated_at changed

### Test 6: Test with Different Patient Types

- [ ] Test with "Consultation Patient" (existing)
- [ ] Test with "Active Patient" (existing)
- [ ] Verify each creates proper links in database

---

## 🔍 Console Debugging

Open browser DevTools (F12) and check Console tab for these messages:

**Success Messages:**
```
✅ Treatment data saved
✅ Financial outcome saved successfully
✅ Consultation completed successfully
✅ Consultation status updated to completed
```

**Error Messages:**
```
❌ Supabase error: [error details]
❌ Error completing consultation: [error details]
```

**Info Messages:**
```
💾 Saving treatment data: [data object]
💾 Saving financial outcome data: [data object]
🔍 IDs being saved: [ids]
📋 Existing data found: Yes/No
```

---

## 📊 Expected Data Structure

### Treatment Plan JSON

```json
{
  "treatments": [
    {
      "id": "uuid",
      "name": "Full Arch Implant",
      "description": "Upper arch implant restoration",
      "total_cost": 5000,
      "procedure_count": 2,
      "procedures": [
        {
          "id": "uuid",
          "name": "Implant Placement",
          "cdt_code": "D6010",
          "cost": "2500",
          "quantity": 1
        }
      ]
    }
  ]
}
```

### Treatment Recommendations JSON

```json
{
  "archType": "dual",
  "upperTreatment": ["FULL ARCH FIXED"],
  "lowerTreatment": ["DENTURE"]
}
```

### Financing Options JSON

```json
{
  "yesApproved": true,
  "noNotApproved": false,
  "didNotApply": false
}
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Data not saving | Check console for errors, verify appointment_id exists |
| Form fields empty after save | Refresh page, data should reload from database |
| Duplicate records created | Check for multiple clicks, use unique appointment_id |
| Supabase connection error | Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| RLS policy error | Check Supabase RLS policies allow your user |

---

## 📱 Testing on Different Devices

- [ ] Desktop (Chrome/Firefox/Safari)
- [ ] Tablet (iPad/Android tablet)
- [ ] Mobile (iPhone/Android phone)
- [ ] Verify responsive design works
- [ ] Verify touch interactions work

---

## ✅ Final Verification

After completing all tests:

1. [ ] All data appears in Supabase
2. [ ] No console errors
3. [ ] Toast notifications appear correctly
4. [ ] Data persists after page refresh
5. [ ] Can edit existing consultations
6. [ ] Treatment plan total calculates correctly
7. [ ] Status updates to 'completed'
8. [ ] Timestamps are accurate

**If all checks pass, your consultation form is working perfectly! 🎉**

