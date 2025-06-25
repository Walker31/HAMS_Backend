import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

// Book Appointment
export const bookAppointment = async (req, res) => {
  console.log("📥 Received book appointment request:", req.body);
  const { date, patientId, doctorId, clinicId, slotNumber, reason, payStatus } = req.body;

  try {
    const appointment = new Appointment({
      date,
      patientId,
      doctorId,
      clinicId,
      slotNumber,
      reason,
      payStatus,
      appStatus: "Pending", // default status
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("MongoDB Save Error:", error);
    res.status(500).json({ message: "Failed to book appointment", error: error.message });
  }
};

// Get Booked Slots for a Doctor on a Given Date
export const getBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor ID and date are required" });
    }

    const appointments = await Appointment.find({
      doctorId,
      date,
      appStatus: { $ne: "Rejected" }, // Exclude rejected slots
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

  console.log("Incoming request => doctorId:", doctorId, "date:", date);

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor ID and date required" });
  }

  try {
    const appointments = await Appointment.find({
      doctorId,
      date,
      appStatus: "Pending",
    });

    console.log("Appointments fetched:", appointments.length);
    console.log(appointments);
    res.json(appointments);
  } catch (error) {
    console.error("Error showing appointments:", error);
    res.status(500).json({ message: "Failed to show appointments" });
  }
};


// Get Previous Appointments
export const getPreviousAppointments = async (req, res) => {
  const { doctorId } = req.query;

  try {
    const appointments = await Appointment.find({
      doctorId,
      appStatus: { $in: ["Completed", "Rejected", "Rescheduled"] },
    }).sort({ date: -1 }); // optional: sort by recent first

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching previous appointments:", error);
    res.status(500).json({ message: "Failed to fetch previous appointments" });
  }
};

// Update Appointment Status with Rejection Reason or Prescription
export const updateAppStatus = async (req, res) => {
  const { appId } = req.params;
  const { appStatus, rejectionReason, prescription } = req.body;

  try {
    const appointment = await Appointment.findById(appId);
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
    await Appointment.findByIdAndDelete(appointmentId);
    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
};

// Reschedule Appointment
export const rescheduleAppointment = async (req, res) => {
  const { appointmentId, newDate, newSlot } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.date = newDate;
    appointment.slotNumber = newSlot;
    appointment.appStatus = "Rescheduled";

    await appointment.save();
    res.status(200).json({ message: "Appointment rescheduled" });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ message: "Failed to reschedule appointment" });
  }
};

// Get Appointments by Patient (for patient dashboard)
export const getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await Appointment.find({ patientId });
    res.status(200).json(appointments);
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
};
