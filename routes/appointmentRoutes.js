import express from "express";
import AppointmentController from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", AppointmentController.bookAppointment);
router.delete("/delete", AppointmentController.deleteAppointment);
router.put("/reschedule", AppointmentController.rescheduleAppointment);
router.put("/cancel", AppointmentController.cancelAppointment);
router.put("/update-status/:appId", AppointmentController.updateAppStatus);
router.get("/pending/:date", AppointmentController.showAppointments);
router.get("/previous", AppointmentController.getPreviousAppointments);

// 🔥 New route for patient dashboard:
router.get("/patient/:patientId", AppointmentController.getAppointmentsByPatient);

export default router;
