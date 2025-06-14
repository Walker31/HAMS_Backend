import Appointment from "../models/appointmentModel.js";
import Doctor from '../models/doctorModel.js';

class doctorControllers {

    async getAppointments(req,res) {
        const {doctorId} = req.params;
        try {
            const doctorExists = await Doctor.findOne({ doctorId });
            if (!doctorExists)return res.status(404).json({ message: "Doctor not found" });
            const appointments = await Appointment.find({ doctorId });
            if (!appointments || appointments.length === 0) {
                return res.status(404).json({ message: "No appointments found for this doctor" });
            }
            res.status(200).json({appointments});
        } catch (error) {
                  res.status(500).json({ message: "Error fetching appointments", error: error.message });
        }
        
    }
}

export default new doctorControllers;