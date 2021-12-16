import { NFT } from "../generated/schema";
import { Transfer } from "../generated/templates/ERC721Datasource/ERC721";
import { getOrCreateAccount } from "./entities";

export function handleTransfer(event: Transfer): void {
  // const nftId = `${event.address.toHexString()}-${event.params.tokenId}`;
  // const nft = NFT.load(nftId);

  // if (nft == null) {
  //   return;
  // }

  // const owner = getOrCreateAccount(event.params.to, event.block.timestamp);
  // owner.lastSeenAtTimestamp = event.block.timestamp;
  // owner.save();

  // nft.owner = getOrCreateAccount(event.params.to, event.block.timestamp).id;
  // nft.save();
}
