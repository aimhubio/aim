import {
  IBaseComponentProps,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';

export interface IBoxWrapperProps<T> extends IBaseComponentProps {
  items: Array<T>;
  component: IVisualizationProps['box'];
  hasDepthSlider: IVisualizationProps['hasDepthSlider'];
  groupId: string;
  depthSelector: (groupKey: string) => (state: any) => number;
  onDepthMapChange: (value: number, groupId: string) => void;
  visualizationName: string;
}
