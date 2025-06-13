import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json())

const MONGO_URL = 'mongodb://localhost:27017/HAMS';
mongoose.connect(MONGO_URL)
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

app.use('/doctors',authRoutes);