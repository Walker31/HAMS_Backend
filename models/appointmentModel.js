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
    required: true,
    trim: true,
  },
  doctorId: {
    type: Number,
    required: true,
    trim: true,
  },
  hospitalId: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date, 
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  appStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled', 'Incomplete','Rejected'],
    default: 'Pending',
  },
  consultStatus: {
    type: String,
    enum: ['Offline', 'Online'],
    default: 'Offline',
  },
  payStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  prescription: {
    type: String,
    default: '',
  },
  reasonForReject: {
    type: String,
    default: '',
  },
  MeetLink: {
    type: String,
    default: 'Link',
  },
}, {
  timestamps: true,
  collection: 'Appointments',
});

export default mongoose.model('Appointment', AppointmentSchema);
