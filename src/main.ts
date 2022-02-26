(function () {
  function main(stocks: string[], disableTraiding: boolean) {
    if (disableTraiding) return;

    const {
      main: startBuyLowSellHighStrategy,
    } = require("./strategies/buyLowSellHigh");

    const Alpaca = require("@alpacahq/alpaca-trade-api");
    const path = require("path");
    const fs = require("fs");

    const { keyId, secretKey } = require("./config");
    const alpaca = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true,
    });

    let working = false;

    async function startTrading() {
      startBuyLowSellHighStrategy(stocks, alpaca);
    }

    setInterval(() => {
      const dateNow = new Date();
      const finishDate = new Date();
      const startDate = new Date();

      finishDate.setHours(20, 55, 0);
      startDate.setHours(14, 35, 0);

      const timeNow = dateNow.getTime();
      const startTime = startDate.getTime();
      const finishTime = finishDate.getTime();

      if (timeNow >= startTime && timeNow < finishTime && !working) {
        working = true;
        startTrading();

        console.log("trading started");
      }
      if (timeNow >= finishTime && working) {
        let content = JSON.parse(
          fs.readFileSync(path.join(__dirname, "./config.json"), "utf8")
        );
        if (content.closePositionsOnNight) {
          alpaca.closeAllPositions();
          console.log("all positions closed");
        }

        working = false;
        console.log("trading finished");
      }
    }, 1000);
  }

  module.exports = { main };
})();
