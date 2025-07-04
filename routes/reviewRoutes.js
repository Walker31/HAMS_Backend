import express from "express";
import controllers from '../controllers/reviewController.js';

const router = express.Router();

router.post("/", controllers.createReview);

router.post("/multiple",controllers.createMultipleReviews);

router.get("/:doctorId", controllers.getReviewsByDoctor);

router.get('/patient/:patientId', controllers.getReviewsByPatient);

router.delete("/:reviewId", controllers.deleteReview);

router.put("/:reviewId", controllers.updateReview);

router.get("/patient/:patientId", controllers.getReviewsByPatient);

export default router;
