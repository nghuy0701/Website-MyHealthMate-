/**
 * Brevo Provider - Send Email
 */

import axios from 'axios'
import { env } from '~/configs/environment'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const sendEmail = async ({ to, subject, htmlContent, sender = null }) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: sender || {
          name: 'MyHealthMate',
          email: env.BREVO_SENDER_EMAIL || 'noreply@myhealthmate.com'
        },
        to: [{ email: to }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(`Brevo send email failed: ${error.message}`)
  }
}

const sendWelcomeEmail = async (userEmail, userName) => {
  const htmlContent = `
    <h1>Welcome to MyHealthMate!</h1>
    <p>Hello ${userName},</p>
    <p>Thank you for registering with MyHealthMate. We're excited to have you on board!</p>
    <p>Start your health journey with us today.</p>
    <br>
    <p>Best regards,</p>
    <p>MyHealthMate Team</p>
  `
  
  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to MyHealthMate!',
    htmlContent
  })
}

const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p>MyHealthMate Team</p>
  `
  
  return await sendEmail({
    to: userEmail,
    subject: 'Password Reset Request',
    htmlContent
  })
}

const brevoProvider = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
}

export default brevoProvider
