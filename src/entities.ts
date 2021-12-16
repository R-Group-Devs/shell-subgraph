import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Engine } from "../generated/schema";

export const getOrCreateAccount = (address: Address, timestamp: BigInt): Account => {
  const id = address.toHexString();
  let account = Account.load(id);
  if (account != null) {
    return account;
  }
  account = new Account(id);
  account.address = id;
  account.createdCollectionsCount = 0;
  account.firstSeenAtTimestamp = timestamp;
  account.lastSeenAtTimestamp = timestamp;
  account.save();
  return account;
}

export const getOrCreateEngine = (address: Address, timestamp: BigInt): Engine => {
  const id = address.toHexString();
  let engine = Engine.load(id);
  if (engine != null) {
    return engine;
  }
  engine = new Engine(id);
  engine.address = id;
  engine.collectionCount = 0;
  engine.releasedAtTimestamp = timestamp;
  engine.lastInstalledAtTimestamp = timestamp;
  engine.lastUpdatedAtTimestamp = timestamp;
  engine.save();
  return engine;
}
