# Fix Encounter Form Error - Missing Column

## 🔴 Error
```
"Could not find the 'next_appointment_date' column of 'encounters' in the schema cache"
```

## 🔧 Solution

The database migration hasn't been applied yet. You need to run the SQL migration to add the missing columns.

---

## 📝 Steps to Fix

### Option 1: Run Migration in Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: **NYDI**

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL**

```sql
-- Add next appointment fields to encounters table
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_type TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_subtype TEXT;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_date DATE;

-- Add comments to document the new columns
COMMENT ON COLUMN encounters.next_appointment_type IS 'Type of the next appointment (e.g., consultation, follow-up, data-collection, printed-try-in, surgery, surgical-revision, emergency)';
COMMENT ON COLUMN encounters.next_appointment_subtype IS 'Subtype of the next appointment (e.g., 7-day-followup, 75-day-data-collection, etc.)';
COMMENT ON COLUMN encounters.next_appointment_date IS 'Suggested date for the next appointment';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_encounters_next_appointment_date ON encounters(next_appointment_date);
```

4. **Run the Query**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for "Success" message

5. **Verify the Columns Were Added**

Run this query to check:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'encounters' 
AND column_name LIKE 'next_appointment%';
```

You should see:
- `next_appointment_type` (text)
- `next_appointment_subtype` (text)
- `next_appointment_date` (date)

---

### Option 2: Run Second Migration (Scheduled Status)

After the first migration works, also run this one:

```sql
-- Add next appointment scheduled status tracking to encounters table
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled BOOLEAN DEFAULT FALSE;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS next_appointment_scheduled_by UUID REFERENCES auth.users(id);

ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS scheduled_appointment_id UUID REFERENCES appointments(id);

-- Add comments
COMMENT ON COLUMN encounters.next_appointment_scheduled IS 'Whether the suggested next appointment has been scheduled';
COMMENT ON COLUMN encounters.next_appointment_scheduled_at IS 'When the next appointment was scheduled';
COMMENT ON COLUMN encounters.next_appointment_scheduled_by IS 'User who scheduled the next appointment';
COMMENT ON COLUMN encounters.scheduled_appointment_id IS 'ID of the appointment that was created for this next appointment';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_encounters_next_appointment_scheduled ON encounters(next_appointment_scheduled);
CREATE INDEX IF NOT EXISTS idx_encounters_scheduled_appointment_id ON encounters(scheduled_appointment_id);
```

---

## ✅ After Running Migrations

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Try saving the encounter form again**
3. **The error should be gone!**

---

## 🧪 Test the Fix

1. Go to Consultation page
2. Click on a patient
3. Fill out the encounter form
4. Add "Next Appointment" details
5. Click "Save Encounter"
6. Should save successfully! ✅

---

## 📁 Migration Files

The SQL above comes from these migration files:
- `supabase/migrations/20250326000001_add_next_appointment_to_encounters.sql`
- `supabase/migrations/20250326000002_add_next_appointment_scheduled_status.sql`

---

## 🆘 If Still Not Working

1. **Check if encounters table exists:**
   ```sql
   SELECT * FROM encounters LIMIT 1;
   ```

2. **Check current columns:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'encounters';
   ```

3. **Clear browser cache and reload**

4. **Check browser console for other errors**

---

## 💡 Why This Happened

The migration files exist in your codebase but haven't been applied to the Supabase database yet. Migrations need to be run manually in the Supabase SQL Editor or using the Supabase CLI.

---

## ✨ Once Fixed

After applying these migrations, you'll be able to:
- ✅ Save encounter forms with next appointment details
- ✅ View next appointments queue
- ✅ Schedule suggested appointments
- ✅ Track who scheduled appointments and when

Good luck! 🚀

