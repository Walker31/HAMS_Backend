import express from "express";
import mongoose from "mongoose";
import Appointment from "../controllers/appointmentController.js";
import Appointments from "../models/appointmentModel.js";

const router = express.Router();

router.post("/book", Appointment.bookAppointment);
router.delete("/delete", Appointment.deleteAppointment);
router.put("/reschedule", Appointment.rescheduleAppointment);
router.put("/cancel", Appointment.cancelAppointment);


router.put("/update-status/:appId", async (req, res) => {
    const { appId } = req.params;
    const { appStatus, rejectionReason } = req.body;

    try {
        const updateData = { appStatus };
        if (appStatus === "Rejected" && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const updatedAppointment = await Appointments.findOneAndUpdate(
            { appId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ message: "Appointment status updated successfully", appointment: updatedAppointment });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.get("/pending/:date", async (req, res) => {
    const { date } = req.params;
    const { doctorId } = req.query;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const query = {
        appStatus: "Pending",
        date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (doctorId) {
        query.doctorId = doctorId;
    }

    console.log("Querying with:", query);

    try {
        const appointments = await Appointments.find(query);
        console.log("Appointments fetched:", appointments);
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

export default router;

