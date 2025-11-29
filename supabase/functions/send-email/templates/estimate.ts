interface EstimateData {
  email: string;
  useCase: string;
  exteriorColor: string;
  flooring: string;
  hvac: boolean;
  estimateLow: number;
  estimateHigh: number;
  appUrl?: string;
}

export function generateEstimateEmail(data: EstimateData): string {
  const appUrl = data.appUrl || 'https://your-app-url.com';
  const ctaUrl = `${appUrl}?email=${encodeURIComponent(data.email)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pod Estimate</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #033A3F 0%, #055B63 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 10px;">Pod Quotes</h1>
              <p style="color: #A8D5D9; font-size: 16px; margin: 0;">Your Backyard Pod Estimate</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi there!</p>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
                Thanks for using our Pod Estimator. Based on your preferences, here's your personalized estimate:
              </p>

              <!-- Estimate Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FF5D22 0%, #FF7A47 100%); border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <p style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px; opacity: 0.9;">Estimated Range</p>
                    <p style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; line-height: 1.2;">
                      $${data.estimateLow.toLocaleString()} - $${data.estimateHigh.toLocaleString()}
                    </p>
                    <p style="color: #ffffff; font-size: 13px; margin: 12px 0 0; opacity: 0.8;">CAD + tax • Includes delivery & installation</p>
                  </td>
                </tr>
              </table>

              <!-- Configuration Table -->
              <h2 style="color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">Your Configuration</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Purpose</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.useCase}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Size</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px; letter-spacing: 0.5px;">STANDARD 160 SQ FT</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Exterior</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.exteriorColor} Composite</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Flooring</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.flooring}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #64748b; font-size: 14px;">Heating & Cooling</span>
                  </td>
                  <td align="right" style="padding: 12px 0;">
                    <strong style="color: #1e293b; font-size: 15px;">${data.hvac ? 'Included (Mini-split)' : 'Not Included'}</strong>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #FF5D22; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(255, 93, 34, 0.3);">
                      Check Availability in Your Area →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 16px;">What's next?</h3>
              <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0 0 32px; padding-left: 20px;">
                <li>Complete your info to check site eligibility</li>
                <li>Get a personalized consultation</li>
                <li>Receive your final buildable quote</li>
              </ul>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Simply reply to this email and we'll get back to you right away.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #033A3F; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Pod Quotes</p>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Building dreams, one pod at a time</p>
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

export function getEstimateSubject(estimateLow: number, estimateHigh: number): string {
  return `Your Pod Estimate: $${estimateLow.toLocaleString()}-$${estimateHigh.toLocaleString()} CAD`;
}
