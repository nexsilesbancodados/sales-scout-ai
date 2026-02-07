-- Add message_sent field to track if a lead received a message or not
ALTER TABLE public.leads 
ADD COLUMN message_sent boolean DEFAULT false;

-- Add index for better filtering performance
CREATE INDEX idx_leads_message_sent ON public.leads(user_id, message_sent);

-- Update existing leads that have chat_messages as sent
UPDATE public.leads l
SET message_sent = true
WHERE EXISTS (
  SELECT 1 FROM public.chat_messages cm 
  WHERE cm.lead_id = l.id 
  AND cm.sender_type IN ('agent', 'user')
);