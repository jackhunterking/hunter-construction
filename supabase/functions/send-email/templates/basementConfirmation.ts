interface BasementConfirmationData {
  email: string;
  fullName: string;
  phone: string;
  projectLocation: string;
  projectTypes: string[];
  needsSeparateEntrance: boolean;
  hasPlanDesign: boolean;
  projectUrgency: string;
  additionalDetails: string | null;
}

export function generateBasementConfirmationEmail(data: BasementConfirmationData): string {
  const firstName = data.fullName.split(' ')[0];
  const projectTypesList = data.projectTypes.join(', ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basement Inquiry Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Success Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; text-align: center;">
              <img src="https://inquiry.hunterconstruction.ca/assets/Hunter_Logo.png" alt="Hunter Construction" style="max-width: 180px; height: auto; margin: 0 auto 20px; display: block;" />
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">Inquiry Received!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0;">We'll be in touch soon</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Hi ${firstName}!</p>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
                Thank you for your interest in our basement renovation services. We've received your inquiry and our team will review your project details.
              </p>

              <!-- Project Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">Your Project Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 14px;">Project Location</span>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <strong style="color: #1e293b; font-size: 14px;">${data.projectLocation}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 14px;">Project Types</span>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <strong style="color: #1e293b; font-size: 14px;">${projectTypesList}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 14px;">Separate Entrance</span>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <strong style="color: #1e293b; font-size: 14px;">${data.needsSeparateEntrance ? 'Yes' : 'No'}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 14px;">Have Plans/Design</span>
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                          <strong style="color: #1e293b; font-size: 14px;">${data.hasPlanDesign ? 'Yes' : 'No'}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">Timeline</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <strong style="color: #EBC76B; font-size: 14px;">${data.projectUrgency}</strong>
                        </td>
                      </tr>
                    </table>
                    ${data.additionalDetails ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                      <span style="color: #64748b; font-size: 14px; display: block; margin-bottom: 8px;">Additional Details:</span>
                      <p style="color: #1e293b; font-size: 14px; margin: 0; line-height: 1.5;">${data.additionalDetails}</p>
                    </div>
                    ` : ''}
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
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #EBC76B 0%, #EBC76B 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 700; font-size: 14px;">1</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">PROJECT REVIEW</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            Our team will review your project requirements and location for service availability.
                          </p>
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
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #000000 0%, #000000 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 14px;">2</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">CONSULTATION CALL</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            We'll reach out to discuss your vision and answer any questions you may have.
                          </p>
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
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #EBC76B 0%, #EBC76B 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 700; font-size: 14px;">3</div>
                        </td>
                        <td valign="top">
                          <h3 style="color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 6px;">DETAILED QUOTE</h3>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                            Receive your customized quote with timeline and financing options.
                          </p>
                        </td>
                      </tr>
                    </table>
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
                Questions in the meantime? Reply to this email anytime and we'll get back to you right away.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <img src="https://inquiry.hunterconstruction.ca/assets/Hunter_Logo.png" alt="Hunter Construction" style="max-width: 140px; height: auto; margin: 0 auto 12px; display: block;" />
              <p style="color: #64748b; font-size: 13px; margin: 0;">Building income units</p>
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

export function getBasementConfirmationSubject(fullName: string): string {
  const firstName = fullName.split(' ')[0];
  return `Thanks ${firstName}! We received your basement inquiry`;
}

