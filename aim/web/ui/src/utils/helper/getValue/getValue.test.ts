import { toEqual } from 'tests/utils';

import getValue from './getValue';

describe('[getValue]', () => {
  const obj = {
    a: {
      b: {
        length: {
          valueOf: {
            name: 'nested prop',
          },
        },
      },
    },
  };

  it('should equal to', () => {
    const value = getValue(obj, 'a.b.length.valueOf.name');
    toEqual('nested prop', value);
  });

  it('should equal to', () => {
    const value = getValue(obj.a.b, 'length.valueOf');
    toEqual({ name: 'nested prop' }, value);
  });

  it('should equal to', () => {
    const value = getValue(obj.a.b, ['length', 'valueOf']);
    toEqual({ name: 'nested prop' }, value);
  });

  it('should equal to', () => {
    const value = getValue(null, ['length', 'valueOf'], 'defaultValue');
    toEqual('defaultValue', value);
  });
});
