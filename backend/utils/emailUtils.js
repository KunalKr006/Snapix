const nodemailer = require('nodemailer');

/**
 * Create a transporter for sending emails
 * @returns {object} Nodemailer transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * Generate a random OTP
 * @param {number} length Length of the OTP
 * @returns {string} Generated OTP
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
}

/**
 * Send password reset email with OTP
 * @param {string} email Recipient email address
 * @param {string} otp One-time password
 * @returns {Promise} Nodemailer result
 */
async function sendPasswordResetEmail(email, otp) {
  const transporter = createTransporter();
  
  // Get the current timestamp for security
  const timestamp = new Date().toLocaleString();
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Snapix - Your Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
        <div style="text-align: center; padding: 10px 0; margin-bottom: 20px; background-color: #4f46e5; border-radius: 5px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Snapix</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Verification</h2>
          <p>You've requested to reset your password for your Snapix account. Please use the following verification code to complete the process:</p>
          
          <div style="margin: 25px 0; text-align: center;">
            <div style="display: inline-block; padding: 15px 30px; background-color: #f5f5f5; border: 1px dashed #ccc; border-radius: 5px; letter-spacing: 5px; font-size: 24px; font-weight: bold; color: #333;">${otp}</div>
          </div>
          
          <p><strong>Important Security Information:</strong></p>
          <ul style="padding-left: 20px; line-height: 1.5;">
            <li>This code will expire in <strong>15 minutes</strong> (at ${expirationTime}).</li>
            <li>Request was made at: ${timestamp}</li>
            <li>If you didn't request this reset, please secure your account by changing your password immediately.</li>
            <li>Never share this code with anyone, including Snapix support.</li>
          </ul>
          
          <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #777;">
            If you have any questions or need assistance, please contact our support team.<br>
            <strong>Note:</strong> This is an automated message, please do not reply to this email.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777;">
          <p>© ${new Date().getFullYear()} Snapix. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
}

module.exports = {
  generateOTP,
  sendPasswordResetEmail
}; 