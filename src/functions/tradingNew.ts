/* eslint-disable no-restricted-syntax */

function timeNow(minusHours?: number, minus15MinutesActive?:boolean) {
  const minusMiliSeconds = 60 * 60 * 1000 * (minusHours || 0);
  const minus15Minutes = minus15MinutesActive ? 60 * 1000 * 20 : 0;
  const date = new Date();

  return new Date(
    date.getTime() - minusMiliSeconds - minus15Minutes,
  ).toISOString();
}

export const setTrade = async (
  ticker: string,
  tradeWay: string,
  price: number,
  alpaca: any,
) => {
  try {
    const { getPositions } = require('../queries/getQueries');

    const account = await alpaca.getAccount();

    const positions = await getPositions(alpaca, () => {});
    const openedPosition = positions.find((item:any) => item.symbol === ticker);
    const closePosition = openedPosition ? openedPosition.side !== tradeWay : false;

    await alpaca.createOrder({
      symbol: ticker,
      qty: closePosition ? openedPosition.qty : (account.cash * 0.1) / price,
      side: tradeWay,
      type: 'market',
      time_in_force: 'gtc',
    });
  } catch (e) {
    console.log(e, 'cant create order');
  }
};

export function compareHighestLowestToCurrent(
  { highPrice, lowPrice, currentPrice }:
  { highPrice:number; lowPrice:number; currentPrice:number },
) {
  if (highPrice < currentPrice) return { highPrice: currentPrice, lowPrice };
  if (lowPrice > currentPrice) return { highPrice, lowPrice: currentPrice };

  return { highPrice, lowPrice };
}

export async function getHighestLowest(ticker: string, alpaca: any) {
  console.log(ticker);
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
export async function getHighestLowestCrypto(ticker: string, alpaca: any) {
  const date1HourAgo = timeNow(1.7);
  const dateNowTime = timeNow();
  const resp = alpaca.getCryptoBars(
    ticker,
    {
      start: date1HourAgo,
      end: dateNowTime,
      timeframe: '5Min',
    },
    alpaca.configuration,
  );

  const responses: any[] = [];
  try {
    for await (const bar of resp) {
      const responseIndex = responses.findIndex(item => item.Timestamp === bar.Timestamp);
      const response = responses[responseIndex];
      if (response) {
        if (response.Low < bar.Low) {
          bar.Low = response.Low;
        }
        if (response.High > bar.High) {
          bar.High = response.High;
        }

        responses[responseIndex] = bar;
      } else { responses.push(bar); }
    }
  } catch {}

  return {
    responses,
  };
}
