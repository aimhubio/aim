import { UseDepthMap } from 'modules/BaseExplorer/components/Visualizer/hooks/useDepthMap';
import {
  IBaseComponentProps,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';

export interface IBoxWrapperProps<T> extends IBaseComponentProps {
  boxId: string;
  boxIndex: number;
  boxItems: Array<T>;
  component: IVisualizationProps['box'];
  boxStacking: IVisualizationProps['boxStacking'];
  visualizationName: string;
  depthSelector: UseDepthMap['depthSelector'];
  onDepthMapChange: UseDepthMap['onDepthMapChange'];
}

interface IBoxProps<T> extends IBaseComponentProps {
  boxId: string;
  boxIndex: number;
  boxItems: Array<T>;
  component: IVisualizationProps['box'];
  visualizationName: string;
}

interface IBoxWithStackingProps<T> extends IBaseComponentProps {
  boxId: string;
  boxIndex: number;
  boxItems: Array<T>;
  component: IVisualizationProps['box'];
  visualizationName: string;
  depthSelector: UseDepthMap['depthSelector'];
  onDepthMapChange: UseDepthMap['onDepthMapChange'];
}
