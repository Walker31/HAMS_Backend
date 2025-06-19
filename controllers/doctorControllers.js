import Appointment from "../models/appointmentModel.js";
import Doctor from '../models/doctorModel.js';

class doctorControllers {
    async getNearbyDoctors(req, res) {
        const { lat, lon } = req.params;

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        try {
            const doctors = await Doctor.find({
            location: {
                $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lon), parseFloat(lat)],
                },
                $maxDistance: 50000, // 5 km
                },
            },
            });

            res.json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    }


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

    async topDoctors(req, res) {
        try {
            const doctors = await Doctor.find({}).limit(5);
            
            if (!doctors || doctors.length === 0) {
                return res.status(404).json({ message: "No doctors found" });
            }

            res.status(200).json({ doctors });
        } catch (err) {
            console.error("Error fetching top doctors:", err);
            res.status(500).json({ message: "Error fetching top doctors", error: err.message });
        }
    }


    async profile(req,res){
        const {doctorId} = req.params;
        try {
            const doctor = await Doctor.findOne({doctorId});
            if (!doctor)return res.status(404).json({ message: "Doctor not found" });
            res.status(200).json({doctor});
        } catch (error) {
            res.status(500).json({ message: "Error fetching profile", error: error.message });
        }
    }

    async getTopDoctor(req,res){
        try {
            const topDoctors = await Doctor.find()
            .sort({avgRating: -1})
            .limit(10);

            res.join({doctors: topDoctors})
        } catch (error) {
            res.status(500).json({message: "Unable to fetch top doctors", error})            
        }
    }
}

export default new doctorControllers;