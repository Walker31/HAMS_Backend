import express from "express";
import controllers from '../controllers/reviewController.js';

const router = express.Router();

router.post("/", controllers.createReview);

router.post("/multiple",controllers.createMultipleReviews);

router.get("/:doctorId", controllers.getReviewsByDoctor);

router.delete("/:reviewId", controllers.deleteReview);

export default router;
