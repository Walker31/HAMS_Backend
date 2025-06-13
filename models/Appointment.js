import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    Date: Date,
    Time: Date,
    PatientId: String,
    DoctorId: String,
    AppStatus: String,
    PayStatus: String,
    ClinicId: String,
    SlotNumber: String,
    AppId: String
}, {
  timestamps: true,
  collection: 'Appointments'
})
    


const AppointmentModel = mongoose.model("Appointments", AppointmentSchema);
module.exports = AppointmentModel;