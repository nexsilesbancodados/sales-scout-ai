import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppStatus {
  connected: boolean;
  state: string;
}

export interface QRCodeResponse {
  base64?: string;
  code?: string;
  pairingCode?: string;
}

export interface PairingCodeResponse {
  pairingCode?: string;
  phoneNumber?: string;
}

export async function createWhatsAppInstance(): Promise<QRCodeResponse> {
  const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
    body: { action: 'create_instance' },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getWhatsAppQRCode(): Promise<QRCodeResponse> {
  const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
    body: { action: 'get_qrcode' },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPairingCode(phoneNumber: string): Promise<PairingCodeResponse> {
  const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
    body: { action: 'get_pairing_code', phoneNumber },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function checkWhatsAppStatus(): Promise<WhatsAppStatus> {
  const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
    body: { action: 'check_status' },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function disconnectWhatsApp(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
    body: { action: 'disconnect' },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendWhatsAppMessage(
  phone: string, 
  message: string, 
  instanceId: string
): Promise<{ success: boolean; message_id?: string }> {
  const { data, error } = await supabase.functions.invoke('whatsapp-send', {
    body: { phone, message, instance_id: instanceId },
  });

  if (error) throw new Error(error.message);
  return data;
}
