// lib/cache.ts

import client from "../config/redis";

export async function cacheQuotes(symbol: string, quotes: any) {
    await client.set(`quotes:${symbol}`, JSON.stringify(quotes));
}

export async function getCachedQuotes(symbol: string) {
    const cached = await client.get(`quotes:${symbol}`);
    return cached ? JSON.parse(cached) : null;
}
