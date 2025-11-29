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
}

export async function sendMetaEvent(
  eventName: MetaEventName,
  userData: { email: string; phone?: string; fullName?: string },
  customData?: Record<string, any>,
  quoteId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const eventId = `evt_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    const eventData: MetaEventData = {
      eventName,
      eventId,
      quoteId,
      userData,
      customData,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: window.location.href,
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
      console.error('Meta event failed:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
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
