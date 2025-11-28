export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          icon_url: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon_url?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon_url?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          expires_at: string | null
          created_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
      }
      domains: {
        Row: {
          id: string
          organization_id: string
          domain: string
          status: 'pending' | 'verified' | 'failed'
          dns_records: Json
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          domain: string
          status?: 'pending' | 'verified' | 'failed'
          dns_records?: Json
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          domain?: string
          status?: 'pending' | 'verified' | 'failed'
          dns_records?: Json
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          organization_id: string
          api_key_id: string | null
          from_email: string
          from_name: string | null
          to_emails: string[]
          cc_emails: string[] | null
          bcc_emails: string[] | null
          reply_to: string | null
          subject: string
          html_content: string | null
          text_content: string | null
          status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
          provider_message_id: string | null
          metadata: Json | null
          created_at: string
          sent_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          api_key_id?: string | null
          from_email: string
          from_name?: string | null
          to_emails: string[]
          cc_emails?: string[] | null
          bcc_emails?: string[] | null
          reply_to?: string | null
          subject: string
          html_content?: string | null
          text_content?: string | null
          status?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
          provider_message_id?: string | null
          metadata?: Json | null
          created_at?: string
          sent_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          api_key_id?: string | null
          from_email?: string
          from_name?: string | null
          to_emails?: string[]
          cc_emails?: string[] | null
          bcc_emails?: string[] | null
          reply_to?: string | null
          subject?: string
          html_content?: string | null
          text_content?: string | null
          status?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
          provider_message_id?: string | null
          metadata?: Json | null
          created_at?: string
          sent_at?: string | null
          delivered_at?: string | null
        }
      }
      email_events: {
        Row: {
          id: string
          email_id: string
          event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          email_id: string
          event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          email_id?: string
          event_type?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
          metadata?: Json | null
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          organization_id: string
          url: string
          events: string[]
          secret: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          url: string
          events: string[]
          secret: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          url?: string
          events?: string[]
          secret?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage: {
        Row: {
          id: string
          organization_id: string
          period_start: string
          period_end: string
          emails_sent: number
          emails_delivered: number
          emails_bounced: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          period_start: string
          period_end: string
          emails_sent?: number
          emails_delivered?: number
          emails_bounced?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          period_start?: string
          period_end?: string
          emails_sent?: number
          emails_delivered?: number
          emails_bounced?: number
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          icon_url: string | null
          owner_id: string
          dodo_customer_id: string | null
          dodo_subscription_id: string | null
          dodo_product_id: string | null
          plan: 'free' | 'pro' | 'scale' | 'enterprise'
          email_limit: number
          contacts_limit: number
          billing_status: 'active' | 'paused' | 'cancelled' | 'past_due'
          billing_cycle_start: string | null
          billing_cycle_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon_url?: string | null
          owner_id: string
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          dodo_product_id?: string | null
          plan?: 'free' | 'pro' | 'scale' | 'enterprise'
          email_limit?: number
          contacts_limit?: number
          billing_status?: 'active' | 'paused' | 'cancelled' | 'past_due'
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon_url?: string | null
          owner_id?: string
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          dodo_product_id?: string | null
          plan?: 'free' | 'pro' | 'scale' | 'enterprise'
          email_limit?: number
          contacts_limit?: number
          billing_status?: 'active' | 'paused' | 'cancelled' | 'past_due'
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          workspace_id: string
          dodo_payment_id: string | null
          amount_paid: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          dodo_payment_id?: string | null
          amount_paid: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          dodo_payment_id?: string | null
          amount_paid?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
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
  }
}
