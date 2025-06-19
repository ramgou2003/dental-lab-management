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
          vdo_details: string | null
          is_nightguard_needed: string | null
          requested_date: string
          due_date: string | null
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
          vdo_details?: string | null
          is_nightguard_needed?: string | null
          requested_date: string
          due_date?: string | null
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
          appliance_type?: string
          arch_type?: string
          upper_treatment_type?: string | null
          lower_treatment_type?: string | null
          screw_type?: string | null
          custom_screw_type?: string | null
          vdo_details?: string | null
          requested_date?: string
          due_date?: string | null
          instructions?: string | null
          notes?: string | null
          status?: string
          lab_name?: string | null
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
