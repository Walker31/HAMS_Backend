import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

const HospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      unique: true,
      index: true,
      default: () => nanoid(6),
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    city: {
      type: String,
    },
    address: {
      addressLine: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      pincode: {
        type: Number,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    RegId: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true, collection: "Hospitals" }
);

HospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Hospital = mongoose.model("Hospitals", HospitalSchema);
export default Hospital;
