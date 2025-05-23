import { useEffect, useState } from "react";

const useGetMarketData = (symbol: string) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!symbol) return;

        setData(null);
        setError(null);
        setLoading(true);

        const fetchMarketData = async () => {
            try {
                const cached = localStorage.getItem(symbol);
                if (cached) {
                    console.log("Using cached data for:", symbol);
                    setData(JSON.parse(cached));
                    setLoading(false);
                    return;
                }

                const response = await fetch("http://localhost:5000/api/market-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ symbol }),
                });

                if (!response.ok) throw new Error("Failed to fetch market data");

                const result = await response.json();
                setData(result);
                localStorage.setItem(symbol, JSON.stringify(result));
            } catch (err) {
                console.error("Error fetching market data:", err);
                setError("Failed to load market data");
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [symbol]);

    return { data, loading, error };
};

export default useGetMarketData;
