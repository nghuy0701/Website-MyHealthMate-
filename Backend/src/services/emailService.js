import { env } from '~/configs/environment'

// Send welcome email using Brevo (SendInBlue)
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (!env.BREVO_API_KEY) {
      console.log('⚠️  Brevo API key not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MyHealthMate',
          email: env.BREVO_SENDER_EMAIL || 'noreply@myhealthmate.com'
        },
        to: [
          {
            email: userEmail,
            name: userName || 'User'
          }
        ],
        subject: 'Chào mừng bạn đến với MyHealthMate! 🎉',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌿 MyHealthMate</h1>
                <p>Chăm sóc sức khỏe thông minh</p>
              </div>
              <div class="content">
                <h2>Xin chào ${userName || 'bạn'}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>MyHealthMate</strong>.</p>
                <p><strong>✅ Tài khoản của bạn đã được tạo thành công!</strong></p>
                <p>Bây giờ bạn có thể:</p>
                <ul>
                  <li>✅ Đăng nhập vào hệ thống</li>
                  <li>📊 Thực hiện đánh giá nguy cơ tiểu đường</li>
                  <li>📈 Theo dõi lịch sử dự đoán</li>
                  <li>📚 Đọc các bài viết về sức khỏe</li>
                </ul>
                <p>Hãy bắt đầu hành trình chăm sóc sức khỏe của bạn ngay hôm nay!</p>
                <div style="text-align: center;">
                  <a href="${env.CLIENT_URL || 'http://localhost:3000'}/login" class="button">Đăng nhập ngay</a>
                </div>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 MyHealthMate. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Brevo API error:', errorData)
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log('✅ Welcome email sent via Brevo:', data.messageId)
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    // Don't throw error - registration should succeed even if email fails
    return { success: false, error: error.message }
  }
}

// Send prediction result email to patient
const sendPredictionResultEmail = async (patientEmail, patientName, predictionResult) => {
  try {
    if (!env.BREVO_API_KEY) {
      console.log('⚠️  Brevo API key not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    if (!patientEmail) {
      console.log('⚠️  No patient email provided, skipping email')
      return { success: false, error: 'No email provided' }
    }

    const { probability, riskLevel, createdAt } = predictionResult
    
    // Determine risk info
    let riskColor = '#16a34a'
    let riskLabel = 'Nguy cơ thấp'
    let riskIcon = '✅'
    let riskMessage = 'Kết quả tốt! Bạn có nguy cơ thấp mắc bệnh tiểu đường.'
    let riskAdvice = 'Hãy duy trì lối sống lành mạnh, ăn uống cân đối và tập luyện đều đặn.'
    
    if (probability >= 70) {
      riskColor = '#dc2626'
      riskLabel = 'Nguy cơ cao'
      riskIcon = '⚠️'
      riskMessage = 'Bạn có nguy cơ cao mắc bệnh tiểu đường.'
      riskAdvice = 'Khuyến nghị gặp bác sĩ để được tư vấn và xét nghiệm chuyên sâu.'
    } else if (probability >= 30) {
      riskColor = '#eab308'
      riskLabel = 'Nguy cơ trung bình'
      riskIcon = '⚡'
      riskMessage = 'Bạn có nguy cơ trung bình mắc bệnh tiểu đường.'
      riskAdvice = 'Nên cải thiện chế độ ăn uống, tăng cường vận động và kiểm tra sức khỏe định kỳ.'
    }

    const formattedDate = new Date(createdAt).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MyHealthMate',
          email: env.BREVO_SENDER_EMAIL || 'noreply@myhealthmate.com'
        },
        to: [
          {
            email: patientEmail,
            name: patientName || 'Bệnh nhân'
          }
        ],
        subject: `Kết quả dự đoán nguy cơ tiểu đường - ${riskLabel}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; }
              .result-box { background: white; border: 2px solid ${riskColor}; border-radius: 10px; padding: 25px; margin: 20px 0; text-align: center; }
              .probability { font-size: 48px; font-weight: bold; color: ${riskColor}; margin: 15px 0; }
              .risk-label { font-size: 24px; color: ${riskColor}; font-weight: bold; margin-bottom: 15px; }
              .message-box { background: #fff3cd; border-left: 4px solid ${riskColor}; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .advice-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { background: white; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌿 MyHealthMate</h1>
                <p>Kết quả dự đoán nguy cơ tiểu đường</p>
              </div>
              <div class="content">
                <h2>Xin chào ${patientName || 'bạn'}!</h2>
                <p>Dưới đây là kết quả dự đoán nguy cơ tiểu đường của bạn:</p>
                
                <div class="result-box">
                  <div style="font-size: 40px; margin-bottom: 10px;">${riskIcon}</div>
                  <div class="probability">${probability}%</div>
                  <div class="risk-label">${riskLabel}</div>
                  <div style="color: #6b7280; font-size: 14px;">Xác suất mắc bệnh tiểu đường</div>
                </div>

                <div class="message-box">
                  <strong>📊 Đánh giá:</strong><br>
                  ${riskMessage}
                </div>

                <div class="advice-box">
                  <strong>💡 Khuyến nghị:</strong><br>
                  ${riskAdvice}
                </div>

                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Thông tin dự đoán</h3>
                  <div class="info-row">
                    <span style="color: #6b7280;">Ngày thực hiện:</span>
                    <span style="font-weight: bold;">${formattedDate}</span>
                  </div>
                  <div class="info-row">
                    <span style="color: #6b7280;">Mức độ nguy cơ:</span>
                    <span style="font-weight: bold; color: ${riskColor};">${riskLabel}</span>
                  </div>
                  <div class="info-row" style="border: none;">
                    <span style="color: #6b7280;">Xác suất:</span>
                    <span style="font-weight: bold;">${probability}%</span>
                  </div>
                </div>

                <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 10px; margin: 20px 0;">
                  <strong style="color: #92400e;">⚠️ Lưu ý quan trọng:</strong><br>
                  <span style="color: #78350f;">Kết quả này chỉ mang tính chất tham khảo và không thay thế cho chẩn đoán y khoa chuyên nghiệp. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn cụ thể.</span>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${env.CLIENT_URL || 'http://localhost:3000'}/history" class="button">Xem lịch sử dự đoán</a>
                </div>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động từ hệ thống MyHealthMate</p>
                <p style="margin-top: 10px;">Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi</p>
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">&copy; 2025 MyHealthMate. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Brevo API error:', errorData)
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log(`✅ Prediction result email sent to ${patientEmail}:`, data.messageId)
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('❌ Error sending prediction email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin verification email
const sendAdminVerificationEmail = async (adminEmail, adminName, verificationToken) => {
  try {
    if (!env.BREVO_API_KEY) {
      console.log('⚠️  Brevo API key not configured, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const verificationUrl = `${env.CLIENT_URL || 'http://localhost:3000'}/admin/verify-email/${verificationToken}`

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MyHealthMate Admin',
          email: env.BREVO_SENDER_EMAIL || 'noreply@myhealthmate.com'
        },
        to: [
          {
            email: adminEmail,
            name: adminName || 'Admin'
          }
        ],
        subject: '🔐 Xác thực tài khoản Admin - MyHealthMate',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #7c3aed; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; font-size: 16px; }
              .button:hover { background: #6366f1; }
              .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .code-box { background: white; border: 2px dashed #7c3aed; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
              .token { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #7c3aed; letter-spacing: 2px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 MyHealthMate Admin</h1>
                <p>Xác thực tài khoản quản trị viên</p>
              </div>
              <div class="content">
                <h2>Xin chào ${adminName || 'Admin'}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản quản trị viên tại <strong>MyHealthMate</strong>.</p>
                
                <div class="warning-box">
                  <strong>⚠️ Bước quan trọng:</strong><br>
                  Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng xác thực địa chỉ email của bạn.
                </div>

                <p><strong>Vui lòng nhấn vào nút bên dưới để xác thực email:</strong></p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Xác thực Email</a>
                </div>

                <div class="code-box">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Hoặc sử dụng mã xác thực:</p>
                  <div class="token">${verificationToken}</div>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  <strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau <strong>24 giờ</strong>. 
                  Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
                </p>

                <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <strong>🔒 Bảo mật:</strong><br>
                  Đây là email xác thực tài khoản quản trị viên. Vui lòng không chia sẻ link hoặc mã xác thực với bất kỳ ai.
                </div>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 MyHealthMate Admin System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Brevo API error:', errorData)
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log('✅ Admin verification email sent via Brevo:', data.messageId)
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('❌ Error sending admin verification email:', error)
    return { success: false, error: error.message }
  }
}

const emailService = {
  sendWelcomeEmail,
  sendPredictionResultEmail,
  sendAdminVerificationEmail
}

export default emailService
