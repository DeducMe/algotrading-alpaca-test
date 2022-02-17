(function () {
  const express = require("express");
  const app = express();
  const path = require("path");

  const { main } = require("./main");
  const Alpaca = require("@alpacahq/alpaca-trade-api");
  const { keyId, secretKey } = require("./config");
  const alpaca = new Alpaca({
    keyId: keyId,
    secretKey: secretKey,
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

  app.get("/api/history", (req: any, res: any) => {
    const result: {
      timestamp: string;
      equity: number;
      profitLoss: number;
    }[] = [];

    alpaca
      .getPortfolioHistory({
        period: "all",
        timeframe: "15Min",
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

  main();
})();
