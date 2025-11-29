import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateEstimateEmail, getEstimateSubject } from './templates/estimate.ts';
import { generateConfirmationEmail, getConfirmationSubject } from './templates/confirmation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  emailType: 'estimate' | 'confirmation';
  recipient: string;
  quoteId?: string;
  data: {
    email: string;
    useCase: string;
    exteriorColor: string;
    flooring: string;
    hvac: boolean;
    estimateLow: number;
    estimateHigh: number;
    fullName?: string;
    phone?: string;
    fullAddress?: string;
    quoteId?: string;
    appUrl?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Pod Quotes <hello@renoassist.io>';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate email content based on type
    let htmlContent: string;
    let subject: string;

    if (requestData.emailType === 'estimate') {
      htmlContent = generateEstimateEmail({
        email: requestData.data.email,
        useCase: requestData.data.useCase,
        exteriorColor: requestData.data.exteriorColor,
        flooring: requestData.data.flooring,
        hvac: requestData.data.hvac,
        estimateLow: requestData.data.estimateLow,
        estimateHigh: requestData.data.estimateHigh,
        appUrl: requestData.data.appUrl,
      });
      subject = getEstimateSubject(requestData.data.estimateLow, requestData.data.estimateHigh);
    } else {
      // Confirmation email
      if (!requestData.data.fullName || !requestData.data.phone || !requestData.data.fullAddress || !requestData.data.quoteId) {
        throw new Error('Missing required fields for confirmation email');
      }

      htmlContent = generateConfirmationEmail({
        quoteId: requestData.data.quoteId,
        email: requestData.data.email,
        fullName: requestData.data.fullName,
        phone: requestData.data.phone,
        fullAddress: requestData.data.fullAddress,
        useCase: requestData.data.useCase,
        exteriorColor: requestData.data.exteriorColor,
        flooring: requestData.data.flooring,
        hvac: requestData.data.hvac,
        estimateLow: requestData.data.estimateLow,
        estimateHigh: requestData.data.estimateHigh,
      });
      subject = getConfirmationSubject(requestData.data.quoteId);
    }

    let resendResponse = null;
    let emailStatus = 'pending';
    let errorMessage = null;
    let resendId = null;

    // Send email via Resend if API key is configured
    if (RESEND_API_KEY) {
      try {
        const resendPayload = {
          from: FROM_EMAIL,
          to: [requestData.recipient],
          subject: subject,
          html: htmlContent,
        };

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(resendPayload),
        });

        resendResponse = await response.json();

        if (response.ok) {
          emailStatus = 'sent';
          resendId = resendResponse.id;
        } else {
          emailStatus = 'failed';
          errorMessage = JSON.stringify(resendResponse);
        }
      } catch (error) {
        emailStatus = 'failed';
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    } else {
      console.log('Resend API key not configured, skipping email send');
      emailStatus = 'pending';
      errorMessage = 'Resend API key not configured';
    }

    // Log email to database
    const { data: emailLog, error: dbError } = await supabase
      .from('email_logs')
      .insert({
        quote_id: requestData.quoteId || null,
        recipient_email: requestData.recipient,
        email_type: requestData.emailType,
        subject: subject,
        status: emailStatus,
        resend_id: resendId,
        resend_response: resendResponse,
        error_message: errorMessage,
        template_data: requestData.data,
        sent_at: emailStatus === 'sent' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error logging email to database:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: emailStatus === 'sent',
        emailLogId: emailLog?.id,
        resendId: resendId,
        status: emailStatus,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: emailStatus === 'sent' ? 200 : 207, // 207 Multi-Status if failed but logged
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
