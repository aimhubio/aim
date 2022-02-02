import { AppNameEnum } from 'services/models/explorer';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

export interface IManageColumnsPopoverProps {
  columnsData: ITableColumn[];
  hiddenColumns: string[] | any;
  onTableDiffShow: () => void;
  onManageColumns: (columns: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[] | string) => void;
  hideSystemMetrics: boolean;
  appName: AppNameEnum;
}
