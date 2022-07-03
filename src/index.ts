import { getPortfolioHistory } from './queries/getQueries';

(function () {
  if (process.env.DISABLE) return;
  const express = require('express');
  const app = express();
  const path = require('path');
  const { getPositions, getAccount } = require('./queries/getQueries');
  const { recieverAlpaca } = require('./queries/common');

  const { main, testWebsockets } = require('./main');
  const Alpaca = require('@alpacahq/alpaca-trade-api');
  const { keyId, secretKey } = require('./config');
  const fs = require('fs');
  const alpaca = new Alpaca({
    keyId: process.env.KEY_ID || keyId,
    secretKey: process.env.SECRET_KEY || secretKey,
    paper: true,
  });

  app.listen(process.env.PORT || 8080);
  const allowCrossDomain = function (req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  };
  app.use(allowCrossDomain);
  app.use(
    express.static(path.join(__dirname, '../alpaca-trading-front', 'build')),
  );
  app.use(express.static('../alpaca-trading-front/public'));

  app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../alpaca-trading-front', 'build'));
  });

  app.use(express.json());

  app.get('/api/positions', (req: any, res: any) => recieverAlpaca(req, res, getPositions, alpaca));

  app.get('/api/current', (req: any, res: any) => {
    recieverAlpaca(req, res, getAccount, alpaca);
  });
  app.get(
    '/api/history/:stamp_timing/:timeframe/:period',
    (req: any, res: any) => {
      recieverAlpaca(req, res, getPortfolioHistory, alpaca);
    },
  );
  app.get('/api/close_positions', (req: any, res: any) => {
    const content = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/config.json'), 'utf8'),
    );
    res.send({ disabled: content.closePositionsOnNight });
  });

  app.post('/api/close_positions', (req: any, res: any) => {
    const content = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/config.json'), 'utf8'),
    );
    content.closePositionsOnNight = req.body.disable;

    fs.writeFileSync(
      path.join(__dirname, '../public/config.json'),
      JSON.stringify(content),
    );

    res.send({ disabled: req.body.disable });
  });

  const stocks = ['AAPL', 'MSFT', 'TSLA', 'AMD', 'BABA', 'TAL', 'COIN'];
  // main(stocks, false);
  testWebsockets(alpaca);
}());
