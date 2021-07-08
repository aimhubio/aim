import React from 'react';
import { IGetAxisScale } from './getAxesScale';
import { ILineChartProps } from '../../components/LineChart/LineChart';

export interface IDrawHoverAttributesProps {
  data: ILineChartProps['data'];
  visAreaRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xScale: IGetAxisScale['xScale'];
  yScale: IGetAxisScale['yScale'];
}
