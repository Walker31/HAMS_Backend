import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import Patient from "../models/patientModel.js";
import { generateToken } from "../middlewares/JWTmiddleware.js";
import Hospital from "../models/hospitalModel.js";

class authController {
  async doctorLogin(req, res) {
    try {
      const doctor = await Doctor.findOne({ phone: req.body.phone }).select("+password");

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const isMatch = await bcrypt.compare(req.body.password, doctor.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(doctor);
      return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async doctorSignup(req, res) {
    try {
      const exists = await Doctor.findOne({ phone: req.body.phone });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Doctor already exists with this phone number" });
      }

      const doctor = await Doctor.create(req.body);
      const token = generateToken(doctor);

      console.log("Doctor account created:", doctor);
      return res.status(201).json({ doctor, token });
    } catch (error) {
      console.error("Doctor signup error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async patientLogin(req, res) {
    try {
      const patient = await Patient.findOne({ phone: req.body.phone }).select("+password");

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const isMatch = await bcrypt.compare(req.body.password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(patient);
      return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ✅ Updated only this method to structure nested fields
  async patientSignup(req, res) {
  console.log("Incoming patient data:", req.body);
  try {
    const exists = await Patient.findOne({ phone: req.body.phone });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Patient already exists with this phone number" });
    }

    // Pull out only what needs transformation
    const {
      fullName,
      street,
      city,
      state,
      postalCode,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      phone,
      email,
      gender,
      dateOfBirth,
      password,
    } = req.body;

    const patientData = {
      name: fullName,
      phone,
      email,
      gender,
      dateOfBirth,
      password,
      address: {
        street,
        city,
        state,
        postalCode,
      },
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
      },
    };

    const patient = await Patient.create(patientData);
    const token = generateToken(patient);

    console.log("Patient account created");
    return res.status(201).json({ patient, token });
  } catch (error) {
    console.error("Patient signup error:", error);
    return res.status(500).json({ message: error.message });
  }
}
     

  async hospitalSignup(req, res) {
    try {
      console.log(req.body);
      console.log(new Date());

      const exists = await Hospital.findOne({ RegId: req.body.RegId });
      if (exists) {
        return res.status(400).json({
          message: "Hospital already exists with this Registration number",
        });
      }

      if (req.body.location && Array.isArray(req.body.location.coordinates)) {
        const coords = req.body.location.coordinates.map((coord) => Number(coord));

        if (coords.length !== 2 || coords.some((coord) => isNaN(coord))) {
          return res.status(400).json({
            message: "Invalid location coordinates. Must be an array of two numbers [longitude, latitude].",
          });
        }

        req.body.location.coordinates = coords;
      } else {
        return res.status(400).json({ message: "Location coordinates are required." });
      }

      const hospital = await Hospital.create(req.body);
      const token = generateToken(hospital);

      console.log("Hospital account created:", hospital);
      return res.status(201).json({ hospital, token });
    } catch (error) {
      console.error("Hospital signup error:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new authController();
