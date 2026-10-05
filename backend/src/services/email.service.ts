import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initializes or returns the cached Nodemailer SMTP transporter.
   * If SMTP is unconfigured, returns null to avoid unhandled socket exceptions.
   */
  private static getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    if (!env.SMTP_HOST || !env.SMTP_USER) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  /**
   * Sends a professional subscription confirmation email to the subscriber.
   * Does NOT throw on failures, ensuring database operations remain intact.
   */
  static async sendSubscriptionConfirmation(toEmail: string): Promise<boolean> {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn(
        `[EmailService] SMTP not fully configured (host: "${env.SMTP_HOST ? 'configured' : 'missing'}", user: "${env.SMTP_USER ? 'configured' : 'missing'}"). Skipping email confirmation for ${toEmail}.`
      );
      return false;
    }

    const portalUrl = env.CLIENT_URLS[1] || env.CLIENT_URLS[0] || 'http://localhost:5174';

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: toEmail,
      subject: 'ICEM Smart Notice Portal — Subscription Confirmed',
      text: `Indira College of Engineering and Management (ICEM)
Smart Notice Portal — Subscription Confirmed

Hello,

This email confirms that your address (${toEmail}) has been successfully subscribed to the ICEM Smart Notice Portal.

You will now receive priority notifications and official college announcements directly in your inbox, including:
• Official Academic Circulars & Semester Schedules
• Examination Schedules & Hall Ticket Notices
• Placement Drives, Internship Offers & Career Opportunities
• Campus Events, Technical Workshops & Cultural Fests
• Administrative & Holiday Updates

You can access and search all current notices at any time by visiting:
${portalUrl}

If you did not request this subscription or believe this is in error, please contact the student helpdesk at support@indiraicem.ac.in.

Best regards,
Office of Academic Affairs & Student Support
Indira College of Engineering and Management (ICEM)
Pune, Maharashtra, India
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ICEM Smart Notice Portal — Subscription Confirmed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 32px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #00275a 0%, #003c84 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header-badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.15);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
      color: #e0e7ff;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.025em;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #cbd5e1;
    }
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);
    }
    .content {
      padding: 32px 28px;
    }
    .status-card {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
    }
    .status-title {
      font-size: 14px;
      font-weight: 700;
      color: #166534;
      margin: 0 0 4px 0;
    }
    .status-text {
      font-size: 13px;
      color: #15803d;
      margin: 0;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 24px;
    }
    .feature-list {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .feature-list h3 {
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #00275a;
    }
    .feature-item {
      display: flex;
      margin-bottom: 10px;
      font-size: 13px;
      color: #475569;
      line-height: 1.4;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .feature-bullet {
      color: #003c84;
      font-weight: bold;
      margin-right: 8px;
    }
    .action-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #003c84;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 28px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      line-height: 1.5;
    }
    .footer strong {
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-badge">Official Communication</div>
        <h1>Indira College of Engineering & Management</h1>
        <p>ICEM Smart Notice & Circular Distribution Portal</p>
      </div>
      <div class="accent-bar"></div>
      <div class="content">
        <div class="status-card">
          <div>
            <div class="status-title">✓ Subscription Confirmed</div>
            <div class="status-text">Your email <strong>${toEmail}</strong> has been enrolled for official notice bulletins.</div>
          </div>
        </div>

        <p class="message">
          Hello,<br><br>
          You have successfully subscribed to circular updates from the <strong>ICEM Smart Notice Portal</strong>. Whenever new critical notices, schedules, or announcements are authorized and published by department heads or college administration, you will receive timely notifications directly to this email address.
        </p>

        <div class="feature-list">
          <h3>Notices You Will Receive</h3>
          <div class="feature-item">
            <span class="feature-bullet">▸</span>
            <span><strong>Academic & Examination:</strong> Exam timetables, hall ticket circulars, and university guidelines.</span>
          </div>
          <div class="feature-item">
            <span class="feature-bullet">▸</span>
            <span><strong>Training & Placements:</strong> Campus placement drives, interview schedules, and internships.</span>
          </div>
          <div class="feature-item">
            <span class="feature-bullet">▸</span>
            <span><strong>Campus & Events:</strong> Technical fests, sports meets, guest lectures, and institutional workshops.</span>
          </div>
          <div class="feature-item">
            <span class="feature-bullet">▸</span>
            <span><strong>Administrative:</strong> Fee payment deadlines, holiday notices, and campus advisories.</span>
          </div>
        </div>

        <div class="action-container">
          <a href="${portalUrl}" class="btn" target="_blank" rel="noopener noreferrer">Access Smart Notice Portal</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Indira College of Engineering and Management (ICEM)</strong><br>
        Parandwadi, Off Pune-Mumbai Expressway, Pune - 410506<br>
        Approved by AICTE | Affiliated to Savitribai Phule Pune University (SPPU)</p>
        <p style="margin-top: 12px; color: #94a3b8;">
          This is an automated confirmation from the ICEM Smart Notice Portal.<br>
          For student support or queries, contact <a href="mailto:support@indiraicem.ac.in" style="color: #003c84;">support@indiraicem.ac.in</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Confirmation email sent successfully to ${toEmail} (MessageId: ${info.messageId})`);
      return true;
    } catch (error: any) {
      // Safely log the error message without exposing passwords/secrets
      console.error(
        `[EmailService] Failed to send subscription confirmation email to ${toEmail}:`,
        error?.message || error
      );
      return false;
    }
  }
    static async sendNewNoticeNotification(
    toEmail: string,
    notice: {
      title: string;
      category?: string;
      issuedBy?: string;
      summary?: string;
      id: string;
      refNo?: string;
    }
  ): Promise<boolean> {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn(
        `[EmailService] SMTP not configured. Skipping notice notification for ${toEmail}.`
      );
      return false;
    }

    const portalUrl =
      env.CLIENT_URLS[0] || 'http://localhost:5173';

    const noticeUrl = `${portalUrl}/#/notice/${notice.id}`;

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: toEmail,
      subject: `New ICEM Notice: ${notice.title}`,

      text: `ICEM SMART NOTICE PORTAL

A NEW NOTICE HAS BEEN PUBLISHED

Title: ${notice.title}
Category: ${notice.category || 'General'}
Issued By: ${notice.issuedBy || 'ICEM Administration'}
${notice.refNo ? `Reference No: ${notice.refNo}` : ''}

Summary:
${notice.summary || 'No summary provided.'}

View Notice:
${noticeUrl}

You are receiving this email because you subscribed to ICEM Notice alerts.
`,

      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ICEM Notice</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px 24px 24px;background-color:#003c84;color:#ffffff;">
              <p style="margin:0 0 14px;font-size:13px;font-weight:bold;letter-spacing:0.4px;">ICEM Smart Notice Portal</p>
              <span style="display:inline-block;padding:5px 11px;border:1px solid #bfdbfe;border-radius:20px;color:#ffffff;font-size:10px;font-weight:bold;letter-spacing:1.4px;">OFFICIAL NOTICE</span>
              <h1 style="margin:16px 0 0;color:#ffffff;font-size:23px;line-height:1.35;font-weight:bold;">A New Notice Has Been Published</h1>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background-color:#f59e0b;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#ffffff;">
                <tr>
                  <td style="padding:0 0 10px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1.5px;">NOTICE</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;color:#00275a;font-size:23px;line-height:1.35;font-weight:bold;">${notice.title}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <span style="display:inline-block;padding:6px 12px;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;color:#003c84;font-size:12px;font-weight:bold;">${notice.category || 'General'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;color:#334155;font-size:14px;line-height:1.5;"><strong style="color:#00275a;">Issued By:</strong>&nbsp; ${notice.issuedBy || 'ICEM Administration'}</td>
                </tr>
                ${
                  notice.refNo
                    ? `
                <tr>
                  <td style="padding:0 0 16px;color:#334155;font-size:14px;line-height:1.5;"><strong style="color:#00275a;">Reference No:</strong>&nbsp; ${notice.refNo}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding:18px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
                    <p style="margin:0 0 8px;color:#00275a;font-size:12px;font-weight:bold;letter-spacing:0.5px;">SUMMARY</p>
                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">${notice.summary || 'No summary provided.'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#003c84" style="border-radius:6px;">
                    <a href="${noticeUrl}" style="display:inline-block;padding:14px 32px;border:1px solid #003c84;border-radius:6px;background-color:#003c84;color:#ffffff;text-decoration:none;font-size:15px;line-height:1.2;font-weight:bold;">View Notice</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background-color:#fffbeb;border-top:1px solid #fde68a;color:#78350f;text-align:center;font-size:12px;line-height:1.6;">
              You are receiving this email because you subscribed to ICEM Notice alerts.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;line-height:1.6;">
              <strong style="color:#334155;">Indira College of Engineering and Management (ICEM)</strong><br>
              ICEM Smart Notice &amp; Circular Distribution Portal
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log(
        `[EmailService] Notice notification sent to ${toEmail} ` +
        `(MessageId: ${info.messageId})`
      );

      return true;
    } catch (error: any) {
      console.error(
        `[EmailService] Failed to send notice notification to ${toEmail}:`,
        error?.message || error
      );

      return false;
    }
  }
}
