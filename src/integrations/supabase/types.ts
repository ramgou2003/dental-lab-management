export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          patient_name: string
          patient_id: string | null
          title: string
          start_time: string
          end_time: string
          appointment_type: string
          status: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          patient_id?: string | null
          title: string
          start_time: string
          end_time: string
          appointment_type: string
          status?: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          patient_id?: string | null
          title?: string
          start_time?: string
          end_time?: string
          appointment_type?: string
          status?: string
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      data_collection_sheets: {
        Row: {
          id: string
          patient_id: string | null
          patient_name: string
          collection_date: string
          reasons_for_collection: string[]
          custom_reason: string | null
          current_upper_appliance: string | null
          current_lower_appliance: string | null
          pre_surgical_pictures: boolean | null
          surgical_pictures: boolean | null
          follow_up_pictures: boolean | null
          fractured_appliance_pictures: boolean | null
          cbct_taken: boolean | null
          pre_surgical_jaw_records_upper: boolean | null
          pre_surgical_jaw_records_lower: boolean | null
          facial_scan: boolean | null
          jaw_records_upper: boolean | null
          jaw_records_lower: boolean | null
          tissue_scan_upper: boolean | null
          tissue_scan_lower: boolean | null
          photogrammetry_upper: boolean | null
          photogrammetry_lower: boolean | null
          dc_ref_scan_upper: boolean | null
          dc_ref_scan_lower: boolean | null
          appliance_360_upper: boolean | null
          appliance_360_lower: boolean | null
          additional_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          patient_name: string
          collection_date: string
          reasons_for_collection: string[]
          custom_reason?: string | null
          current_upper_appliance?: string | null
          current_lower_appliance?: string | null
          pre_surgical_pictures?: boolean | null
          surgical_pictures?: boolean | null
          follow_up_pictures?: boolean | null
          fractured_appliance_pictures?: boolean | null
          cbct_taken?: boolean | null
          pre_surgical_jaw_records_upper?: boolean | null
          pre_surgical_jaw_records_lower?: boolean | null
          facial_scan?: boolean | null
          jaw_records_upper?: boolean | null
          jaw_records_lower?: boolean | null
          tissue_scan_upper?: boolean | null
          tissue_scan_lower?: boolean | null
          photogrammetry_upper?: boolean | null
          photogrammetry_lower?: boolean | null
          dc_ref_scan_upper?: boolean | null
          dc_ref_scan_lower?: boolean | null
          appliance_360_upper?: boolean | null
          appliance_360_lower?: boolean | null
          additional_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          patient_name?: string
          collection_date?: string
          reasons_for_collection?: string[]
          custom_reason?: string | null
          current_upper_appliance?: string | null
          current_lower_appliance?: string | null
          pre_surgical_pictures?: boolean | null
          surgical_pictures?: boolean | null
          follow_up_pictures?: boolean | null
          fractured_appliance_pictures?: boolean | null
          cbct_taken?: boolean | null
          pre_surgical_jaw_records_upper?: boolean | null
          pre_surgical_jaw_records_lower?: boolean | null
          facial_scan?: boolean | null
          jaw_records_upper?: boolean | null
          jaw_records_lower?: boolean | null
          tissue_scan_upper?: boolean | null
          tissue_scan_lower?: boolean | null
          photogrammetry_upper?: boolean | null
          photogrammetry_lower?: boolean | null
          dc_ref_scan_upper?: boolean | null
          dc_ref_scan_lower?: boolean | null
          appliance_360_upper?: boolean | null
          appliance_360_lower?: boolean | null
          additional_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_collection_sheets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      delivery_items: {
        Row: {
          id: string
          lab_script_id: string | null
          patient_name: string
          delivery_status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          lab_script_id?: string | null
          patient_name: string
          delivery_status: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          lab_script_id?: string | null
          patient_name?: string
          delivery_status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      manufacturing_items: {
        Row: {
          id: string
          lab_script_id: string | null
          patient_name: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          lab_script_id?: string | null
          patient_name: string
          status: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          lab_script_id?: string | null
          patient_name?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_report_cards: {
        Row: {
          id: string
          lab_script_id: string | null
          patient_name: string
          arch_type: string
          upper_appliance_type: string | null
          lower_appliance_type: string | null
          screw: string
          shade: string
          implant_on_upper: string | null
          implant_on_lower: string | null
          tooth_library_upper: string | null
          tooth_library_lower: string | null
          upper_appliance_number: string | null
          lower_appliance_number: string | null
          notes_and_remarks: string
          status: string
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lab_script_id?: string | null
          patient_name: string
          arch_type: string
          upper_appliance_type?: string | null
          lower_appliance_type?: string | null
          screw: string
          shade: string
          implant_on_upper?: string | null
          implant_on_lower?: string | null
          tooth_library_upper?: string | null
          tooth_library_lower?: string | null
          upper_appliance_number?: string | null
          lower_appliance_number?: string | null
          notes_and_remarks: string
          status?: string
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lab_script_id?: string | null
          patient_name?: string
          arch_type?: string
          upper_appliance_type?: string | null
          lower_appliance_type?: string | null
          screw?: string
          shade?: string
          implant_on_upper?: string | null
          implant_on_lower?: string | null
          tooth_library_upper?: string | null
          tooth_library_lower?: string | null
          upper_appliance_number?: string | null
          lower_appliance_number?: string | null
          notes_and_remarks?: string
          status?: string
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_report_cards_lab_script_id_fkey"
            columns: ["lab_script_id"]
            isOneToOne: false
            referencedRelation: "lab_scripts"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_scripts: {
        Row: {
          id: string
          patient_id: string | null
          patient_name: string
          arch_type: string
          upper_appliance_type: string | null
          lower_appliance_type: string | null
          upper_treatment_type: string | null
          lower_treatment_type: string | null
          screw_type: string | null
          custom_screw_type: string | null
          material: string | null
          shade: string | null
          vdo_details: string | null
          is_nightguard_needed: string | null
          requested_date: string
          due_date: string | null
          completion_date: string | null
          completed_by: string | null
          completed_by_name: string | null
          created_by: string | null
          created_by_name: string | null
          instructions: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          patient_name: string
          arch_type: string
          upper_appliance_type?: string | null
          lower_appliance_type?: string | null
          upper_treatment_type?: string | null
          lower_treatment_type?: string | null
          screw_type?: string | null
          custom_screw_type?: string | null
          material?: string | null
          shade?: string | null
          vdo_details?: string | null
          is_nightguard_needed?: string | null
          requested_date: string
          due_date?: string | null
          completion_date?: string | null
          completed_by?: string | null
          completed_by_name?: string | null
          created_by?: string | null
          created_by_name?: string | null
          instructions?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          patient_name?: string
          arch_type?: string
          upper_appliance_type?: string | null
          lower_appliance_type?: string | null
          upper_treatment_type?: string | null
          lower_treatment_type?: string | null
          screw_type?: string | null
          custom_screw_type?: string | null
          material?: string | null
          shade?: string | null
          vdo_details?: string | null
          is_nightguard_needed?: string | null
          requested_date?: string
          due_date?: string | null
          completion_date?: string | null
          completed_by?: string | null
          completed_by_name?: string | null
          created_by?: string | null
          created_by_name?: string | null
          instructions?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_scripts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      iv_sedation_forms: {
        Row: {
          id: string
          patient_id: string | null
          patient_name: string
          sedation_date: string
          status: string
          upper_treatment: string | null
          lower_treatment: string | null
          upper_surgery_type: string | null
          lower_surgery_type: string | null
          height_feet: number | null
          height_inches: number | null
          weight: number | null
          npo_status: string | null
          morning_medications: string | null
          allergies: string[] | null
          allergies_other: string | null
          pregnancy_risk: string | null
          last_menstrual_cycle: string | null
          anesthesia_history: string | null
          anesthesia_history_other: string | null
          respiratory_problems: string[] | null
          respiratory_problems_other: string | null
          cardiovascular_problems: string[] | null
          cardiovascular_problems_other: string | null
          gastrointestinal_problems: string[] | null
          gastrointestinal_problems_other: string | null
          neurologic_problems: string[] | null
          neurologic_problems_other: string | null
          endocrine_renal_problems: string[] | null
          endocrine_renal_problems_other: string | null
          last_a1c_level: string | null
          miscellaneous: string[] | null
          miscellaneous_other: string | null
          social_history: string[] | null
          social_history_other: string | null
          well_developed_nourished: string | null
          patient_anxious: string | null
          asa_classification: string | null
          airway_evaluation: string[] | null
          airway_evaluation_other: string | null
          mallampati_score: string | null
          heart_lung_evaluation: string[] | null
          heart_lung_evaluation_other: string | null
          instruments_checklist: Json | null
          sedation_type: string | null
          medications_planned: string[] | null
          medications_other: string | null
          administration_route: string[] | null
          emergency_protocols: Json | null
          level_of_sedation: string | null
          time_in_room: string | null
          sedation_start_time: string | null
          monitoring_log: Json | null
          sedation_end_time: string | null
          out_of_room_time: string | null
          post_procedure_notes: string | null
          discharge_criteria_met: Json | null
          follow_up_instructions: string | null
          follow_up_instructions_given_to: string | null
          discharged_to: string | null
          pain_level_discharge: string | null
          other_remarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          patient_name: string
          sedation_date: string
          status?: string
          upper_treatment?: string | null
          lower_treatment?: string | null
          upper_surgery_type?: string | null
          lower_surgery_type?: string | null
          height_feet?: number | null
          height_inches?: number | null
          weight?: number | null
          npo_status?: string | null
          morning_medications?: string | null
          allergies?: string[] | null
          allergies_other?: string | null
          pregnancy_risk?: string | null
          last_menstrual_cycle?: string | null
          anesthesia_history?: string | null
          anesthesia_history_other?: string | null
          respiratory_problems?: string[] | null
          respiratory_problems_other?: string | null
          cardiovascular_problems?: string[] | null
          cardiovascular_problems_other?: string | null
          gastrointestinal_problems?: string[] | null
          gastrointestinal_problems_other?: string | null
          neurologic_problems?: string[] | null
          neurologic_problems_other?: string | null
          endocrine_renal_problems?: string[] | null
          endocrine_renal_problems_other?: string | null
          last_a1c_level?: string | null
          miscellaneous?: string[] | null
          miscellaneous_other?: string | null
          social_history?: string[] | null
          social_history_other?: string | null
          well_developed_nourished?: string | null
          patient_anxious?: string | null
          asa_classification?: string | null
          airway_evaluation?: string[] | null
          airway_evaluation_other?: string | null
          mallampati_score?: string | null
          heart_lung_evaluation?: string[] | null
          heart_lung_evaluation_other?: string | null
          instruments_checklist?: Json | null
          sedation_type?: string | null
          medications_planned?: string[] | null
          medications_other?: string | null
          administration_route?: string[] | null
          emergency_protocols?: Json | null
          level_of_sedation?: string | null
          time_in_room?: string | null
          sedation_start_time?: string | null
          monitoring_log?: Json | null
          sedation_end_time?: string | null
          out_of_room_time?: string | null
          post_procedure_notes?: string | null
          discharge_criteria_met?: Json | null
          follow_up_instructions?: string | null
          follow_up_instructions_given_to?: string | null
          discharged_to?: string | null
          pain_level_discharge?: string | null
          other_remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          patient_name?: string
          sedation_date?: string
          status?: string
          upper_treatment?: string | null
          lower_treatment?: string | null
          upper_surgery_type?: string | null
          lower_surgery_type?: string | null
          height_feet?: number | null
          height_inches?: number | null
          weight?: number | null
          npo_status?: string | null
          morning_medications?: string | null
          allergies?: string[] | null
          allergies_other?: string | null
          pregnancy_risk?: string | null
          last_menstrual_cycle?: string | null
          anesthesia_history?: string | null
          anesthesia_history_other?: string | null
          respiratory_problems?: string[] | null
          respiratory_problems_other?: string | null
          cardiovascular_problems?: string[] | null
          cardiovascular_problems_other?: string | null
          gastrointestinal_problems?: string[] | null
          gastrointestinal_problems_other?: string | null
          neurologic_problems?: string[] | null
          neurologic_problems_other?: string | null
          endocrine_renal_problems?: string[] | null
          endocrine_renal_problems_other?: string | null
          last_a1c_level?: string | null
          miscellaneous?: string[] | null
          miscellaneous_other?: string | null
          social_history?: string[] | null
          social_history_other?: string | null
          well_developed_nourished?: string | null
          patient_anxious?: string | null
          asa_classification?: string | null
          airway_evaluation?: string[] | null
          airway_evaluation_other?: string | null
          mallampati_score?: string | null
          heart_lung_evaluation?: string[] | null
          heart_lung_evaluation_other?: string | null
          instruments_checklist?: Json | null
          sedation_type?: string | null
          medications_planned?: string[] | null
          medications_other?: string | null
          administration_route?: string[] | null
          emergency_protocols?: Json | null
          level_of_sedation?: string | null
          time_in_room?: string | null
          sedation_start_time?: string | null
          monitoring_log?: Json | null
          sedation_end_time?: string | null
          out_of_room_time?: string | null
          post_procedure_notes?: string | null
          discharge_criteria_met?: Json | null
          follow_up_instructions?: string | null
          follow_up_instructions_given_to?: string | null
          discharged_to?: string | null
          pain_level_discharge?: string | null
          other_remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iv_sedation_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          full_name: string
          date_of_birth: string
          phone: string | null
          gender: string | null
          street: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          status: string | null
          treatment_type: string | null
          upper_arch: boolean | null
          lower_arch: boolean | null
          upper_treatment: string | null
          lower_treatment: string | null
          upper_surgery_date: string | null
          lower_surgery_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone?: string | null
          gender?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: string | null
          treatment_type?: string | null
          upper_arch?: boolean | null
          lower_arch?: boolean | null
          upper_treatment?: string | null
          lower_treatment?: string | null
          upper_surgery_date?: string | null
          lower_surgery_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          phone?: string | null
          gender?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: string | null
          treatment_type?: string | null
          upper_arch?: boolean | null
          lower_arch?: boolean | null
          upper_treatment?: string | null
          lower_treatment?: string | null
          upper_surgery_date?: string | null
          lower_surgery_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      new_patient_leads: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          reason_for_visit: string | null
          dental_problems: string[] | null
          immediate_needs: string[] | null
          need_loved_one_help: string | null
          use_financing: string | null
          credit_score: string | null
          barriers: string[] | null
          personal_first_name: string | null
          personal_last_name: string | null
          personal_phone: string | null
          personal_email: string | null
          home_address: string | null
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          medical_conditions: string[] | null
          has_medical_insurance: string | null
          best_contact_time: string | null
          phone_call_preference: string | null
          implant_type: string | null
          urgency: string | null
          preferred_contact: string | null
          best_time_to_call: string | null
          hear_about_us: string | null
          additional_notes: string | null
          agree_to_terms: boolean | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          date_of_birth: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          gender: string | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          reason_for_visit?: string | null
          dental_problems?: string[] | null
          immediate_needs?: string[] | null
          need_loved_one_help?: string | null
          use_financing?: string | null
          credit_score?: string | null
          barriers?: string[] | null
          personal_first_name?: string | null
          personal_last_name?: string | null
          personal_phone?: string | null
          personal_email?: string | null
          home_address?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          medical_conditions?: string[] | null
          has_medical_insurance?: string | null
          best_contact_time?: string | null
          phone_call_preference?: string | null
          implant_type?: string | null
          urgency?: string | null
          preferred_contact?: string | null
          best_time_to_call?: string | null
          hear_about_us?: string | null
          additional_notes?: string | null
          agree_to_terms?: boolean | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          gender?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          reason_for_visit?: string | null
          dental_problems?: string[] | null
          immediate_needs?: string[] | null
          need_loved_one_help?: string | null
          use_financing?: string | null
          credit_score?: string | null
          barriers?: string[] | null
          personal_first_name?: string | null
          personal_last_name?: string | null
          personal_phone?: string | null
          personal_email?: string | null
          home_address?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          medical_conditions?: string[] | null
          has_medical_insurance?: string | null
          best_contact_time?: string | null
          phone_call_preference?: string | null
          implant_type?: string | null
          urgency?: string | null
          preferred_contact?: string | null
          best_time_to_call?: string | null
          hear_about_us?: string | null
          additional_notes?: string | null
          agree_to_terms?: boolean | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          gender?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
