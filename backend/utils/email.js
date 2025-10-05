const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email verification
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Pizza Ordering System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #e74c3c;">Welcome to Pizza Ordering System!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationURL}" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationURL}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset - Pizza Ordering System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #e74c3c;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetURL}</p>
        <p>This link will expire in 10 minutes.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send stock alert to admin
const sendStockAlert = async (adminEmail, stockInfo) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: 'Low Stock Alert - Pizza Ordering System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #f39c12;">⚠️ Low Stock Alert</h2>
        <p>The following items are running low in stock:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${stockInfo.map(item => `
            <div style="margin: 10px 0;">
              <strong>${item.name}:</strong> ${item.currentStock} remaining (Threshold: ${item.threshold})
            </div>
          `).join('')}
        </div>
        <p>Please restock these items to ensure smooth operations.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">This is an automated alert from Pizza Ordering System.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStockAlert
};