import { supabase } from './supabaseClient';

/**
 * Funnel Session Service
 * Manages funnel sessions and step tracking in Supabase
 */

export type FunnelType = 'basement' | 'pod';
export type EventType = 'view' | 'complete' | 'back' | 'abandon';

export interface FunnelSession {
  id: string;
  session_id: string;
  funnel_type: FunnelType;
  current_step: number;
  completed_steps: number[];
  form_data: Record<string, any>;
  email: string | null;
  started_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  fbclid: string | null;
  fbc: string | null;
  fbp: string | null;
}

export interface FunnelEvent {
  id: string;
  session_id: string;
  funnel_type: FunnelType;
  step_number: number;
  step_name: string;
  event_type: EventType;
  time_on_step_ms: number | null;
  page_url: string;
}

// Storage keys
const STORAGE_KEY_PREFIX = 'hunter_funnel_';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get localStorage key for a funnel type
 */
function getStorageKey(funnelType: FunnelType): string {
  return `${STORAGE_KEY_PREFIX}${funnelType}_session`;
}

/**
 * Get UTM parameters from URL
 */
function getUtmParams(): Record<string, string | null> {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      fbclid: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    fbclid: params.get('fbclid'),
  };
}

/**
 * Get Facebook browser cookies
 */
function getFacebookCookies(): { fbc: string | null; fbp: string | null } {
  if (typeof document === 'undefined') {
    return { fbc: null, fbp: null };
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    fbc: cookies['_fbc'] || null,
    fbp: cookies['_fbp'] || null,
  };
}

/**
 * Initialize a new funnel session or retrieve existing one from localStorage
 */
export async function initFunnelSession(funnelType: FunnelType): Promise<string> {
  const storageKey = getStorageKey(funnelType);
  
  // Check for existing session in localStorage
  const existingSessionId = localStorage.getItem(storageKey);
  if (existingSessionId) {
    // Verify session exists in database
    if (supabase) {
      const { data } = await supabase
        .from('funnel_sessions')
        .select('session_id')
        .eq('session_id', existingSessionId)
        .single();
      
      if (data) {
        return existingSessionId;
      }
    } else {
      // If no Supabase, trust localStorage
      return existingSessionId;
    }
  }

  // Create new session
  const sessionId = generateSessionId();
  const utmParams = getUtmParams();
  const fbCookies = getFacebookCookies();

  if (supabase) {
    try {
      await supabase.from('funnel_sessions').insert({
        session_id: sessionId,
        funnel_type: funnelType,
        current_step: 1,
        completed_steps: [],
        form_data: {},
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        fbclid: utmParams.fbclid,
        fbc: fbCookies.fbc,
        fbp: fbCookies.fbp,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
      });
    } catch (error) {
      console.error('Error creating funnel session:', error);
    }
  }

  // Save to localStorage
  localStorage.setItem(storageKey, sessionId);
  
  return sessionId;
}

/**
 * Update funnel session progress
 */
export async function updateFunnelProgress(
  sessionId: string,
  step: number,
  formData: Record<string, any>,
  funnelType: FunnelType
): Promise<void> {
  // Update localStorage with form data
  const formDataKey = `${STORAGE_KEY_PREFIX}${funnelType}_data`;
  localStorage.setItem(formDataKey, JSON.stringify(formData));

  // Update completed steps in localStorage
  const completedKey = `${STORAGE_KEY_PREFIX}${funnelType}_completed`;
  const existingCompleted = JSON.parse(localStorage.getItem(completedKey) || '[]') as number[];
  if (!existingCompleted.includes(step)) {
    existingCompleted.push(step);
    localStorage.setItem(completedKey, JSON.stringify(existingCompleted));
  }

  if (!supabase) {
    console.warn('Supabase not configured, skipping database update');
    return;
  }

  try {
    await supabase
      .from('funnel_sessions')
      .update({
        current_step: step + 1, // Next step
        completed_steps: existingCompleted,
        form_data: formData,
      })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error updating funnel progress:', error);
  }
}

/**
 * Update email in funnel session
 */
export async function updateFunnelEmail(
  sessionId: string,
  email: string
): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping email update');
    return;
  }

  try {
    await supabase
      .from('funnel_sessions')
      .update({ email })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error updating funnel email:', error);
  }
}

/**
 * Track a step event
 */
export async function trackStepEvent(
  sessionId: string,
  funnelType: FunnelType,
  stepNumber: number,
  stepName: string,
  eventType: EventType,
  timeOnStepMs?: number
): Promise<void> {
  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';

  if (!supabase) {
    console.warn('Supabase not configured, skipping step event tracking');
    return;
  }

  try {
    await supabase.from('funnel_events').insert({
      session_id: sessionId,
      funnel_type: funnelType,
      step_number: stepNumber,
      step_name: stepName,
      event_type: eventType,
      time_on_step_ms: timeOnStepMs || null,
      page_url: pageUrl,
    });
  } catch (error) {
    console.error('Error tracking step event:', error);
  }
}

/**
 * Mark funnel session as completed
 */
export async function completeFunnelSession(sessionId: string): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping session completion');
    return;
  }

  try {
    await supabase
      .from('funnel_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error completing funnel session:', error);
  }
}

/**
 * Mark funnel session as abandoned
 */
export async function abandonFunnelSession(sessionId: string): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping session abandonment');
    return;
  }

  try {
    await supabase
      .from('funnel_sessions')
      .update({ abandoned_at: new Date().toISOString() })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error abandoning funnel session:', error);
  }
}

/**
 * Get saved form data from localStorage
 */
export function getSavedFormData<T>(funnelType: FunnelType): T | null {
  const formDataKey = `${STORAGE_KEY_PREFIX}${funnelType}_data`;
  const saved = localStorage.getItem(formDataKey);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get completed steps from localStorage
 */
export function getCompletedSteps(funnelType: FunnelType): number[] {
  const completedKey = `${STORAGE_KEY_PREFIX}${funnelType}_completed`;
  const saved = localStorage.getItem(completedKey);
  if (saved) {
    try {
      return JSON.parse(saved) as number[];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Check if a step is completed
 */
export function isStepCompleted(funnelType: FunnelType, step: number): boolean {
  const completed = getCompletedSteps(funnelType);
  return completed.includes(step);
}

/**
 * Check if user can access a step (all previous steps must be completed)
 */
export function canAccessStep(funnelType: FunnelType, step: number): boolean {
  if (step === 1) return true;
  
  const completed = getCompletedSteps(funnelType);
  // Check all steps from 1 to step-1 are completed
  for (let i = 1; i < step; i++) {
    if (!completed.includes(i)) {
      return false;
    }
  }
  return true;
}

/**
 * Clear all funnel data from localStorage
 */
export function clearFunnelData(funnelType: FunnelType): void {
  const storageKey = getStorageKey(funnelType);
  const formDataKey = `${STORAGE_KEY_PREFIX}${funnelType}_data`;
  const completedKey = `${STORAGE_KEY_PREFIX}${funnelType}_completed`;
  
  localStorage.removeItem(storageKey);
  localStorage.removeItem(formDataKey);
  localStorage.removeItem(completedKey);
}

/**
 * Get session ID from localStorage (without creating new one)
 */
export function getExistingSessionId(funnelType: FunnelType): string | null {
  const storageKey = getStorageKey(funnelType);
  return localStorage.getItem(storageKey);
}
