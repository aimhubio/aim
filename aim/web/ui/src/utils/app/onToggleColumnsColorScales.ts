import _ from 'lodash-es';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';

/**
 * @param {String} colKey  - column name
 */

export default function onToggleColumnsColorScales<M extends State>({
  colKey,
  model,
  appName,
  updateModelData,
}: {
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  colKey: string;
}) {
  const state = model.getState();
  const configData = state?.config;
  let columnsColorScales = configData?.table?.columnsColorScales || {};
  const table = {
    ...configData?.table,
    columnsColorScales: columnsColorScales[colKey]
      ? { ..._.omit(columnsColorScales, colKey) }
      : { ...columnsColorScales, [colKey]: true },
  };
  const config = {
    ...configData,
    table,
  };
  model.setState({
    config,
  });
  setItem(`${appName.toLowerCase()}Table`, encode(table));
  updateModelData(config);
}
