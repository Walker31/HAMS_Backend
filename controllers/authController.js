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
    console.log("=== PATIENT SIGNUP INITIATED ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request file:", req.file ? { name: req.file.originalname, size: req.file.size } : "No file");

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

      console.log("Extracted fields:", {
        name,
        phone,
        email,
        gender,
        dateOfBirth,
        password: password ? "***" : "missing",
        street,
        city,
        state,
        postalCode,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
      });

      // Check if patient already exists
      console.log("Checking if patient exists with phone:", phone);
      const exists = await Patient.findOne({ phone });
      if (exists) {
        console.log("Patient already exists with this phone");
        return res
          .status(400)
          .json({ message: "Patient already exists with this phone number" });
      }
      console.log("Patient is new, proceeding...");

      // Handle photo upload
      let photoData = {};
      if (req.file) {
        console.log("Uploading photo to Cloudinary...");
        photoData = await uploadToCloudinaryFromBuffer(
          req.file.buffer,
          "my-profile"
        );
        console.log("Photo uploaded successfully:", photoData);
      } else {
        console.log("No photo file provided");
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        console.error("Phone validation failed. Phone:", phone);
        return res.status(400).json({ message: "Phone must be exactly 10 digits" });
      }
      console.log("Phone format valid ✓");

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error("Email validation failed. Email:", email);
        return res.status(400).json({ message: "Invalid email format" });
      }
      console.log("Email format valid ✓");

      // Validate emergency phone
      if (emergencyPhone && !phoneRegex.test(emergencyPhone)) {
        console.error("Emergency phone validation failed. Phone:", emergencyPhone);
        return res.status(400).json({ message: "Emergency phone must be exactly 10 digits" });
      }
      console.log("Emergency phone format valid ✓");

      // Validate dateOfBirth
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        console.error("DateOfBirth parsing failed. Input:", dateOfBirth);
        return res.status(400).json({ message: "Invalid date of birth format" });
      }
      console.log("DateOfBirth valid:", parsedDate);

      const patientData = {
        name,
        phone,
        email,
        gender,
        dateOfBirth: parsedDate,
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

      console.log("Patient data ready for database insertion:", JSON.stringify(patientData, null, 2));
      
      const patient = await Patient.create(patientData);
      console.log("Patient created successfully with ID:", patient.patientId);

      const token = generateToken(patient);
      console.log("JWT token generated successfully");
      console.log("=== PATIENT SIGNUP COMPLETED SUCCESSFULLY ===");

      return res.status(201).json({ patient, token });
    } catch (error) {
      console.error("=== PATIENT SIGNUP ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error code:", error.code);
      
      if (error.errors) {
        console.error("Mongoose validation errors:");
        Object.keys(error.errors).forEach(field => {
          console.error(`  ${field}: ${error.errors[field].message}`);
        });
      }
      
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }

      return res.status(500).json({ message: error.message, errors: error.errors });
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

  async hospitalLogin(req, res) {
    try {
      const hospital = await Hospital.findOne({ RegId: req.body.RegId }).select(
        "+password"
      );

      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const isMatch = await bcrypt.compare(req.body.password, hospital.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(hospital);
      return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async googleSignIn(req, res) {
    try {
      const { accessToken, idToken, email, name, photoUrl, role } = req.body;

      // Validate required fields
      if (!accessToken || !email || !role) {
        return res.status(400).json({
          message: "Missing required fields: accessToken, email, and role are required",
        });
      }

      // Validate role
      if (!["patient", "doctor"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role. Must be 'patient' or 'doctor'",
        });
      }

      let user = null;

      if (role === "patient") {
        // Check if patient exists with this email
        user = await Patient.findOne({ email });

        if (user) {
          // Patient already exists, generate token
          console.log("Patient found with email:", email);
          const token = generateToken(user);
          return res.status(200).json({
            message: "Login successful",
            token,
            patientId: user.patientId,
          });
        }

        // Create new patient
        console.log("Creating new patient with email:", email);
        
        // Generate a default phone number from email or use a placeholder
        // Since phone is required but not provided by Google, we'll use email-based placeholder
        const defaultPhone = email.split("@")[0].slice(0, 10).padEnd(10, "0");

        user = await Patient.create({
          name,
          email,
          phone: defaultPhone,
          password: accessToken, // Use Google access token as password
          gender: "Other",
          dateOfBirth: new Date(),
          photo: photoUrl ? { url: photoUrl } : {},
          address: {},
          emergencyContact: {},
        });

        console.log("Patient created successfully with ID:", user.patientId);
        const token = generateToken(user);
        return res.status(201).json({
          message: "Account created successfully",
          token,
          patientId: user.patientId,
        });
      } else if (role === "doctor") {
        // Check if doctor exists with this email
        user = await Doctor.findOne({ email });

        if (user) {
          // Doctor already exists, generate token
          console.log("Doctor found with email:", email);
          const token = generateToken(user);
          return res.status(200).json({
            message: "Login successful",
            token,
            doctorId: user.doctorId,
          });
        }

        // Create new doctor
        console.log("Creating new doctor with email:", email);

        // Generate a default phone number from email
        const defaultPhone = parseInt(
          email.split("@")[0].slice(0, 10).padEnd(10, "0")
        );

        user = await Doctor.create({
          name,
          email,
          phone: defaultPhone,
          password: accessToken, // Use Google access token as password
          gender: "Other",
          medicalReg: "GOOGLE_AUTH_" + Date.now(),
          specialization: "General",
          location: {
            type: "Point",
            coordinates: [0, 0], // Default coordinates
          },
          photo: photoUrl ? { url: photoUrl } : {},
        });

        console.log("Doctor created successfully with ID:", user.doctorId);
        const token = generateToken(user);
        return res.status(201).json({
          message: "Account created successfully",
          token,
          doctorId: user.doctorId,
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new authController();
