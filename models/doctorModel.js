import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { customAlphabet,nanoid } from "nanoid";

const nanoidNumeric = customAlphabet("1234567890", 6);

const DoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      unique: true,
      index: true,
      default: () => nanoid(6),
    },
    name: {
      type: String,
      required: true,
      trim: true,
      required: true,
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
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    },

    medicalReg: {
      type: String,
      trim: true,
      required: true,
    },
    specialization:{
      type: String,
      required: true,

    },
    photo: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    }
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
