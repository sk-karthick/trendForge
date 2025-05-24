import dotenv from "dotenv";
import { Request, Response } from "express";
import { getCachedQuotes } from "../libs/redisCache";
dotenv.config();

const marketData = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.body;
        if (!symbol) {
            res.status(400).json({ error: "Symbol is required" });
            return;
        }
        const data = await getCachedQuotes(symbol);

        if (data) {
            res.status(200).json(data);
            return;
        }

        

    } catch (error) {
        console.error("Error fetching market data:", error);
    }
};

export default marketData;
