/**
 * Meta Conversions API (CAPI) Edge Function
 * Server-side tracking for Facebook/Meta ads
 * 
 * This function receives events from the frontend and forwards them to
 * Meta's Conversions API for server-side event tracking.
 * 
 * Events are deduplicated with client-side pixel using shared event_id.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaEventRequest {
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

interface MetaCAPIPayload {
  data: Array<{
    event_name: string;
    event_time: number;
    event_id: string;
    event_source_url: string;
    action_source: string;
    user_data: {
      em?: string[];
      ph?: string[];
      fn?: string[];
      ln?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
      fbp?: string;
      fbc?: string;
    };
    custom_data?: Record<string, any>;
  }>;
  test_event_code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Meta credentials from environment
    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    const META_TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE'); // Optional: for testing
    
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.error('Meta credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Meta credentials not configured' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Parse request payload
    const payload: MetaEventRequest = await req.json();
    
    // Extract client information from request headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') || // Cloudflare
                     '';
    const userAgent = req.headers.get('user-agent') || '';

    // Build user_data object with hashed values
    const userData: MetaCAPIPayload['data'][0]['user_data'] = {
      client_ip_address: clientIp || undefined,
      client_user_agent: userAgent || undefined,
      fbp: payload.userData?.fbp,
      fbc: payload.userData?.fbc,
    };

    // Add hashed email if available
    if (payload.userData?.hashedEmail) {
      userData.em = [payload.userData.hashedEmail];
    }

    // Add hashed phone if available
    if (payload.userData?.hashedPhone) {
      userData.ph = [payload.userData.hashedPhone];
    }

    // Add hashed first name if available
    if (payload.userData?.firstName) {
      // Hash first name (lowercase, then SHA-256)
      const encoder = new TextEncoder();
      const data = encoder.encode(payload.userData.firstName.toLowerCase().trim());
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashedFn = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      userData.fn = [hashedFn];
    }

    // Add hashed last name if available
    if (payload.userData?.lastName) {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload.userData.lastName.toLowerCase().trim());
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashedLn = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      userData.ln = [hashedLn];
    }

    // Build CAPI payload
    const capiPayload: MetaCAPIPayload = {
      data: [{
        event_name: payload.eventName,
        event_time: payload.eventTime,
        event_id: payload.eventId,
        event_source_url: payload.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: payload.customData,
      }],
    };

    // Add test event code if configured (for debugging in Events Manager)
    if (META_TEST_EVENT_CODE) {
      capiPayload.test_event_code = META_TEST_EVENT_CODE;
    }

    // Send to Meta Conversions API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload),
      }
    );

    const metaResult = await metaResponse.json();

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Log event to meta_events table for debugging and analytics
      try {
        await supabase.from('meta_events').insert({
          event_name: payload.eventName,
          event_id: payload.eventId,
          funnel_session_id: payload.funnelSessionId || null,
          pixel_id: META_PIXEL_ID,
          event_time: new Date(payload.eventTime * 1000).toISOString(),
          event_source_url: payload.eventSourceUrl,
          user_data: {
            has_email: !!payload.userData?.hashedEmail,
            has_phone: !!payload.userData?.hashedPhone,
            has_fbp: !!payload.userData?.fbp,
            has_fbc: !!payload.userData?.fbc,
            client_ip: clientIp ? clientIp.substring(0, 10) + '...' : null, // Truncated for privacy
          },
          custom_data: payload.customData || {},
          capi_response: metaResult,
          processing_status: metaResponse.ok ? 'success' : 'failed',
        });
      } catch (dbError) {
        console.error('Error logging to database:', dbError);
        // Don't fail the request if logging fails
      }
    }

    // Log for debugging
    console.log(`[Meta CAPI] ${payload.eventName}`, {
      eventId: payload.eventId,
      success: metaResponse.ok,
      events_received: metaResult.events_received,
    });

    return new Response(
      JSON.stringify({ 
        success: metaResponse.ok, 
        events_received: metaResult.events_received,
        fbtrace_id: metaResult.fbtrace_id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: metaResponse.ok ? 200 : 500,
      }
    );
  } catch (error) {
    console.error('Meta CAPI error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
