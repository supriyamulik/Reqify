const nodemailer = require('nodemailer');

/* ===================== TRANSPORT SETUP ===================== */

// Create transporter based on env
const createTransporter = () => {
  // Option 1: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Option 2: Gmail (development)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
      },
    });
  }

  // Option 3: Mailgun
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY,
      },
    });
  }

  // No transporter configured
  return null;
};

// Ethereal fallback for development
const setupTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/* ===================== EMAIL SERVICE ===================== */

const emailService = {
  // Send invitation email
  sendInvitation: async ({
    to,
    inviterName,
    organizationName,
    token,
    role,
  }) => {
    try {
      let transporter = createTransporter();

      if (!transporter) {
        transporter = await setupTestAccount();
      }

      const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite/${token}`;

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Reqify'}" <${process.env.EMAIL_FROM || 'noreply@reqify.com'
          }>`,
        to,
        subject: `You've been invited to join ${organizationName} on Reqify`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: Arial, sans-serif; color: #333; }
.container { max-width: 600px; margin: auto; padding: 20px; }
.button { background: #667eea; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
.role { background: #f3f4f6; padding: 6px 10px; border-radius: 6px; font-weight: bold; }
</style>
</head>
<body>
<div class="container">
  <h2>🎯 You're Invited!</h2>
  <p><strong>${inviterName}</strong> invited you to join <strong>${organizationName}</strong>.</p>
  <p>Role: <span class="role">${role.toUpperCase()}</span></p>
  <p>
    <a class="button" href="${inviteUrl}">Accept Invitation</a>
  </p>
  <p style="font-size:12px;">This invite expires in 7 days.</p>
</div>
</body>
</html>
        `,
        text: `
${inviterName} invited you to join ${organizationName}.
Role: ${role.toUpperCase()}

Accept here:
${inviteUrl}
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('📧 Preview Email:', preview);
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  },

  // Welcome email - ENHANCED VERSION
  sendWelcomeEmail: async ({ to, name, organizationName, organizationSlug }) => {
    try {
      let transporter = createTransporter();

      if (!transporter) {
        transporter = await setupTestAccount();
      }

      const dashboardUrl = `${process.env.FRONTEND_URL}/workspace/${organizationSlug}/dashboard`;

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Reqify'}" <${process.env.EMAIL_FROM || 'noreply@reqify.com'}>`,
        to,
        subject: `🎉 Welcome to ${organizationName} on Reqify!`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .wrapper {
              width: 100%;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 50px 40px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>');
              opacity: 0.1;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 20px;
              background: rgba(255,255,255,0.2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
              color: white;
              backdrop-filter: blur(10px);
            }
            .header h1 {
              color: white;
              margin: 0 0 10px;
              font-size: 32px;
              font-weight: 700;
              position: relative;
            }
            .header p {
              color: rgba(255,255,255,0.9);
              margin: 0;
              font-size: 18px;
            }
            .content {
              padding: 50px 40px;
            }
            .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            .message {
              color: #666;
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
              transition: transform 0.2s;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 24px rgba(102, 126, 234, 0.5);
            }
            .features {
              margin: 40px 0;
            }
            .feature {
              display: flex;
              align-items: flex-start;
              margin: 20px 0;
              padding: 20px;
              background: linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%);
              border-radius: 12px;
              border-left: 4px solid #667eea;
            }
            .feature-icon {
              font-size: 28px;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .feature-content h3 {
              margin: 0 0 8px;
              color: #1a1a1a;
              font-size: 18px;
              font-weight: 600;
            }
            .feature-content p {
              margin: 0;
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin: 30px 0;
              padding: 30px 20px;
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              border-radius: 12px;
            }
            .stat {
              text-align: center;
            }
            .stat-number {
              font-size: 32px;
              font-weight: 700;
              color: #667eea;
              display: block;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
              margin: 30px 0;
            }
            .footer {
              text-align: center;
              padding: 30px 40px;
              background: #f9fafb;
              color: #666;
              font-size: 13px;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #667eea;
              text-decoration: none;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              .content { padding: 30px 20px; }
              .header { padding: 40px 20px; }
              .greeting { font-size: 20px; }
              .stats { flex-direction: column; gap: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <!-- Header -->
              <div class="header">
                <div class="logo">R</div>
                <h1>🎉 Welcome to Reqify!</h1>
                <p>Your workspace is ready to go</p>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">Hi ${name}! 👋</div>
                
                <p class="message">
                  Congratulations! Your <strong>${organizationName}</strong> workspace on Reqify is now live and ready. 
                  You're all set to revolutionize how your team handles software requirements with AI-powered analysis.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" class="cta-button">
                    🚀 Go to Your Dashboard
                  </a>
                </div>

                <!-- Stats -->
                <div class="stats">
                  <div class="stat">
                    <span class="stat-number">95%</span>
                    <span class="stat-label">Accuracy</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">10x</span>
                    <span class="stat-label">Faster</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">∞</span>
                    <span class="stat-label">Potential</span>
                  </div>
                </div>

                <!-- Features -->
                <div class="features">
                  <h3 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">✨ What You Can Do Next</h3>
                  
                  <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-content">
                      <h3>Invite Your Team</h3>
                      <p>Add analysts and reviewers to collaborate on requirement analysis. Build your dream team in minutes.</p>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">📄</div>
                    <div class="feature-content">
                      <h3>Upload Your First SRS</h3>
                      <p>Start analyzing requirements by uploading your SRS documents. We support TXT, PDF, and DOCX formats.</p>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-content">
                      <h3>AI-Powered Analysis</h3>
                      <p>Detect duplicates, conflicts, and ambiguities automatically. Get AI-powered rewrites to IEEE standards.</p>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-content">
                      <h3>Generate Reports</h3>
                      <p>Download clean, professional SRS documents that your team and stakeholders will love.</p>
                    </div>
                  </div>
                </div>

                <div class="divider"></div>

                <!-- Quick Links -->
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #666; margin-bottom: 15px;">Need help getting started?</p>
                  <div>
                    <a href="${process.env.FRONTEND_URL}/docs" style="color: #667eea; text-decoration: none; margin: 0 15px; font-weight: 600;">📚 Documentation</a>
                    <a href="${process.env.FRONTEND_URL}/support" style="color: #667eea; text-decoration: none; margin: 0 15px; font-weight: 600;">💬 Support</a>
                    <a href="${process.env.FRONTEND_URL}/tutorials" style="color: #667eea; text-decoration: none; margin: 0 15px; font-weight: 600;">🎥 Tutorials</a>
                  </div>
                </div>

                <!-- Workspace Info -->
                <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-top: 30px;">
                  <h4 style="margin: 0 0 10px; color: #1a1a1a; font-size: 16px;">📍 Your Workspace Details</h4>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    <strong>Organization:</strong> ${organizationName}
                  </p>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    <strong>Workspace URL:</strong> <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none;">${process.env.FRONTEND_URL}/workspace/${organizationSlug}</a>
                  </p>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">
                    <strong>Your Role:</strong> Owner (Full Access)
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="social-links">
                  <a href="#">Twitter</a> • 
                  <a href="#">LinkedIn</a> • 
                  <a href="#">GitHub</a>
                </div>
                <p style="margin: 10px 0 5px;">
                  © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reqify'}. All rights reserved.
                </p>
                <p style="margin: 5px 0; color: #999; font-size: 12px;">
                  You're receiving this email because you created a workspace on Reqify.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
        text: `
Welcome to Reqify, ${name}!

Congratulations! Your ${organizationName} workspace is now live.

What's Next?
1. Invite Your Team - Add analysts and reviewers
2. Upload Your First SRS - Start analyzing requirements
3. AI-Powered Analysis - Detect duplicates, conflicts, and ambiguities
4. Generate Reports - Download clean IEEE-standard documents

Your Workspace: ${dashboardUrl}

Need help? Visit our documentation or contact support.

© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reqify'}
      `
      };

      const info = await transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development' && !createTransporter()) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('📧 Preview Email:', preview);
      }

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
};

module.exports = emailService;