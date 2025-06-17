import express from 'express';
import controllers from '../controllers/authController.js';

const router = express.Router();

router.post("/signup", controllers.hospitalSignup);

export default router;