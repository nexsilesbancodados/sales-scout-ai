import { z } from 'zod';

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================

export const phoneSchema = z
  .string()
  .trim()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 dígitos')
  .regex(/^[\d+\-() ]+$/, 'Telefone contém caracteres inválidos');

export const emailSchema = z
  .string()
  .trim()
  .email('Email inválido')
  .max(255, 'Email muito longo');

export const messageSchema = z
  .string()
  .trim()
  .min(1, 'Mensagem não pode estar vazia')
  .max(4096, 'Mensagem muito longa (máximo 4096 caracteres)');

export const businessNameSchema = z
  .string()
  .trim()
  .min(1, 'Nome da empresa é obrigatório')
  .max(200, 'Nome da empresa muito longo');

export const nicheSchema = z
  .string()
  .trim()
  .min(2, 'Nicho deve ter pelo menos 2 caracteres')
  .max(100, 'Nicho muito longo');

export const locationSchema = z
  .string()
  .trim()
  .min(2, 'Localização deve ter pelo menos 2 caracteres')
  .max(100, 'Localização muito longa');

export const urlSchema = z
  .string()
  .trim()
  .url('URL inválida')
  .max(2000, 'URL muito longa')
  .optional()
  .or(z.literal(''));

export const apiKeySchema = z
  .string()
  .trim()
  .min(10, 'Chave de API muito curta')
  .max(500, 'Chave de API muito longa')
  .optional()
  .or(z.literal(''));

// ============================================
// LEAD VALIDATION
// ============================================

export const leadSchema = z.object({
  business_name: businessNameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  niche: nicheSchema.optional().or(z.literal('')),
  location: locationSchema.optional().or(z.literal('')),
  website: urlSchema,
  notes: z.string().max(5000, 'Notas muito longas').optional(),
});

// ============================================
// MESSAGE TEMPLATE VALIDATION
// ============================================

export const templateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  content: messageSchema,
  niche: nicheSchema,
});

// ============================================
// SANITIZATION
// ============================================

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeForUrl(input: string): string {
  return encodeURIComponent(input.trim());
}

export function sanitizePhone(phone: string): string {
  // Remove everything except digits and +
  return phone.replace(/[^\d+]/g, '');
}

// ============================================
// XSS PROTECTION
// ============================================

export function escapeForAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================
// SQL INJECTION PREVENTION (for raw queries if ever needed)
// ============================================

export function escapeForSql(value: string): string {
  return value.replace(/'/g, "''");
}

// ============================================
// CSRF TOKEN (for additional protection)
// ============================================

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.errors[0]?.message || 'Dados inválidos');
  }
  return result.data;
}

export function validateOrNull<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// SECURE LOGGING (avoid logging sensitive data)
// ============================================

const SENSITIVE_FIELDS = [
  'password',
  'api_key',
  'apiKey',
  'token',
  'secret',
  'deepseek_api_key',
  'serpapi_api_key',
  'serper_api_key',
  'hunter_api_token',
];

export function securelLog(label: string, data: unknown): void {
  if (process.env.NODE_ENV === 'production') {
    return; // Don't log in production
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data as Record<string, unknown> };
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    console.log(label, sanitized);
  } else {
    console.log(label, data);
  }
}
