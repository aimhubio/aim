import {
  IGetCoordinates,
  IGetCoordinatesArgs,
} from 'types/utils/d3/drawHoverAttributes';

export default function getCoordinates({
  mouse,
  margin,
  xScale,
  yScale,
}: IGetCoordinatesArgs): IGetCoordinates {
  const xPixel = Math.floor(mouse[0]) - margin.left;
  const yPixel = Math.floor(mouse[1]) - margin.top;
  const [xMin, xMax] = xScale.range();
  const [yMax, yMin] = yScale.range();

  return {
    mouseX: xPixel < xMin ? xMin : xPixel > xMax ? xMax : xPixel,
    mouseY: yPixel < yMin ? yMin : yPixel > yMax ? yMax : yPixel,
  };
}
