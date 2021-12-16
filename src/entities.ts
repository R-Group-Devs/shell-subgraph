import { Address } from "@graphprotocol/graph-ts";
import { Account, Engine } from "../generated/schema";

export const getOrCreateAccount = (address: Address): Account => {
  const id = address.toHexString();
  let account = Account.load(id);
  if (account != null) {
    return account;
  }
  account = new Account(id);
  account.address = id;
  account.save();
  return account;
}

export const getOrCreateEngine = (address: Address): Engine => {
  const id = address.toHexString();
  let engine = Engine.load(id);
  if (engine != null) {
    return engine;
  }
  engine = new Engine(id);
  engine.address = id;
  engine.save();
  return engine;
}
