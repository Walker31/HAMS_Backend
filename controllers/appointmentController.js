import Patient from "../models/patientModel";
import Doctor from "../models/doctorModel";

class appointmentController{


    async bookAppointment(req,res){
        patientId = req.body.patientId;
        patient = await Patient.findOne({"patientId": patientId});
        doctorId = req.body.doctorId;
        doctor = await Doctor.findOne({"doctorId": doctorId});
        
    }


}