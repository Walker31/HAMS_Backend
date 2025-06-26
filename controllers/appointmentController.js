import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Hospital from "../models/hospitalModel.js";
import Doctor from "../models/doctorModel.js";
import {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendRescheduleEmail,
} from "../services/emailService.js";
import { scheduleReminderInDB, cancelReminder } from "../services/reminderService.js";

export const bookAppointment = async (req, res) => {
  const {
    date,
    patientId,
    doctorId,
    payStatus,
    hospitalId,
    slotNumber,
    reason,
  } = req.body;

  try {
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Reason is required" });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      slotNumber,
    });

    if (existingAppointment) {
      return res.status(409).json({ message: "Slot Already Booked" });
    }

    const data = await Appointment.create({
      date: new Date(date),
      patientId,
      doctorId,
      payStatus,
      hospitalId,
      slotNumber,
      appStatus: "Pending",
      reason,
    });

    try {
      const patient = await Patient.findOne({ patientId });

      if (!patient) {
        return res.status(201).json({
          message: "Appointment slot booked successfully, but patient not found for email",
          appId: data.appId || data._id,
          appointmentId: data.appointmentId,
        });
      }

      const hospital = await Hospital.findOne({ hospitalId });
      const doctor = await Doctor.findOne({ doctorId });

      const appointmentData = {
        patientName: patient.name,
        date: date,
        time: `Slot ${slotNumber}`,
        location: hospital ? hospital.hospitalName : "Hospital",
        doctorName: doctor ? doctor.name : "Doctor",
      };

      await sendConfirmationEmail(patient.email, appointmentData);

      await scheduleReminderInDB(
        data.appointmentId || data._id.toString(),
        appointmentData, 
        patient.email, 
        new Date(date)
      );

      return res.status(201).json({
        message: "Appointment slot booked successfully and confirmation email sent",
        appId: data.appId || data._id,
        appointmentId: data.appointmentId,
        emailSent: true,
        emailSentTo: patient.email
      });

    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);

      return res.status(201).json({
        message: "Appointment slot booked successfully, but failed to send email",
        appId: data.appId || data._id,
        appointmentId: data.appointmentId,
        emailError: emailError.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error booking appointment",
      error: err.message,
    });
  }
};

export const cancelAppointment = async (req, res) => {
  const { appointmentId, reason } = req.body;

  if (!appointmentId) {
    return res.status(400).json({ 
      message: "Appointment ID is required",
      received: { appointmentId, reason }
    });
  }

  try {
    let appointment = null;
    
    if (appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        appointment = await Appointment.findById(appointmentId);
      } catch (idError) {
        console.log("Error searching by _id:", idError.message);
      }
    }
    
    if (!appointment) {
      try {
        appointment = await Appointment.findOne({ appointmentId: appointmentId });
      } catch (fieldError) {
        console.log("Error searching by appointmentId field:", fieldError.message);
      }
    }
    
    if (!appointment) {
      try {
        appointment = await Appointment.findOne({ appId: appointmentId });
      } catch (appIdError) {
        console.log("Error searching by appId field:", appIdError.message);
      }
    }

    if (!appointment) {
      return res.status(404).json({ 
        message: "Appointment not found",
        searchedId: appointmentId
      });
    }

    const [patient, doctor, hospital] = await Promise.all([
      Patient.findOne({ patientId: appointment.patientId }),
      Doctor.findOne({ doctorId: appointment.doctorId }),
      Hospital.findOne({ hospitalId: appointment.hospitalId })
    ]);

    const deleteResult = await Appointment.findByIdAndDelete(appointment._id);

    await cancelReminder(appointment.appointmentId || appointment._id.toString());

    let emailSent = false;
    let emailError = null;

    if (patient && patient.email) {
      try {
        const formatDate = (dateValue) => {
          if (!dateValue) return "Unknown Date";
          
          if (dateValue instanceof Date) {
            return dateValue.toLocaleDateString();
          }
          
          if (typeof dateValue === 'string') {
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toLocaleDateString();
            }
            return dateValue;
          }
          
          if (typeof dateValue === 'number') {
            return new Date(dateValue).toLocaleDateString();
          }
          
          return "Unknown Date";
        };

        const appointmentData = {
          patientName: patient.name,
          date: formatDate(appointment.date),
          time: `Slot ${appointment.slotNumber}`,
          location: hospital ? hospital.hospitalName : "Hospital",
          doctorName: doctor ? doctor.name : "Doctor",
          reason: reason || "No reason provided"
        };

        await sendCancellationEmail(patient.email, appointmentData);
        emailSent = true;

      } catch (error) {
        console.log("Email sending failed:", error.message);
        emailError = error.message;
      }
    }

    return res.status(200).json({ 
      message: emailSent 
        ? "Appointment cancelled successfully and email sent" 
        : "Appointment cancelled successfully (no email sent)",
      appointmentId: appointmentId,
      emailSent: emailSent,
      emailSentTo: patient?.email || null,
      emailError: emailError
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to cancel appointment",
      error: error.message,
      appointmentId: appointmentId
    });
  }
};

export const getBookedSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor ID and date are required" });
    }

    const appointments = await Appointment.find({
      doctorId,
      date,
      appStatus: { $ne: "Rejected" }, 
    });

    const bookedSlots = appointments.map((appt) => appt.slotNumber);
    res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Failed to fetch booked slots" });
  }
};

export const showAppointments = async (req, res) => {
  const { date } = req.params;
  const { doctorId } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor ID and date required" });
  }

  try {
    const appointments = await Appointment.find({
      doctorId,
      date,
      appStatus: "Pending",
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error showing appointments:", error);
    res.status(500).json({ message: "Failed to show appointments" });
  }
};

export const getPreviousAppointments = async (req, res) => {
  const { doctorId } = req.query;

  try {
    const appointments = await Appointment.find({
      doctorId,
      appStatus: { $in: ["Completed", "Rejected", "Rescheduled"] },
    }).sort({ date: -1 }); 

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching previous appointments:", error);
    res.status(500).json({ message: "Failed to fetch previous appointments" });
  }
};

export const updateAppStatus = async (req, res) => {
  const { appId } = req.params;
  const { appStatus, rejectionReason, prescription } = req.body;

  try {
    const appointment = await Appointment.findOne({ appointmentId: appId });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.appStatus = appStatus;

    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Failed to update appointment" });
  }
};

export const history = async (req, res) => {
  const patientId = req.user?.id;

  try {
    const appointments = await Appointment.find({ patientId });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error retrieving history:", error);
    res.status(500).json({ message: "Failed to retrieve history" });
  }
};

export const rescheduleAppointment = async (req, res) => {
  const { appointmentId, newDate, newSlotNumber, reason } = req.body;

  if (!appointmentId || !newDate || !newSlotNumber) {
    return res.status(400).json({ 
      message: "appointmentId, newDate, and newSlotNumber are required",
      received: { appointmentId, newDate, newSlotNumber, reason }
    });
  }

  try {
    let appointment = null;
    
    if (appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        appointment = await Appointment.findById(appointmentId);
      } catch (idError) {
        console.log("Error searching by _id:", idError.message);
      }
    }
    
    if (!appointment) {
      try {
        appointment = await Appointment.findOne({ appointmentId: appointmentId });
      } catch (fieldError) {
        console.log("Error searching by appointmentId field:", fieldError.message);
      }
    }
    
    if (!appointment) {
      try {
        appointment = await Appointment.findOne({ appId: appointmentId });
      } catch (appIdError) {
        console.log("Error searching by appId field:", appIdError.message);
      }
    }

    if (!appointment) {
      return res.status(404).json({ 
        message: "Appointment not found",
        searchedId: appointmentId
      });
    }

    const formatDate = (dateValue) => {
      if (!dateValue) return "Unknown Date";
      
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }
      
      if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString();
        }
        return dateValue;
      }
      
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleDateString();
      }
      
      return "Unknown Date";
    };

    const oldDate = formatDate(appointment.date);
    const oldSlotNumber = appointment.slotNumber;

    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(newDate),
      slotNumber: newSlotNumber,
      _id: { $ne: appointment._id }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: "New slot is already booked",
        conflictingAppointment: existingAppointment._id
      });
    }

    appointment.date = new Date(newDate);
    appointment.slotNumber = newSlotNumber;
    appointment.appStatus = "Rescheduled";
    await appointment.save();

    let emailSent = false;
    let emailError = null;
    let patient = null;
    let doctor = null;
    let hospital = null;

    try {
      [patient, doctor, hospital] = await Promise.all([
        Patient.findOne({ patientId: appointment.patientId }),
        Doctor.findOne({ doctorId: appointment.doctorId }),
        Hospital.findOne({ hospitalId: appointment.hospitalId })
      ]);

      if (patient && patient.email) {
        const appointmentData = {
          patientName: patient.name,
          oldDate: oldDate,
          oldTime: `Slot ${oldSlotNumber}`,
          newDate: formatDate(newDate),
          newTime: `Slot ${newSlotNumber}`,
          location: hospital ? hospital.hospitalName : "Hospital",
          doctorName: doctor ? doctor.name : "Doctor",
          reason: reason || "Schedule change requested"
        };

        await sendRescheduleEmail(patient.email, appointmentData);
        emailSent = true;
      }
    } catch (emailSendError) {
      console.error("Failed to send reschedule email:", emailSendError.message);
      emailError = emailSendError.message;
    }

    return res.status(200).json({ 
      message: emailSent 
        ? "Appointment rescheduled successfully and email sent" 
        : "Appointment rescheduled successfully (no email sent)",
      appointmentId: appointmentId,
      oldDetails: {
        date: oldDate,
        slot: oldSlotNumber
      },
      newDetails: {
        date: formatDate(newDate),
        slot: newSlotNumber
      },
      emailSent: emailSent,
      emailSentTo: patient?.email || null,
      emailError: emailError
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to reschedule appointment",
      error: error.message,
      appointmentId: appointmentId
    });
  }
};

export const getAppointmentsByPatient = async (req, res) => {
  const { date } = req.params;
  const { patientId } = req.query;

  if (!patientId || !date) {
    return res.status(400).json({ message: "Patient ID and date required" });
  }

  try {
    const appointments = await Appointment.find({
      patientId,
      date,
      appStatus: "Pending",
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error showing appointments:", error);
    res.status(500).json({ message: "Failed to show appointments" });
  }
};

export const getAllAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required" });
  }

  try {
    const appointments = await Appointment.find({ doctorId });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

const appointmentController = {
  bookAppointment,
  getBookedSlots,
  showAppointments,
  getPreviousAppointments,
  updateAppStatus,
  cancelAppointment,
  history,
  rescheduleAppointment,
  getAppointmentsByPatient,
  getAllAppointmentsByDoctor,
};

export default appointmentController;