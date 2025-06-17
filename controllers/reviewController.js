import Review from "../models/reviewModel.js";
import Doctor from "../models/doctorModel.js";

class reviewController {
  async createReview(req, res) {
    try {
      const { doctorId, patientId, rating, comment } = req.body;

      const newReview = new Review({ doctorId, patientId, rating, comment });
      await newReview.save();

      // Recalculate average rating for the doctor
      const reviews = await Review.find({ doctorId });
      const avgRating =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

      await Doctor.findOneAndUpdate({ doctorId }, { averageRating: avgRating });

      res
        .status(201)
        .json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review", error });
    }
  }

  // Get all reviews for a doctor
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

  // Optional: Delete a review by ID
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const deletedReview = await Review.findByIdAndDelete(reviewId);

      if (!deletedReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Recalculate average rating after deletion
      const reviews = await Review.find({ doctorId: deletedReview.doctorId });
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

      await Doctor.findOneAndUpdate(
        { doctorId: deletedReview.doctorId },
        { averageRating: avgRating }
      );

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review", error });
    }
  }
}

export default new reviewController;
