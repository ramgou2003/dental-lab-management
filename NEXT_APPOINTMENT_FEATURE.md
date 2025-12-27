# Next Appointment Feature

## Overview
Added a "Next Appointment" section to the Encounter Form that allows staff to specify what the next appointment should be and when it should be scheduled after completing an encounter.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20250326000001_add_next_appointment_to_encounters.sql`

**New Columns Added to `encounters` table**:
- `next_appointment_type` (TEXT) - Type of the next appointment (e.g., consultation, follow-up, data-collection, etc.)
- `next_appointment_subtype` (TEXT) - Subtype of the next appointment (e.g., 7-day-followup, 75-day-data-collection, etc.)
- `next_appointment_date` (DATE) - Suggested date for the next appointment

**To Apply Migration**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of the migration file
3. Execute the SQL

### 2. Component Updates
**File**: `src/components/calendar/EncounterFormDialog.tsx`

**Changes**:
- Added Select component import for dropdown functionality
- Added four new state variables:
  - `nextAppointmentType` - Stores the selected appointment type
  - `nextAppointmentSubtype` - Stores the selected appointment subtype
  - `nextAppointmentDate` - Stores the calculated or custom date
  - `nextAppointmentDateOption` - Stores the selected date option (7-days, 15-days, 30-days, custom)
- Added appointment type and subtype options matching the appointment form structure
- Added useEffect to reset subtype when appointment type changes
- Added useEffect to automatically calculate date based on selected date option (7, 15, or 30 days)
- Updated `handleSave` function to save next appointment fields
- Updated `fetchEncounterData` function to load next appointment fields when viewing existing encounters
- Added new "Next Appointment" section in the UI with green styling to distinguish it from other sections
- Implemented smart date picker that shows/hides based on "Custom Date" selection
- Added calculated date display for preset options (7, 15, 30 days)

### 3. Appointment Type and Subtype Options

**Appointment Types**:
- Consult
- Follow-up
- Data Collection
- Appliance Delivery
- Surgery
- Surgical Revision
- Emergency

**Subtypes by Type**:

**Follow-up**:
- 7 Day Follow-up
- 30 Days Follow-up
- Follow-up for Observation
- 3 Months Follow Up
- 6 Months Follow Up
- 12 Months Follow Up

**Data Collection**:
- 75 Days Data Collection for PTI
- Final Data Collection
- Data collection for Printed-try-in

**Appliance Delivery**:
- Printed Try-in Delivery
- 82 Days PTI Delivery
- 120 Days Final Delivery

**Other Types** (Consult, Surgery, Surgical Revision, Emergency):
- No subtypes available

## User Interface

The "Next Appointment" section appears at the end of the encounter form, just before the action buttons:

1. **Appointment Type** dropdown - Select the type of next appointment
2. **Appointment Subtype** dropdown - Appears conditionally based on selected type
3. **When** dropdown - Select timeframe for the appointment:
   - **7 Days** - Automatically calculates date 7 days from today
   - **15 Days** - Automatically calculates date 15 days from today
   - **30 Days** - Automatically calculates date 30 days from today
   - **Custom Date** - Shows a date picker for manual selection
4. **Calculated Date** display - Shows the auto-calculated date for preset options (7, 15, or 30 days)
5. **Custom Date** picker - Only appears when "Custom Date" is selected

The section has a green background to visually distinguish it from other sections of the form.

## Usage

1. Complete the encounter form as usual
2. Scroll to the "Next Appointment" section at the bottom
3. Select the appropriate appointment type
4. If applicable, select the appointment subtype
5. Select when the appointment should be:
   - Choose **7 Days**, **15 Days**, or **30 Days** for automatic date calculation
   - Choose **Custom Date** to manually select a specific date
6. Review the calculated/selected date
7. Save the encounter form

The next appointment information will be saved with the encounter and can be viewed when reopening the encounter form.

### Date Calculation Examples

- If today is **January 1, 2025** and you select **7 Days**, the calculated date will be **January 8, 2025**
- If today is **January 1, 2025** and you select **15 Days**, the calculated date will be **January 16, 2025**
- If today is **January 1, 2025** and you select **30 Days**, the calculated date will be **January 31, 2025**

## Benefits

- Provides clear guidance on what should happen next after an appointment
- Helps staff schedule follow-up appointments appropriately
- Reduces confusion about next steps in patient care
- Creates a documented trail of recommended follow-up care
- Improves patient care continuity

## Future Enhancements

Potential future improvements:
- Auto-create the next appointment based on the saved information
- Send reminders to staff to schedule the next appointment
- Display next appointment recommendations on the patient dashboard
- Generate reports on recommended vs. scheduled appointments

