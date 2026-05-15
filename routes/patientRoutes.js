import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/JWTmiddleware.js';
import patientController from '../controllers/patientController.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Signup route with error handling for multer
router.post('/signup', (req, res, next) => {
  console.log("POST /signup received");
  upload.single("photo")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    console.log("Multer processing completed, passing to authController");
    next();
  });
}, authController.patientSignup);

router.post('/login',authController.patientLogin);
router.get('/profile',authenticateToken,patientController.profile);
router.get('/appointments',authenticateToken,patientController.allAppointments);
router.post('/appointments/request-reschedule', authenticateToken, patientController.requestReschedule);
router.put('/update-profile',authenticateToken,patientController.updateProfile);
router.post('/cancel-appointment', authenticateToken, patientController.cancelAppointment);

export default router;
