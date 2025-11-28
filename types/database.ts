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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          revoked_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          revoked_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audiences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audiences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          audience_id: string | null
          created_at: string | null
          from_email: string
          from_name: string | null
          html_content: string | null
          id: string
          name: string
          organization_id: string
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          styles: Json | null
          subject: string
          template_id: string | null
          text_content: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          audience_id?: string | null
          created_at?: string | null
          from_email: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          name: string
          organization_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          styles?: Json | null
          subject: string
          template_id?: string | null
          text_content?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          audience_id?: string | null
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          name?: string
          organization_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          styles?: Json | null
          subject?: string
          template_id?: string | null
          text_content?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          audience_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          organization_id: string
          subscribed: boolean | null
          updated_at: string | null
        }
        Insert: {
          audience_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          organization_id: string
          subscribed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          audience_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          organization_id?: string
          subscribed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string | null
          dns_records: Json | null
          domain: string
          id: string
          organization_id: string
          status: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          dns_records?: Json | null
          domain: string
          id?: string
          organization_id: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          dns_records?: Json | null
          domain?: string
          id?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_clicks: {
        Row: {
          click_count: number | null
          created_at: string | null
          email_id: string
          id: string
          last_clicked_at: string | null
          url: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          email_id: string
          id?: string
          last_clicked_at?: string | null
          url: string
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          email_id?: string
          id?: string
          last_clicked_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_clicks_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          created_at: string | null
          email_id: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          email_id: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          email_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          api_key_id: string | null
          bcc_emails: string[] | null
          cc_emails: string[] | null
          created_at: string | null
          delivered_at: string | null
          from_email: string
          from_name: string | null
          html_content: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          organization_id: string
          provider_message_id: string | null
          reply_to: string | null
          sent_at: string | null
          status: string
          subject: string
          text_content: string | null
          to_emails: string[]
        }
        Insert: {
          api_key_id?: string | null
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          delivered_at?: string | null
          from_email: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id: string
          provider_message_id?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          text_content?: string | null
          to_emails: string[]
        }
        Update: {
          api_key_id?: string | null
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          delivered_at?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string
          provider_message_id?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          text_content?: string | null
          to_emails?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "emails_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string | null
          currency: string | null
          dodo_payment_id: string | null
          id: string
          invoice_url: string | null
          organization_id: string
          paid_at: string | null
          status: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          currency?: string | null
          dodo_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          organization_id: string
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          currency?: string | null
          dodo_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          organization_id?: string
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle_end: string | null
          billing_cycle_start: string | null
          billing_status: string | null
          cancel_at_period_end: boolean | null
          contacts_limit: number | null
          created_at: string | null
          dodo_customer_id: string | null
          dodo_product_id: string | null
          dodo_subscription_id: string | null
          email_limit: number | null
          icon_url: string | null
          id: string
          name: string
          owner_id: string
          plan: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          billing_status?: string | null
          cancel_at_period_end?: boolean | null
          contacts_limit?: number | null
          created_at?: string | null
          dodo_customer_id?: string | null
          dodo_product_id?: string | null
          dodo_subscription_id?: string | null
          email_limit?: number | null
          icon_url?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          billing_status?: string | null
          cancel_at_period_end?: boolean | null
          contacts_limit?: number | null
          created_at?: string | null
          dodo_customer_id?: string | null
          dodo_product_id?: string | null
          dodo_subscription_id?: string | null
          email_limit?: number | null
          icon_url?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string | null
          html_content: string | null
          id: string
          name: string
          organization_id: string
          styles: Json | null
          subject: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          name: string
          organization_id: string
          styles?: Json | null
          subject: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          name?: string
          organization_id?: string
          styles?: Json | null
          subject?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage: {
        Row: {
          contacts_count: number | null
          contacts_limit: number | null
          created_at: string | null
          emails_bounced: number | null
          emails_delivered: number | null
          emails_limit: number | null
          emails_sent: number | null
          id: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          contacts_count?: number | null
          contacts_limit?: number | null
          created_at?: string | null
          emails_bounced?: number | null
          emails_delivered?: number | null
          emails_limit?: number | null
          emails_sent?: number | null
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          contacts_count?: number | null
          contacts_limit?: number | null
          created_at?: string | null
          emails_bounced?: number | null
          emails_delivered?: number | null
          emails_limit?: number | null
          emails_sent?: number | null
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json
          response_status: number | null
          success: boolean | null
          webhook_id: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          response_status?: number | null
          success?: boolean | null
          webhook_id: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          events: string[]
          id: string
          organization_id: string
          secret: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          events: string[]
          id?: string
          organization_id: string
          secret: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          events?: string[]
          id?: string
          organization_id?: string
          secret?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
