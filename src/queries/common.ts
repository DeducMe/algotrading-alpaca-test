import { CBType } from '../types/receiver';

export const recieverAlpaca = (req: any, res: any, func: any, alpaca: any) => {
  func(
    alpaca,
    ({ err, data }: CBType) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
      } else res.send(data);
    },
    req,
  );
};
