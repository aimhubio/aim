// Adapted from react-json-view by Mac Gainor
// License: https://github.com/mac-s-g/react-json-view/blob/master/LICENSE

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
export function typeToColor(item: any) {
  switch (item) {
    case 'int':
      return 'rgb(175, 85, 45)';
    case 'float':
      return 'rgb(92, 129, 21)';
    case 'string':
      return 'rgb(246, 103, 30)';
    case 'bool':
      return 'rgb(169, 87, 153)';
    case 'object':
      return 'rgb(73, 72, 73)';
    case 'array':
      return 'rgb(73, 72, 73)';
    case '':
    case 'nan':
      return 'rgb(148, 148, 148)';
    default:
      return 'rgb(20, 115, 230)';
  }
}
