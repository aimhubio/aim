import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { HighlightEnum } from 'utils/d3';

export interface IHighlightingProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IHighlightingConfig {
  mode: HighlightEnum;
  isInitial: boolean;
}
