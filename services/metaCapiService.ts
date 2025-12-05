/**
 * Meta Conversions API (CAPI) Service
 * 
 * Server-side event tracking for Facebook/Meta ads.
 * Calls the Supabase edge function `meta-capi` which handles:
 * - Hashing of PII (email, phone, name)
 * - Generation of fbp/fbc if missing
 * - Logging to meta_events table
 */

import { FunnelType } from './funnelSessionService';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Meta event types supported by the edge function
export type MetaEventName = 
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'AddToCart'
  | 'StartCheckout'
  | 'Purchase'
  | 'Contact'
  | 'Schedule'
  | 'SubmitApplication'
  | 'Subscribe';

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbp?: string;
  fbc?: string;
  externalId?: string;
}

export interface MetaCustomData {
  funnel_type?: FunnelType;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  [key: string]: any;
}

interface MetaEventPayload {
  eventName: MetaEventName;
  eventId: string;
  eventTime: number;
  eventSourceUrl: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
  funnelSessionId?: string;
}

/**
 * Get Facebook browser cookies (_fbp, _fbc)
 */
function getFacebookCookies(): { fbp: string | null; fbc: string | null } {
  if (typeof document === 'undefined') {
    return { fbp: null, fbc: null };
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    fbp: cookies['_fbp'] || null,
    fbc: cookies['_fbc'] || null,
  };
}

/**
 * Generate a unique event ID for deduplication
 */
function generateEventId(funnelSessionId: string, eventName: MetaEventName): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${funnelSessionId}_${eventName}_${timestamp}_${random}`;
}

/**
 * Send event to Meta CAPI via Supabase edge function
 * This is a fire-and-forget call that won't block the UI
 */
async function sendMetaEvent(payload: MetaEventPayload): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Meta CAPI] Supabase not configured, skipping event:', payload.eventName);
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/meta-capi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Meta CAPI] Error sending event:', payload.eventName, errorData);
    } else {
      const result = await response.json();
      console.log('[Meta CAPI] Event sent:', payload.eventName, {
        success: result.success,
        events_received: result.events_received,
      });
    }
  } catch (error) {
    console.error('[Meta CAPI] Network error:', error);
    // Non-fatal - don't throw
  }
}

/**
 * Track ViewContent event - fired when user starts a funnel
 */
export function trackViewContent(
  funnelSessionId: string,
  funnelType: FunnelType,
  contentName: string
): void {
  const fbCookies = getFacebookCookies();
  
  const payload: MetaEventPayload = {
    eventName: 'ViewContent',
    eventId: generateEventId(funnelSessionId, 'ViewContent'),
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
    userData: {
      fbp: fbCookies.fbp || undefined,
      fbc: fbCookies.fbc || undefined,
    },
    customData: {
      funnel_type: funnelType,
      content_name: contentName,
      content_category: 'construction_lead',
    },
    funnelSessionId,
  };

  // Fire and forget
  sendMetaEvent(payload);
}

/**
 * Track Lead event - fired when user reaches the confirmation page
 */
export function trackLead(
  funnelSessionId: string,
  funnelType: FunnelType,
  userData: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  },
  contentName: string
): void {
  const fbCookies = getFacebookCookies();
  
  const payload: MetaEventPayload = {
    eventName: 'Lead',
    eventId: generateEventId(funnelSessionId, 'Lead'),
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
    userData: {
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fbp: fbCookies.fbp || undefined,
      fbc: fbCookies.fbc || undefined,
    },
    customData: {
      funnel_type: funnelType,
      content_name: contentName,
      content_category: 'construction_lead',
    },
    funnelSessionId,
  };

  // Fire and forget
  sendMetaEvent(payload);
}

/**
 * Track CompleteRegistration event - fired when user completes the full form
 */
export function trackCompleteRegistration(
  funnelSessionId: string,
  funnelType: FunnelType,
  userData: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  },
  contentName: string
): void {
  const fbCookies = getFacebookCookies();
  
  const payload: MetaEventPayload = {
    eventName: 'CompleteRegistration',
    eventId: generateEventId(funnelSessionId, 'CompleteRegistration'),
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
    userData: {
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fbp: fbCookies.fbp || undefined,
      fbc: fbCookies.fbc || undefined,
    },
    customData: {
      funnel_type: funnelType,
      content_name: contentName,
      content_category: 'construction_lead',
    },
    funnelSessionId,
  };

  // Fire and forget
  sendMetaEvent(payload);
}
