import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const AppointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => nanoid(8),
  },
  patientId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  clinicId: {
    type: String,
    required: true
  },
  date: {
    type: String,  // you can also use Date type, but since you're saving date string, I'm keeping it simple
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  appStatus: {
    type: String,
    enum: ['Pending', 'Confirmed','Cancelled','Completed','Rescheduled','Incomplete'],
    default: 'Pending'
  },
  consultStatus: {
    type: String,
    enum: ['Offline', 'Online'],
    default: 'Offline'
  },
  payStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  },

  MeetLink: {
    type: String,
    default:'Link'
  }
}, { timestamps: true });

export default mongoose.model('Appointment', AppointmentSchema);

