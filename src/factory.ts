import { ByteArray, dataSource, Bytes } from '@graphprotocol/graph-ts';
import { Collection, Implementation } from '../generated/schema';
import { CollectionCreated, ImplementationRegistered, OwnershipTransferred } from '../generated/ShellFactoryDatasource/IShellFactory'
import { IShellFramework } from '../generated/ShellFactoryDatasource/IShellFramework';
import { IERC721 } from '../generated/ShellFactoryDatasource/IERC721';
import { IERC1155 } from '../generated/ShellFactoryDatasource/IERC1155';
import { getOrCreateAccount, getOrCreateEngine, getOrCreateFactory } from './entities';
import { IShellERC721Datasource, IShellERC1155Datasource, IShellFrameworkDatasource } from '../generated/templates';

const ERC721_INTERFACE_ID = Bytes.fromByteArray(Bytes.fromHexString('0x80ac58cd'));
const ERC1155_INTERFACE_ID = Bytes.fromByteArray(Bytes.fromHexString('0xd9b67a26'));

export function handleImplementationRegistered(event: ImplementationRegistered): void {
  const implementationId = event.params.implementation.toHexString();

  const factory = getOrCreateFactory(dataSource.address(), event.block.timestamp);

  const implementation = new Implementation(implementationId);
  implementation.name = event.params.name;
  implementation.address = implementationId;
  implementation.factory = factory.id;
  implementation.createdAtTimestamp = event.block.timestamp;

  implementation.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const factory = getOrCreateFactory(event.address, event.block.timestamp);
  factory.owner = getOrCreateAccount(event.params.newOwner, event.block.timestamp).id;
  factory.save();
}

export function handleCollectionCreated(event: CollectionCreated): void {
  const timestamp = event.block.timestamp;

  // create the new collection entity
  const collectionAddress = event.params.collection;
  const collectionId = collectionAddress.toHexString();
  const collection = new Collection(collectionId);
  const contract = IShellFramework.bind(collectionAddress);

  collection.name = contract.name();
  collection.symbol = contract.symbol();
  collection.address = collectionId;
  collection.nftCount = 0;

  // update engine and account

  const engine = getOrCreateEngine(contract.installedEngine(), timestamp);
  const creator = getOrCreateAccount(event.transaction.from, timestamp);
  const owner = getOrCreateAccount(contract.owner(), timestamp);
  const factory = getOrCreateFactory(dataSource.address(), timestamp);

  factory.collectionCount += 1;
  factory.save();

  const implementationId = event.params.implementation.toHexString();
  const implementation = Implementation.load(implementationId);
  if (!implementation) throw new Error(`implementation not indexed: ${implementationId}`);

  collection.factory = factory.id;
  collection.implementation = implementation.id;
  collection.engine = engine.id;
  collection.creator = creator.id;
  collection.owner = owner.id;

  collection.createdAtTimestamp = timestamp;
  collection.lastUpdatedAtTimestamp = timestamp;
  collection.lastActivityAtTimestamp = timestamp;

  collection.save();

  // spawn new datasources
  IShellFrameworkDatasource.create(collectionAddress);

  {
    const resp = IERC721.bind(collectionAddress).try_supportsInterface(ERC721_INTERFACE_ID);
    if (!resp.reverted && resp.value === true) {
      IShellERC721Datasource.create(collectionAddress);
    }
  }

  {
    const resp = IERC1155.bind(collectionAddress).try_supportsInterface(ERC1155_INTERFACE_ID);
    if (!resp.reverted && resp.value === true) {
      IShellERC1155Datasource.create(collectionAddress);
    }
  }

}
