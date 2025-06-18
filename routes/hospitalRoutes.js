import express from 'express';
import controllers from '../controllers/authController.js';
import hospcontrollers from '../controllers/hospitalControllers.js'

const router = express.Router();

router.post("/signup", controllers.hospitalSignup);
router.get("/getAll/:lat/:lon",hospcontrollers.getNearbyHospital);

export default router;