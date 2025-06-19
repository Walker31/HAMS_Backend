// test-real-email.js
import transporter from './config/email.js';
import { sendConfirmationEmail, sendReminderEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function sendRealTest() {
  
  const payload = {
    patientName: 'Mahalakshmi Karikalan',
    email:   process.env.RECEIVER_EMAIL,        
    date:    '2025-06-25',
    time:    '10:30',
    location:'Main Hospital, Room 101'
  };

  console.log('→ Sending confirmation email to:', payload.email);
  try {
    const info = await sendConfirmationEmail(payload.email, payload);
    console.log('✅ Confirmation sent! MessageId:', info.messageId);
  } catch (err) {
    console.error('❌ Confirmation failed:', err.message);
    return;
  }

  console.log('→ Sending reminder email to:', payload.email);
  try {
    const info2 = await sendReminderEmail(payload.email, payload);
    console.log('✅ Reminder sent! MessageId:', info2.messageId);
  } catch (err) {
    console.error('❌ Reminder failed:', err.message);
  }
}

sendRealTest().catch(console.error);
