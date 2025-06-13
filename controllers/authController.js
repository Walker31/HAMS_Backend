import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt"; // <- ✅ Important

class AuthController {
  async login(req, res) {
    try {
      const doctor = await Doctor.findOne({ name: req.body.name }).select("+password");

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
  }

  async signup(req, res) {
    try {
      const doctor = await Doctor.create(req.body);
      console.log("Doctor account created");
      return res.status(201).json(doctor);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new AuthController();
