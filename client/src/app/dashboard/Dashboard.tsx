"use client"
import Chart from '@/components/chart/Chart';
import ChartHeader from '@/components/chart/ChartHeader';
import { transformToAreaSeriesData, transformToCandlestickData } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

interface DashboardProps {
    search: string
}

const Dashboard = ({ search }: DashboardProps) => {
    const [chartData, setChartData] = useState<any>(null);
    const [candleData, setCandleData] = useState<any>([]);
    const [areaData, setAreaData] = useState<any>([]);
    const [headerData, setHeaderData] = useState<any>([]);
    useEffect(() => {
        try {
            const cached = localStorage.getItem(search);
            if (cached) {
                const cachedData = JSON.parse(cached);
                setChartData(cachedData.quotes);
                setHeaderData(cachedData.meta);
                return;
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
        }
    }, [search])

    useEffect(() => {
        if (!chartData) return;
        const candleSeriesData = transformToCandlestickData(chartData);
        setCandleData(candleSeriesData);
        const areaSeriesData = transformToAreaSeriesData(chartData);
        setAreaData(areaSeriesData);
    }, [chartData]);


    return (
        <div className="p-4">
            <ChartHeader headerData={headerData} />
            <Chart candleData={candleData} areaData={areaData} />
        </div>
    )
}

export default Dashboard