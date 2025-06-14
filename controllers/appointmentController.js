import Appointment from "../models/appointmentModel.js";

class appointmentController {
  async bookAppointment(req, res) {
    const {
      date,
      patientId,
      doctorId,
      payStatus,
      clinicId,
      slotNumber,
      // Don't accept appId from the user anymore!
    } = req.body;

    try {
      const existingAppointment = await Appointment.findOne({
        doctorId,
        slotNumber,
      });

      if (existingAppointment) {
        return res.status(409).json({ message: "Slot Already Booked" });
      }

      const data = await Appointment.create({
        date,
        patientId,
        doctorId,
        payStatus,
        clinicId,
        slotNumber,
      });

      return res.status(201).json({ message: "Appointment slot booked successfully", appId: data.appId });
    } catch (err) {
      return res.status(500).json({
        message: "Error booking appointment",error: err.message,
      });
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
      res.status(500).json({ message: "Error Deleting the History", error: err });
    }
  }

  async rescheduleAppointment(req, res) {
    const { appId } = req.body;

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
