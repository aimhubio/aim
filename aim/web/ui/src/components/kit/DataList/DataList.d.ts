import React from 'react';

import { IIllustrationConfig } from 'types/components/Table/Table';

export interface IDataListProps {
  tableRef: React.RefObject<any>;
  tableData: any;
  isLoading?: boolean;
  withSearchBar?: boolean;
  tableColumns: any;
  searchableKeys?: string[];
  illustrationConfig?: IIllustrationConfig;
  rowHeight?: number;
  height?: string;
  tableClassName?: string;
  toolbarItems?: React.FunctionComponentElement<React.ReactNode>[];
  disableMatchBar?: boolean;
}
