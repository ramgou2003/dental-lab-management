# Next Appointments Queue - Quick Start Guide

## 🚀 How to Use

### Step 1: Navigate to Appointments
Go to the **Appointments** page from the sidebar.

### Step 2: Click "Next Appointments" Button
Look for the **green button** in the header that says "Next Appointments" (between the search bar and "New Appointment" button).

### Step 3: View Pending Appointments
You'll be taken to a full-page view showing all patients who need their next appointment scheduled.

### Step 4: Use Filters (Optional)
- **Search**: Type patient name to find specific patients
- **Filter by Type**: Select appointment type (Consult, Follow-up, etc.)
- **Sort**: Choose how to sort the list
  - Date (Earliest First) - **Recommended** - Shows urgent appointments first
  - Date (Latest First)
  - Patient (A-Z)
  - Patient (Z-A)
  - Type (A-Z)
  - Type (Z-A)

### Step 5: Schedule an Appointment
1. Find the patient you want to schedule
2. Click the **"Schedule Appointment"** button (green button on the right)
3. The appointment form will open with pre-filled information:
   - Patient name
   - Appointment type
   - Appointment subtype
   - Suggested date
4. Adjust any details if needed
5. Click **"Create Appointment"**
6. The appointment is created and the patient is removed from the queue

### Step 6: Return to Calendar
Click the **"Back to Appointments"** button in the top left corner to return to the main calendar.

---

## 🎨 Understanding the Color Codes

Each appointment card shows a colored badge for the suggested date:

- 🔴 **Red** = Overdue (past the suggested date)
- 🟠 **Orange** = Urgent (within 7 days)
- 🟡 **Yellow** = Soon (within 14 days)
- 🟢 **Green** = Upcoming (more than 14 days away)

**Tip**: Sort by "Date (Earliest First)" to see the most urgent appointments at the top!

---

## 📋 What Each Card Shows

### Patient Information
- Patient name with icon
- Last appointment date
- Last appointment type

### Next Appointment Details
- Suggested appointment type (e.g., "Follow-up")
- Suggested subtype (e.g., "7 Day Follow-up")
- Suggested date with color-coded urgency

### Action Button
- Large green "Schedule Appointment" button

---

## 💡 Tips for Efficient Workflow

1. **Start with Urgent**: Use "Date (Earliest First)" sorting to prioritize overdue and urgent appointments
2. **Filter by Type**: If you're scheduling a specific type of appointment, use the filter
3. **Search Quickly**: Use the search box if you know the patient's name
4. **Batch Scheduling**: Schedule multiple appointments in one session
5. **Check Daily**: Make it a habit to check this page daily to stay on top of follow-ups

---

## 🔄 Complete Workflow Example

### Scenario: Scheduling a 7-Day Follow-up

1. **Navigate**: Go to Appointments page
2. **Click**: "Next Appointments" button
3. **Filter**: Select "Follow-up" from the filter dropdown
4. **Sort**: Choose "Date (Earliest First)"
5. **Find**: Look for patients with orange or red badges (urgent)
6. **Schedule**: Click "Schedule Appointment" on the first patient
7. **Review**: Check the pre-filled information
8. **Adjust**: Change date/time if needed
9. **Confirm**: Click "Create Appointment"
10. **Repeat**: Continue with the next patient
11. **Return**: Click "Back to Appointments" when done

---

## ❓ FAQ

### Q: What happens after I schedule an appointment?
**A**: The appointment is created in the calendar, the encounter is marked as "scheduled," and the patient is removed from the Next Appointments queue.

### Q: Can I see who scheduled an appointment?
**A**: Yes, the system tracks who scheduled each appointment and when. This is stored in the database for audit purposes.

### Q: What if I need to change the suggested date?
**A**: You can adjust any details in the appointment form before clicking "Create Appointment."

### Q: How do appointments get added to this queue?
**A**: When staff complete an encounter form, they specify the next appointment type and when it should be scheduled. This automatically adds the patient to the queue.

### Q: Can I schedule appointments for multiple patients at once?
**A**: Currently, you schedule one at a time, but you can quickly move through the list by scheduling and moving to the next patient.

### Q: What if a patient doesn't show up in the queue?
**A**: Check if:
- The encounter form was completed with next appointment details
- The appointment hasn't already been scheduled
- The patient has a suggested next appointment type

---

## 🎯 Best Practices

1. **Daily Check**: Review the queue daily to stay current
2. **Prioritize Urgent**: Always handle red and orange badges first
3. **Communicate**: Coordinate with team members to avoid duplicate scheduling
4. **Verify Details**: Always double-check patient info before scheduling
5. **Follow Protocol**: Use the suggested appointment types and subtypes as guidelines

---

## 📞 Need Help?

If you encounter any issues or have questions:
1. Check this guide first
2. Review the full documentation in `NEXT_APPOINTMENTS_QUEUE_FEATURE.md`
3. Contact your system administrator

---

## 🎉 You're Ready!

The Next Appointments Queue is designed to make your workflow easier and ensure no patient follow-ups are missed. Start using it today!

**Quick Access**: Appointments → Next Appointments → Schedule → Back to Appointments

Happy scheduling! 🚀

