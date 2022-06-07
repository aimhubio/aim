import { ICoordinatesMap, ICanvasSize, IRectangle, IPoint } from './types';

// @TODO comment of function role and behavior
// move to helpers and create two functions (keyEncoder - keyDecoder)
export function keyGenerator(item: any): string {
  // @TODO need to use more effective serialization/deserialization method like -> msgpack-lite instead of JSON serialization/deserialization
  return JSON.stringify({
    x: { 1: item.visuals.x, 2: item.visuals.x + item.visuals.width },
    y: { 1: item.visuals.y, 2: item.visuals.y + item.visuals.height },
  });
}

// @TODO comment of function role and behavior
function getCanvasSize(
  item: any,
  canvasWidthMax: number,
  canvasHeighthMax: number,
): ICanvasSize {
  // @TODO will not work with grouped data think solution
  const itemX2 = item.visuals.x + item.visuals.width;
  if (itemX2 > canvasWidthMax) canvasWidthMax = itemX2;
  const itemY2 = item.visuals.y + item.visuals.height;
  if (itemY2 > canvasHeighthMax) canvasHeighthMax = itemY2;

  return {
    width: canvasWidthMax,
    height: canvasHeighthMax,
  };
}

// @TODO comment of function role and behavior
export function getPropertyValueByPath(object: object, path: string) {
  const paths = path.split('.');
  const pathsLength = paths.length;
  let current: any = object;

  for (let i = 0; i < pathsLength; i++) {
    const propValue = current[paths[i]];
    if (propValue === undefined) {
      return undefined;
    } else {
      current = propValue;
    }
  }

  return current;
}

// @TODO comment of function role and behavior
export function iterateData(data: any = [], coordinatesMap: ICoordinatesMap) {
  let canvasSize: ICanvasSize = {
    width: 0,
    height: 0,
  };

  const hashTable = new Map();

  data.forEach((item: any) => {
    const itemData = {
      visuals: {
        x: getPropertyValueByPath(item, coordinatesMap.x),
        y: getPropertyValueByPath(item, coordinatesMap.y),
        width: getPropertyValueByPath(item, coordinatesMap.width),
        height: getPropertyValueByPath(item, coordinatesMap.height),
        opacity: coordinatesMap.opacity
          ? getPropertyValueByPath(item, coordinatesMap.opacity)
          : 1,
      },
      metadata: { ...item },
    };

    hashTable.set(keyGenerator(itemData), itemData);
    canvasSize = getCanvasSize(itemData, canvasSize.width, canvasSize.height);
  });

  return {
    canvasSize,
    hashTable,
  };
}

// @TODO comment of function role and behavior
export function isPointInRectangle(
  { x1, x2, y1, y2 }: IRectangle,
  { x, y }: IPoint,
) {
  return x > x1 && x < x2 && y > y1 && y < y2;
}

export function isFunction(variable: any): boolean {
  return variable && {}.toString.call(variable) === '[object Function]';
}
