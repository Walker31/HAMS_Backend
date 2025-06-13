import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    date: Date,
    time: Date.now,
    patientId: String,
    doctorId: String,
    appStatus: String,
    payStatus: String,
    clinicId: String,
    slotNumber: String,
    appId: String
})
    


const AppointmentModel = mongoose.model("Appointments", AppointmentSchema);
module.exports = AppointmentModel;