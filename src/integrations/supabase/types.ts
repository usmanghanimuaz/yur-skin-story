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
      account_controls: {
        Row: {
          blocked: boolean
          reason: string | null
          set_at: string
          set_by: string | null
          user_id: string
        }
        Insert: {
          blocked?: boolean
          reason?: string | null
          set_at?: string
          set_by?: string | null
          user_id: string
        }
        Update: {
          blocked?: boolean
          reason?: string | null
          set_at?: string
          set_by?: string | null
          user_id?: string
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
      catalogue_products: {
        Row: {
          actives: string
          brand: string
          category: string
          created_at: string
          id: string
          name: string
          pregnancy_safe: boolean | null
          status: string
          targets: string[]
          updated_at: string
        }
        Insert: {
          actives?: string
          brand?: string
          category?: string
          created_at?: string
          id?: string
          name: string
          pregnancy_safe?: boolean | null
          status?: string
          targets?: string[]
          updated_at?: string
        }
        Update: {
          actives?: string
          brand?: string
          category?: string
          created_at?: string
          id?: string
          name?: string
          pregnancy_safe?: boolean | null
          status?: string
          targets?: string[]
          updated_at?: string
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
      evidence_entries: {
        Row: {
          concern: string
          created_at: string
          id: string
          ingredient: string
          reviewed_at: string | null
          source_url: string | null
          status: string
          summary: string
        }
        Insert: {
          concern?: string
          created_at?: string
          id?: string
          ingredient: string
          reviewed_at?: string | null
          source_url?: string | null
          status?: string
          summary?: string
        }
        Update: {
          concern?: string
          created_at?: string
          id?: string
          ingredient?: string
          reviewed_at?: string | null
          source_url?: string | null
          status?: string
          summary?: string
        }
        Relationships: []
      }
      locale_overrides: {
        Row: {
          label_key: string
          label_value: string
          locale: string
          updated_at: string
        }
        Insert: {
          label_key: string
          label_value: string
          locale: string
          updated_at?: string
        }
        Update: {
          label_key?: string
          label_value?: string
          locale?: string
          updated_at?: string
        }
        Relationships: []
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
          attempts: number
          check_in_id: string | null
          created_at: string
          id: string
          last_error: string | null
          owner_id: string
          photo_path: string
          processed_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          check_in_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          owner_id: string
          photo_path: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          check_in_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
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
      product_availability: {
        Row: {
          country: string
          created_at: string
          currency: string | null
          id: string
          price: number | null
          price_verified_at: string | null
          product_id: string
          retailer: string
          url: string | null
        }
        Insert: {
          country: string
          created_at?: string
          currency?: string | null
          id?: string
          price?: number | null
          price_verified_at?: string | null
          product_id: string
          retailer?: string
          url?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string | null
          id?: string
          price?: number | null
          price_verified_at?: string | null
          product_id?: string
          retailer?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consent_version: string | null
          created_at: string
          display_name: string | null
          locale: string
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
          locale?: string
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
          locale?: string
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
      scan_logs: {
        Row: {
          created_at: string
          detail: string | null
          duration_ms: number | null
          id: string
          owner_id: string
          stage: string
          status: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          duration_ms?: number | null
          id?: string
          owner_id: string
          stage: string
          status: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          duration_ms?: number | null
          id?: string
          owner_id?: string
          stage?: string
          status?: string
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
      support_messages: {
        Row: {
          admin_reply: string | null
          body: string
          created_at: string
          id: string
          owner_id: string
          replied_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_reply?: string | null
          body: string
          created_at?: string
          id?: string
          owner_id: string
          replied_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_reply?: string | null
          body?: string
          created_at?: string
          id?: string
          owner_id?: string
          replied_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_email: { Args: { _email: string }; Returns: boolean }
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
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
