import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";
import AppointmentModel from "../models/appointmentModel.js";

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

    try{
      const existingAppointment = await AppointmentModel.findOne({ doctorId , slotNumber  })

      if(existingAppointment){
        return res.status(409).json({message: "slot Already Booked"})
      }
      await AppointmentModel.create({
            Date,
            time,
            patientId,
            doctorId,
            payStatus,
            clinicId,
            slotNumber,
            appId,
      });
      return res.status(201).json({message: "Slot Booked"});
  }
    catch(err){
      return res.status(500).json({
        message: "Error booking appointment",
        error: err.message
      })
    }
  }

  async cancelAppointment(req, res) {
    try{
        await AppointmentModel.findOneAndDelete({doctorId, slotNumber, appId});
        res.json({ message: "Appointment Cancelled Successfully"});
    }
    catch (err) {
    res.status(500).json({ message: "Error Cancelling Appointment", error: err });
  }
  }

  async rescheduleAppointment(req, res) {
    const date = req.params.date;
    const doctorId = req.params.doctorId;
    const clinicId = req.params.clinicId;
    const slotNumber = req.params.slotNumber;
    const appId = req.params.appId;

    try{
        const update = await AppointmentModel.findOneAndUpdate({date, doctorId, clinicId, slotNumber, appId}, req.body, {new:true});
        res.json(update);
    }
    catch (err) {
    res.status(500).json({ message: "Error updating Appointment", error: err });
  }
  }
}


export default new appointmentController();