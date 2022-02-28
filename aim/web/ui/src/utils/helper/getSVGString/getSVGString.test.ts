import { toEqual } from 'tests/utils';

import getSVGString from './getSVGString';

describe('[getSVGString]', () => {
  it('should return string type value', () => {
    let svgNode: SVGSVGElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    const svgString = getSVGString(svgNode);
    toEqual('string', typeof svgString);
  });
});
