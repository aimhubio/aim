export interface IColumnItemProps {
  searchKey?: string;
  label: string;
  hasSearchableItems?: boolean;
  draggingItemId: string;
  isHidden: boolean;
  popoverWidth: number;
  data: string;
  appName: string;
  index: number;
  onClick: (e: MouseEventHandler<HTMLSpanElement>) => void;
}
