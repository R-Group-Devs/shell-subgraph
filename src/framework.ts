import { ForkCreated, ForkEngineUpdated, ForkOwnerUpdated, IShellFramework, TokenForkUpdated } from "../generated/ShellFactoryDatasource/IShellFramework";
import { getCollection, getOrCreateAccount, getOrCreateEngine, getOrCreateFork, getOrCreateNft } from "./entities";

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

export function handleForkCreated(event: ForkCreated): void {
  const timestamp = event.block.timestamp;

  const collection = getCollection(event.address);
  const framework = IShellFramework.bind(event.address);
  const fork = getOrCreateFork(collection, event.params.forkId, event.block.timestamp);
  const forkInfo = framework.getFork(fork.forkId);

  const owner = getOrCreateAccount(forkInfo.owner, timestamp);
  const engine = getOrCreateEngine(forkInfo.engine, timestamp);

  fork.owner = owner.id;
  fork.engine = engine.id;
  fork.save();
}

export function handleForkEngineUpdated(event: ForkEngineUpdated): void {
  const timestamp = event.block.timestamp;
  const collection = getCollection(event.address);
  const fork = getOrCreateFork(collection, event.params.forkId, event.block.timestamp);
  const engine = getOrCreateEngine(event.params.engine, timestamp)
  fork.engine = engine.id;
  fork.save();
}

export function handleForkOwnerUpdated(event: ForkOwnerUpdated): void {
  const timestamp = event.block.timestamp;
  const collection = getCollection(event.address);
  const fork = getOrCreateFork(collection, event.params.forkId, event.block.timestamp);
  const account = getOrCreateAccount(event.params.owner, timestamp)
  fork.owner = account.id;
  fork.save();
}

export function handleTokenForkUpdated(event: TokenForkUpdated): void {
  const timestamp = event.block.timestamp;
  const collection = getCollection(event.address);
  const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);
  const fork = getOrCreateFork(collection, event.params.forkId, timestamp);
  nft.fork = fork.id;
  nft.save();
}

// export function handleCollectionIntUpdated(event: CollectionIntUpdated): void {

// }

// export function handleCollectionStringUpdated(event: CollectionStringUpdated): void {

// }

// export function handleTokenIntUpdated(event: TokenIntUpdated): void {
//   const timestamp = event.block.timestamp;
//   const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);
//   nft.lastActivityAtTimestamp = timestamp;
//   nft.save();

//   const storage = getOrCreateTokenStorageValue(
//     nft,
//     storageEnum(event.params.location),
//     'INT',
//     event.params.key,
//     timestamp);
//   storage.intValue = event.params.value;
//   storage.save();
// }

// export function handleTokenStringUpdated(event: TokenStringUpdated): void {
//   const timestamp = event.block.timestamp;
//   const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);
//   nft.lastActivityAtTimestamp = timestamp;
//   nft.save();

//   const storage = getOrCreateTokenStorageValue(
//     nft,
//     storageEnum(event.params.location),
//     'STRING',
//     event.params.key,
//     timestamp);
//   storage.stringValue = event.params.value;
//   storage.save();
// }
