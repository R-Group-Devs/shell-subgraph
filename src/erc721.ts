import { BigInt, store } from "@graphprotocol/graph-ts";
import { Collection, Factory, Implementation } from "../generated/schema";
import { IShellERC721, Transfer } from "../generated/templates/IShellERC721Datasource/IShellERC721";
import { ZERO_ADDRESS } from "./constants";
import { getOrCreateAccount, getOrCreateEngine, getOrCreateNft, getOrCreateNFTBalance } from "./entities";

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

  // if minting
  if (event.params.from.equals(ZERO_ADDRESS)) {
    const mintedBy = getOrCreateAccount(event.transaction.from, timestamp);
    const mintedTo = getOrCreateAccount(event.params.to, timestamp);
    nft.mintedBy = mintedBy.id;
    nft.mintedTo = mintedTo.id;
    mintedBy.lastSeenAtTimestamp = timestamp;
    mintedBy.mintedNftsCount += 1;
    mintedBy.save();

    const framework = IShellERC721.bind(event.address);
    const engine = getOrCreateEngine(framework.installedEngine(), timestamp);
    engine.mintedNftsCount += 1;
    engine.save();

    const factory = Factory.load(collection.factory);
    if (!factory) throw new Error('factory not found');
    factory.nftCount += 1;
    factory.save();

    const implementation = Implementation.load(collection.implementation);
    if (!implementation) throw new Error('implementation not found');
    implementation.nftCount += 1;
    implementation.save();

    collection.nftCount += 1;
    nft.mintedByEngine = engine.id;
  } else { // else if transfer from real address
    const balanceId = `${nft.id}-${event.params.from.toHexString()}`;
    store.remove('NFTBalance', balanceId);
  }

  // if not a burn
  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    const balance = getOrCreateNFTBalance(nft, event.params.to, timestamp);
    balance.balance = BigInt.fromI32(1);
    balance.save();
  }

  nft.save();
  owner.save();
  collection.save();
}
