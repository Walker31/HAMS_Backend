import Review from "../models/reviewModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";

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
      const doctorIdNum = Number(doctorId);
      const reviews = await Review.find({ doctorId: doctorIdNum }).sort({ createdAt: -1 });

    
      const patientIds = reviews.map(r => r.patientId);
      const patients = await Patient.find({ patientId: { $in: patientIds } }, { name: 1, photo: 1, patientId: 1 });
      const patientMap = {};
      patients.forEach(p => { patientMap[p.patientId] = p; });

      const reviewsWithPatient = reviews.map(r => ({
        ...r.toObject(),
        patientId: patientMap[r.patientId] || r.patientId
      }));

      res.status(200).json(reviewsWithPatient);
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

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { rating, comment },
        { new: true }
      );
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      // Recalculate average rating for the doctor
      const reviews = await Review.find({ doctorId: updatedReview.doctorId });
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;
      await Doctor.findOneAndUpdate(
        { doctorId: updatedReview.doctorId },
        {
          averageRating: avgRating,
          reviewsCount: reviews.length,
        }
      );
      res.status(200).json({ message: "Review updated successfully", review: updatedReview });
    } catch (error) {
      res.status(500).json({ message: "Failed to update review", error });
    }
  }

  async getReviewsByPatient(req, res) {
  try {
    const { patientId } = req.params;

    const reviews = await Review.find({ patientId });
    const doctorIds = reviews.map(r => r.doctorId);
    const doctors = await Doctor.find({ doctorId: { $in: doctorIds } }, 'doctorId name');

    const doctorMap = {};
    doctors.forEach(doc => {
      doctorMap[doc.doctorId] = doc.name;
    });

    const enrichedReviews = reviews.map(r => ({
      ...r.toObject(),
      doctorName: doctorMap[r.doctorId] || 'Unknown Doctor'
    }));

    res.status(200).json(enrichedReviews);
  } catch (error) {
    console.error("❌ Error in getReviewsByPatient:", error);
    res.status(500).json({ message: "Failed to fetch reviews by patient", error: error.message });
  }
}


  async getReviewsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      // Populate doctor info using doctorId, not _id
      const reviews = await Review.find({ patientId }).sort({ createdAt: -1 }).populate({
        path: 'doctorId',
        select: 'name photo doctorId',
        model: 'Doctors',
        localField: 'doctorId',
        foreignField: 'doctorId',
        justOne: true
      });
      // Format reviews to include doctor name and photo at top level
      const reviewsWithDoctor = reviews.map(r => ({
        ...r.toObject(),
        doctor: r.doctorId ? {
          doctorId: r.doctorId.doctorId,
          name: r.doctorId.name,
          photo: r.doctorId.photo?.url || null
        } : null
      }));
      res.status(200).json(reviewsWithDoctor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch patient reviews', error });
    }
  }
}

export default new reviewController;