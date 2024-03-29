import { CBType, CBTypeFunction } from "../types/receiver";
import { candleStamp } from "../types/tradeTypes";

export function getTradableAssets(
  alpaca: any,
  cb?: CBTypeFunction,
  length?: number,
  crypto?: boolean
) {
  return alpaca.getAssets({ status: "active" }).then((data: any) => {
    let filteredData = data.filter(
      (item: any) =>
        (crypto ? item.class === "crypto" : item.class !== "crypto") &&
        (crypto ? true : item.marginable) &&
        (crypto ? true : item.shortable) &&
        (crypto ? true : item.easy_to_borrow) &&
        item.tradable &&
        item.min_trade_increment < 1
    );

    console.log(!crypto && filteredData.length);

    filteredData.length = length;
    filteredData = filteredData.filter((item: any) => !!item);

    const dataSymbols = filteredData.map((item: any) => item.symbol);

    if (cb) cb({ err: null, data: dataSymbols });

    return dataSymbols;
  });
}

export function getPositions(alpaca: any, cb: CBTypeFunction) {
  return alpaca.getPositions().then((data: any) => {
    const cbData = data.map((item: any) => {
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
    });

    cb({ err: null, data: cbData });
    return cbData;
  });
}

export function getAccount(alpaca: any, cb: CBTypeFunction) {
  alpaca.getAccount().then((account: any) => {
    cb({
      err: null,
      data: {
        total: (account.portfolio_value - 10000).toFixed(2),
        percent: (((account.portfolio_value - 10000) / 10000) * 100).toFixed(2),
      },
    });
  });
}

export async function getTickerHistory(
  alpaca: any,
  cb: CBTypeFunction,
  req: any
) {
  const { params } = req;

  try {
    const bars = alpaca.getBarsV2(params.ticker, {
      start: params.start,
      end: params.end,
      timeframe: params.timeframe,
      limit: 10000,
    });

    const got = [];
    for await (let b of bars) {
      got.push({
        timestamp: b.Timestamp,
        equity: b.ClosePrice,
      });
    }
    cb({ err: null, data: got });
  } catch (e) {
    cb({
      err: null,
      data: "Bad params (try /api/tickers/SPY/2022-06-30/2022-07-07/1D) " + e,
    });
  }
}

export function getPortfolioHistory(alpaca: any, cb: CBTypeFunction, req: any) {
  const result: candleStamp[] = [];
  const { params } = req;

  const periodActive = params.period === "true";
  const stampTiming = periodActive
    ? {
        period: params.stamp_timing,
      }
    : {
        date_start: params.stamp_timing,
      };

  alpaca
    .getPortfolioHistory({
      timeframe: params.timeframe,
      ...stampTiming,
      extended_hours: true,
    })
    .then((item: any) => {
      item.timestamp.forEach((el: any, index: number) => {
        const newObj = {
          timestamp: new Date(el * 1000),
          equity: item.equity[index],
          profitLoss: item.profit_loss[index],
        };
        result.push(newObj);
      });

      cb({ err: null, data: result });
    })
    .catch((err: any) =>
      cb({ err: "Bad params (try /api/history/1M/1D/true)", data: result })
    );
}
