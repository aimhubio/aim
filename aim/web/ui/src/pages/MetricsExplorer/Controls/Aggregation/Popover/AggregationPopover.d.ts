import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { IAggregationConfig } from '../';

export interface IAggregationPopoverProps extends IBaseComponentProps {
  aggregationConfig: IAggregationConfig;
  visualizationName: string;
}
