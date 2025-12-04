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
  fbp?: string; // Facebook browser ID cookie
  fbc?: string; // Facebook click ID cookie
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

    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    const META_API_VERSION = Deno.env.get('META_API_VERSION') || 'v21.0';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash user data per Meta requirements
    const hashedEmail = await hashData(eventData.userData.email);
    const hashedPhone = eventData.userData.phone ? await hashData(eventData.userData.phone) : undefined;
    const hashedName = eventData.userData.fullName ? await hashData(eventData.userData.fullName) : undefined;

    // Extract client IP and user agent from request headers for better attribution
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Prepare Meta CAPI payload with enhanced attribution data
    const metaPayload = {
      data: [
        {
          event_name: eventData.eventName,
          event_time: eventData.eventTime,
          event_id: eventData.eventId, // Same as client-side for deduplication
          event_source_url: eventData.eventSourceUrl,
          action_source: 'website',
          user_data: {
            em: hashedEmail,
            ph: hashedPhone,
            fn: hashedName,
            // Include Facebook cookies for better attribution
            fbp: eventData.fbp,
            fbc: eventData.fbc,
            // Include IP and user agent for improved event matching
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: eventData.customData || {},
        },
      ],
    };

    let metaResponse = null;
    let status = 'pending';
    let errorMessage = null;

    // Send to Meta Conversions API if credentials are configured
    if (META_PIXEL_ID && META_ACCESS_TOKEN) {
      try {
        // Add test_event_code for testing (remove after testing is complete)
        const TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE'); // Set to TEST20053 for testing
        const testParam = TEST_EVENT_CODE ? `&test_event_code=${TEST_EVENT_CODE}` : '';
        const metaApiUrl = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}${testParam}`;

        const response = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metaPayload),
        });

        metaResponse = await response.json();

        if (response.ok) {
          status = 'sent';
        } else {
          status = 'failed';
          errorMessage = JSON.stringify(metaResponse);
        }
      } catch (error) {
        status = 'failed';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    } else {
      console.log('Meta credentials not configured, skipping Meta API call');
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
      console.error('Error logging to database:', dbError);
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
        status: status === 'sent' ? 200 : 207, // 207 Multi-Status if Meta failed but logged
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
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
