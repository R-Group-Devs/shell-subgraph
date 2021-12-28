import { Collection } from "../generated/schema";
import { CollectionIntUpdated, EngineInstalled, TokenIntUpdated, TokenStringUpdated } from "../generated/ShellFactoryDatasource/IShellFramework";
import { CollectionStringUpdated, OwnershipTransferred } from "../generated/templates/IShellFrameworkDatasource/IShellFramework";
import { getOrCreateAccount, getOrCreateEngine, getOrCreateNft, getOrCreateTokenStorageValue } from "./entities";

const storageEnum = (valueFromEvent: u32): string => {
  switch (valueFromEvent) {
    case 1:
      return 'ENGINE';
    case 2:
      return 'MINT_DATA';
    case 3:
      return 'FRAMEWORK'
  }

  throw new Error(`unexpected storage location value: ${valueFromEvent}`);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.owner = getOrCreateAccount(event.params.newOwner, event.block.timestamp).id;
  collection.save();
}

export function handleEngineInstalled(event: EngineInstalled): void {
  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.engine = getOrCreateEngine(event.params.engine, event.block.timestamp).id;
  collection.save();
}

export function handleCollectionIntUpdated(event: CollectionIntUpdated): void {

}

export function handleCollectionStringUpdated(event: CollectionStringUpdated): void {

}

export function handleTokenIntUpdated(event: TokenIntUpdated): void {
  const timestamp = event.block.timestamp;
  const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);

  const storage = getOrCreateTokenStorageValue(
    nft,
    storageEnum(event.params.location),
    'INT',
    event.params.key,
    timestamp);
  storage.intValue = event.params.value;
  storage.save();
}

export function handleTokenStringUpdated(event: TokenStringUpdated): void {
  const timestamp = event.block.timestamp;
  const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);

  const storage = getOrCreateTokenStorageValue(
    nft,
    storageEnum(event.params.location),
    'STRING',
    event.params.key,
    timestamp);
  storage.stringValue = event.params.value;
  storage.save();
}
