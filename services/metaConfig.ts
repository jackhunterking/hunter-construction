/**
 * Meta Pixel Configuration and Helper Functions
 * Used for both client-side pixel and server-side CAPI
 */

export const META_CONFIG = {
  PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID || '',
  ACCESS_TOKEN: '', // Server-side only (in Edge Function env)
  DEBUG_MODE: import.meta.env.DEV,
};

/**
 * Generate unique event ID for deduplication
 * Format: hc_{random}_{timestamp}
 * Both client and server must use the same event_id for Facebook to deduplicate
 */
export function generateEventId(): string {
  const random = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  return `hc_${random}_${timestamp}`;
}

/**
 * Hash email for Advanced Matching (SHA-256)
 * Meta requires lowercase, trimmed, SHA-256 hashed emails for CAPI
 */
export async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash phone number for Advanced Matching (SHA-256)
 * Meta requires digits only, SHA-256 hashed phone numbers for CAPI
 */
export async function hashPhone(phone: string): Promise<string> {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(digitsOnly);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get Facebook cookies from browser
 * _fbp: Facebook browser ID (set by pixel)
 * _fbc: Facebook click ID (set when user clicks FB ad)
 */
export function getFacebookCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  
  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(c => {
    const [key, value] = c.trim().split('=');
    if (key && value) {
      cookies[key] = value;
    }
  });
  
  return { 
    fbp: cookies['_fbp'], 
    fbc: cookies['_fbc'] 
  };
}

/**
 * Get fbclid from URL query parameters
 * Used for generating fbc cookie if not present
 */
export function getFbclid(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('fbclid');
}

/**
 * Generate fbc value from fbclid if _fbc cookie doesn't exist
 * Format: fb.1.{timestamp}.{fbclid}
 */
export function generateFbc(fbclid: string): string {
  const timestamp = Date.now();
  return `fb.1.${timestamp}.${fbclid}`;
}

/**
 * Get or generate fbc value
 * Checks cookie first, falls back to URL parameter
 */
export function getOrGenerateFbc(): string | undefined {
  const cookies = getFacebookCookies();
  if (cookies.fbc) return cookies.fbc;
  
  const fbclid = getFbclid();
  if (fbclid) return generateFbc(fbclid);
  
  return undefined;
}
