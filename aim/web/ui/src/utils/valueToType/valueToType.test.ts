import { toEqual } from 'tests/utils';

import { toType, typeToColor } from './valueToType';

describe('[returns value type and gets its color code]', () => {
  it('correctly returns value type', () => {
    toEqual(toType(5), 'int');
    toEqual(toType(1.2), 'float');
    toEqual(toType(true), 'bool');
    toEqual(toType({}), 'object');
    toEqual(toType([]), 'array');
    toEqual(toType(null), '');
    toEqual(toType(undefined), '');
    toEqual(toType('lorem'), 'string');
  });

  it('correctly returns color code for a given type', () => {
    toEqual(typeToColor(toType(5)), 'rgb(175, 85, 45)');
    toEqual(typeToColor(toType(1.2)), 'rgb(92, 129, 21)');
    toEqual(typeToColor(toType(true)), 'rgb(169, 87, 153)');
    toEqual(typeToColor(toType({})), 'rgb(73, 72, 73)');
    toEqual(typeToColor(toType([])), 'rgb(73, 72, 73)');
    toEqual(typeToColor(toType(null)), 'rgb(148, 148, 148)');
    toEqual(typeToColor(toType(undefined)), 'rgb(148, 148, 148)');
    toEqual(typeToColor(toType('lorem')), 'rgb(246, 103, 30)');
  });
});
