import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/JWTmiddleware.js';
import patientController from '../controllers/patientController.js';


const router = express.Router();

router.post('/login',authController.patientLogin);
router.post('/signup',authController.patientSignup);
router.get('/profile',authenticateToken,patientController.profile);
router.get('/appointments',authenticateToken,patientController.allAppointments);

export default router;