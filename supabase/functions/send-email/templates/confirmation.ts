interface ConfirmationData {
  quoteId: string;
  email: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  useCase: string;
  exteriorColor: string;
  flooring: string;
  hvac: boolean;
  estimateLow: number;
  estimateHigh: number;
}

export function generateConfirmationEmail(data: ConfirmationData): string {
  const shortQuoteId = data.quoteId.slice(0, 8).toUpperCase();
  const firstName = data.fullName.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Success Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">Quote Received!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0;">We'll be in touch soon</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi ${firstName}!</p>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
                Thanks for submitting your information. We've received your quote request and will review your property for site suitability.
              </p>

              <!-- Quote Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">Quote Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">Quote ID</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <strong style="color: #1e293b; font-size: 15px; font-family: monospace;">#${shortQuoteId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">Property</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <strong style="color: #1e293b; font-size: 14px;">${data.fullAddress}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">Estimate</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <strong style="color: #FF5D22; font-size: 16px;">$${data.estimateLow.toLocaleString()} - $${data.estimateHigh.toLocaleString()} CAD</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What Happens Next -->
              <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 20px;">What happens next?</h2>

              <!-- Timeline Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <!-- Step 1 -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF5D22 0%, #FF7A47 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 14px;">1</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">SITE REVIEW</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            Our team will review your address for eligibility and access requirements.
                          </p>
                          <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0;">1-2 business days</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Step 2 -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #033A3F 0%, #055B63 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 14px;">2</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">PERSONAL CONSULTATION</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            We'll reach out to discuss your project and answer any questions.
                          </p>
                          <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0;">2-3 business days</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Step 3 -->
                <tr>
                  <td style="padding: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 14px;">3</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">FINAL QUOTE</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            Receive your detailed, buildable quote with timeline and payment options.
                          </p>
                          <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0;">3-5 business days</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Configuration Summary -->
              <h2 style="color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px; padding-top: 32px; border-top: 1px solid #e2e8f0;">Your Configuration</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 14px;">Purpose</span>
                  </td>
                  <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.useCase}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 14px;">Exterior</span>
                  </td>
                  <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.exteriorColor} Composite</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 14px;">Flooring</span>
                  </td>
                  <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.flooring}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #64748b; font-size: 14px;">HVAC</span>
                  </td>
                  <td align="right" style="padding: 8px 0;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.hvac ? 'Included' : 'Not included'}</strong>
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1e293b; font-size: 14px; font-weight: 600; margin: 0 0 12px;">We'll contact you at:</p>
                    <p style="color: #475569; font-size: 14px; margin: 0 0 6px;">📧 ${data.email}</p>
                    <p style="color: #475569; font-size: 14px; margin: 0;">📱 ${data.phone}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Reply to this email anytime and we'll get back to you right away.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #033A3F; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Pod Quotes</p>
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Quote #${shortQuoteId}</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Building dreams, one pod at a time</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getConfirmationSubject(quoteId: string): string {
  const shortId = quoteId.slice(0, 8).toUpperCase();
  return `Quote Received - We'll be in touch soon! (Quote #${shortId})`;
}
