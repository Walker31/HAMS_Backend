import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";

const nanoidNumeric = customAlphabet("1234567890", 6);

const DoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Number,
      unique: true,
      index: true,
      default: () => nanoidNumeric(6),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
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
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    medicalReg: {
      type: String,
      trim: true,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    photo: {
      publicId: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    overview: {
      type: String,
      default: "",
    },
    availableSlots: {
      type: Map,
      of: [String], // Slots per date
      default: {},
    },
    averageRating: {
      type: Number,
      default: 3,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 100) / 100,
    },
    basicFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    workingHours: {
      from: {
        type: String,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // HH:MM 24-hour format
      },
      to: {
        type: String,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
      },
    },
    Hospital: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "Doctors" }
);

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

DoctorSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "doctor",
  localField: "_id",
});

DoctorSchema.index({ location: "2dsphere" });

const Doctor = mongoose.model("Doctor", DoctorSchema);
export default Doctor;
