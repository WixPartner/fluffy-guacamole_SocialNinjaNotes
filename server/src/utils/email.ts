import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  name?: string;
  actionUrl?: string;
}

const createVerificationEmailTemplate = (name: string, verificationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Mentor Account</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 20px;
      color: white;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 15px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
    }
    .message {
      color: #475569;
      margin-bottom: 30px;
    }
    .verification-box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.3);
      color: #ffffff !important;
      text-decoration: none;
    }
    .security-features {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin: 30px auto;
      max-width: 450px;
    }
    .security-item {
      flex: 0 1 auto;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .security-text {
      font-size: 14px;
      color: #64748b;
      text-align: center;
      margin: 0;
      line-height: 1.4;
    }
    .link {
      color: #6366f1;
      word-break: break-all;
      text-decoration: none;
      border-bottom: 1px dashed #6366f1;
    }
    .expiry-notice {
      font-size: 14px;
      color: #64748b;
      text-align: center;
      margin-top: 20px;
      padding: 10px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f1f5f9;
      border-radius: 0 0 16px 16px;
    }
    .footer-text {
      color: #64748b;
      font-size: 14px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Mentor</div>
        <div class="title">Verify Your Email</div>
        <div class="subtitle">One quick step to get started</div>
      </div>
      
      <div class="content">
        <div class="greeting">Welcome, ${name}!</div>
        
        <div class="message">
          Thanks for joining Mentor! To start creating and organizing your content, please verify your email address by clicking the button below.
        </div>

        <div class="verification-box">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <div class="security-features">
            <div class="security-item">
              <div class="security-text">Secure Verification</div>
            </div>
            <div class="security-item">
              <div class="security-text">Quick Process</div>
            </div>
            <div class="security-item">
              <div class="security-text">Account Protection</div>
            </div>
          </div>
        </div>

        <div class="message">
          If the button doesn't work, you can copy and paste this link into your browser:
          <br><br>
          <a href="${verificationUrl}" class="link">${verificationUrl}</a>
        </div>

        <div class="expiry-notice">
          This verification link will expire in 24 hours for security reasons.
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">This is an automated message from Mentor.</div>
        <div class="footer-text">If you didn't create an account, please ignore this email.</div>
        <div class="footer-text">&copy; ${new Date().getFullYear()} Mentor. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const createTemplateNotificationEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mentor Templates!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 20px;
      color: white;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 15px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
    }
    .message {
      color: #475569;
      margin-bottom: 30px;
    }
    .features {
      background: #f8fafc;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
    }
    .feature-text {
      color: #1e293b;
      font-weight: 500;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .cta-text {
      font-size: 18px;
      font-weight: 600;
      color: #6366f1;
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f1f5f9;
      border-radius: 0 0 16px 16px;
    }
    .footer-text {
      color: #64748b;
      font-size: 14px;
      margin: 5px 0;
    }
    .highlight {
      color: #6366f1;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Mentor</div>
        <div class="title">Thanks for Subscribing!</div>
        <div class="subtitle">Get notified about our upcoming templates</div>
      </div>
      
      <div class="content">
        <div class="greeting">Hey ${name || 'there'}</div>
        
        <div class="message">
          Thanks for signing up for template notifications! We'll let you know as soon as our collection of productivity-boosting templates becomes available.
        </div>

        <div class="features">
          <div class="feature-item">
            <div class="feature-text">Project management templates</div>
          </div>
          <div class="feature-item">
            <div class="feature-text">Study and note-taking templates</div>
          </div>
          <div class="feature-item">
            <div class="feature-text">Content creation templates</div>
          </div>
          <div class="feature-item">
            <div class="feature-text">Business planning templates</div>
          </div>
        </div>

        <div class="cta">
          <div class="cta-text">Coming Soon!</div>
          <div class="message">
            We're working hard to create templates that will help you be more productive. You'll receive an email when they're ready to use.
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">This is an automated message from Mentor.</div>
        <div class="footer-text">Questions? Contact our support team anytime.</div>
        <div class="footer-text">&copy; ${new Date().getFullYear()} Mentor. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: {
        name: 'Mentor',
        address: process.env.SMTP_FROM as string
      },
      to: options.email,
      subject: options.subject,
      text: options.message, // Plain text version
      html: options.name && options.actionUrl 
        ? createVerificationEmailTemplate(options.name, options.actionUrl)
        : options.name && !options.actionUrl
        ? createTemplateNotificationEmailTemplate(options.name)
        : `<p>${options.message}</p>` // Fallback for other emails
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
}; 