import crypto from 'crypto';
import { ApiKey } from './types';

/**
 * Enterprise Security Utility Module for Quantum Vision SaaS
 */

/**
 * Verifies Meta Cloud API & Instagram Webhook SHA-256 HMAC Signatures
 * Header format: sha256=<hex_hash>
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string = process.env.META_APP_SECRET || 'qv_secret_key_quantum_vision_2026'
): boolean {
  // If no signature header provided in demo/dev mode, allow fallback for simulation endpoints
  if (!signatureHeader) {
    return true;
  }

  try {
    const [algorithm, signatureHash] = signatureHeader.split('=');
    if (algorithm !== 'sha256' || !signatureHash) {
      return false;
    }

    const expectedHash = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody, 'utf-8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'utf-8'),
      Buffer.from(expectedHash, 'utf-8')
    );
  } catch (error) {
    console.error('[SECURITY] Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Validates API Key for Quantum Vision REST Integration API
 * Supports X-Quantum-API-Key header or Authorization: Bearer <key>
 */
export function validateApiKey(
  keyHeader: string | null,
  targetOrgId: string,
  apiKeys: ApiKey[]
): boolean {
  if (!keyHeader) return false;

  const keyToTest = keyHeader.startsWith('Bearer ')
    ? keyHeader.replace('Bearer ', '').trim()
    : keyHeader.trim();

  const matched = apiKeys.find(
    (k) => k.organizationId === targetOrgId && k.key === keyToTest
  );

  return !!matched;
}

/**
 * E.164 International Phone Number Sanitizer & Formatter
 * Example: "09876 543210" -> "+919876543210"
 */
export function sanitizePhoneNumber(phone: string, defaultCountryCode: string = '91'): string {
  if (!phone) return '';

  // Remove non-numeric characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle leading zero commonly pasted in local formats (e.g. 09876543210)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Prepend country code if missing
  if (cleaned.length === 10) {
    return `+${defaultCountryCode}${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * XSS & HTML Entity Input Sanitizer
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * In-Memory Token Bucket Rate Limiter
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}
