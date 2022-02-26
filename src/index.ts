(function () {
  const express = require("express");
  const app = express();
  const path = require("path");

  const { main } = require("./main");
  const Alpaca = require("@alpacahq/alpaca-trade-api");
  const { keyId, secretKey } = require("./config");
  const fs = require("fs");
  const alpaca = new Alpaca({
    keyId: process.env.KEY_ID || keyId,
    secretKey: process.env.SECRET_KEY || secretKey,
    paper: true,
  });

  app.listen(process.env.PORT || 8080);
  let allowCrossDomain = function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  };
  app.use(allowCrossDomain);
  app.use(
    express.static(path.join(__dirname, "../alpaca-trading-front", "build"))
  );
  app.use(express.static("../alpaca-trading-front/public"));

  app.get("*", (req: any, res: any) => {
    res.sendFile(path.join(__dirname, "../alpaca-trading-front", "build"));
  });

  app.use(express.json());

  app.get("/api/positions", (req: any, res: any) => {
    alpaca.getPositions().then((data: any) => {
      res.send(
        data.map((item: any) => {
          const {
            symbol,
            qty,
            side,
            avg_entry_price,
            current_price,
            market_value,
          } = item;

          return {
            symbol,
            qty,
            side,
            entry_price: Number(avg_entry_price).toFixed(2),
            current_price,
            market_value,
          };
        })
      );
    });
  });

  app.get("/api/current", (req: any, res: any) => {
    alpaca.getAccount().then((account: any) => {
      res.send({
        total: (account.portfolio_value - 100000).toFixed(2),
        percent: (((account.portfolio_value - 100000) / 100000) * 100).toFixed(
          2
        ),
      });
    });
  });

  app.get("/api/history/today", (req: any, res: any) => {
    const result: {
      timestamp: string;
      equity: number;
      profitLoss: number;
    }[] = [];

    alpaca
      .getPortfolioHistory({
        timeframe: "5Min",
        period: "1D",
        extended_hours: true,
      })
      .then((item: any) => {
        item.timestamp.forEach((el: any, index: number) => {
          const newObj = {
            timestamp: new Date(el * 1000).toISOString(),
            equity: item.equity[index],
            profitLoss: item.profit_loss[index],
          };
          result.push(newObj);
        });
        res.send(result);
      });
  });

  app.get("/api/history/week", (req: any, res: any) => {
    const result: {
      timestamp: string;
      equity: number;
      profitLoss: number;
    }[] = [];

    // const nowDate = new Date();
    // const endDate = new Date();
    // endDate.setDate(new Date().getDate() - 5);

    alpaca
      .getPortfolioHistory({
        timeframe: "1H",
        period: "1W",
        // date_start: endDate.toISOString().slice(0, 10),
        extended_hours: true,
      })
      .then((item: any) => {
        item.timestamp.forEach((el: any, index: number) => {
          const newObj = {
            timestamp: new Date(el * 1000).toISOString(),
            equity: item.equity[index],
            profitLoss: item.profit_loss[index],
          };
          result.push(newObj);
        });
        res.send(result);
      })
      .catch((err: any) => console.log(err));
  });

  app.get("/api/history", (req: any, res: any) => {
    const result: {
      timestamp: string;
      equity: number;
      profitLoss: number;
    }[] = [];

    // const nowDate = new Date();

    alpaca
      .getPortfolioHistory({
        timeframe: "1D",
        period: "1M",
        extended_hours: true,
      })
      .then((item: any) => {
        item.timestamp.forEach((el: any, index: number) => {
          const newObj = {
            timestamp: new Date(el * 1000).toISOString(),
            equity: item.equity[index],
            profitLoss: item.profit_loss[index],
          };
          result.push(newObj);
        });
        res.send(result);
      })
      .catch((err: any) => console.log(err));
  });

  app.post("/api/close_positions", (req: any, res: any) => {
    console.log(req.body.disable);

    let content = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./config.json"), "utf8")
    );
    content.closePositionsOnNight = req.body.disable;

    fs.writeFileSync(
      path.join(__dirname, "./config.json"),
      JSON.stringify(content)
    );

    res.send({ disabled: req.body.disable });
  });

  const stocks = ["AAPL", "MSFT", "TSLA", "AMD", "BABA", "TAL", "COIN"];
  main(stocks, true);
})();
