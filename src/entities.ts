import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Collection, Engine, NFT } from "../generated/schema";
import { Collection as CollectionContract } from "../generated/templates/CollectionDatasource/Collection";
import { IEngine } from '../generated/templates/CollectionDatasource/IEngine';

export const getOrCreateAccount = (address: Address, timestamp: BigInt): Account => {
  const id = address.toHexString();
  let account = Account.load(id);
  if (account != null) {
    return account;
  }
  account = new Account(id);
  account.address = id;
  account.createdCollectionsCount = 0;
  account.mintedNftsCount = 0;
  account.ownedNftsCount = 0;
  account.firstSeenAtTimestamp = timestamp;
  account.lastSeenAtTimestamp = timestamp;
  account.save();
  return account;
}

export const getOrCreateEngine = (address: Address, timestamp: BigInt): Engine => {
  const id = address.toHexString();
  let engine = Engine.load(id);
  if (engine != null) {
    return engine;
  }

  const contract = IEngine.bind(address);

  engine = new Engine(id);
  engine.address = id;
  engine.name = contract.name();
  engine.collectionCount = 0;
  engine.mintedNftsCount = 0;
  engine.releasedAtTimestamp = timestamp;
  engine.lastInstalledAtTimestamp = timestamp;
  engine.lastUpdatedAtTimestamp = timestamp;
  engine.save();
  return engine;
}

export const getOrCreateNft = (collectionAddress: Address, tokenId: BigInt, timestamp: BigInt): NFT => {
  const collectionId = collectionAddress.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);

  const nftId = `${collection.id}-${tokenId}`;
  let nft = NFT.load(nftId);
  if (nft != null) {
    return nft;
  }

  const contract = CollectionContract.bind(collectionAddress);

  nft = new NFT(nftId);
  nft.tokenId = tokenId;
  nft.collection = collection.id;
  nft.owner = getOrCreateAccount(contract.ownerOf(tokenId), timestamp).id;
  nft.createdAtTimestamp = timestamp;
  nft.lastActivityAtTimestamp = timestamp;
  nft.save();
  return nft;
}
