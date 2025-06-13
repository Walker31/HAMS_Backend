import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json())

const MONGO_URL = 'mongodb+srv://HAMS_DB:HAMS_DB@cluster-hams.4svzuyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-HAMS';
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