// routes/appointments.js
import { Router } from 'express';
import schedule from 'node-schedule';
import {
  sendConfirmationEmail,
  sendReminderEmail
} from '../services/emailService.js';

const router = Router(); 


router.post('/book', async (req, res) => {
  try {
    const appt = req.body;
    
    await sendConfirmationEmail(appt.email, appt);

    
    const [year, month, day] = appt.date.split('-').map(Number);
    const [hour, minute]     = appt.time.split(':').map(Number);
    const apptDate = new Date(year, month - 1, day, hour, minute);

  
    const reminderDate = new Date(apptDate.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate > new Date()) {
      schedule.scheduleJob(reminderDate, () => {
        sendReminderEmail(appt.email, appt)
          .catch(err => console.error('Reminder email failed:', err));
      });
      console.log(`Scheduled reminder for ${reminderDate}`);
    } else {
      console.log('Appointment is less than 24h away; skipping day-before reminder.');
    }

    res.status(201).json({ message: 'Booked, confirmation sent, reminder scheduled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book or send emails.' });
  }
});

export default router;
