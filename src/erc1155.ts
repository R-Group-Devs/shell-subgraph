import { TransferSingle, TransferBatch } from '../generated/templates/IShellERC1155Datasource/IShellERC1155'
import { IShellFramework } from '../generated/templates/IShellERC1155Datasource/IShellFramework';
import { handleNftTransfer } from './nft'

export function handleTransferSingle(event: TransferSingle): void {
  const engineAddress = IShellFramework.bind(event.address).installedEngine();
  handleNftTransfer(
    event.address,
    engineAddress,
    event.params.id,
    event.block.timestamp,
    event.params.operator,
    event.params.from,
    event.params.to,
    event.params.value,
    event
  );
}

export function handleTransferBatch(event: TransferBatch): void {
  const engineAddress = IShellFramework.bind(event.address).installedEngine();
  for (let i = 0; i < event.params.ids.length; i++) {
    handleNftTransfer(
      event.address,
      engineAddress,
      event.params.ids[i],
      event.block.timestamp,
      event.params.operator,
      event.params.from,
      event.params.to,
      event.params.values[i],
      event
    );
  }
}
