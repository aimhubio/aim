import React from 'react';

export interface ICaptionBoxProps {
  engine: IBaseComponentProps['engine'];
  captionBoxRef: React.RefObject<HTMLDivElement>;
  item: any;
}
