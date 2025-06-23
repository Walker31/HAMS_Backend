import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

class DoctorControllers {
  // GET nearby doctors based on lat/lon
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
            $maxDistance: 50000, // 50 km
          },
        },
      });

      res.json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }

  // GET appointments for a doctor
  async getAppointments(req, res) {
    const { doctorId } = req.params;

    try {
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists)
        return res.status(404).json({ message: "Doctor not found" });

      const appointments = await Appointment.find({ doctorId });

      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: "No appointments found for this doctor" });
      }

      res.status(200).json({ appointments });
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
  }

  // GET top rated doctors by location
  async getTopDoctorsByLocation(req, res) {
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
            $maxDistance: 50000, // 50 km
          },
        },
      })
        .sort({ avgRating: -1 })
        .limit(10);

      res.status(200).json({ doctors });
    } catch (error) {
      console.error("Error fetching top doctors by location:", error);
      res.status(500).json({
        message: "Error fetching top doctors by location",
        error: error.message,
      });
    }
  }

    async profile(req,res){
        const {doctorId} = req.params;
        try {
            const doctor = await Doctor.findOne({doctorId: doctorId});
            if (!doctor)return res.status(404).json({ message: "Doctor not found" });
            res.status(200).json({doctor});
        } catch (error) {
            res.status(500).json({ message: "Error fetching profile", error: error.message });
        }
    }
  

  // PUT: Update doctor overview
  async updateDoctorOverview(req, res) {
    const doctorId = req.params.id;
    const { overview } = req.body;

    try {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { overview },
        { new: true }
      );

      if (!updatedDoctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.status(200).json(updatedDoctor);
    } catch (error) {
      res.status(500).json({ message: "Error updating overview", error: error.message });
    }
  }
}

export default new DoctorControllers();
