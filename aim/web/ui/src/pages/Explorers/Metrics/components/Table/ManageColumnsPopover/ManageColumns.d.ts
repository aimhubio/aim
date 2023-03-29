import { AppNameEnum } from 'services/models/explorer';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IColumnsOrder } from 'types/services/models/explorer/createAppModel';

export interface IManageColumnsPopoverProps {
  columnsData: ITableColumn[];
  hiddenColumns: string[];
  columnsOrder: IColumnsOrder;
  onManageColumns: (columns: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[] | string) => void;
  hideSystemMetrics: boolean;
  appName: AppNameEnum;
}
