import "./App.css";
import { useEffect, useState } from "react";
import { Chart } from "./components/Chart";

function App() {
  const [portfolioHistory, setPortfolioHistory] = useState();
  const [portfolioHistoryToday, setPortfolioHistoryToday] = useState();
  const [portfolioHistoryWeek, setPortfolioHistoryWeek] = useState();

  const [currentGain, setCurrentGain] = useState();

  console.log(portfolioHistory, portfolioHistoryToday, portfolioHistoryWeek);

  useEffect(() => {
    const isProd = process.env.IS_PROD || false;
    const url = isProd
      ? "https://trading-alpaca-app.herokuapp.com/"
      : "http://localhost:8080/";
    fetch(`${url}api/history`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistory(res));

    fetch(`${url}api/history/today`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryToday(res));

    fetch(`${url}api/history/week`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryWeek(res));

    fetch(`${url}api/current`)
      .then((res) => res.json())
      .then((res) => setCurrentGain(res));
  }, []);

  return (
    <div className="App">
      {currentGain && (
        <>
          <h2>started from 10000$</h2>

          <div className="current-gain">
            <p>current gain - {currentGain.total}$</p>
            <p className={currentGain.percent >= 0 ? "green" : "red"}>
              {currentGain.percent >= 0 && "+" + currentGain.percent}%
            </p>
          </div>
        </>
      )}
      <h3>month</h3>
      <Chart
        data={portfolioHistory?.map((item) => {
          if (item.equity)
            return {
              percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
            };

          return false;
        })}
      ></Chart>
      <h3>week</h3>

      <Chart
        data={portfolioHistoryWeek?.map((item) => {
          if (item.equity)
            return {
              percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
            };

          return false;
        })}
      ></Chart>
      <h3>day</h3>

      <Chart
        noDots
        data={portfolioHistoryToday?.map((item) => {
          if (item.equity)
            return {
              percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
            };
          return false;
        })}
      ></Chart>

      <div className="flex">
        {/* {portfolioHistory?.map((item) => (
          <div className="portfolio-history-el">{item.equity}</div>
        ))} */}
      </div>
    </div>
  );
}

export default App;
