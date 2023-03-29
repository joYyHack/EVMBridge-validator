import { Alchemy, Network } from "alchemy-sdk";
export type Address = `0x${string}`;

export enum TokenType {
  Native = 0,
  Wrapped = 1,
}
interface Networks {
  [chainId: number]: Network;
}

export const networks: Networks = {
  11155111: Network.ETH_SEPOLIA,
  80001: Network.MATIC_MUMBAI,
};

export const supportedChains = [11155111, 80001];

interface IDeploymentAddress {
  bridge: Address;
  erc20safe: Address;
  validator: Address;
}

interface IDeployment {
  [chainId: number]: IDeploymentAddress;
}

export const deployment: IDeployment = {
  11155111 /* sepolia */: {
    bridge: "0x5EAb426BA4398cb951f0aA8C87047bE45E45aaA2",
    erc20safe: "0xEB570d133E97d896a2431332f827F7DA6BCf2e70",
    validator: "0x1278E54A70698d7b3B0A00855b34BE3E2f965a0B",
  },
  80001 /* mumbai */: {
    bridge: "0x5EAb426BA4398cb951f0aA8C87047bE45E45aaA2",
    erc20safe: "0xEB570d133E97d896a2431332f827F7DA6BCf2e70",
    validator: "0x1278E54A70698d7b3B0A00855b34BE3E2f965a0B",
  },
};
