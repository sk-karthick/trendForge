import dotenv from "dotenv";
import { Request, Response } from "express";
import yahooFinance from 'yahoo-finance2';
import client from "../config/redis";
import { cacheQuotes, getCachedQuotes } from "../libs/redisCache";
dotenv.config();

const marketData = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.body;
        if (!symbol) {
            res.status(400).json({ error: "Symbol is required" });
            return;
        }
        const queryOptions = { period1: '2013-01-01', period2: '2025-05-25' };
        const result = await yahooFinance.chart(symbol + '.NS', queryOptions);
        if (!result) {
            res.status(404).json({ error: "No data found" });
            return;
        }
        const { meta, quotes, events } = result;
        res.status(200).json({ meta, quotes, events });

        await cacheQuotes(symbol, quotes);

    } catch (error) {
        console.error("Error fetching market data:", error);
    }
};

export default marketData;
