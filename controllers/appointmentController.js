import Patient from "../models/patientModel";
import Doctor from "../models/doctorModel";
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
        message: "Error booing appointment",
        error: err.message
      })
    }
  }
}


export default new appointmentController();