import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Google Sign-In endpoint
router.post('/google', authController.googleSignIn);

export default router;
