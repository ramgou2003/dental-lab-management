# Treatment Data Migration Guide

## Overview

The treatment plan data structure is now standardized across multiple forms and tables to enable seamless data migration. This document explains the structure and how to migrate data between forms.

## Shared Data Structure

All treatment data uses the same TypeScript interfaces defined in `src/types/treatment.ts`:

### ProcedureData
```typescript
interface ProcedureData {
  id: string;                    // Unique procedure ID
  name: string;                  // Procedure name
  cdt_code?: string;            // Optional CDT code
  cpt_code?: string;            // Optional CPT code
  cost?: string;                // Unit cost (stored as string for precision)
  quantity: number;             // Quantity (editable)
}
```

### TreatmentData
```typescript
interface TreatmentData {
  id: string;                    // Unique treatment ID
  name: string;                  // Treatment name
  description?: string;          // Optional description
  total_cost: number;            // Auto-calculated: sum of (cost × quantity)
  procedure_count: number;       // Auto-calculated: count of procedures
  procedures: ProcedureData[];   // Array of procedures
  createdAt?: string;            // ISO timestamp (optional)
  isIndividualProcedure?: boolean; // Flag for single procedure (optional)
}
```

### TreatmentPlanData
```typescript
interface TreatmentPlanData {
  treatments: TreatmentData[];   // Array of treatments
}
```

## Forms Using This Structure

### 1. Consultation Form
- **Location**: `src/components/TreatmentForm.tsx`
- **Database**: `consultations.treatment_plan` (JSONB)
- **Features**:
  - Edit quantity and unit price for each procedure
  - Auto-calculate total cost
  - Save to Supabase consultations table
  - Optional fields: `createdAt`, `isIndividualProcedure`

### 2. Treatment Plan Form
- **Location**: `src/components/TreatmentPlanForm.tsx`
- **Database**: `treatment_plan_forms.treatments` (JSONB)
- **Features**:
  - Create and manage treatment plans
  - Edit quantity and unit price for each procedure
  - Save to Supabase treatment_plan_forms table
  - Uses core fields only (no optional fields)

### 3. Patient Profile Treatment Plans
- **Location**: Patient profile section
- **Database**: `treatment_plan_forms` table
- **Features**:
  - View and manage patient's treatment plans
  - Uses same data structure

## Data Migration Examples

### Example 1: Copy Consultation Treatment Plan to Treatment Plan Form

```typescript
import { TreatmentData, TreatmentPlanData } from '@/types/treatment';

// Get treatment plan from consultation
const consultationTreatmentPlan: TreatmentPlanData = consultation.treatment_plan;

// Create new treatment plan form with same data
const newTreatmentPlanForm = {
  first_name: patient.first_name,
  last_name: patient.last_name,
  date_of_birth: patient.date_of_birth,
  treatments: consultationTreatmentPlan.treatments, // Direct copy!
  plan_date: new Date().toISOString().split('T')[0],
  form_status: 'draft'
};

// Save to treatment_plan_forms table
await saveTreatmentPlanForm(newTreatmentPlanForm);
```

### Example 2: Update Procedure Quantity and Cost

```typescript
import { calculateTreatmentTotalCost } from '@/types/treatment';

// Update a procedure
const updatedTreatments = treatments.map(treatment => {
  if (treatment.id === targetTreatmentId) {
    const updatedProcedures = treatment.procedures.map(proc => {
      if (proc.id === targetProcedureId) {
        return {
          ...proc,
          quantity: newQuantity,
          cost: newCost.toString()
        };
      }
      return proc;
    });

    return {
      ...treatment,
      procedures: updatedProcedures,
      total_cost: calculateTreatmentTotalCost(updatedProcedures)
    };
  }
  return treatment;
});
```

### Example 3: Create New Treatment

```typescript
import { createTreatment, createProcedure } from '@/types/treatment';

// Create procedures
const procedures = [
  createProcedure('proc-1', 'Initial Exam', '100', 1, 'D8000'),
  createProcedure('proc-2', 'Bracket Placement', '500', 1, 'D8010')
];

// Create treatment
const treatment = createTreatment(
  'treat-1',
  'Orthodontics',
  procedures,
  'Full mouth orthodontic treatment'
);

// Add to treatment plan
const treatmentPlan = {
  treatments: [treatment]
};
```

## Key Points for Migration

1. **Cost Storage**: Costs are stored as strings to preserve decimal precision
   - Store: `"25.50"` (string)
   - Display: `parseFloat(cost)` (number)

2. **Auto-Calculated Fields**: These are computed, not stored
   - `total_cost`: Sum of (procedure.cost × procedure.quantity)
   - `procedure_count`: Length of procedures array

3. **Optional Fields**: Only use when needed
   - `createdAt`: Timestamp when treatment was added
   - `isIndividualProcedure`: Flag for single procedure treatments
   - `description`: Treatment description

4. **Data Validation**: Before saving, ensure:
   - All treatments have unique IDs
   - All procedures have unique IDs
   - Costs are valid numbers (can be parsed)
   - Quantities are positive integers

## Database Columns

### consultations table
- `treatment_plan` (JSONB): Stores full TreatmentPlanData

### treatment_plan_forms table
- `treatments` (JSONB): Stores TreatmentData[]

## Helper Functions

Located in `src/types/treatment.ts`:

- `calculateTreatmentTotalCost(procedures)`: Calculate total cost
- `createTreatment(id, name, procedures, description)`: Create new treatment
- `createProcedure(id, name, cost, quantity, cdtCode, cptCode)`: Create new procedure

## Future Enhancements

When implementing data migration features:

1. **Consultation → Treatment Plan**: Copy treatment plan from consultation to treatment plan form
2. **Treatment Plan → Consultation**: Link existing treatment plan to consultation
3. **Bulk Operations**: Update multiple procedures at once
4. **Version Control**: Track changes to treatment plans over time
5. **Approval Workflow**: Add approval status to treatment plans

## Testing Migration

To test data migration:

1. Create a consultation with treatment plan
2. Edit quantities and costs
3. Save the consultation
4. Verify data in Supabase consultations table
5. Create a new treatment plan form with same data
6. Verify data matches in treatment_plan_forms table
7. Edit data in treatment plan form
8. Verify changes persist

## Support

For questions about the data structure or migration process, refer to:
- `src/types/treatment.ts` - Type definitions
- `src/components/TreatmentForm.tsx` - Consultation form implementation
- `src/components/TreatmentPlanForm.tsx` - Treatment plan form implementation

