import express from 'express';
import authController from '../controllers/authController.js';
import hospitalControllers from '../controllers/hospitalControllers.js';

const router = express.Router();

router.post("/login", authController.hospitalLogin);
router.post("/signup", authController.);

export default router;