import nodemailer from 'nodemailer';
import { logSystemEvent } from '@/lib/logger';

function getMailerConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS are required to send email');
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
}

export async function sendOtpEmail(toEmail: string, otpCode: string, username: string) {
  try {
    const transporter = nodemailer.createTransport(getMailerConfig());
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #07090e; color: #ffffff; border-radius: 20px; padding: 40px; border: 1px solid rgba(245, 158, 11, 0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; line-height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 16px; font-size: 32px; margin-bottom: 12px;">🏀</div>
          <h1 style="font-size: 26px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #FFD700, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 1px;">BUZZERBET 2026-27</h1>
          <p style="font-size: 13px; color: #94a3b8; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Email Verification Code</p>
        </div>

        <div style="background-color: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 25px; margin-bottom: 30px; text-align: center;">
          <p style="font-size: 15px; color: #cbd5e1; margin-top: 0;">Xin chào <strong style="color: #ffffff;">${username}</strong>,</p>
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 25px;">Cảm ơn bạn đã đăng ký tài khoản tại <strong>BuzzerBet 2026-27</strong>. Dưới đây là mã xác thực OTP 6 chữ số của bạn:</p>

          <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #07090e; font-size: 36px; font-weight: 900; letter-spacing: 10px; padding: 16px 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);">
            ${otpCode}
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 25px; margin-bottom: 0;">Mã OTP này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>

        <div style="text-align: center; border-t: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">Developed & Designed by Son Pham (phamcongson297@gmail.com)</p>
          <p style="font-size: 11px; color: #475569; margin-top: 4px;">Copyright © BuzzerBet 2026-27 - All Rights Reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"BuzzerBet 2026-27" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🏀 [${otpCode}] Mã xác thực OTP tài khoản BuzzerBet 2026-27`,
      html: htmlContent,
    });

    await logSystemEvent('SEND_OTP_EMAIL_SUCCESS', `Đã gửi thành công email OTP tới ${toEmail} (MessageId: ${info.messageId})`, 'INFO');
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    await logSystemEvent('SEND_OTP_EMAIL_ERROR', `Lỗi khi gửi email OTP tới ${toEmail}: ${err.message}`, 'ERROR');
    console.error('Nodemailer Error:', err);
    return { success: false, error: err.message };
  }
}
