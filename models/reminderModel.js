import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientEmail: { type: String, required: true },
  reminderTime: { type: Date, required: true },
  appointmentData: { type: Object, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true,collection: 'Reminders' });

export default mongoose.model('Reminders', reminderSchema);

