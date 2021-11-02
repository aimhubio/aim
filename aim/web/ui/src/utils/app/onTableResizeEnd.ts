import { IModel, State } from 'types/services/models/model';

import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';

export function onTableResizeEnd<M extends State>({
  tableHeight,
  model,
  appName,
}: {
  tableHeight: string;
  model: IModel<M>;
  appName: string;
}): void {
  const configData = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      height: tableHeight,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
  }
}
