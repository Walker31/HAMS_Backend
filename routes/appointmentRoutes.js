import express from "express";
import Appointment from "../controllers/appointmentController";

const router = express.Router();

router.post("/bookAppointment", Appointment.bookAppointment);

export default router;
