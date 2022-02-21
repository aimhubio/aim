import { IIllustrationConfig } from 'types/components/Table/Table';

export interface ICardProps {
  name: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  dataListProps?: {
    tableColumns: any;
    tableData: any;
    searchableKeys?: string[];
    illustrationConfig?: IIllustrationConfig;
  };
}
