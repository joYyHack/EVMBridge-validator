// import { readContract, Address } from "@wagmi/core";
import {
  BigNumber,
  constants,
  Contract,
  ethers,
  providers,
  Wallet,
} from "ethers";
import Validator from "../abi/Validator.json";
import ERC20Safe from "../abi/ERC20Safe.json";
import ERC165 from "../abi/ERC165.json";
import { supportedChains, TokenType } from "../utils/consts&enums";
// import { fetchToken, getNetwork } from "@wagmi/core";
import { deployment, Address, networks } from "../utils/consts&enums";
import alchemy from "../web3/alchemy/alchemy";
import { Interface } from "ethers/lib/utils";
import { sign } from "crypto";

let validatorWalletAddress: Address;
let validatorContractAddress: Address;
let bridgeAddress: Address;
let erc20SafeAddress: Address;

type WithdrawalRequest = {
  validator: string;
  bridge: string;
  from: string;
  amount: BigNumber;
  sourceToken: string;
  sourceTokenSymbol: string;
  sourceTokenName: string;
  isSourceTokenPermit: boolean;
  wrappedToken: string;
  withdrawalTokenType: TokenType;
  nonce: BigNumber;
};

export const getNonce = async (from: Address, chainId: number) => {
  const validator = new Contract(
    deployment[chainId].validator,
    Validator.abi,
    await alchemy.forNetwork(networks[chainId]).config.getProvider()
  );

  return await validator.getNonce(from);
};

export const isPermit = async (token: Address, chainId: number) => {
  const erc20 = new Contract(
    token,
    ERC165.abi,
    await alchemy.forNetwork(networks[chainId]).config.getProvider()
  );

  try {
    const isPermit = await erc20.supportsInterface("0x9d8ff7da");
    return isPermit as boolean;
  } catch {
    return false;
  }
};

export const getWrappedToken = async (sourceToken: string, chainId: number) => {
  const erc20Safe = new Contract(
    deployment[chainId].erc20safe,
    ERC20Safe.abi,
    await alchemy.forNetwork(networks[chainId]).config.getProvider()
  );

  return await erc20Safe.getWrappedToken(sourceToken);
};

export const getTokenNameAndSymbol = async (
  token: Address,
  chainId: number
) => {
  const tokenData = await alchemy
    .forNetwork(networks[chainId])
    .core.getTokenMetadata(token);

  return { name: tokenData.name, symbol: tokenData.symbol };
};

export const createReleaseRequest = async (
  from: Address,
  amount: BigNumber,
  sourceToken: string,
  chainId: number
) => {
  const { name, symbol } = await getTokenNameAndSymbol(
    sourceToken as Address,
    chainId
  );
  const request = {
    validator: new Wallet(process.env.VALIDATOR_PRIV_KEY as string).address,
    bridge: deployment[chainId].bridge,
    from: from.toString(),
    amount,
    sourceToken,
    sourceTokenSymbol: symbol,
    sourceTokenName: name,
    isSourceTokenPermit: await isPermit(sourceToken as Address, chainId),
    wrappedToken: await getWrappedToken(sourceToken, chainId),
    withdrawalTokenType: TokenType.Native,
    nonce: await getNonce(from, chainId),
  } as WithdrawalRequest;

  return await signWithdrawalRequest(request, chainId);
};
export const createWithdrawRequest = async (
  from: Address,
  amount: BigNumber,
  sourceToken: string,
  chainId: number
) => {
  const sourceChainId = supportedChains.find((id) => id != chainId) as number;

  const { name, symbol } = await getTokenNameAndSymbol(
    sourceToken as Address,
    sourceChainId
  );
  const request = {
    validator: new Wallet(process.env.VALIDATOR_PRIV_KEY as string).address,
    bridge: deployment[chainId].bridge,
    from: from.toString(),
    amount,
    sourceToken,
    sourceTokenSymbol: symbol,
    sourceTokenName: name,
    isSourceTokenPermit: await isPermit(sourceToken as Address, sourceChainId),
    wrappedToken: await getWrappedToken(sourceToken, chainId),
    withdrawalTokenType: TokenType.Wrapped,
    nonce: await getNonce(from, chainId),
  } as WithdrawalRequest;

  const sig = await signWithdrawalRequest(request, chainId);
  return { ...request, sig };
};

export const signWithdrawalRequest = async (
  value: WithdrawalRequest,
  chainId: number
) => {
  const provider = await alchemy
    .forNetwork(networks[chainId])
    .config.getProvider();
  const signer = new Wallet(process.env.VALIDATOR_PRIV_KEY as string, provider);
  let domain = {
    name: "Validator",
    version: "0.1",
    chainId: chainId,
    verifyingContract: deployment[chainId].validator,
  };
  const types = {
    WithdrawalRequest: [
      { name: "validator", type: "address" },
      { name: "bridge", type: "address" },
      { name: "from", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "sourceToken", type: "address" },
      { name: "sourceTokenSymbol", type: "string" },
      { name: "sourceTokenName", type: "string" },
      { name: "isSourceTokenPermit", type: "bool" },
      { name: "wrappedToken", type: "address" },
      { name: "withdrawalTokenType", type: "uint8" },
      { name: "nonce", type: "uint256" },
    ],
  };
  const sig = await signer._signTypedData(domain, types, value);

  console.log("domain", domain);
  console.log("value", value);
  return sig;
};
