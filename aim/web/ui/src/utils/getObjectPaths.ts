import _ from 'lodash-es';

import { getValue } from 'utils/helper';

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
    return { prefixedKey: prefix ? `${prefix}.${key}` : key, key };
  });
  let paths: string[] = includeRoot
    ? rootKeys.reduce((acc: string[], { prefixedKey, key }) => {
        const val: any = getValue(rootObject, prefixedKey);
        if (typeof val !== 'object' || _.isNil(val) || _.isArray(val)) {
          if (withoutLeaves) {
            acc.push(prefixedKey.slice(0, prefixedKey.indexOf(`.${key}`)));
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
