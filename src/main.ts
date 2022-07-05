import { getTradableAssets } from './queries/getQueries';
import { buyLowSellHighWebhook } from './strategies/buyLowSellHighHooks';

(function () {
  const initialTickers = <string[]>['BTCUSD'];
  const initialStockTickers = <string[]>['AAPL', 'MSFT', 'TSLA', 'AMD', 'BABA', 'TAL', 'COIN'];

  function testWebsockets(alpaca: any) {
    class DataStream {
      subscriptions: {
        trades: any[];
        quotes: any[];
        bars: any[];
        dailyBars: any[];
        statuses: any[];
        lulds: any[];
        cancelErrors: any[];
        corrections: any[];
      };

      socket: any;

      stockSocket:any;

      constructor({ cryptoTickers, stockTickers }:{ cryptoTickers:string[]; stockTickers:string[] }) {
        const socket = alpaca.crypto_stream_v2;
        const stockSocket = alpaca.data_stream_v2;

        this.socket = socket;
        this.stockSocket = stockSocket;

        // console.log(alpaca);

        this.subscriptions = socket.session.subscriptions;

        socket.onConnect(() => {
          console.log('Connected crypto!');
          socket.subscribeForTrades(cryptoTickers);
        });

        stockSocket.onConnect(() => {
          console.log('Connected stocks!');
          stockSocket.subscribeForTrades(stockTickers);
        });

        socket.onError((err: any) => {
          console.log(err, 'err crypto');
        });
        stockSocket.onError((err: any) => {
          console.log(err, 'err stock');
        });

        socket.onStateChange((state: any) => {
          console.log(state, 'state crypto');
        });
        stockSocket.onStateChange((state: any) => {
          console.log(state, 'state stock');
        });

        socket.onDisconnect(() => {
          console.log('Disconnected crypto');
          // socket.disconnect();
          setTimeout(() => {
            socket.connect();
          }, 10000);
        });
        stockSocket.onDisconnect(() => {
          console.log('Disconnected stock');
          // stockSocket.disconnect();
          setTimeout(() => {
            stockSocket.connect();
          }, 10000);
        });

        socket.connect();
        stockSocket.connect();
      }
    }

    async function onCreate() {
      const stockTickers = await getTradableAssets(alpaca, undefined, 15 - initialStockTickers.length, false);
      const newStockTickers = initialStockTickers.concat(stockTickers);

      const tickers = await getTradableAssets(alpaca, undefined, 15 - initialTickers.length, true);
      const newTickers = initialStockTickers.concat(tickers);

      const stream = new DataStream({ cryptoTickers: newTickers, stockTickers: newStockTickers });
      if (stockTickers.length) buyLowSellHighWebhook(alpaca, stream.stockSocket, newStockTickers, true);
      if (tickers.length) buyLowSellHighWebhook(alpaca, stream.socket, newTickers, false);
    }

    onCreate();
  }

  function main(stocks: string[], disableTraiding: boolean) {
    if (disableTraiding) return;

    const {
      main: startBuyLowSellHighStrategy,
    } = require('./strategies/buyLowSellHigh');

    const Alpaca = require('@alpacahq/alpaca-trade-api');
    const path = require('path');
    const fs = require('fs');

    const { keyId, secretKey } = require('./config');
    const alpaca = new Alpaca({
      keyId,
      secretKey,
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

        console.log('trading started');
      }
      if (timeNow >= finishTime && working) {
        const content = JSON.parse(
          fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'),
        );
        if (content.closePositionsOnNight) {
          alpaca.closeAllPositions();
          console.log('all positions closed');
        }

        working = false;
        console.log('trading finished');
      }
    }, 1000);
  }

  module.exports = { main, testWebsockets };
}());
