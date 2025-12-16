# Appointment Status System Update

## Overview
Updated the appointment status system to include a comprehensive list of 10 status values that better reflect the appointment workflow.

## New Status Values

| Status Code | Label | Description | Color |
|-------------|-------|-------------|-------|
| `?????` | ????? Not Confirmed | Appointment not yet confirmed | Gray |
| `FIRM` | FIRM Appointment Confirmed | Appointment confirmed by patient | Green |
| `EFIRM` | EFIRM Electronically Confirmed | Electronically confirmed appointment | Emerald |
| `EMER` | EMER Emergency Patient | Emergency patient appointment | Red |
| `HERE` | HERE Patient has Arrived | Patient has arrived at office | Blue |
| `READY` | READY Ready for Operatory | Patient ready for treatment | Purple |
| `LM1` | LM1 Left 1st Message | Left first message for patient | Yellow |
| `LM2` | LM2 Left 2nd Message | Left second message for patient | Orange |
| `MULTI` | MULTI Multi-Appointment | Multi-appointment patient | Indigo |
| `2wk` | 2wk 2 Week Calls | 2-week follow-up calls | Pink |

## Files Modified

### 1. Database Migration
**File:** `supabase/migrations/20250316000000_update_appointment_statuses.sql`
- Updated existing appointments to map old statuses to new ones
- Added CHECK constraint with all 10 new status values
- Set default status to `not-confirmed`

### 2. TypeScript Interfaces
**File:** `src/hooks/useAppointments.ts`
- Updated `Appointment` interface status type to include all 10 new values
- Changed from: `'pending' | 'confirmed' | 'not-confirmed' | 'completed' | 'cancelled'`
- Changed to: `'?????' | 'FIRM' | 'EFIRM' | 'EMER' | 'HERE' | 'READY' | 'LM1' | 'LM2' | 'MULTI' | '2wk'`

### 3. Calendar Day View
**File:** `src/components/calendar/DayView.tsx`
- Updated `Appointment` interface with new status types
- Updated `getStatusDotColor()` function to return appropriate colors for all 10 statuses
- Updated context menu "Change Status" submenu with all 10 status options
- Each status has appropriate icon and color coding

### 4. Appointment Details Dialog
**File:** `src/components/calendar/AppointmentDetailsDialog.tsx`
- Updated `Appointment` interface with new status types
- Updated `getStatusColor()` function for badge styling
- Updated `getStatusIcon()` function for status icons
- Updated `getStatusLabel()` function for display labels

## Visual Changes

### Status Capsule Colors (Left edge of appointment cards)
- **Gray** - Not Confirmed
- **Green** - FIRM Confirmed
- **Emerald** - EFIRM Electronically Confirmed
- **Red** - EMER Emergency
- **Blue** - HERE Patient Arrived
- **Purple** - READY For Operatory
- **Yellow** - LM1 First Message
- **Orange** - LM2 Second Message
- **Indigo** - MULTI Multi-Appointment
- **Pink** - 2wk 2 Week Calls

### Context Menu
Right-click (or long-press on tablet) on any appointment card shows:
- **Change Status** submenu with all 10 status options
- Each option has color-coded icon matching the status
- Full descriptive labels for clarity

## Migration Notes

### Existing Data
The migration automatically maps old status values to new ones:
- `pending` → `?????`
- `confirmed` → `FIRM`
- `not-confirmed` → `?????`
- `completed` → `FIRM`
- `cancelled` → `?????`

### Default Status
New appointments will default to `?????` (Not Confirmed) status.

## Usage

### Changing Status
1. **Desktop:** Right-click on appointment card → Change Status → Select new status
2. **Tablet:** Long-press appointment card (500ms) → Change Status → Select new status

### Status Workflow Example
1. **?????** - Initial appointment booking
2. **LM1** - Left first confirmation message
3. **LM2** - Left second confirmation message
4. **FIRM** or **EFIRM** - Patient confirmed
5. **HERE** - Patient arrived
6. **READY** - Ready for treatment

## Testing Checklist
- [ ] Run database migration
- [ ] Verify existing appointments display correctly
- [ ] Test status changes via context menu
- [ ] Verify status colors on appointment cards
- [ ] Test on desktop (right-click)
- [ ] Test on tablet (long-press)
- [ ] Verify appointment details dialog shows correct status
- [ ] Check that new appointments default to `?????` (Not Confirmed)

## Rollback Plan
If needed, the old status values can be restored by:
1. Reverting the database migration
2. Reverting changes to TypeScript interfaces
3. Reverting UI component changes

