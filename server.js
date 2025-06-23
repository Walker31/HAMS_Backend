import express from 'express';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';  // CRUD operations for appointments
import hospitalRoutes from './routes/hospitalRoutes.js';
import emailRoutes from './routes/appointments.js';            // Booking & email scheduling
import reviewRoutes from './routes/reviewRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS Middleware with credentials allowed
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend origin
  credentials: true                 // Allow cookies / auth headers
}));

// Body parser
app.use(express.json());

// Health-check route
app.get('/', (req, res) => {
  res.send({ message: 'Route working perfectly' });
});

// Mount domain routes
app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);   // base CRUD
app.use('/appointmentsEmail', emailRoutes);    // booking & email notifications
app.use('/reviews', reviewRoutes);
app.use('/hospitals', hospitalRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
