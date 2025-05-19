import express from 'express';
import authRoutes from './routes/authRoutes';
import marketData from './models/marketData';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/market-data', marketData);

export default app;
