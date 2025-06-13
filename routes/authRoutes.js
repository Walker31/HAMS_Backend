import express from "express";
import controllers from "../controllers/authController.js";

const router = express.Router();

router.post("/doctorlogin", controllers.doctorLogin);
router.post("/doctorsignup", controllers.doctorSignup);
router.post("/patientlogin", controllers.patientLogin);
router.post("/patientsignup", controllers.patientSignup);

export default router;
