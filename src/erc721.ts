import { Collection } from "../generated/schema";
import { Transfer } from "../generated/templates/ERC721Datasource/ERC721";
import { ZERO_ADDRESS } from "./constants";
import { getOrCreateAccount, getOrCreateNft } from "./entities";

export function handleTransfer(event: Transfer): void {
  const timestamp = event.block.timestamp;

  const nft = getOrCreateNft(event.address, event.params.tokenId, timestamp);
  nft.lastActivityAtTimestamp = timestamp;

  const owner = getOrCreateAccount(event.params.to, event.block.timestamp);
  owner.lastSeenAtTimestamp = event.block.timestamp;
  nft.owner = owner.id;

  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.lastActivityAtTimestamp = event.block.timestamp;

  if (event.params.from.equals(ZERO_ADDRESS)) {
    const mintedBy = getOrCreateAccount(event.transaction.from, timestamp);
    const mintedTo = getOrCreateAccount(event.params.to, timestamp);
    nft.mintedBy = mintedBy.id;
    nft.mintedTo = mintedTo.id;
    mintedBy.lastSeenAtTimestamp = timestamp;
    mintedBy.mintedNftsCount += 1;
    mintedBy.save();

    collection.nftCount += 1;
  }

  nft.save();
  owner.save();
  collection.save();
}
