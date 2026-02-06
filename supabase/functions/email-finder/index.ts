import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EmailSearchResult {
  email: string;
  confidence: number;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  twitter?: string;
  phone_number?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY');
    if (!HUNTER_API_KEY) {
      console.error('HUNTER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Hunter.io API key not configured. Please add HUNTER_API_KEY secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();
    console.log(`Email finder action: ${action}`, data);

    switch (action) {
      case 'find_email': {
        const { domain, company_name } = data;
        
        if (!domain && !company_name) {
          return new Response(
            JSON.stringify({ error: 'Domain or company name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Try domain search first
        let searchUrl = domain 
          ? `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}`
          : `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(company_name)}&api_key=${HUNTER_API_KEY}`;

        console.log('Searching emails for:', domain || company_name);
        
        const response = await fetch(searchUrl);
        const result = await response.json();
        
        if (result.errors) {
          console.error('Hunter API error:', result.errors);
          return new Response(
            JSON.stringify({ error: result.errors[0]?.details || 'Hunter API error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const emails: EmailSearchResult[] = (result.data?.emails || []).map((e: any) => ({
          email: e.value,
          confidence: e.confidence,
          first_name: e.first_name,
          last_name: e.last_name,
          position: e.position,
          linkedin: e.linkedin,
          twitter: e.twitter,
          phone_number: e.phone_number,
        }));

        console.log(`Found ${emails.length} emails`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            emails,
            domain: result.data?.domain,
            organization: result.data?.organization,
            pattern: result.data?.pattern,
            linkedin: result.data?.linkedin,
            facebook: result.data?.facebook,
            twitter: result.data?.twitter,
            instagram: result.data?.instagram,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify_email': {
        const { email } = data;
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const response = await fetch(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${HUNTER_API_KEY}`
        );
        const result = await response.json();

        if (result.errors) {
          return new Response(
            JSON.stringify({ error: result.errors[0]?.details || 'Verification failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            status: result.data?.status,
            score: result.data?.score,
            result: result.data?.result,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'enrich_lead': {
        const { lead_id, domain, company_name, website } = data;
        
        // Extract domain from website if not provided
        let searchDomain = domain;
        if (!searchDomain && website) {
          try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`);
            searchDomain = url.hostname.replace('www.', '');
          } catch {
            searchDomain = null;
          }
        }
        
        if (!searchDomain && !company_name) {
          return new Response(
            JSON.stringify({ error: 'Domain, website or company name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Search for company info via Hunter
        const searchUrl = searchDomain 
          ? `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(searchDomain)}&api_key=${HUNTER_API_KEY}`
          : `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(company_name)}&api_key=${HUNTER_API_KEY}`;

        console.log('Enriching lead:', lead_id, 'with:', searchDomain || company_name);
        
        const response = await fetch(searchUrl);
        const result = await response.json();

        const enrichment: Record<string, any> = {};
        let bestEmail = null;
        let bestConfidence = 0;

        if (result.data) {
          // Get social profiles from organization data
          if (result.data.facebook) enrichment.facebook_url = result.data.facebook;
          if (result.data.twitter) enrichment.twitter_url = `https://twitter.com/${result.data.twitter}`;
          if (result.data.linkedin) enrichment.linkedin_url = result.data.linkedin;
          if (result.data.instagram) enrichment.instagram_url = `https://instagram.com/${result.data.instagram}`;
          
          // Company info
          if (result.data.description) enrichment.company_description = result.data.description;
          if (result.data.industry) enrichment.industry = result.data.industry;

          // Get best email
          const emails = result.data.emails || [];
          for (const email of emails) {
            if (email.confidence > bestConfidence) {
              bestConfidence = email.confidence;
              bestEmail = email.value;
            }
          }
        }

        // Update lead in database if lead_id provided
        if (lead_id && (Object.keys(enrichment).length > 0 || bestEmail)) {
          const updateData: any = {
            ...enrichment,
            enriched_at: new Date().toISOString(),
          };
          
          if (bestEmail) {
            updateData.hunter_email = bestEmail;
            updateData.hunter_email_confidence = bestConfidence;
            // Also update main email if not set
            updateData.email = bestEmail;
          }

          const { error: updateError } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', lead_id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating lead:', updateError);
          } else {
            console.log('Lead enriched successfully:', lead_id);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            enrichment,
            email: bestEmail,
            email_confidence: bestConfidence,
            lead_id,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk_enrich': {
        const { lead_ids } = data;
        
        if (!lead_ids || lead_ids.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Lead IDs are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch leads
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, business_name, website, email')
          .in('id', lead_ids)
          .eq('user_id', user.id);

        if (leadsError) {
          return new Response(
            JSON.stringify({ error: leadsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const results = [];
        for (const lead of leads || []) {
          // Skip if already has email
          if (lead.email) {
            results.push({ lead_id: lead.id, status: 'skipped', reason: 'already has email' });
            continue;
          }

          // Extract domain from website
          let domain = null;
          if (lead.website) {
            try {
              const url = new URL(lead.website.startsWith('http') ? lead.website : `https://${lead.website}`);
              domain = url.hostname.replace('www.', '');
            } catch {
              domain = null;
            }
          }

          if (!domain) {
            results.push({ lead_id: lead.id, status: 'skipped', reason: 'no website' });
            continue;
          }

          try {
            // Search Hunter
            const searchUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}`;
            const response = await fetch(searchUrl);
            const result = await response.json();

            if (result.data?.emails?.length > 0) {
              // Get best email
              const bestEmail = result.data.emails.reduce((best: any, curr: any) => 
                curr.confidence > (best?.confidence || 0) ? curr : best
              , null);

              if (bestEmail) {
                // Update lead
                await supabase
                  .from('leads')
                  .update({
                    email: bestEmail.value,
                    hunter_email: bestEmail.value,
                    hunter_email_confidence: bestEmail.confidence,
                    enriched_at: new Date().toISOString(),
                    linkedin_url: result.data.linkedin || null,
                    facebook_url: result.data.facebook || null,
                    twitter_url: result.data.twitter ? `https://twitter.com/${result.data.twitter}` : null,
                    instagram_url: result.data.instagram ? `https://instagram.com/${result.data.instagram}` : null,
                  })
                  .eq('id', lead.id);

                results.push({ 
                  lead_id: lead.id, 
                  status: 'enriched', 
                  email: bestEmail.value,
                  confidence: bestEmail.confidence 
                });
              } else {
                results.push({ lead_id: lead.id, status: 'no_emails_found' });
              }
            } else {
              results.push({ lead_id: lead.id, status: 'no_emails_found' });
            }

            // Rate limiting - wait between requests
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error('Error enriching lead:', lead.id, err);
            results.push({ lead_id: lead.id, status: 'error', error: String(err) });
          }
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Email finder function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
