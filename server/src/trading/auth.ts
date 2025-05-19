import { SmartAPI } from "smartapi-javascript";
import dotenv from "dotenv";
import speakeasy from 'speakeasy';

dotenv.config();

const angleOneLogin = async () => {
    try {
        const totpCode = speakeasy.totp({
            secret: process.env.TOTP_SECRET!,
            encoding: 'base32',
            step: 30,
            digits: 6,
        });

        const smartConnect = new SmartAPI({ api_key: process.env.API_KEY })

        const user = await smartConnect.generateSession(process.env.CLIENT_CODE, process.env.MPIN, totpCode);

        console.log('Angle one Login Success', user);
        smartConnect.setAccessToken(user.access_token);

    } catch (error) {
        console.error('Login Failed:', error);
    }
}

export default angleOneLogin;