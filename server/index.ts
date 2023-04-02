import { BigNumber } from "alchemy-sdk";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { Address } from "../utils/consts&enums";
import * as validator from "../validator";

dotenv.config();

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT;

app.post(
  "/api/v1/createWithdrawRequest",
  async (req: Request, res: Response) => {
    const { from, amount, sourceToken, chainId } = req.body;

    const data = await validator.createWithdrawRequest(
      from as Address,
      BigNumber.from(amount),
      sourceToken as Address,
      chainId as number
    );

    res.json({
      sourceTokenSymbol: data.sourceTokenSymbol,
      sourceTokenName: data.sourceTokenName,
      isSourceTokenPermit: data.isSourceTokenPermit,
      sig: data.sig,
    });
  }
);

app.post(
  "/api/v1/createReleaseRequest",
  async (req: Request, res: Response) => {
    const { from, amount, sourceToken, chainId } = req.body;

    const sig = await validator.createReleaseRequest(
      from as Address,
      BigNumber.from(amount),
      sourceToken as Address,
      chainId as number
    );

    res.json({ sig });
  }
);

app.listen(port, () => {
  console.log(
    `⚡️[server]: Server test is running at http://localhost:${port}`
  );
});
