import { dataSource } from '@graphprotocol/graph-ts';
import { CollectionCreated, ImplementationRegistered } from '../generated/ShellFactoryDatasource/IShellFactory'
import { Collection, Factory, Implementation } from '../generated/schema';
import { getOrCreateAccount, getOrCreateEngine } from './entities';
import { IShellFramework } from '../generated/ShellFactoryDatasource/IShellFramework';
import { IShellERC721Datasource, IShellFrameworkDatasource } from '../generated/templates';

export function handleImplementationRegistered(event: ImplementationRegistered): void {
  const implementationId = event.params.implementation.toHexString();

  const implementation = new Implementation(implementationId);
  implementation.name = event.params.name;
  implementation.address = implementationId;
  implementation.collectionCount = 0;
  implementation.createdAtTimestamp = event.block.timestamp;
  implementation.save();
}

export function handleCollectionCreated(event: CollectionCreated): void {
  const timestamp  = event.block.timestamp;

  // create the factory entity if it doesnt yet exists

  const factoryAddress = dataSource.address().toHexString();
  const factoryId = factoryAddress;
  let factory = Factory.load(factoryId);
  if (factory == null) {
    factory = new Factory(factoryId);
    factory.address = factoryAddress;
    factory.createdAtTimestamp = timestamp;
    factory.collectionCount = 0;
    factory.nftCount = 0;
  }
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

  collection.implementation = event.params.implementation
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
