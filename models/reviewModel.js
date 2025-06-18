import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",      
        required: true
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
    trim: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

reviewSchema.statics.calcAverageRatings = async function(doctorId) {
  const stats = await this.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: "$doctor",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ])

  if(stats.length){
    await mongoose.model("Doctor").findByIdAndUpdate(doctorId, {
      reviewsCount: stats[0].nRatings,
      avgRating: stats[0].avgRating
    });
  }else{
    await mongoose.model("Doctor").findByIdAndUpdate(doctorId, {
      reviewsCount: 0,
      avgRating: 0
    });
}

};
reviewSchema.post("save", function() {
  this.constructor.calcAverageRatings(this.doctor);
});
reviewSchema.post("remove", function() {
  this.constructor.calcAverageRatings(this.doctor);
});

export default mongoose.model("Review", reviewSchema);