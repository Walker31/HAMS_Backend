import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import Patient from "../models/patientModel.js";
import { nanoid } from 'nanoid';

class AuthController {
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

      return res.status(200).json({ message: "Login successful" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };


async doctorSignup(req, res) {
   try {
    const exists = await Doctor.findOne({ phone: req.body.phone });
      if (exists) {
        return res.status(400).json({ message: "Doctor already exists with this phone number" });
      }
    const doctor = await Doctor.create(req.body);

    console.log('Doctor account created:', doctor);
    return res.status(201).json(doctor);
  } catch (error) {
    console.error('Doctor signup error:', error);
    return res.status(500).json({ message: error.message });
  }
};


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

      return res.status(200).json({ message: "Login successful" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async patientSignup(req, res) {
    try {
      const exists = await Doctor.findOne({ phone: req.body.phone });
        if (exists) {
          return res.status(400).json({ message: "Patient already exists with this phone number" });
        }
      const patient = await Patient.create(req.body);
      console.log("Patient account created");
      return res.status(201).json(patient);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


export default new AuthController();
