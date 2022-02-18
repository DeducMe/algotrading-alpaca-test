import React from "react";

export default function PositionItem({ data }) {
  const { symbol, qty, side, entry_price, current_price, market_value } = data;

  const profitPercent = (
    ((Number(entry_price) - Number(current_price)) / Number(current_price)) *
    100
  ).toFixed(2);
  return (
    <div className="justify-between position-col">
      <p className="position-col-item text-align-center">{symbol}</p>
      <p className="position-col-item text-align-center">{qty}</p>
      <p className="position-col-item text-align-center">{entry_price}</p>
      <p className="position-col-item text-align-center">{current_price}</p>
      <p
        className={`position-col-item text-align-center ${
          profitPercent >= 0 ? "green" : "red"
        }`}
      >
        {profitPercent >= 0 && "+"}
        {profitPercent}%
      </p>
    </div>
  );
}
