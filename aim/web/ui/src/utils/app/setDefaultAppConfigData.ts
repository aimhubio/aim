import _ from 'lodash-es';

import { IModel, State } from 'types/services/models/model';
import {
  IAppInitialConfig,
  IAppModelConfig,
} from 'types/services/models/explorer/createAppModel';

import { getItem, setItem } from 'utils/storage';
import { AIM64_ENCODING_PREFIX, encode } from 'utils/encoder/encoder';
import getStateFromUrl from 'utils/getStateFromUrl';
import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';
import { getCompatibleChartConfig } from 'utils/app/getCompatibleChartConfig';
import decodeWithBase58Checker from 'utils/decodeWithBase58Checker';

import updateURL from './updateURL';

export default function setDefaultAppConfigData<M extends State>({
  config,
  appInitialConfig,
  model,
  recoverTableState = true,
}: {
  config: IAppModelConfig;
  appInitialConfig: IAppInitialConfig;
  model: IModel<M>;
  recoverTableState: boolean;
}): void {
  const { grouping, selectForm, components, appName } = appInitialConfig;
  const searchParam = new URLSearchParams(window.location.search);

  const liveUpdateConfigHash = getItem(`${appName}LUConfig`);
  const luConfig = liveUpdateConfigHash
    ? JSON.parse(
        decodeWithBase58Checker({
          value: liveUpdateConfigHash,
          localStorageKey: `${appName}LUConfig`,
        }),
      )
    : config?.liveUpdate;

  // Backward compatibility, update users storage data if code has change in delay
  // @ts-ignore
  if (luConfig.delay !== config?.liveUpdate.delay) {
    // @ts-ignore
    luConfig.delay = config?.liveUpdate.delay;
    setItem(`${appName}LuConfig`, encode(luConfig));
  }
  ///

  const defaultConfig: IAppModelConfig = { liveUpdate: luConfig };

  if (grouping) {
    defaultConfig.grouping = getStateFromUrl('grouping') ?? {};
  }
  if (selectForm) {
    const compatibleSelectConfig = getCompatibleSelectConfig(
      ['metrics', 'params', 'images'],
      getStateFromUrl('select'),
    );
    defaultConfig.select = compatibleSelectConfig ?? {};
  }
  if (components.charts) {
    const compatibleChartConfig = getCompatibleChartConfig(
      getStateFromUrl('chart'),
    );
    defaultConfig.chart = compatibleChartConfig ?? {};
  }
  if (recoverTableState && components.table) {
    const tableConfigHash = getItem(`${appName}Table`);
    defaultConfig.table = tableConfigHash
      ? JSON.parse(
          decodeWithBase58Checker({
            value: tableConfigHash,
            localStorageKey: `${appName}Table`,
          }),
        )
      : config?.table;
  }
  const configData: IAppModelConfig = _.mergeWith(
    {},
    model.getState().config,
    defaultConfig,
    (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return srcValue;
      }
    },
  );
  if (
    (searchParam.get('grouping') &&
      !searchParam.get('grouping')?.startsWith(AIM64_ENCODING_PREFIX)) ||
    (searchParam.get('chart') &&
      !searchParam.get('chart')?.startsWith(AIM64_ENCODING_PREFIX)) ||
    (searchParam.get('select') &&
      !searchParam.get('select')?.startsWith(AIM64_ENCODING_PREFIX))
  ) {
    updateURL({ configData, appName });
  }
  model.setState({ config: configData });
}
