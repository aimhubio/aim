import React from 'react';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface ICaptionBoxProps extends IBaseComponentProps {
  captionBoxRef: React.RefObject<HTMLDivElement>;
  item: any;
  visualizationName: string;
}
