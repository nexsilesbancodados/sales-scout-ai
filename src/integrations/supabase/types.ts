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
      activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          lead_id: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      background_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          current_index: number | null
          error_message: string | null
          failed_items: number | null
          id: string
          job_type: string
          last_error_at: string | null
          last_heartbeat_at: string | null
          max_retries: number | null
          payload: Json
          priority: number
          processed_items: number | null
          result: Json | null
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          total_items: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_index?: number | null
          error_message?: string | null
          failed_items?: number | null
          id?: string
          job_type: string
          last_error_at?: string | null
          last_heartbeat_at?: string | null
          max_retries?: number | null
          payload?: Json
          priority?: number
          processed_items?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_index?: number | null
          error_message?: string | null
          failed_items?: number | null
          id?: string
          job_type?: string
          last_error_at?: string | null
          last_heartbeat_at?: string | null
          max_retries?: number | null
          payload?: Json
          priority?: number
          processed_items?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          campaign_type: string
          completed_at: string | null
          created_at: string
          id: string
          leads_contacted: number | null
          leads_found: number | null
          leads_responded: number | null
          locations: string[] | null
          message_template: string | null
          name: string
          niches: string[] | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          leads_contacted?: number | null
          leads_found?: number | null
          leads_responded?: number | null
          locations?: string[] | null
          message_template?: string | null
          name: string
          niches?: string[] | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          leads_contacted?: number | null
          leads_found?: number | null
          leads_responded?: number | null
          locations?: string[] | null
          message_template?: string | null
          name?: string
          niches?: string[] | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          sender_type: string
          sent_at: string
          status: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          sender_type: string
          sent_at?: string
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          sender_type?: string
          sent_at?: string
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          message_templates: Json | null
          name: string
          trigger_after_days: number[] | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_templates?: Json | null
          name: string
          trigger_after_days?: number[] | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_templates?: Json | null
          name?: string
          trigger_after_days?: number[] | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          analyzed_needs: Json | null
          assigned_to: string | null
          best_contact_hour: number | null
          business_name: string
          company_description: string | null
          conversation_summary: string | null
          created_at: string
          email: string | null
          employee_count: string | null
          enriched_at: string | null
          facebook_url: string | null
          follow_up_count: number | null
          founded_year: number | null
          google_maps_url: string | null
          hunter_email: string | null
          hunter_email_confidence: number | null
          id: string
          industry: string | null
          instagram_url: string | null
          last_contact_at: string | null
          last_response_at: string | null
          linkedin_url: string | null
          location: string | null
          next_follow_up_at: string | null
          niche: string | null
          notes: string | null
          pain_points: string[] | null
          phone: string
          quality_score: number | null
          rating: number | null
          reviews_count: number | null
          source: string | null
          stage: string
          tags: string[] | null
          team_id: string | null
          temperature: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          analyzed_needs?: Json | null
          assigned_to?: string | null
          best_contact_hour?: number | null
          business_name: string
          company_description?: string | null
          conversation_summary?: string | null
          created_at?: string
          email?: string | null
          employee_count?: string | null
          enriched_at?: string | null
          facebook_url?: string | null
          follow_up_count?: number | null
          founded_year?: number | null
          google_maps_url?: string | null
          hunter_email?: string | null
          hunter_email_confidence?: number | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          last_contact_at?: string | null
          last_response_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          next_follow_up_at?: string | null
          niche?: string | null
          notes?: string | null
          pain_points?: string[] | null
          phone: string
          quality_score?: number | null
          rating?: number | null
          reviews_count?: number | null
          source?: string | null
          stage?: string
          tags?: string[] | null
          team_id?: string | null
          temperature?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          analyzed_needs?: Json | null
          assigned_to?: string | null
          best_contact_hour?: number | null
          business_name?: string
          company_description?: string | null
          conversation_summary?: string | null
          created_at?: string
          email?: string | null
          employee_count?: string | null
          enriched_at?: string | null
          facebook_url?: string | null
          follow_up_count?: number | null
          founded_year?: number | null
          google_maps_url?: string | null
          hunter_email?: string | null
          hunter_email_confidence?: number | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          last_contact_at?: string | null
          last_response_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          next_follow_up_at?: string | null
          niche?: string | null
          notes?: string | null
          pain_points?: string[] | null
          phone?: string
          quality_score?: number | null
          rating?: number | null
          reviews_count?: number | null
          source?: string | null
          stage?: string
          tags?: string[] | null
          team_id?: string | null
          temperature?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          lead_id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          niche: string
          response_rate: number | null
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          niche: string
          response_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          niche?: string
          response_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospecting_stats: {
        Row: {
          created_at: string
          date: string
          day_of_week: number | null
          hour_of_day: number | null
          id: string
          location: string | null
          messages_sent: number | null
          niche: string
          positive_responses: number | null
          responses_received: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          location?: string | null
          messages_sent?: number | null
          niche: string
          positive_responses?: number | null
          responses_received?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          location?: string | null
          messages_sent?: number | null
          niche?: string
          positive_responses?: number | null
          responses_received?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_prospecting: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          locations: string[]
          max_leads_per_run: number | null
          name: string
          next_run_at: string | null
          niches: string[]
          prospecting_type: string | null
          schedule_days: number[] | null
          schedule_hour: number | null
          total_leads_captured: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          locations?: string[]
          max_leads_per_run?: number | null
          name: string
          next_run_at?: string | null
          niches?: string[]
          prospecting_type?: string | null
          schedule_days?: number[] | null
          schedule_hour?: number | null
          total_leads_captured?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          locations?: string[]
          max_leads_per_run?: number | null
          name?: string
          next_run_at?: string | null
          niches?: string[]
          prospecting_type?: string | null
          schedule_days?: number[] | null
          schedule_hour?: number | null
          total_leads_captured?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          agent_name: string | null
          agent_persona: string | null
          agent_type: string | null
          auto_end_hour: number | null
          auto_prospecting_enabled: boolean | null
          auto_start_hour: number | null
          blacklist: string[] | null
          closing_style: string | null
          communication_style: string | null
          created_at: string
          daily_message_limit: number | null
          daily_report_enabled: boolean | null
          email_notifications: boolean | null
          emoji_usage: string | null
          follow_up_tone: string | null
          gemini_api_key: string | null
          greeting_style: string | null
          hunter_api_token: string | null
          id: string
          knowledge_base: string | null
          message_interval_seconds: number | null
          message_variations: Json | null
          objection_handling: string | null
          personality_traits: Json | null
          response_length: string | null
          serpapi_api_key: string | null
          services_offered: string[] | null
          target_locations: string[] | null
          target_niches: string[] | null
          updated_at: string
          user_id: string
          value_proposition_focus: string | null
          webhook_events: string[] | null
          webhook_url: string | null
          whatsapp_connected: boolean | null
          whatsapp_instance_id: string | null
        }
        Insert: {
          agent_name?: string | null
          agent_persona?: string | null
          agent_type?: string | null
          auto_end_hour?: number | null
          auto_prospecting_enabled?: boolean | null
          auto_start_hour?: number | null
          blacklist?: string[] | null
          closing_style?: string | null
          communication_style?: string | null
          created_at?: string
          daily_message_limit?: number | null
          daily_report_enabled?: boolean | null
          email_notifications?: boolean | null
          emoji_usage?: string | null
          follow_up_tone?: string | null
          gemini_api_key?: string | null
          greeting_style?: string | null
          hunter_api_token?: string | null
          id?: string
          knowledge_base?: string | null
          message_interval_seconds?: number | null
          message_variations?: Json | null
          objection_handling?: string | null
          personality_traits?: Json | null
          response_length?: string | null
          serpapi_api_key?: string | null
          services_offered?: string[] | null
          target_locations?: string[] | null
          target_niches?: string[] | null
          updated_at?: string
          user_id: string
          value_proposition_focus?: string | null
          webhook_events?: string[] | null
          webhook_url?: string | null
          whatsapp_connected?: boolean | null
          whatsapp_instance_id?: string | null
        }
        Update: {
          agent_name?: string | null
          agent_persona?: string | null
          agent_type?: string | null
          auto_end_hour?: number | null
          auto_prospecting_enabled?: boolean | null
          auto_start_hour?: number | null
          blacklist?: string[] | null
          closing_style?: string | null
          communication_style?: string | null
          created_at?: string
          daily_message_limit?: number | null
          daily_report_enabled?: boolean | null
          email_notifications?: boolean | null
          emoji_usage?: string | null
          follow_up_tone?: string | null
          gemini_api_key?: string | null
          greeting_style?: string | null
          hunter_api_token?: string | null
          id?: string
          knowledge_base?: string | null
          message_interval_seconds?: number | null
          message_variations?: Json | null
          objection_handling?: string | null
          personality_traits?: Json | null
          response_length?: string | null
          serpapi_api_key?: string | null
          services_offered?: string[] | null
          target_locations?: string[] | null
          target_niches?: string[] | null
          updated_at?: string
          user_id?: string
          value_proposition_focus?: string | null
          webhook_events?: string[] | null
          webhook_url?: string | null
          whatsapp_connected?: boolean | null
          whatsapp_instance_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_lead_owner: { Args: { p_lead_id: string }; Returns: boolean }
      recover_stale_jobs: { Args: never; Returns: number }
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
