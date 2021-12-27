import { Address, BigInt, ethereum, store } from "@graphprotocol/graph-ts";
import { Engine } from "../generated/schema";
import { ZERO_ADDRESS } from "./constants";
import { createNftEvent, getOrCreateAccount, getOrCreateEngine, getOrCreateNft, getOrCreateNFTOwner } from "./entities";

// interface HandleNFTTransfer {
//   collectionAddress: Address;
//   tokenId: BigInt;
//   timestamp: BigInt;
//   operator: Address;
//   from: Address;
//   to: Address;
//   amount: BigInt;
// }

export const handleNftTransfer = (
  collectionAddress: Address,
  engineAddress: Address,
  tokenId: BigInt,
  from: Address,
  to: Address,
  amount: BigInt,
  event: ethereum.Event
): void => {
  const timestamp = event.block.timestamp;
  const nft = getOrCreateNft(collectionAddress, tokenId, timestamp);
  const engine = getOrCreateEngine(engineAddress, timestamp);

  const isMint = from.equals(ZERO_ADDRESS);
  const isBurn = to.equals(ZERO_ADDRESS);

  if (isMint) {
    nft.totalSupply = nft.totalSupply.plus(amount);
    const nftEvent = createNftEvent(nft, 'MINT', engine, event);
    nftEvent.to = getOrCreateAccount(to, timestamp).id
    nftEvent.amount = amount;
    nftEvent.save();
  } else if (isBurn) {
    nft.totalSupply = nft.totalSupply.minus(amount);
    const nftEvent = createNftEvent(nft, 'BURN', engine, event);
    nftEvent.from = getOrCreateAccount(from, timestamp).id
    nftEvent.amount = amount;
    nftEvent.save();
  } else {
    const nftEvent = createNftEvent(nft, 'TRANSFER', engine, event);
    nftEvent.to = getOrCreateAccount(to, timestamp).id;
    nftEvent.from = getOrCreateAccount(from, timestamp).id;
    nftEvent.amount = amount;
    nftEvent.save();
  }

  if (!isMint) {
    const fromOwner = getOrCreateNFTOwner(nft, from, timestamp);
    fromOwner.balance = fromOwner.balance.minus(amount);
    if (fromOwner.balance.isZero()) {
      store.remove('NFTOwner', fromOwner.id);
    } else {
      fromOwner.save();
    }
  }

  if (!isBurn) {
    const toOwner = getOrCreateNFTOwner(nft, to, timestamp);
    toOwner.balance = toOwner.balance.plus(amount);
    toOwner.save();
  }

  nft.save();
}
