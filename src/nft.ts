import { Address, BigInt, ethereum, store } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS } from "./constants";
import { getCollection, getOrCreateFork, getOrCreateNft, getOrCreateNFTOwner } from "./entities";


export const handleNftTransfer = (
  collectionAddress: Address,
  tokenId: BigInt,
  from: Address,
  to: Address,
  amount: BigInt,
  event: ethereum.Event
): void => {
  const timestamp = event.block.timestamp;
  const nft = getOrCreateNft(collectionAddress, tokenId, timestamp);
  nft.lastActivityAtTimestamp = timestamp;
  const collection = getCollection(collectionAddress);
  collection.lastActivityAtTimestamp = timestamp;

  const isMint = from.equals(ZERO_ADDRESS);
  const isBurn = to.equals(ZERO_ADDRESS);

  if (isMint) {
    nft.totalSupply = nft.totalSupply.plus(amount);
    const fork = getOrCreateFork(collection, BigInt.fromI32(0), timestamp);
    nft.fork = fork.id;
    fork.nftCount += 1;
    fork.save();
    // TODO: NFT event
  } else if (isBurn) {
    nft.totalSupply = nft.totalSupply.minus(amount);
    // TODO: NFT event
  } else /* is transfer */ {
    // TODO: NFT event
  }

  if (!isMint) {
    const fromOwner = getOrCreateNFTOwner(nft, from, timestamp);
    fromOwner.balance = fromOwner.balance.minus(amount);
    fromOwner.lastActivityAtTimestamp = timestamp;
    if (fromOwner.balance.isZero()) {
      store.remove('NFTOwner', fromOwner.id);
    } else {
      fromOwner.save();
    }
  }

  if (!isBurn) {
    const toOwner = getOrCreateNFTOwner(nft, to, timestamp);
    toOwner.balance = toOwner.balance.plus(amount);
    toOwner.lastActivityAtTimestamp = timestamp;
    toOwner.save();
  }

  collection.save();
  nft.save();
}
