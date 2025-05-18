import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/userModel';
import { generateToken } from '../utils/tokenUtils';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password_hash } = req.body;
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password_hash, 10);
        const user = await createUser(username, email, hashedPassword);
        const token = generateToken(user.id);
        res.status(201).json({ token });
    } catch (err) {
        console.log(err);

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password_hash } = req.body;
        const user = await findUserByEmail(email);
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password_hash, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user.id);
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
