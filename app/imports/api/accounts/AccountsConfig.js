import { Accounts } from "meteor/accounts-base";

// Email sender configuration
Accounts.emailTemplates.resetPassword.from = () => "CarpSchool <no-reply@carp.school>";
Accounts.emailTemplates.verifyEmail.from = () => "CarpSchool <no-reply@carp.school>";
Accounts.emailTemplates.enrollAccount.from = () => "CarpSchool <no-reply@carp.school>";

// Email subject lines
Accounts.emailTemplates.resetPassword.subject = () => "Reset Your Password";
Accounts.emailTemplates.verifyEmail.subject = () => "🚗 Verify Your CarpSchool Email";
Accounts.emailTemplates.enrollAccount.subject = () => "Complete Your CarpSchool Account Setup";

// Beautiful HTML email template for verification
Accounts.emailTemplates.verifyEmail.html = (user, url) => {
  const firstName = user.profile?.firstName || "Student";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your CarpSchool Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .help-section {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .help-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .help-text {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
    .footer {
      background-color: #2c3e50;
      padding: 30px;
      text-align: center;
    }
    .footer-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0 0 10px 0;
    }
    .powered-by {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      margin: 15px 0 0 0;
      font-style: italic;
    }
    .social-links {
      margin: 20px 0 0 0;
    }
    .social-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      margin: 0 10px;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 8px;
      }
      .header, .content, .footer {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .cta-button {
        padding: 14px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗 CarpSchool</div>
      <p class="tagline">Student Carpooling Made Easy</p>
    </div>

    <div class="content">
      <h1 class="greeting">Welcome, ${firstName}!</h1>

      <p class="message">
        Thank you for joining CarpSchool! We're excited to help you connect with fellow students
        for safe, convenient, and affordable transportation.
      </p>

      <p class="message">
        To get started and access all features, please verify your email address by clicking the button below:
      </p>

      <div class="cta-container">
        <a href="${url}" class="cta-button">✅ Verify My Email</a>
      </div>

      <div class="help-section">
        <h3 class="help-title">🛡️ Why verify your email?</h3>
        <p class="help-text">
          Email verification helps us ensure account security and allows you to receive important
          notifications about your rides, messages from other students, and account updates.
        </p>
      </div>

      <p class="message">
        If the button doesn't work, you can copy and paste this link into your browser:<br>
        <span style="word-break: break-all; color: #667eea;">${url}</span>
      </p>

      <p class="message">
        <strong>Need help?</strong> Contact us at
        <a href="mailto:contact@carp.school" style="color: #667eea;">contact@carp.school</a>
      </p>
    </div>

    <div class="footer">
      <p class="footer-text">
        <strong>CarpSchool</strong> - Connecting Students, Building Community
      </p>

      <div class="social-links">
        <a href="/terms" class="social-link">Terms</a>
        <a href="/privacy" class="social-link">Privacy</a>
        <a href="/credits" class="social-link">Credits</a>
      </div>

      <p class="powered-by">
        Powered by Kangshifu beef ramen 🍜 and coffee ☕
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Beautiful HTML email template for password reset
Accounts.emailTemplates.resetPassword.html = (user, url) => {
  const firstName = user.profile?.firstName || "Student";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your CarpSchool Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    .security-notice {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .security-title {
      font-size: 18px;
      font-weight: 600;
      color: #856404;
      margin-bottom: 12px;
    }
    .security-text {
      font-size: 14px;
      color: #856404;
      margin: 0;
    }
    .footer {
      background-color: #2c3e50;
      padding: 30px;
      text-align: center;
    }
    .footer-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0 0 10px 0;
    }
    .powered-by {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      margin: 15px 0 0 0;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗 CarpSchool</div>
      <p class="tagline">Password Reset Request</p>
    </div>

    <div class="content">
      <h1 class="greeting">Hi ${firstName},</h1>

      <p class="message">
        We received a request to reset your CarpSchool password. If you made this request,
        click the button below to create a new password:
      </p>

      <div class="cta-container">
        <a href="${url}" class="cta-button">🔐 Reset My Password</a>
      </div>

      <div class="security-notice">
        <h3 class="security-title">🛡️ Security Notice</h3>
        <p class="security-text">
          If you didn't request this password reset, please ignore this email. Your password
          will remain unchanged. For security reasons, this link will expire in 24 hours.
        </p>
      </div>

      <p class="message">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="word-break: break-all; color: #ff6b6b;">${url}</span>
      </p>
    </div>

    <div class="footer">
      <p class="footer-text">
        <strong>CarpSchool</strong> - Your Account Security Matters
      </p>
      <p class="powered-by">
        Powered by Kangshifu beef ramen 🍜 and coffee ☕
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Beautiful HTML email template for account enrollment
Accounts.emailTemplates.enrollAccount.html = (user, url) => {
  const firstName = user.profile?.firstName || "Student";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your CarpSchool Account Setup</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    .features {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .features-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .feature-item {
      font-size: 14px;
      color: #666;
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .feature-item::before {
      content: "✅";
      position: absolute;
      left: 0;
    }
    .footer {
      background-color: #2c3e50;
      padding: 30px;
      text-align: center;
    }
    .footer-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0 0 10px 0;
    }
    .powered-by {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      margin: 15px 0 0 0;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗 CarpSchool</div>
      <p class="tagline">Complete Your Account Setup</p>
    </div>

    <div class="content">
      <h1 class="greeting">Welcome to CarpSchool, ${firstName}!</h1>

      <p class="message">
        You're just one step away from joining the CarpSchool community!
        Click the button below to complete your account setup and set your password:
      </p>

      <div class="cta-container">
        <a href="${url}" class="cta-button">🚀 Complete Setup</a>
      </div>

      <div class="features">
        <h3 class="features-title">🌟 What you'll get with CarpSchool:</h3>
        <div class="feature-item">Find rides with verified students</div>
        <div class="feature-item">Offer rides and earn gas money</div>
        <div class="feature-item">Connect with your campus community</div>
        <div class="feature-item">Safe, secure, and convenient transportation</div>
        <div class="feature-item">Real-time messaging with ride partners</div>
      </div>

      <p class="message">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="word-break: break-all; color: #4ecdc4;">${url}</span>
      </p>
    </div>

    <div class="footer">
      <p class="footer-text">
        <strong>CarpSchool</strong> - Welcome to the Community!
      </p>
      <p class="powered-by">
        Powered by Kangshifu beef ramen 🍜 and coffee ☕
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
