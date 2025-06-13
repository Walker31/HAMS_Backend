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
    } = req.body();
    AppointmentModel.findOne({ $and: [{ doctorId }, { slotNumber }] })
      .then((user) => {
        if (user) {
          res.status(409).json({ message: "Slot Already Booked" });
        } else {
          RegisterModel.create({
            Date,
            time,
            patientId,
            doctorId,
            payStatus,
            clinicId,
            slotNumber,
            appId,
          })
            .then(() => res.status(201).json({ message: "Slot Booked" }))
            .catch((err) =>
              res
                .status(500)
                .json({ message: "Error Booking contact", error: err })
            );
        }
      })
      .catch((err) =>
        res
          .status(500)
          .json({ message: "Error checking existing contact", error: err })
      );
  }
}

export default new appointmentController();
