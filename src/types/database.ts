// Database types for Prospecte

export type LeadStage = 'Contato' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Ganho' | 'Perdido';
export type LeadTemperature = 'quente' | 'morno' | 'frio';
export type MessageSenderType = 'agent' | 'lead' | 'user';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  agent_name: string;
  agent_persona: string;
  knowledge_base: string;
  services_offered: string[];
  message_variations: MessageVariation[];
  target_niches: string[];
  target_locations: string[];
  whatsapp_instance_id: string | null;
  whatsapp_connected: boolean;
  webhook_url: string | null;
  webhook_events: string[];
  email_notifications: boolean;
  daily_report_enabled: boolean;
  hunter_api_token: string;
  created_at: string;
  updated_at: string;
}

export interface MessageVariation {
  id: string;
  name: string;
  template: string;
  active: boolean;
}

export interface Lead {
  id: string;
  user_id: string;
  business_name: string;
  phone: string;
  email: string | null;
  website: string | null;
  address: string | null;
  niche: string | null;
  location: string | null;
  pain_points: string[] | null;
  analyzed_needs: Record<string, any>;
  stage: LeadStage;
  temperature: LeadTemperature;
  conversation_summary: string | null;
  source: string;
  google_maps_url: string | null;
  last_contact_at: string | null;
  last_response_at: string | null;
  follow_up_count: number;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  lead_id: string;
  sender_type: MessageSenderType;
  content: string;
  whatsapp_message_id: string | null;
  status: MessageStatus;
  sent_at: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  lead_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: MeetingStatus;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  lead?: Lead;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  lead_id: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  // Joined data
  lead?: Lead;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalLeads: number;
  leadsThisMonth: number;
  meetingsScheduled: number;
  meetingsThisWeek: number;
  conversionRate: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  leadsByStage: Record<LeadStage, number>;
}
