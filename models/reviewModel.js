import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    unique: true,
    index: true,
    default: () => nanoid(6),
  },
  doctorId: { 
    type: Number, 
    ref: 'Doctor',
    required: true 
  },
  patientId: { 
    type: String, 
    ref: 'Patient',
    required: true 
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true, collection: 'Reviews' });

const Review = mongoose.model("Reviews", ReviewSchema);
export default Review;