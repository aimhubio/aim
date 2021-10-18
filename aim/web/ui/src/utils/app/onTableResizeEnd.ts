import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export function onTableResizeEnd<M extends State>({
  tableHeight,
  model,
  appName,
  updateModelData,
}: {
  tableHeight: string;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
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
    updateModelData(config);
  }
}
