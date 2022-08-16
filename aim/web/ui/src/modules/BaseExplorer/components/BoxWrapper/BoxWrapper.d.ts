import {
  IBaseComponentProps,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';

export interface IBoxWrapperProps<T> extends IBaseComponentProps {
  items: Array<T>;
  component: IVisualizationProps['box'];
  groupKey: string;
  depthSelector: (groupKey: string) => (state: any) => number;
  onDepthMapChange: (value: number, groupKey: string) => void;
}
