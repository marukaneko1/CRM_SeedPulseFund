import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generic email sending function
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VS CRM <noreply@seedpulsefund.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendBulkEmail(recipients: string[], subject: string, html: string) {
  const results = []
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient,
        subject,
        html,
      })
      results.push({ recipient, success: true, data: result.data })
    } catch (error: any) {
      results.push({ recipient, success: false, error: error.message })
    }
  }
  
  return results
}

export async function sendVerificationEmail(email: string, name: string, userId: string) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${userId}`
    
    // Using your verified domain: seedpulsefund.com
    const { data, error } = await resend.emails.send({
      from: 'VS CRM <noreply@seedpulsefund.com>',
      to: [email],
      subject: 'Verify your VS CRM account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">VS CRM</h1>
                        <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 14px;">Venture Studio CRM</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Welcome to VS CRM, ${name}!</h2>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                          Thank you for signing up. We're excited to have you on board! 
                        </p>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          To get started, please verify your email address by clicking the button below:
                        </p>
                        
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6B7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
                          Or copy and paste this URL into your browser:
                        </p>
                        <p style="color: #3B82F6; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                          ${verificationUrl}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                        
                        <p style="color: #6B7280; line-height: 1.6; margin: 0; font-size: 14px;">
                          If you didn't create an account with VS CRM, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                        <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;">
                          © ${new Date().getFullYear()} VS CRM. All rights reserved.
                        </p>
                        <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
                          Venture Studio CRM - Manage your deals, contacts, and portfolio
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error }
    }

    console.log('✅ Verification email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    // Using your verified domain: seedpulsefund.com
    const { data, error } = await resend.emails.send({
      from: 'VS CRM <noreply@seedpulsefund.com>',
      to: [email],
      subject: 'Welcome to VS CRM! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🎉 Welcome!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                          Your email has been verified successfully! Welcome to VS CRM.
                        </p>
                        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          You can now access all features of our platform:
                        </p>
                        
                        <ul style="color: #4B5563; line-height: 2; margin: 0 0 30px 0; padding-left: 20px;">
                          <li><strong>Deal Pipeline:</strong> Track your investment opportunities</li>
                          <li><strong>Contact Management:</strong> Organize your network</li>
                          <li><strong>Portfolio Tracking:</strong> Monitor company performance</li>
                          <li><strong>Team Messaging:</strong> Collaborate with your team</li>
                          <li><strong>Calendar Sync:</strong> Schedule meetings seamlessly</li>
                        </ul>
                        
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/auth/login" style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Go to Dashboard
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6B7280; line-height: 1.6; margin: 0; font-size: 14px;">
                          If you have any questions, feel free to reply to this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                        <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;">
                          © ${new Date().getFullYear()} VS CRM. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    console.log('✅ Welcome email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}