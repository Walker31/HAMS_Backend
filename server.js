import express from 'express';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js'
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json())

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/',(req,res) => {
    res.send({
        "message":"Route working perfectly"
    });
})

app.use('/doctors',doctorRoutes);
app.use('/patients',patientRoutes);
app.use('/appointments',appointmentRoutes)