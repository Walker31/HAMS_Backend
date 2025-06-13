import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json())


app.get('/',(req,res) => {
    res.send({
        "message":"Route working perfectly"
    });
})

app.use('/doctors',authRoutes);

app.listen(3000 ,console.log(`Server is runnning at ${PORT}`))