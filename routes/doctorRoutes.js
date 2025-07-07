import express from 'express';
import authController from '../controllers/authController.js';
import doctorControllers from '../controllers/doctorControllers.js';
import { authenticateToken } from '../middlewares/JWTmiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post("/login", authController.doctorLogin);
router.post("/signup", upload.single("photo"),authController.doctorSignup);

router.get('/nearby/:lat/:lon', doctorControllers.getNearbyDoctors);
router.get('/top/:lat/:lon', doctorControllers.getTopDoctorsByLocation);

router.get('/:doctorId/appointments', doctorControllers.getAppointments);
router.get('/profile',authenticateToken, doctorControllers.profile);
router.put('/update/:id', doctorControllers.updateDoctorOverview);
router.get('/requested-appointments', authenticateToken, doctorControllers.getRequestedAppointments);
router.get('/:doctorId/profile', doctorControllers.publicDoctorProfile);

router.post('/:doctorId/slots', doctorControllers.updateAvailableSlots);
router.get('/:doctorId/slots', doctorControllers.getAvailableSlots);
router.get('/:doctorId/booked-slots', doctorControllers.getBookedSlots);

router.put("/editProfile", upload.single("photo"),doctorControllers.editProfile);

router.get('/reschedule-requests', authenticateToken, doctorControllers.getRescheduleRequests);
router.post('/handle-reschedule', authenticateToken, doctorControllers.handleRescheduleRequest);

export default router;
