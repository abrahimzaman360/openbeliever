"use client";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, TrendingUp, DollarSign, BarChart2 } from "lucide-react";

const TradingDashboard = () => {
  // Sample data - replace with real API data
  const [priceData] = useState([
    { time: "09:00", price: 1200, upperBand: 1250, lowerBand: 1150, sma: 1200 },
    { time: "09:05", price: 1220, upperBand: 1260, lowerBand: 1160, sma: 1210 },
    // Add more data points
  ]);

  const [trades] = useState([
    {
      timestamp: "2024-01-07 09:00",
      action: "BUY",
      entryPrice: 1200,
      exitPrice: 1220,
      pnl: 20,
    },
    {
      timestamp: "2024-01-07 09:15",
      action: "SELL",
      entryPrice: 1220,
      exitPrice: 1200,
      pnl: -20,
    },
  ]);

  const [metrics] = useState({
    totalTrades: 150,
    winRate: 65.3,
    totalProfit: 2500,
    currentPosition: "LONG",
  });

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.winRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalProfit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Position</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentPosition}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Price Chart with Bollinger Bands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2196f3"
                  name="Price"
                />
                <Line
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#ff9800"
                  name="Upper Band"
                />
                <Line
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#ff9800"
                  name="Lower Band"
                />
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="#4caf50"
                  name="SMA"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Exit Price</TableHead>
                  <TableHead>P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{trade.timestamp}</TableCell>
                    <TableCell
                      className={
                        trade.action === "BUY"
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      {trade.action}
                    </TableCell>
                    <TableCell>{trade.entryPrice}</TableCell>
                    <TableCell>{trade.exitPrice}</TableCell>
                    <TableCell
                      className={
                        trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }>
                      ${trade.pnl}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingDashboard;
