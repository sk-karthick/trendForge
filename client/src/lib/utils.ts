import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const transformToCandlestickData = (raw: any[]) => {
    if (!Array.isArray(raw)) return [];

    return raw.map((item) => {
        const open = parseFloat(item.open);
        const high = parseFloat(item.high);
        const low = parseFloat(item.low);
        const close = parseFloat(item.close);

        if (
            isNaN(open) || isNaN(high) ||
            isNaN(low) || isNaN(close) ||
            !item.date
        ) {
            return null;
        }

        return {
            time: Math.floor(new Date(item.date).getTime() / 1000),
            open,
            high,
            low,
            close,
        };
    }).filter(Boolean);
};


export const transformToAreaSeriesData = (raw: any[]) => {
    return raw.map(item => {
        const value = parseFloat(item.adjclose);
        if (isNaN(value)) return null;

        return {
            time: item.date.slice(0, 10),
            value,
        };
    }).filter(Boolean);
};