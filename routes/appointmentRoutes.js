import express from "express";
import Appointment from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", Appointment.bookAppointment);
router.delete("/delete", Appointment.deleteAppointment);
router.put("/reschedule", Appointment.rescheduleAppointment);
router.put("/cancel", Appointment.cancelAppointment);

export default router;
