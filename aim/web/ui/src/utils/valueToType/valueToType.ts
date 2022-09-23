// Adapted from react-json-view by Mac Gainor
// License: https://github.com/mac-s-g/react-json-view/blob/master/LICENSE

import { COLOR_BY_VALUE_TYPE } from 'config/colors/colors';

// Returns a string "type" of input object
export function toType(obj: any) {
  let type = getType(obj);
  if (type === 'number') {
    // some extra disambiguation for numbers
    if (isNaN(obj)) {
      type = 'nan';
    } else if ((obj | 0) !== obj) {
      // bitwise OR produces integers
      type = 'float';
    } else {
      type = 'int';
    }
  } else if (type === 'boolean') {
    type = 'bool';
  } else if (type === 'undefined' || type === 'null') {
    type = '';
  }

  return type;
}

// Source: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable/7390612#7390612
function getType(obj: any) {
  return ({} as any).toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}

// Returns color code base on value type
export function typeToColor(item: string) {
  return COLOR_BY_VALUE_TYPE[item] ?? 'rgb(20, 115, 230)';
}
