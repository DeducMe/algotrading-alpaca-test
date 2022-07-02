(function () {
  const {
    setTrade,
    getHighestLowest,
    getLastTrade,
  } = require('../functions/trading');

  function main(stocks: string[], alpaca: any) {
    const stocksWatchIntervals = <any>[];

    const timeInterval = setInterval(() => {
      const dateNow = new Date();
      const finishDate = new Date();

      finishDate.setHours(20, 55, 0);

      const timeNow = dateNow.getTime();
      const finishTime = finishDate.getTime();

      if (timeNow >= finishTime) {
        stopAllTasks();

        console.log('buyLowSellHigh finished');
      }
    }, 1000);

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

      stocksWatchIntervals.push(
        setInterval(async () => {
          const barsForBuy = await getHighestLowest(ticker, alpaca);
          const barsForSell = JSON.parse(JSON.stringify(barsForBuy));
          barsForBuy.length = 20;
          barsForSell.length = 10;

          lastTrade = await getLastTrade(ticker, alpaca);

          farthestBarBuyTime = Date.parse(barsForBuy.responses[0].Timestamp);
          latestBarBuyTime = Date.parse(
            barsForBuy.responses[barsForBuy.responses.length - 1].Timestamp,
          );
          if (farthestBarBuyTime === tradeLatestBuyBarTime && awaitForBuyBars) {
            awaitForBuyBars = false;
          }

          farthestBarSellTime = Date.parse(barsForSell.responses[0].Timestamp);
          latestBarSellTime = Date.parse(
            barsForSell.responses[barsForSell.responses.length - 1].Timestamp,
          );
          if (
            farthestBarSellTime === tradeLatestSellBarTime
            && awaitForSellBars
          ) {
            awaitForSellBars = false;
          }

          if (lastLowest && lastHighest) {
            try {
              if (lastLowest > lastTrade && !awaitForBuyBars) {
                setTrade(ticker, 'buy', lastTrade, alpaca);

                awaitForBuyBars = true;
                tradeLatestBuyBarTime = latestBarBuyTime;

                console.log(
                  lastLowest,
                  lastHighest,
                  ticker,
                  'bought by',
                  lastTrade,
                );
              }
              if (lastHighest < lastTrade && !awaitForSellBars) {
                setTrade(ticker, 'sell', lastTrade, alpaca);

                awaitForSellBars = true;
                tradeLatestSellBarTime = latestBarSellTime;

                console.log(
                  lastLowest,
                  lastHighest,
                  ticker,
                  'sold by',
                  lastTrade,
                );
              }
            } catch (e) {
              console.log(e);
            }
          }

          lastHighest = barsForSell.highest;
          lastLowest = barsForBuy.lowest;

          // console.log(lastHighest, lastLowest, lastTrade, ticker);
        }, stocksTimeOut),
      );
    };

    function startTrading() {
      stocks.forEach((item, index) => {
        setTimeout(() => {
          getAsset(item, stocks.length * 650);
        }, 650 * index);
      });
    }

    function stopAllTasks() {
      stocksWatchIntervals.forEach((item: any) => {
        clearTimeout(item);
      });
      clearInterval(timeInterval);
    }

    startTrading();
  }

  module.exports = { main };
}());
