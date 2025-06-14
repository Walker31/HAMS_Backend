import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";

class appointmentController {
  async bookAppointment(req, res) {
    const {
      Date,
      time,
      patientId,
      doctorId,
      payStatus,
      clinicId,
      slotNumber,
      appId,
    } = req.body;

    try {
      const existingAppointment = await Appointment.findOne({
        doctorId,
        slotNumber,
      });

      if (existingAppointment) {
        return res.status(409).json({ message: "slot Already Booked" });
      }
      await Appointment.create({
        Date,
        time,
        patientId,
        doctorId,
        payStatus,
        clinicId,
        slotNumber,
        appId,
      });
      return res.status(201).json({ message: "Slot Booked" });
    } catch (err) {
      return res.status(500).json({
        message: "Error booking appointment",
        error: err.message,
      });
    }
  }

  async cancelAppointment(req, res) {
    const { doctorId, slotNumber, appId } = req.body;
    try {
      await Appointment.findOneAndDelete({ doctorId, slotNumber, appId });
      res.json({ message: "Appointment Cancelled Successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error Cancelling Appointment", error: err });
    }
  }

  async rescheduleAppointment(req, res) {
    const { date, doctorId, clinicId, slotNumber, appId } = req.body;
    try {
      const update = await Appointment  .findOneAndUpdate(
        { date, doctorId, clinicId, slotNumber, appId },
        { new: true }
      );
      res.json(update);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating Appointment", error: err });
    }
  }
}

export default new appointmentController();
