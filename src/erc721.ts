import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from '../generated/templates/ERC721Datasource/IERC721'
import { handleNftTransfer } from './nft';

export function handleTransfer(event: Transfer): void {
  handleNftTransfer(
    event.address,
    event.params.tokenId,
    event.params.from,
    event.params.to,
    BigInt.fromI32(1),
    event
  );
}
