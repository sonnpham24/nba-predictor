import { sendOtpEmail } from '../lib/mailer';

async function main() {
  console.log('Testing Nodemailer email sending to vnbrayvn@gmail.com...');
  const result = await sendOtpEmail('vnbrayvn@gmail.com', '654321', 'SonPhamTest');
  console.log('Email Send Result:', result);
}

main().catch(console.error);
