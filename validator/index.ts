import { BigNumber, Contract, Wallet } from "ethers";
import ERC165 from "../abi/ERC165.json";
import ERC20Safe from "../abi/ERC20Safe.json";
import Validator from "../abi/Validator.json";
import { ERC20SafeHandler, IERC165, IValidator } from "../typechain-types";
import {
  Address,
  PERMIT_FUNCTION_SELECTOR,
  TokenType,
  deployment,
  networks,
  supportedChains,
} from "../utils/consts&enums";
import alchemy from "../web3/alchemy/alchemy";

type WithdrawalRequest = IValidator.WithdrawalRequestStruct;

export const provider = async (chainId: number) =>
  await alchemy.forNetwork(networks[chainId]).config.getProvider();

export const signer = async (chainId: number) =>
  new Wallet(process.env.VALIDATOR_PRIV_KEY as string, await provider(chainId));

export const getNonce = async (from: Address, chainId: number) => {
  const validator = new Contract(
    deployment.validator,
    Validator.abi,
    await provider(chainId)
  ) as IValidator;

  return await validator.getNonce(from);
};

export const isPermit = async (token: Address, chainId: number) => {
  const erc20 = new Contract(
    token,
    ERC165.abi,
    await provider(chainId)
  ) as IERC165;

  try {
    const isPermit = await erc20.supportsInterface(PERMIT_FUNCTION_SELECTOR);
    return isPermit as boolean;
  } catch {
    return false;
  }
};

export const getWrappedToken = async (sourceToken: string, chainId: number) => {
  const erc20Safe = new Contract(
    deployment.erc20safe,
    ERC20Safe.abi,
    await provider(chainId)
  ) as ERC20SafeHandler;

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
    validator: process.env.VALIDATOR_PUB_KEY,
    bridge: deployment.bridge,
    from: from,
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
    validator: process.env.VALIDATOR_PUB_KEY,
    bridge: deployment.bridge,
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
  let domain = {
    name: "Validator",
    version: "0.1",
    chainId: chainId,
    verifyingContract: deployment.validator,
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
  const validator = await signer(chainId);
  const sig = await validator._signTypedData(domain, types, value);

  return sig;
};
