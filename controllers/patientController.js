import Patient from "../models/patientModel.js";
import Appointment from '../models/appointmentModel.js';
import Doctor from "../models/doctorModel.js";
import bcrypt from "bcrypt";

class PatientController {
  // Get patient profile
  async profile(req, res) {
    const patientId = req.user.id;
    try {
      const patient = await Patient.findOne({ patientId });
      res.status(200).json(patient);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all appointments for a patient, with doctor info
  async allAppointments(req, res) {
    const patientId = req.user.id;
    const responseData = [];
    try {
      const appointments = await Appointment.find({ patientId }).lean();
      for (let i = 0; i < appointments.length; i++) {
        const appt = appointments[i];
        const doctorId = appt.doctorId;
        let doctorName = '';
        if (doctorId) {
          const doctorInfo = await Doctor.findOne({ doctorId }).lean();
          doctorName = doctorInfo?.name || doctorId;
        }
        responseData.push({
          appointmentId: appt.appointmentId,
          doctorId: doctorId,
          doctorName: doctorName,
          reason: appt.reason,
          date: appt.date,
          slot: appt.slotNumber,
          appStatus: appt.appStatus,
          prescription: appt.prescription,
          meetLink: appt?.meetLink || 'N/A',
          consultStatus: appt.consultStatus || 'Offline',
          hospital: appt?.hospital || 'Own Practice'
        });
      }
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Patient requests rescheduling: sets appStatus to 'Request for rescheduling'.
  async requestReschedule(req, res) {
    const patientId = req.user.id;
    const { appointmentId } = req.body;
    try {
      const appointment = await Appointment.findOne({ appointmentId, patientId });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      if (appointment.appStatus === 'Cancelled' || appointment.appStatus === 'Completed') {
        return res.status(400).json({ message: 'Cannot reschedule a completed or cancelled appointment' });
      }
      appointment.appStatus = 'Request for rescheduling';
      await appointment.save();
      res.status(200).json({ message: 'Reschedule request sent to doctor', appointment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update patient profile
  async updateProfile(req, res) {
    const patientId = req.user.id;
    const {
      name,
      phone,
      email,
      gender,
      dateOfBirth,
      password,
      address = {},
      emergencyContact = {},
    } = req.body;

    try {
      const patient = await Patient.findOne({ patientId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Update fields
      patient.name = name ?? patient.name;
      patient.phone = phone ?? patient.phone;
      patient.email = email ?? patient.email;
      patient.gender = gender ?? patient.gender;
      patient.dateOfBirth = dateOfBirth ?? patient.dateOfBirth;

      // Update address fields
      patient.address = {
        ...patient.address,
        ...address,
      };

      // Update emergency contact fields
      patient.emergencyContact = {
        ...patient.emergencyContact,
        ...emergencyContact,
      };

      // Update password if provided
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(password, salt);
      }

      await patient.save();

      // Exclude password from response
      const { password: _, ...patientData } = patient.toObject();

      res.status(200).json(patientData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Cancel an appointment by patient
  async cancelAppointment(req, res) {
    const patientId = req.user?.id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    try {
      const appointment = await Appointment.findOne({ appointmentId, patientId });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      appointment.appStatus = 'Cancelled';
      await appointment.save();
      res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
  }
}

export default new PatientController();
