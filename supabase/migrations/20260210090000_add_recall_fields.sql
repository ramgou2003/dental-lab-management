-- Migration to add columns to surgical_recall_sheets
ALTER TABLE surgical_recall_sheets 
ADD COLUMN IF NOT EXISTS is_graft_used BOOLEAN DEFAULT false;

ALTER TABLE surgical_recall_sheets 
ADD COLUMN IF NOT EXISTS is_membrane_used BOOLEAN DEFAULT false;

ALTER TABLE surgical_recall_sheets 
ADD COLUMN IF NOT EXISTS created_by UUID;
