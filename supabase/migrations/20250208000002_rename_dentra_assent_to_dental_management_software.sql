-- Rename downloaded_to_dentra_assent column to downloaded_to_dental_management_software
-- This migration updates the column name to be more generic and accurate

-- Rename the column in financial_agreements table
ALTER TABLE financial_agreements 
RENAME COLUMN downloaded_to_dentra_assent TO downloaded_to_dental_management_software;

-- Update the column comment to reflect the new name
COMMENT ON COLUMN financial_agreements.downloaded_to_dental_management_software IS 'Indicates if the financial agreement has been downloaded to the dental management software system';
