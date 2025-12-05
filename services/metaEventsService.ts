/**
 * Meta Events Service
 * Handles dual tracking: client-side Meta Pixel + server-side Conversions API
 * All events use shared event_id for deduplication
 */

import { 
  META_CONFIG, 
  generateEventId, 
  getFacebookCookies, 
  hashEmail,
  hashPhone,
  getOrGenerateFbc 
} from './metaConfig';

// Declare fbq type for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Payload structure for server-side events
 */
interface MetaEventPayload {
  eventName: string;
  eventId: string;
  eventTime: number;
  eventSourceUrl: string;
  userData?: {
    email?: string;
    hashedEmail?: string;
    phone?: string;
    hashedPhone?: string;
    fbp?: string;
    fbc?: string;
    firstName?: string;
    lastName?: string;
  };
  customData?: Record<string, any>;
  funnelSessionId?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Track PageView - fires on every route change
 * Standard event for tracking page navigation
 */
export function trackPageView(): string {
  const eventId = generateEventId();
  const cookies = getFacebookCookies();
  const fbc = getOrGenerateFbc();
  
  // Client-side: Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }
  
  // Server-side: Send to Supabase Edge Function (async, non-blocking)
  sendServerEvent({
    eventName: 'PageView',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
    userData: { 
      fbp: cookies.fbp,
      fbc: fbc || cookies.fbc,
    },
  });
  
  if (META_CONFIG.DEBUG_MODE) {
    console.log('[Meta PageView]', { eventId, url: window.location.href });
  }
  
  return eventId;
}

/**
 * Track ViewContent - fires on each funnel step
 * Used to track user progression through the multi-step funnel
 */
export async function trackViewContent(
  funnelType: 'basement' | 'pod',
  stepNumber: number,
  stepName: string,
  totalSteps: number,
  funnelSessionId?: string,
  email?: string
): Promise<string> {
  const eventId = generateEventId();
  const cookies = getFacebookCookies();
  const fbc = getOrGenerateFbc();
  
  const customData = {
    content_name: `${funnelType}_step_${stepNumber}`,
    content_category: funnelType,
    content_type: 'form_step',
    step_number: stepNumber,
    step_name: stepName,
    total_steps: totalSteps,
  };
  
  // Client-side: Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', customData, { eventID: eventId });
  }
  
  // Server-side: Send to Supabase Edge Function
  sendServerEvent({
    eventName: 'ViewContent',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
    userData: {
      fbp: cookies.fbp,
      fbc: fbc || cookies.fbc,
      hashedEmail: email ? await hashEmail(email) : undefined,
    },
    customData,
    funnelSessionId,
  });
  
  if (META_CONFIG.DEBUG_MODE) {
    console.log('[Meta ViewContent]', { eventId, funnelType, stepNumber, stepName });
  }
  
  return eventId;
}

/**
 * Track Lead - fires when email is captured
 * Basement funnel: Step 7, Pod funnel: Step 5
 * This is a key conversion event for ad optimization
 */
export async function trackLead(
  email: string,
  funnelType: 'basement' | 'pod',
  funnelSessionId?: string
): Promise<string> {
  const eventId = generateEventId();
  const cookies = getFacebookCookies();
  const fbc = getOrGenerateFbc();
  const hashedEmail = await hashEmail(email);
  
  const customData = {
    content_category: funnelType,
  };
  
  // Client-side: Meta Pixel with Advanced Matching
  if (window.fbq) {
    // Set user data for Advanced Matching (without re-initializing pixel)
    window.fbq('set', 'userData', { em: email });
    window.fbq('track', 'Lead', customData, { eventID: eventId });
  }
  
  // Server-side: Send to Supabase Edge Function
  sendServerEvent({
    eventName: 'Lead',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
    userData: {
      email,
      hashedEmail,
      fbp: cookies.fbp,
      fbc: fbc || cookies.fbc,
    },
    customData,
    funnelSessionId,
  });
  
  if (META_CONFIG.DEBUG_MODE) {
    console.log('[Meta Lead]', { eventId, funnelType, email: email.substring(0, 3) + '***' });
  }
  
  return eventId;
}

/**
 * Track CompleteRegistration - fires on final form submission
 * This is the most important conversion event
 * Basement funnel: Step 8 submit, Pod funnel: Step 8 submit
 */
export async function trackCompleteRegistration(
  email: string,
  fullName: string,
  phone: string,
  funnelType: 'basement' | 'pod',
  funnelSessionId?: string
): Promise<string> {
  const eventId = generateEventId();
  const cookies = getFacebookCookies();
  const fbc = getOrGenerateFbc();
  const hashedEmail = await hashEmail(email);
  const hashedPhone = await hashPhone(phone);
  
  // Parse first and last name for better matching
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const customData = {
    content_category: funnelType,
    status: 'complete',
  };
  
  // Client-side: Meta Pixel with full user data
  if (window.fbq) {
    // Set user data for Advanced Matching (without re-initializing pixel)
    window.fbq('set', 'userData', { 
      em: email,
      ph: phone.replace(/\D/g, ''),
      fn: firstName.toLowerCase(),
      ln: lastName.toLowerCase(),
    });
    window.fbq('track', 'CompleteRegistration', customData, { eventID: eventId });
  }
  
  // Server-side: Send to Supabase Edge Function
  sendServerEvent({
    eventName: 'CompleteRegistration',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
    userData: {
      email,
      hashedEmail,
      phone,
      hashedPhone,
      firstName,
      lastName,
      fbp: cookies.fbp,
      fbc: fbc || cookies.fbc,
    },
    customData,
    funnelSessionId,
  });
  
  if (META_CONFIG.DEBUG_MODE) {
    console.log('[Meta CompleteRegistration]', { eventId, funnelType, fullName });
  }
  
  return eventId;
}

/**
 * Send event to Supabase Edge Function for server-side CAPI
 * This function is non-blocking - errors are logged but don't affect user flow
 */
async function sendServerEvent(payload: MetaEventPayload): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (META_CONFIG.DEBUG_MODE) {
      console.log('[Meta CAPI] Skipped - no Supabase config', payload.eventName);
    }
    return;
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/meta-capi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (META_CONFIG.DEBUG_MODE) {
      const result = await response.json();
      console.log(`[Meta CAPI ${payload.eventName}]`, { 
        success: response.ok, 
        eventId: payload.eventId,
        result 
      });
    }
  } catch (error) {
    // Log error but don't throw - CAPI failures shouldn't break user flow
    console.error('[Meta CAPI] Error:', error);
  }
}
