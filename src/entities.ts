import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Collection, Engine, Factory, Fork, NFT, NFTOwner } from "../generated/schema";
import { IEngine } from '../generated/ShellFactoryDatasource/IEngine';

export const getCollection = (address: Address): Collection => {
  const collection = Collection.load(address.toHexString());
  if (!collection) throw new Error(`collection not indexed: ${address}`);
  return collection;
}

export const getOrCreateFactory = (address: Address, timestamp: BigInt): Factory => {
  const factoryAddress = address.toHexString();
  const factoryId = factoryAddress;
  let factory = Factory.load(factoryId);
  if (factory != null) {
    return factory;
  }

  factory = new Factory(factoryId);
  factory.address = factoryAddress;
  factory.createdAtTimestamp = timestamp;

  factory.save();
  return factory;
}

export const getOrCreateAccount = (address: Address, timestamp: BigInt): Account => {
  const accountId = address.toHexString();
  let account = Account.load(accountId);
  if (account != null) {
    return account;
  }

  account = new Account(accountId);
  account.address = accountId;

  account.save();
  return account;
}

export const getOrCreateFork = (collection: Collection, id: BigInt, timestamp: BigInt): Fork => {
  const forkId = `${collection.id}-fork-${id}`;
  let fork = Fork.load(forkId);
  if (fork != null) {
    return fork;
  }

  fork = new Fork(forkId);
  fork.forkId = id;
  fork.collection = collection.id;
  fork.createdAtTimestamp = timestamp;

  fork.save();
  return fork;
}

export const getOrCreateEngine = (address: Address, timestamp: BigInt): Engine => {
  const engineId = address.toHexString();
  let engine = Engine.load(engineId);
  if (engine != null) {
    return engine;
  }

  const contract = IEngine.bind(address);

  engine = new Engine(engineId);
  engine.address = engineId;
  engine.name = contract.name();
  engine.createdAtTimestamp = timestamp;

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

  nft = new NFT(nftId);
  nft.tokenId = tokenId;
  nft.totalSupply = BigInt.fromI32(0);
  nft.collection = collection.id;
  nft.createdAtTimestamp = timestamp;

  nft.save();
  return nft;
}

export const getOrCreateNFTOwner = (nft: NFT, ownerAddress: Address, timestamp: BigInt): NFTOwner => {
  const owner = getOrCreateAccount(ownerAddress, timestamp);
  const nftOwnerId = `${nft.id}-${owner.id}`;
  let nftOwner = NFTOwner.load(nftOwnerId);
  if (nftOwner != null) {
    return nftOwner;
  }

  nftOwner = new NFTOwner(nftOwnerId);
  nftOwner.nft = nft.id;
  nftOwner.collection = nft.collection;
  nftOwner.owner = owner.id;
  nftOwner.balance = BigInt.fromI32(0);
  nftOwner.createdAtTimestamp = timestamp;

  nftOwner.save();
  return nftOwner;
}

// export const createNftEvent = (nft: NFT, type: string, engine: Engine, event: ethereum.Event): NFTEvent => {
//   const timestamp = event.block.timestamp;

//   const eventId = `${event.transaction.hash.toHexString()}-${event.logIndex}`;
//   const nftEvent = new NFTEvent(eventId);
//   nftEvent.nft = nft.id;
//   nftEvent.collection = nft.collection;
//   nftEvent.eventType = type;
//   nftEvent.operator = getOrCreateAccount(event.transaction.from, timestamp).id;
//   nftEvent.engine = engine.id;
//   nftEvent.createdAtTimestamp = timestamp;

//   nftEvent.save();
//   return nftEvent;
// }

// export const getOrCreateTokenStorageValue = (
//   nft: NFT, location: string, type: string, key: string, timestamp: BigInt): TokenStorageValue =>
// {
//   const storageId = `${nft.id}-${location}-${type}-${key}`;
//   let storage = TokenStorageValue.load(storageId);
//   if (storage != null) {
//     return storage;
//   }

//   storage = new TokenStorageValue(storageId);
//   storage.nft = nft.id;
//   storage.collection = nft.collection;
//   storage.location = location;
//   storage.storageType = type;
//   storage.key = key;
//   storage.createdAtTimestamp = timestamp;

//   storage.save();
//   return storage;
// }
