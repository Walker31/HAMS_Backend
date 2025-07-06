import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/JWTmiddleware.js';
import patientController from '../controllers/patientController.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post('/login',authController.patientLogin);
router.post('/signup',upload.single("photo"),authController.patientSignup);
router.get('/profile',authenticateToken,patientController.profile);
router.get('/appointments',authenticateToken,patientController.allAppointments);
router.post('/appointments/request-reschedule', authenticateToken, patientController.requestReschedule);
router.put('/update-profile',authenticateToken,patientController.updateProfile);
router.post('/cancel-appointment', authenticateToken, patientController.cancelAppointment);

export default router;
