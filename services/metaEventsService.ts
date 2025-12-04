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
  }
}

export type MetaEventName = 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'CompleteRegistration';

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
  fbp?: string; // Facebook browser ID cookie
  fbc?: string; // Facebook click ID cookie
}

/**
 * Generate a unique event ID for deduplication between client and server events
 */
function generateEventId(): string {
  return `evt_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
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
        const pixelId = import.meta.env.VITE_META_PIXEL_ID;
        const testEventCode = import.meta.env.VITE_META_TEST_EVENT_CODE; // Optional: for testing
        
        if (testEventCode && pixelId) {
          // Use trackSingle with test_event_code for testing
          window.fbq('trackSingle', pixelId, eventName, customData || {}, { 
            eventID: eventId,
            test_event_code: testEventCode 
          });
          console.log(`[Meta Pixel] Fired TEST ${eventName} event with ID: ${eventId} (test code: ${testEventCode})`);
        } else {
          // Normal tracking without test code
          window.fbq('track', eventName, customData || {}, { eventID: eventId });
          console.log(`[Meta Pixel] Fired ${eventName} event with ID: ${eventId}`);
        }
      } catch (pixelError) {
        console.warn('Meta Pixel failed:', pixelError);
        // Continue to server-side even if pixel fails
      }
    } else {
      console.warn('Meta Pixel not initialized - only server-side event will fire');
    }

    // 2. Fire server-side CAPI event (with same eventId for deduplication)
    const eventData: MetaEventData = {
      eventName,
      eventId, // Same ID as client-side for deduplication
      quoteId,
      userData,
      customData,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: window.location.href,
      fbp,
      fbc,
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/meta-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
  } catch (error) {
    console.error('Error sending Meta event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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
