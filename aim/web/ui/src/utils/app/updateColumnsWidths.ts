import _ from 'lodash-es';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

/**
 *
 * @param {string} key - key of table column
 * @param {number} width - width of table column
 * @param {boolean} isReset - checking if in columns should be reset
 * @param {IModel<M extends State>} model - instance of create model
 */

export default function updateColumnsWidths<M extends State>({
  key,
  width,
  isReset,
  model,
  appName,
  updateModelData,
}: {
  key: string;
  width: number;
  isReset: boolean;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.table && configData?.table?.columnsWidths) {
    let columnsWidths = configData?.table?.columnsWidths;
    if (isReset) {
      columnsWidths = _.omit(columnsWidths, [key]);
    } else {
      columnsWidths = { ...columnsWidths, [key]: width };
    }
    const table = {
      ...configData.table,
      columnsWidths,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName.toLowerCase()}Table`, encode(table));
    updateModelData(config);
  }
}
