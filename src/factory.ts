import { dataSource } from '@graphprotocol/graph-ts';
import { CollectionCreated } from '../generated/CollectionFactory/CollectionFactory'
import { Collection, Factory } from '../generated/schema';
import { getOrCreateAccount, getOrCreateEngine } from './entities';

export function handleCollectionCreated(event: CollectionCreated): void {
  const factoryId = dataSource.address().toHexString();

  let factory = Factory.load(factoryId);
  if (factory == null) {
    factory = new Factory(factoryId);
    factory.createdAtBlock = event.block.number;
    factory.createdAtTimestamp = event.block.timestamp;
    factory.createdAtTransactionHash = event.transaction.hash.toHexString();
    factory.collectionCount = 0;
  }
  factory.collectionCount += 1;
  factory.save();

  const address = event.params.collection.toHexString();
  const collection = new Collection(address);

  collection.factory = factory.id;
  collection.engine = getOrCreateEngine(event.params.engine).id;
  collection.name = event.params.name;
  collection.symbol = event.params.symbol;
  collection.address = address;

  collection.creator = getOrCreateAccount(event.transaction.from).id
  collection.createdAtBlock = event.block.number;
  collection.createdAtTimestamp = event.block.timestamp;
  collection.createdAtTransactionHash = event.transaction.hash.toHexString();

  collection.save();
}
