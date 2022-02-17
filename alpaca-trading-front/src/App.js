import "./App.css";
import { useEffect, useState } from "react";
import { Chart } from "./components/Chart";

function App() {
  const [portfolioHistory, setPortfolioHistory] = useState();
  const [currentGain, setCurrentGain] = useState();

  useEffect(() => {
    console.log("a");
    fetch("http://localhost:8080/api/history")
      .then((res) => res.json())
      .then((res) => setPortfolioHistory(res));

    fetch("http://localhost:8080/api/current")
      .then((res) => res.json())
      .then((res) => setCurrentGain(res));
  }, []);

  return (
    <div className="App">
      {currentGain && (
        <>
          <div className="current-gain">
            <p>current gain - {currentGain.total}$</p>
            <p className={currentGain.percent >= 0 ? "green" : "red"}>
              {currentGain.percent >= 0 && "+" + currentGain.percent}%
            </p>
          </div>
        </>
      )}
      <p>started from 10000$</p>
      {console.log(portfolioHistory)}
      <Chart
        data={portfolioHistory?.map((item) => {
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
