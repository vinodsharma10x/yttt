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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audience_profiles: {
        Row: {
          age_range: string | null
          buying_patterns: string | null
          content_consumption_habits: string | null
          created_at: string
          current_state: string | null
          desired_state: string | null
          goals: string[] | null
          id: string
          income_level: string | null
          is_primary: boolean | null
          location: string | null
          pain_points: string[] | null
          preferred_platforms: string[] | null
          profession: string | null
          profile_name: string
          proof_points: string[] | null
          solution_approach: string | null
          time_availability: string | null
          unique_angle: string | null
          updated_at: string
          user_id: string
          value_proposition: string | null
          values: string[] | null
        }
        Insert: {
          age_range?: string | null
          buying_patterns?: string | null
          content_consumption_habits?: string | null
          created_at?: string
          current_state?: string | null
          desired_state?: string | null
          goals?: string[] | null
          id?: string
          income_level?: string | null
          is_primary?: boolean | null
          location?: string | null
          pain_points?: string[] | null
          preferred_platforms?: string[] | null
          profession?: string | null
          profile_name: string
          proof_points?: string[] | null
          solution_approach?: string | null
          time_availability?: string | null
          unique_angle?: string | null
          updated_at?: string
          user_id: string
          value_proposition?: string | null
          values?: string[] | null
        }
        Update: {
          age_range?: string | null
          buying_patterns?: string | null
          content_consumption_habits?: string | null
          created_at?: string
          current_state?: string | null
          desired_state?: string | null
          goals?: string[] | null
          id?: string
          income_level?: string | null
          is_primary?: boolean | null
          location?: string | null
          pain_points?: string[] | null
          preferred_platforms?: string[] | null
          profession?: string | null
          profile_name?: string
          proof_points?: string[] | null
          solution_approach?: string | null
          time_availability?: string | null
          unique_angle?: string | null
          updated_at?: string
          user_id?: string
          value_proposition?: string | null
          values?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_settings: {
        Row: {
          created_at: string
          id: string
          performance_goals: Json | null
          publishing_frequency: string | null
          target_video_length: string | null
          updated_at: string
          user_id: string
          video_formats: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          performance_goals?: Json | null
          publishing_frequency?: string | null
          target_video_length?: string | null
          updated_at?: string
          user_id: string
          video_formats?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          performance_goals?: Json | null
          publishing_frequency?: string | null
          target_video_length?: string | null
          updated_at?: string
          user_id?: string
          video_formats?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_voice: string | null
          channel_name: string | null
          channel_niche: string | null
          content_pillars: string[] | null
          created_at: string
          id: string
          updated_at: string
          upload_schedule: string | null
        }
        Insert: {
          brand_voice?: string | null
          channel_name?: string | null
          channel_niche?: string | null
          content_pillars?: string[] | null
          created_at?: string
          id: string
          updated_at?: string
          upload_schedule?: string | null
        }
        Update: {
          brand_voice?: string | null
          channel_name?: string | null
          channel_niche?: string | null
          content_pillars?: string[] | null
          created_at?: string
          id?: string
          updated_at?: string
          upload_schedule?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
