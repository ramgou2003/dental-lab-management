export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      additional_treatments: {
        Row: {
          arch_type: string
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          surgery_date: string | null
          treatment_type: string
          updated_at: string | null
        }
        Insert: {
          arch_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          surgery_date?: string | null
          treatment_type: string
          updated_at?: string | null
        }
        Update: {
          arch_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          surgery_date?: string | null
          treatment_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appliance_types: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          start_time: string
          status: string
          status_code: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type: string
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          start_time: string
          status: string
          status_code?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          start_time?: string
          status?: string
          status_code?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          encounter_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          encounter_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          encounter_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      data_collection_sheets: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          id: string
          patient_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data?: Json
          id?: string
          patient_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          patient_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_collection_sheets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          appliance_type: string
          created_at: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          appliance_type: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          appliance_type?: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          form_status: Database["public"]["Enums"]["encounter_form_status"] | null
          id: string
          next_appointment_scheduled: boolean | null
          notes: string | null
          patient_id: string
          status: string
          updated_at: string | null
          visit_date: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          form_status?: Database["public"]["Enums"]["encounter_form_status"] | null
          id?: string
          next_appointment_scheduled?: boolean | null
          notes?: string | null
          patient_id: string
          status?: string
          updated_at?: string | null
          visit_date?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          form_status?: Database["public"]["Enums"]["encounter_form_status"] | null
          id?: string
          next_appointment_scheduled?: boolean | null
          notes?: string | null
          patient_id?: string
          status?: string
          updated_at?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      head_neck_examinations: {
        Row: {
          airway_evaluation: string | null
          chief_complaints: Json | null
          clinical_observation: Json | null
          created_at: string | null
          dental_classification: Json | null
          evaluation_notes: string | null
          extra_oral_examination: Json | null
          functional_presentation: Json | null
          guideline_questions: Json | null
          id: string
          intra_oral_examination: Json | null
          maxillary_sinuses_evaluation: Json | null
          medical_history: Json | null
          patient_id: string | null
          radiographic_presentation: Json | null
          skeletal_presentation: Json | null
          status: string | null
          tactile_observation: Json | null
          tomography_data: Json | null
          updated_at: string | null
          vital_signs: Json | null
        }
        Insert: {
          airway_evaluation?: string | null
          chief_complaints?: Json | null
          clinical_observation?: Json | null
          created_at?: string | null
          dental_classification?: Json | null
          evaluation_notes?: string | null
          extra_oral_examination?: Json | null
          functional_presentation?: Json | null
          guideline_questions?: Json | null
          id?: string
          intra_oral_examination?: Json | null
          maxillary_sinuses_evaluation?: Json | null
          medical_history?: Json | null
          patient_id?: string | null
          radiographic_presentation?: Json | null
          skeletal_presentation?: Json | null
          status?: string | null
          tactile_observation?: Json | null
          tomography_data?: Json | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Update: {
          airway_evaluation?: string | null
          chief_complaints?: Json | null
          clinical_observation?: Json | null
          created_at?: string | null
          dental_classification?: Json | null
          evaluation_notes?: string | null
          extra_oral_examination?: Json | null
          functional_presentation?: Json | null
          guideline_questions?: Json | null
          id?: string
          intra_oral_examination?: Json | null
          maxillary_sinuses_evaluation?: Json | null
          medical_history?: Json | null
          patient_id?: string | null
          radiographic_presentation?: Json | null
          skeletal_presentation?: Json | null
          status?: string | null
          tactile_observation?: Json | null
          tomography_data?: Json | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "head_neck_examinations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      iv_sedation_forms: {
        Row: {
          access_site: string | null
          asa_class: number | null
          created_at: string | null
          equipment_check: boolean | null
          fluid_type: string | null
          id: string
          mallampati_score: number | null
          medications_administered: Json | null
          monitor_records: Json | null
          mp_class: number | null
          npo_status: string | null
          patient_id: string
          post_op_instructions: string | null
          pre_op_bp: string | null
          pre_op_hr: number | null
          pre_op_o2: number | null
          pre_op_rr: number | null
          pre_op_weight: number | null
          procedure_date: string | null
          procedure_end_time: string | null
          procedure_start_time: string | null
          recovery_bp: string | null
          recovery_hr: number | null
          recovery_o2: number | null
          recovery_rr: number | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          access_site?: string | null
          asa_class?: number | null
          created_at?: string | null
          equipment_check?: boolean | null
          fluid_type?: string | null
          id?: string
          mallampati_score?: number | null
          medications_administered?: Json | null
          monitor_records?: Json | null
          mp_class?: number | null
          npo_status?: string | null
          patient_id: string
          post_op_instructions?: string | null
          pre_op_bp?: string | null
          pre_op_hr?: number | null
          pre_op_o2?: number | null
          pre_op_rr?: number | null
          pre_op_weight?: number | null
          procedure_date?: string | null
          procedure_end_time?: string | null
          procedure_start_time?: string | null
          recovery_bp?: string | null
          recovery_hr?: number | null
          recovery_o2?: number | null
          recovery_rr?: number | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          access_site?: string | null
          asa_class?: number | null
          created_at?: string | null
          equipment_check?: boolean | null
          fluid_type?: string | null
          id?: string
          mallampati_score?: number | null
          medications_administered?: Json | null
          monitor_records?: Json | null
          mp_class?: number | null
          npo_status?: string | null
          patient_id?: string
          post_op_instructions?: string | null
          pre_op_bp?: string | null
          pre_op_hr?: number | null
          pre_op_o2?: number | null
          pre_op_rr?: number | null
          pre_op_weight?: number | null
          procedure_date?: string | null
          procedure_end_time?: string | null
          procedure_start_time?: string | null
          recovery_bp?: string | null
          recovery_hr?: number | null
          recovery_o2?: number | null
          recovery_rr?: number | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iv_sedation_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_report_cards: {
        Row: {
          created_at: string | null
          design_feedback: string | null
          design_rating: number | null
          final_product_feedback: string | null
          final_product_rating: number | null
          fit_feedback: string | null
          fit_rating: number | null
          id: string
          impression_quality: string | null
          overall_comments: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          design_feedback?: string | null
          design_rating?: number | null
          final_product_feedback?: string | null
          final_product_rating?: number | null
          fit_feedback?: string | null
          fit_rating?: number | null
          id?: string
          impression_quality?: string | null
          overall_comments?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          design_feedback?: string | null
          design_rating?: number | null
          final_product_feedback?: string | null
          final_product_rating?: number | null
          fit_feedback?: string | null
          fit_rating?: number | null
          id?: string
          impression_quality?: string | null
          overall_comments?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_report_cards_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_scripts: {
        Row: {
          appliance_type: string
          case_id: string | null
          created_at: string | null
          doctor_name: string
          due_date: string | null
          id: string
          instructions: string | null
          pan_number: string | null
          patient_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appliance_type: string
          case_id?: string | null
          created_at?: string | null
          doctor_name: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          pan_number?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appliance_type?: string
          case_id?: string | null
          created_at?: string | null
          doctor_name?: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          pan_number?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_scripts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_items: {
        Row: {
          action_required: string
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          stage: string
          status: string
          updated_at: string | null
        }
        Insert: {
          action_required: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          stage: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          action_required?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          stage?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      new_patient_leads: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          archived: boolean | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical_history: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          archived?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          archived?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
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
      encounter_form_status: "draft" | "complete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
