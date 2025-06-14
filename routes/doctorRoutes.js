import express from 'express';
import authController from '../controllers/authController.js';
import doctorControllers from '../controllers/doctorControllers.js';

const router = express.Router();

router.post("/login", authController.doctorLogin);
router.post("/signup", authController.doctorSignup);

router.get('/:doctorId/appointments', doctorControllers.getAppointments);
router.get('/:doctorId/profile', doctorControllers.profile);

export default router;