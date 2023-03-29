import { BigNumber } from "ethers";
import { TokenType } from "./consts&enums";
type Address = `0x${string}`;

type FetchTokenResult = {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: {
    formatted: string;
    value: BigNumber;
  };
};
export type TokenInfo = {
  sourceToken: Address;
  tokenType: TokenType;
};
export type TokenData = Omit<FetchTokenResult, "totalSupply" | "address"> & {
  address: string;
  tokenInfo: TokenInfo;
  isPermit: boolean;
};
export type UserTokenData = TokenData & {
  userBalance: string;
};
export type DepositStruct = {
  token: TokenData;
  amount: BigNumber;
};
export type PermitRequest = {
  owner: string;
  spender: string;
  value: BigNumber;
  nonce: BigNumber;
  deadline: BigNumber;
  v: number;
  r: string;
  s: string;
};
export type ClaimStruct = DepositStruct & {
  claimId: number;
  sourceChainId: number;
  targetChainId: number;
  isClaimed: boolean;
};
export type ValidationResult = {
  isSuccess: boolean;
  errorMsg: string;
  validationObj?: any;
};
export type TxStruct = {
  data: string;
  err: string;
};
