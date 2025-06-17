// services/emailService.js
import transporter from '../config/email.js';
import nodemailer from 'nodemailer';

/**
 * Internal send function
 */
async function _sendMail(mailOptions) {
  const info = await transporter.sendMail(mailOptions);
  if (process.env.ETHEREAL_USER) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } else {
    console.log('Email sent:', info.messageId);
  }
  return info;
}

/**
 * Send immediate confirmation email
 * @param {string} to
 * @param {object} appt { patientName, date, time, location }
 */
export async function sendConfirmationEmail(to, appt) {
  const { patientName, date, time, location } = appt;
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Appointment Booked ✔️',
    text: `Hello ${patientName},\n\nYour appointment has been booked successfully.\n\n• Date: ${date}\n• Time: ${time}\n• Location: ${location}\n\nSee you then!`,
    html: `<p>Hello <strong>${patientName}</strong>,</p><p>Your appointment has been <strong>booked successfully</strong>.</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li><li><strong>Location:</strong> ${location}</li></ul><p>See you then!</p>`
  };
  return _sendMail(mailOptions);
}

/**
 * Send reminder email 24h before
 * @param {string} to
 * @param {object} appt
 */
export async function sendReminderEmail(to, appt) {
  const { patientName, date, time, location } = appt;
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Reminder: Appointment Tomorrow ⏰',
    text: `Hi ${patientName},\n\nThis is a friendly reminder that you have an appointment tomorrow.\n\n• Date: ${date}\n• Time: ${time}\n• Location: ${location}\n\nPlease let us know if you need to reschedule.`,
    html: `<p>Hi <strong>${patientName}</strong>,</p><p>This is a reminder for your appointment <strong>tomorrow</strong>:</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li><li><strong>Location:</strong> ${location}</li></ul><p>If you need to reschedule, please get in touch.</p>`
  };
  return _sendMail(mailOptions);
}
