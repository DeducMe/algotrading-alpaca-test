import React from "react";
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

import "./chart.css";

export const Chart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className={`label ${payload[0].value >= 0 ? "green" : "red"}`}>{`${
            payload[0].value >= 0 ? "+" : ""
          }${payload[0].value}%`}</p>
        </div>
      );
    }

    return null;
  };
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            vertical
            stroke="#2f3045"
            horizontal={false}
            verticalFill={["#555555", "#444444"]}
            fillOpacity={0.2}
          />
          <XAxis dataKey="percent" minTickGap={20} />
          <Tooltip content={CustomTooltip} />
          <Line
            type="monotone"
            dataKey="percent"
            stroke="#8884d8"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
