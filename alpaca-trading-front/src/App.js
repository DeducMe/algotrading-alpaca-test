import "./App.css";
import "./global.css";

import { useEffect, useRef, useState } from "react";
import { Chart } from "./components/chart/Chart";
import Positions from "./components/positions/Positions";

const isProd = process.env.NODE_ENV === "production" || false;
const url = isProd
  ? "https://trading-alpaca-app.herokuapp.com/"
  : "http://localhost:8080/";

function App() {
  const [portfolioHistory, setPortfolioHistory] = useState();
  const [portfolioHistoryToday, setPortfolioHistoryToday] = useState();
  const [portfolioHistoryWeek, setPortfolioHistoryWeek] = useState();

  const [currentGain, setCurrentGain] = useState();
  const [currentPositions, setCurrentPositions] = useState();
  const [passwordCorrect, setPasswordCorrect] = useState("");
  const [disablePositionsClose, setDisablePositionsClose] = useState();
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const passwordRef = useRef(null);

  function onPasswordInput() {
    if (passwordRef.current.value === "vanya_durak") {
      setPasswordCorrect(true);
      return;
    }

    setPasswordCorrect(false);
  }

  function disablePositions(disable) {
    setDisablePositionsClose(disable);
    fetch(`${url}api/close_positions`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ disable }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res));
  }

  useEffect(() => {
    if (disablePositionsClose !== undefined) setSettingsLoaded(true);
  }, [disablePositionsClose]);

  useEffect(() => {
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

    fetch(`${url}api/close_positions`)
      .then((res) => res.json())
      .then((res) => {
        setDisablePositionsClose(res.disabled);
      });
  }, []);

  useEffect(() => {
    console.log(
      "В недельном графике неверные данные, т.к. альпака не возвращает последние 15 мину каждого дня"
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
      <input
        className="password-input"
        onChange={onPasswordInput}
        ref={passwordRef}
      ></input>
      {passwordCorrect && settingsLoaded && (
        <div>
          <p>Position close at night</p>
          <button
            onClick={() => disablePositions(!disablePositionsClose)}
            className="button-default"
          >
            {disablePositionsClose ? "enable" : "disable"}
          </button>
        </div>
      )}
      <div className="flex chart-container">
        <div className="chart-block">
          <h3 className="text-align-center">month</h3>
          <Chart
            minTickGap={30}
            data={portfolioHistory?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                  timestamp: new Date(item.timestamp)
                    .toISOString()
                    .slice(5, 10),
                };

              return false;
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">week</h3>

          <Chart
            minTickGap={30}
            data={portfolioHistoryWeek?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                  timestamp: new Date(item.timestamp)
                    .toISOString()
                    .slice(5, 10),
                };

              return false;
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">day</h3>

          <Chart
            minTickGap={15}
            data={portfolioHistoryToday?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 100000) / 100000) * 100).toFixed(2)
                  ),
                  timestamp: new Date(item.timestamp)
                    .toISOString()
                    .slice(11, 16),
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
