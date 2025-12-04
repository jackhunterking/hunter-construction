import { PodConfiguration, EstimateResult } from '../types';
import { BasementProjectType } from '../types/basement';

interface EmailResponse {
  success: boolean;
  emailLogId?: string;
  resendId?: string;
  status?: string;
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Send estimate email when user clicks "Get my estimate"
 * Contains pod configuration and pricing estimate
 */
export async function sendEstimateEmail(
  email: string,
  config: PodConfiguration,
  estimate: Pick<EstimateResult, 'low' | 'high'>,
  quoteId?: string
): Promise<EmailResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping estimate email');
    return { success: true, status: 'skipped - no supabase config' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType: 'estimate',
        recipient: email,
        quoteId: quoteId || null,
        data: {
          email,
          useCase: config.useCase,
          exteriorColor: config.exteriorColor,
          flooring: config.flooring,
          hvac: config.hvac === 'Yes',
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
          appUrl: window.location.origin,
        },
      }),
    });

    const result: EmailResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending estimate email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send confirmation email after user submits contact info
 * Contains all quote details and next steps
 */
export async function sendConfirmationEmail(
  quoteId: string,
  email: string,
  fullName: string,
  phone: string,
  fullAddress: string,
  config: PodConfiguration,
  estimate: Pick<EstimateResult, 'low' | 'high'>
): Promise<EmailResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping confirmation email');
    return { success: true, status: 'skipped - no supabase config' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType: 'confirmation',
        recipient: email,
        quoteId,
        data: {
          email,
          fullName,
          phone,
          fullAddress,
          useCase: config.useCase,
          exteriorColor: config.exteriorColor,
          flooring: config.flooring,
          hvac: config.hvac === 'Yes',
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
          quoteId,
        },
      }),
    });

    const result: EmailResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send confirmation email for basement suite inquiry
 * Contains all basement project details and next steps
 */
export async function sendBasementConfirmationEmail(
  email: string,
  fullName: string,
  phone: string,
  projectLocation: string,
  projectTypes: BasementProjectType[],
  needsSeparateEntrance: boolean,
  hasPlanDesign: boolean,
  projectUrgency: string,
  additionalDetails: string | null
): Promise<EmailResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping basement confirmation email');
    return { success: true, status: 'skipped - no supabase config' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType: 'basement_confirmation',
        recipient: email,
        data: {
          email,
          fullName,
          phone,
          projectLocation,
          projectTypes,
          needsSeparateEntrance,
          hasPlanDesign,
          projectUrgency,
          additionalDetails,
        },
      }),
    });

    const result: EmailResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending basement confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send sales notification email for basement suite inquiry
 * Alerts sales team with lead scoring and actionable context
 */
export async function sendBasementSalesNotification(
  inquiryId: string,
  email: string,
  fullName: string,
  phone: string,
  projectLocation: string,
  projectTypes: BasementProjectType[],
  needsSeparateEntrance: boolean,
  hasPlanDesign: boolean,
  projectUrgency: string,
  additionalDetails: string | null,
  submittedAt: string
): Promise<EmailResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping sales notification email');
    return { success: true, status: 'skipped - no supabase config' };
  }

  // Sales notification recipient
  const SALES_EMAIL = 'hello@hunterconstruction.ca';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType: 'basement_sales_notification',
        recipient: SALES_EMAIL,
        inquiryId,
        data: {
          email,
          fullName,
          phone,
          projectLocation,
          projectTypes,
          needsSeparateEntrance,
          hasPlanDesign,
          projectUrgency,
          additionalDetails,
          submittedAt,
        },
      }),
    });

    const result: EmailResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending sales notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
