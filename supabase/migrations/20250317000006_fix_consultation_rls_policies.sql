-- Fix RLS policies for consultations table to use permission-based access control
-- This ensures only users with proper permissions can create/update/delete consultations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all consultations" ON consultations;
DROP POLICY IF EXISTS "Users can insert consultations" ON consultations;
DROP POLICY IF EXISTS "Users can update consultations" ON consultations;
DROP POLICY IF EXISTS "Users can delete consultations" ON consultations;

-- Create new permission-based policies

-- SELECT: Users with consultation.read permission can view consultations
CREATE POLICY "Users with permission can view consultations"
ON consultations
FOR SELECT
TO authenticated
USING (user_has_permission('consultation.read'));

-- INSERT: Users with consultation.create permission can create consultations
CREATE POLICY "Users with permission can create consultations"
ON consultations
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('consultation.create'));

-- UPDATE: Users with consultation.update permission can update consultations
CREATE POLICY "Users with permission can update consultations"
ON consultations
FOR UPDATE
TO authenticated
USING (user_has_permission('consultation.update'))
WITH CHECK (user_has_permission('consultation.update'));

-- DELETE: Users with consultation.delete permission can delete consultations
CREATE POLICY "Users with permission can delete consultations"
ON consultations
FOR DELETE
TO authenticated
USING (user_has_permission('consultation.delete'));

