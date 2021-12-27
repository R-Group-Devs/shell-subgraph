import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/templates/IShellERC721Datasource/IShellERC721";
import { IShellFramework } from "../generated/templates/IShellERC721Datasource/IShellFramework";
import { handleNftTransfer } from "./nft";

export function handleTransfer(event: Transfer): void {
  const engineAddress = IShellFramework.bind(event.address).installedEngine();
  handleNftTransfer(
    event.address,
    engineAddress,
    event.params.tokenId,
    event.params.from,
    event.params.to,
    BigInt.fromI32(1),
    event
  );
}
