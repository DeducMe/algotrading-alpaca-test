import { getTradableAssets } from './queries/getQueries';
import { buyLowSellHighWebhook } from './strategies/buyLowSellHighHooks';

(function () {
  const initialTickers = ['BTCUSD', 'DOGEUSD', 'USDTUSD', 'ETHUSD'];

  function testWebsockets(alpaca: any) {
    /**
     * This example shows how to use the Alpaca Data V2 websocket to subscribe to events.
     * The socket is available under the `data_steam_v2` property on an Alpaca instance.
     * There are separate functions for subscribing (and unsubscribing) to trades, quotes and bars as seen below.
     */

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

      constructor({ tickers }:{ tickers:string[] }) {
        const socket = alpaca.crypto_stream_v2;
        this.socket = socket;
        // console.log(alpaca);

        this.subscriptions = socket.session.subscriptions;

        socket.onConnect(() => {
          console.log('Connected!');
          // socket.subscribeForQuotes(tickers);
          socket.subscribeForTrades(tickers);
          // socket.subscribeForBars(tickers);
        });

        socket.onError((err: any) => {
          console.log(err);
        });

        socket.onCryptoTrade((trade: any) => {
          // console.log(trade);
        });

        socket.onStateChange((state: any) => {
          console.log(state, 'state');
        });

        socket.onDisconnect(() => {
          console.log('Disconnected');
        });

        socket.connect();

        // unsubscribe from FB after a second
        setInterval(() => {
          // console.log(this.subscriptions);
        }, 1000);
      }
    }

    function onCreate() {
      getTradableAssets(alpaca, undefined, 26).then((data:any) => {
        const newTickers = initialTickers.concat(data);

        const stream = new DataStream({ tickers: newTickers });

        buyLowSellHighWebhook(alpaca, stream.socket, newTickers);
      });
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
