export interface ICardProps {
  name: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  data?: any;
  tableColumns?: any;
  isLoading?: boolean;
}
