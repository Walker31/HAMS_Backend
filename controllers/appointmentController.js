import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";
import { format } from "date-fns";
import Hospital from "../models/hospitalModel.js";
import {
  sendConfirmationEmail,
  sendReminderEmail,
  sendCancellationEmail,
  sendRescheduleEmail,
  sendAppointmentResponseEmail,
} from "../services/emailService.js";
import {
  scheduleReminderInDB,
  cancelReminder,
} from "../services/reminderService.js";

export const bookAppointment = async (req, res) => {
  const {
    date,
    doctorId,
    hospital,
    slotNumber,
    reason,
    payStatus,
    consultStatus,
  } = req.body;
  const patientId = req.user?.id;

  try {
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Reason is required" });
    }

    let generatedLink = "Link";
    if (consultStatus === "Online") {
      const uniqueRoom = `HAMS_${doctorId}_${patientId}_${Date.now()}`;
      generatedLink = `https://meet.jit.si/${uniqueRoom}`;
    }

    const appointment = new Appointment({
      date,
      patientId,
      doctorId,
      hospital,
      slotNumber,
      reason,
      payStatus,
      consultStatus,
      appStatus: "Requested",
      meetLink: generatedLink,
    });

    await appointment.save();

    // Email and reminder logic
    try {
      const patient = await Patient.findOne({ patientId });
      const doctor = await Doctor.findOne({ doctorId });
      // Format date and time
      const formattedDate = format(new Date(date), "dd/MM/yyyy");
      const formattedTime = `Slot ${slotNumber}`;
      const appointmentData = {
        patientName: patient.name,
        date: formattedDate,
        time: formattedTime,
        location: hospital,
        doctorName: doctor.name,
      };
      // Send request notification email instead of confirmation
      await sendAppointmentResponseEmail(
        patient.email,
        {
          ...appointmentData,
          message:
            "Your appointment request has been submitted and is pending doctor approval.",
        },
        "request"
      );

      return res.status(201).json({
        message: "Appointment request submitted successfully",
        appointment,
        emailSent: true,
        emailSentTo: patient.email,
      });
    } catch (emailError) {
      console.error(
        "Failed to send request notification email:",
        emailError.message
      );
      return res.status(201).json({
        message: "Appointment request submitted, but failed to send email",
        appointment,
        emailError: emailError.message,
      });
    }
  } catch (error) {
    console.error("MongoDB Save Error:", error);
    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// Get Booked Slots for a Doctor on a Given Date
export const getBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ message: "Doctor ID and date are required" });
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
  const doctorId = req.user.id;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor ID and date required" });
  }

  try {
    const appointments = await Appointment.find({
      doctorId,
      date,
      appStatus: "Pending",
    }).lean();

    for (let i = 0; i < appointments.length; i++) {
      const patientId = appointments[i].patientId;

      if (patientId) {
        const patient = await Patient.findOne({ patientId }).lean();
        appointments[i].patientName = patient?.name || "Unknown";
      } else {
        appointments[i].patientName = "Unknown";
      }
    }
    res.json(appointments);
  } catch (error) {
    console.error("Error showing appointments:", error);
    res.status(500).json({ message: "Failed to show appointments" });
  }
};

// Get Previous Appointments
export const getPreviousAppointments = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({
      doctorId,
    })
      .sort({ date: -1 })
      .lean();

    const updatedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        if (appt.patientId) {
          const patient = await Patient.findOne({
            patientId: appt.patientId,
          }).lean();
          return {
            ...appt,
            patientName: patient?.name || "Unknown",
          };
        } else {
          return { ...appt, patientName: "Unknown" };
        }
      })
    );

    res.json(updatedAppointments);
  } catch (error) {
    console.error("Error fetching previous appointments:", error);
    res.status(500).json({ message: "Failed to fetch previous appointments" });
  }
};

// Update Appointment Status with Rejection Reason or Prescription
export const updateAppStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { appStatus, rejectionReason, prescription } = req.body;

  try {
    const appointment = await Appointment.findOne({ appointmentId });
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

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  try {
    const appointment = await Appointment.findOne({
      appointmentId: appointmentId,
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const [patient, doctor, hospital] = await Promise.all([
      Patient.findOne({ patientId: appointment.patientId }),
      Doctor.findOne({ doctorId: appointment.doctorId }),
      Hospital.findOne({ hospital: appointment.hospital }),
    ]);
    await Appointment.findByIdAndUpdate(appointment._id, {
      consultStatus: "Cancelled",
    });
    await cancelReminder(
      appointment.appointmentId || appointment._id.toString()
    );

    let emailSent = false;
    let emailError = null;
    if (patient && patient.email) {
      try {
        // Format date and time
        const formattedDate = format(new Date(appointment.date), "dd/MM/yyyy");
        const formattedTime = `Slot ${appointment.slotNumber}`;
        const appointmentData = {
          patientName: patient.name,
          date: formattedDate,
          time: formattedTime,
          location: hospital,
          doctorName: doctor ? doctor.name : "Doctor",
          reason: appointment.reason || "No reason provided",
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
        ? "Appointment cancelled and email sent"
        : "Appointment cancelled (no email sent)",
      appointmentId: appointmentId,
      emailSent: emailSent,
      emailSentTo: patient?.email || null,
      emailError: emailError,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel appointment", error: error.message });
  }
};

// Reschedule Appointment
export const rescheduleAppointment = async (req, res) => {
  const { appointmentId, newDate, newSlot, reason } = req.body;
  try {
    let appointment = null;
    if (appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      appointment = await Appointment.findById(appointmentId);
    }
    if (!appointment) {
      appointment = await Appointment.findOne({ appointmentId: appointmentId });
    }
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const oldDate = appointment.date;
    const oldSlotNumber = appointment.slotNumber;
    // Check for slot conflict
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(newDate),
      slotNumber: newSlot,
      _id: { $ne: appointment._id },
    });
    if (existingAppointment) {
      return res.status(409).json({
        message: "New slot is already booked",
        conflictingAppointment: existingAppointment._id,
      });
    }
    appointment.date = newDate;
    appointment.slotNumber = newSlot;
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
        Hospital.findOne({ hospitalId: appointment.hospitalId }),
      ]);
      if (patient && patient.email) {
        // Format dates and times
        const formattedOldDate = format(new Date(oldDate), "dd/MM/yyyy");
        const formattedOldTime = `Slot ${oldSlotNumber}`;
        const formattedNewDate = format(new Date(newDate), "dd/MM/yyyy");
        const formattedNewTime = `Slot ${newSlot}`;
        const appointmentData = {
          patientName: patient.name,
          oldDate: formattedOldDate,
          oldTime: formattedOldTime,
          newDate: formattedNewDate,
          newTime: formattedNewTime,
          location: hospital ? hospital.hospitalName : "Hospital",
          doctorName: doctor ? doctor.name : "Doctor",
          reason: reason || "Schedule change requested",
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
        ? "Appointment rescheduled and email sent"
        : "Appointment rescheduled (no email sent)",
      appointmentId: appointmentId,
      oldDetails: {
        date: oldDate,
        slot: oldSlotNumber,
      },
      newDetails: {
        date: newDate,
        slot: newSlot,
      },
      emailSent: emailSent,
      emailSentTo: patient?.email || null,
      emailError: emailError,
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res
      .status(500)
      .json({
        message: "Failed to reschedule appointment",
        error: error.message,
      });
  }
};

export const getAppointmentsByPatient = async (req, res) => {
  const patientId = req.user?.id;

  if (!patientId) {
    return res.status(400).json({ message: "Patient ID required" });
  }

  try {
    const appointments = await Appointment.find({ patientId }).lean(); // use lean() for plain JS objects

    const formattedAppointments = appointments.map((appt) => ({
      ...appt,
      date: format(new Date(appt.date), "dd/MM/yyyy"),
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Failed to fetch patient appointments" });
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

export const appointmentDetail = async (req, res) => {
  const { appointmentId } = req.query;
  if (!appointmentId)
    return res.status(400).json({ message: "Appointment ID is missing." });

  try {
    const appointment = await Appointment.findOne({ appointmentId });
    const patientId = appointment["patientId"];
    const doctorId = appointment["doctorId"];
    const patient = await Patient.findOne({ patientId });
    const doctor = await Doctor.findOne({ doctorId });
    const dob = new Date(patient.dateOfBirth);
    const age =
      new Date().getUTCFullYear() -
      dob.getUTCFullYear() -
      (new Date() < new Date(dob.setFullYear(new Date().getFullYear()))
        ? 1
        : 0);
    const previousAppointments = await Appointment.find({
      patientId: patientId,
      doctorId: doctorId,
      appointmentId: { $ne: appointmentId },
    })
      .sort({ date: -1 })
      .lean();
    const formattedDate = format(new Date(appointment.date), "dd/MM/yyyy");
    const bookedOn = format(new Date(appointment.createdAt), "dd/MM/yyyy");

    const addressObj = patient.address || {};
    const formattedAddress = `${addressObj.street || ""}, ${
      addressObj.city || ""
    }, ${addressObj.state || ""} - ${addressObj.postalCode || ""}`.trim();

    const responseData = {
      appointmentDetails: {
        appointmentId: appointment.appointmentId,
        date: formattedDate,
        time: appointment.slotNumber,
        bookedOn,
        reason: appointment.reason,
        type: appointment.consultStatus,
        status: appointment.appStatus,
        department: doctor.specialization,
        doctor: doctor.name,
        meetLink: appointment.meetLink,
      },
      patientDetails: {
        name: patient.name,
        email: patient.email,
        contact: patient.phone,
        gender: patient.gender,
        address: formattedAddress,
        age: age,
      },
      previousAppointments,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching details : ", error);
    res
      .status(500)
      .json({ message: "Failed to fetch Appointment Details ", error: error });
  }
};

export const respondToAppointmentRequest = async (req, res) => {
  const { appointmentId, action } = req.body; // action: 'accept' or 'reject'
  const doctorId = req.user?.id;

  try {
    let appointment = null;
    appointment = await Appointment.findOne({ appointmentId: appointmentId });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if appointment is in Requested status
    if (appointment.appStatus !== "Requested") {
      return res
        .status(400)
        .json({ message: "Appointment is not in Requested status" });
    }

    let newStatus = "";
    let emailData = {};

    if (action === "accept") {
      newStatus = "Pending";
      emailData = {
        patientName: "", // Will be populated below
        date: appointment.date,
        time: `Slot ${appointment.slotNumber}`,
        location: "", // Will be populated below
        doctorName: "", // Will be populated below
        message:
          "Your appointment request has been accepted and is now pending.",
      };
    } else if (action === "reject") {
      newStatus = "Rejected";
      emailData = {
        patientName: "", // Will be populated below
        date: appointment.date,
        time: `Slot ${appointment.slotNumber}`,
        location: "", // Will be populated below
        doctorName: "", // Will be populated below
        reason: appointment.reason, // Use the original appointment reason
        message: "Your appointment request has been rejected.",
      };
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'accept' or 'reject'" });
    }

    // Update appointment status
    appointment.appStatus = newStatus;
    await appointment.save();

    // Send email notification
    try {
      const [patient, doctor, hospital] = await Promise.all([
        Patient.findOne({ patientId: appointment.patientId }),
        Doctor.findOne({ doctorId: appointment.doctorId }),
        Hospital.findOne({ hospitalId: appointment.hospitalId }),
      ]);

      if (patient && patient.email) {
        emailData.patientName = patient.name;
        emailData.doctorName = doctor ? doctor.name : "Doctor";
        emailData.location = hospital ? hospital.hospitalName : "Hospital";

        if (action === "accept") {
          // Send acceptance email
          await sendAppointmentResponseEmail(
            patient.email,
            emailData,
            "accept"
          );

          // Send confirmation email
          await sendConfirmationEmail(patient.email, emailData);

          // Schedule reminder only if accepted
          await scheduleReminderInDB(
            appointment.appointmentId || appointment._id.toString(),
            emailData,
            patient.email,
            new Date(appointment.date)
          );
        } else {
          await sendAppointmentResponseEmail(
            patient.email,
            emailData,
            "reject"
          );
        }
      }

      return res.status(200).json({
        message: `Appointment ${
          action === "accept" ? "accepted" : "rejected"
        } successfully`,
        appointment: appointment,
        emailSent: true,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError.message);
      return res.status(200).json({
        message: `Appointment ${
          action === "accept" ? "accepted" : "rejected"
        } successfully, but email failed`,
        appointment: appointment,
        emailError: emailError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error responding to appointment request",
      error: error.message,
    });
  }
};

export default {
  bookAppointment,
  showAppointments,
  getPreviousAppointments,
  updateAppStatus,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentsByPatient,
  getBookedSlots,
  getAllAppointmentsByDoctor,
  appointmentDetail,
  respondToAppointmentRequest,
};
