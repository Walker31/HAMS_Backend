import express from "express";
import Appointment from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/bookAppointment", Appointment.bookAppointment);
router.delete("/cancelAppointment", Appointment.cancelAppointment);
router.put("/rescheduleAppointment", Appointment.rescheduleAppointment)

export default router;
