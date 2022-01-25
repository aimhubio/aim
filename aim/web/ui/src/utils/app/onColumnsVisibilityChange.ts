import { isEmpty } from 'lodash-es';

import { HideColumnsEnum } from 'config/enums/tableEnums';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';
import { isSystemMetric } from 'utils/isSystemMetric';

export default function onColumnsVisibilityChange<M extends State>({
  hiddenColumns,
  model,
  appName,
  updateModelData,
}: {
  hiddenColumns: string[] | string;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  let columnsData = model.getState()!.tableColumns!;

  let columnKeys: string[] = Array.isArray(hiddenColumns)
    ? [...hiddenColumns]
    : [];
  let hideSystemMetrics: boolean = configData?.table.hideSystemMetrics;

  if (configData?.table) {
    if (hiddenColumns === HideColumnsEnum.HideSystemMetrics) {
      columnsData.forEach((item) => {
        if (isSystemMetric(item.key)) {
          columnKeys.push(item.key);
        }
      });
      columnKeys.push(...configData?.table?.hiddenColumns);
      hideSystemMetrics = true;
    }
    if (hiddenColumns === HideColumnsEnum.ShowSystemMetrics) {
      columnKeys = [...columnKeys, ...configData?.table?.hiddenColumns].filter(
        (key) => !isSystemMetric(key),
      );
      hideSystemMetrics = false;
    }

    columnKeys =
      hiddenColumns === HideColumnsEnum.All
        ? columnsData.map((col) => col.key)
        : columnKeys;

    const table = {
      ...configData.table,
      hiddenColumns: columnKeys,
      hideSystemMetrics,
    };

    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent(`[${appName}Explorer][Table] Hide all table columns`);
  } else if (isEmpty(hiddenColumns)) {
    analytics.trackEvent(`[${appName}Explorer][Table] Show all table columns`);
  }
}
