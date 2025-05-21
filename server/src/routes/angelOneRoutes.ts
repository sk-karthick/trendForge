// routes/angelOneRoutes.ts
import express from 'express';
import loginToAngelOne from '../controllers/angelOneController';

const router = express.Router();

// Protected Angel One login
router.post('/login', loginToAngelOne);

export default router;
