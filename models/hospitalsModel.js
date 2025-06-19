import mongoose from "mongoose";
import { customAlphabet,nanoid } from "nanoid";

const HospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => nanoid(6),
    },
    hName: {
      type: String,
      required: true,
      trim: true,
    },
    hPhone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Assuming a 10-digit phone number
    },
    hEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    },
    
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    hDoctors:{
        type: [String]
    }
  },
  { timestamps: true, collection: "Patients" }
);


const hospital = mongoose.model("hospitals", HospitalSchema);
export default hospital;
