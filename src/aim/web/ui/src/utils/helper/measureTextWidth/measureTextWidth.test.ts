import { toBeLessThanOrEqual, toEqual } from 'tests/utils';

import { measureTextWidth } from 'utils/helper';

describe('[measureTextWidth]', () => {
  it('should return number type value', () => {
    const measuredTextWidth = measureTextWidth({ text: 'test text' });
    toEqual('number', typeof measuredTextWidth);
  });

  it('should return positive number', () => {
    const measuredTextWidth = measureTextWidth({ text: 'test text' });
    toBeLessThanOrEqual(0, measuredTextWidth);
  });
});
