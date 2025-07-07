import express from 'express';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { startReminderCronJob } from './services/reminderService.js';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://main.d2sjy3evn9ox1m.amplifyapp.com'
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'Route working perfectly' });
});

startReminderCronJob();
app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/reviews',reviewRoutes);
app.use('/hospitals', hospitalRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
