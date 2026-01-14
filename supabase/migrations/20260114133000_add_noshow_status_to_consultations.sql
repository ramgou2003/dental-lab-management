ALTER TABLE consultations DROP CONSTRAINT consultations_consultation_status_check;
ALTER TABLE consultations ADD CONSTRAINT consultations_consultation_status_check CHECK (consultation_status IN ('draft', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'));
