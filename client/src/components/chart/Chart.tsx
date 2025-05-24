"use client";

import React, { useEffect, useRef } from "react";
import { createChart, AreaSeries, CandlestickSeries } from "lightweight-charts";
import { useTheme } from "next-themes";

const Chart = (props) => {
    const { candleData, areaData } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: {
                    color: theme === "dark" ? "#0e1117" : "#ffffff",
                },
                textColor: theme === "dark" ? "#d1d4dc" : "#000000",
            },
            grid: {
                vertLines: {
                    color: theme === "dark" ? "#2B2B43" : "#E6E6E6",
                },
                horzLines: {
                    color: theme === "dark" ? "#363C4E" : "#F0F3FA",
                },
            },
        });

        chartRef.current = chart;

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: "#2962FF",
            topColor: "#2962FF",
            bottomColor: "rgba(41, 98, 255, 0.28)",
        });


        areaSeries.setData(areaData);

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        });

        candlestickSeries.setData(candleData);

        chart.timeScale().fitContent();

        return () => chart.remove();

    }, [theme, areaData, candleData]);

    return <div ref={containerRef} style={{ width: "100%", height: "700px" }} />;
};

export default Chart;
