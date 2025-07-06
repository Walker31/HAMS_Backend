// services/emailService.js
import transporter from '../config/email.js';
import nodemailer from 'nodemailer';

/**
 * Internal send function
 */
async function _sendMail(mailOptions) {
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
}

/**
 * Send immediate confirmation email
 * @param {string} to
 * @param {object} appt { patientName, date, time, location, doctorName }
 */
export async function sendConfirmationEmail(to, appt) {
  const { patientName, date, time, location, doctorName } = appt;
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Appointment Booked',
    text: `Hello ${patientName},\n\nYour appointment has been booked successfully.\n\n• Date: ${date}\n• Time: ${time}\n• Doctor: ${doctorName || 'Doctor'}\n• Location: ${location}\n\nSee you then!`,
    html: `<p>Hello <strong>${patientName}</strong>,</p><p>Your appointment has been <strong>booked successfully</strong>.</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li><li><strong>Doctor:</strong> ${doctorName || 'Doctor'}</li><li><strong>Location:</strong> ${location}</li></ul><p>See you then!</p>`
  };
  return _sendMail(mailOptions);
}


export async function sendReminderEmail(to, appt) {
  const { patientName, date, time, location, doctorName } = appt;
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Reminder: Appointment Tomorrow ',
    text: `Hi ${patientName},\n\nThis is a friendly reminder that you have an appointment tomorrow.\n\n• Date: ${date}\n• Time: ${time}\n• Doctor: ${doctorName || 'Doctor'}\n• Location: ${location}\n\nPlease let us know if you need to reschedule.`,
    html: `<p>Hi <strong>${patientName}</strong>,</p><p>This is a reminder for your appointment <strong>tomorrow</strong>:</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li><li><strong>Doctor:</strong> ${doctorName || 'Doctor'}</li><li><strong>Location:</strong> ${location}</li></ul><p>If you need to reschedule, please get in touch.</p>`
  };
  return _sendMail(mailOptions);
}


export async function sendCancellationEmail(to, appt) {
  const { patientName, date, time, location, doctorName, reason } = appt;
  const reasonText = reason ? `\n\nReason: ${reason}` : '';
  
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Appointment Cancelled ',
    text: `Hello ${patientName},\n\nWe're writing to confirm that your appointment has been cancelled.\n\n• Date: ${date}\n• Time: ${time}\n• Doctor: ${doctorName || 'Doctor'}\n• Location: ${location}${reasonText}\n\nIf you'd like to reschedule, please contact us. We apologize for any inconvenience.`,
    html: `
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>We're writing to confirm that your appointment has been <strong style="color: #dc3545;">cancelled</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Doctor:</strong> ${doctorName || 'Doctor'}</li>
          <li><strong>Location:</strong> ${location}</li>
          ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
        </ul>
      </div>
      <p>If you'd like to reschedule, please contact us. We apologize for any inconvenience.</p>
      <p style="color: #6c757d; font-size: 14px;">Thank you for your understanding.</p>
    `
  };
  return _sendMail(mailOptions);
}


export async function sendRescheduleEmail(to, appt) {
  const { patientName, oldDate, oldTime, newDate, newTime, location, doctorName } = appt;
  
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject: 'Appointment Rescheduled ',
    text: `Hello ${patientName},\n\nYour appointment has been rescheduled.\n\nPrevious Details:\n• Date: ${oldDate}\n• Time: ${oldTime}\n\nNew Details:\n• Date: ${newDate}\n• Time: ${newTime}\n• Doctor: ${doctorName || 'Doctor'}\n• Location: ${location}\n\nSee you at the new time!`,
    html: `
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Your appointment has been <strong style="color: #007bff;">rescheduled</strong>.</p>
      
      <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
        <h4 style="margin-top: 0; color: #856404;">Previous Details:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Date:</strong> ${oldDate}</li>
          <li><strong>Time:</strong> ${oldTime}</li>
        </ul>
      </div>
      
      <div style="background-color: #d1edff; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
        <h4 style="margin-top: 0; color: #004085;">New Details:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Date:</strong> ${newDate}</li>
          <li><strong>Time:</strong> ${newTime}</li>
          <li><strong>Doctor:</strong> ${doctorName || 'Doctor'}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
      </div>
      
      <p>See you at the new time!</p>
    `
  };
  return _sendMail(mailOptions);
}

export async function sendAppointmentResponseEmail(to, appt, action) {
  const { patientName, date, time, location, doctorName, reason, message } = appt;
  
  let subject;
  if (action === 'accept') {
    subject = 'Appointment Request Accepted ✅';
  } else if (action === 'reject') {
    subject = 'Appointment Request Rejected ❌';
  } else if (action === 'request') {
    subject = 'Appointment Request Submitted 📋';
  } else {
    subject = 'Appointment Update';
  }
  
  const mailOptions = {
    from: `"Your Clinic" <${transporter.options.auth.user}>`,
    to,
    subject,
    text: `Hello ${patientName},\n\n${message}\n\n• Date: ${date}\n• Time: ${time}\n• Doctor: ${doctorName}\n• Location: ${location}${reason ? `\n• Reason: ${reason}` : ''}\n\nThank you for choosing our service.`,
    html: `
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>${message}</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${action === 'accept' ? '#28a745' : action === 'reject' ? '#dc3545' : '#ffc107'}; margin: 15px 0;">
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Doctor:</strong> ${doctorName}</li>
          <li><strong>Location:</strong> ${location}</li>
          ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
        </ul>
      </div>
      <p>Thank you for choosing our service.</p>
    `
  };
  return _sendMail(mailOptions);
}