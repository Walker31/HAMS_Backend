import express from "express";
import AppointmentController from "../controllers/appointmentController.js";
import { authenticateToken } from "../middlewares/JWTmiddleware.js";

const router = express.Router();


router.post("/book",authenticateToken, AppointmentController.bookAppointment);


router.put("/reschedule", AppointmentController.rescheduleAppointment);
router.put("/cancel", AppointmentController.cancelAppointment);
router.put("/update-status/:appId", AppointmentController.updateAppStatus);


router.get("/previous", authenticateToken, AppointmentController.getPreviousAppointments);
router.get("/history", authenticateToken, AppointmentController.history);
router.get("/booked-slots", AppointmentController.getBookedSlots);


router.get("/pending/:date", AppointmentController.showAppointments);
router.get("/pending/:date/patient", AppointmentController.getAppointmentsByPatient);
router.get("/all/:doctorId", AppointmentController.getAllAppointmentsByDoctor);

router.get("/patient", authenticateToken,AppointmentController.getAppointmentsByPatient);

export default router;
