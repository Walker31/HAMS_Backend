import Reminder from '../models/reminderModel.js';
import { sendReminderEmail } from './emailService.js';
import cron from 'node-cron';

export const scheduleReminderInDB = async (appointmentId, appointmentData, patientEmail, appointmentDate) => {
  try {
    const reminderTime = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000));
    const now = new Date();
    
    if (reminderTime > now) {
      const reminder = new Reminder({
        appointmentId,
        patientEmail,
        reminderTime,
        appointmentData,
        status: 'pending'
      });
      
      const saved = await reminder.save();
      console.log("Reminder scheduled for:", patientEmail, "at", reminderTime.toLocaleString());
      return saved;
    }
    return null;
  } catch (error) {
    console.error("Error scheduling reminder:", error.message);
    return null;
  }
};

export const processPendingReminders = async () => {
  try {
    const now = new Date();
    const pendingReminders = await Reminder.find({
      status: 'pending',
      reminderTime: { $lte: now }
    });

    for (const reminder of pendingReminders) {
      try {
        await sendReminderEmail(reminder.patientEmail, reminder.appointmentData);
        
        await Reminder.findByIdAndUpdate(reminder._id, {
          status: 'sent',
          sentAt: now
        });
        
        console.log("Reminder sent to:", reminder.patientEmail);
        
      } catch (emailError) {
        await Reminder.findByIdAndUpdate(reminder._id, {
          status: 'failed',
          error: emailError.message,
          failedAt: now
        });
        
        console.error("Failed to send reminder to:", reminder.patientEmail, emailError.message);
      }
    }
  } catch (error) {
    console.error("Error processing reminders:", error.message);
  }
};

export const startReminderCronJob = () => {
  cron.schedule('*/5 * * * *', processPendingReminders);
  console.log("Reminder cron job started");
};

export const cancelReminder = async (appointmentId) => {
  try {
    const result = await Reminder.updateMany(
      { appointmentId, status: 'pending' },
      { status: 'cancelled' }
    );
    
    console.log(`Cancelled ${result.modifiedCount} reminders for appointment ${appointmentId}`);
    return result;
  } catch (error) {
    console.error("Error cancelling reminder:", error.message);
    return null;
  }
};