import stringToPath from 'utils/stringToPath';
/**
 * [Get value from nested object by passed path](https://github.com/sindresorhus/dot-prop/blob/master/index.js)
 *
 * Usage: getValue(object, path, defaultValue)
 *
 * @param {Record<string, any>|null} object - nested object
 * @param {string|string[]} path - key, to nested object property value
 * @param {any} defaultValue - default value, if there is no corresponding key
 * @return value - nested object property value or default value
 */
export function getValue(
  object: Record<string, any> | null,
  path: string | string[],
  defaultValue?: any,
) {
  if (
    object === null ||
    typeof object !== 'object' ||
    !(typeof path === 'string' || Array.isArray(path))
  ) {
    return defaultValue;
  }

  let pathArray;
  if (typeof path === 'string' && object.propertyIsEnumerable(path)) {
    pathArray = [path];
  } else if (Array.isArray(path)) {
    pathArray = path;
  } else {
    pathArray = stringToPath(path);
  }

  for (let i = 0; i < pathArray.length; i++) {
    if (
      typeof object !== 'object' ||
      !object.propertyIsEnumerable(pathArray[i])
    ) {
      return defaultValue;
    }

    object = object[pathArray[i]];

    if (object === undefined || object === null) {
      if (i !== pathArray.length - 1) {
        return defaultValue;
      }
      break;
    }
  }

  return object;
}

export default getValue;
