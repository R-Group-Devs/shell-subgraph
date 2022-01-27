import { Address, Bytes } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = Address.fromHexString('0x0000000000000000000000000000000000000000');

export const ERC721_INTERFACE_ID = Bytes.fromByteArray(Bytes.fromHexString('0x80ac58cd'));

export const ERC1155_INTERFACE_ID = Bytes.fromByteArray(Bytes.fromHexString('0xd9b67a26'));
