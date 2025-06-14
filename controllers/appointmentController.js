import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";
import AppointmentModel from "../models/appointmentModel.js";
import { nanoid } from 'nanoid';

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
      // Don't accept appId from the user anymore!
    } = req.body;

    try {
      const existingAppointment = await AppointmentModel.findOne({ doctorId, slotNumber });

      if (existingAppointment) {
        return res.status(409).json({ message: "Slot Already Booked" });
      }
      
      const appId = nanoid(5);

      await AppointmentModel.create({
        Date,
        time,
        patientId,
        doctorId,
        payStatus,
        clinicId,
        slotNumber,
        appId, 
        appStatus:"Incomplete",
      });

      return res.status(201).json({ message: "Slot Booked", appId: appId }); 
    } catch (err) {
      return res.status(500).json({
        message: "Error booking appointment",
        error: err.message
      });
    }
}


  async deleteAppointment(req, res) {
    try{
        await AppointmentModel.findOneAndDelete({doctorId, slotNumber, appId});
        res.json({ message: "Appointment History deleted Successfully"});
    }
    catch (err) {
    res.status(500).json({ message: "Error Deleting the History", error: err });
  }
  }

  async rescheduleAppointment(req, res) {
    const { appId} = req.body;

    try {
        const update = await AppointmentModel.findOneAndUpdate(
            { appId },        
            { 
                ...req.body,                
                appStatus: "Rescheduled"    
            },                        
            { new: true }
        );
        if (!update) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.json(update);
    } catch (err) {
        res.status(500).json({ message: "Error updating Appointment", error: err.message });
    }
}

async cancelAppointment(req, res) {
    const { appId} = req.body;

    try {
        const update = await AppointmentModel.findOneAndUpdate(
            { appId },        
            { 
                ...req.body,                
                appStatus: "Appointment Cancelled "    
            },                        
            { new: true }
        );
        if (!update) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.json(update);
    } catch (err) {
        res.status(500).json({ message: "Error Cancelling Appointment", error: err.message });
    }
}

}


export default new appointmentController();
