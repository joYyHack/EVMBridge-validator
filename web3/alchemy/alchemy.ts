import { Alchemy, Network } from "alchemy-sdk";
import { AlchemyMultichainClient } from "./alchemy-multichain-client";
// Default config to use for all networks.
// Include optional setting overrides for specific networks.
const chainsSetup = {
  // TODO: Replace with your API keys.
  [Network.ETH_SEPOLIA]: { apiKey: process.env.ALCHEMY_SEPOLIA_API_KEY },
  [Network.MATIC_MUMBAI]: { apiKey: process.env.ALCHEMY_MUMBAI_API_KEY },
};

const alchemy = new AlchemyMultichainClient(chainsSetup);

export default alchemy;
