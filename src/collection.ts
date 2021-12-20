import { Collection, Factory, NFTTransfer } from "../generated/schema";
import { OwnershipTransferred } from "../generated/templates/CollectionDatasource/Collection";
import { Transfer } from "../generated/templates/ERC721Datasource/ERC721";
import { ICollection } from "../generated/templates/ERC721Datasource/ICollection";
import { ZERO_ADDRESS } from "./constants";
import { getOrCreateAccount, getOrCreateEngine, getOrCreateNft } from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.owner = getOrCreateAccount(event.params.newOwner, event.block.timestamp).id;
  collection.save();
}

export function handleTransfer(event: Transfer): void {
  const timestamp = event.block.timestamp;

  const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);
  nft.lastActivityAtTimestamp = timestamp;

  const owner = getOrCreateAccount(event.params.to, timestamp);
  owner.lastSeenAtTimestamp = timestamp;
  nft.owner = owner.id;

  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.lastActivityAtTimestamp = timestamp;

  if (event.params.from.equals(ZERO_ADDRESS)) {
    const mintedBy = getOrCreateAccount(event.transaction.from, timestamp);
    const mintedTo = getOrCreateAccount(event.params.to, timestamp);
    nft.mintedBy = mintedBy.id;
    nft.mintedTo = mintedTo.id;
    mintedBy.lastSeenAtTimestamp = timestamp;
    mintedBy.mintedNftsCount += 1;
    mintedBy.save();

    const framework = ICollection.bind(event.address);
    const engine = getOrCreateEngine(framework.installedEngine(), timestamp);
    engine.mintedNftsCount += 1;
    engine.save();

    const factory = Factory.load(collection.factory);
    if (!factory) throw new Error('factory not found');
    factory.nftCount += 1;
    factory.save();

    collection.nftCount += 1;
    nft.mintedByEngine = engine.id;
  }

  const transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const transfer = new NFTTransfer(transferId);
  transfer.to = event.params.to.toHexString();
  transfer.from = event.params.from.toHexString();
  transfer.transactionHash = event.transaction.hash.toHexString();
  transfer.createdAtTimestamp = event.block.timestamp;
  transfer.nft = nft.id;

  nft.save();
  owner.save();
  collection.save();
  transfer.save();
}
