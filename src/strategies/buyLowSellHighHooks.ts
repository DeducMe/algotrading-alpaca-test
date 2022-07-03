/* eslint-disable no-restricted-syntax */
import moment from 'moment';
import {
  compareHighestLowestToCurrent, getHighestLowest, getHighestLowestCrypto, setTrade,
} from '../functions/tradingNew';
import { getTradableAssets } from '../queries/getQueries';

export type TradeType = {
  T: string;
  Symbol: string;
  Exchange: string;
  Price: number;
  Size: number;
  Timestamp: Date;
  ID: number;
  TakerSide: string;
};

export type TradeBar = {
  startTimestamp: Date | null;
  highPrice: number | null;
  lowPrice: number | null;
};

export type LowestHighest = { lowPrice: number; highPrice: number };

class TradingClass {
  bars:any;

  awaitForNextSellBar:any;

  awaitForNextBuyBar:any;

  lowestHighest:any;

  readyToTrade:boolean;

  constructor({ alpaca, socket, tickers } :any) {
    console.log(tickers);
    // setTrade('BTCUSD', 'buy', 19225, alpaca);

    const initialLowesHighest = { lowPrice: 999999, highPrice: 0 };

    this.readyToTrade = false;

    this.bars = tickers.reduce((acc:any, ticker:string) => {
      acc[ticker] = [];
      return acc;
    }, {});
    this.awaitForNextBuyBar = tickers.reduce((acc:any, ticker:string) => {
      acc[ticker] = false;
      return acc;
    }, {});
    this.awaitForNextSellBar = tickers.reduce((acc:any, ticker:string) => {
      acc[ticker] = false;
      return acc;
    }, {});

    this.lowestHighest = tickers.reduce((acc:any, ticker:string) => {
      acc[ticker] = initialLowesHighest;
      return acc;
    }, {});

    const calculateLastLowestHighest = (ticker:string) => {
      // я такого никогда в жизни не видел
      // оказывается в жс можно передать в редусер константу и она будет изменяться
      const copyInitialLowesHighest = JSON.parse(JSON.stringify(initialLowesHighest));
      if (!this.bars[ticker].length) return copyInitialLowesHighest;
      return this.bars[ticker].reduce((acc:LowestHighest, item:TradeBar) => {
        if (!item.highPrice || !item.lowPrice) return acc;

        if (acc.highPrice < item.highPrice) { acc.highPrice = item.highPrice; }
        if (acc.lowPrice > item.lowPrice) { acc.lowPrice = item.lowPrice; }
        return acc;
      }, copyInitialLowesHighest);
    };

    const onCreate = async () => {
      const promiseArr = tickers.map((item:string) => getHighestLowestCrypto(item, alpaca));
      for await (const bar of promiseArr) {
        const {
          responses,
        } = bar;

        if (responses.length) {
          const ticker = responses[0].Symbol;

          this.bars[ticker].push(...responses.map((item:any) => ({
            highPrice: item.High,
            lowPrice: item.Low,
            startTimestamp: item.Timestamp,
          })));
        }
      }

      tickers.forEach((ticker:string) => {
        this.bars[ticker].length = 20;
        this.bars[ticker] = this.bars[ticker].filter((item:any) => !!item);

        this.lowestHighest[ticker] = calculateLastLowestHighest(ticker);
      });

      this.readyToTrade = true;
    };
    onCreate();

    const calculateBars = (trade:TradeType) => {
      const ticker = trade.Symbol;
      if (!this.bars[ticker].length) {
        this.bars[ticker].push({
          highPrice: 0,
          lowPrice: 99999999999999,
          currentPrice: trade.Price,
        });
      }

      let currentBar = this.bars[ticker][this.bars[ticker].length - 1];
      if (!currentBar.startTimestamp) currentBar.startTimestamp = trade.Timestamp;
      if (moment(currentBar.startTimestamp).toDate() <= moment(trade.Timestamp).subtract(5, 'm').toDate()) {
        this.bars[ticker].shift();
        this.bars[ticker].push(currentBar);
        this.awaitForNextBuyBar[ticker] = false;
        this.awaitForNextSellBar[ticker] = false;
        this.lowestHighest[ticker] = calculateLastLowestHighest(ticker);
        this.bars[ticker][this.bars[ticker].length - 1].startTimestamp = trade.Timestamp;
        currentBar = this.bars[ticker][this.bars[ticker].length - 1];
      }

      const currentHighestLowest = compareHighestLowestToCurrent(
        {
          highPrice: currentBar.highPrice || 0,
          lowPrice: currentBar.lowPrice || 99999999999999,
          currentPrice: trade.Price,
        },
      );

      this.bars[trade.Symbol][this.bars[trade.Symbol].length - 1].highPrice = currentHighestLowest.highPrice;
      this.bars[trade.Symbol][this.bars[trade.Symbol].length - 1].lowPrice = currentHighestLowest.lowPrice;
    };

    socket.onCryptoTrade((trade: TradeType) => {
      if (!this.readyToTrade) return;

      calculateBars(trade);
      const lastTrade = trade.Price;
      const ticker = trade.Symbol;

      if (this.awaitForNextBuyBar[ticker]) return;
      if (this.lowestHighest[ticker].lowPrice > lastTrade) {
        this.awaitForNextBuyBar[ticker] = true;
        setTrade(trade.Symbol, 'buy', lastTrade, alpaca);

        console.log(
          this.lowestHighest[ticker],
          trade.Symbol,
          'bought by',
          lastTrade,
        );
      }

      if (this.awaitForNextSellBar[ticker]) return;

      if (this.lowestHighest[ticker].highPrice < lastTrade) {
        this.awaitForNextSellBar[ticker] = true;

        setTrade(trade.Symbol, 'sell', lastTrade, alpaca);

        console.log(
          this.lowestHighest[ticker],
          trade.Symbol,
          'sold by',
          lastTrade,
        );
      }
    });
  }
}

export function buyLowSellHighWebhook(alpaca:any, socket:any, tickers:string[]) {
  const tradingClass = new TradingClass({ alpaca, socket, tickers });
}
