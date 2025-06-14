import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    date: Date,
    time: { type: Date, default: Date.now },
    patientId: String,
    doctorId: String,
    appStatus: String,
    payStatus: Boolean,
    clinicId: String,
    slotNumber: String,
    appId: String
},
{
    timestamps: true
})
    


const AppointmentModel = mongoose.model("Appointments", AppointmentSchema);
export default AppointmentModel;