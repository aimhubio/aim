import _ from 'lodash-es';

function getObjectPaths(
  obj: { [key: string]: unknown },
  rootObject: { [key: string]: unknown },
  prefix: string = '',
  includeRoot: boolean = false,
): string[] {
  if (obj === null) {
    return [];
  }
  let rootKeys = Object.keys(obj).map((key) => {
    return { prefixedKey: prefix ? `${prefix}.${key}` : key, key };
  });
  let paths: string[] = includeRoot
    ? rootKeys.reduce((acc: string[], { prefixedKey }) => {
        const val: any = _.get(rootObject, prefixedKey);
        if (typeof val !== 'object') {
          acc.push(prefixedKey);
        }
        return acc;
      }, [])
    : Object.keys(obj)
        .filter((key) => !_.isObject(obj[key]))
        .map((key) => {
          return key;
        });
  rootKeys.forEach(({ prefixedKey }) => {
    const val: any = _.get(rootObject, prefixedKey);
    if (typeof val === 'object' && !_.isNil(val) && !Array.isArray(val)) {
      paths = paths.concat(getObjectPaths(val, rootObject, prefixedKey, true));
    }
  });

  return paths;
}

export default getObjectPaths;
