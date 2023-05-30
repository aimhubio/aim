import * as d3 from 'd3';

import { IAxisScale, IGetAxisScaleProps } from 'types/utils/d3/getAxisScale';

import { ScaleEnum } from './index';

function getScaleBaseFor(scaleType?: ScaleEnum) {
  switch (scaleType) {
    case ScaleEnum.Log:
      return d3.scaleLog();
    case ScaleEnum.Linear:
      return d3.scaleLinear();
    case ScaleEnum.Point:
      return d3.scalePoint();
    default:
      return d3.scaleLinear();
  }
}

function getAxisScale({
  scaleType,
  domainData,
  rangeData,
}: IGetAxisScaleProps): IAxisScale {
  const scaleBase = getScaleBaseFor(scaleType);
  //@ts-ignore
  return scaleBase.domain(domainData).range(rangeData);
}

export default getAxisScale;
