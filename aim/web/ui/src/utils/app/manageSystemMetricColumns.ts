import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IModel, State } from 'types/services/models/model';

import getSystemMetricsFromColumns from './getSystemMetricsFromColumns';

export default function manageSystemMetricColumns<M extends State>(
  model: IModel<M> | any,
) {
  const modelState = model.getState();
  const systemMetrics: string[] = getSystemMetricsFromColumns(
    modelState?.tableColumns! as ITableColumn[],
  );
  let hiddenColumns: string[] = [...modelState!.config!.table.hiddenColumns!];
  if (
    hiddenColumns.length === 0 &&
    systemMetrics.length > 0 &&
    modelState!.config!.table.hideSystemMetrics
  ) {
    hiddenColumns = systemMetrics;

    model.updateModelData({
      ...modelState.config,
      table: {
        ...modelState.config!.table,
        hiddenColumns,
      },
    });
  }
}
