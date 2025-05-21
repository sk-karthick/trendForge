import { Request, Response } from 'express';
import { SmartAPI } from 'smartapi-javascript';
import speakeasy from 'speakeasy';
import { storeAngelOneTokens } from '../models/angelOneModel';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();


const loginToAngelOne = async (req: Request, res: Response): Promise<void> => {
    const { client_code, mpin, totp_secret, password, user_token, historic_api_key, realtime_api_key } = req.body;

    const decoded = (token:string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error('Invalid token', err);
            return null;
          }
    };

    const decodedToken = decoded(user_token);
    const user_id = decodedToken?.userId || '';

    if (!user_id || !client_code || !mpin || !totp_secret || !password) {
        res.status(400).json({ message: 'Missing credentials' });
        return;
    }
    
    const smartConnect = new SmartAPI({ api_key: historic_api_key! });

    const totpCode = speakeasy.totp({
        secret: totp_secret,
        encoding: 'base32',
        step: 30,
        digits: 6,
    });

    try {
        const result = await smartConnect.generateSession(client_code, mpin, totpCode);

        const { jwtToken, refreshToken, feedToken } = result.data;
        if(!jwtToken || !refreshToken || !feedToken) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }




        try {
            await storeAngelOneTokens({
                user_id: user_id,
                client_id: client_code,
                totp: totp_secret,
                mpin,
                historic_api_key: historic_api_key,
                realtime_api_key: realtime_api_key,
                password,
                jwt_token: jwtToken,
                refresh_token: refreshToken,
                feed_token: feedToken,
            });
            console.log("Inserted successfully");
        } catch (err) {
            console.error("Error inserting data:", err);
          }



        // const connectWebSocket = (clientCode: string, feedToken: string) => {
        //     const ws = new WebSocket('wss://smartapisocket.angelone.in/smart-stream');

        //     ws.on('open', () => {
        //         console.log('WebSocket connected');
        //         const payload = {
        //             task: 'cn',
        //             channel: 'nse_cm|2885',
        //             token: feedToken,
        //             user: clientCode,
        //             acctid: clientCode,
        //         };
        //         ws.send(JSON.stringify(payload));
        //     });

        //     ws.on('message', (message) => {
        //         console.log('Market Data:', message.toString());
        //     });

        //     ws.on('error', (err) => console.error('WebSocket error:', err));
        //     ws.on('close', () => console.log('WebSocket closed'));
        // };

        // connectWebSocket(client_code, feedToken);


        res.status(200).json({ message: 'Angel One login successful' });
    } catch (error) {
        console.error('Angel One Login Failed:', error);
        res.status(401).json({ message: 'Angel One login failed' });
    }
};

export default loginToAngelOne;
