import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientEmail: { type: String, required: true },
  reminderTime: { type: Date, required: true },
  appointmentData: {
    patientName: String,
    doctorName: String,
    date: String,
    time: String,
    location: String
  },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  sentAt: { type: Date },
  failedAt: { type: Date },
  error: { type: String }
}, { timestamps: true,collection: 'Reminders' });

export default mongoose.model('Reminders', reminderSchema);

