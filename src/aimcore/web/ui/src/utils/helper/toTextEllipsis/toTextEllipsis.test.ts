import { toBeGreaterThanOrEqual, toEqual } from 'tests/utils';

import toTextEllipsis from './toTextEllipsis';

describe('[toTextEllipsis]', () => {
  it('should return string type value', () => {
    const textEllipsis = toTextEllipsis({ text: 'test text', width: 20 });
    toEqual('string', typeof textEllipsis);
  });

  it('should return text which length is smaller or equal to received text length', () => {
    const text = 'test text';
    const textEllipsis = toTextEllipsis({ text, width: 20 });
    toBeGreaterThanOrEqual(text.length, textEllipsis.length);
  });
});
