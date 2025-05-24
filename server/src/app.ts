import express from 'express';
import authRoutes from './routes/authRoutes';
import marketData from './models/marketData';
import angelOneRoutes from './routes/angelOneRoutes';
import cors from 'cors';
import traingModal from './ai/trainModal';


const app = express();
app.use(express.json());
app.use(cors({
    origin: '*', // or use '*' for development
    credentials: true // if you're using cookies or sessions
}));

app.use('/api/auth', authRoutes);
app.use('/api/angelone', angelOneRoutes);
app.use('/api/market-data', marketData, traingModal);
app.use('/api/train', traingModal);

export default app;
