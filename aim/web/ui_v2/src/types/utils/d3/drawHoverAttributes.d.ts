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

export type IHoverAxisLine = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinatesProps {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IDrawHoverAttributesProps['xScale'];
  yScale: IDrawHoverAttributesProps['yScale'];
}

export interface IGetCoordinates {
  mouseX: number;
  mouseY: number;
}
