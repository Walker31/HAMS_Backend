import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login',authController.patientLogin);
router.post('/signup',authController.patientSignup);

export default router;