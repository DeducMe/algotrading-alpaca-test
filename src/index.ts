(function () {
  const {
    setTrade,
    getHighestLowest,
    getLastTrade,
  } = require("./functions/trading");

  const Alpaca = require("@alpacahq/alpaca-trade-api");
  const { keyId, secretKey } = require("./config");
  const alpaca = new Alpaca({
    keyId: keyId,
    secretKey: secretKey,
    paper: true,
  });

  const getAsset = async (ticker: string, stocksTimeOut: number) => {
    let lastTrade;
    let lastHighest = <number | null>null;
    let lastLowest = <number | null>null;

    let awaitForBuyBars = <boolean>false;
    let awaitForSellBars = <boolean>false;

    let farthestBarBuyTime = <number | null>null;
    let latestBarBuyTime = <number | null>null;
    let tradeLatestBuyBarTime = <number | null>null;

    let farthestBarSellTime = <number | null>null;
    let latestBarSellTime = <number | null>null;
    let tradeLatestSellBarTime = <number | null>null;

    setInterval(async () => {
      const barsForBuy = await getHighestLowest(ticker, alpaca);
      const barsForSell = JSON.parse(JSON.stringify(barsForBuy));
      barsForBuy.length = 20;
      barsForSell.length = 10;

      lastTrade = await getLastTrade(ticker, alpaca);

      farthestBarBuyTime = Date.parse(barsForBuy.responses[0].Timestamp);
      latestBarBuyTime = Date.parse(
        barsForBuy.responses[barsForBuy.responses.length - 1].Timestamp
      );
      if (farthestBarBuyTime === tradeLatestBuyBarTime && awaitForBuyBars) {
        awaitForBuyBars = false;
      }

      farthestBarSellTime = Date.parse(barsForSell.responses[0].Timestamp);
      latestBarSellTime = Date.parse(
        barsForSell.responses[barsForSell.responses.length - 1].Timestamp
      );
      if (farthestBarSellTime === tradeLatestSellBarTime && awaitForSellBars) {
        awaitForSellBars = false;
      }

      // farthestBarTime = barsForBuy.responses[0].Timestamp;

      if (lastLowest && lastHighest) {
        try {
          if (lastLowest > lastTrade && !awaitForBuyBars) {
            setTrade(ticker, "buy", alpaca);

            awaitForBuyBars = true;
            tradeLatestBuyBarTime = latestBarBuyTime;

            console.log(lastLowest, lastHighest, " bought by ", lastTrade);
          }
          if (lastHighest < lastTrade && !awaitForSellBars) {
            setTrade(ticker, "sell", alpaca);

            awaitForSellBars = true;
            tradeLatestSellBarTime = latestBarSellTime;

            console.log(lastLowest, lastHighest, " sold by ", lastTrade);
          }
        } catch (e) {
          console.log(e);
        }
      }

      lastHighest = barsForSell.highest;
      lastLowest = barsForBuy.lowest;

      // console.log(lastHighest, lastLowest, lastTrade, ticker);
    }, stocksTimeOut);
  };

  const stocks = ["AAPL", "MSFT", "TSLA", "AMD", "BABA", "TAL", "COIN"];
  const stocksWatchTimeouts = <any>[];
  let working = false;

  function startTrading() {
    stocks.forEach((item, index) => {
      stocksWatchTimeouts.push(
        setTimeout(() => {
          getAsset(item, stocks.length * 650);
        }, 650 * index)
      );
    });
  }

  console.log("started");
  setInterval(() => {
    const dateNow = new Date();
    const finishDate = new Date();
    const startDate = new Date();

    const timeNow = dateNow.getTime();

    finishDate.setHours(23, 55, 0);
    startDate.setHours(17, 35, 0);

    const startTime = startDate.getTime();
    const finishTime = finishDate.getTime();
    if (timeNow >= startTime && !working) {
      working = true;
      startTrading();

      console.log("trading started");
    }
    if (timeNow >= finishTime && working) {
      alpaca.closeAllPositions();
      stopAllTasks();
      working = false;

      console.log("all tasks finished and positions closed");
    }
  }, 1000);

  function stopAllTasks() {
    stocksWatchTimeouts.map((item: any) => {
      clearTimeout(item);
    });
  }
})();
