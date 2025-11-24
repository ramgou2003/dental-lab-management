# Create Treatment Plan Form - Complete Component Details

## Overview
The Create Treatment Plan Form is located in `src/components/TreatmentPlanForm.tsx` and is used in the patient profile forms section. It's a comprehensive form for creating and managing treatment plans with treatments and procedures.

---

## 1. MAIN COMPONENT STRUCTURE

### TreatmentPlanForm Component
- **File**: `src/components/TreatmentPlanForm.tsx`
- **Type**: React Functional Component
- **Purpose**: Main form component for creating/editing treatment plans

---

## 2. UI COMPONENT IMPORTS

### From `@/components/ui/`
1. **DialogHeader** - Header container for dialog
2. **DialogTitle** - Title text for dialog
3. **Button** - Reusable button component
4. **Input** - Text/number input field
5. **Label** - Form label component
6. **Card** - Container card component
7. **CardContent** - Card content wrapper
8. **CardHeader** - Card header section
9. **CardTitle** - Card title text
10. **Badge** - Small label/badge component
11. **Separator** - Divider line component

### From `lucide-react` (Icons)
1. **FileText** - Document/form icon
2. **Users** - Patient/people icon
3. **Calendar** - Date icon
4. **Clock** - Time icon
5. **Save** - Save/submit icon
6. **Plus** - Add/create icon
7. **X** - Close/remove icon
8. **ChevronDown** - Expand down icon
9. **ChevronRight** - Expand right icon
10. **Trash2** - Delete icon

---

## 3. CUSTOM DIALOG COMPONENTS

1. **TreatmentListDialog**
   - **Location**: `src/components/TreatmentListDialog`
   - **Purpose**: Dialog to select treatments from a list
   - **Props**: `isOpen`, `onClose`, `onSelectTreatment`

2. **ProcedureListDialog**
   - **Location**: `src/components/ProcedureListDialog`
   - **Purpose**: Dialog to select procedures from a list
   - **Props**: `isOpen`, `onClose`, `onSelectProcedures`

---

## 4. FORM SECTIONS & COMPONENTS

### A. HEADER SECTION
- **DialogHeader** - Fixed header container
- **DialogTitle** - "Create Treatment Plan" title with FileText icon
- **Separator** - Divider line

### B. PATIENT INFORMATION CARD
**Card Structure:**
- **CardHeader** - Blue header with "Patient Information" title and Users icon
- **CardContent** - Contains input fields in a 3-column grid:
  
  **Input Fields:**
  1. **First Name Input**
     - Type: Text
     - Required: Yes
     - Disabled in read-only mode
  
  2. **Last Name Input**
     - Type: Text
     - Required: Yes
     - Disabled in read-only mode
  
  3. **Date of Birth Input**
     - Type: Date picker
     - Required: Yes
     - Disabled in read-only mode

### C. TREATMENT PLAN DETAILS CARD
**Card Structure:**
- **CardHeader** - Green header with "Treatment Plan Details" title and FileText icon
- **Action Buttons in Header:**
  1. **Add Procedure Button**
     - Icon: Plus
     - Variant: Outline
     - Size: Small
     - Disabled in read-only mode
  
  2. **Add Treatment Button**
     - Icon: Plus
     - Variant: Outline
     - Size: Small
     - Disabled in read-only mode

**CardContent - Treatment Display:**

#### Treatment Card (Collapsible)
- **CardHeader** - Collapsed header showing:
  - Expand/Collapse Button (ChevronDown/ChevronRight)
  - Treatment Name (CardTitle)
  - Badges showing:
    - Total Cost (green badge)
    - Procedure Count (gray badge)
    - "Click to expand" hint (blue badge)
  - Remove Button (X icon, red)

#### Expanded Treatment Content
When expanded, shows:

**Procedure List Section:**
- Procedures displayed in a grid with:
  - **Procedure Header** (gradient blue background):
    - Procedure Name (h4)
    - Medical Codes:
      - CDT Code Badge (blue)
      - CPT Code Badge (purple)
    - Remove Button (Trash2 icon)
  
  **Procedure Details Grid (3 columns):**
  1. **Quantity Section**
     - Label: "Quantity"
     - Display Mode: Shows value in blue box
     - Edit Mode: 
       - Decrease Button (−)
       - Number Input
       - Increase Button (+)
  
  2. **Unit Price Section**
     - Label: "Unit Price"
     - Display Mode: Shows formatted price
     - Edit Mode:
       - Dollar sign prefix
       - Number input with step 0.01
  
  3. **Total Cost Section**
     - Label: "Total Cost"
     - Display Mode: Auto-calculated (Unit Price × Quantity)
     - Read-only display

- **Add Another Procedure Button**
  - Dashed border style
  - Blue color scheme
  - Plus icon with text

#### Individual Procedures Section
Displays procedures added directly (not within treatments):
- Similar structure to treatment procedures
- Header with procedure name and codes
- 3-column grid for Quantity, Unit Price, Total Cost
- Remove button (X icon)

#### Treatment Summary Card
- **Background**: Blue (bg-blue-50)
- **Content:**
  1. **Summary Text**
     - Shows count of treatments and procedures
  
  2. **Cost Breakdown Section:**
     - **Subtotal Display**
       - Label: "Subtotal:"
       - Auto-calculated from all procedures
     
     - **Courtesy/Discount Input**
       - Label: "Courtesy:"
       - Number input with $ prefix
       - Min: 0, Step: 0.01
     
     - **Final Total Display**
       - Label: "Final Total:"
       - Auto-calculated (Subtotal - Discount)
       - Bold, large font

---

## 5. FOOTER SECTION

**Fixed Footer Container:**
- **Left Side:**
  - Clock Icon
  - Plan Date Display (formatted)

- **Right Side - Action Buttons:**
  1. **Cancel Button**
     - Variant: Outline
     - Disabled in read-only mode
  
  2. **Submit Button**
     - Type: Submit
     - Color: Blue (bg-blue-600)
     - Icon: Save
     - Text: "Submit Treatment Plan" or "Update Treatment Plan" (based on isEditing)
     - Hidden in read-only mode

---

## 6. FORM STATE MANAGEMENT

### State Variables
1. **formData** - Main form state containing:
   - firstName
   - lastName
   - dateOfBirth
   - planDate
   - treatments (array)
   - procedures (array)
   - notes
   - discount

2. **showTreatmentListDialog** - Boolean for treatment dialog visibility
3. **showProcedureListDialog** - Boolean for procedure dialog visibility
4. **expandedTreatments** - Set of expanded treatment IDs
5. **addingProceduresToTreatment** - Index of treatment receiving procedures

---

## 7. KEY HANDLERS & FUNCTIONS

1. **handleInputChange** - Updates form field values
2. **handleSelectTreatment** - Adds selected treatment to form
3. **handleSelectProcedures** - Adds procedures to treatment or as individual
4. **toggleTreatmentExpansion** - Expands/collapses treatment cards
5. **handleProcedureEdit** - Edits procedure quantity or cost
6. **handleRemoveProcedure** - Removes procedure from treatment
7. **handleRemoveTreatment** - Removes entire treatment
8. **handleSubmit** - Submits form data
9. **formatDate** - Formats date for display

---

## 8. PROPS INTERFACE

```typescript
interface TreatmentPlanFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  patientName?: string;
  patientDateOfBirth?: string;
  initialData?: any;
  isEditing?: boolean;
  readOnly?: boolean;
  onAutoSave?: (formData: any) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  autoSaveMessage?: string;
  lastSavedTime?: string;
  setAutoSaveStatus?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setAutoSaveMessage?: (message: string) => void;
}
```

---

## 9. STYLING CLASSES

- **Layout**: Flexbox, Grid (grid-cols-1, md:grid-cols-3)
- **Colors**: Blue, Green, Red, Gray, Purple
- **Borders**: Border-2, border-gray-200, border-blue-100, etc.
- **Spacing**: p-6, pt-8, pb-8, gap-4, space-y-8
- **Responsive**: md: breakpoints for tablet/desktop
- **Hover Effects**: hover:border-blue-300, hover:bg-blue-50
- **Transitions**: transition-all, transition-colors, transition-opacity

---

## 10. ACCESSIBILITY FEATURES

- **Labels**: All inputs have associated labels
- **Required Fields**: Marked with red asterisk (*)
- **Disabled States**: Buttons disabled in read-only mode
- **Icons**: Used alongside text for clarity
- **Keyboard Navigation**: Form supports standard keyboard interaction
- **Focus States**: Focus rings on inputs (focus:ring-2, focus:ring-blue-200)


