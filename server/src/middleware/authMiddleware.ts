import e, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        req.user = { id: decoded.id }; // Attach user info to request
        next(); // ✅ continue to next handler
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export default authenticateToken;