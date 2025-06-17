import express from "express";
import controllers from '../controllers/reviewController.js';

const router = express.Router();

// POST a new review
router.post("/", controllers.createReview);

// GET all reviews for a specific doctor
router.get("/:doctorId", controllers.getReviewsByDoctor);

// DELETE a review by ID
router.delete("/:reviewId", controllers.deleteReview);

export default router;
