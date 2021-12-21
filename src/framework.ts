import { Collection } from "../generated/schema";
import { OwnershipTransferred } from "../generated/templates/IShellFrameworkDatasource/IShellFramework";
import { getOrCreateAccount } from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collectionId = event.address.toHexString();
  const collection = Collection.load(collectionId);
  if (!collection) throw new Error(`collection does not yet exist: ${collectionId}`);
  collection.owner = getOrCreateAccount(event.params.newOwner, event.block.timestamp).id;
  collection.save();
}
