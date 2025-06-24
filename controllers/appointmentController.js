import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Hospital from "../models/hospitalModel.js";
import {
  sendConfirmationEmail,
  sendReminderEmail,
} from "../services/emailService.js";

class appointmentController {
  async sendEmail(req, res) {
    const { date, patientId, doctorId, clinicId, slotNumber } = req.body;
    try {
      // Validate required fields
      if (!patientId || !doctorId || !clinicId || !date || !slotNumber) {
        return res.status(400).json({
          message:
            "All fields are required: patientId, doctorId, clinicId, date, slotNumber",
        });
      }

      // Get patient details
      const patient = await Patient.findOne({ patientId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get hospital/clinic details
      const hospital = await Hospital.findOne({ hospitalId: clinicId });
      if (!hospital) {
        return res.status(404).json({ message: "Hospital/Clinic not found" });
      }

      // Get doctor details (optional, for additional info)
      /*const doctor = await Doctor.findOne({ doctorId });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }*/

      // Prepare appointment data for email
      const appointmentData = {
        patientName: patient.name,
        date: date,
        time: `Slot ${slotNumber}`,
        location: hospital.hospitalName,
        
      };

      // Send confirmation email
      await sendConfirmationEmail(patient.email, appointmentData);

      return res.status(200).json({
        message: "Email sent successfully",
        sentTo: patient.email,
        appointmentDetails: appointmentData,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({
        message: "Error sending email",
        error: error.message,
      });
    }
  }

  async bookAppointment(req, res) {
    const {
      date,
      patientId,
      doctorId,
      payStatus,
      clinicId,
      slotNumber,
      reason,
    } = req.body;

    try {
      if (!reason || reason.trim() === "") {
        return res.status(400).json({ message: "Reason is required" });
      }

      const existingAppointment = await Appointment.findOne({
        doctorId,
        date,
        slotNumber,
      });

      if (existingAppointment) {
        return res.status(409).json({ message: "Slot Already Booked" });
      }

      const data = await Appointment.create({
        date: new Date(date),
        patientId,
        doctorId,
        payStatus,
        clinicId,
        slotNumber,
        appStatus: "Pending",
        reason,
      });

      return res.status(201).json({
        message: "Appointment slot booked successfully",
        appId: data.appId,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Error booking appointment",
        error: err.message,
      });
    }
  }

  async getAppointmentsByPatient(req, res) {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    try {
      const appointments = await Appointment.find({ patientId })
        .populate("doctorId", "name") // populate doctor name only
        .sort({ createdAt: -1 });
      // newest first
      res.status(200).json(appointments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async showAppointments(req, res) {
    const { date } = req.params;
    const { doctorId } = req.query;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const query = {
      appStatus: "Pending",
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    if (doctorId) {
      query.doctorId = doctorId;
    }

    try {
      const appointments = await Appointment.find(query);
      res.json(appointments);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }

  async getPreviousAppointments(req, res) {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    try {
      const appointments = await Appointment.find({
        doctorId,
        appStatus: { $ne: "Pending" },
      }).populate("patientId", "name");

      res.json(appointments);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching previous appointments",
          error: error.message,
        });
    }
  }

  async updateAppStatus(req, res) {
    const { appId } = req.params;
    const { appStatus, rejectionReason } = req.body;

    try {
      const updateData = { appStatus };
      if (appStatus === "Rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedAppointment = await Appointment.findOneAndUpdate(
        { appId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({
        message: "Appointment status updated successfully",
        appointment: updatedAppointment,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async deleteAppointment(req, res) {
    const { appId } = req.body;
    try {
      const deleted = await Appointment.findOneAndDelete({ appId });
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      return res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error Deleting the History", error: err });
    }
  }

  async rescheduleAppointment(req, res) {
    const { appId, newTime, newSlotNumber } = req.body;

    try {
      const update = await Appointment.findOneAndUpdate(
        { appId },
        {
          ...(newTime && { time: newTime }),
          ...(newSlotNumber && { slotNumber: newSlotNumber }),
          appStatus: "Rescheduled",
        },
        { new: true }
      );
      if (!update) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(update);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating Appointment", error: err.message });
    }
  }

  async cancelAppointment(req, res) {
    const { appId } = req.body;

    try {
      const update = await Appointment.findOneAndUpdate(
        { appId },
        { appStatus: "Cancelled" },
        { new: true }
      );
      if (!update) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(update);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error Cancelling Appointment", error: err.message });
    }
  }
}

export default new appointmentController();
