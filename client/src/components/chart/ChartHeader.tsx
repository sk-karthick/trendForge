"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChartHeaderProps {
    headerData: {
        currency: string;
        symbol: string;
        longName: string;
        fiftyTwoWeekHigh: number;
        fiftyTwoWeekLow: number;
        chartPreviousClose: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketPrice: number;
    };
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ headerData }) => {
    if (!headerData) return null;

    const getSymbol = () => {
        return headerData.symbol ? headerData.symbol.replace(/\.NS$/, "") : "";
    };

    return (
        <Card className="w-full max-w-3xl mb-4 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                    {headerData.longName}
                    <Badge variant="outline">{getSymbol()}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <span className="font-medium">Currency:</span> {headerData.currency}
                    </div>
                    <div>
                        <span className="font-medium">52W High:</span> {headerData.fiftyTwoWeekHigh}
                    </div>
                    <div>
                        <span className="font-medium">52W Low:</span> {headerData.fiftyTwoWeekLow}
                    </div>
                    <div>
                        <span className="font-medium">Prev Close:</span> {headerData.chartPreviousClose}
                    </div>
                    <div>
                        <span className="font-medium">Day High:</span> {headerData.regularMarketDayHigh}
                    </div>
                    <div>
                        <span className="font-medium">Day Low:</span> {headerData.regularMarketDayLow}
                    </div>
                    <div className="col-span-2 md:col-span-3">
                        <span className="font-medium">Current Price:</span>{" "}
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {headerData.regularMarketPrice}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartHeader;
