import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  doctorId: {
    type:String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
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
},{timestamps: true, collection: 'Reviews'});

const Review = mongoose.model("Reviews", ReviewSchema);
export default Review;
