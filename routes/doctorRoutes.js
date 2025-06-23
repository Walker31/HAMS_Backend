import express from 'express';
import authController from '../controllers/authController.js';
import doctorControllers from '../controllers/doctorControllers.js';

const router = express.Router();

// AUTH routes
router.post("/login", authController.doctorLogin);
router.post("/signup", authController.doctorSignup);

// Doctor location-based queries
router.get('/nearby/:lat/:lon', doctorControllers.getNearbyDoctors);
router.get('/top/:lat/:lon', doctorControllers.getTopDoctorsByLocation);

// Doctor profile and appointments
router.get('/:doctorId/appointments', doctorControllers.getAppointments);
router.get('/:doctorId/profile', doctorControllers.profile);
router.put('/update/:id', doctorControllers.updateDoctorOverview);

// Doctor slots management
router.post('/:doctorId/slots', doctorControllers.updateAvailableSlots);
router.get('/:doctorId/slots', doctorControllers.getAvailableSlots);

export default router;
