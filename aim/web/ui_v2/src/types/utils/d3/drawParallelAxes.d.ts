import { ScaleType } from 'types/components/LineChart/LineChart';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';

export interface IDimensionType {
  scaleType: ScaleType;
  domainData: number[] | string[];
  displayName: string;
  dimensionType: string;
}

export interface YScaleType {
  [key: string]: IGetAxisScale;
}

export interface IDimensionsType {
  [key: string]: IDimensionType;
}

export interface IDrawParallelAxesProps {
  axesNodeRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  dimensions: IDimensionsType;
}
