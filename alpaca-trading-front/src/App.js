import "./App.css";
import "./global.css";

import { useEffect, useState } from "react";
import { Chart } from "./components/chart/Chart";
import Positions from "./components/positions/Positions";

function App() {
  const [portfolioHistory, setPortfolioHistory] = useState();
  const [portfolioHistoryToday, setPortfolioHistoryToday] = useState();
  const [portfolioHistoryWeek, setPortfolioHistoryWeek] = useState();

  const [currentGain, setCurrentGain] = useState();
  const [currentPositions, setCurrentPositions] = useState();

  useEffect(() => {
    const isProd = process.env.NODE_ENV === "production" || false;
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

    fetch(`${url}api/positions`)
      .then((res) => res.json())
      .then((res) => setCurrentPositions(res));
  }, []);

  useEffect(() => {
    console.log(
      "Вот блять посмотри на эту суку, я ебался весь день, нихуя не понял в чем проблема. ААААААААААААААА"
    );
    console.log(portfolioHistoryWeek);
  }, [portfolioHistoryWeek]);

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
      <div className="flex chart-container">
        <div className="chart-block">
          <h3 className="text-align-center">month</h3>
          <Chart
            data={portfolioHistory?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                };

              return false;
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">week</h3>
          <p className="sup-text">
            тут какая-то залупа с графиком, потому что альпака не хочет мне фул
            данные возращать, скамина ебаная
          </p>

          <Chart
            data={portfolioHistoryWeek?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                };

              return false;
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">day</h3>

          <Chart
            noDots
            data={portfolioHistoryToday?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                };
              return false;
            })}
          ></Chart>
        </div>
      </div>
      {currentPositions && <Positions positions={currentPositions} />}
    </div>
  );
}

export default App;
