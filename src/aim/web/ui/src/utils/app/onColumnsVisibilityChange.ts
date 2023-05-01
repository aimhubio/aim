import _ from 'lodash-es';

import { HideColumnsEnum } from 'config/enums/tableEnums';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { AVOID_COLUMNS_TO_HIDE_LIST } from 'config/table/tableConfigs';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

import getSystemMetricsFromColumns from './getSystemMetricsFromColumns';
import getFilteredSystemMetrics from './getFilteredSystemMetrics';

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
  const columnsData = model.getState()!.tableColumns!;
  const systemMetrics: string[] = getSystemMetricsFromColumns(
    columnsData as ITableColumn[],
  );

  let columnKeys: string[] = Array.isArray(hiddenColumns)
    ? [...hiddenColumns]
    : [];
  let hideSystemMetrics: boolean | undefined =
    configData?.table.hideSystemMetrics;

  if (configData?.table) {
    const filteredFromSystem = getFilteredSystemMetrics(
      configData?.table?.hiddenColumns,
      true,
    );
    if (hiddenColumns === HideColumnsEnum.HideSystemMetrics) {
      columnKeys = [...filteredFromSystem, ...systemMetrics];
    }
    if (hiddenColumns === HideColumnsEnum.ShowSystemMetrics) {
      columnKeys = [...filteredFromSystem];
    }

    if (hideSystemMetrics !== undefined) {
      hideSystemMetrics =
        getFilteredSystemMetrics(columnKeys).length === systemMetrics.length;
    }
    columnKeys =
      hiddenColumns === HideColumnsEnum.All
        ? columnsData.map(
            (col) => !AVOID_COLUMNS_TO_HIDE_LIST.has(col.key) && col.key,
          )
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
    // @ts-ignore
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.showAllColumns);
  } else if (_.isEmpty(hiddenColumns)) {
    // @ts-ignore
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.hideAllColumns);
  }
}
