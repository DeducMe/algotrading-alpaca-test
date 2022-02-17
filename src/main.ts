(function () {
  function main() {
    const {
      main: startBuyLowSellHighStrategy,
    } = require("./strategies/buyLowSellHigh");

    const Alpaca = require("@alpacahq/alpaca-trade-api");
    const { keyId, secretKey } = require("./config");
    const alpaca = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true,
    });

    const stocks = ["AAPL", "MSFT", "TSLA", "AMD", "BABA", "TAL", "COIN"];
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
        alpaca.closeAllPositions();
        working = false;

        console.log("all positions closed");
      }
    }, 1000);
  }

  module.exports = { main };
})();
