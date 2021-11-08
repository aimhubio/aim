import * as d3 from 'd3';

import { PointSymbolEnum } from './index';

export default function symbolGenerator(
  symbol: PointSymbolEnum = PointSymbolEnum.CIRCLE,
  size: number = 40,
) {
  return d3.symbol().type(d3[symbol]).size(size);
}
