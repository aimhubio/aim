import {
  IBaseComponentProps,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';
import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

export interface IBoxWrapperProps extends IBaseComponentProps {
  items: Array<AimFlatObjectBase<any>>;
  component: IVisualizationProps['box'];
  groupKey: string;
  depthSelector: (groupKey: string) => (state: any) => number;
  onDepthMapChange: (value: number, groupKey: string) => void;
}
