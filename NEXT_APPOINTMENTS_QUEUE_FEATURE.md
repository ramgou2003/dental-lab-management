# Next Appointments Queue Feature

## Overview
A comprehensive system for managing and scheduling suggested next appointments. This feature creates a workflow from encounter completion to appointment scheduling, ensuring no patient follow-ups are missed.

## Complete Workflow

### 1. Encounter Completion (Staff fills out encounter form)
- Staff completes an encounter form after a patient visit
- At the bottom of the form, they specify:
  - **Next Appointment Type** (e.g., Follow-up, Data Collection)
  - **Next Appointment Subtype** (e.g., 7 Day Follow-up)
  - **When** (7 days, 15 days, 30 days, or custom date)
- This information is saved to the database

### 2. Next Appointments Queue (Staff schedules appointments)
- Staff clicks **"Next Appointments"** button on the Appointments page
- Opens a dialog showing all patients with pending next appointments
- Features include:
  - **Search** by patient name
  - **Filter** by appointment type
  - **Sort** by date, patient name, or appointment type
  - Color-coded date badges (overdue, urgent, upcoming)
- Staff clicks **"Schedule"** button for a patient
- Appointment form opens pre-filled with suggested details
- Staff confirms and saves the appointment
- System marks the next appointment as "scheduled"
- Patient is removed from the queue

## Database Changes

### Migration File
`supabase/migrations/20250326000002_add_next_appointment_scheduled_status.sql`

### New Columns in `encounters` Table
- `next_appointment_scheduled` (BOOLEAN) - Whether the next appointment has been scheduled
- `next_appointment_scheduled_at` (TIMESTAMP) - When it was scheduled
- `next_appointment_scheduled_by` (UUID) - Who scheduled it (references user_profiles)
- `scheduled_appointment_id` (UUID) - Reference to the created appointment

## Component Architecture

### 1. NextAppointmentsQueue Component
**File**: `src/components/calendar/NextAppointmentsQueue.tsx`

**Features**:
- Fetches all encounters with unscheduled next appointments
- Displays patient information and appointment details
- Provides search, filter, and sort functionality
- Opens appointment form with pre-filled data
- Updates encounter status when appointment is scheduled

**Props**:
```typescript
interface NextAppointmentsQueueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentScheduled?: () => void;
}
```

### 2. CalendarHeader Component Updates
**File**: `src/components/calendar/CalendarHeader.tsx`

**Changes**:
- Added `onNextAppointmentsClick` prop
- Added "Next Appointments" button with green styling
- Button appears between search and "New Appointment" button

### 3. AppointmentsPage Updates
**File**: `src/pages/AppointmentsPage.tsx`

**Changes**:
- Added `showNextAppointmentsQueue` state
- Added `NextAppointmentsQueue` component
- Connected button click to open the queue dialog

## User Interface

### Next Appointments Queue Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  Next Appointments to Schedule                                  │
│  Manage and schedule suggested next appointments for patients   │
├─────────────────────────────────────────────────────────────────┤
│  Search Patient  │  Filter by Type  │  Sort By        │ Results │
│  [Input]         │  [Dropdown]      │  [Dropdown]     │  5 apts │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  👤 John Doe                              [Schedule]      │  │
│  │  Last Visit: Mon, Jan 1, 2025  [Consult]                  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Next Appointment Type    │ Suggested Date           │  │  │
│  │  │ Follow-up                │ 🟢 Wed, Jan 8, 2025      │  │  │
│  │  │ 7 Day Follow-up          │                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [More appointment cards...]                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                    [Close]       │
└─────────────────────────────────────────────────────────────────┘
```

### Date Badge Colors
- 🔴 **Red** - Overdue (past due date)
- 🟠 **Orange** - Urgent (within 7 days)
- 🟡 **Yellow** - Soon (within 14 days)
- 🟢 **Green** - Upcoming (more than 14 days)

## Search, Filter, and Sort Options

### Search
- Search by patient name (case-insensitive)
- Real-time filtering as you type

### Filter by Type
- All Types
- Consult
- Follow-up
- Data Collection
- Appliance Delivery
- Surgery
- Surgical Revision
- Emergency

### Sort Options
- **Date (Earliest First)** - Shows most urgent appointments first
- **Date (Latest First)** - Shows furthest appointments first
- **Patient (A-Z)** - Alphabetical by patient name
- **Patient (Z-A)** - Reverse alphabetical
- **Type (A-Z)** - Alphabetical by appointment type
- **Type (Z-A)** - Reverse alphabetical

## Scheduling Workflow

1. **Click "Schedule" button** on an appointment card
2. **Appointment form opens** with pre-filled data:
   - Patient (auto-selected)
   - Appointment Type (from next appointment suggestion)
   - Appointment Subtype (from next appointment suggestion)
   - Date (from suggested date)
3. **Staff can adjust** any details if needed
4. **Click "Create Appointment"**
5. **System automatically**:
   - Creates the appointment in the calendar
   - Marks the encounter's next appointment as scheduled
   - Records who scheduled it and when
   - Links the encounter to the new appointment
   - Removes the patient from the queue
6. **Success notification** appears
7. **Queue refreshes** to show updated list

## Benefits

### For Staff
- ✅ Clear visibility of all pending follow-ups
- ✅ No manual tracking needed
- ✅ Quick scheduling with pre-filled forms
- ✅ Prioritize urgent appointments with color coding
- ✅ Search and filter for specific patients or types

### For Practice
- ✅ Ensures no patient follow-ups are missed
- ✅ Improves patient care continuity
- ✅ Reduces administrative burden
- ✅ Tracks scheduling accountability
- ✅ Provides audit trail of who scheduled what and when

### For Patients
- ✅ Timely follow-up appointments
- ✅ Better treatment outcomes
- ✅ Improved care coordination

## Technical Details

### Data Flow
1. Encounter form saves next appointment details
2. Queue fetches encounters where `next_appointment_scheduled = false`
3. Queue joins with appointments table to get patient details
4. User schedules appointment
5. System updates encounter with scheduled status and appointment reference
6. Queue refreshes and removes scheduled appointments

### Performance Optimizations
- Indexed columns for fast queries
- Efficient joins between encounters and appointments
- Real-time filtering without database calls
- Lazy loading of appointment details

## Future Enhancements

Potential improvements:
- Bulk scheduling for multiple patients
- Automated reminders to schedule overdue appointments
- Export queue to CSV/PDF
- Dashboard widget showing queue count
- Email notifications for urgent appointments
- Integration with patient communication system
- Analytics on scheduling patterns and delays

