import Review from "../models/reviewModel.js";
import Doctor from "../models/doctorModel.js";

class reviewController {
  async createReview(req, res) {
    try {
      const { doctorId, patientId, rating, comment } = req.body;

      const newReview = new Review({ doctorId, patientId, rating, comment });
      await newReview.save();

      
      const reviews = await Review.find({ doctorId });
      const avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

      
      await Doctor.findOneAndUpdate(
        { doctorId }, 
        { 
          averageRating: avgRating,
          reviewsCount: reviews.length 
        }
      );

      res
        .status(201)
        .json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review", error });
    }
  }

  async createMultipleReviews(req, res) {
  try {
    const reviewsData = req.body.reviews; // Expecting an array of reviews
    if (!Array.isArray(reviewsData) || reviewsData.length === 0) {
      return res.status(400).json({ message: "No reviews provided" });
    }

    const savedReviews = [];

    for (const review of reviewsData) {
      const { doctorId, patientId, rating, comment } = review;
      const newReview = new Review({ doctorId, patientId, rating, comment });
      await newReview.save();
      savedReviews.push(newReview);
    }

    // Recalculate average rating for the doctor (assuming all reviews are for the same doctor)
    const doctorId = reviewsData[0].doctorId;
    const allReviews = await Review.find({ doctorId });
    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await Doctor.findOneAndUpdate({ doctorId }, { averageRating: avgRating });

    res.status(201).json({
      message: "All reviews added successfully",
      reviews: savedReviews,
    });
  } catch (error) {
    console.error("Error creating multiple reviews:", error);
    res.status(500).json({ message: "Failed to add reviews", error });
  }
}



  async getReviewsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const reviews = await Review.find({ doctorId }).sort({ createdAt: -1 });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews", error });
    }
  }

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const deletedReview = await Review.findByIdAndDelete(reviewId);

      if (!deletedReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      const reviews = await Review.find({ doctorId: deletedReview.doctorId });
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

      await Doctor.findOneAndUpdate(
        { doctorId: deletedReview.doctorId },
        { 
          avgRating: avgRating,
          reviewsCount: reviews.length 
        }
      );

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review", error });
    }
  }
}

export default new reviewController;