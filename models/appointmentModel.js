import mongoose from 'mongoose';

import { nanoid } from 'nanoid';

const AppointmentSchema = new mongoose.Schema({
  appId: {
    type: String,
    unique: true,
    index: true,
    default: () => nanoid(6),
  },
  date: {
    type: Date,
    default: Date.now,
  },
  doctorId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  clinicId: {
    type: String,
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  payStatus: {
    type: String,
    default: 'Unpaid',
    enum:['Paid','Unpaid']
  },
  appStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled', 'Incomplete'],
    default: 'Pending',
  },
}, {
  timestamps: true,
  collection: "Appointments",
});

const Appointment = mongoose.model("Appointments", AppointmentSchema);
export default Appointment;
