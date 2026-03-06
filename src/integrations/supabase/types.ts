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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      branding_settings: {
        Row: {
          accent_color: Json | null
          created_at: string
          default_tone: string
          id: string
          logo_url: string | null
          onboarding_completed: boolean
          primary_color: Json | null
          secondary_color: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: Json | null
          created_at?: string
          default_tone?: string
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          primary_color?: Json | null
          secondary_color?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: Json | null
          created_at?: string
          default_tone?: string
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          primary_color?: Json | null
          secondary_color?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string
          business_phone: string | null
          created_at: string
          first_name: string
          full_name: string | null
          last_name: string
          role: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string
          business_phone?: string | null
          created_at?: string
          first_name?: string
          full_name?: string | null
          last_name?: string
          role?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          business_phone?: string | null
          created_at?: string
          first_name?: string
          full_name?: string | null
          last_name?: string
          role?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          branding: Json | null
          client_email: string | null
          client_name: string
          created_at: string
          declined_at: string | null
          email_body: string | null
          email_subject: string | null
          id: string
          job_description: string
          options: Json | null
          pdf_url: string | null
          proposal_text: string
          public_token: string | null
          responded_at: string | null
          sent_at: string | null
          sent_to: string | null
          service_address: string
          service_type: string
          status: string
          tone: string
          total_price_formatted: string
          total_price_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          branding?: Json | null
          client_email?: string | null
          client_name: string
          created_at?: string
          declined_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          job_description: string
          options?: Json | null
          pdf_url?: string | null
          proposal_text: string
          public_token?: string | null
          responded_at?: string | null
          sent_at?: string | null
          sent_to?: string | null
          service_address: string
          service_type: string
          status?: string
          tone: string
          total_price_formatted: string
          total_price_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          branding?: Json | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          declined_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          job_description?: string
          options?: Json | null
          pdf_url?: string | null
          proposal_text?: string
          public_token?: string | null
          responded_at?: string | null
          sent_at?: string | null
          sent_to?: string | null
          service_address?: string
          service_type?: string
          status?: string
          tone?: string
          total_price_formatted?: string
          total_price_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
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
