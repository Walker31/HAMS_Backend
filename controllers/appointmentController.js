import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Hospital from "../models/hospitalModel.js";
import Doctor from "../models/doctorModel.js";
import {
  sendConfirmationEmail,
  sendReminderEmail,
} from "../services/emailService.js";

class appointmentController {
  async bookAppointment(req, res) {
    const {
      date,
      patientId,
      doctorId,
      payStatus,
      hospitalId,
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
        hospitalId,
        slotNumber,
        appStatus: "Pending",
        reason,
      });

      console.log("📧 Appointment created, now sending email...");

      // Send confirmation email automatically
      try {
        // Get patient details
        const patient = await Patient.findOne({ patientId });
        console.log("👤 Found patient:", patient ? patient.name : "Not found");

        if (!patient) {
          console.log("❌ Patient not found for email");
          return res.status(201).json({
            message:
              "Appointment slot booked successfully, but patient not found for email",
            appId: data.appId || data._id,
            appointmentId: data.appointmentId,
          });
        }

        const hospital = await Hospital.findOne({ hospitalId });
        console.log(
          "🏥 Found hospital:",
          hospital ? hospital.hospitalName : "Not found"
        );

        if (!hospital) {
          console.log("❌ Hospital not found for email");
          return res.status(201).json({
            message:
              "Appointment slot booked successfully, but hospital not found for email",
            appId: data.appId || data._id,
            appointmentId: data.appointmentId,
          });
        }

        
        const doctor = await Doctor.findOne({ doctorId });
        console.log("👨‍⚕️ Found doctor:", doctor ? doctor.name : "Not found");

   
        const appointmentData = {
          patientName: patient.name,
          date: date,
          time: `Slot ${slotNumber}`,
          location: hospital.hospitalName,
          doctorName: doctor ? doctor.name : "Doctor",
        };

        console.log("📨 Sending confirmation email to:", patient.email);
        console.log("📋 Email data:", appointmentData);

     
        const emailResult = await sendConfirmationEmail(
          patient.email,
          appointmentData
        );
        console.log(" Confirmation email sent successfully:", emailResult);

       
        const appointmentDate = new Date(date);
        const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        const now = new Date();

        if (reminderTime > now) {
          const delayMs = reminderTime.getTime() - now.getTime();
          console.log(` Scheduling reminder email for ${reminderTime.toLocaleString()}`);
          
          setTimeout(async () => {
            try {
              console.log(`Sending scheduled reminder email to ${patient.email}`);
              await sendReminderEmail(patient.email, appointmentData);
              console.log("✅ Reminder email sent successfully");
            } catch (reminderError) {
              console.error("❌ Failed to send scheduled reminder email:", reminderError);
            }
          }, delayMs);
          
          console.log("⏰ Reminder email scheduled successfully");
        } else {
          console.log("⚠️ Appointment is within 24 hours, reminder not scheduled");
        }

        return res.status(201).json({
          message:
            "Appointment slot booked successfully, confirmation email sent, and reminder scheduled",
          appId: data.appId || data._id,
          appointmentId: data.appointmentId,
          emailSent: true,
          emailSentTo: patient.email,
          reminderScheduled: reminderTime > now,
        });
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError);
        console.error("❌ Email error stack:", emailError.stack);

        
        return res.status(201).json({
          message:
            "Appointment slot booked successfully, but failed to send email",
          appId: data.appId || data._id,
          appointmentId: data.appointmentId,
          emailError: emailError.message,
        });
      }
    } catch (err) {
      console.error("❌ Error booking appointment:", err);
      return res.status(500).json({
        message: "Error booking appointment",
        error: err.message,
      });
    }
  }

  async getAppointmentsByPatient(req, res) {
    const patientId = req.user?.id;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    try {
      const appointments = await Appointment.find({ patientId })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 });
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
      res.status(500).json({
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