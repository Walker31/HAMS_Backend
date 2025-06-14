import express from "express";
import Appointment from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/bookAppointment", Appointment.bookAppointment);
router.delete("/deleteAppointment", Appointment.deleteAppointment);
router.put("/rescheduleAppointment", Appointment.rescheduleAppointment);
router.put("/cancelAppointment", Appointment.cancelAppointment);

export default router;
