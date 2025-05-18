    import jwt from 'jsonwebtoken';
    import dotenv from 'dotenv';

    dotenv.config();

    export function generateToken(userId: number) {
        return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    }
