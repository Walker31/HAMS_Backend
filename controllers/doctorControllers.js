import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

class DoctorControllers {
  
  async getNearbyDoctors(req, res) {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    try {
      const doctors = await Doctor.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
            $maxDistance: 200000,
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
      const doctorExists = await Doctor.findOne({doctorId});
      if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });

      const appointments = await Appointment.find({ doctorId });

      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: "No appointments found for this doctor" });
      }

      res.status(200).json({ appointments });
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
  }

  // GET top-rated doctors based on location
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
            $maxDistance: 50000,
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

  // GET a specific doctor's profile
  async profile(req, res) {
    const doctorId = req.user?.id;
    try {
      const doctor = await Doctor.findOne({doctorId:doctorId });
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      res.status(200).json({ doctor });
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
  }

  async publicDoctorProfile(req, res) {
  const { doctorId } = req.params;

  try {
    const doctor = await Doctor.findOne({doctorId}).select(
      "-password"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ doctor });
  } catch (error) {
    console.error("Error fetching public doctor profile:", error);
    res.status(500).json({
      message: "Error fetching public doctor profile",
      error: error.message,
    });
  }
}

  // PUT update doctor's overview
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

  // POST update doctor available slots (doctor adds slots for each date)
 async updateAvailableSlots(req, res) {
  const { doctorId } = req.params;
  const { date, slots } = req.body;

  try {
    if (!doctorId || !date || !slots) {
      return res.status(400).json({ message: "Missing doctorId, date, or slots" });
    }

    const doctor = await Doctor.findOne({ doctorId });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Convert existing slots to a Map if needed
    const updatedSlots = new Map(doctor.availableSlots || []);
    updatedSlots.set(date, slots);

    await Doctor.updateOne(
      { doctorId },
      { availableSlots: updatedSlots }
    );

    res.status(200).json({
      message: "Slots updated successfully",
      availableSlots: Object.fromEntries(updatedSlots),
    });
  } catch (error) {
    console.error("Error updating slots:", error);
    res.status(500).json({ message: "Error updating slots", error: error.message });
  }
}

  // GET available slots for a doctor (patient fetches slots)
  async getAvailableSlots(req, res) {
    const { doctorId } = req.params;

    try {
      const doctor = await Doctor.findOne({ doctorId });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const slotsObject = doctor.availableSlots instanceof Map
        ? Object.fromEntries(doctor.availableSlots)
        : doctor.availableSlots;

      res.status(200).json({ availableSlots: slotsObject });
    } catch (error) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ message: "Error fetching slots", error: error.message });
    }
  }
}

export default new DoctorControllers();
