import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Collection, Factory, Implementation } from "../generated/schema";
import { IShellFramework } from "../generated/templates/IShellFrameworkDatasource/IShellFramework";
import { ZERO_ADDRESS } from "./constants";
import { getOrCreateAccount, getOrCreateEngine, getOrCreateNft } from "./entities";

interface HandleNFTTransfer {
  collectionAddress: Address;
  tokenId: BigInt;
  timestamp: BigInt;
  operator: Address;
  from: Address;
  to: Address;
  amount: BigInt;
}

export const handleNftTransfer = ({ collectionAddress, operator, tokenId, timestamp, from, to, amount }: HandleNFTTransfer) => {
  const nft = getOrCreateNft(collectionAddress, tokenId, timestamp);

  nft.save();
}
