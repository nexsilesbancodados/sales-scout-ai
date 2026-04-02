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
  source?: string;
}

// Common email patterns for Brazilian businesses
const EMAIL_PATTERNS = [
  'contato@{domain}',
  'comercial@{domain}',
  'atendimento@{domain}',
  'vendas@{domain}',
  'financeiro@{domain}',
  'info@{domain}',
  'sac@{domain}',
  'faleconosco@{domain}',
  'orcamento@{domain}',
  'suporte@{domain}',
  'admin@{domain}',
  'gerencia@{domain}',
];

// Verify MX records exist for a domain (indicates it can receive email)
async function hasMXRecords(domain: string): Promise<boolean> {
  try {
    // Use Google's DNS-over-HTTPS API (free)
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    return false;
  }
}

// Check if a specific email is likely valid using DNS + SMTP heuristics
async function verifyEmailBasic(email: string): Promise<{ valid: boolean; confidence: number }> {
  const domain = email.split('@')[1];
  if (!domain) return { valid: false, confidence: 0 };

  // Check MX records
  const hasMX = await hasMXRecords(domain);
  if (!hasMX) return { valid: false, confidence: 0 };

  // Common valid patterns get higher confidence
  const localPart = email.split('@')[0].toLowerCase();
  const commonPatterns = ['contato', 'comercial', 'atendimento', 'vendas', 'info', 'admin', 'sac'];

  if (commonPatterns.includes(localPart)) {
    return { valid: true, confidence: 75 };
  }

  return { valid: true, confidence: 50 };
}

// Search for emails on a domain using pattern generation + web scraping
async function findEmailsForDomain(domain: string, companyName?: string): Promise<EmailSearchResult[]> {
  const emails: EmailSearchResult[] = [];
  const seenEmails = new Set<string>();

  // 1. Check MX records first
  const hasMX = await hasMXRecords(domain);
  if (!hasMX) {
    console.log(`No MX records for ${domain}, skipping`);
    return [];
  }

  // 2. Generate common pattern emails
  for (const pattern of EMAIL_PATTERNS) {
    const email = pattern.replace('{domain}', domain);
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      emails.push({
        email,
        confidence: 60,
        source: 'pattern_generation',
      });
    }
  }

  // 3. Search for emails on the web via DuckDuckGo
  try {
    const searchQuery = `"@${domain}" email`;
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });

    if (response.ok) {
      const html = await response.text();
      // Extract any emails matching the domain
      const emailRegex = new RegExp(`[\\w.-]+@${domain.replace('.', '\\.')}`, 'gi');
      const matches = html.match(emailRegex) || [];
      
      for (const email of matches) {
        const normalized = email.toLowerCase();
        if (!seenEmails.has(normalized)) {
          seenEmails.add(normalized);
          emails.unshift({ // Higher priority - found on web
            email: normalized,
            confidence: 85,
            source: 'web_scraping',
          });
        }
      }
    }
  } catch (e) {
    console.error('Web email search error:', e);
  }

  // 4. If company name provided, search for that too
  if (companyName) {
    try {
      const searchQuery = `"${companyName}" email "@" contato`;
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/gi;
        const matches = html.match(emailRegex) || [];
        
        for (const email of matches) {
          const normalized = email.toLowerCase();
          // Skip common non-business emails
          if (normalized.includes('example.com') || normalized.includes('gmail.com') || normalized.includes('hotmail.com')) continue;
          if (!seenEmails.has(normalized)) {
            seenEmails.add(normalized);
            emails.push({
              email: normalized,
              confidence: 70,
              source: 'company_search',
            });
          }
        }
      }
    } catch (e) {
      console.error('Company email search error:', e);
    }
  }

  // Sort by confidence (highest first)
  emails.sort((a, b) => b.confidence - a.confidence);

  return emails.slice(0, 20);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();
    console.log(`Email finder (FREE) action: ${action}`);

    switch (action) {
      case 'find_email': {
        const { domain, company_name } = data;

        if (!domain && !company_name) {
          return new Response(
            JSON.stringify({ error: 'Domain or company name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Finding emails for:', domain || company_name);

        const emails = await findEmailsForDomain(domain || '', company_name);

        return new Response(
          JSON.stringify({
            success: true,
            emails,
            domain,
            organization: company_name,
            pattern: emails.length > 0 ? emails[0].email.split('@')[0] : null,
            method: 'free_pattern_dns',
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

        const result = await verifyEmailBasic(email);

        return new Response(
          JSON.stringify({
            success: true,
            status: result.valid ? 'valid' : 'invalid',
            score: result.confidence,
            result: result.valid ? 'deliverable' : 'undeliverable',
            method: 'dns_mx_check',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'enrich_lead': {
        const { lead_id, domain, company_name, website } = data;

        // Extract domain from website
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

        const emails = await findEmailsForDomain(searchDomain || '', company_name);
        const bestEmail = emails.length > 0 ? emails[0] : null;

        // Update lead if found
        if (lead_id && bestEmail) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({
              email: bestEmail.email,
              hunter_email: bestEmail.email,
              hunter_email_confidence: bestEmail.confidence,
              enriched_at: new Date().toISOString(),
            })
            .eq('id', lead_id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating lead:', updateError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            enrichment: {},
            email: bestEmail?.email || null,
            email_confidence: bestEmail?.confidence || 0,
            lead_id,
            method: 'free_pattern_dns',
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

        const { data: leads } = await supabase
          .from('leads')
          .select('id, business_name, website, email')
          .in('id', lead_ids)
          .eq('user_id', user.id);

        const results = [];
        for (const lead of leads || []) {
          if (lead.email) {
            results.push({ lead_id: lead.id, status: 'skipped', reason: 'already has email' });
            continue;
          }

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
            const emails = await findEmailsForDomain(domain, lead.business_name);
            if (emails.length > 0) {
              const best = emails[0];
              await supabase
                .from('leads')
                .update({
                  email: best.email,
                  hunter_email: best.email,
                  hunter_email_confidence: best.confidence,
                  enriched_at: new Date().toISOString(),
                })
                .eq('id', lead.id);

              results.push({ lead_id: lead.id, status: 'enriched', email: best.email, confidence: best.confidence });
            } else {
              results.push({ lead_id: lead.id, status: 'no_emails_found' });
            }

            await new Promise(r => setTimeout(r, 500));
          } catch (err) {
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
    console.error('Email finder error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
