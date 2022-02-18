import "./App.css";
import { useEffect, useState } from "react";
import { Chart } from "./components/Chart";

function App() {
  const [portfolioHistory, setPortfolioHistory] = useState();
  const [portfolioHistoryToday, setPortfolioHistoryToday] = useState();
  const [portfolioHistoryWeek, setPortfolioHistoryWeek] = useState();

  const [currentGain, setCurrentGain] = useState();

  useEffect(() => {
    fetch("http://localhost:8080/api/history")
      .then((res) => res.json())
      .then((res) => setPortfolioHistory(res));

    fetch("http://localhost:8080/api/history/today")
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryToday(res));

    fetch("http://localhost:8080/api/history/week")
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryWeek(res));

    fetch("https://trading-alpaca-app.herokuapp.com/api/current")
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
          return {
            percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
          };
        })}
      ></Chart>
      <h3>week</h3>

      <Chart
        data={portfolioHistoryWeek?.map((item) => {
          return {
            percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
          };
        })}
      ></Chart>
      <h3>day</h3>

      <Chart
        noDots
        data={portfolioHistoryToday?.map((item) => {
          return {
            percent: (((item.equity - 100000) / 100000) * 100).toFixed(2),
          };
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
