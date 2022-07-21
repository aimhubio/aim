import _ from 'lodash-es';

import { getValue } from 'utils/helper';

import { formatValue } from './formatValue';
export const jsValidVariableRegex = new RegExp('^[a-zA-Z_][a-zA-Z0-9d_]*$');

function getObjectPaths(
  obj: { [key: string]: unknown },
  rootObject: { [key: string]: unknown },
  prefix: string = '',
  includeRoot: boolean = false,
  withoutLeaves = false,
): string[] {
  if (obj === null) {
    return [];
  }
  let rootKeys = Object.keys(obj).map((key) => {
    let prefixedKey = '';
    if (prefix) {
      prefixedKey = !jsValidVariableRegex.test(key)
        ? `${prefix}[${formatValue(key)}]`
        : `${prefix}.${key}`;
    } else {
      prefixedKey = !jsValidVariableRegex.test(key)
        ? `[${formatValue(key)}]`
        : key;
    }

    return { prefixedKey, key };
  });
  let paths: string[] = includeRoot
    ? rootKeys.reduce((acc: string[], { prefixedKey, key }) => {
        const val: any = getValue(rootObject, prefixedKey);
        if (typeof val !== 'object' || _.isNil(val) || _.isArray(val)) {
          if (withoutLeaves) {
            const indexOfPrefixedKey = prefixedKey.indexOf(`.${key}`);
            acc.push(
              prefixedKey.slice(
                0,
                indexOfPrefixedKey === -1
                  ? prefixedKey.length
                  : indexOfPrefixedKey,
              ),
            );
          } else {
            acc.push(prefixedKey);
          }
        }
        return acc;
      }, [])
    : Object.keys(obj)
        .filter(
          (key) =>
            !_.isObject(obj[key]) || _.isNil(obj[key]) || _.isArray(obj[key]),
        )
        .map((key) => {
          return key;
        });
  rootKeys.forEach(({ prefixedKey }) => {
    const val: any = getValue(rootObject, prefixedKey);
    if (typeof val === 'object' && !_.isNil(val) && !Array.isArray(val)) {
      paths = paths.concat(
        getObjectPaths(val, rootObject, prefixedKey, true, withoutLeaves),
      );
    }
  });

  return paths;
}

export default getObjectPaths;
