import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const AppointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => nanoid(6),
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
  hospital: {
    type: String,
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
    enum: [
      'Requested',           // Initial booking
      'Pending',             // Awaiting doctor confirmation
      'Confirmed',           // Doctor confirmed
      'Request for Rescheduling', // Patient requested reschedule
      'Rescheduled',         // Appointment rescheduled
      'Completed',           // Appointment finished
      'Cancelled',           // Patient/doctor cancelled
      'Rejected',            // Doctor rejected
      'Incomplete'           // Appointment not completed
    ],
    default: 'Requested',
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
  rescheduleReason: {
    type: String,
    default: '',
  },
  meetLink: {
    type: String,
    
  },
}, {
  timestamps: true,
  collection: 'Appointments',
});

export default mongoose.model('Appointment', AppointmentSchema);
