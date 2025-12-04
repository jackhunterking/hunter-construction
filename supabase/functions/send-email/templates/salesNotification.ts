interface SalesNotificationData {
  inquiryId: string;
  submittedAt: string;
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

export function generateSalesNotificationEmail(data: SalesNotificationData): string {
  const projectTypesList = data.projectTypes.join(', ');
  const isHotLead = data.projectUrgency === 'ASAP';
  const priorityBadge = isHotLead ? 'HOT LEAD' : 'WARM LEAD';
  const priorityColor = isHotLead ? '#EF4444' : '#F59E0B';
  const responseTime = isHotLead ? 'Call within 1 hour' : 'Call within 24 hours';
  
  // Format submission time
  const submittedDate = new Date(data.submittedAt);
  const timeAgo = getTimeAgo(submittedDate);
  const formattedDate = submittedDate.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Basement Suite Lead</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Alert Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E3378 0%, #1E3378 100%); padding: 32px 40px; text-align: center; border-bottom: 4px solid ${priorityColor};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: ${priorityColor}; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; padding: 8px 20px; border-radius: 20px; margin-bottom: 16px;">
                      🔥 ${priorityBadge}
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px;">NEW BASEMENT SUITE INQUIRY</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0;">${timeAgo}</p>
            </td>
          </tr>

          <!-- Quick Action Bar -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="tel:${data.phone}" style="display: inline-block; background-color: #10B981; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); margin-right: 12px;">
                      📞 Call ${data.fullName.split(' ')[0]} Now
                    </a>
                    <a href="mailto:${data.email}" style="display: inline-block; background-color: #EBC76B; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(235, 199, 107, 0.3);">
                      📧 Send Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="text-align: center; color: #64748b; font-size: 12px; margin: 12px 0 0; font-weight: 600;">⏱️ ${responseTime}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Contact Information -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1E3378 0%, #1E3378 100%); border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #ffffff; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">👤 Lead Contact Info</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px; display: block; margin-bottom: 4px;">Full Name</span>
                          <strong style="color: #ffffff; font-size: 18px;">${data.fullName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px; display: block; margin-bottom: 4px;">Phone Number</span>
                          <a href="tel:${data.phone}" style="color: #EBC76B; font-size: 18px; font-weight: 600; text-decoration: none;">${data.phone}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px; display: block; margin-bottom: 4px;">Email Address</span>
                          <a href="mailto:${data.email}" style="color: #EBC76B; font-size: 16px; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project Summary -->
              <h2 style="color: #1e293b; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">📋 Project Summary</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Project Location</span>
                    <strong style="color: #1e293b; font-size: 15px;">${data.projectLocation}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Project Types</span>
                    <strong style="color: #1e293b; font-size: 15px;">${projectTypesList}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Needs Separate Entrance</span>
                    <strong style="color: #1e293b; font-size: 15px;">${data.needsSeparateEntrance ? '✅ Yes' : '❌ No'}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Has Plans/Design</span>
                    <strong style="color: #1e293b; font-size: 15px;">${data.hasPlanDesign ? '✅ Yes' : '❌ No (Needs Design)'}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">Timeline / Urgency</span>
                    <span style="display: inline-block; background-color: ${priorityColor}; color: #ffffff; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 16px;">${data.projectUrgency}</span>
                  </td>
                </tr>
              </table>

              ${data.additionalDetails ? `
              <!-- Additional Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #F59E0B;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #92400e; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 12px;">💬 Additional Details from Lead</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.additionalDetails}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Lead Score Insights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 24px; border: 1px solid #bae6fd;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #0c4a6e; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 12px;">🎯 Lead Score Insights</h3>
                    <ul style="color: #0c4a6e; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      ${isHotLead ? '<li><strong>HIGH URGENCY:</strong> Lead wants to start ASAP - prioritize immediate contact</li>' : '<li><strong>PLANNING PHASE:</strong> Lead has 1-3 month timeline - schedule consultation</li>'}
                      ${data.needsSeparateEntrance ? '<li><strong>RENTAL SUITE:</strong> Likely seeking income property - discuss ROI & financing</li>' : '<li><strong>PERSONAL USE:</strong> May be for family or home office</li>'}
                      ${!data.hasPlanDesign ? '<li><strong>DESIGN NEEDED:</strong> Opportunity to upsell design services</li>' : '<li><strong>PLANS READY:</strong> Move faster to quote phase</li>'}
                      <li><strong>SERVICE AREA:</strong> Verify ${data.projectLocation.split(',')[0]} is in coverage zone</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Submission Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                <tr>
                  <td>
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      <strong>Inquiry ID:</strong> ${data.inquiryId}<br/>
                      <strong>Submitted:</strong> ${formattedDate}<br/>
                      <strong>Source:</strong> Basement Suite Estimator (Web)
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer CTA -->
          <tr>
            <td style="background-color: #1E3378; padding: 24px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px;">⚡ Quick Actions</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="tel:${data.phone}" style="display: inline-block; background-color: #10B981; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 0 6px;">📞 Call Now</a>
                    <a href="mailto:${data.email}" style="display: inline-block; background-color: #EBC76B; color: #000000; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 0 6px;">📧 Email</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">Hunter Construction - Sales Team Notification</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0;">This is an automated lead notification. Reply to this email to contact the lead directly.</p>
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

export function getSalesNotificationSubject(fullName: string, projectUrgency: string): string {
  const firstName = fullName.split(' ')[0];
  const urgencyEmoji = projectUrgency === 'ASAP' ? '🔥' : '⭐';
  return `${urgencyEmoji} NEW LEAD: ${firstName} - Basement Suite (${projectUrgency})`;
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes === 1) return '1 minute ago';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
}

