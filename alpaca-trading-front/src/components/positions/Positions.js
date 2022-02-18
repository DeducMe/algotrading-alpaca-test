import React from "react";
import PositionItem from "./PositionItem";
import "./positionItem.css";
import "../../global.css";

export default function Positions({ positions }) {
  return (
    <div className="positions-container">
      <div className="flex justify-between position-col">
        <p className="position-col-item sup-text">Asset</p>
        <p className="position-col-item sup-text">Quantity</p>
        <p className="position-col-item sup-text">Entry</p>
        <p className="position-col-item sup-text">Current</p>
        <p className="position-col-item sup-text">Profit</p>
      </div>

      {positions.map((item) => (
        <PositionItem data={item}></PositionItem>
      ))}
    </div>
  );
}