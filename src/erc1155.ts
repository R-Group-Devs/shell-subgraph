import { TransferSingle, TransferBatch } from '../generated/templates/ERC1155Datasource/IERC1155'

export function handleTransferSingle(event: TransferSingle): void {
  // const engineAddress = IShellFramework.bind(event.address).installedEngine();
  // handleNftTransfer(
  //   event.address,
  //   engineAddress,
  //   event.params.id,
  //   event.params.from,
  //   event.params.to,
  //   event.params.value,
  //   event
  // );
}

export function handleTransferBatch(event: TransferBatch): void {
  // const engineAddress = IShellFramework.bind(event.address).installedEngine();
  // for (let i = 0; i < event.params.ids.length; i++) {
  //   handleNftTransfer(
  //     event.address,
  //     engineAddress,
  //     event.params.ids[i],
  //     event.params.from,
  //     event.params.to,
  //     event.params.values[i],
  //     event
  //   );
  // }
}
