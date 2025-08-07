// TypeScript interfaces for the consultations table

export interface Consultation {
  id: string;
  
  // References
  patient_id?: string;
  lead_id?: string;
  appointment_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  patient_name: string;
  consultation_date: string; // ISO date string
  
  // Section 1: Clinical Assessment
  clinical_assessment?: string;
  
  // Section 2: Treatment Recommendations
  treatment_implant_placement: boolean;
  treatment_implant_restoration: boolean;
  treatment_implant_supported: boolean;
  treatment_extraction: boolean;
  treatment_bon_graft: boolean;
  treatment_sinus_lift: boolean;
  treatment_denture: boolean;
  treatment_bridge: boolean;
  treatment_crown: boolean;
  
  // Section 3: Additional Information
  consultation_notes?: string;
  
  // Section 4: Treatment Decision
  treatment_decision?: 'accepted' | 'not_accepted' | 'follow_up_required';
  
  // Section 5: Treatment Cost
  treatment_cost?: number;
  global_treatment_value?: number;
  
  // Section 6: Financing Options
  financing_approved: boolean;
  financing_not_approved: boolean;
  financing_did_not_apply: boolean;
  
  // Section 7: Additional Notes
  additional_notes?: string;
  
  // Status and Progress
  consultation_status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  progress_step: 1 | 2; // 1 = Treatment, 2 = Financial
  
  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ConsultationInsert {
  // References
  patient_id?: string;
  lead_id?: string;
  appointment_id?: string;
  new_patient_packet_id?: string;
  
  // Patient Information
  patient_name: string;
  consultation_date?: string;
  
  // Section 1: Clinical Assessment
  clinical_assessment?: string;
  
  // Section 2: Treatment Recommendations
  treatment_implant_placement?: boolean;
  treatment_implant_restoration?: boolean;
  treatment_implant_supported?: boolean;
  treatment_extraction?: boolean;
  treatment_bon_graft?: boolean;
  treatment_sinus_lift?: boolean;
  treatment_denture?: boolean;
  treatment_bridge?: boolean;
  treatment_crown?: boolean;
  
  // Section 3: Additional Information
  consultation_notes?: string;
  
  // Section 4: Treatment Decision
  treatment_decision?: 'accepted' | 'not_accepted' | 'follow_up_required';
  
  // Section 5: Treatment Cost
  treatment_cost?: number;
  global_treatment_value?: number;
  
  // Section 6: Financing Options
  financing_approved?: boolean;
  financing_not_approved?: boolean;
  financing_did_not_apply?: boolean;
  
  // Section 7: Additional Notes
  additional_notes?: string;
  
  // Status and Progress
  consultation_status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  progress_step?: 1 | 2;
}

export interface ConsultationUpdate {
  // All fields are optional for updates
  patient_id?: string;
  lead_id?: string;
  appointment_id?: string;
  new_patient_packet_id?: string;
  patient_name?: string;
  consultation_date?: string;
  clinical_assessment?: string;
  treatment_implant_placement?: boolean;
  treatment_implant_restoration?: boolean;
  treatment_implant_supported?: boolean;
  treatment_extraction?: boolean;
  treatment_bon_graft?: boolean;
  treatment_sinus_lift?: boolean;
  treatment_denture?: boolean;
  treatment_bridge?: boolean;
  treatment_crown?: boolean;
  consultation_notes?: string;
  treatment_decision?: 'accepted' | 'not_accepted' | 'follow_up_required';
  treatment_cost?: number;
  global_treatment_value?: number;
  financing_approved?: boolean;
  financing_not_approved?: boolean;
  financing_did_not_apply?: boolean;
  additional_notes?: string;
  consultation_status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
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
