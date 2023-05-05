import React from 'react';

import { IIllustrationConfig } from 'types/components/Table/Table';

export interface ICardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  dataListProps?: {
    tableColumns: any;
    tableData: any;
    searchableKeys?: string[];
    illustrationConfig?: IIllustrationConfig;
    isLoading?: boolean;
    withSearchBar?: boolean;
    calcTableHeight?: boolean;
  };
}
