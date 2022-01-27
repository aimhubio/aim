import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IModel, State } from 'types/services/models/model';

import getSystemMetricsFromColumns from './getSystemMetricsFromColumns';

export default function manageSystemMetricColumns<M extends State>(
  model: IModel<M> | any,
) {
  const modelState = model.getState();
  const systemMetrics = getSystemMetricsFromColumns(
    modelState?.tableColumns! as ITableColumn[],
  );
  let hiddenColumns = [...modelState!.config!.table.hiddenColumns!];
  if (
    hiddenColumns.length === 0 &&
    modelState!.config!.table.hideSystemMetrics
  ) {
    hiddenColumns = systemMetrics;
    console.log('mtav', hiddenColumns);

    model.updateModelData({
      ...modelState.config,
      table: {
        ...modelState.config!.table,
        hiddenColumns,
      },
    });
  }
}
