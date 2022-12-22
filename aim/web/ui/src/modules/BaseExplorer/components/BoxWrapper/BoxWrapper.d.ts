import {
  IBaseComponentProps,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';

export interface IBoxWrapperProps<T> extends IBaseComponentProps {
  boxId: string;
  boxIndex: number;
  boxItems: Array<T>;
  component: IVisualizationProps['box'];
  hasDepthSlider: IVisualizationProps['hasDepthSlider'];
  depthSelector: (groupKey: string) => (state: any) => number;
  onDepthMapChange: (value: number, groupId: string) => void;
  visualizationName: string;
}
