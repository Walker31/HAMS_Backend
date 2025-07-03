import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import Patient from "../models/patientModel.js";
import { generateToken } from "../middlewares/JWTmiddleware.js";
import Hospital from "../models/hospitalModel.js";
import { uploadToCloudinaryFromBuffer } from "../services/cloudinary.js";

class authController {
  async doctorLogin(req, res) {
    try {
      const doctor = await Doctor.findOne({ phone: req.body.phone }).select(
        "+password"
      );

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
    const {
      name,
      phone,
      email,
      gender,
      location,
      specialization,
      medicalReg,
      password,
      Hospital,
      basicFee,
      experience,
      workingHoursFrom,
      workingHoursTo,
    } = req.body;
    const parsedLocation = JSON.parse(location);
    try {
      const exists = await Doctor.findOne({ phone });
      if (exists) {
        console.log("Doctor Found");
        return res
          .status(400)
          .json({ message: "Doctor already exists with this phone number" });
      }
      let photoData = {};
      if (req.file) {
        photoData = await uploadToCloudinaryFromBuffer(
          req.file.buffer,
          "my-profile"
        );
        console.log("photo uploaded");
      } else {
        if (!req.file) {
          console.log("No photo uploaded");
        }
      }

      const doctor = await Doctor.create({
        name,
        phone,
        email,
        gender,
        location: parsedLocation,
        medicalReg,
        specialization,
        photo: photoData,
        password,
        Hospital,
        basicFee,
        experience,
        workingHours: { from: workingHoursFrom, to: workingHoursTo },
      });
      const token = generateToken(doctor);
      return res.status(201).json({ doctor, token });
    } catch (error) {
      console.error("Doctor signup error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async patientLogin(req, res) {
    try {
      const patient = await Patient.findOne({ phone: req.body.phone }).select(
        "+password"
      );

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const isMatch = await bcrypt.compare(req.body.password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(patient);
      return res.status(200).json({
        message: "Login successful",
        patientId: patient.patientId,
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async patientSignup(req, res) {
    console.log("Incoming patient data:", req.body);

    try {
      const {
        name,
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

      const exists = await Patient.findOne({ phone });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Patient already exists with this phone number" });
      }

      let photoData = {};
      if (req.file) {
        photoData = await uploadToCloudinaryFromBuffer(
          req.file.buffer,
          "my-profile"
        );
        console.log("photo uploaded");
      } else {
        if (!req.file) {
          console.log("No photo uploaded");
        }
      }

      const patientData = {
        name,
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
        photo: photoData,
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
      const exists = await Hospital.findOne({ RegId: req.body.RegId });

      if (exists) {
        return res.status(400).json({
          message: "Hospital already exists with this Registration number",
        });
      }

      if (req.body.location && Array.isArray(req.body.location.coordinates)) {
        const coords = req.body.location.coordinates.map((coord) =>
          Number(coord)
        );

        if (coords.length !== 2 || coords.some((coord) => isNaN(coord))) {
          return res.status(400).json({
            message:
              "Invalid location coordinates. Must be an array of two numbers [longitude, latitude].",
          });
        }

        req.body.location.coordinates = coords;
      } else {
        return res
          .status(400)
          .json({ message: "Location coordinates are required." });
      }

      req.body.address = {
        addressLine: req.body.addressLine,
        city: req.body.city,
        state: req.body.state,
        pincode: parseInt(req.body.pincode),
      };

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
