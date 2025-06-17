import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { customAlphabet,nanoid } from "nanoid";

const nanoidNumeric = customAlphabet("1234567890", 6);

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
      required: true, // fixed typo here

    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

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

    RegId:{
        type : Number,
    },
    
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    }
  },
  { timestamps: true, collection: "Hospitals" }
);

// 👇 Hash password before saving
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
