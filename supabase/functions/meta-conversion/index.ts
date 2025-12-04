import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaEventData {
  eventName: string;
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
}

async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const eventData: MetaEventData = await req.json();

    // Get environment variables
    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    const META_API_VERSION = Deno.env.get('META_API_VERSION') || 'v21.0';
    const META_TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE');

    // Debug: Log configuration (without sensitive data)
    console.log('[Meta CAPI] Configuration:', {
      hasPixelId: !!META_PIXEL_ID,
      pixelIdLength: META_PIXEL_ID?.length,
      hasAccessToken: !!META_ACCESS_TOKEN,
      apiVersion: META_API_VERSION,
      hasTestCode: !!META_TEST_EVENT_CODE,
      testCode: META_TEST_EVENT_CODE || 'NOT SET',
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash user data per Meta requirements
    const hashedEmail = await hashData(eventData.userData.email);
    const hashedPhone = eventData.userData.phone ? await hashData(eventData.userData.phone) : undefined;
    const hashedName = eventData.userData.fullName ? await hashData(eventData.userData.fullName) : undefined;

    // Extract client IP and user agent for better attribution
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    console.log('[Meta CAPI] Event received:', {
      eventName: eventData.eventName,
      eventId: eventData.eventId,
      hasEmail: !!eventData.userData.email,
      hasPhone: !!eventData.userData.phone,
      hasFbp: !!eventData.fbp,
      hasFbc: !!eventData.fbc,
      clientIp: clientIp ? 'present' : 'missing',
      userAgent: userAgent ? 'present' : 'missing',
    });

    // Build user_data object with ARRAY format per Facebook spec
    // Facebook requires em, ph, fn to be arrays of hashed values
    const userData: Record<string, any> = {};
    
    // Email is required and must be an array
    userData.em = [hashedEmail];
    
    // Optional fields - only include if present, as arrays
    if (hashedPhone) {
      userData.ph = [hashedPhone];
    }
    if (hashedName) {
      userData.fn = [hashedName];
    }
    
    // Facebook browser cookies (not arrays)
    if (eventData.fbp) {
      userData.fbp = eventData.fbp;
    }
    if (eventData.fbc) {
      userData.fbc = eventData.fbc;
    }
    
    // IP and User Agent for better matching
    if (clientIp) {
      userData.client_ip_address = clientIp;
    }
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    // Build the Meta CAPI payload
    // CRITICAL: test_event_code MUST be at root level of body, NOT in URL
    const metaPayload: Record<string, any> = {
      data: [
        {
          event_name: eventData.eventName,
          event_time: eventData.eventTime,
          event_id: eventData.eventId,
          event_source_url: eventData.eventSourceUrl,
          action_source: 'website',
          user_data: userData,
          custom_data: eventData.customData || {},
        },
      ],
    };

    // Add test_event_code to BODY (not URL) per Facebook documentation
    if (META_TEST_EVENT_CODE) {
      metaPayload.test_event_code = META_TEST_EVENT_CODE;
      console.log('[Meta CAPI] Test event code added to payload:', META_TEST_EVENT_CODE);
    }

    console.log('[Meta CAPI] Full payload:', JSON.stringify(metaPayload, null, 2));

    let metaResponse = null;
    let status = 'pending';
    let errorMessage = null;

    // Send to Meta Conversions API
    if (META_PIXEL_ID && META_ACCESS_TOKEN) {
      try {
        // URL should NOT contain test_event_code - it goes in the body
        const metaApiUrl = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
        
        console.log('[Meta CAPI] Sending to Facebook API...');
        console.log('[Meta CAPI] URL:', `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`);

        const response = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metaPayload),
        });

        metaResponse = await response.json();
        
        console.log('[Meta CAPI] Facebook response status:', response.status);
        console.log('[Meta CAPI] Facebook response body:', JSON.stringify(metaResponse));

        if (response.ok && metaResponse.events_received > 0) {
          status = 'sent';
          console.log('[Meta CAPI] SUCCESS - Events received:', metaResponse.events_received);
        } else {
          status = 'failed';
          errorMessage = JSON.stringify(metaResponse);
          console.error('[Meta CAPI] FAILED - Response:', errorMessage);
        }
      } catch (error) {
        status = 'failed';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Meta CAPI] EXCEPTION:', errorMessage);
      }
    } else {
      console.error('[Meta CAPI] Missing credentials - PIXEL_ID:', !!META_PIXEL_ID, 'ACCESS_TOKEN:', !!META_ACCESS_TOKEN);
      status = 'pending';
      errorMessage = 'Meta credentials not configured';
    }

    // Log event to database
    const { error: dbError } = await supabase.from('meta_events').insert({
      quote_id: eventData.quoteId || null,
      event_name: eventData.eventName,
      event_id: eventData.eventId,
      event_time: new Date(eventData.eventTime * 1000).toISOString(),
      event_source_url: eventData.eventSourceUrl,
      user_data: {
        em: hashedEmail,
        ph: hashedPhone,
        fn: hashedName,
      },
      custom_data: eventData.customData || {},
      api_response: metaResponse,
      status,
      error_message: errorMessage,
    });

    if (dbError) {
      console.error('[Meta CAPI] Database error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: status === 'sent',
        status,
        metaResponse,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status === 'sent' ? 200 : 207,
      }
    );
  } catch (error) {
    console.error('[Meta CAPI] Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
