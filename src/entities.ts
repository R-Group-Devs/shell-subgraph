import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Collection, Engine, Factory, NFT, NFTBalance } from "../generated/schema";
import { IEngine } from '../generated/ShellFactoryDatasource/IEngine';
import { IShellERC721 } from '../generated/templates/IShellERC721Datasource/IShellERC721';

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
  factory.collectionCount = 0;
  factory.implementationCount = 0;
  factory.nftCount = 0;
  factory.save();

  return factory;
}

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
  engine.name = contract.getEngineName();
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

  const contract = IShellERC721.bind(collectionAddress);

  nft = new NFT(nftId);
  nft.tokenId = tokenId;
  nft.collection = collection.id;
  nft.owner = getOrCreateAccount(contract.ownerOf(tokenId), timestamp).id;
  nft.createdAtTimestamp = timestamp;
  nft.lastActivityAtTimestamp = timestamp;
  nft.save();
  return nft;
}

export const getOrCreateNFTBalance = (nft: NFT, address: Address, timestamp: BigInt): NFTBalance => {
  const owner = getOrCreateAccount(address, timestamp);
  const balanceId = `${nft.id}-${owner.id}`;
  let balance = NFTBalance.load(balanceId);
  if (balance != null) {
    return balance;
  }
  balance = new NFTBalance(balanceId);
  balance.nft = nft.id;
  balance.balance = BigInt.fromI32(0);
  balance.owner = owner.id;
  balance.lastUpdatedAtTimestamp = timestamp;
  balance.save();

  return balance;
}
