import { dataSource } from '@graphprotocol/graph-ts';
import { CollectionCreated } from '../generated/CollectionFactory/CollectionFactory'
import { Collection, Factory } from '../generated/schema';
import { getOrCreateAccount, getOrCreateEngine } from './entities';

export function handleCollectionCreated(event: CollectionCreated): void {
  const factoryAddress = dataSource.address().toHexString();
  const factoryId = factoryAddress;

  let factory = Factory.load(factoryId);
  if (factory == null) {
    factory = new Factory(factoryId);
    factory.address = factoryAddress;
    factory.createdAtTimestamp = event.block.timestamp;
    factory.collectionCount = 0;
  }
  factory.collectionCount += 1;
  factory.save();

  const address = event.params.collection.toHexString();
  const collection = new Collection(address);

  const engine = getOrCreateEngine(event.params.engine, event.block.timestamp);
  engine.collectionCount += 1;
  // intentionally not setting updated here
  engine.save();

  const creator = getOrCreateAccount(event.transaction.from, event.block.timestamp);
  creator.lastSeenAtTimestamp = event.block.timestamp;
  creator.createdCollectionsCount += 1;
  creator.save();

  collection.name = event.params.name;
  collection.symbol = event.params.symbol;
  collection.address = address;
  collection.createdAtTimestamp = event.block.timestamp;
  collection.lastUpdatedAtTimestamp = event.block.timestamp;
  collection.lastActivityAtTimestamp = event.block.timestamp;
  collection.factory = factory.id;
  collection.engine = engine.id;
  collection.creator = creator.id;
  collection.save();
}
