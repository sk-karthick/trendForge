"use client"
import Chart from '@/components/Chart';
import { transformToAreaSeriesData, transformToCandlestickData } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

interface DashboardProps {
    search: string
}

const Dashboard = ({ search }: DashboardProps) => {
    const [data, setData] = useState<any>(null);
    const [candleData, setCandleData] = useState<any>([]);
    const [areaData, setAreaData] = useState<any>([]);

    console.log("search", search);

    useEffect(() => {
        try {
            const cached = localStorage.getItem(search);
            if (cached) {
                const cachedData = JSON.parse(cached);
                setData(cachedData.quotes);
                return;
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
        }
    }, [search])

    useEffect(() => {
        if (!data) return;
        const candleSeriesData = transformToCandlestickData(data);
        setCandleData(candleSeriesData);
        const areaSeriesData = transformToAreaSeriesData(data);
        setAreaData(areaSeriesData);
    }, [data]);


    return (
        <div className="p-4">
            <Chart candleData={candleData} areaData={areaData} />
        </div>
    )
}

export default Dashboard