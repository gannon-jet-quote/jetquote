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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
          payment_link_or_instructions: string | null
          payment_method_name: string | null
          payment_note: string | null
          review_link: string | null
          review_platform: string | null
          review_signature_name: string | null
          role: string
          title: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          business_name?: string
          business_phone?: string | null
          created_at?: string
          first_name?: string
          full_name?: string | null
          last_name?: string
          payment_link_or_instructions?: string | null
          payment_method_name?: string | null
          payment_note?: string | null
          review_link?: string | null
          review_platform?: string | null
          review_signature_name?: string | null
          role?: string
          title?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          business_name?: string
          business_phone?: string | null
          created_at?: string
          first_name?: string
          full_name?: string | null
          last_name?: string
          payment_link_or_instructions?: string | null
          payment_method_name?: string | null
          payment_note?: string | null
          review_link?: string | null
          review_platform?: string | null
          review_signature_name?: string | null
          role?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          branding: Json | null
          client_email: string | null
          client_name: string
          completed_at: string | null
          created_at: string
          declined_at: string | null
          email_body: string | null
          email_subject: string | null
          followup_email_body: string | null
          followup_email_subject: string | null
          followup_enabled: boolean
          followup_scheduled_for: string | null
          followup_sent_at: string | null
          id: string
          job_description: string
          needs_review: boolean
          options: Json | null
          payment_received_at: string | null
          payment_request_body: string | null
          payment_request_sent_at: string | null
          payment_request_sent_to: string | null
          payment_request_subject: string | null
          payment_status: string
          pdf_url: string | null
          proposal_text: string
          public_token: string | null
          responded_at: string | null
          review_request_body: string | null
          review_request_sent_at: string | null
          review_request_sent_to: string | null
          review_request_subject: string | null
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
          completed_at?: string | null
          created_at?: string
          declined_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          followup_email_body?: string | null
          followup_email_subject?: string | null
          followup_enabled?: boolean
          followup_scheduled_for?: string | null
          followup_sent_at?: string | null
          id?: string
          job_description: string
          needs_review?: boolean
          options?: Json | null
          payment_received_at?: string | null
          payment_request_body?: string | null
          payment_request_sent_at?: string | null
          payment_request_sent_to?: string | null
          payment_request_subject?: string | null
          payment_status?: string
          pdf_url?: string | null
          proposal_text: string
          public_token?: string | null
          responded_at?: string | null
          review_request_body?: string | null
          review_request_sent_at?: string | null
          review_request_sent_to?: string | null
          review_request_subject?: string | null
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
          completed_at?: string | null
          created_at?: string
          declined_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          followup_email_body?: string | null
          followup_email_subject?: string | null
          followup_enabled?: boolean
          followup_scheduled_for?: string | null
          followup_sent_at?: string | null
          id?: string
          job_description?: string
          needs_review?: boolean
          options?: Json | null
          payment_received_at?: string | null
          payment_request_body?: string | null
          payment_request_sent_at?: string | null
          payment_request_sent_to?: string | null
          payment_request_subject?: string | null
          payment_status?: string
          pdf_url?: string | null
          proposal_text?: string
          public_token?: string | null
          responded_at?: string | null
          review_request_body?: string | null
          review_request_sent_at?: string | null
          review_request_sent_to?: string | null
          review_request_subject?: string | null
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
      quote_requests: {
        Row: {
          best_contact_time: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          preferred_contact_method: string | null
          project_description: string
          property_address: string
          property_type: string | null
          proposal_id: string | null
          service_type: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          best_contact_time?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          preferred_contact_method?: string | null
          project_description: string
          property_address: string
          property_type?: string | null
          proposal_id?: string | null
          service_type: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          best_contact_time?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          preferred_contact_method?: string | null
          project_description?: string
          property_address?: string
          property_type?: string | null
          proposal_id?: string | null
          service_type?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
