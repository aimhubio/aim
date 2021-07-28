import * as d3 from 'd3';

import { ScaleEnum } from './index';
import {
  IGetAxisScale,
  IGetAxisScaleProps,
} from '../../types/utils/d3/getAxesScale';

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

function getAxesScale(params: IGetAxisScaleProps): IGetAxisScale {
  const { scaleType, domainData, rangeData } = params;

  const scaleBase = getScaleBaseFor(scaleType);
  //@ts-ignore
  return scaleBase.domain(domainData).range(rangeData);
}

export default getAxesScale;
