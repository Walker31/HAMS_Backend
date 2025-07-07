import express from "express";
import AppointmentController from "../controllers/appointmentController.js";
import { authenticateToken } from "../middlewares/JWTmiddleware.js";

const router = express.Router();


router.post("/book",authenticateToken, AppointmentController.bookAppointment);

router.put("/respond", authenticateToken, AppointmentController.respondToAppointmentRequest);

router.put("/reschedule", AppointmentController.rescheduleAppointment);
router.put("/cancel", AppointmentController.cancelAppointment);
router.put("/update-status/:appointmentId", AppointmentController.updateAppStatus);
router.get("/pending/:date", authenticateToken,AppointmentController.showAppointments);
router.get("/previous", authenticateToken,AppointmentController.getPreviousAppointments);
router.get("/all/:doctorId", AppointmentController.getAllAppointmentsByDoctor);
router.get('/detail',AppointmentController.appointmentDetail);
router.get("/patient", authenticateToken,AppointmentController.getAppointmentsByPatient);

export default router;
