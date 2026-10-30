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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_activity: {
        Row: {
          created_at: string
          detail: string | null
          event: string
          id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event: string
          id?: string
          owner_id?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event?: string
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      advice_feedback: {
        Row: {
          check_in_id: string
          created_at: string
          helpful: boolean
          id: string
          owner_id: string
          recommendation_key: string
        }
        Insert: {
          check_in_id: string
          created_at?: string
          helpful: boolean
          id?: string
          owner_id?: string
          recommendation_key: string
        }
        Update: {
          check_in_id?: string
          created_at?: string
          helpful?: boolean
          id?: string
          owner_id?: string
          recommendation_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "advice_feedback_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_quota: {
        Row: {
          count: number
          owner_id: string
          window_key: string
        }
        Insert: {
          count?: number
          owner_id: string
          window_key: string
        }
        Update: {
          count?: number
          owner_id?: string
          window_key?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          engine: string
          engine_scores: Json | null
          id: string
          metrics: Json
          notes: string | null
          overall_score: number
          owner_id: string
          photo_path: string | null
          profile_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          engine: string
          engine_scores?: Json | null
          id?: string
          metrics: Json
          notes?: string | null
          overall_score: number
          owner_id: string
          photo_path?: string | null
          profile_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          engine?: string
          engine_scores?: Json | null
          id?: string
          metrics?: Json
          notes?: string | null
          overall_score?: number
          owner_id?: string
          photo_path?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "person_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_profiles: {
        Row: {
          age_band: string | null
          allergies: string | null
          country: string | null
          created_at: string
          id: string
          is_me: boolean
          name: string
          pregnancy: boolean
          skin_type: string | null
          user_id: string
        }
        Insert: {
          age_band?: string | null
          allergies?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_me?: boolean
          name: string
          pregnancy?: boolean
          skin_type?: string | null
          user_id?: string
        }
        Update: {
          age_band?: string | null
          allergies?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_me?: boolean
          name?: string
          pregnancy?: boolean
          skin_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      photo_deletion_requests: {
        Row: {
          check_in_id: string | null
          created_at: string
          id: string
          owner_id: string
          photo_path: string
          processed_at: string | null
          status: string
        }
        Insert: {
          check_in_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          photo_path: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          check_in_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          photo_path?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      photo_uploads: {
        Row: {
          check_in_id: string | null
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          photo_path: string
          profile_id: string | null
          quota_windows: Json | null
          status: string
          task_id: string | null
        }
        Insert: {
          check_in_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          photo_path: string
          profile_id?: string | null
          quota_windows?: Json | null
          status?: string
          task_id?: string | null
        }
        Update: {
          check_in_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          photo_path?: string
          profile_id?: string | null
          quota_windows?: Json | null
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_uploads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "person_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consent_version: string | null
          created_at: string
          display_name: string | null
          onboarded: boolean
          onboarding_step: number
          routine_morning: string | null
          routine_night: string | null
          routine_reminders: boolean
          updated_at: string
          user_id: string
          weekly_reminder: boolean
        }
        Insert: {
          consent_version?: string | null
          created_at?: string
          display_name?: string | null
          onboarded?: boolean
          onboarding_step?: number
          routine_morning?: string | null
          routine_night?: string | null
          routine_reminders?: boolean
          updated_at?: string
          user_id: string
          weekly_reminder?: boolean
        }
        Update: {
          consent_version?: string | null
          created_at?: string
          display_name?: string | null
          onboarded?: boolean
          onboarding_step?: number
          routine_morning?: string | null
          routine_night?: string | null
          routine_reminders?: boolean
          updated_at?: string
          user_id?: string
          weekly_reminder?: boolean
        }
        Relationships: []
      }
      skin_advice: {
        Row: {
          check_in_id: string
          created_at: string
          id: string
          owner_id: string
          payload: Json
          safety_hash: string
        }
        Insert: {
          check_in_id: string
          created_at?: string
          id?: string
          owner_id: string
          payload: Json
          safety_hash: string
        }
        Update: {
          check_in_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          payload?: Json
          safety_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "skin_advice_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      skin_products: {
        Row: {
          actives: string | null
          brand: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          owner_id: string
          profile_id: string
          routine_slot: string
          started_date: string
          stopped_date: string | null
        }
        Insert: {
          actives?: string | null
          brand?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          owner_id?: string
          profile_id: string
          routine_slot?: string
          started_date?: string
          stopped_date?: string | null
        }
        Update: {
          actives?: string | null
          brand?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          profile_id?: string
          routine_slot?: string
          started_date?: string
          stopped_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skin_products_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "person_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      release_analysis_quota: {
        Args: { p_app: string; p_day: string; p_owner: string; p_short: string }
        Returns: undefined
      }
      reserve_analysis_quota: {
        Args: { p_app: string; p_day: string; p_owner: string; p_short: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
