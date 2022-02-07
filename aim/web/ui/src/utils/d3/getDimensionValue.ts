import * as d3 from 'd3';

import { IDimensionType } from 'types/utils/d3/drawParallelAxes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

export function getDimensionValue({
  pos,
  domainData,
  axisScale,
}: {
  pos: number;
  domainData: IDimensionType['domainData'];
  axisScale: IAxisScale;
}) {
  const axisValues = (domainData as string[]).map((d: string) => axisScale(d));
  const index = d3.bisectCenter(axisValues, pos);
  return domainData[index];
}
