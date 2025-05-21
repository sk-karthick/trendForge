import express from 'express';
import authRoutes from './routes/authRoutes';
import marketData from './models/marketData';
import angelOneRoutes from './routes/angelOneRoutes';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // or use '*' for development
    credentials: true // if you're using cookies or sessions
}));

app.use('/api/auth', authRoutes);
app.use('/api/angelone', angelOneRoutes);
app.use('/api/market-data', marketData);

export default app;
