import { ScaleType } from 'types/components/LineChart/LineChart';
import { IScale } from 'types/utils/d3/getAxesScale';

export type DimensionType = {
  scaleType: ScaleType;
  domainData: number[] | string[];
};

export type YScaleType = {
  [key: string]: IScale;
};

export type DimensionsType = {
  [key: string]: DimensionType;
};

export interface IDrawParallelAxesProps {
  axesNodeRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  dimensions: DimensionsType;
}
