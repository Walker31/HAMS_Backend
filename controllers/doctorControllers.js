import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";
import { uploadToCloudinaryFromBuffer } from "../services/cloudinary.js";

class DoctorControllers {
  async getNearbyDoctors(req, res) {
    const { lat, lon } = req.params;
    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });
    }

    try {
      const doctors = await Doctor.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lon), parseFloat(lat)],
            },
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

  async getAppointments(req, res) {
    const { doctorId } = req.params;

    try {
<<<<<<< HEAD
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists)
        return res.status(404).json({ message: "Doctor not found" });
=======
      const doctorExists = await Doctor.findOne({doctorId});
      if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });
>>>>>>> ded4b5a7f653f51ee5a15b10aa10520a3008ac9d

      const appointments = await Appointment.find({ doctorId });
      if (!appointments || appointments.length === 0) {
        return res
          .status(404)
          .json({ message: "No appointments found for this doctor" });
      }

      res.status(200).json({ appointments });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching appointments", error: error.message });
    }
  }

  async getTopDoctorsByLocation(req, res) {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });
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
        .sort({ averageRating: -1 })
        .limit(10);

      res.status(200).json({ doctors });
    } catch (error) {
      console.error("Error fetching top doctors by location:", error);
      res
        .status(500)
        .json({
          message: "Error fetching top doctors by location",
          error: error.message,
        });
    }
  }

  async profile(req, res) {
    const doctorId = req.user?.id;
    try {
      const doctor = await Doctor.findOne({doctorId});
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      console.log(doctor);
      res.status(200).json({ doctor });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching profile", error: error.message });
    }
  }

  async publicDoctorProfile(req, res) {
    const { doctorId } = req.params;

    try {
      const doctor = await Doctor.findOne({ doctorId }).select("-password");

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.status(200).json({ doctor });
    } catch (error) {
      console.error("Error fetching public doctor profile:", error);
      res
        .status(500)
        .json({
          message: "Error fetching public doctor profile",
          error: error.message,
        });
    }
  }

  async updateDoctorOverview(req, res) {
    const doctorId = req.user?.id;
    const { overview } = req.body;

    try {
<<<<<<< HEAD
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { overview },
        { new: true }
      );
      if (!updatedDoctor)
        return res.status(404).json({ message: "Doctor not found" });
=======
      const updatedDoctor = await Doctor.findOneAndUpdate({ doctorId: doctorId }, { overview }, { new: true });
      if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
>>>>>>> ded4b5a7f653f51ee5a15b10aa10520a3008ac9d

      res.status(200).json(updatedDoctor);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating overview", error: error.message });
    }
  }

  async updateAvailableSlots(req, res) {
    const { doctorId } = req.params;
    const { date, slots } = req.body;

    try {
      if (!doctorId || !date || !slots) {
        return res
          .status(400)
          .json({ message: "Missing doctorId, date, or slots" });
      }

      const doctor = await Doctor.findOne({ doctorId });
      

      if (!doctor) return res.status(404).json({ message: "Doctor not found" });

      doctor.availableSlots.set(date, slots);
      await doctor.save();

      res.status(200).json({
        message: "Slots updated successfully",
        availableSlots: Object.fromEntries(doctor.availableSlots),
      });
    } catch (error) {
      console.error("Error updating slots:", error);
      res
        .status(500)
        .json({ message: "Error updating slots", error: error.message });
    }
  }

  async getAvailableSlots(req, res) {
    const { doctorId } = req.params;

    try {
      const doctor = await Doctor.findOne({ doctorId });

      if (!doctor) return res.status(404).json({ message: "Doctor not found" });

      const slotsObject =
        doctor.availableSlots instanceof Map
          ? Object.fromEntries(doctor.availableSlots)
          : doctor.availableSlots;

      res.status(200).json({ availableSlots: slotsObject });
    } catch (error) {
      console.error("Error fetching slots:", error);
      res
        .status(500)
        .json({ message: "Error fetching slots", error: error.message });
    }
  }

  async getBookedSlots(req, res) {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Missing doctorId or date" });
    }

    try {
      const appointments = await Appointment.find({ doctorId, date }).select(
        "slotNumber"
      );
      const bookedSlots = appointments.map((appt) => appt.slotNumber);
      res.status(200).json({ bookedSlots });
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res
        .status(500)
        .json({ message: "Error fetching booked slots", error: error.message });
    }
  }
  async editProfile(req, res) {
    
    if (req.body.location && typeof req.body.location === "string") {
        try {
          req.body.location = JSON.parse(req.body.location);
          if (Array.isArray(req.body.location.coordinates)) {
            req.body.location.coordinates =
              req.body.location.coordinates.map(Number);
          }
        } catch (err) {
          console.error("Invalid location format:", err);
          return res.status(400).json({ error: "Invalid location data" });
        }
      }
    if(req.body.availableSlots && typeof req.body.availableSlots === "string")
      try{
        req.body.availableSlots = JSON.parse(req.body.availableSlots);
      }catch(error){
        console.error("Error in parsing the available slots")
      }
    try {
      const doctorId = req.body._id;

      const updatedData = { ...req.body };
      
      if (req.file) {
        const photoData = await uploadToCloudinaryFromBuffer(
          req.file.buffer,
          "my-profile"
        );
        updatedData.photo = photoData;
      }
      console.log(updatedData)
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $set: updatedData },
        { new: true }
      );
      res.json({ message: "Doctor profile updated", doctor: updatedDoctor });
    } catch (error) {
      console.error("Edit doctor error: ", error);
      res.status(500).json({ error: "Server error while updating profile" });
    }
  }
}

export default new DoctorControllers();
