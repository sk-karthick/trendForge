import { Request, Response } from "express";
import dotenv from "dotenv";
import { SmartAPI } from "smartapi-javascript";
import speakeasy from 'speakeasy';

dotenv.config();

const marketData = async (req: Request, res: Response) => {
    
    const smartConnect = new SmartAPI({ api_key: process.env.API_KEY });
    
    async function login() {
        const totpCode = speakeasy.totp({
            secret: process.env.TOTP_SECRET!,
            encoding: 'base32',
            step: 30,
            digits: 6,
        });

        try {
            const user = await smartConnect.generateSession(process.env.CLIENT_CODE, process.env.MPIN, totpCode);
            console.log('Angle one Login Success', user);

            smartConnect.setAccessToken(user.access_token);  
        } catch (error) {
            console.error('Login Failed:', error);
        }
    }

    login();
};

export default marketData;
