import { response } from "express";
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";
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
      const doctorExists = await Doctor.findOne({doctorId});
      if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });

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
      const doctor = await Doctor.findOne({ doctorId });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      const appointmentCount = await Appointment.countDocuments({ doctorId });

      const revenue = (doctor.basicFee || 0) * appointmentCount;

      res.status(200).json({
        doctor,
        revenue
      });

    } catch (error) {
      res.status(500).json({
        message: "Error fetching profile",
        error: error.message
      });
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
      const updatedDoctor = await Doctor.findOneAndUpdate({ doctorId: doctorId }, { overview }, { new: true });
      if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });

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
      const doctorId = req.body.doctorId

      const updatedData = { ...req.body };
      
      if (req.file) {
        const photoData = await uploadToCloudinaryFromBuffer(
          req.file.buffer,
          "my-profile"
        );
        updatedData.photo = photoData;
      }
      const updatedDoctor = await Doctor.findOneAndUpdate(
        {doctorId: doctorId},
        { $set: updatedData },
        { new: true }
      );
      res.json({ message: "Doctor profile updated", doctor: updatedDoctor });
    } catch (error) {
      console.error("Edit doctor error: ", error);
      res.status(500).json({ error: "Server error while updating profile" });
    }
  }

  async getRescheduleRequests(req, res) {
    const doctorId = req.user?.id;
    try {
      const requests = await Appointment.find({
        doctorId,
        appStatus: 'Request for rescheduling',
      });
      const formattedRequests = await Promise.all(requests.map(async (appt) => {
        const patient = await Patient.findOne({ patientId: appt.patientId });
        let time = '';
        if (appt.date instanceof Date) {
          time = appt.slotNumber && appt.slotNumber.match(/^\d{2}:\d{2}$/) ? appt.slotNumber : (appt.date.toISOString().substring(11, 16));
        } else {
          time = appt.slotNumber || '';
        }
        return {
          appointmentId: appt.appointmentId,
          patientName: patient ? patient.name : '',
          patientPhoto: patient && patient.photo && patient.photo.url ? patient.photo.url : '',
          reason: appt.reason,
          date: appt.date instanceof Date ? appt.date.toISOString().substring(0, 10) : appt.date,
          time,
          doctorId: appt.doctorId,
        };
      }));
      res.status(200).json({ requests: formattedRequests });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Doctor: Handle reschedule request (approve or reject)
  async handleRescheduleRequest(req, res) {
    const doctorId = req.user?.id;
    const { appointmentId, action, reason } = req.body;
    try {
      const appointment = await Appointment.findOne({ appointmentId, doctorId });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      if (appointment.appStatus !== 'Request for rescheduling') {
        return res.status(400).json({ message: 'No pending reschedule request for this appointment' });
      }
      if (action === 'approve') {
        // Find the next available slot (iterate over availableSlots)
        const doctor = await Doctor.findOne({ doctorId });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        let assignedDate = null;
        let assignedSlot = null;
        let found = false;
        for (let [date, slots] of doctor.availableSlots.entries()) {
          if (slots && slots.length > 0) {
            assignedDate = date;
            assignedSlot = slots[0];
            found = true;
            break;
          }
        }
        if (!found) {
          return res.status(400).json({ message: 'No available slots to reschedule' });
        }
        appointment.date = assignedDate;
        appointment.slotNumber = assignedSlot;
        appointment.appStatus = 'Rescheduled';
        await appointment.save();
        return res.status(200).json({ message: 'Appointment rescheduled', appointment });
      } else if (action === 'reject') {
        appointment.appStatus = 'Rejected';
        if (reason) appointment.reasonForReject = reason;
        await appointment.save();
        return res.status(200).json({ message: 'Reschedule request rejected', appointment });
      } else {
        return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

 async getRequestedAppointments(req, res){
    const doctorId = req.user?.id;

    try {
      const appointments = await Appointment.find({ 
        doctorId: doctorId,
        appStatus: 'Requested'
      });

      const responseData = [];

      for (const app of appointments) {
        // Assuming app.patientId is an ObjectId referring to Patient
        const patientId = app.patientId;
        const patient = await Patient.findOne({patientId}); 

        responseData.push({
          appointmentId: app.appointmentId,
          patientId: {
            name: patient?.name || "Unknown"
          },
          reason: app.reason,
          date: app.date,
          slotNumber: app.slotNumber
        });
      }

      res.status(200).json({ appointments: responseData });

    } catch (err) {
      console.error("Error fetching appointment requests:", err);
      res.status(500).json({ error: "Failed to fetch appointment requests." });
    }
  };


}

export default new DoctorControllers();
