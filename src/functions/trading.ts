/* eslint-disable no-restricted-syntax */
(function () {
  const axios = require('axios');
  const { keyId, secretKey } = require('../config');
  const { getPositions } = require('../queries/getQueries');

  const setTrade = async (
    ticker: string,
    tradeWay: string,
    price: number,
    alpaca: any,
  ) => {
    try {
      const account = await alpaca.getAccount();

      const positions = await getPositions(alpaca, () => {});
      const openedPosition = positions.find((item:any) => item.symbol === ticker);

      await alpaca.createOrder({
        symbol: ticker,
        qty: openedPosition?.side !== tradeWay ? openedPosition.qty : Math.round((account.buying_power * 0.1) / price),
        side: tradeWay,
        type: 'market',
        time_in_force: 'day',
      });
    } catch (e) {
      console.log(e, 'cant create order');
    }
  };

  function timeNow(minusHours?: number) {
    const minusMiliSeconds = 60 * 60 * 1000 * (minusHours || 0);
    const minus15Minutes = 60 * 1000 * 20;
    const date = new Date();

    return new Date(
      date.getTime() - minusMiliSeconds - minus15Minutes,
    ).toISOString();
  }

  async function getHighestLowest(ticker: string, alpaca: any) {
    const date1HourAgo = timeNow(70);
    const dateNowTime = timeNow();
    const resp = alpaca.getBarsV2(
      ticker,
      {
        start: date1HourAgo,
        end: dateNowTime,
        timeframe: '15Min',
        adjustment: 'all',
      },
      alpaca.configuration,
    );

    let lowest = 9999999999;
    let highest = 0;
    const responses = [];

    for await (const bar of resp) {
      responses.push(bar);
      if (bar.LowPrice < lowest) {
        lowest = bar.LowPrice;
      }
      if (bar.HighPrice > highest) {
        highest = bar.HighPrice;
      }
    }

    return {
      lowest,
      highest,
      responses,
    };
  }

  async function getLastTrade(ticker: string) {
    return axios
      .get(`https://data.alpaca.markets/v2/stocks/${ticker}/trades/latest`, {
        headers: {
          'APCA-API-KEY-ID': keyId,
          'APCA-API-SECRET-KEY': secretKey,
        },
      })
      .then((response: any) => response.data.trade.p);
  }

  module.exports = {
    setTrade, timeNow, getHighestLowest, getLastTrade,
  };
}());
