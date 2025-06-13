import express from "express";
import controllers from "../controllers/authController.js";

const router = express.Router();

router.post("/login", controllers.login);
router.post("/signup", controllers.signup);

export default router;
