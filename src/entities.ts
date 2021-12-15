import { Address } from "@graphprotocol/graph-ts";
import { Account } from "../generated/schema";

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
