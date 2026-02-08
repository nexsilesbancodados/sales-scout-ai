// ============================================
// EDGE FUNCTION SECURITY UTILITIES
// ============================================

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: entry.resetAt - now 
    };
  }

  entry.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count, 
    resetIn: entry.resetAt - now 
  };
}

// Input validation
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validateMessage(message: string, maxLength: number = 4096): boolean {
  if (!message || typeof message !== 'string') return false;
  return message.trim().length > 0 && message.length <= maxLength;
}

export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Sanitization
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Secure error response (don't expose internal errors)
export function secureErrorResponse(
  error: unknown,
  publicMessage: string = 'Ocorreu um erro interno'
): Response {
  // Log the real error server-side
  console.error('Internal error:', error);
  
  // Return generic message to client
  return new Response(
    JSON.stringify({ error: publicMessage }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Rate limit exceeded response
export function rateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Limite de requisições excedido. Tente novamente em breve.',
      retry_after: Math.ceil(resetIn / 1000)
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(resetIn / 1000))
      } 
    }
  );
}

// Authentication check
export async function validateAuth(
  supabaseClient: any,
  authHeader: string | null
): Promise<{ user: any; error: Response | null }> {
  if (!authHeader) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user, error: null };
}
