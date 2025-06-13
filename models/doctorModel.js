import mongoose from "mongoose";
import bcrypt from "bcrypt";

const DoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true, // fixed typo here
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    location: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
    },
    medicalReg: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true, collection: "Doctors" }
);

// 👇 Hash password before saving
DoctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Doctor = mongoose.model("Doctors", DoctorSchema);
export default Doctor;
