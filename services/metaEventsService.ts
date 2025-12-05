import { META_CONFIG, generateEventId } from './metaConfig';

// Declare fbq global for TypeScript
declare global {
  interface Window {
    fbq: ((
      action: 'track' | 'trackSingle',
      eventNameOrPixelId: string,
      eventNameOrData?: string | Record<string, any>,
      dataOrOptions?: Record<string, any>,
      options?: { eventID?: string; test_event_code?: string }
    ) => void) & ((
      action: string,
      eventName: string,
      customData?: Record<string, any>,
      options?: { eventID?: string; test_event_code?: string }
    ) => void);
    _fbq?: any;
    __META_INITIAL_EVENT_ID__?: string;
  }
}

export type MetaEventName = 'PageView' | 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'CompleteRegistration';

export interface MetaEventData {
  eventName: MetaEventName;
  eventId: string;
  quoteId?: string;
  userData: {
    email: string;
    phone?: string;
    fullName?: string;
  };
  customData?: Record<string, any>;
  eventTime: number;
  eventSourceUrl: string;
  fbp?: string;
  fbc?: string;
  testEventCode?: string; // For server-side test events
}

/**
 * Get Facebook cookies for better attribution
 */
function getFacebookCookies(): { fbp?: string; fbc?: string } {
  const fbp = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='))
    ?.split('=')[1];
  
  const fbc = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbc='))
    ?.split('=')[1];
  
  return { fbp, fbc };
}

/**
 * Send Meta event to both client-side Pixel AND server-side Conversions API
 * Uses the same eventId for deduplication per Facebook best practices
 */
export async function sendMetaEvent(
  eventName: MetaEventName,
  userData: { email: string; phone?: string; fullName?: string },
  customData?: Record<string, any>,
  quoteId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate unique event ID for deduplication
    const eventId = generateEventId();
    const { fbp, fbc } = getFacebookCookies();

    // 1. Fire client-side Pixel event (immediate)
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        // Build event data with Manual Advanced Matching parameters
        // This is required because Lead fires on confirmation page with no visible form fields
        const pixelEventData: Record<string, any> = { ...customData };
        
        // Add user data for Manual Advanced Matching (Meta will auto-hash these)
        if (userData.email) {
          pixelEventData.em = userData.email.toLowerCase().trim();
        }
        if (userData.phone) {
          pixelEventData.ph = userData.phone.replace(/\D/g, ''); // Remove non-digits
        }
        if (userData.fullName) {
          pixelEventData.fn = userData.fullName.toLowerCase().trim();
        }
        
        // Fire the event using standard track method
        window.fbq('track', eventName, pixelEventData, { eventID: eventId });
        console.log(`[Meta Pixel] Fired ${eventName} event with ID: ${eventId}`, { hasEmail: !!userData.email });
      } catch (pixelError) {
        console.warn('Meta Pixel failed:', pixelError);
        // Continue to server-side even if pixel fails
      }
    } else {
      console.warn('Meta Pixel not initialized - only server-side event will fire');
    }

    // 2. Fire server-side CAPI event (with same eventId for deduplication)
    const result = await sendServerSideEvent(
      eventName,
      eventId,
      userData,
      customData,
      quoteId,
      fbp,
      fbc
    );

    return result;
  } catch (error) {
    console.error('Error sending Meta event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send server-side event only (no browser pixel)
 * Used for initial page load where HTML already fired browser event
 */
export async function sendServerOnlyEvent(
  eventName: MetaEventName,
  eventId: string,
  userData: { email: string; phone?: string; fullName?: string },
  customData?: Record<string, any>,
  quoteId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { fbp, fbc } = getFacebookCookies();
    
    console.log(`[Meta CAPI] Sending server-only ${eventName} event with ID: ${eventId}`);
    
    const result = await sendServerSideEvent(
      eventName,
      eventId,
      userData,
      customData,
      quoteId,
      fbp,
      fbc
    );
    
    return result;
  } catch (error) {
    console.error('Error sending server-only Meta event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Internal function to send server-side CAPI event
 */
async function sendServerSideEvent(
  eventName: MetaEventName,
  eventId: string,
  userData: { email: string; phone?: string; fullName?: string },
  customData?: Record<string, any>,
  quoteId?: string,
  fbp?: string,
  fbc?: string
): Promise<{ success: boolean; error?: string }> {
  // Use window.location.href directly - browser pixel does the same
  // Both should capture the same URL for proper deduplication
  const eventSourceUrl = window.location.href;
  
  const eventData: MetaEventData = {
    eventName,
    eventId,
    quoteId,
    userData,
    customData,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl,
    fbp,
    fbc,
    // Include test code for server-side if test mode is enabled
    testEventCode: META_CONFIG.TEST_MODE_ENABLED ? META_CONFIG.TEST_EVENT_CODE : undefined,
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Debug logging
  console.log('[Meta CAPI] Sending to:', `${supabaseUrl}/functions/v1/meta-conversion`);
  console.log('[Meta CAPI] Event data:', {
    eventName,
    eventId,
    eventSourceUrl,
    testMode: META_CONFIG.TEST_MODE_ENABLED,
    userData: { email: userData.email }
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Meta CAPI] Missing Supabase configuration!', {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey
    });
    return { success: false, error: 'Missing Supabase configuration' };
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/meta-conversion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Meta CAPI] Server-side event failed:', errorText);
    return { success: false, error: errorText };
  }

  const result = await response.json();
  console.log(`[Meta CAPI] Server-side ${eventName} event sent with ID: ${eventId}`);
  return { success: true, ...result };
}

export async function trackLead(email: string, estimateValue: number): Promise<void> {
  await sendMetaEvent(
    'Lead',
    { email },
    { value: estimateValue, currency: 'CAD' }
  );
}

export async function trackViewContent(
  config: Record<string, any>,
  estimateValue: number
): Promise<void> {
  await sendMetaEvent(
    'ViewContent',
    { email: '' },
    {
      content_type: 'product',
      content_name: 'Backyard Pod',
      value: estimateValue,
      currency: 'CAD',
      ...config
    }
  );
}

/**
 * Track PageView event on both client and server
 */
export async function trackPageView(
  pagePath: string,
  email?: string
): Promise<void> {
  await sendMetaEvent(
    'PageView',
    { email: email || '' },
    {
      content_type: 'page',
      content_name: pagePath,
      page_path: pagePath
    }
  );
}

/**
 * Track form step progression on both client and server
 */
export async function trackFormStep(
  stepName: string,
  formType: 'pod' | 'basement',
  stepNumber: number,
  totalSteps: number,
  email?: string
): Promise<void> {
  await sendMetaEvent(
    'ViewContent',
    { email: email || '' },
    {
      content_type: 'form_step',
      content_name: `${formType}_step_${stepNumber}`,
      step_name: stepName,
      step_number: stepNumber,
      total_steps: totalSteps,
      form_type: formType
    }
  );
}

export async function trackInitiateCheckout(
  email: string,
  estimateValue: number,
  config: Record<string, any>
): Promise<void> {
  await sendMetaEvent(
    'InitiateCheckout',
    { email },
    {
      value: estimateValue,
      currency: 'CAD',
      num_items: 1,
      ...config
    }
  );
}

export async function trackCompleteRegistration(
  quoteId: string,
  email: string,
  phone: string,
  fullName: string,
  estimateValue: number
): Promise<void> {
  await sendMetaEvent(
    'CompleteRegistration',
    { email, phone, fullName },
    {
      value: estimateValue,
      currency: 'CAD',
      content_name: 'Pod Quote Submission'
    },
    quoteId
  );
}
