// TypeScript interfaces for the consultations table

export interface Consultation {
  id: string;

  // References
  consultation_patient_id?: string;
  new_patient_packet_id?: string;
  patient_id?: string;
  appointment_id?: string;

  // Patient Information
  patient_name: string;
  consultation_date: string; // ISO date string

  // Section 1: Clinical Assessment
  clinical_assessment?: string;

  // Section 2: Treatment Recommendations (JSON)
  treatment_recommendations?: {
    implantPlacement: boolean;
    implantRestoration: boolean;
    implantSupported: boolean;
    extraction: boolean;
    bonGraft: boolean;
    sinusLift: boolean;
    denture: boolean;
    bridge: boolean;
    crown: boolean;
  };

  // Section 3: Additional Information
  additional_information?: string;
  consultation_notes?: string;

  // Section 4: Treatment Decision
  treatment_decision?: 'accepted' | 'not-accepted' | 'followup-required';
  treatment_plan_approved?: boolean;
  follow_up_required?: boolean;

  // Section 5: Treatment Cost
  treatment_cost?: number;
  global_treatment_value?: number;

  // Section 6: Financing Options (JSON)
  financing_options?: {
    yesApproved: boolean;
    noNotApproved: boolean;
    didNotApply: boolean;
  };

  // Section 7: Financing Details
  financing_not_approved_reason?: string;
  financial_notes?: string;

  // Follow-up Information
  followup_date?: string;
  followup_reason?: string;

  // Status and Progress
  consultation_status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled';
  progress_step: 1 | 2; // 1 = Treatment, 2 = Financial

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ConsultationInsert {
  // References
  consultation_patient_id?: string;
  new_patient_packet_id?: string;
  patient_id?: string;
  appointment_id?: string;

  // Patient Information
  patient_name: string;
  consultation_date?: string;

  // Section 1: Clinical Assessment
  clinical_assessment?: string;

  // Section 2: Treatment Recommendations (JSON)
  treatment_recommendations?: {
    implantPlacement?: boolean;
    implantRestoration?: boolean;
    implantSupported?: boolean;
    extraction?: boolean;
    bonGraft?: boolean;
    sinusLift?: boolean;
    denture?: boolean;
    bridge?: boolean;
    crown?: boolean;
  };

  // Section 3: Additional Information
  additional_information?: string;
  consultation_notes?: string;

  // Section 4: Treatment Decision
  treatment_decision?: 'accepted' | 'not-accepted' | 'followup-required';
  treatment_plan_approved?: boolean;
  follow_up_required?: boolean;

  // Section 5: Treatment Cost
  treatment_cost?: number;
  global_treatment_value?: number;

  // Section 6: Financing Options (JSON)
  financing_options?: {
    yesApproved?: boolean;
    noNotApproved?: boolean;
    didNotApply?: boolean;
  };

  // Section 7: Financing Details
  financing_not_approved_reason?: string;
  financial_notes?: string;

  // Follow-up Information
  followup_date?: string;
  followup_reason?: string;

  // Status and Progress
  consultation_status?: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled';
  progress_step?: 1 | 2;
}

export interface ConsultationUpdate {
  // All fields are optional for updates
  consultation_patient_id?: string;
  new_patient_packet_id?: string;
  patient_id?: string;
  appointment_id?: string;
  patient_name?: string;
  consultation_date?: string;
  clinical_assessment?: string;
  treatment_recommendations?: {
    implantPlacement?: boolean;
    implantRestoration?: boolean;
    implantSupported?: boolean;
    extraction?: boolean;
    bonGraft?: boolean;
    sinusLift?: boolean;
    denture?: boolean;
    bridge?: boolean;
    crown?: boolean;
  };
  additional_information?: string;
  consultation_notes?: string;
  treatment_decision?: 'accepted' | 'not-accepted' | 'followup-required';
  treatment_plan_approved?: boolean;
  follow_up_required?: boolean;
  treatment_cost?: number;
  global_treatment_value?: number;
  financing_options?: {
    yesApproved?: boolean;
    noNotApproved?: boolean;
    didNotApply?: boolean;
  };
  financing_not_approved_reason?: string;
  financial_notes?: string;
  followup_date?: string;
  followup_reason?: string;
  consultation_status?: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled';
  progress_step?: 1 | 2;
  completed_at?: string;
}

// Form data interfaces for the consultation form steps
export interface TreatmentFormData {
  clinical_assessment: string;
  treatment_recommendations: {
    implant_placement: boolean;
    implant_restoration: boolean;
    implant_supported: boolean;
    extraction: boolean;
    bon_graft: boolean;
    sinus_lift: boolean;
    denture: boolean;
    bridge: boolean;
    crown: boolean;
  };
  consultation_notes: string;
}

export interface FinancialFormData {
  treatment_decision: 'accepted' | 'not_accepted' | 'follow_up_required';
  treatment_cost: number;
  global_treatment_value: number;
  financing_options: {
    approved: boolean;
    not_approved: boolean;
    did_not_apply: boolean;
  };
  additional_notes: string;
}

export interface ConsultationFormData {
  treatment: TreatmentFormData;
  financial: FinancialFormData;
}
