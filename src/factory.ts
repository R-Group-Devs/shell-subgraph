import { dataSource } from '@graphprotocol/graph-ts';
import { CollectionCreated, ImplementationRegistered } from '../generated/ShellFactoryDatasource/IShellFactory'
import { Collection, Factory, Implementation } from '../generated/schema';
import { getOrCreateAccount, getOrCreateEngine, getOrCreateFactory } from './entities';
import { IShellFramework } from '../generated/ShellFactoryDatasource/IShellFramework';
import { IShellERC721Datasource, IShellFrameworkDatasource } from '../generated/templates';

export function handleImplementationRegistered(event: ImplementationRegistered): void {
  const implementationId = event.params.implementation.toHexString();

  const factory = getOrCreateFactory(dataSource.address(), event.block.timestamp);
  factory.implementationCount += 1;
  factory.save();

  const implementation = new Implementation(implementationId);
  implementation.name = event.params.name;
  implementation.address = implementationId;
  implementation.collectionCount = 0;
  implementation.nftCount = 0;
  implementation.createdAtTimestamp = event.block.timestamp;
  implementation.save();
}

export function handleCollectionCreated(event: CollectionCreated): void {
  const timestamp = event.block.timestamp;

  // create the factory entity if it doesnt yet exists

  const factory = getOrCreateFactory(dataSource.address(), timestamp);
  factory.collectionCount += 1;
  factory.save();

  // create the new collection entity

  const collectionAddress = event.params.collection;
  const collectionId = collectionAddress.toHexString();
  const collection = new Collection(collectionId);
  const contract = IShellFramework.bind(collectionAddress);

  // update engine and account

  const engine = getOrCreateEngine(contract.installedEngine(), timestamp);
  engine.collectionCount += 1;
  engine.lastInstalledAtTimestamp = timestamp;
  engine.save();

  const creator = getOrCreateAccount(event.transaction.from, timestamp);
  creator.lastSeenAtTimestamp = timestamp;
  creator.createdCollectionsCount += 1;
  creator.save();

  const implementationId = event.params.implementation.toHexString();
  const implementation = Implementation.load(implementationId);
  if (!implementation) throw new Error(`implementation not indexed: ${implementationId}`);
  implementation.collectionCount += 1;
  implementation.save();

  collection.implementation = implementationId;
  collection.name = contract.name();
  collection.symbol = contract.symbol();
  collection.address = collectionId;
  collection.nftCount = 0;
  collection.owner = getOrCreateAccount(contract.owner(), timestamp).id;
  collection.createdAtTimestamp = timestamp;
  collection.lastUpdatedAtTimestamp = timestamp;
  collection.lastActivityAtTimestamp = timestamp;
  collection.factory = factory.id;
  collection.engine = engine.id;
  collection.creator = creator.id;
  collection.save();

  // spawn new datasources
  IShellFrameworkDatasource.create(collectionAddress);
  IShellERC721Datasource.create(collectionAddress);
}
