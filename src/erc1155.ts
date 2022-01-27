import { TransferSingle, TransferBatch } from '../generated/templates/ERC1155Datasource/IERC1155'
import { handleNftTransfer } from './nft';

export function handleTransferSingle(event: TransferSingle): void {
  handleNftTransfer(
    event.address,
    event.params.id,
    event.params.from,
    event.params.to,
    event.params.value,
    event
  );
}

export function handleTransferBatch(event: TransferBatch): void {
  for (let i = 0; i < event.params.ids.length; i++) {
    handleNftTransfer(
      event.address,
      event.params.ids[i],
      event.params.from,
      event.params.to,
      event.params.values[i],
      event
    );
  }
}
