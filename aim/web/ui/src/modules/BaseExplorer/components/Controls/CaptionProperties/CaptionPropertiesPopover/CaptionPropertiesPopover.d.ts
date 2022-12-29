import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { ICaptionProperties } from '../';

export interface ICaptionPropertiesPopoverProps extends IBaseComponentProps {
  captionProperties: ICaptionProperties;
  visualizationName: string;
}
