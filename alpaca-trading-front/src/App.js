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
  const [portfolioHistoryAll, setPortfolioHistoryAll] = useState();
  const [SPYHistoryMonth, setSPYHistoryMonth] = useState();
  const [SPYHistoryYear, setSPYHistoryYear] = useState();

  const [percentAboveSPY, setPercentAboveSPY] = useState();
  const [percentAboveSPYYear, setPercentAboveSPYYear] = useState();

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
    if (currentGain && SPYHistoryMonth && SPYHistoryYear) {
      const changeSpyPercent = (
        (SPYHistoryMonth[SPYHistoryMonth.length - 1].equity /
          SPYHistoryMonth[0].equity) *
          100 -
        100
      ).toFixed(2);

      const changeSpyPercentYear = (
        (SPYHistoryYear[SPYHistoryYear.length - 1].equity /
          SPYHistoryYear[0].equity) *
          100 -
        100
      ).toFixed(2);

      setPercentAboveSPYYear(
        (currentGain.percent - changeSpyPercentYear).toFixed(2)
      );

      setPercentAboveSPY((currentGain.percent - changeSpyPercent).toFixed(2));
    }
  }, [currentGain, SPYHistoryMonth]);

  useEffect(() => {
    fetch(`${url}api/history/all/1D/true`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryAll(res));

    fetch(`${url}api/history/1M/1D/true`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistory(res));

    fetch(`${url}api/history/1D/5Min/true`)
      .then((res) => res.json())
      .then((res) => setPortfolioHistoryToday(res));

    // const weekDate = new Date();
    // weekDate.setDate(new Date().getDate() - 7);
    // const weekDateStringified = weekDate.toISOString().slice(0, 10);

    // fetch(`${url}api/history/${weekDateStringified}/15Min/false`)
    //   .then((res) => res.json())
    //   .then((res) => setPortfolioHistoryWeek(res));

    const now = new Date();
    now.setDate(new Date().getDate() - 1);
    const nowStringified = now.toISOString().slice(0, 10);

    const monthDate = new Date();
    monthDate.setDate(new Date().getDate() - 30);
    const monthDateStringified = monthDate.toISOString().slice(0, 10);

    const yearDate = new Date();
    yearDate.setFullYear(yearDate.getFullYear() - 1);
    const yearDateStringified = yearDate.toISOString().slice(0, 10);

    fetch(`${url}api/tickers/SPY/${monthDateStringified}/${nowStringified}/1H`)
      .then((res) => res.json())
      .then((res) => setSPYHistoryMonth(res));

    fetch(`${url}api/tickers/SPY/${yearDateStringified}/${nowStringified}/1D`)
      .then((res) => res.json())
      .then((res) => setSPYHistoryYear(res));

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

  return (
    <div className="App">
      {currentGain && (
        <>
          <h2>started from 10000$</h2>

          <div className="current-gain">
            <p>current gain - {currentGain.total}$</p>
            <p className={currentGain.percent >= 0 ? "green" : "red"}>
              {(currentGain.percent >= 0 ? "+" : "") + currentGain.percent}%
            </p>
          </div>
          {percentAboveSPY && (
            <div className="current-gain">
              <p>above SPY this month - </p>
              <p className={percentAboveSPY >= 0 ? "green" : "red"}>
                {(percentAboveSPY >= 0 ? "+" : "") + percentAboveSPY}%
              </p>
            </div>
          )}
          {percentAboveSPYYear && (
            <div className="current-gain">
              <p>above SPY this year - </p>
              <p className={percentAboveSPYYear >= 0 ? "green" : "red"}>
                {(percentAboveSPYYear >= 0 ? "+" : "") + percentAboveSPYYear}%
              </p>
            </div>
          )}
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
          <h3 className="text-align-center">SPY year</h3>
          <Chart
            noPercent
            minTickGap={30}
            data={SPYHistoryYear?.map((item) => {
              return {
                percent: (item.equity * 10).toFixed(2),
                changePercent: (
                  (item.equity / SPYHistoryYear[0].equity) * 100 -
                  100
                ).toFixed(2),
                timestamp: new Date(item.timestamp).toISOString().slice(5, 10),
              };
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">all</h3>
          <Chart
            minTickGap={30}
            data={portfolioHistoryAll?.map((item) => {
              return {
                percent: Number(
                  (((item.equity - 10000) / 10000) * 100).toFixed(2)
                ),
                timestamp: new Date(item.timestamp).toISOString().slice(5, 10),
              };
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">SPY month</h3>
          <Chart
            noPercent
            minTickGap={30}
            data={SPYHistoryMonth?.map((item) => {
              return {
                percent: (item.equity * 10).toFixed(2),
                changePercent: (
                  (item.equity / SPYHistoryMonth[0].equity) * 100 -
                  100
                ).toFixed(2),
                timestamp: new Date(item.timestamp).toISOString().slice(5, 10),
              };
            })}
          ></Chart>
        </div>
        <div className="chart-block">
          <h3 className="text-align-center">month</h3>
          <Chart
            minTickGap={30}
            data={portfolioHistory?.map((item) => {
              return {
                percent: Number(
                  (((item.equity - 10000) / 10000) * 100).toFixed(2)
                ),
                timestamp: new Date(item.timestamp).toISOString().slice(5, 10),
              };
            })}
          ></Chart>
        </div>
        {portfolioHistoryWeek && (
          <div className="chart-block">
            <h3 className="text-align-center">week</h3>

            <Chart
              minTickGap={30}
              data={portfolioHistoryWeek?.map((item) => {
                return {
                  percent: Number(
                    ((((item.equity - 10000) / 10000) * 100) / 2 + 50).toFixed(
                      2
                    )
                  ),
                  timestamp: new Date(item.timestamp)
                    .toISOString()
                    .slice(5, 10),
                };
              })}
            ></Chart>
          </div>
        )}
        <div className="chart-block">
          <h3 className="text-align-center">day</h3>

          <Chart
            minTickGap={15}
            data={portfolioHistoryToday?.map((item) => {
              if (item.equity)
                return {
                  percent: Number(
                    (((item.equity - 10000) / 10000) * 100).toFixed(2)
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
