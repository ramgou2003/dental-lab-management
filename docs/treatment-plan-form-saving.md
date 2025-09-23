# Treatment Plan Form Saving Implementation

## Overview
The treatment plan form now saves data to Supabase with auto-save functionality and proper form status management.

## Database Structure

### Table: `treatment_plan_forms`
```sql
CREATE TABLE treatment_plan_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  treatments JSONB DEFAULT '[]'::jsonb,
  plan_date DATE DEFAULT CURRENT_DATE,
  form_status VARCHAR(20) DEFAULT 'draft' CHECK (form_status IN ('draft', 'completed')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL
);
```

## Service Layer

### File: `src/services/treatmentPlanFormService.ts`

#### Key Functions:
- `saveTreatmentPlanForm()` - Creates new treatment plan form
- `updateTreatmentPlanForm()` - Updates existing form
- `autoSaveTreatmentPlanForm()` - Auto-saves with status preservation
- `getTreatmentPlanForm()` - Retrieves form by ID
- `getAllTreatmentPlanForms()` - Lists all forms with pagination

#### Data Structure:
```typescript
interface TreatmentPlanFormData {
  id?: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  treatments: TreatmentData[];
  plan_date?: string;
  form_status?: 'draft' | 'completed';
  created_by?: string;
}

interface TreatmentData {
  id: string;
  name: string;
  description?: string;
  total_cost: number;
  procedure_count: number;
  procedures: ProcedureData[];
}

interface ProcedureData {
  id: string;
  name: string;
  cdt_code?: string;
  cpt_code?: string;
  cost?: string;
  quantity: number;
}
```

## Component Integration

### TreatmentPlanDialog Component
- **Auto-save**: Debounced auto-save every 2 seconds
- **Status management**: Draft → Completed workflow
- **Form persistence**: Creates form on first auto-save, updates thereafter

### PatientProfilePage Integration
- **Form submission**: Saves as 'completed' status
- **User tracking**: Records created_by field
- **Error handling**: Toast notifications for success/error

## Form Status Workflow

### Status Rules:
1. **Draft**: Initial status for auto-saved forms
2. **Completed**: Final status when user submits form
3. **Unidirectional**: Once completed, never reverts to draft

### Auto-save Behavior:
- **New forms**: Creates draft record on first auto-save
- **Existing forms**: Updates existing record
- **Status preservation**: Completed forms stay completed
- **Debouncing**: 2-second delay to prevent excessive saves

## Usage Example

### Creating a Treatment Plan Form:
```typescript
const formData = {
  patient_id: "patient-uuid",
  first_name: "John",
  last_name: "Doe",
  date_of_birth: "1990-01-01",
  treatments: [
    {
      id: "treatment-1",
      name: "Lateral Window Sinus Lift",
      total_cost: 400,
      procedure_count: 4,
      procedures: [
        {
          id: "proc-1",
          name: "Extraction",
          cdt_code: "D7210",
          quantity: 1,
          cost: "100.00"
        }
      ]
    }
  ],
  plan_date: "2025-09-22",
  form_status: "completed"
};

const { data, error } = await saveTreatmentPlanForm(formData, userId);
```

### Auto-save Implementation:
```typescript
const handleAutoSave = async (formData: any) => {
  // Debounced auto-save with 2-second delay
  setTimeout(async () => {
    if (currentFormId) {
      await autoSaveTreatmentPlanForm(currentFormId, formData);
    } else {
      const result = await saveTreatmentPlanForm(formData, userId);
      setCurrentFormId(result.data?.id);
    }
  }, 2000);
};
```

## Features Implemented

### ✅ Core Functionality:
- [x] Database table creation
- [x] Service layer with CRUD operations
- [x] Form submission to Supabase
- [x] Auto-save functionality
- [x] Status management (draft/completed)
- [x] User tracking (created_by field)
- [x] Error handling and notifications

### ✅ Data Integrity:
- [x] Foreign key relationships
- [x] Form status constraints
- [x] Automatic timestamps
- [x] JSONB storage for treatments
- [x] Proper data validation

### ✅ User Experience:
- [x] Auto-save with visual feedback
- [x] Debounced saves (2-second delay)
- [x] Status preservation rules
- [x] Success/error notifications
- [x] Form persistence across sessions

## Testing

### Database Test:
```sql
-- Test record insertion
INSERT INTO treatment_plan_forms (
  first_name, last_name, date_of_birth, 
  treatments, form_status
) VALUES (
  'Test', 'Patient', '1990-01-01',
  '[{"id": "test", "name": "Test Treatment"}]'::jsonb,
  'draft'
);
```

### Service Test:
```typescript
// Test service function
const result = await saveTreatmentPlanForm({
  first_name: "Test",
  last_name: "Patient",
  date_of_birth: "1990-01-01",
  treatments: [],
  form_status: "draft"
});
```

## Next Steps

### Potential Enhancements:
1. **Form versioning**: Track form revisions
2. **Approval workflow**: Add approval status
3. **PDF generation**: Export treatment plans
4. **Email notifications**: Notify on form completion
5. **Form templates**: Predefined treatment templates
6. **Analytics**: Track form completion rates

### Integration Points:
1. **Patient records**: Link to patient profiles
2. **Billing system**: Connect to financial workflows
3. **Appointment scheduling**: Link to treatment appointments
4. **Clinical notes**: Integrate with patient charts
